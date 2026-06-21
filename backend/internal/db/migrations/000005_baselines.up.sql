CREATE TABLE horse_baselines (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    horse_id     UUID        NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
    metric       TEXT        NOT NULL,
    window_days  SMALLINT    NOT NULL DEFAULT 30,

    mean         NUMERIC(10,4) NOT NULL,
    std_dev      NUMERIC(10,4) NOT NULL,
    p5           NUMERIC(10,4),
    p25          NUMERIC(10,4),
    p50          NUMERIC(10,4),
    p75          NUMERIC(10,4),
    p95          NUMERIC(10,4),
    lower_bound  NUMERIC(10,4),
    upper_bound  NUMERIC(10,4),

    sample_count INTEGER     NOT NULL,
    computed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_from   TIMESTAMPTZ NOT NULL,
    valid_until  TIMESTAMPTZ,

    UNIQUE (horse_id, metric, valid_from)
);

CREATE INDEX idx_baselines_horse_metric ON horse_baselines(horse_id, metric, computed_at DESC);
