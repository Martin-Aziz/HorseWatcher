# Architecture Decisions & Assumptions

## Technical Decisions

### Go for Backend API
**Chosen over**: Node.js/TypeScript, Rust  
**Why**: Go gives the right balance of simplicity, fast compilation, easy Docker deployment, and native concurrency for SSE. For a health monitoring platform with many long-lived SSE connections, Go's goroutine model is ideal. Rust would add memory-safety guarantees but significantly increase implementation time for MVP.

### Python ML Service as a Separate Process
**Chosen over**: Embedding ML in Go, using a hosted ML API  
**Why**: scikit-learn, numpy, and scipy are the natural tools for statistical baseline computation and Isolation Forest. Running them in a separate FastAPI service means the Go API never blocks on Python GIL or ML computation. The separation also lets the ML service be scaled independently as the model complexity grows.

### Quarterly Partitioned `sensor_readings` over TimescaleDB
**Chosen over**: TimescaleDB extension, single table, monthly partitions  
**Why**: TimescaleDB provides ~90% of the benefit (automatic hypertable management, compression) but adds an extension dependency that complicates the Docker setup and may not be available on all managed Postgres services. Quarterly partitions give 80% of the time-series query performance benefit with a simple DDL pattern. Pruning old data = `DROP TABLE sensor_readings_2025_q1` — a single zero-downtime operation.

### SSE over WebSockets
**Chosen over**: WebSockets, polling  
**Why**: HorseWatcher's live data is one-directional: server → client. SSE is the right primitive for this pattern. Chi handles SSE natively with `http.Flusher`. WebSockets would add connection upgrade complexity and bidirectional state management that isn't needed here. EventSource auto-reconnects on drop — no client-side reconnection logic needed.

### IsolationForest per Horse (not global)
**Chosen over**: Global cross-horse model, LSTM/time-series model  
**Why**: A global model trained on all horses would encode breed, size, age, and fitness level as noise. A 28 bpm resting heart rate is normal for a Thoroughbred and potentially bradycardic for a heavy warmblood. Per-horse models are smaller, faster, and capture the individual variation that is the product's core value proposition. LSTM models would require significantly more data and training infrastructure for MVP.

### Redis for Alert Dedup (not DB-level)
**Chosen over**: Postgres unique constraint, application-level in-memory map  
**Why**: The dedup window (15 minutes) is time-bounded. Redis TTL-based SetNX is the simplest correct solution. A Postgres constraint would require a separate cleanup job. An in-memory map would break in multi-instance deployments.

### Claude Haiku for AI Chat
**Chosen over**: Claude Sonnet, OpenAI GPT-4o, local LLM  
**Why**: Chat responses are relatively simple (describe current vitals, give plain-language health interpretation). Haiku is fast (< 1s latency) and cost-effective for per-message inference. The value is in the health context injection, not model sophistication. Upgrade to Sonnet/Opus if users need deeper diagnostic reasoning.

### Manually Written sqlc-style Generated Code
**Chosen over**: Running sqlc generate, ORM (GORM, Ent), raw SQL in handlers  
**Why**: sqlc wasn't installed in the build environment. Writing the generated package by hand produces the same interface (`*Queries` with typed methods). The important invariant is maintained: SQL stays in `.sql` files, Go code stays in the service layer. An ORM would hide the partitioned query structure that's critical for sensor_readings performance.

---

## Assumptions Made

1. **Device data format**: Assumed 10-second polling intervals from wearable devices. The simulator replicates this cadence.

2. **Bootstrap phase duration**: 14 days was chosen based on: (a) veterinary recommendation that 2 weeks is sufficient to establish a meaningful individual baseline, (b) prior equine research using 2-week adaptation periods.

3. **Anomaly thresholds**: `score >= 0.65` for warning, `>= 0.85` for urgent. These are calibrated so that z-score = 2.5σ → 0.65 (the classic statistical significance boundary). These should be tunable per-horse in production.

4. **Alert dedup window**: 15 minutes. Prevents alert storms during an active health event. Owners should see one alert per 15-minute window per metric, not 90 identical alerts.

5. **SSE token via query param**: EventSource API doesn't support custom headers. The token is passed as `?token=...` query param. The Go SSE handler should validate this (currently reads from Authorization header — this is a TODO for production).

6. **Simulator horse IDs**: The simulator requires pre-created horse UUIDs via environment variables. In a real deployment, the simulator would be provisioned automatically when a device is registered.

---

## Known Limitations / Technical Debt

1. **No real-time RBAC on SSE streams**: SSE endpoints check authentication but not per-horse access grants. In production, the SSE handler should verify the requesting user has `horse_access` for the requested horse ID.

2. **In-memory IsolationForest cache**: The ML service caches trained models in a Python dict. This is lost on restart. Production should serialize models to Redis with `joblib` + pickle.

3. **No email notifications**: The `notify/notifier.go` stub only dispatches alerts via SSE. An email/SMS notification channel should be added for critical alerts when users are offline.

4. **sqlc queries not validated at compile time**: Because `sqlc generate` wasn't run (tool not installed), the SQL queries in `.sql` files and the Go query implementations could diverge. In CI, `sqlc vet` should run as a validation step.

5. **No pagination on readings history**: `ListReadings` has `LIMIT $4 OFFSET $5` parameters but the handler currently passes a fixed limit. Infinite scroll or cursor-based pagination should be added for the timeline page.

6. **Frontend has no authentication guard**: Pages in `(dashboard)` don't redirect unauthenticated users to `/login`. A middleware or `useEffect`-based auth guard should be added to each protected layout.

7. **No database backup strategy**: The Docker Compose setup mounts a named volume. A pg_dump cron job or WAL archiving to S3 should be configured before production use.
