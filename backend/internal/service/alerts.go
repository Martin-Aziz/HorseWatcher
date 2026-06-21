package service

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/carrot-watch/backend/internal/cache"
	"github.com/carrot-watch/backend/internal/ml"
	sqlcgen "github.com/carrot-watch/backend/internal/sqlc/generated"
	"github.com/carrot-watch/backend/internal/sse"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// ErrAlertNotFound is returned when an alert is not in the expected state for an operation
// (e.g. acknowledging an already-resolved alert) or does not exist.
var ErrAlertNotFound = errors.New("alert not found or not in valid state")

// alertDedupTTL is how long the dedup key blocks identical alerts. Keep this in sync
// with the suppressed-alert window in alerts.sql (15 minutes).
const alertDedupTTL = 15 * time.Minute

// AlertService creates and manages health alerts.
type AlertService struct {
	q      *sqlcgen.Queries
	cache  *cache.Client
	broker *sse.Broker
}

// NewAlertService constructs an AlertService.
func NewAlertService(q *sqlcgen.Queries, cache *cache.Client, broker *sse.Broker) *AlertService {
	return &AlertService{q: q, cache: cache, broker: broker}
}

// maybeCreateAlert creates an alert if no identical alert was recently created (dedup via Redis).
func (s *AlertService) maybeCreateAlert(
	ctx context.Context,
	horseID uuid.UUID,
	readingID uuid.UUID,
	result ml.AnomalyScoreResult,
	reading IngestInput,
) {
	// Determine the primary contributing metric for message construction.
	metric := "overall"
	if len(result.ContributingMetrics) > 0 {
		metric = result.ContributingMetrics[0]
	}

	// Dedup: use Redis NX with a 15-minute TTL per horse+metric pair.
	dedupKey := fmt.Sprintf("alert_dedup:%s:%s", horseID, metric)
	acquired, err := s.cache.SetNX(ctx, dedupKey, "1", alertDedupTTL)
	if err != nil {
		slog.Warn("alert dedup check failed, proceeding without dedup", "horse_id", horseID, "metric", metric, "error", err)
		acquired = true
	}
	if !acquired {
		return
	}

	severity := "warning"
	if result.AnomalyScore >= 0.85 {
		severity = "urgent"
	}

	message, recommendation := buildAlertText(metric, result.AnomalyScore, reading)

	var pgReadingID pgtype.UUID
	if err := pgReadingID.Scan(readingID.String()); err != nil {
		// Should never happen with a valid uuid.UUID, but log if it does so we don't
		// silently create alerts with NULL reading_id when we have a valid reading.
		slog.Warn("scan reading_id for alert failed", "reading_id", readingID, "error", err)
	} else {
		pgReadingID.Valid = true
	}

	var pgScore pgtype.Numeric
	if err := pgScore.Scan(fmt.Sprintf("%.4f", result.AnomalyScore)); err != nil {
		slog.Warn("scan anomaly_score for alert failed", "score", result.AnomalyScore, "error", err)
	}

	alert, err := s.q.CreateAlert(ctx, sqlcgen.CreateAlertParams{
		HorseID:    horseID,
		ReadingID:  pgReadingID,
		Severity:   severity,
		Metric:     metric,
		Message:    message,
		Recommendation: &recommendation,
	})
	if err != nil {
		slog.Error("create alert", "horse_id", horseID, "error", err)
		return
	}

	// Broadcast new alert to SSE subscribers.
	s.broker.PublishHorse(horseID.String(), sse.Event{
		Type: "alert",
		Data: alert,
	})

	slog.Info("alert created", "horse_id", horseID, "severity", severity, "metric", metric, "score", result.AnomalyScore)
}

// AcknowledgeAlert marks an alert as acknowledged by the given user.
// Returns ErrAlertNotFound when the alert does not exist or is no longer in 'active' state.
func (s *AlertService) AcknowledgeAlert(ctx context.Context, alertID, userID uuid.UUID) (sqlcgen.Alert, error) {
	alert, err := s.q.AcknowledgeAlert(ctx, sqlcgen.AcknowledgeAlertParams{
		ID:             alertID,
		AcknowledgedBy: &userID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return sqlcgen.Alert{}, ErrAlertNotFound
		}
		return sqlcgen.Alert{}, fmt.Errorf("acknowledge alert: %w", err)
	}
	return alert, nil
}

// ResolveAlert marks an alert as resolved.
// Returns ErrAlertNotFound when the alert does not exist or is already resolved.
func (s *AlertService) ResolveAlert(ctx context.Context, alertID uuid.UUID) (sqlcgen.Alert, error) {
	alert, err := s.q.ResolveAlert(ctx, alertID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return sqlcgen.Alert{}, ErrAlertNotFound
		}
		return sqlcgen.Alert{}, fmt.Errorf("resolve alert: %w", err)
	}
	return alert, nil
}

// ListForUser returns paginated alerts for all horses the user can access.
func (s *AlertService) ListForUser(ctx context.Context, userID uuid.UUID, status, severity string, limit, offset int32) ([]sqlcgen.Alert, error) {
	return s.q.ListAlertsByUser(ctx, sqlcgen.ListAlertsByUserParams{
		UserID:   userID,
		Status:   status,
		Severity: severity,
		Limit:    limit,
		Offset:   offset,
	})
}

// ListByHorse returns active alerts for a specific horse.
func (s *AlertService) ListByHorse(ctx context.Context, horseID uuid.UUID) ([]sqlcgen.Alert, error) {
	return s.q.ListActiveAlertsByHorse(ctx, horseID)
}

func buildAlertText(metric string, score float64, reading IngestInput) (message, recommendation string) {
	switch metric {
	case "heart_rate_bpm":
		if reading.HeartRateBPM != nil {
			message = fmt.Sprintf("Heart rate of %d bpm is significantly outside the normal baseline range.", *reading.HeartRateBPM)
		} else {
			message = "Heart rate pattern is significantly outside the normal baseline range."
		}
		recommendation = "Monitor closely. If elevated, check for pain, fever, or respiratory distress. Consider contacting your vet if this persists for more than 30 minutes."
	case "hrv_ms":
		message = "Heart rate variability has dropped significantly below baseline, indicating physiological stress."
		recommendation = "Reduced HRV can indicate pain, anxiety, or systemic illness. Consider reducing workload and consulting your vet."
	case "skin_temp_c":
		if reading.SkinTempC != nil {
			message = fmt.Sprintf("Skin temperature of %.1f°C is significantly outside the normal baseline range.", *reading.SkinTempC)
		} else {
			message = "Skin temperature is significantly outside the normal baseline range."
		}
		recommendation = "Temperature deviation may indicate fever, inflammation, or circulatory issues. Check for signs of fever and contact your vet if temperature is elevated for more than 1 hour."
	case "activity_index":
		message = "Activity pattern has deviated significantly from the normal baseline."
		recommendation = "Unusual activity patterns may indicate colic, lameness, or behavioral change. Observe the horse directly and contact your vet if activity remains abnormal."
	default:
		message = fmt.Sprintf("Multiple health metrics (anomaly score: %.0f%%) have deviated significantly from normal baseline.", score*100)
		recommendation = "Several vital signs are outside normal ranges simultaneously. This warrants direct observation and potential veterinary consultation."
	}
	return
}
