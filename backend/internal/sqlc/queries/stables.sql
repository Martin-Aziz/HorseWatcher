-- name: CreateStable :one
INSERT INTO stables (name, address, owner_id)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetStableByID :one
SELECT * FROM stables WHERE id = $1 LIMIT 1;

-- name: ListStablesByOwner :many
SELECT * FROM stables WHERE owner_id = $1 ORDER BY name;

-- name: UpdateStable :one
UPDATE stables SET name = $2, address = $3, updated_at = NOW()
WHERE id = $1 AND owner_id = $4
RETURNING *;

-- name: DeleteStable :exec
DELETE FROM stables WHERE id = $1 AND owner_id = $2;
