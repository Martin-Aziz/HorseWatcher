package router

import (
	"net/http"

	"github.com/carrot-watch/backend/internal/auth"
	"github.com/carrot-watch/backend/internal/handler"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

// Dependencies bundles all handlers needed to wire the router.
type Dependencies struct {
	AuthHandler     *handler.AuthHandler
	HorseHandler    *handler.HorseHandler
	ReadingsHandler *handler.ReadingsHandler
	AlertsHandler   *handler.AlertsHandler
	AIHandler       *handler.AIHandler
	StreamHandler   *handler.StreamHandler
	HealthHandler   *handler.HealthHandler
	JWTService      *auth.Service
}

// New builds and returns the Chi router with all routes registered.
func New(deps Dependencies) http.Handler {
	r := chi.NewRouter()

	// Global middleware.
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.CleanPath)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "https://*.carrotwatch.app"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check (unauthenticated).
	r.Get("/healthz", deps.HealthHandler.Check)

	r.Route("/api/v1", func(r chi.Router) {
		// Auth routes (public).
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", deps.AuthHandler.Register)
			r.Post("/login", deps.AuthHandler.Login)
			r.Post("/refresh", deps.AuthHandler.Refresh)
			r.Post("/logout", deps.AuthHandler.Logout)
			r.With(auth.Middleware(deps.JWTService)).Get("/me", deps.AuthHandler.Me)
		})

		// Protected routes.
		r.Group(func(r chi.Router) {
			r.Use(auth.Middleware(deps.JWTService))

			// Horse management.
			r.Route("/horses", func(r chi.Router) {
				r.With(auth.RequirePermission(auth.PermViewHorse)).Get("/", deps.HorseHandler.List)
				r.With(auth.RequirePermission(auth.PermEditHorse)).Post("/", deps.HorseHandler.Create)
				r.With(auth.RequirePermission(auth.PermViewHorse)).Get("/{id}", deps.HorseHandler.Get)
				r.With(auth.RequirePermission(auth.PermDeleteHorse)).Delete("/{id}", deps.HorseHandler.Delete)
				r.With(auth.RequirePermission(auth.PermGrantAccess)).Post("/{id}/access", deps.HorseHandler.GrantAccess)
				r.With(auth.RequirePermission(auth.PermGrantAccess)).Delete("/{id}/access/{uid}", deps.HorseHandler.RevokeAccess)
			})

			// Sensor readings.
			r.Route("/readings", func(r chi.Router) {
				r.With(auth.RequirePermission(auth.PermViewReadings)).Post("/", deps.ReadingsHandler.Ingest)
				r.With(auth.RequirePermission(auth.PermViewReadings)).Get("/{horse_id}", deps.ReadingsHandler.History)
				r.With(auth.RequirePermission(auth.PermViewReadings)).Get("/{horse_id}/latest", deps.ReadingsHandler.LatestByHorse)
			})

			// Alerts.
			r.Route("/alerts", func(r chi.Router) {
				r.With(auth.RequirePermission(auth.PermViewAlerts)).Get("/", deps.AlertsHandler.List)
				r.With(auth.RequirePermission(auth.PermViewAlerts)).Get("/{horse_id}", deps.AlertsHandler.ListByHorse)
				r.With(auth.RequirePermission(auth.PermAcknowledgeAlerts)).Patch("/{id}/acknowledge", deps.AlertsHandler.Acknowledge)
				r.With(auth.RequirePermission(auth.PermAcknowledgeAlerts)).Patch("/{id}/resolve", deps.AlertsHandler.Resolve)
			})

			// AI assistant.
			r.With(auth.RequirePermission(auth.PermUseAIAssistant)).Post("/ai/chat", deps.AIHandler.Chat)

			// SSE live streams.
			r.Route("/stream", func(r chi.Router) {
				r.Get("/horse/{id}", deps.StreamHandler.Horse)
				r.Get("/stable/{id}", deps.StreamHandler.Stable)
			})
		})
	})

	return r
}
