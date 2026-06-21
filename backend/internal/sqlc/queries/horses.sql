-- name: CreateHorse :one
INSERT INTO horses (name, breed, date_of_birth, sex, color, weight_kg, avatar_url, stable_id, owner_id, microchip_id, notes)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING *;

-- name: GetHorseByID :one
SELECT h.* FROM horses h
WHERE h.id = $1 LIMIT 1;

-- name: GetHorseWithAccess :one
-- Returns a horse only if the requesting user is owner or has an access grant.
SELECT h.* FROM horses h
LEFT JOIN horse_access ha ON ha.horse_id = h.id AND ha.user_id = $2
WHERE h.id = $1
  AND (h.owner_id = $2 OR ha.user_id IS NOT NULL)
LIMIT 1;

-- name: ListHorsesByUser :many
-- Returns all horses visible to a user (owned + granted access).
SELECT DISTINCT h.* FROM horses h
LEFT JOIN horse_access ha ON ha.horse_id = h.id AND ha.user_id = $1
WHERE h.owner_id = $1 OR ha.user_id IS NOT NULL
ORDER BY h.name;

-- name: ListHorsesByStable :many
SELECT h.* FROM horses h
WHERE h.stable_id = $1
ORDER BY h.name;

-- name: UpdateHorse :one
UPDATE horses
SET name = $2, breed = $3, date_of_birth = $4, sex = $5, color = $6,
    weight_kg = $7, avatar_url = $8, stable_id = $9, microchip_id = $10,
    notes = $11, updated_at = NOW()
WHERE id = $1 AND owner_id = $12
RETURNING *;

-- name: DeleteHorse :exec
DELETE FROM horses WHERE id = $1 AND owner_id = $2;

-- name: GrantHorseAccess :exec
INSERT INTO horse_access (horse_id, user_id, role)
VALUES ($1, $2, $3)
ON CONFLICT (horse_id, user_id) DO UPDATE SET role = EXCLUDED.role;

-- name: RevokeHorseAccess :exec
DELETE FROM horse_access WHERE horse_id = $1 AND user_id = $2;

-- name: ListHorseAccessGrants :many
SELECT ha.*, u.full_name, u.email FROM horse_access ha
JOIN users u ON u.id = ha.user_id
WHERE ha.horse_id = $1;
