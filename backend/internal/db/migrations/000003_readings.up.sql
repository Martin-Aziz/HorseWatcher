-- Quarterly-partitioned time-series table for raw sensor readings.
-- Each partition covers one calendar quarter, enabling fast pruning by dropping old partitions.
CREATE TABLE sensor_readings (
    id               UUID        NOT NULL DEFAULT gen_random_uuid(),
    horse_id         UUID        NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
    device_id        TEXT        NOT NULL,
    recorded_at      TIMESTAMPTZ NOT NULL,
    received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    heart_rate_bpm   SMALLINT,
    hrv_ms           NUMERIC(7,2),
    skin_temp_c      NUMERIC(5,2),
    rectal_temp_c    NUMERIC(5,2),
    respiratory_rate SMALLINT,

    activity_index   NUMERIC(6,3),
    steps_count      INTEGER,
    lying_minutes    SMALLINT,
    standing_minutes SMALLINT,

    -- Populated asynchronously by the ML service after ingest
    anomaly_score    NUMERIC(5,4),
    is_anomalous     BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

CREATE TABLE sensor_readings_2025_q1 PARTITION OF sensor_readings FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE sensor_readings_2025_q2 PARTITION OF sensor_readings FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE sensor_readings_2025_q3 PARTITION OF sensor_readings FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE sensor_readings_2025_q4 PARTITION OF sensor_readings FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE sensor_readings_2026_q1 PARTITION OF sensor_readings FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
CREATE TABLE sensor_readings_2026_q2 PARTITION OF sensor_readings FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');
CREATE TABLE sensor_readings_2026_q3 PARTITION OF sensor_readings FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');
CREATE TABLE sensor_readings_2026_q4 PARTITION OF sensor_readings FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');

CREATE INDEX idx_readings_horse_time ON sensor_readings(horse_id, recorded_at DESC);
CREATE INDEX idx_readings_anomalous  ON sensor_readings(horse_id, is_anomalous) WHERE is_anomalous = TRUE;
