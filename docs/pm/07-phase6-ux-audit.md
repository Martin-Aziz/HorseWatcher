# Phase 6 — UX/UI Friction Audit

> **Question this phase answers:** For each numbered pain pattern from Phase 3, what is the cheapest intervention that removes it? What did we want to design that we just rejected because it doesn't trace to a pain?

**Rule:** Up to 3 interventions per pattern. Each names its parent pain, the friction removed (in seconds, clicks, or cognitive load), and the lower-fidelity alternative (Concierge MVP, Wizard of Oz, fake door).

---

## Pattern P1 — Unobserved-window vulnerability

### Intervention P1.1 — The morning "overnight summary" card
**Pain eliminated:** P1 (owner had no signal during 14h overnight window)
**Friction removed:** ~20 minutes of *anxiety load* between waking up and getting to the barn to verify the horse is fine
**Description:** When the user opens the app first thing in the morning, the top card shows a single sentence: *"Charlie slept calmly. Heart rate stayed within band. Activity normal."* Or, if not: *"Charlie's resting HR ran 8% higher than usual between 2 AM and 4 AM. Worth a look."*
**Lower-fidelity alternative:** **Concierge.** Founder personally writes the morning summary by hand for the first 20 customers and SMSes it at 6 AM. Measures: do customers respond? Do they prefer this format? At 20 customers × 5 minutes per summary = 100 minutes/day — sustainable for proof of concept, surfaces the exact language that resonates.

### Intervention P1.2 — Quiet-night badge
**Pain eliminated:** P1 + P6 (sustainable effort — wins through reassurance)
**Friction removed:** ~0 cognitive load — passive
**Description:** On any morning the overnight was uneventful, the horse card shows a small "🌙 Quiet night" badge. Owner sees it at a glance, feels reassured, doesn't open the detail.
**Lower-fidelity alternative:** Existing demo already supports this — extend the status badge logic to include "good sleep" derived from low-activity periods overnight.

### Intervention P1.3 — Configurable "wake me if" thresholds
**Rejected.** Looks helpful but actually offloads the alert-tuning problem to the user, who doesn't know what thresholds to set. Adds configuration burden without removing pain. **Added to Rejection Log.**

---

## Pattern P3 — Alert noise / signal fatigue

### Intervention P3.1 — Confidence-graded urgent alerts
**Pain eliminated:** P3
**Friction removed:** ~80% of false-positive risk if calibrated correctly
**Description:** Urgent push only fires when the anomaly score is ≥0.85 AND has persisted for ≥10 minutes AND no recent reading is back inside the band. Three gates, all required. The current demo's logic uses only the first gate.
**Lower-fidelity alternative:** Hand-tune the gates per customer for the first 50. Each Sunday, founder reviews "did each alert fire correctly?" for the past week. Calibrate.

### Intervention P3.2 — Alert receipt explainer
**Pain eliminated:** P3 (when the alert is wrong, the user needs to know *why* it fired so they can recalibrate trust)
**Friction removed:** ~30 seconds of confusion + reduced churn risk on false positives
**Description:** Every alert, when opened, shows: "We flagged this because HR was X bpm vs. typical Y bpm over Z minutes." Removes the magic. Transforms a false positive from "this product is broken" to "this product was honest about why it triggered."
**Lower-fidelity alternative:** Plain text in the alert email. No design work.

### Intervention P3.3 — Snooze with a reason
**Pain eliminated:** P3 — when user dismisses an alert, capture *why* so the system learns
**Friction removed:** ~0 for the user; high learning rate for the team
**Description:** Dismissing an alert shows three buttons: "Already aware (training session)" / "Saw the horse, fine" / "False alarm — not aware of cause". Single-tap. Logged.
**Lower-fidelity alternative:** Survey email after 7 days asking the user to retroactively classify their dismissals. Captures the data without the design work.

---

## Pattern P6 — Sustainable monitoring effort

### Intervention P6.1 — The 90-second daily ritual
**Pain eliminated:** P6 (burnout from over-monitoring)
**Friction removed:** Caps daily engagement at 90 seconds by design
**Description:** When the user opens the app, the first screen is a single-glance status. To go deeper requires an explicit tap. **The product does not surface engagement-bait** (no streaks, no "you haven't checked in 3 days" guilt notifications). The product is designed to *not be opened obsessively*.
**Lower-fidelity alternative:** Already implemented in demo — keep the discipline of not adding engagement-driving features.

### Intervention P6.2 — Weekly digest email
**Pain eliminated:** P6 (replaces obsessive checking with one calm digest)
**Friction removed:** Several minutes of daily checking
**Description:** Sunday morning email: "This week's summary: 3 calm days, 2 active days, 0 alerts. Charlie's resting HR trended down 4% — that's normal for the cooler weather." Owner reads in 60 seconds, doesn't open the app.
**Lower-fidelity alternative:** **Concierge.** Founder writes the digest by hand. Same logic as P1.1.

### Intervention P6.3 — Streaks / gamification
**Rejected.** Engagement metrics are not the goal here. Reassurance is the goal. Streaks would *increase* the cognitive load the product is supposed to reduce. **Added to Rejection Log.**

---

## Pattern P2 — Training/recovery decision uncertainty

### Intervention P2.1 — Morning readiness score
**Pain eliminated:** P2 (rider needs daily training decision support)
**Friction removed:** ~10 minutes of "is he ready?" deliberation each training morning
**Description:** Once per morning, a single number 0–100 representing the horse's recovery readiness. Computed from overnight HRV recovery curve + activity level vs. previous days + temperature stability. Comes with one-sentence guidance: *"Charlie's recovery is solid — green light for normal training"* or *"HRV is 18% below typical — consider a lighter session."*
**Lower-fidelity alternative:** **Manual readiness score** in onboarding period. Founder reviews the previous 24h of data each morning at 6 AM, sends a one-line text to each subscriber. 50 subscribers × 60 seconds = 50 minutes/day. Sustainable for proof. The customers who *use* the readiness score become the proof points.

### Intervention P2.2 — Trainer view (multi-rider visibility on one horse)
**Pain eliminated:** P2 (when the owner-rider's instinct disagrees with the trainer)
**Friction removed:** Eliminates triangulation calls
**Description:** Owner can invite their trainer to view the horse's readiness score. Both look at the same number.
**Lower-fidelity alternative:** Shareable read-only URL. No login. Already partly supported by the demo's no-auth philosophy.

### Intervention P2.3 — Predicted overtraining warning
**Rejected.** This requires a model with high accuracy on a rare event. We don't have data. We don't have evidence the underlying pattern is detectable. Replace with *trend visualisation* — let the owner see for themselves that 5 consecutive hard days have produced declining HRV. Don't claim to predict.

---

## Pattern P5 — Vet-visit binary decision

### Intervention P5.1 — "Should I call the vet?" guided check
**Pain eliminated:** P5
**Friction removed:** ~20 minutes of internal debate before deciding whether to call
**Description:** A button labelled "Should I call the vet?" When tapped, the app walks the user through 3 questions ("Is he eating normally?" / "Has activity been below normal for >12h?" / "Are any vitals outside the red band?") and produces a clear recommendation: "Call the vet now" / "Watch and re-check in 4 hours" / "No reason to call based on current data."
**Lower-fidelity alternative:** Static decision-tree PDF emailed at onboarding. Test whether owners use it. If yes, build the in-app version.

### Intervention P5.2 — Pre-vet PDF (already MUST-5)
**Pain eliminated:** P5 (related to MUST-5 from Phase 4)
**Same as MUST-5.**

### Intervention P5.3 — Direct vet chat in-app
**Rejected.** Requires partnerships, regulatory consideration, money. The product can be *complementary to* the vet without *being* the vet's channel. Reconsider only when vet partnership program is established.

---

## Pattern P4 — Ad-hoc data structure

### Intervention P4.1 — Photo + note timestamp capture
**Pain eliminated:** P4 (owner is already photographing things — give them a place to put them)
**Friction removed:** ~5 minutes of camera-roll-scrolling at next vet visit
**Description:** A "+ Note" button on every horse page. Snap a photo, add a one-line note. The note is auto-tagged with timestamp + current vitals. Vet PDF (MUST-5) includes these notes inline.
**Lower-fidelity alternative:** Email-in: forward a photo to `charlie@carrotwatch.app` and it lands in his timeline. No app interaction required. Test whether owners actually do this.

### Intervention P4.2 — WhatsApp import
**Rejected for MVP.** Technically complex (WhatsApp doesn't export easily), and the email-in alternative achieves 80% of the value. Reconsider at scale.

---

## Phase 6 conclusion — what this phase implies for Phase 7

1. **The single highest-leverage UX intervention is P1.1 (morning overnight summary).** It defines what the product *is*. Every other surface decorates it.

2. **The lower-fidelity alternatives are dominant.** For 7 of 10 proposed interventions, the manual/concierge version is the better first move. **The product can be sold and validated before significant engineering investment.** This is the foundation of Variant B.

3. **Three interventions were rejected and go to the Rejection Log:**
   - Configurable "wake me if" thresholds (offloads work to user)
   - Streaks / gamification (works against P6 goal)
   - Predicted overtraining warning (model overreach)
   - In-app vet chat (out of scope)

4. **P2 interventions are commercially valuable but specific to Cohort A (sport rider).** If the strategic decision is Cohort B/D first (Variant B), P2 interventions are deferred to phase 2 of the product.
