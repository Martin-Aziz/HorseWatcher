-- name: InsertReading :one
INSERT INTO sensor_readings (
    horse_id, device_id, recorded_at,
    heart_rate_bpm, hrv_ms, skin_temp_c, rectal_temp_c, respiratory_rate,
    activity_index, steps_count, lying_minutes, standing_minutes
) VALUES (
    $1, $2, $3,
    $4, $5, $6, $7, $8,
    $9, $10, $11, $12
) RETURNING id, recorded_at;

-- name: UpdateReadingAnomalyScore :exec
UPDATE sensor_readings
SET anomaly_score = $3, is_anomalous = $4
WHERE id = $1 AND recorded_at = $2;

-- name: GetLatestReading :one
SELECT * FROM sensor_readings
WHERE horse_id = $1
ORDER BY recorded_at DESC
LIMIT 1;

-- name: ListReadings :many
SELECT * FROM sensor_readings
WHERE horse_id = $1
  AND recorded_at >= $2
  AND recorded_at <= $3
ORDER BY recorded_at DESC
LIMIT $4 OFFSET $5;

-- name: CountReadings :one
SELECT COUNT(*) FROM sensor_readings
WHERE horse_id = $1
  AND recorded_at >= $2
  AND recorded_at <= $3;
