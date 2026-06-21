# Phase 8 — Technical Blueprint

> **Question this phase answers:** What is the smallest engineering surface that supports the 6 bets in Phase 7? What is the cycle time from observation to ship? What dependencies could kill us if their pricing changes?

**Format:** Mission-type orders (Auftragstaktik) — objective + intent + constraints, not step-by-step recipe. The implementation method is left to whoever builds. This is intentional.

---

## 8.1 Architecture sketch (minimum viable)

```
┌──────────────────────────────────────────────────────────────────┐
│ Customer's horse wears OEM sensor (Equimetre / Hoofstep / TBD)   │
│                              │                                    │
│                              │ Vendor's data API or BLE bridge    │
│                              ▼                                    │
│                    ┌──────────────────┐                          │
│                    │ Ingest service   │  ← simple, deferred      │
│                    │ (Go or Node)     │     until ≥10 customers   │
│                    └────────┬─────────┘                          │
│                             ▼                                     │
│                    ┌──────────────────┐                          │
│                    │ Postgres         │  ← single source of truth │
│                    │ (one table per   │                          │
│                    │  metric type)    │                          │
│                    └────────┬─────────┘                          │
│                             ▼                                     │
│            ┌────────────────┴────────────────┐                  │
│            ▼                                  ▼                   │
│  ┌──────────────────┐              ┌────────────────────┐       │
│  │ Baseline + alert │              │ Next.js front-end  │       │
│  │ engine (Python   │              │ (current demo,     │       │
│  │ scheduled job)   │              │ wired to API)      │       │
│  └────────┬─────────┘              └──────────┬─────────┘       │
│           ▼                                    ▼                 │
│  ┌──────────────────┐              ┌────────────────────┐       │
│  │ Alert delivery   │              │ Vet PDF generator  │       │
│  │ (email + SMS via │              │ (server-side PDF   │       │
│  │ Resend + Twilio) │              │ from template)     │       │
│  └──────────────────┘              └────────────────────┘       │
└──────────────────────────────────────────────────────────────────┘
```

**Key decisions:**
- **No proprietary sensor hardware.** OEM only. (Per AVOID-1 + Variant B.)
- **No mobile app yet** — the Next.js PWA works on iPhone Safari well enough for the first 100 customers. Saves 3-6 months of native development.
- **No real-time websockets in production yet** — the demo's SSE pattern is correct architecturally, but for paying customers a 30-60 second poll is fine. Defer real-time push until customer feedback demands it.
- **Postgres only** — no Redis, no separate ML store, no queue infrastructure. The baseline job runs nightly via cron. Anomaly scoring runs on ingest with a 2-second SLA. Both fit comfortably in a single PG instance for the first 200 customers.

---

## 8.2 Data model (minimum schema)

The full schema in `backend/internal/db/migrations/` is fine but **over-engineered** for the first 50 customers. Minimum schema for Variant B:

| Table | Columns (essentials) | Notes |
|-------|----------------------|-------|
| `customers` | id, email, name, vet_referral_source, signup_date | Built into the auth layer or external (Clerk/Supabase) |
| `horses` | id, customer_id, name, breed, dob, sensor_serial, calibration_completed_at | Single owner for now — defer multi-owner to NICE-2 |
| `readings` | horse_id, recorded_at, metric_type, value | **Partition by month, not quarter.** 50 customers × 4 metrics × 8640/day = ~1.7M rows/month — fits trivially in PG |
| `baselines` | horse_id, metric_type, computed_at, mean, std, lower, upper | Recomputed nightly |
| `alerts` | horse_id, fired_at, severity, metric, reading_id, status, dismissed_reason | Includes the P3.3 "snooze with reason" capture |
| `summaries` | horse_id, summary_date, content_text, generated_by (founder/auto), opened_at | The morning summary log |
| `notes` | horse_id, taken_at, content, photo_url, vitals_snapshot | Email-in + in-app — see Intervention P4.1 |

**Fields flagged as scope risk (future-proofing without current need):**
- `horse_access` table → defer until Cohort B (yards) becomes a customer
- `horse_baselines.window_days` → start hardcoded at 10; make configurable later
- ML model serialisation → not needed; baseline math is rolling-window arithmetic

---

## 8.3 API surface (what's built, what's deliberately not)

### Built for MVP

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/readings` | Sensor ingest (called by sensor vendor's webhook or our BLE bridge) |
| `GET /api/v1/horses/:id/latest` | Front-end polling |
| `GET /api/v1/horses/:id/history` | Time-series window |
| `GET /api/v1/horses/:id/baselines` | Current baseline state |
| `GET /api/v1/horses/:id/alerts` | Alert list |
| `PATCH /api/v1/alerts/:id/dismiss` | Capture dismissal reason |
| `GET /api/v1/horses/:id/export.pdf` | Vet-shareable PDF (MUST-5) |
| `POST /api/v1/ai/chat` | AI assistant (NICE) |

### Deliberately NOT built (until evidence forces it)

| Endpoint | Why deferred |
|----------|--------------|
| `POST /api/v1/auth/register` | Use external auth (Clerk/Supabase) — auth is not a differentiator |
| `GET /api/v1/stables` | No yards yet; defer |
| Webhook outbound to vet practice EHRs | Premature partnership |
| `POST /api/v1/horses/:id/share` | Public read-only PDF link is simpler |
| SSE / WebSocket streams | Poll is fine until customer asks for live |

---

## 8.4 Third-party dependencies (with kill plans)

| Dependency | Cost (latency / money / lock-in) | Kill plan if it fails or pricing 3x |
|------------|----------------------------------|-------------------------------------|
| **Sensor vendor (Equimetre / Hoofstep / other)** | Latency: minutes between reading and API; money: ~€20-50/month/horse wholesale `[ASSUMED]`; lock-in: high (each vendor has proprietary mount + API) | **Highest dependency risk.** Maintain working contracts with 2 vendors before paying customer count >20. If primary vendor changes terms, switch entirely — pain is one-time customer hardware swap. |
| **Postgres (hosted: Supabase / Neon / Fly)** | Money: ~€25-100/mo at this scale; lock-in: low (standard SQL) | Migrate to another PG host in <1 week. |
| **Email delivery (Resend)** | Money: ~€20/mo at this scale; lock-in: low | Swap to Postmark or SendGrid. |
| **SMS delivery (Twilio)** | Money: ~€0.05/SMS × ~10 urgent/month per customer × 50 = ~€25/mo; lock-in: medium | Swap to MessageBird or Vonage. |
| **Anthropic API (for AI)** | Money: ~€0.01-0.05 per chat; lock-in: low | Swap to OpenAI or local model. AI is NICE not MUST. |
| **Claude Code CLI (current demo)** | Free for demo. For production, replace with direct Anthropic API. | Direct API. |
| **Hosting (Vercel for front-end, Fly/Railway for back-end)** | Money: ~€20-50/mo; lock-in: low | Self-host on Hetzner if cost balloons. |

**Total cloud spend at 50 customers: ~€100-200/month.** Sensor wholesale cost is the dominant unit-economic factor — and is *not yet validated* against retail vendor pricing.

---

## 8.5 Cycle time analysis (Boyd's OODA at architecture level)

For each component, how fast can we go observation → ship → re-observation?

| Component | Observe | Orient | Decide | Act (ship) | Re-observe | Total |
|-----------|---------|--------|--------|------------|------------|-------|
| Front-end copy / UX | <1 hr | <1 hr | <1 day | <1 day | <2 days | **<5 days** ✅ |
| Alert threshold tuning | <1 hr | <1 day (need data) | <1 day | <1 day | <7 days (need real events) | **~10 days** ⚠️ |
| Email content / cadence | <1 day | <1 day | <1 day | <1 day | <7 days (response rates) | **~10 days** ✅ |
| Baseline algorithm | <1 day (per-customer data) | <2 days | <1 day | <1 week | <30 days (long enough to retrain + observe alert quality) | **~6 weeks** ❌ |
| Sensor accuracy issues | <1 week (waiting for noise data) | <2 weeks | <1 day | **Cannot ship — vendor's problem** | **N/A** | **uncontrollable** ❌ |

**Critical insight:** The team's OODA advantage at the UX and copy layer is strong. The OODA disadvantage at the sensor accuracy layer is **structural and unrecoverable** unless the team builds its own hardware (which is rejected for other reasons).

**Implication:** The product strategy must **route around the sensor layer**. The team cannot promise "we will improve sensor accuracy" — that's the vendor's problem. The team can promise "we will improve how we interpret sensor data" (baseline tuning, multi-gate thresholds) and "we will own the user experience" (alerts, summaries, vet integration). The value proposition must be framed accordingly.

---

## 8.6 Mission-type order for the build team

### Mission 1 — Baseline + alert engine
- **Objective:** Within 12 weeks, customers' false-positive alert rate must be <25%, measured on real sensor data.
- **Intent:** Without this, P3 (alert noise) kills retention. This is the most-load-bearing engineering work.
- **Constraints:**
  - Personalised baseline only — no global thresholds.
  - Multi-gate urgent threshold (≥0.85 score, ≥10min persistence, no return-to-band).
  - Every alert capture-able with dismissal reason.
- **Method:** Left to engineer. Python scheduled job is fine. Real-time scoring on ingest is fine. Pick whichever ships fastest with adequate quality.

### Mission 2 — Vet PDF export
- **Objective:** Within 6 weeks, ship a PDF export that 3 validated vets rate as "useful" (5/7 Likert) in interviews.
- **Intent:** Without this, Bet 4 + Bet 6 fail — and with them, the vet referral channel.
- **Constraints:**
  - Must work with no Carrot Watch account from the vet's side (link-based).
  - Must include time series, alert log, and customer notes.
  - Format validated by 3 vets BEFORE engineering work begins.
- **Method:** Server-side PDF generation (Puppeteer / wkhtmltopdf / Playwright). Whichever the team is fastest with.

### Mission 3 — Morning summary delivery
- **Objective:** Within 4 weeks, ship the email channel + template system supporting the morning summary (Bet 3).
- **Intent:** Define the product. This is *the* product moment.
- **Constraints:**
  - Initially fed by founder hand-written summaries — automation is later.
  - Must support inline charts / status indicators.
  - Must be openable on phone email clients without rendering issues.
- **Method:** Use Resend templates or React Email. Test on Gmail iOS + Apple Mail + Outlook web before shipping.

### Mission 4 — Sensor ingest pipeline
- **Objective:** Within 8 weeks, support 2 sensor vendors in production.
- **Intent:** Eliminate single-vendor lock-in risk.
- **Constraints:**
  - Vendor-agnostic internal format (normalize at ingest).
  - Handle missing data gracefully — sensor disconnects are routine.
  - Idempotent ingest (vendors sometimes replay).
- **Method:** Webhook receiver pattern. No queues yet. Direct DB write with idempotency key.

---

## 8.7 Gate 4 — Kill metric completeness check

Every component in Section 8.6 traces to a Phase 7 bet with 30/60/90-day kill metrics:

| Mission | Phase 7 bet | Kill metrics defined? |
|---------|-------------|------------------------|
| Mission 1 (baseline + alerts) | Bets 1 + 2 | ✅ Yes |
| Mission 2 (vet PDF) | Bets 4 + 6 | ✅ Yes |
| Mission 3 (morning summary) | Bet 3 | ✅ Yes |
| Mission 4 (sensor ingest) | All bets depend on data | ⚠️ No direct kill metric — but obvious systemic failure mode (no data = no product) |

**For Mission 4, add a systemic kill metric:** *If sensor data completeness falls below 90% (more than 10% of expected readings missing) across the customer base for 14 consecutive days, the sensor vendor relationship is broken — switch primary vendor.*

PASS.

---

## Phase 8 conclusion — what this phase implies for Phase 9

1. **The engineering surface is small.** 4 missions, 4 services, ~3-month build for a small team.

2. **The architecture stays simple** because complexity is itself a bet against a more-validated future. Postgres is the only data store. No Redis. No queues. No microservices.

3. **Sensor vendor dependency is the single largest technical risk.** Mission 4 explicitly addresses multi-vendor support to mitigate.

4. **The current Next.js demo is approximately 60% of the front-end work.** Re-using it is the right move — but the mock data layer must be cleanly swapped for real APIs, and the live ticker must become a real polling layer.

5. **No engineering work begins until Phase 9's quality gates pass** — particularly the anti-sycophancy gate, because if the artifact is generic, building on it produces a generic product.
