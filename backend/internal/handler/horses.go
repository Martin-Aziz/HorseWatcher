package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/carrot-watch/backend/internal/auth"
	"github.com/carrot-watch/backend/internal/service"
	sqlcgen "github.com/carrot-watch/backend/internal/sqlc/generated"
	"github.com/carrot-watch/backend/pkg/apierr"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// HorseHandler exposes horse CRUD endpoints.
type HorseHandler struct {
	horseSvc *service.HorseService
}

// NewHorseHandler constructs a HorseHandler.
func NewHorseHandler(horseSvc *service.HorseService) *HorseHandler {
	return &HorseHandler{horseSvc: horseSvc}
}

// List handles GET /api/v1/horses.
func (h *HorseHandler) List(w http.ResponseWriter, r *http.Request) {
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

	horses, err := h.horseSvc.ListForUser(r.Context(), userID)
	if err != nil {
		apierr.InternalServer(w)
		return
	}

	writeJSON(w, http.StatusOK, horses)
}

type createHorseRequest struct {
	Name         string  `json:"name"`
	Breed        *string `json:"breed"`
	DateOfBirth  *string `json:"date_of_birth"` // ISO 8601 date: "2019-04-15"
	Sex          *string `json:"sex"`
	Color        *string `json:"color"`
	WeightKg     *float64 `json:"weight_kg"`
	StableID     *string `json:"stable_id"`
	MicrochipID  *string `json:"microchip_id"`
	Notes        *string `json:"notes"`
}

// Create handles POST /api/v1/horses.
func (h *HorseHandler) Create(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	if claims == nil {
		apierr.Unauthorized(w)
		return
	}

	var req createHorseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apierr.BadRequest(w, "invalid request body")
		return
	}

	if req.Name == "" {
		apierr.BadRequest(w, "name is required")
		return
	}

	userID, err := parseUUID(claims.UserID)
	if err != nil {
		apierr.InternalServer(w)
		return
	}

	params := sqlcgen.CreateHorseParams{
		Name:    req.Name,
		OwnerID: userID,
	}

	if req.Breed != nil {
		params.Breed = req.Breed
	}
	if req.Sex != nil {
		params.Sex = req.Sex
	}
	if req.Color != nil {
		params.Color = req.Color
	}
	if req.Notes != nil {
		params.Notes = req.Notes
	}
	if req.MicrochipID != nil {
		params.MicrochipID = req.MicrochipID
	}
	if req.StableID != nil {
		sid, err := parseUUID(*req.StableID)
		if err != nil {
			apierr.BadRequest(w, "invalid stable_id")
			return
		}
		params.StableID = &sid
	}
	if req.DateOfBirth != nil {
		t, err := time.Parse("2006-01-02", *req.DateOfBirth)
		if err != nil {
			apierr.BadRequest(w, "date_of_birth must be YYYY-MM-DD")
			return
		}
		params.DateOfBirth = &pgtype.Date{Time: t, Valid: true}
	}

	horse, err := h.horseSvc.Create(r.Context(), params)
	if err != nil {
		apierr.InternalServer(w)
		return
	}

	writeJSON(w, http.StatusCreated, horse)
}

// Get handles GET /api/v1/horses/{id}.
func (h *HorseHandler) Get(w http.ResponseWriter, r *http.Request) {
	horseID, userID, ok := horseAndUserIDs(w, r)
	if !ok {
		return
	}

	horse, err := h.horseSvc.GetForUser(r.Context(), horseID, userID)
	if err != nil {
		if errors.Is(err, service.ErrHorseNotFound) {
			apierr.NotFound(w, "horse")
			return
		}
		apierr.InternalServer(w)
		return
	}

	writeJSON(w, http.StatusOK, horse)
}

// Delete handles DELETE /api/v1/horses/{id}.
func (h *HorseHandler) Delete(w http.ResponseWriter, r *http.Request) {
	horseID, userID, ok := horseAndUserIDs(w, r)
	if !ok {
		return
	}

	if err := h.horseSvc.Delete(r.Context(), horseID, userID); err != nil {
		apierr.InternalServer(w)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type grantAccessRequest struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
}

// GrantAccess handles POST /api/v1/horses/{id}/access.
func (h *HorseHandler) GrantAccess(w http.ResponseWriter, r *http.Request) {
	horseID, ownerID, ok := horseAndUserIDs(w, r)
	if !ok {
		return
	}

	var req grantAccessRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apierr.BadRequest(w, "invalid request body")
		return
	}

	targetID, err := parseUUID(req.UserID)
	if err != nil {
		apierr.BadRequest(w, "invalid user_id")
		return
	}

	if err := h.horseSvc.GrantAccess(r.Context(), horseID, ownerID, targetID, req.Role); err != nil {
		if errors.Is(err, service.ErrUnauthorized) {
			apierr.Forbidden(w)
			return
		}
		if errors.Is(err, service.ErrHorseNotFound) {
			apierr.NotFound(w, "horse")
			return
		}
		apierr.InternalServer(w)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// RevokeAccess handles DELETE /api/v1/horses/{id}/access/{uid}.
func (h *HorseHandler) RevokeAccess(w http.ResponseWriter, r *http.Request) {
	horseID, ownerID, ok := horseAndUserIDs(w, r)
	if !ok {
		return
	}

	targetID, err := parseUUID(chi.URLParam(r, "uid"))
	if err != nil {
		apierr.BadRequest(w, "invalid uid")
		return
	}

	if err := h.horseSvc.RevokeAccess(r.Context(), horseID, ownerID, targetID); err != nil {
		if errors.Is(err, service.ErrUnauthorized) {
			apierr.Forbidden(w)
			return
		}
		apierr.InternalServer(w)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// horseAndUserIDs is a helper that extracts and parses the horse ID from the URL
// and the authenticated user ID from the context.
func horseAndUserIDs(w http.ResponseWriter, r *http.Request) (uuid.UUID, uuid.UUID, bool) {
	claims := auth.ClaimsFromContext(r.Context())
	if claims == nil {
		apierr.Unauthorized(w)
		return uuid.UUID{}, uuid.UUID{}, false
	}

	horseID, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		apierr.BadRequest(w, "invalid horse id")
		return uuid.UUID{}, uuid.UUID{}, false
	}

	userID, err := parseUUID(claims.UserID)
	if err != nil {
		apierr.InternalServer(w)
		return uuid.UUID{}, uuid.UUID{}, false
	}

	return horseID, userID, true
}
