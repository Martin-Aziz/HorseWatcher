package handler

import (
	"net/http"

	"github.com/carrot-watch/backend/internal/cache"
	"github.com/carrot-watch/backend/internal/ml"
	"github.com/carrot-watch/backend/pkg/apierr"
	"github.com/jackc/pgx/v5/pgxpool"
)

// HealthHandler responds to liveness and readiness probes.
type HealthHandler struct {
	db       *pgxpool.Pool
	cache    *cache.Client
	mlClient *ml.Client
}

// NewHealthHandler constructs a HealthHandler.
func NewHealthHandler(db *pgxpool.Pool, cache *cache.Client, mlClient *ml.Client) *HealthHandler {
	return &HealthHandler{db: db, cache: cache, mlClient: mlClient}
}

// Check handles GET /healthz.
func (h *HealthHandler) Check(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	dbErr := h.db.Ping(ctx)
	cacheErr := h.cache.Ping(ctx)
	mlErr := h.mlClient.Ping(ctx)

	if dbErr != nil || cacheErr != nil {
		apierr.Write(w, http.StatusServiceUnavailable, "unhealthy", "dependency check failed")
		return
	}

	status := "ok"
	if mlErr != nil {
		status = "degraded"
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"status":   status,
		"database": boolStatus(dbErr == nil),
		"cache":    boolStatus(cacheErr == nil),
		"ml":       boolStatus(mlErr == nil),
	})
}

func boolStatus(ok bool) string {
	if ok {
		return "ok"
	}
	return "error"
}
