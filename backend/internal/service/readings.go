package service

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/carrot-watch/backend/internal/ml"
	sqlcgen "github.com/carrot-watch/backend/internal/sqlc/generated"
	"github.com/carrot-watch/backend/internal/sse"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// ErrNoReadings is returned when a horse has no readings recorded yet.
var ErrNoReadings = errors.New("no readings available")

// ReadingService manages sensor reading ingestion and triggers anomaly scoring.
type ReadingService struct {
	q        *sqlcgen.Queries
	mlClient *ml.Client
	broker   *sse.Broker
	alertSvc *AlertService
}

// NewReadingService constructs a ReadingService.
func NewReadingService(q *sqlcgen.Queries, mlClient *ml.Client, broker *sse.Broker, alertSvc *AlertService) *ReadingService {
	return &ReadingService{q: q, mlClient: mlClient, broker: broker, alertSvc: alertSvc}
}

// GetLatest returns the most recent reading for a horse.
// Returns ErrNoReadings when the horse has no readings recorded yet — callers
// should treat this as a 204 No Content, not a 500 error.
func (s *ReadingService) GetLatest(ctx context.Context, horseID uuid.UUID) (sqlcgen.SensorReading, error) {
	reading, err := s.q.GetLatestReading(ctx, horseID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return sqlcgen.SensorReading{}, ErrNoReadings
		}
		return sqlcgen.SensorReading{}, fmt.Errorf("get latest reading: %w", err)
	}
	return reading, nil
}

// ListInRange returns all readings for a horse between from and to, sorted newest first.
// Returns an empty slice (not nil) when no readings exist in the range so handlers
// can safely return [] without null-checks.
func (s *ReadingService) ListInRange(ctx context.Context, horseID uuid.UUID, from, to time.Time) ([]sqlcgen.SensorReading, error) {
	var pgFrom, pgTo pgtype.Timestamptz
	if err := pgFrom.Scan(from); err != nil {
		return nil, fmt.Errorf("scan from timestamp: %w", err)
	}
	if err := pgTo.Scan(to); err != nil {
		return nil, fmt.Errorf("scan to timestamp: %w", err)
	}

	readings, err := s.q.ListReadings(ctx, sqlcgen.ListReadingsParams{
		HorseID: horseID,
		From:    pgFrom,
		To:      pgTo,
		Limit:   5000, // hard cap; UI uses time-based pagination so this is plenty
		Offset:  0,
	})
	if err != nil {
		return nil, fmt.Errorf("list readings: %w", err)
	}

	if readings == nil {
		readings = []sqlcgen.SensorReading{}
	}
	return readings, nil
}

// IngestInput is a single reading from the device or simulator.
type IngestInput struct {
	RecordedAt      time.Time
	HeartRateBPM    *int16
	HrvMs           *float64
	SkinTempC       *float64
	RectalTempC     *float64
	RespiratoryRate *int16
	ActivityIndex   *float64
	StepsCount      *int32
	LyingMinutes    *int16
	StandingMinutes *int16
}

// Ingest stores a batch of readings and asynchronously triggers ML scoring.
func (s *ReadingService) Ingest(ctx context.Context, horseID uuid.UUID, deviceID string, inputs []IngestInput) error {
	var insertedIDs []struct {
		ID         uuid.UUID
		RecordedAt time.Time
	}

	for _, in := range inputs {
		params, err := buildInsertParams(horseID, deviceID, in)
		if err != nil {
			return fmt.Errorf("build reading params: %w", err)
		}
		row, err := s.q.InsertReading(ctx, params)
		if err != nil {
			return fmt.Errorf("insert reading: %w", err)
		}
		insertedIDs = append(insertedIDs, struct {
			ID         uuid.UUID
			RecordedAt time.Time
		}{ID: row.ID, RecordedAt: row.RecordedAt.Time})

		// Broadcast latest reading to SSE subscribers.
		s.broker.PublishHorse(horseID.String(), sse.Event{
			Type: "reading",
			Data: map[string]any{
				"horse_id":       horseID.String(),
				"heart_rate_bpm": in.HeartRateBPM,
				"hrv_ms":         in.HrvMs,
				"skin_temp_c":    in.SkinTempC,
				"activity_index": in.ActivityIndex,
				"recorded_at":    in.RecordedAt.Format(time.RFC3339),
			},
		})
	}

	// Score asynchronously so the ingest endpoint returns immediately.
	go s.scoreAsync(horseID, deviceID, inputs, insertedIDs)

	return nil
}

func (s *ReadingService) scoreAsync(
	horseID uuid.UUID,
	_ string,
	inputs []IngestInput,
	insertedIDs []struct {
		ID         uuid.UUID
		RecordedAt time.Time
	},
) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Build ML request.
	mlReadings := make([]ml.ReadingInput, len(inputs))
	for i, in := range inputs {
		rid := insertedIDs[i]
		r := ml.ReadingInput{
			ID:         rid.ID.String(),
			RecordedAt: rid.RecordedAt.Format(time.RFC3339),
		}
		if in.HeartRateBPM != nil {
			v := int(*in.HeartRateBPM)
			r.HeartRateBPM = &v
		}
		if in.HrvMs != nil {
			r.HrvMs = in.HrvMs
		}
		if in.SkinTempC != nil {
			r.SkinTempC = in.SkinTempC
		}
		if in.ActivityIndex != nil {
			r.ActivityIndex = in.ActivityIndex
		}
		mlReadings[i] = r
	}

	// Fetch current baselines to provide context to the ML service.
	baselines, err := s.q.ListCurrentBaselines(ctx, horseID)
	if err != nil {
		slog.Error("fetch baselines for scoring", "horse_id", horseID, "error", err)
	}

	mlBaselines := make(map[string]ml.BaselineInput)
	for _, b := range baselines {
		mlBaselines[b.Metric] = ml.BaselineInput{
			Mean:       float64OrZero(b.Mean),
			StdDev:     float64OrZero(b.StdDev),
			LowerBound: float64OrZero(b.LowerBound),
			UpperBound: float64OrZero(b.UpperBound),
		}
	}

	results, err := s.mlClient.ScoreAnomalies(ctx, ml.AnomalyScoreRequest{
		HorseID:   horseID.String(),
		Readings:  mlReadings,
		Baselines: mlBaselines,
	})
	if err != nil {
		slog.Warn("ml scoring failed, readings stored without score", "horse_id", horseID, "error", err)
		return
	}

	// Persist scores and create alerts for anomalous readings.
	for i, result := range results {
		if i >= len(insertedIDs) {
			break
		}
		rid := insertedIDs[i]

		var pgScore pgtype.Numeric
		if err := pgScore.Scan(fmt.Sprintf("%.4f", result.AnomalyScore)); err != nil {
			slog.Warn("scan anomaly score for reading",
				"reading_id", rid.ID, "score", result.AnomalyScore, "error", err)
		} else {
			if err := s.q.UpdateReadingAnomalyScore(ctx, sqlcgen.UpdateReadingAnomalyScoreParams{
				ID:           rid.ID,
				RecordedAt:   pgtype.Timestamptz{Time: rid.RecordedAt, Valid: true},
				AnomalyScore: pgScore,
				IsAnomalous:  result.IsAnomalous,
			}); err != nil {
				slog.Warn("persist anomaly score for reading",
					"reading_id", rid.ID, "error", err)
			}
		}

		if result.IsAnomalous {
			s.alertSvc.maybeCreateAlert(ctx, horseID, rid.ID, result, inputs[i])
		}
	}
}

func buildInsertParams(horseID uuid.UUID, deviceID string, in IngestInput) (sqlcgen.InsertReadingParams, error) {
	var pgRecordedAt pgtype.Timestamptz
	if err := pgRecordedAt.Scan(in.RecordedAt); err != nil {
		return sqlcgen.InsertReadingParams{}, fmt.Errorf("scan recorded_at: %w", err)
	}

	p := sqlcgen.InsertReadingParams{
		HorseID:    horseID,
		DeviceID:   deviceID,
		RecordedAt: pgRecordedAt,
	}

	if in.HeartRateBPM != nil {
		p.HeartRateBpm = &pgtype.Int2{Int16: *in.HeartRateBPM, Valid: true}
	}
	if in.HrvMs != nil {
		p.HrvMs = numericFromFloat(*in.HrvMs)
	}
	if in.SkinTempC != nil {
		p.SkinTempC = numericFromFloat(*in.SkinTempC)
	}
	if in.RectalTempC != nil {
		p.RectalTempC = numericFromFloat(*in.RectalTempC)
	}
	if in.RespiratoryRate != nil {
		p.RespiratoryRate = &pgtype.Int2{Int16: *in.RespiratoryRate, Valid: true}
	}
	if in.ActivityIndex != nil {
		p.ActivityIndex = numericFromFloat(*in.ActivityIndex)
	}
	if in.StepsCount != nil {
		p.StepsCount = &pgtype.Int4{Int32: *in.StepsCount, Valid: true}
	}
	if in.LyingMinutes != nil {
		p.LyingMinutes = &pgtype.Int2{Int16: *in.LyingMinutes, Valid: true}
	}
	if in.StandingMinutes != nil {
		p.StandingMinutes = &pgtype.Int2{Int16: *in.StandingMinutes, Valid: true}
	}

	return p, nil
}

func numericFromFloat(f float64) *pgtype.Numeric {
	var n pgtype.Numeric
	if err := n.Scan(fmt.Sprintf("%f", f)); err != nil {
		return nil
	}
	return &n
}

func float64OrZero(n *pgtype.Numeric) float64 {
	if n == nil || !n.Valid {
		return 0
	}
	f, _ := n.Float64Value()
	return f.Float64
}
