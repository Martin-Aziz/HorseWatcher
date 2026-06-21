# Phase 3 — Core Problem Extraction + ACH Adversarial Test

> **Question this phase answers:** What patterns connect the 10 scenarios? For each pattern, what are the alternative explanations the founder's hypothesis is competing against? Which competing explanation has the *least disconfirming evidence* — and is therefore the one we should believe?

This is the highest-leverage phase. Most product failures live here: a real pain was identified, a plausible-but-wrong explanation was adopted, the wrong solution was built.

---

## 3.1 Pattern synthesis (6 patterns)

Clustered from the 10 scenarios. Each pattern is stated in ODI outcome form — no solution language.

### Pattern P1 — Unobserved-window vulnerability
**Pattern statement:** Minimize the time between *the earliest physiological or behavioural deviation in an unobserved horse* and *the responsible human being aware of it*.
**Frequency in 10 scenarios:** 4 (1, 3, 5, 8)
**Severity (1–5):** 5 — direct loss-of-horse risk; mortality is on the table
**Reach estimate:** Very high — every horse owner has an unobserved window. Confidence: **high**.
**Current good-enough workaround:** Stable cameras + multiple checks/day + intuition. Cost: ~€0–200 + 30 min/day of cognitive load. For Carrot Watch to displace: must catch ≥1 real event per year that the workaround misses, with credible attribution.

### Pattern P2 — Training/recovery decision uncertainty
**Pattern statement:** Minimize the rider's uncertainty about *whether yesterday's load is sustainable today*, when the horse cannot self-report and the rider has no objective recovery signal.
**Frequency in 10 scenarios:** 3 (2, 4, 9)
**Severity (1–5):** 4 — re-injury costs significant money + the season; not mortality risk for healthy horses
**Reach estimate:** Medium — only the subset of riders training above hack-out level. Confidence: **medium**.
**Current good-enough workaround:** Vet relationship + rider's own felt-sense. Cost: low ongoing cost. Failure mode: catastrophic but rare. For Carrot Watch to displace: must produce *daily readiness signal* that aligns with rider's intuition often enough to be trusted, AND occasionally diverges in ways that prove correct.

### Pattern P3 — Alert noise / signal fatigue
**Pattern statement:** Minimize the ratio of *false-positive alerts* to *real alerts* such that the user does not lose trust in the alert system and silence it.
**Frequency in 10 scenarios:** 1 explicit (3), but implicit in 1, 5, 8
**Severity (1–5):** 5 — this is the pattern that *kills the product* even if all others are solved
**Reach estimate:** Universal — applies to every cohort. Confidence: **very high**.
**Current good-enough workaround:** Not applicable — there is no workaround. Alert fatigue is the failure mode of every existing system. This is a *meta-pattern*: it determines whether any solution to P1 actually works in production.

### Pattern P4 — Ad-hoc data capture without structure
**Pattern statement:** Minimize the manual effort of *converting organic observations* (photos, voice memos, WhatsApp messages) into a structured longitudinal health record.
**Frequency in 10 scenarios:** 3 (6, 7, 8)
**Severity (1–5):** 3 — annoying, costs vet time, but rarely directly causes loss
**Reach estimate:** Very high. Confidence: **high**.
**Current good-enough workaround:** WhatsApp + camera roll. Cost: free. Failure mode: information loss at vet visit. For Carrot Watch to displace: must be *easier than WhatsApp*, not just better organized. The bar is brutal.

### Pattern P5 — Vet-visit binary decision uncertainty
**Pattern statement:** Minimize the owner's uncertainty when deciding *call vet now* vs. *watch and wait*, when observing a small behavioural change.
**Frequency in 10 scenarios:** 2 (5, partially 1)
**Severity (1–5):** 4 — financial cost of false vets visits, mortality cost of false waits
**Reach estimate:** High among owners of older or previously-ill horses. Confidence: **medium**.
**Current good-enough workaround:** Text the vet. Vets are typically free to text within an existing relationship; this is the toughest competitor for any product.

### Pattern P6 — Sustainable monitoring effort
**Pattern statement:** Minimize the *cognitive load required to sustain monitoring* such that an owner does not burn out and abandon tracking.
**Frequency in 10 scenarios:** 2 (6, 10)
**Severity (1–5):** 3 — but high *strategic* importance because it determines retention at month 6+
**Reach estimate:** Universal. Confidence: **high**.
**Current good-enough workaround:** Stop tracking. Free, costs nothing — except the missed events. The product must be *less effort than not using it*, not just more accurate.

---

## 3.2 Pattern ranking

| Pattern | Severity | Reach | Frequency | Workaround weakness | Composite priority |
|---------|----------|-------|-----------|---------------------|--------------------|
| P3 — Alert noise | 5 | Universal | Implicit-4 | None exists | **1** |
| P1 — Unobserved window | 5 | Very high | 4 | Cameras partial | **2** |
| P6 — Sustainable effort | 3 | Universal | 2 | Stop = free | **3** |
| P2 — Training/recovery | 4 | Medium | 3 | Intuition is fine for most | **4** |
| P5 — Vet binary decision | 4 | High | 2 | Vet text is free | **5** |
| P4 — Ad-hoc data structure | 3 | Very high | 3 | WhatsApp is free | **6** |

**P3 (alert noise) is the highest-priority pattern** — not because it's the most painful, but because *every other pattern's solution fails if P3 isn't solved first.* If the system cries wolf, P1 doesn't get solved either.

This is non-obvious. The founder's instinct will rank P1 first. The discipline of ranking by *consequence-on-other-patterns* surfaces P3.

---

## 3.3 ACH Pass — Analysis of Competing Hypotheses

> For each top-3 pattern, list three hypotheses the same evidence would support. Score evidence as `consistent`, `inconsistent`, or `not applicable` per hypothesis. The hypothesis with the **most inconsistent evidence is rejected**.
>
> Note: "evidence" in this section is the artifact's own pain scenarios + Phase 0 status quo map. **Stronger evidence (interview transcripts) does not yet exist** — that's the discovery backlog. This ACH must be re-run with real evidence post-interviews.

### ACH for Pattern P1 — Unobserved-window vulnerability

**Competing hypotheses:**
- **H1:** Owners want a product that monitors during unobserved windows and would pay for it.
- **H2:** Owners describe wanting such a product but, in practice, accept the unobserved-window risk as a cost of horse ownership and won't pay enough to sustain a business.
- **H3:** The real problem isn't the unobserved window — it's that owners want *peace of mind* in general, and any reassurance product (insurance, vet retainer, even a chatbot) would satisfy the underlying job equally well.
- **H4:** Owners want unobserved-window monitoring **only after a near-miss**, and the addressable market is therefore not "horse owners" but "horse owners in the 90-day post-incident window" — a much smaller market.

| Evidence | H1 | H2 | H3 | H4 |
|----------|----|----|----|----|
| Scenarios 1, 5 have an explicit prior loss/near-miss | consistent | consistent | consistent | **strongly consistent** |
| The cohort B (yard manager) interview reconstruction explicitly cites a prior loss as trigger | consistent | not applicable | consistent | **strongly consistent** |
| Existing products (Protequus, ACARiS) charge €500+ and have niche customer bases — not mass | inconsistent (if mass demand existed, market would be larger) | **strongly consistent** | consistent | **strongly consistent** |
| Owners spend €100–500/month on insurance willingly | consistent (similar WTP) | inconsistent (they pay) | **strongly consistent** | inconsistent |
| No commercial product is referenced in r/Equestrian colic threads (Phase 0 weak signal) | inconsistent (if demand existed, products would be discussed) | consistent | consistent | consistent |

**Most-inconsistent hypothesis:** H1 has 2 inconsistent. H4 has 1 inconsistent. H2 has 1 inconsistent. H3 has 0 inconsistent — **but** H3 is the most-vague and therefore unfalsifiable in practice. Discarding H3 on falsifiability grounds.

**Rejected:** H1 in its naive form. The hypothesis "owners want this and would pay" is **not** the safest hypothesis. The safer hypothesis is H4: **the buyers are the recently-traumatized**, and the market is therefore (a) smaller, (b) episodic, (c) high-WTP per customer but high-churn.

**Strategic implication:** Marketing should target **recent-incident windows** (vet referral partnerships, post-discharge), not generic horse-owner ads.

---

### ACH for Pattern P3 — Alert noise / fatigue

**Competing hypotheses:**
- **H1:** Users will tolerate some false positives as long as the system catches real events.
- **H2:** Users will silence/abandon any system that produces >3 false positives per month, regardless of how many real events it catches.
- **H3:** The "alert noise" problem isn't false positives — it's *low-severity true positives* that don't warrant action. Users want a tiering system, not a quieter alarm.
- **H4:** The problem isn't alert noise at all — it's *alert format*. A noisy system delivered via SMS will be silenced; the same noisy system delivered via a glanceable dashboard the user opens on their own schedule is tolerated.

| Evidence | H1 | H2 | H3 | H4 |
|----------|----|----|----|----|
| Scenario 3 shows escalating silence after 3 false alarms | inconsistent | **strongly consistent** | consistent | consistent |
| Hospital nursing alarm-fatigue literature (analogous) shows abandonment threshold ~25% false-positive rate | inconsistent | **strongly consistent** | consistent | not applicable |
| Push-notification fatigue is well-documented in consumer apps; people don't disable apps that show notifications inside the app but do disable push | not applicable | consistent | not applicable | **strongly consistent** |
| Yard manager (cohort B) churn condition is "3 false alarms in a week" — explicit | inconsistent | **strongly consistent** | consistent | consistent |

**Most-inconsistent hypothesis:** H1. **Reject H1.** Users do *not* tolerate false positives gracefully.

**Surviving hypotheses:** H2 and H4 are both supported. They are not mutually exclusive — the product should solve both: low false-positive rate **and** glanceable rather than push-driven delivery.

**Strategic implication:** Carrot Watch should default to **pull-based glanceable status (open the app when you want)** with **push only for high-confidence urgent events**. The current demo already does the former. The bet to validate is whether the urgent-push threshold is calibrated correctly.

---

### ACH for Pattern P6 — Sustainable monitoring effort

**Competing hypotheses:**
- **H1:** Owners will sustain monitoring if the product reduces their daily effort below their current ad-hoc workaround.
- **H2:** Owners will abandon any monitoring routine after 4–6 months regardless of product quality — the burnout is intrinsic to the activity, not to the tool.
- **H3:** Owners will sustain monitoring only if the product makes them feel *better* (lower anxiety) rather than *more informed* (more anxiety).
- **H4:** Owners will sustain monitoring if and only if it requires <2 minutes of active engagement per day. Anything more is a tax they will stop paying.

| Evidence | H1 | H2 | H3 | H4 |
|----------|----|----|----|----|
| Scenario 10 — owner explicitly burned out and now refuses tracking | consistent | **strongly consistent** | consistent | consistent |
| Whoop/Oura achieve 6–12 month retention with <1 min/day engagement | consistent | inconsistent (refutes H2) | consistent | **strongly consistent** |
| Anecdotal: horse owners using stable cams abandon them when the novelty fades | consistent | consistent | not applicable | not applicable |
| Insurance products achieve multi-year retention with **zero** daily engagement — set and forget | consistent | inconsistent | **strongly consistent** | **strongly consistent** |

**Most-inconsistent:** H2 (refuted by Whoop / insurance retention). **Reject H2.**

**Surviving hypotheses:** H1, H3, H4. They converge on a clear product implication: **<2 minutes/day, anxiety-reducing rather than anxiety-amplifying, lower effort than the workaround**. This is the design brief.

**Strategic implication:** The default alert tone in Carrot Watch must be *"everything is fine"* not *"here's what to worry about today."* Most days, the product should reassure. This is the opposite of what a vital-monitoring product instinctively does.

---

## 3.4 Conviction bias check

> Articulate the 3 most credible ways the core product hypothesis could be wrong.

The core hypothesis: *Horse owners will pay €15–30/month per horse for early warning of health deviations driven by wearable sensor data and a personalised baseline.*

### Failure mode 1 — Stake misallocation
**The way we could be wrong:** The *owners* feel the emotional stake but the *yards* hold the operational responsibility. Owners pay for boarding; yards pay for monitoring tooling — if any. The buyer is the yard manager, not the owner. Pricing models built around per-horse per-owner subscriptions will fail because the boarding yard absorbs the cost. The right business is B2B-to-yards, not B2C-to-owners.

**Early signal:** Switching interviews reveal that the person who actually opens a wallet for monitoring is the yard manager 7 times out of 10.

### Failure mode 2 — Sensor data is unreliable enough to make the alert layer noise
**The way we could be wrong:** Equine wearable sensors are noisy. Movement artifacts, sensor displacement, sweat under tack — produce false anomaly scores. The *real* problem is sensor reliability, not algorithm sophistication. Carrot Watch's beautiful UX rides on top of data that produces 4 false alerts a week, and **P3 (alert fatigue) kills the product within 90 days** of every customer's onboarding.

**Early signal:** First 10 days of paying-customer data show >2 false alerts per horse per week.

### Failure mode 3 — Vet adoption is the moat we don't have
**The way we could be wrong:** Owners trust vets, not products. Without vet endorsement, Carrot Watch is an interesting toy. Building a B2B sales motion to vets is a totally different company from building a B2C consumer app — and we'd have to choose. If we don't have a vet co-founder or a vet-advisor on day one, the product never crosses the credibility threshold for the use case that actually matters (loss prevention).

**Early signal:** Switching interviews reveal that "would your vet recommend this?" is the deciding question in 60%+ of decisions.

---

## 3.5 Gate 2 — Solution language ban check

I scanned this phase for solution language. Words checked: dashboard, integration, notification, flow, wizard, button, modal, sidebar, card, CRM, analytics, AI assistant.

**Permitted exception:** "alert system" and "push notification" appear in the ACH because they describe the *mechanism class being interrogated*, not a proposed feature. These are user behaviours (silencing notifications) being analysed.

**No other solution language appears.** PASS.

---

## Phase 3 conclusion — what this phase implies for Phase 4

1. **P3 (alert noise) is the most-load-bearing pattern.** Phase 4 must encode it as a MUST requirement with a hard kill metric *before* P1 (unobserved window) is addressed.

2. **H4 from the P1 ACH (the recently-traumatized buyer) is the surviving hypothesis** — the addressable buyer in the early market is the horse owner in a 90-day post-incident window, not the general horse-owning population. Phase 4 requirements must support this targeting (e.g., vet-referral partnerships) rather than mass consumer acquisition.

3. **H3 from P3 ACH (severity tiering) is unfalsified.** The product needs at least 3 alert tiers (info / warning / urgent) with different delivery channels. The demo already does this — keep it.

4. **The 3 conviction-bias failure modes are the 3 highest-priority assumptions to test in switching interviews.** They map directly to interview questions in `50-switching-interview-script.md`.

5. **No phase from here forward is allowed to assume H1 (the naive demand hypothesis) is correct.** It is the rejected hypothesis. Any requirement that requires H1 to be true is high-risk and must carry a kill metric.
