# Phase 10 — Completion Report

The deliverable section. Read this first if you have 10 minutes.

---

## 10.1 Decisions Log

Every meaningful choice made in this document, with the alternative considered and why it was rejected.

| # | Decision | Reason | Alternative considered | Why rejected |
|---|----------|--------|------------------------|--------------|
| 1 | Lead with Cohort B (yards) and Cohort D (post-incident owners), defer Cohort A and C | Phase 3 ACH showed H4 (recently-traumatized buyer) survives falsification; Cohort B has loss-prevention stakes that justify higher WTP | Lead with Cohort C (performance-curious) | Stakes are emotional not financial; WTP unproven; the founder's instinct gravitates here but the data doesn't support it |
| 2 | No proprietary sensor hardware in MVP | Phase 0 asymmetric advantage audit: hardware iteration cycles destroy the team's structural speed advantage | Build proprietary sensor | Hardware = 9-18 month timeline; capital intensive; lock-in if vendor relationships sour |
| 3 | Concierge-first onboarding for first 50 customers | Phase 5 Stage 3 OODA gap; founder time is the cheapest validation tool available | Self-serve free trial with video tutorials | Doesn't close the install-observation gap; reduces qualitative learning rate |
| 4 | Pull-based (glanceable) UI by default, push only for urgent confidence-gated alerts | Phase 3 P3 ACH refuted H1 (users tolerate FP); refute alert-noise tolerance | Push-everything model | Causes silencing by week 4; kills retention by month 3 |
| 5 | Morning summary is the product's identity | Phase 6 highest-leverage UX intervention; addresses P1 + P6 simultaneously | Daily push notification, in-app feed | Push fights P6; feed requires user-initiated open with no specific moment of value |
| 6 | Vet referral as primary distribution channel | Phase 3 H4 + Phase 7 Bet 6 | Paid Facebook/Instagram ads | Generic mass-market acquisition contradicts H4; CAC unsustainable at €30-60 with unknown LTV |
| 7 | 10-day baseline calibration window | Bet 1 testable; analogous to medical wearables | Day 1 protection with global thresholds | Global thresholds fail P3 (alert noise) within 30 days |
| 8 | Three-tier alert severity (info / warning / urgent) | Phase 3 P3 ACH supports H3 (severity tiering) | Two-tier or single-tier | Two-tier collapses warning into urgent → silencing; single-tier is the failure case |
| 9 | Postgres-only data store, no Redis/queues, no microservices | Phase 8 cycle-time analysis; complexity is itself a bet against simpler validation | Production-grade event pipeline with Kafka, etc. | Premature at <200 customers; engineering capital wasted vs. customer-validation capital |
| 10 | Email-in for notes (P4.1 low-fidelity) rather than WhatsApp import | Phase 6 lower-fidelity alternative is cheaper and captures 80% of value | WhatsApp business API integration | Technical complexity; WhatsApp export pipelines are fragile |
| 11 | AI assistant kept as NICE not MUST | Phase 4 ranking; Phase 7 Bet 4 not required for core value | AI as flagship feature | No Phase 3 pain pattern requires AI to solve; risk of moving complexity in front of value |
| 12 | Mobile PWA (current Next.js) rather than native iOS/Android | Phase 8 architecture; saves 3-6 months | Native app | Premature; PWA is good enough on iPhone Safari at this customer count |
| 13 | Surface 2 strategic variants (file 99) rather than pick one | Significant strategic uncertainty between Cohort B-led vs. Cohort A-led | Pick one and recommend | The information needed to pick lives in the switching interviews, which haven't happened yet |

---

## 10.2 Assumptions List

Sorted by importance × evidence gap. **High-importance + low-evidence = top of the discovery backlog.**

| # | Assumption | Importance | Evidence | What would falsify | Cheapest test |
|---|------------|------------|----------|--------------------|--------------|
| **A1** | Horse owners in the 90-day post-incident window will pay €15-30/month | **Critical** | **None** | Customer survey at day 30 shows <30% of buyers are post-incident | Switching interview (file 50) with 5 owners |
| **A2** | Vets will refer customers in exchange for free PDF tooling | **Critical** | **None** | 30 vet outreach with <20% response rate | 30-vet outreach experiment (Bet 6 30-day kill) |
| **A3** | Multi-gate alert threshold reduces false-positive silencing to <10% | **High** | Low (analogous medical alarm literature) | Customer push-silencing rate >15% at day 30 | Bet 2 in production |
| **A4** | 10-day baseline window is sufficient for personalisation | **High** | Low (ML literature, no equine-specific data) | Calibration false-positive rate >35% at day 60 | Bet 1 in production |
| **A5** | Sensor wholesale cost is €20-50/horse/month | **High** | **None** | Vendor quote shows cost >€80/month | Single phone call to Equimetre + Hoofstep sales |
| **A6** | Morning summary card is the perceived product value | **High** | None | Customer interviews at day 60 don't reference it as the main value | Concierge version + customer interview |
| **A7** | The 14-hour overnight window is the most-valuable monitored window | **High** | Medium (Phase 2 scenarios 1, 5, 8) | Customer interviews show daytime training events are more salient | Switching interview |
| **A8** | Yard managers will pay €100-300/month per yard | Medium | None | Direct asks to 5 yard managers, all decline at that price | 5 yard manager phone calls |
| **A9** | The performance-curious cohort (C) is a worse commercial fit than D/B | Medium | Phase 3 reasoning, not direct evidence | 2 cohort C customers pay and retain at month 6 while D struggles | Run Variant A in parallel for one quarter |
| **A10** | Habituation kills retention at month 6 | Medium | Whoop/Strava analogous data | Carrot Watch cohort 1 retains >70% at month 9 | Wait 9 months (slow) or interview Whoop churners (fast proxy) |
| **A11** | Email-in for notes will get used | Low | None | Email-in volume <1 note/customer/month at day 60 | Ship the email-in feature; no cost beyond an inbox |
| **A12** | The Next.js PWA is acceptable as a mobile experience for the first 100 customers | Low | High (the demo works) | Customers ask for native app within first 30 days | Customer feedback |
| **A13** | Anomaly score ≥0.85 is the right urgent threshold | Medium | None | False-positive rate >35% at 0.85 — adjust to 0.90 | Production data, Bet 2 60-day kill |
| **A14** | Real customers exist in the volume needed | Foundational | Medium (industry size data exists) | Outreach to 200 targets, <5 qualified | Cohort acquisition test |

**Top 3 to test this week (high importance × low evidence):**
1. **A1** — Are buyers actually post-incident? Switching interview script.
2. **A2** — Will vets refer? Direct outreach test.
3. **A5** — Sensor cost reality? One phone call to OEM vendors.

These three answers reshape the entire artifact.

---

## 10.3 REJECTION LOG (the senior PM differentiator)

> *13 explicit rejections. Read these to understand what was decided AGAINST.*

### Strategic rejections

**RJ-1.** We considered building proprietary sensor hardware to control the entire data pipeline. **We are not building it because** hardware iteration cycles (months) collapse the team's structural advantage over incumbents (Garmin, Arioneo) — the only thing we have that they don't is the ability to ship in 48 hours. **We would reconsider if** annual revenue exceeds €2M with proven retention, at which point hardware investment becomes a moat rather than a slowness tax.

**RJ-2.** We considered targeting the performance-curious recreational rider (Cohort C, the demo's intended audience) as primary. **We are not building for them because** their stakes are emotional optimization rather than loss prevention, willingness-to-pay is unproven, and they will treat a €25/month product as discretionary — abandoning during any household budget tightening. **We would reconsider if** switching interviews reveal C-cohort WTP exceeds €30/month with strong retention signal (Variant A in file 99).

**RJ-3.** We considered a generic horse-owner advertising strategy (Facebook, Instagram, Google ads). **We are not building it because** the surviving Phase 3 hypothesis H4 says buyers are recently-traumatized — a narrow window reachable by vet referral. Mass-market acquisition spends money to reach the wrong audience. **We would reconsider if** vet referral fails (Bet 6 60-day kill) AND direct outreach to traumatized cohort proves possible through forum communities (file 51 thread mining).

**RJ-4.** We considered a self-serve free trial without onboarding. **We are not building it because** Phase 5 Stage 3 OODA analysis showed the team cannot observe what happens during physical sensor installation; that observation gap kills retention. **We would reconsider when** customer count exceeds 100 and concierge becomes economically infeasible at one customer per hour of founder time.

**RJ-5.** We considered building a diagnostic feature ("this looks like colic"). **We are not building it because** regulatory exposure across multiple jurisdictions creates risk for a pre-revenue company, accuracy floor for vet acceptance is impossibly high without partnership, and the same value is delivered safer with "deviation from baseline" framing. **We would reconsider if** vet co-signing partnership delivers a clinical-grade model.

### Product/UX rejections

**RJ-6.** We considered user-configurable alert thresholds. **We are not building them because** they offload the alert-tuning problem to users who lack the data to set thresholds correctly, increasing the work of using the product (P6 anti-pattern). **We would reconsider** never — this is a permanent commitment to algorithmic baseline tuning.

**RJ-7.** We considered streaks and gamification (Duolingo-style retention). **We are not building them because** the product's purpose is to *reduce* monitoring burden, not increase it — and the cohort we're targeting is *exhausted*, not gamified-by-default. **We would reconsider if** retention data unequivocally shows engagement-bait works for the equine cohort — extremely unlikely.

**RJ-8.** We considered in-app vet chat / telemedicine. **We are not building it because** it transforms the company from a product company into a marketplace company, with operational, regulatory, and partnership requirements far beyond MVP scope. **We would reconsider** at 1,000 paid customers if the vet referral channel has proven valuable enough to formalize.

**RJ-9.** We considered predicting overtraining and pre-injury risk for sport horses. **We are not building it because** the predictive accuracy required for trust exceeds what's possible from current sensor data alone, and false positives in this use case cause owners to under-train (the opposite of the value promise). **We would reconsider** when paired with a sports-medicine vet partnership and 12+ months of multi-horse data.

**RJ-10.** We considered importing WhatsApp conversations as a source of structured health observations. **We are not building it because** WhatsApp's export pipeline is fragile and email-in achieves 80% of the value at 5% of the engineering cost. **We would reconsider** if email-in volume validates the underlying behavior (notes being captured ad-hoc) and customers request it.

### Engineering rejections

**RJ-11.** We considered building a native iOS/Android app for MVP. **We are not building it because** the existing Next.js PWA reaches 100 customers without complaint; native is a 3-6 month engineering investment with no validated retention lift. **We would reconsider** when push notification delivery quality on iOS Safari becomes the blocking issue (already a known limitation).

**RJ-12.** We considered building a real-time event pipeline (Kafka, websockets, queues). **We are not building it because** poll-based updates at 30-60 second intervals serve the use case; real-time is premature complexity. **We would reconsider** at 500+ customers if customer feedback specifically requests live dashboards.

**RJ-13.** We considered building the vet PDF as an integrated EHR (electronic health record) export with HL7/FHIR formats. **We are not building it because** vet practice EHR adoption in equine practice is fragmented and minimal; a simple PDF that any vet can read is sufficient. **We would reconsider** when a specific vet practice partnership formally requests EHR integration.

---

## 10.4 Next Actions

**Time-boxed, prioritized. One primary action this week. Two secondary actions. One experiment.**

### 🎯 PRIMARY (this week — by Friday June 27, 2026):
**Conduct 5 switching interviews with horse owners** using the script in `50-switching-interview-script.md`.
- **Target mix:** 2 post-incident owners (Cohort D), 2 yard managers (Cohort B), 1 sport rider (Cohort A).
- **Time-box:** 5 days × 1 interview/day. Each interview ~45 minutes.
- **Success signal:** 5 transcripts captured. At least 3 reveal a trigger event matching H4 (recent incident).
- **Why this is primary:** Falsifies or strengthens assumption A1 (the critical assumption). All Phase 7 bets are downstream.

### SECONDARY (next 14 days):
1. **Phone Equimetre and Hoofstep sales reps to validate sensor wholesale cost (A5).** Time-box: 2 days. Success signal: written quote for both vendors.
2. **Run thread mining from `51-thread-mining-queries.md` across r/Equestrian, COTH forums, and 2 Facebook groups.** Time-box: 3 days. Success signal: 10 high-engagement threads identified with no commercial product mentioned.

### EXPERIMENT (cheapest assumption test):
**Vet outreach micro-test:** Email 10 small-animal/equine vet practices with a short note: *"I'm building a tool that gives owners a vet-shareable health record from a wearable sensor. Would you be willing to review a sample PDF and tell me if you'd find it useful?"* No product reveal yet. Just a format-validation ask.
- **Time-box:** 1 hour to write, 7 days to gather responses.
- **Target signal:** ≥4 of 10 reply within 7 days. Anything less means vet channel needs serious reconsideration.
- **Cost:** ~1 hour of founder time + zero capital.

---

## 10.5 Metrics to Track

### North-star metric (the one number)
**Quarterly net-new paying customers** at 90-day retention.

Not MRR, not signups, not engagement — *retained customers per quarter*. Everything else is a leading indicator of this number. If this moves, the business is alive. If it doesn't, nothing else matters.

### MVP-component kill metrics (from Phase 7, consolidated)

| Bet | 30-day | 60-day | 90-day |
|-----|--------|--------|--------|
| Bet 1 (baseline) | <50% baseline-stable by day 14 | FP rate >35% | FP rate >25% after 2 iterations |
| Bet 2 (alerts) | >15% silence push by day 30 | >10% silence after adjustment | (resolved by 60-day) |
| Bet 3 (morning summary) | <40% open rate | Opener cohort retention <70% | <50% reference summary as core value |
| Bet 4 (vet PDF) | <3 vets validate format | Zero vet referrals | <10% of new signups vet-referred |
| Bet 5 (concierge) | N/A | <50% 60-day retention | Patterns unclear at 50 customers |
| Bet 6 (vet channel) | <20% vet outreach response | <3 vets agreed | <5 vets active, <10 cumulative customers from channel |

### Leading indicators (week 1-2 behaviors)

If on-track:
- ≥4 of 10 vets reply to outreach within 7 days
- 5 of 5 switching interviews completed and reveal recent-incident trigger pattern
- Sensor vendor quotes return within 14 days
- Thread mining surfaces ≥10 high-engagement threads with no commercial mention

If off-track, any single signal means re-read Phase 3 ACH and reconsider H4 before building.

---

## 10.6 Iteration Trigger

Re-run this skill when:
- **Any kill metric crosses its threshold** (Phase 7) — re-run with the failed bet's section rewritten
- **Any high-importance assumption is falsified** by interview or production data
- **A new cohort emerges** that wasn't in Phase 1 (e.g., farriers, equine insurers, riding-school operators)
- **Competitive landscape shifts** (Garmin Blaze launches with health features; a well-funded VC-backed competitor enters)
- **90 days have passed** since this artifact — staleness floor

---

## 10.7 Variants surfaced — see `99-variants.md`

Two strategically distinct paths emerged from the analysis. The artifact does not recommend one over the other without first running the switching interviews — because the choice is information-dependent.

- **Variant A:** Direct-to-consumer hardware-light, target Cohort C (performance-curious sport rider) — the demo's instinctive audience.
- **Variant B:** Concierge-service, vet-channel, target Cohort D + Cohort B (post-incident owners + small yards) — the artifact's analytical recommendation.

See `99-variants.md` for full framing of each, primary risks, kill metric differences, and the asymmetric advantage each best leverages.

---

## Closing note

This artifact's job is not to tell the founder what to build. Its job is to **make the bets visible, the rejections explicit, and the assumptions testable**. Every claim that mattered has been flagged as falsifiable. Every component to be built carries its own kill metric. Every excluded option has a reason and a re-consideration trigger.

The single most important sentence in this document, repeated for emphasis:

> **The single highest-priority action this week is not building anything new — it is running 5 switching interviews and the 30-vet email outreach.**

If those activities are not completed before bet investment begins, this entire document is theory.
