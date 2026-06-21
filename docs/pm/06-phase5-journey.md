# Phase 5 — User Journey Simulation

> **Question this phase answers:** Walk through the product as the user. Where does it stick? At which moment does the user decide to stay or leave? At every transition, what does it cost them if it fails?

Journey simulated for **Cohort B (yard manager) and Cohort D (worried-after-incident owner)** — the two cohorts surviving the Phase 3 ACH as commercially viable early customers. Cohort A (sport rider) and Cohort C (performance-curious) are covered as secondary in Variant A.

---

## 5.1 Cohort D — Worried Owner Of Recently-Ill Horse — Journey

### Stage 1: Pre-arrival
**What happened before:** Horse colicked 3 weeks ago, recovered with veterinary intervention costing €1,800. Vet said "watch him for any change over the next 6 months." Owner has been hyper-vigilant ever since, sleeping poorly, checking the camera at 2 AM.

**Where they came from:** Most likely a vet referral, secondarily a Facebook group post, distantly a Google search.

**Consequence if this moment fails:** Owner never finds Carrot Watch. Continues current vigilance. Burns out at month 4 (per Phase 2 scenario 10).

### Stage 2: First contact (the 4-minute test)
**What happens:** Owner lands on the homepage at 10:30 PM after their evening barn check. They are tired. They want to know two things: (1) will this catch what I'm afraid of? (2) what does it cost?

**4-minute test:** Can the owner go from landing page → signup → seeing a demo dashboard for an example horse → understanding the value proposition in under 4 minutes? Currently: **the demo can do this** — the demo's first screen is the value proposition. Production landing page must replicate this experience pre-signup.

**Friction:** Hardware question. "Do I need to buy a sensor?" If the answer is "yes, €300," owner closes the tab. If the answer is "we send you one for free during the trial and you pay for the service," owner reads on.

**Consequence if this moment fails:** Lost lead. With paid-acquisition cost likely €30–60 per signup in this segment (vet-referral or targeted ads), each lost lead = a quantifiable cost.

### Stage 3: First action — sensor arrival and installation
**What happens:** Sensor arrives via mail 2–4 days after signup. Owner unboxes, watches a 90-second onboarding video, attaches the sensor to a halter or surcingle. Opens the app on phone.

**The first action is physical, not digital.** This is a hardware product even if we don't build the hardware. The unboxing experience matters.

**Friction:** Owner is unsure whether the sensor is positioned correctly. Sees data appearing in the app, but does not yet trust it.

**Consequence if this moment fails:** Sensor sits unused. Owner reaches out to support (concierge onboarding catches this). With no concierge, the owner quietly cancels at the end of the trial.

### Stage 4: First friction — the 10-day calibration window
**What happens:** Days 1-10 the app shows "establishing baseline" with no alerts. Owner is **disappointed** — they expected protection from day 1. They wonder if it's working.

**This is the highest-risk stage.** The 10-day window from MUST-1 creates an activation dip.

**Mitigation:** Onboarding email sequence reframes "no alerts" as "we're learning your horse" with explicit milestones — day 3: "we've recorded 5,000 readings," day 7: "your baseline is taking shape," day 10: "calibration complete — you're now protected."

**Consequence if this moment fails:** ~30% of users churn here. **This is the largest single retention risk in the journey.**

### Stage 5: First value — the day the app shows the calm green status
**What happens:** Day 11 onward. Owner opens the app in the morning. Status: green. All vitals within band. Owner — for the first time in 3 weeks — *feels reassured*. They don't have to go look at the horse.

**The reassurance is the value.** Not the data. Not the alerts. The fact that the app said "fine" and the owner believed it and got 20 minutes back.

**This is the moment of conversion** from "I'm trialling this" to "I'm a customer."

### Stage 6: Daily use at week 4
**What happens:** Owner has settled into a rhythm. Opens app on phone twice a day (morning coffee, evening). Glances at status. Most days: green. Once a week or so: a yellow info-tier note ("activity slightly elevated yesterday — does this match a training session?"). Owner mentally answers, dismisses.

**This is the steady-state.** Engagement: <90 seconds per day. Anxiety level: down from baseline.

**Risk:** Habituation. After 6 months with no urgent alert, owner starts wondering "do I still need this?"

### Stage 7: Stress moment — the late-night warning
**What happens:** Owner is asleep at 1:14 AM. Phone vibrates with a high-priority notification: "URGENT — Charlie heart rate elevated 47% above baseline for last 22 minutes, HRV dropping. Consider checking on him."

**This is the test moment.** The owner either: (a) goes out, finds something, the product is validated forever; (b) goes out, finds nothing, false alarm, the product is on probation; (c) ignores the alert (silence), risks loss.

**Consequence if this moment fails (false positive):** One false positive is forgivable. Two within 14 days starts churn risk per Phase 3 ACH.

**Consequence if this moment fails (false negative — missed event):** Catastrophic. Loss of horse + loss of customer + brand damage in a tight-knit community.

### Stage 8: Departure risk
**Most likely churn triggers, in order:**
1. **Month 1 calibration period boredom** — already discussed in Stage 4 (~30% risk)
2. **Month 2-3 first false positive** — if handled badly by the app's tone (apologetic, transparent), can survive; if handled as if the alarm was correct, owner loses trust
3. **Month 6-9 habituation** — silent product becomes wallpaper, owner cancels in an annual cost review
4. **Month 12+ horse recovers** — the recently-traumatized owner's stake fades; if the product hasn't broadened (sleep score, training insights, etc.) they're gone

**Retention is the survival metric.** The MVP must produce enough value to defeat habituation by month 6.

---

## 5.2 Cohort B — Yard Manager — Journey (compressed)

The yard manager journey diverges from owner journey at three points:

1. **Pre-arrival:** Trigger is a *peer's* loss, not their own. They are evaluating proactively, not reacting.
2. **First action:** Multi-horse install. Concierge install (we drive to the yard) is plausibly cost-effective for yards of 6+ horses.
3. **First value:** Not reassurance — *signal-to-noise on their attention*. The yard manager wants the product to tell them *which horse to check next*, not *all horses are fine.* They are already inundated with vague reassurance.

**Implication:** The yard manager's UI is **different from the owner's UI.** Same engine, different surface. Variant A treats this as a future expansion. Variant B treats this as the lead market.

---

## 5.3 Mandatory: "Consequence if this moment fails" — summary table

| Stage | Most likely failure | Cost of failure |
|-------|---------------------|-----------------|
| 1 Pre-arrival | Lead never finds product | Acquisition cost wasted (€30–60 estimated) |
| 2 First contact | 4-minute test fails | Lost trial signup, opportunity cost ~€30–60 |
| 3 First action | Sensor misinstall, no concierge catch | Quiet cancellation at trial end |
| 4 Calibration | 10-day no-alert dip | ~30% churn within first 30 days |
| 5 First value | Owner doesn't connect status to reassurance | Slow churn over 60 days |
| 6 Daily use | Habituation | Cancellation at month 6-12 |
| 7 Stress moment | False positive | One forgivable; two = churn |
| 7 Stress moment | False negative | Horse loss + customer loss + brand damage |
| 8 Departure | Recovered-horse owner exit | Annual revenue compression; expansion to new cohorts required |

---

## 5.4 OODA tempo score — can the team out-cycle competitors at each stage?

Boyd's OODA loop applied to the team's ability to observe behaviour and respond at each journey stage.

| Stage | Can we observe behaviour? | Can we ship a change in 48h? | Can we re-test in 7d? | OODA score (1-5) |
|-------|---------------------------|------------------------------|------------------------|------------------|
| 1 Pre-arrival | Yes (analytics on landing) | Yes (web copy) | Yes | 5 |
| 2 First contact | Yes (signup funnel) | Yes | Yes | 5 |
| 3 First action | **No** (no analytics on sensor install) | Hardware-blocked | No | **2** |
| 4 Calibration | Yes (in-app events) | Yes (email copy) | Yes | 5 |
| 5 First value | Yes (engagement metrics) | Yes (UI tweaks) | Yes | 5 |
| 6 Daily use | Yes | Yes | Yes | 5 |
| 7 Stress moment | Partial (alert open rates) | Yes (threshold tuning) | Limited (need real events) | 3 |
| 8 Departure | Yes (cancellation flow) | Yes (retention emails) | Yes | 5 |

**Weakest stage: Stage 3 (first action, physical install).** This is where the team's structural advantage *evaporates* because we cannot observe what's happening physically at the yard. **Mitigation: concierge onboarding for first 50 customers.** This is non-negotiable. Once we have observation data on 50 installs, the patterns emerge and we can automate.

**Second-weakest: Stage 7 (stress moment).** We cannot generate real urgent events to test alert thresholds; they happen on a long tail. **Mitigation: synthetic event injection in QA + horse-by-horse alert threshold tuning by hand for first 100 customers (concierge).**

---

## Phase 5 conclusion — what this phase implies for Phase 6

1. **The journey has 2 high-stakes failure stages:** Stage 4 (10-day calibration) and Stage 7 (stress moment). Phase 6 UX audit must propose specific interventions for these stages.

2. **Concierge onboarding is not optional** for the first 50 customers. It is the only way to close the Stage 3 observation gap.

3. **The "feels reassured" moment at Stage 5 is the actual product value.** Not the alerts, not the dashboard. UX must lean into this — the default tone is *"everything is fine"*, not *"here's what to watch"*.

4. **Habituation at month 6 is a structural threat** — the product must expand its value surface (sleep score, training insights, vet integration) before month 6 to maintain retention.
