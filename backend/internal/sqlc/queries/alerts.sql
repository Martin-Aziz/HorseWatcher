-- name: CreateAlert :one
INSERT INTO alerts (
    horse_id, reading_id, severity, metric,
    observed_value, baseline_value, deviation_pct, message, recommendation
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: GetAlertByID :one
SELECT * FROM alerts WHERE id = $1 LIMIT 1;

-- name: ListActiveAlertsByHorse :many
SELECT * FROM alerts
WHERE horse_id = $1 AND status = 'active'
ORDER BY created_at DESC;

-- name: ListAlertsByUser :many
-- Returns alerts for all horses the user can access.
SELECT DISTINCT a.* FROM alerts a
JOIN horses h ON h.id = a.horse_id
LEFT JOIN horse_access ha ON ha.horse_id = h.id AND ha.user_id = $1
WHERE (h.owner_id = $1 OR ha.user_id IS NOT NULL)
  AND ($2::text = '' OR a.status = $2)
  AND ($3::text = '' OR a.severity = $3)
ORDER BY a.created_at DESC
LIMIT $4 OFFSET $5;

-- name: AcknowledgeAlert :one
UPDATE alerts
SET status = 'acknowledged', acknowledged_by = $2, acknowledged_at = NOW()
WHERE id = $1 AND status = 'active'
RETURNING *;

-- name: ResolveAlert :one
UPDATE alerts
SET status = 'resolved', resolved_at = NOW()
WHERE id = $1 AND status IN ('active', 'acknowledged')
RETURNING *;

-- name: CountActiveAlertsByHorse :one
SELECT COUNT(*) FROM alerts WHERE horse_id = $1 AND status = 'active';

-- name: SuppressRecentAlert :exec
-- Suppresses an identical alert within the dedup window to prevent storms.
UPDATE alerts SET status = 'suppressed'
WHERE horse_id = $1 AND metric = $2 AND status = 'active'
  AND created_at > NOW() - INTERVAL '15 minutes'
  AND id != $3;
