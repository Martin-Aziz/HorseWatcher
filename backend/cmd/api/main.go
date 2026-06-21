package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/carrot-watch/backend/internal/auth"
	"github.com/carrot-watch/backend/internal/cache"
	"github.com/carrot-watch/backend/internal/config"
	"github.com/carrot-watch/backend/internal/db"
	"github.com/carrot-watch/backend/internal/handler"
	"github.com/carrot-watch/backend/internal/ml"
	"github.com/carrot-watch/backend/internal/router"
	"github.com/carrot-watch/backend/internal/service"
	"github.com/carrot-watch/backend/internal/sse"
	sqlcgen "github.com/carrot-watch/backend/internal/sqlc/generated"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
	migrateOnly := flag.Bool("migrate-only", false, "run migrations and exit")
	migrateDown := flag.Bool("migrate-down", false, "roll back one migration and exit")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		slog.Error("load config", "error", err)
		os.Exit(1)
	}

	setupLogger(cfg.LogLevel)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Run migrations.
	if err := runMigrations(cfg.DatabaseURL, *migrateDown); err != nil {
		slog.Error("migrations failed", "error", err)
		os.Exit(1)
	}
	if *migrateOnly || *migrateDown {
		slog.Info("migrations complete, exiting")
		return
	}

	// Connect to dependencies.
	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("connect to database", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	redisClient, err := cache.Connect(ctx, cfg.RedisURL)
	if err != nil {
		slog.Error("connect to redis", "error", err)
		os.Exit(1)
	}
	defer redisClient.Close()

	// Wire dependencies.
	queries := sqlcgen.New(pool)
	jwtSvc := auth.NewService(cfg.JWTSecret, cfg.JWTAccessTTL, cfg.JWTRefreshTTL)
	mlClient := ml.NewClient(cfg.MLServiceURL)
	broker := sse.NewBroker()

	authSvc := service.NewAuthService(queries, jwtSvc, cfg.JWTRefreshTTL)
	horseSvc := service.NewHorseService(queries)
	alertSvc := service.NewAlertService(queries, redisClient, broker)
	readingSvc := service.NewReadingService(queries, mlClient, broker, alertSvc)

	deps := router.Dependencies{
		AuthHandler:     handler.NewAuthHandler(authSvc),
		HorseHandler:    handler.NewHorseHandler(horseSvc),
		ReadingsHandler: handler.NewReadingsHandler(readingSvc, horseSvc),
		AlertsHandler:   handler.NewAlertsHandler(alertSvc, horseSvc),
		AIHandler:       handler.NewAIHandler(mlClient, queries),
		StreamHandler:   handler.NewStreamHandler(broker, horseSvc),
		HealthHandler:   handler.NewHealthHandler(pool, redisClient, mlClient),
		JWTService:      jwtSvc,
	}

	srv := &http.Server{
		Addr:         cfg.Address(),
		Handler:      router.New(deps),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 0, // SSE connections are long-lived; let the handler control lifetime.
		IdleTimeout:  60 * time.Second,
	}

	// Start server in background.
	go func() {
		slog.Info("server starting", "address", cfg.Address(), "env", cfg.Env)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	// Wait for shutdown signal.
	<-ctx.Done()
	slog.Info("shutdown signal received")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("graceful shutdown failed", "error", err)
	}
	slog.Info("server stopped")
}

func runMigrations(databaseURL string, down bool) error {
	m, err := migrate.New("file:///app/internal/db/migrations", databaseURL)
	if err != nil {
		// Try relative path for local development.
		m, err = migrate.New("file://internal/db/migrations", databaseURL)
		if err != nil {
			return fmt.Errorf("create migrator: %w", err)
		}
	}
	defer m.Close()

	if down {
		if err := m.Steps(-1); err != nil && !errors.Is(err, migrate.ErrNoChange) {
			return fmt.Errorf("migrate down: %w", err)
		}
		return nil
	}

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("migrate up: %w", err)
	}
	return nil
}

func setupLogger(level string) {
	var lvl slog.Level
	switch level {
	case "debug":
		lvl = slog.LevelDebug
	case "warn":
		lvl = slog.LevelWarn
	case "error":
		lvl = slog.LevelError
	default:
		lvl = slog.LevelInfo
	}
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: lvl})))
}
