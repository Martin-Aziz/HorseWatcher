package handler

import (
	"encoding/json"
	"net/http"

	"github.com/carrot-watch/backend/internal/auth"
	"github.com/carrot-watch/backend/internal/ml"
	sqlcgen "github.com/carrot-watch/backend/internal/sqlc/generated"
	"github.com/carrot-watch/backend/pkg/apierr"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// AIHandler proxies AI chat requests to the ML service with health context injection.
type AIHandler struct {
	mlClient *ml.Client
	q        *sqlcgen.Queries
	db       *pgxpool.Pool
}

// NewAIHandler constructs an AIHandler.
func NewAIHandler(mlClient *ml.Client, q *sqlcgen.Queries) *AIHandler {
	return &AIHandler{mlClient: mlClient, q: q}
}

type chatRequest struct {
	HorseID             string           `json:"horse_id"`
	Message             string           `json:"message"`
	ConversationHistory []ml.ChatMessage `json:"conversation_history"`
}

type chatResponse struct {
	Reply string `json:"reply"`
}

// Chat handles POST /api/v1/ai/chat.
func (h *AIHandler) Chat(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	if claims == nil {
		apierr.Unauthorized(w)
		return
	}

	var req chatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		apierr.BadRequest(w, "invalid request body")
		return
	}

	if req.Message == "" {
		apierr.BadRequest(w, "message is required")
		return
	}

	horseID, err := parseUUID(req.HorseID)
	if err != nil {
		apierr.BadRequest(w, "invalid horse_id")
		return
	}

	horse, err := h.q.GetHorseByID(r.Context(), horseID)
	if err != nil {
		apierr.NotFound(w, "horse")
		return
	}

	// Build health context from current state.
	ctx := h.buildContext(r, horseID, claims)

	mlReq := ml.ChatRequest{
		HorseID:             req.HorseID,
		HorseName:           horse.Name,
		Message:             req.Message,
		ConversationHistory: req.ConversationHistory,
		Context:             ctx,
	}

	resp, err := h.mlClient.Chat(r.Context(), mlReq)
	if err != nil {
		apierr.InternalServer(w)
		return
	}

	writeJSON(w, http.StatusOK, chatResponse{Reply: resp.Reply})
}

func (h *AIHandler) buildContext(r *http.Request, horseID uuid.UUID, _ *auth.Claims) ml.HorseHealthContext {
	ctx := r.Context()
	var hctx ml.HorseHealthContext

	// Latest reading.
	reading, err := h.q.GetLatestReading(ctx, horseID)
	if err == nil {
		if reading.HeartRateBpm != nil && reading.HeartRateBpm.Valid {
			v := int(reading.HeartRateBpm.Int16)
			hctx.LatestHeartRateBPM = &v
		}
		if reading.SkinTempC != nil && reading.SkinTempC.Valid {
			f, _ := reading.SkinTempC.Float64Value()
			hctx.LatestTempC = &f.Float64
		}
		if reading.HrvMs != nil && reading.HrvMs.Valid {
			f, _ := reading.HrvMs.Float64Value()
			hctx.LatestHrvMs = &f.Float64
		}
		if reading.ActivityIndex != nil && reading.ActivityIndex.Valid {
			f, _ := reading.ActivityIndex.Float64Value()
			hctx.LatestActivityIndex = &f.Float64
		}
	}

	// Active alert count.
	count, err := h.q.CountActiveAlertsByHorse(ctx, horseID)
	if err == nil {
		hctx.ActiveAlertCount = int(count)
	}

	return hctx
}
