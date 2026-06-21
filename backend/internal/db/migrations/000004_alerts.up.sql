CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'urgent');
CREATE TYPE alert_status   AS ENUM ('active', 'acknowledged', 'resolved', 'suppressed');

CREATE TABLE alerts (
    id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    horse_id        UUID           NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
    reading_id      UUID,
    severity        alert_severity NOT NULL,
    status          alert_status   NOT NULL DEFAULT 'active',
    metric          TEXT           NOT NULL,
    observed_value  NUMERIC(10,4),
    baseline_value  NUMERIC(10,4),
    deviation_pct   NUMERIC(6,2),
    message         TEXT           NOT NULL,
    recommendation  TEXT,
    acknowledged_by UUID           REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_horse_id ON alerts(horse_id, created_at DESC);
CREATE INDEX idx_alerts_status   ON alerts(status) WHERE status = 'active';
CREATE INDEX idx_alerts_severity ON alerts(severity, created_at DESC);
