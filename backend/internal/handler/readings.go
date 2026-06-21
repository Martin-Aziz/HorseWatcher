package handler

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/carrot-watch/backend/internal/auth"
	"github.com/carrot-watch/backend/internal/service"
	sqlcgen "github.com/carrot-watch/backend/internal/sqlc/generated"
	"github.com/carrot-watch/backend/pkg/apierr"
	"github.com/go-chi/chi/v5"
)

// ReadingsHandler exposes sensor reading ingest and query endpoints.
type ReadingsHandler struct {
	readingSvc *service.ReadingService
	horseSvc   *service.HorseService
}

// NewReadingsHandler constructs a ReadingsHandler.
func NewReadingsHandler(readingSvc *service.ReadingService, horseSvc *service.HorseService) *ReadingsHandler {
	return &ReadingsHandler{readingSvc: readingSvc, horseSvc: horseSvc}
}

type ingestReadingInput struct {
	RecordedAt      string   `json:"recorded_at"`
	HeartRateBPM    *int16   `json:"heart_rate_bpm"`
	HrvMs           *float64 `json:"hrv_ms"`
	SkinTempC       *float64 `json:"skin_temp_c"`
	RectalTempC     *float64 `json:"rectal_temp_c"`
	RespiratoryRate *int16   `json:"respiratory_rate"`
	ActivityIndex   *float64 `json:"activity_index"`
	StepsCount      *int32   `json:"steps_count"`
	LyingMinutes    *int16   `json:"lying_minutes"`
	StandingMinutes *int16   `json:"standing_minutes"`
}

type ingestRequest struct {
	HorseID  string               `json:"horse_id"`
	DeviceID string               `json:"device_id"`
	Readings []ingestReadingInput `json:"readings"`
}

const maxReadingsPerBatch = 500

// Ingest handles POST /api/v1/readings.
//
// Enforces that the authenticated user has access to the target horse before
// accepting any readings. Without this check, any authenticated user could
// inject readings for any horse — a serious data integrity hole.
func (h *ReadingsHandler) Ingest(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	if claims == nil {
		apierr.Unauthorized(w)
		return
	}

	var req ingestRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apierr.BadRequest(w, "request body is not valid JSON")
		return
	}

	if req.HorseID == "" {
		apierr.BadRequest(w, "horse_id is required")
		return
	}
	if req.DeviceID == "" {
		apierr.BadRequest(w, "device_id is required")
		return
	}
	if len(req.Readings) == 0 {
		apierr.BadRequest(w, "at least one reading is required")
		return
	}
	if len(req.Readings) > maxReadingsPerBatch {
		apierr.BadRequest(w, "maximum 500 readings per batch")
		return
	}

	horseID, err := parseUUID(req.HorseID)
	if err != nil {
		apierr.BadRequest(w, "invalid horse_id")
		return
	}

	userID, err := parseUUID(claims.UserID)
	if err != nil {
		apierr.InternalServer(w)
		return
	}

	// Verify the user has access to this horse before accepting any readings.
	if _, err := h.horseSvc.GetForUser(r.Context(), horseID, userID); err != nil {
		if errors.Is(err, service.ErrHorseNotFound) {
			// Return 404 (not 403) to avoid revealing horse existence to non-owners.
			apierr.NotFound(w, "horse")
			return
		}
		apierr.InternalServer(w)
		return
	}

	inputs := make([]service.IngestInput, 0, len(req.Readings))
	for i, rd := range req.Readings {
		t, err := time.Parse(time.RFC3339, rd.RecordedAt)
		if err != nil {
			apierr.UnprocessableEntity(w, "recorded_at must be RFC3339 format at index "+itoa(i))
			return
		}
		// Reject readings dated more than 24h in the future to prevent clock-skew abuse.
		if t.After(time.Now().Add(24 * time.Hour)) {
			apierr.UnprocessableEntity(w, "recorded_at cannot be more than 24h in the future")
			return
		}
		inputs = append(inputs, service.IngestInput{
			RecordedAt:      t,
			HeartRateBPM:    rd.HeartRateBPM,
			HrvMs:           rd.HrvMs,
			SkinTempC:       rd.SkinTempC,
			RectalTempC:     rd.RectalTempC,
			RespiratoryRate: rd.RespiratoryRate,
			ActivityIndex:   rd.ActivityIndex,
			StepsCount:      rd.StepsCount,
			LyingMinutes:    rd.LyingMinutes,
			StandingMinutes: rd.StandingMinutes,
		})
	}

	if err := h.readingSvc.Ingest(r.Context(), horseID, req.DeviceID, inputs); err != nil {
		slog.Error("ingest readings failed",
			"horse_id", horseID,
			"device_id", req.DeviceID,
			"count", len(inputs),
			"error", err,
		)
		apierr.InternalServer(w)
		return
	}

	writeJSON(w, http.StatusAccepted, map[string]any{
		"accepted":  len(inputs),
		"horse_id":  req.HorseID,
		"device_id": req.DeviceID,
	})
}

// LatestByHorse handles GET /api/v1/readings/{horse_id}/latest.
func (h *ReadingsHandler) LatestByHorse(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	if claims == nil {
		apierr.Unauthorized(w)
		return
	}

	horseID, err := parseUUID(chi.URLParam(r, "horse_id"))
	if err != nil {
		apierr.BadRequest(w, "invalid horse_id")
		return
	}

	userID, err := parseUUID(claims.UserID)
	if err != nil {
		apierr.InternalServer(w)
		return
	}

	// Verify access before returning any reading data.
	if _, err := h.horseSvc.GetForUser(r.Context(), horseID, userID); err != nil {
		if errors.Is(err, service.ErrHorseNotFound) {
			apierr.NotFound(w, "horse")
			return
		}
		apierr.InternalServer(w)
		return
	}

	reading, err := h.readingSvc.GetLatest(r.Context(), horseID)
	if err != nil {
		// No readings yet — return 204 (No Content), not 500.
		if errors.Is(err, service.ErrNoReadings) {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		slog.Error("get latest reading failed", "horse_id", horseID, "error", err)
		apierr.InternalServer(w)
		return
	}

	writeJSON(w, http.StatusOK, reading)
}

// History handles GET /api/v1/readings/{horse_id} — time-series window query.
func (h *ReadingsHandler) History(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	if claims == nil {
		apierr.Unauthorized(w)
		return
	}

	horseID, err := parseUUID(chi.URLParam(r, "horse_id"))
	if err != nil {
		apierr.BadRequest(w, "invalid horse_id")
		return
	}

	userID, err := parseUUID(claims.UserID)
	if err != nil {
		apierr.InternalServer(w)
		return
	}

	if _, err := h.horseSvc.GetForUser(r.Context(), horseID, userID); err != nil {
		if errors.Is(err, service.ErrHorseNotFound) {
			apierr.NotFound(w, "horse")
			return
		}
		apierr.InternalServer(w)
		return
	}

	fromStr := r.URL.Query().Get("from")
	toStr := r.URL.Query().Get("to")

	to := time.Now()
	from := to.Add(-24 * time.Hour)

	if fromStr != "" {
		t, err := time.Parse(time.RFC3339, fromStr)
		if err != nil {
			apierr.BadRequest(w, "from must be RFC3339 format")
			return
		}
		from = t
	}
	if toStr != "" {
		t, err := time.Parse(time.RFC3339, toStr)
		if err != nil {
			apierr.BadRequest(w, "to must be RFC3339 format")
			return
		}
		to = t
	}

	if from.After(to) {
		apierr.BadRequest(w, "from must be before to")
		return
	}
	if to.Sub(from) > 90*24*time.Hour {
		apierr.BadRequest(w, "time range cannot exceed 90 days")
		return
	}

	readings, err := h.readingSvc.ListInRange(r.Context(), horseID, from, to)
	if err != nil {
		slog.Error("list readings failed", "horse_id", horseID, "error", err)
		apierr.InternalServer(w)
		return
	}

	writeJSON(w, http.StatusOK, readings)
}

// itoa converts a non-negative int to a string without importing strconv at the call site.
func itoa(i int) string {
	if i == 0 {
		return "0"
	}
	var digits []byte
	for i > 0 {
		digits = append([]byte{byte('0' + i%10)}, digits...)
		i /= 10
	}
	return string(digits)
}

// AlertsHandler exposes alert listing and state-transition endpoints.
type AlertsHandler struct {
	alertSvc *service.AlertService
	horseSvc *service.HorseService
}

// NewAlertsHandler constructs an AlertsHandler.
func NewAlertsHandler(alertSvc *service.AlertService, horseSvc *service.HorseService) *AlertsHandler {
	return &AlertsHandler{alertSvc: alertSvc, horseSvc: horseSvc}
}

// List handles GET /api/v1/alerts.
func (h *AlertsHandler) List(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	if claims == nil {
		apierr.Unauthorized(w)
		return
	}

	userID, err := parseUUID(claims.UserID)
	if err != nil {
		apierr.InternalServer(w)
		return
	}

	status := r.URL.Query().Get("status")
	severity := r.URL.Query().Get("severity")

	// Validate enum values to prevent garbage queries reaching the DB.
	if status != "" && !isValidAlertStatus(status) {
		apierr.BadRequest(w, "status must be one of: active, acknowledged, resolved, suppressed")
		return
	}
	if severity != "" && !isValidAlertSeverity(severity) {
		apierr.BadRequest(w, "severity must be one of: info, warning, urgent")
		return
	}

	alerts, err := h.alertSvc.ListForUser(r.Context(), userID, status, severity, 50, 0)
	if err != nil {
		slog.Error("list alerts failed", "user_id", userID, "error", err)
		apierr.InternalServer(w)
		return
	}

	if alerts == nil {
		alerts = []sqlcgen.Alert{}
	}
	writeJSON(w, http.StatusOK, alerts)
}

// ListByHorse handles GET /api/v1/alerts/{horse_id}.
func (h *AlertsHandler) ListByHorse(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	if claims == nil {
		apierr.Unauthorized(w)
		return
	}

	horseID, err := parseUUID(chi.URLParam(r, "horse_id"))
	if err != nil {
		apierr.BadRequest(w, "invalid horse_id")
		return
	}

	userID, err := parseUUID(claims.UserID)
	if err != nil {
		apierr.InternalServer(w)
		return
	}

	if _, err := h.horseSvc.GetForUser(r.Context(), horseID, userID); err != nil {
		if errors.Is(err, service.ErrHorseNotFound) {
			apierr.NotFound(w, "horse")
			return
		}
		apierr.InternalServer(w)
		return
	}

	alerts, err := h.alertSvc.ListByHorse(r.Context(), horseID)
	if err != nil {
		slog.Error("list horse alerts failed", "horse_id", horseID, "error", err)
		apierr.InternalServer(w)
		return
	}

	if alerts == nil {
		alerts = []sqlcgen.Alert{}
	}
	writeJSON(w, http.StatusOK, alerts)
}

// Acknowledge handles PATCH /api/v1/alerts/{id}/acknowledge.
func (h *AlertsHandler) Acknowledge(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	if claims == nil {
		apierr.Unauthorized(w)
		return
	}

	alertID, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		apierr.BadRequest(w, "invalid alert id")
		return
	}

	userID, err := parseUUID(claims.UserID)
	if err != nil {
		apierr.InternalServer(w)
		return
	}

	alert, err := h.alertSvc.AcknowledgeAlert(r.Context(), alertID, userID)
	if err != nil {
		if errors.Is(err, service.ErrAlertNotFound) {
			apierr.NotFound(w, "alert")
			return
		}
		slog.Error("acknowledge alert failed", "alert_id", alertID, "user_id", userID, "error", err)
		apierr.InternalServer(w)
		return
	}

	writeJSON(w, http.StatusOK, alert)
}

// Resolve handles PATCH /api/v1/alerts/{id}/resolve.
func (h *AlertsHandler) Resolve(w http.ResponseWriter, r *http.Request) {
	alertID, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		apierr.BadRequest(w, "invalid alert id")
		return
	}

	alert, err := h.alertSvc.ResolveAlert(r.Context(), alertID)
	if err != nil {
		if errors.Is(err, service.ErrAlertNotFound) {
			apierr.NotFound(w, "alert")
			return
		}
		slog.Error("resolve alert failed", "alert_id", alertID, "error", err)
		apierr.InternalServer(w)
		return
	}

	writeJSON(w, http.StatusOK, alert)
}

func isValidAlertStatus(s string) bool {
	switch s {
	case "active", "acknowledged", "resolved", "suppressed":
		return true
	}
	return false
}

func isValidAlertSeverity(s string) bool {
	switch s {
	case "info", "warning", "urgent":
		return true
	}
	return false
}
