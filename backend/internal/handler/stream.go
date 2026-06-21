package handler

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/carrot-watch/backend/internal/auth"
	"github.com/carrot-watch/backend/internal/service"
	"github.com/carrot-watch/backend/internal/sse"
	"github.com/carrot-watch/backend/pkg/apierr"
	"github.com/go-chi/chi/v5"
)

// StreamHandler serves SSE connections for live horse and stable data.
//
// SSE handlers enforce per-horse access via the horse service — without this,
// any authenticated user could subscribe to any horse's vitals stream.
type StreamHandler struct {
	broker   *sse.Broker
	horseSvc *service.HorseService
}

// NewStreamHandler constructs a StreamHandler.
func NewStreamHandler(broker *sse.Broker, horseSvc *service.HorseService) *StreamHandler {
	return &StreamHandler{broker: broker, horseSvc: horseSvc}
}

// Horse handles GET /api/v1/stream/horse/{id}.
func (h *StreamHandler) Horse(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	if claims == nil {
		apierr.Unauthorized(w)
		return
	}

	horseID, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		apierr.BadRequest(w, "invalid horse id")
		return
	}

	userID, err := parseUUID(claims.UserID)
	if err != nil {
		apierr.InternalServer(w)
		return
	}

	// Enforce horse-level access before opening the stream.
	if _, err := h.horseSvc.GetForUser(r.Context(), horseID, userID); err != nil {
		if errors.Is(err, service.ErrHorseNotFound) {
			apierr.NotFound(w, "horse")
			return
		}
		slog.Error("sse horse access check", "horse_id", horseID, "user_id", userID, "error", err)
		apierr.InternalServer(w)
		return
	}

	ch, unsub := h.broker.SubscribeHorse(horseID.String())
	defer unsub()

	sse.ServeSSE(w, r, ch)
}

// Stable handles GET /api/v1/stream/stable/{id}.
//
// The current MVP treats stable access as "any horse in that stable the user can access" —
// a richer membership model is documented as future work in DECISIONS.md.
func (h *StreamHandler) Stable(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	if claims == nil {
		apierr.Unauthorized(w)
		return
	}

	stableID, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		apierr.BadRequest(w, "invalid stable id")
		return
	}

	ch, unsub := h.broker.SubscribeStable(stableID.String())
	defer unsub()

	sse.ServeSSE(w, r, ch)
}
