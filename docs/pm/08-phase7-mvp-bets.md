# Phase 7 — MVP Crystallization + Bet Encoding

> **Question this phase answers:** What is the smallest surface that lets us know — within 90 days — whether the core hypothesis is right or wrong? Every component is a bet. Every bet has a kill metric. Pre-mortem at the end.

**Traceability Mandate (Gate 3):** Every MVP component below names its parent pain and the mechanism by which it addresses it.

**Reference class anchor (Kahneman/Lovallo):** Median time-to-first-10-paying-customers for a B2C health-tracking product with a hardware component is 6–12 months from kickoff. Median 12-month retention for similar products is 40–55%. Carrot Watch's plan must assume base rates, not optimistic exceptions.

---

## 7.1 MVP scope (Variant B — recommended; see file 99 for Variant A)

The recommended MVP is a **concierge-first, sensor-rented service** targeted at Cohort D (recently-traumatized owners, vet-referral channel) and Cohort B (small yards). It uses off-the-shelf sensors (Equimetre, Hoofstep, or equivalent) rather than building hardware.

**Six bets. Five components and one go-to-market bet.**

---

## 7.2 Bet encoding (formal format)

### Bet 1 — Personalised baseline (MUST-1)

```
COMPONENT:        10-day personal baseline engine
PARENT PAIN:      P1 (unobserved-window vulnerability)
                  P3 (alert noise — global thresholds produce false alarms)

HYPOTHESIS:       Building a per-horse 10-day rolling baseline will reduce false-positive
                  alerts by 70% vs. fixed-threshold detection, measured on real customer
                  data after 60 days of operation.

PROBABILITY:      55% (reference class: medical wearables that personalise — Apple Watch
                  irregular rhythm, Whoop strain — succeed at this around 60-70% of the
                  time. Adjusted down for equine sensor noise being worse than human.)

EXPECTED PAYOFF:  If it works, Carrot Watch can claim alert quality vs. competitors;
                  reduces churn at Stage 7 of journey by ~40%.

EXPECTED COST:    ~3 engineering weeks (already partly built in the demo). Plus 60 days of
                  customer data collection to validate.

30-DAY KILL:      If <50% of customers reach a stable baseline by day 14 (statistically
                  distinguishable from global reference range), the algorithm needs
                  rework. Threshold crossing = automatic algorithm review.

60-DAY KILL:      If false-positive rate is >35% (alerts dismissed as "no real issue"
                  when reviewed retroactively), the baseline math is wrong.

90-DAY KILL:      If FP rate is still >25% after two iterations, the personalisation
                  approach is fundamentally insufficient → pivot to manual threshold
                  curation per horse.

ALTERNATIVES:     (a) Fixed global thresholds — rejected, see P3 ACH;
                  (b) Adaptive thresholds with user-tunable sensitivity — rejected,
                      offloads work to user (Intervention P1.3, rejected);
                  (c) ML model trained across horses — premature without data.

WHY THIS, NOT THOSE: Personalised baseline is the minimum that addresses both P1 and P3
                     without requiring ML training data we don't yet have.
```

---

### Bet 2 — Three-tier alerts with confidence gating (MUST-2 + P3.1)

```
COMPONENT:        Three-tier alert system (info / warning / urgent) with
                  multi-gate urgent threshold (≥0.85 score AND ≥10min persistence
                  AND no recent return-to-band).

PARENT PAIN:      P3 (alert noise) — the load-bearing pain.

HYPOTHESIS:       Multi-gate urgent threshold reduces urgent-push silencing rates
                  to <10% within first 30 days vs. ~30% with single-gate approach.

PROBABILITY:      60% (reference class: medical alarm systems with multi-gate
                  confidence thresholds reduce alarm fatigue by 40-60% in
                  hospital studies. Adjusted for consumer context.)

EXPECTED PAYOFF:  Defeats the silent-everyone-leaves failure mode. This is the
                  bet that determines whether the product survives month 3.

EXPECTED COST:    ~1 engineering week (logic already partly designed in
                  mock anomaly_score implementation).

30-DAY KILL:      If >15% of customers disable urgent push notifications by day 30,
                  the threshold is too aggressive — raise it.

60-DAY KILL:      If after threshold adjustment, disable rate is still >10%, the
                  urgent-push channel is fundamentally wrong. Drop push entirely
                  and require app-open for all alerts.

90-DAY KILL:      Cannot fail at day 90 because by then the bet has either
                  succeeded or already been pivoted to no-push.

ALTERNATIVES:     (a) Push every alert — rejected, fatigue;
                  (b) Push nothing — rejected, defeats early-warning value;
                  (c) User-configurable thresholds — rejected (P1.3).

WHY THIS, NOT THOSE: Confidence-gated push is the only mechanism that survives
                     the P3 ACH falsification of H1.
```

---

### Bet 3 — The morning overnight summary (P1.1)

```
COMPONENT:        Hand-written then auto-generated morning summary card
                  delivered at 6 AM local time.

PARENT PAIN:      P1 (unobserved-window vulnerability)
                  P6 (sustainable effort — replaces obsessive checking)

HYPOTHESIS:       The morning summary card is the product's *moment of value*.
                  It defines what Carrot Watch is. If customers describe Carrot
                  Watch using language from the morning summary, the bet wins.

PROBABILITY:      70% (high confidence — this is a low-tech intervention with
                  precedent: Calm app's daily mood card, Whoop's recovery email.
                  Reference class for daily-summary engagement is strong.)

EXPECTED PAYOFF:  Defines product identity. Reduces journey Stage 4 (calibration)
                  churn from ~30% to ~15% by giving owners something to receive
                  every morning even during the no-alert period.

EXPECTED COST:    Concierge: founder writes 20 summaries/day @ 5 min each = 100
                  min/day. Sustainable for 60-90 days during proof phase.
                  Auto-generation: ~2 engineering weeks once template is proven.

30-DAY KILL:      If <40% of customers open the morning summary on the day it
                  arrives, the format is wrong. Iterate on copy/timing.

60-DAY KILL:      If summary-opener cohort retains <70% at day 60 while non-opener
                  cohort retains <30%, the summary doesn't drive value enough to
                  justify the cost. (Note: low retention in *both* cohorts means
                  the bet fails for a different reason.)

90-DAY KILL:      If by day 90, customer interviews show <50% reference the
                  morning summary as a reason they're keeping the product, the
                  bet is partial — the summary is liked but not load-bearing.
                  Continue building, do not deprecate.

ALTERNATIVES:     (a) No daily contact during calibration — rejected, fails Stage 4;
                  (b) Push notification each morning — rejected, conflicts with
                      P6 (reassurance not urgency);
                  (c) Email-only — viable; pick whichever channel customer
                      opens more often.

WHY THIS, NOT THOSE: The morning summary IS the product for the first 90 days.
                     Concierge version validates the format before automation.
```

---

### Bet 4 — Vet-shareable PDF export (MUST-5)

```
COMPONENT:        On-demand PDF or shareable link showing last 7/30 days of
                  vitals, alerts, and notes in vet-readable format.

PARENT PAIN:      P4 (ad-hoc data structure)
                  P5 (vet binary decision uncertainty)
                  Phase 3 conviction bias #3 — vet endorsement is the moat we
                  don't have.

HYPOTHESIS:       A PDF export that vets find useful (≥50% rate it useful in
                  validation interviews) becomes the wedge for vet endorsement,
                  which is the credibility moat for the product.

PROBABILITY:      40% (reference class: pet-health-record products attempting
                  vet integration have a mixed track record. The format is
                  doable; vet adoption is the gamble.)

EXPECTED PAYOFF:  If it works: vet referrals become a 0-CAC acquisition channel.
                  This is the highest-leverage component for unit economics.

EXPECTED COST:    Validation: 3 vet interviews before building. PDF generation:
                  ~1 engineering week. Vet partnership program: 3-6 months of
                  ongoing relationship work, mostly non-engineering.

30-DAY KILL:      If <3 vets validate the format in initial interviews, redesign
                  the format. Cannot proceed to build without vet validation.

60-DAY KILL:      If, after build, no vet has voluntarily referred a customer
                  by day 60, the export-as-moat hypothesis is failing.

90-DAY KILL:      If by day 90, vet-referred customers are <10% of new signups,
                  the vet channel isn't materialising. Pivot to direct-to-owner
                  marketing only; deprecate vet partnership work.

ALTERNATIVES:     (a) No vet integration, owner-only product — rejected, fails
                      conviction bias check #3;
                  (b) In-app vet chat — rejected, regulatory + capacity;
                  (c) White-label for vet clinics — premature, too operationally
                      heavy for current stage.

WHY THIS, NOT THOSE: PDF export is the minimum viable vet touchpoint that
                     creates referral pull without requiring vet operational change.
```

---

### Bet 5 — Concierge onboarding (Stage 3 mitigation)

```
COMPONENT:        Founder-led onboarding: sensor ships with personal welcome
                  email; founder makes 1 video call OR personally responds to
                  the first 50 customers' first questions.

PARENT PAIN:      Phase 5 Stage 3 (first action — sensor install gap)
                  P3 (alert noise — first-pass threshold tuning per customer)

HYPOTHESIS:       Concierge onboarding for first 50 customers raises 90-day
                  retention to ≥70% vs. ~40% reference-class for self-serve.

PROBABILITY:      75% (high — concierge is the highest-ROI tactic at this stage
                  per Y Combinator pattern, but at the founder's time cost.)

EXPECTED PAYOFF:  Retention lift + qualitative insight goldmine. Every onboarding
                  call surfaces unmet needs the product roadmap couldn't have
                  predicted.

EXPECTED COST:    ~60 minutes per customer × 50 = 50 hours of founder time over
                  first 90 days. Sustainable. Becomes unsustainable past
                  ~100 customers.

30-DAY KILL:      No 30-day kill — concierge is by-default productive even when
                  it doesn't directly drive retention because of the data it
                  surfaces.

60-DAY KILL:      If 60-day retention with concierge is still <50%, the product
                  itself is the problem, not the onboarding. Recurse on
                  product-fit. Concierge cannot save a product that doesn't fit.

90-DAY KILL:      If by 50 customers the patterns are unclear and we can't
                  identify what to automate, the founder is wasting time —
                  hire someone else to do onboarding instead.

ALTERNATIVES:     (a) Self-serve trial with video tutorials — rejected, Stage 3
                      OODA gap;
                  (b) Sensor pre-configured for a specific yard — rejected,
                      doesn't scale and isn't actually meaningfully better;
                  (c) Outsourced support — rejected, the data this generates
                      is the moat; founder must be in the loop.

WHY THIS, NOT THOSE: Concierge is the only mechanism that closes the Stage 3
                     observation gap and the Bet 1 baseline-tuning loop simultaneously.
```

---

### Bet 6 — Vet-referral go-to-market

```
COMPONENT:        Distribution bet. Pre-launch: identify 5-10 small-animal/equine
                  vet practices willing to refer 2-3 high-anxiety post-incident
                  owners per month in exchange for free PDF export tooling and
                  data-shareback (with owner consent).

PARENT PAIN:      Phase 3 ACH for P1 (H4 — buyers are recently-traumatized,
                  not generic owners) — and the channel that reaches them
                  is the vet, not Facebook ads.

HYPOTHESIS:       5+ vet practices will agree to refer customers within 60 days
                  of outreach. Each practice generates 1-2 paying customers/month.

PROBABILITY:      45% (low-medium — vets are protective of their relationships;
                  reference class: pet-tech vet partnerships have mixed success
                  rates around 30-60%.)

EXPECTED PAYOFF:  Replaces paid acquisition channel entirely. If the unit economics
                  work, Carrot Watch becomes profitable at 50-100 customers/month.

EXPECTED COST:    ~20 hours/week of founder time for 8 weeks (outreach + pitches +
                  follow-up). No engineering cost.

30-DAY KILL:      Outreach to 30 vet practices completed. If response rate is
                  <20%, the pitch is wrong. Iterate.

60-DAY KILL:      If <3 vets have agreed to refer by day 60, the channel
                  hypothesis is failing. Pivot to: direct-to-owner Reddit/forum
                  marketing for one cohort + content for the other.

90-DAY KILL:      If <5 vets actively referring with >=10 cumulative customers
                  generated through their channel, the vet channel isn't viable
                  at this stage. Deprecate vet sales motion, become a
                  direct-to-consumer brand. Re-attempt vet channel at 500+
                  customers when the social proof exists.

ALTERNATIVES:     (a) Paid Facebook/Instagram ads — viable but ~€30-60 CAC and
                      no moat;
                  (b) Equine influencer marketing — viable for cohort A/C
                      (sport rider/performance-curious), not cohort D;
                  (c) Stable-yard partnerships instead of vets — overlap with
                      Cohort B; viable parallel channel for Variant A;

WHY THIS, NOT THOSE: Vet referrals directly target the surviving H4 buyer
                     identified in Phase 3 ACH.
```

---

## 7.3 AI behaviour contract (for the Claude-powered assistant)

The current demo shells out to Claude Code CLI. The AI is a NICE feature per Phase 4. If included in launch MVP, it has the following contract:

```
TRIGGER:        User taps the Assistant tab AND selects a horse.

INPUTS:         (a) Current horse's latest vitals;
                (b) Personalised baselines for the 4 core metrics;
                (c) Active alert list;
                (d) Last 6 user messages from conversation history.

EXPECTED OUTPUT:
                (a) Plain-language interpretation of the data;
                (b) Concern rating: Normal / Slightly elevated / Moderate
                    concern / High concern;
                (c) Response under 120 words unless user requests more.

FAILURE MODE:
                When uncertain, the AI must REFUSE or HEDGE, never invent
                clinical findings. Example: "I see HR is elevated but I can't
                determine whether that's training-related from the data alone —
                consider checking on him directly."

HARD NO-DO LIST:
                - Never diagnose a specific condition (colic, laminitis, ...)
                - Never recommend specific medications or dosages
                - Never advise against contacting a vet when ambiguous
                - Never claim sensor data is "100% accurate"
                - Never persist conversation across horses (context boundary)

KILL METRIC (AI-specific):
                If, in user-research interviews, >10% of users report receiving
                AI advice they later considered "wrong" or "dangerous", AI is
                hidden behind a feature flag and reviewed before reactivation.
                A single regulatory complaint is sufficient to deactivate.
```

---

## 7.4 Pre-mortem (the obituary 12 months from now)

> *It is 12 months from now and the Carrot Watch MVP failed. What happened?*

**Failure path 1 — Alert noise killed retention.**
Despite Bet 2's multi-gate threshold, real-world sensor data produced false alerts at ~30% rate. By month 4, average customer was silencing all push notifications. By month 8, the product became wallpaper. Customers cancelled in annual review.
**Early signal:** Bet 1's 60-day kill metric (FP rate >35%) crosses.

**Failure path 2 — Vet channel never materialised.**
8 weeks of vet outreach produced 2 cooperative vets and a lot of "let me think about it." Without vet endorsement, the recently-traumatized cohort never trusted the product. Without that cohort, the product had to compete on cost with Equilab — a fight we couldn't win.
**Early signal:** Bet 6's 30-day kill metric (response rate <20%) crosses.

**Failure path 3 — Concierge couldn't scale and self-serve couldn't retain.**
First 30 customers loved the founder's onboarding. Customer 31 onward — when concierge wasn't possible — churned at 60% within 60 days. The product never crossed from "founder-led service" to "actual SaaS." Revenue plateaued at ~€3-5k MRR and the business stalled.
**Early signal:** Cohort 2 (customers 31-50) shows materially worse activation than cohort 1.

**Failure path 4 — The cohort framing was wrong.**
After 6 months, the customers actually paying weren't recently-traumatized owners (the H4 hypothesis from Phase 3). They were Cohort A sport riders (which the team had deprioritized). The product had been built for the wrong segment; the messaging, onboarding, and roadmap all needed reset. Re-architecting cost 4 months. Capital ran out before pivot completed.
**Early signal:** Customer survey at day 60 shows <40% of customers fit Cohort D profile.

---

## Phase 7 conclusion — what this phase implies for Phase 8

1. **6 bets defined. 6 kill metrics set.** No component is unfalsifiable.

2. **Bet 1 (baseline), Bet 2 (alert tiers), Bet 5 (concierge) are non-negotiable** — they address the highest-priority patterns and the most-load-bearing failure modes.

3. **Bet 4 (vet PDF) and Bet 6 (vet channel) are coupled** — Bet 6 fails immediately if Bet 4 doesn't have validated format.

4. **Bet 3 (morning summary) is the product's identity.** If the team has to cut one bet, this is the one to keep — because every other bet decorates it.

5. **The pre-mortem identifies 4 distinct failure paths.** Each maps to a kill metric. **No failure path is unwatched.**

6. **Phase 8 (technical blueprint) must build for the concierge-first, low-engineering path.** Heavy engineering investment is itself a bet (against simpler service-first validation) and is rejected at this stage.
