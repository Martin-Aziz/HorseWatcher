-- name: UpsertBaseline :one
INSERT INTO horse_baselines (
    horse_id, metric, window_days, mean, std_dev,
    p5, p25, p50, p75, p95,
    lower_bound, upper_bound, sample_count, valid_from
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
ON CONFLICT (horse_id, metric, valid_from) DO UPDATE SET
    mean = EXCLUDED.mean,
    std_dev = EXCLUDED.std_dev,
    p5 = EXCLUDED.p5, p25 = EXCLUDED.p25, p50 = EXCLUDED.p50,
    p75 = EXCLUDED.p75, p95 = EXCLUDED.p95,
    lower_bound = EXCLUDED.lower_bound,
    upper_bound = EXCLUDED.upper_bound,
    sample_count = EXCLUDED.sample_count,
    computed_at = NOW()
RETURNING *;

-- name: GetCurrentBaseline :one
SELECT * FROM horse_baselines
WHERE horse_id = $1 AND metric = $2 AND valid_until IS NULL
ORDER BY computed_at DESC
LIMIT 1;

-- name: ListCurrentBaselines :many
SELECT * FROM horse_baselines
WHERE horse_id = $1 AND valid_until IS NULL
ORDER BY metric;

-- name: GetBaselineHistory :many
SELECT * FROM horse_baselines
WHERE horse_id = $1 AND metric = $2
ORDER BY computed_at DESC
LIMIT $3;
