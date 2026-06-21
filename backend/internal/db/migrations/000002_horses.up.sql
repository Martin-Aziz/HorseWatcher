CREATE TABLE stables (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL,
    address    TEXT,
    owner_id   UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE horses (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT        NOT NULL,
    breed          TEXT,
    date_of_birth  DATE,
    sex            TEXT        CHECK (sex IN ('mare', 'stallion', 'gelding', 'filly', 'colt')),
    color          TEXT,
    weight_kg      NUMERIC(6,2),
    avatar_url     TEXT,
    stable_id      UUID        REFERENCES stables(id) ON DELETE SET NULL,
    owner_id       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    microchip_id   TEXT        UNIQUE,
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grants secondary users (vet, trainer, rider) access to a specific horse.
-- Owners always have implicit access via horses.owner_id.
CREATE TABLE horse_access (
    horse_id   UUID        NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       user_role   NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (horse_id, user_id)
);

CREATE INDEX idx_horses_owner_id      ON horses(owner_id);
CREATE INDEX idx_horses_stable_id     ON horses(stable_id);
CREATE INDEX idx_horse_access_user_id ON horse_access(user_id);
