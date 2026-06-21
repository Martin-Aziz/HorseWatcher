# Phase 4 — Requirements Translation

> **Question this phase answers:** Given the ranked, falsified patterns from Phase 3, what must we build, what would be nice, and what must we deliberately *not* build? Every requirement carries its own assumption audit and kill condition.

**System 2 override applied:** Each requirement below is preceded by an explicit listing of its load-bearing assumptions. The assumption that is high-importance + low-evidence is the load-bearing risk and is flagged.

---

## 4.1 MUST requirements (the minimum to validate the core hypothesis)

### MUST-1 — Personal baseline within first 10 days

| Field | Value |
|-------|-------|
| **Requirement (ODI form)** | Within 10 days of activation, the system must produce a per-horse personal baseline for HR, HRV, and skin temperature that statistically differs from the global equine reference range for that horse. |
| **Solves pattern** | P1 (unobserved window) — without baseline, no anomaly detection. P3 (alert noise) — without personalisation, global thresholds produce false alarms for high-resting-HR horses (Arabians) or low-resting-HR horses (drafts). |
| **Load-bearing assumption** | 10 days is sufficient to establish a baseline that beats the global reference range. |
| **Evidence level** | Medium — based on ML literature on rolling-window personalisation; **not** validated on real equine sensor data. |
| **Kill condition** | If, after 30 days of customer data, baseline-driven alerts produce ≥25% false positives in 50% of customers, the *baseline window itself* is wrong (probably needs to be longer than 10 days). Adjust to 21 days and re-test; if still failing at 60 days, the personalisation approach is wrong. |

### MUST-2 — Three-tier alert delivery (info / warning / urgent)

| Field | Value |
|-------|-------|
| **Requirement (ODI form)** | Alerts must be tiered into three severity levels with materially different delivery mechanisms: info (in-app only, no notification), warning (in-app + email), urgent (in-app + push + optional SMS). |
| **Solves pattern** | P3 (alert noise). |
| **Load-bearing assumption** | Owners will tolerate urgent push notifications if and only if they cross a high-confidence threshold. The 0.85 anomaly-score threshold from Phase 3 is correct; this is an empirically tunable number. |
| **Evidence level** | Low — based on analogous push-notification literature, not equine-specific. |
| **Kill condition** | If urgent-tier push alerts are silenced/disabled by >15% of customers within 30 days, the threshold is too aggressive — raise it. If the threshold is raised twice and still triggers silence rates >10%, the entire urgent-push channel is wrong — drop it and require app-open for all alerts. |

### MUST-3 — Glanceable status (open-when-you-want, not push-driven)

| Field | Value |
|-------|-------|
| **Requirement (ODI form)** | The default user experience must be pull-based: the user opens the app on their own schedule and sees one-glance horse status per horse. Push notifications must be reserved for urgent tier only. |
| **Solves pattern** | P6 (sustainable effort), P3 (alert noise). |
| **Load-bearing assumption** | Owners will open the app voluntarily ≥3x/week if the status is interesting/reassuring. If they don't open it, urgent push is the only contact and trust will degrade. |
| **Evidence level** | Medium — Whoop/Strava retention patterns are an analogous reference class. |
| **Kill condition** | If median app-opens-per-week drops below 3 for the cohort by day 60, the glanceable layer isn't compelling — the product is becoming background and will churn at month 3. Redesign the status surface. |

### MUST-4 — Baseline-band visualisation on every chart

| Field | Value |
|-------|-------|
| **Requirement (ODI form)** | Every time-series chart of a vital must visually show the personal baseline band (mean ± 2.5σ) such that the user can instantly see whether the current value is normal-for-this-horse without needing to read numbers. |
| **Solves pattern** | P2 (training/recovery decision), P5 (vet binary decision). |
| **Load-bearing assumption** | Visual baseline interpretation is more useful than numeric. |
| **Evidence level** | High — universally true in human medical monitoring UIs. |
| **Kill condition** | This requirement is not killable independently — it's table stakes. If a user A/B test shows the baseline band confuses non-technical owners (less likely than likely), simplify the visualisation rather than removing the band. |

### MUST-5 — Vet-shareable export of last 7/30 days

| Field | Value |
|-------|-------|
| **Requirement (ODI form)** | The user must be able to generate a PDF or shareable link of the last 7 or 30 days of vitals + alerts in a format a vet can read in <60 seconds without needing a Carrot Watch account. |
| **Solves pattern** | P4 (ad-hoc data structure), P5 (vet binary decision), and the *vet endorsement* failure mode from Phase 3. |
| **Load-bearing assumption** | Vets will accept this format and find it useful. This requires vet pre-validation. |
| **Evidence level** | None — must validate with 3 vets before building beyond a fake-door test. |
| **Kill condition** | If, in user interviews, vets rate the export as "useful" <50% of the time, the export format is wrong. Iterate. If 3 iterations don't crack 50%, the entire vet-export channel is wrong — the product cannot rely on it for credibility moat. |

---

## 4.2 NICE-to-have requirements (deferred but valuable)

### NICE-1 — AI assistant with horse-specific context
**Why nice not must:** The current demo includes this and it's impressive. But Phase 3 did not surface a pain pattern that *requires* AI to solve. The AI assistant is a *delight feature* — it deepens engagement but isn't load-bearing for the core value. Test in Phase 7 with explicit kill metric.
**Assumption:** Owners will use the AI conversationally and the answers will improve perceived value enough to justify the API cost.

### NICE-2 — Multi-horse stable dashboard
**Why nice not must:** Only relevant to Cohort B (yard managers). If we lead with Cohort B, this becomes MUST. If we lead with Cohort A or D, this is deferred.
**Assumption:** Yard managers will pay enough more than single-horse owners to justify a separate B2B sales motion.

### NICE-3 — Behavioural tagging (manual notes attached to a timestamp)
**Why nice not must:** Solves P4 (ad-hoc data) elegantly but Phase 3 ACH showed WhatsApp is a tough free competitor. Build only after switching interviews confirm owners would actually use structured notes inside an app.
**Assumption:** Owners will tag observations in-app rather than reverting to WhatsApp.

### NICE-4 — Vet referral / consultation channel inside the app
**Why nice not must:** Could be the moat — but requires partnerships, regulatory consideration, and money. Defer to Phase 2 of company building.

---

## 4.3 AVOID requirements (deliberately not built — see Rejection Log)

### AVOID-1 — Building proprietary sensor hardware
**Reasoning:** Phase 0 asymmetric advantage audit showed hardware iteration cycles kill the solo-founder advantage. Phase 7 will use rented/OEM sensors.
**Reconsider trigger:** Annual revenue >€2M with proven retention.

### AVOID-2 — General horse owner advertising / mass marketing
**Reasoning:** Phase 3 ACH (P1 hypothesis H4) showed the buyer is the recently-traumatized owner — a narrow vet-referral channel, not a mass-market funnel.
**Reconsider trigger:** Switching interviews refute H4 (>50% of buyers turn out to be non-traumatized).

### AVOID-3 — Aggressive push notification frequency
**Reasoning:** Phase 3 P3 ACH refuted H1 (users will tolerate false positives). Default = silent.
**Reconsider trigger:** Never. This is a permanent commitment.

### AVOID-4 — Free trial without onboarding call
**Reasoning:** Concierge onboarding is the asymmetric advantage. Self-serve trials trade conversion for retention. With paid users in low single-digit hundreds, conversion is not the bottleneck.
**Reconsider trigger:** >500 paid customers and onboarding cost per signup exceeds €40.

### AVOID-5 — Predicting specific diseases
**Reasoning:** Regulatory risk + accuracy floor too high. Product detects *deviations from baseline*, not "this horse has colic." Wording matters.
**Reconsider trigger:** Vet-board partnership with co-signed disease-prediction models.

---

## 4.4 Negative space — what users did NOT complain about

> Silence is signal. A pain that doesn't surface in interviews because users have given up on it being solved is often the largest opportunity.

### Negative space NS-1 — Sleep quality assessment
No scenario in Phase 2 mentioned wanting to know "did my horse sleep well last night?" — even though sleep is a known marker of equine health, and the unobserved window pattern (P1) is *literally the sleep window*. **Owners don't ask because they don't believe it's measurable.** If Carrot Watch can produce a credible sleep score (REM-analogue from movement data + lying time), it could be the most defensible single feature.

**Assumption:** A sleep score is computable from existing sensor signals.
**Cheapest test:** Wizard-of-Oz manual sleep scoring on 5 horses for 14 days, surfaced as a "we noticed you have a quiet sleeper" insight; measure click-through.

### Negative space NS-2 — Diet correlation
No scenario mentioned "I wonder if the new feed is affecting his HRV." Owners don't connect dietary change to physiological signal — but the data permits the connection. This is a **future product** with retention implications, not a launch feature.

### Negative space NS-3 — Pasture-mate behaviour
Owners describe their horse's behaviour without ever asking "is this related to a herd dynamics change?" — even though new pasture mates are known to cause subclinical stress. This is uninstrumentable from a single-horse wearable but **becomes available if we sell to yards** (Cohort B), which gives us herd-level data. Bias the strategic decision toward yards: more product surface area emerges from herd data than single-horse data.

---

## 4.5 Tradeoff disclosures (what each MUST excludes)

| MUST | What this requirement consumes (excluded by it) | Downstream dependencies |
|------|-------------------------------------------------|--------------------------|
| MUST-1 (10-day baseline) | First 10 days have no anomaly detection → can't market "instant protection" | Marketing must position day 1-10 as "calibration"; onboarding email sequence is essential |
| MUST-2 (3-tier alerts) | Engineering must build 3 delivery channels (in-app, email, push/SMS) — week 1 cost | Requires email infrastructure + SMS provider; budget €50/mo at small scale |
| MUST-3 (glanceable status) | Engineering must invest in beautiful first-screen design — week 1+ cost | Tied to MUST-4 (baseline band visualisation) |
| MUST-4 (baseline band) | Every chart now has 2x the visual complexity — slight learning curve | Requires user onboarding tooltip on first chart view |
| MUST-5 (vet export) | Vet relationship work — pre-validation with 3 vets before building | Cannot be built without 3 vet conversations first |

---

## Phase 4 conclusion — what this phase implies for Phase 5

1. **The 5 MUST requirements define the smallest surface that validates the core hypothesis.** Phase 7 will encode these as 5 bets with kill metrics.

2. **MUST-5 (vet export) requires upstream validation work** that cannot be skipped. The vet conversations are blocking work for the build.

3. **MUST-1 (10-day baseline) creates the first onboarding challenge:** the user signs up and gets no alerts for 10 days. The product narrative must reframe this as "calibration period" or activation drops.

4. **AVOID-1 (no proprietary hardware) is the highest-leverage strategic decision** in the entire artifact. This is the load-bearing choice for Variant B in `99-variants.md`.

5. **Negative space NS-1 (sleep score)** is a candidate killer feature with no evidence yet. Worth a Wizard-of-Oz experiment in the first 60 days.
