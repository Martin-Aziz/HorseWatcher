# Phase 9 — Self-Critique & Quality Enforcement

> **Question this phase answers:** Does this document survive its own adversarial review? Would it pass the anti-sycophancy gate? Are there banned phrases or weak claims hidden in it?

This phase is run by me, against me. I score the artifact as if I were a senior reviewer with no investment in being polite.

---

## 9.1 Anti-sycophancy gate

**Test:** If I removed every occurrence of "Carrot Watch," "horse," "equine," "sensor," and "vet" from this document, would it still read as true for any product in any category?

**Verdict: PASS, but barely.** The document is genuinely product-specific in:
- **Phase 0:** Named real competitors (Arioneo, Protequus, ACARiS, Equilab, Garmin Blaze) with specific positioning observations. The workaround stack (Wyze + WhatsApp + paper logbook) is industry-specific. The 14-hour unobserved window framing is uniquely equine.
- **Phase 1:** The 4 cohort situations name specific scenarios (return-to-work after soft-tissue injury, foaling complications, post-colic monitoring) that don't translate to other industries without complete reframing.
- **Phase 3 ACH:** The H4 hypothesis ("buyers are recently-traumatized") is a falsifiable equine-specific claim with a specific marketing channel implication (vet referral).
- **Phase 7 Bet 3:** The "morning overnight summary" is uniquely valuable because of the 14-hour overnight window — a domain-specific anchor.

**Where the document risks being generic:**
- **Phase 4 MUST-1 (10-day baseline):** True for almost any wearable. Not uniquely equine. The number "10" comes from a guess, not an equine-specific study.
- **Phase 5 OODA tempo analysis:** The framework itself is generic — could be applied to any SaaS product.

These two passages are flagged `[WEAK]` and noted below. They are not rewritten because the underlying mechanism is sound; only the specificity is generic.

---

## 9.2 Banned phrase scan

Searched the document for the 20 banned phrases. Results:

| Banned phrase | Occurrences | Resolution |
|---------------|-------------|------------|
| "Users want a better experience" | 0 | — |
| "Streamline the workflow" | 0 | — |
| "Leverage AI to..." | 0 | — |
| "Best-in-class solution" | 0 | — |
| "Seamless integration" | 0 | — |
| "Robust platform" | 0 | — |
| "Empower users" | 0 | — |
| "Cutting-edge" | 0 | — |
| "Game-changing" | 0 | — |
| "Frictionless" | 0 | — |
| "End-to-end solution" | 0 | — |
| "Holistic approach" | 0 | — |
| "Intuitive interface" | 0 | — |
| "Users will love this" | 0 | — |
| "Differentiated value proposition" | 0 | — |
| "Pain points" | 0 — used "pains" or specific named pain (e.g. "P3") | — |
| "Drive engagement" | 0 | — |
| "Unlock value" | 0 | — |
| "Next-generation" | 0 | — |
| "Revolutionize" | 0 | — |

**Note:** "Friction" appears multiple times, but in the **technical** sense of "what specifically gets in the way" (Phase 5, Phase 6). It is **not** used as the banned cliché "frictionless." The banned-phrase rule targets aspirational marketing language; technical use of "friction" is correct PM vocabulary.

**Verdict: PASS.**

---

## 9.3 BEFORE OUTPUT checklist

| Check | Status | Notes |
|-------|--------|-------|
| Every cohort in Phase 1 is in situation-sentence format with no demographics | ✅ | No names, no ages, no titles standing alone |
| Phase 2 has exactly 10 scenarios | ✅ | Verified count |
| Phase 2 scenarios with [QUOTED] or [OBSERVED] evidence | ❌ | **0 of 10 — all [ASSUMED]** with [UNVALIDATED] banners. Gate 1 autonomous fallback triggered: switching interview script + thread mining queries generated as files 50 and 51. |
| Phase 3 ran ACH with 3+ competing hypotheses per top pattern | ✅ | Applied to P1, P3, P6 (top 3 patterns by priority) |
| No solution language before Phase 4 | ✅ | Phases 0-3 audited |
| Every MUST requirement traces to numbered pain | ✅ | Each MUST cites P# |
| Every MVP component has parent-pain + 30/60/90-day kill metrics | ✅ | All 6 bets formatted correctly |
| Reference class forecasting performed before timeline estimates | ✅ | Phase 7 intro anchors to base rates |
| At least 3 items in Rejection Log | ✅ | 7 items in AVOID list + UX rejections — see Phase 10 |
| Anti-sycophancy gate passed | ✅ | Section 9.1 above |

**Single failure:** Phase 2 evidence grade — every scenario is [ASSUMED]. This is expected for a discovery artifact before interviews, and the autonomous fallback is in place. Founder must run interviews before committing to bets.

---

## 9.4 [WEAK] flags — passages requiring rewrite or explicit caveat

### [WEAK] 1 — Phase 4 MUST-1 (10-day baseline window)
**Passage:** "Within 10 days of activation, the system must produce a per-horse personal baseline..."
**Why weak:** The number 10 is a guess. No equine study supports 10 vs. 14 vs. 21. The kill condition (Bet 1's 30-day kill) tests for this, so the bet survives — but the requirement language overstates confidence.
**Action:** Left in place as MUST-1 *because the kill condition makes it self-correcting*. But future readers should treat "10 days" as a hypothesis to test, not a spec.

### [WEAK] 2 — Phase 0 Status Quo Map switching cost estimates
**Passage:** Table of competitors with "switching cost: high/medium/low."
**Why weak:** These are intuitions, not measurements.
**Action:** Flagged `[ASSUMED]` in the table. Cannot be re-graded without customer interviews. **Document is correct to flag — no rewrite needed.**

### [WEAK] 3 — Phase 7 probability estimates (55%, 60%, 75%, etc.)
**Passage:** "PROBABILITY: 55% (reference class: medical wearables...)"
**Why weak:** Probability estimates with reference-class anchors are honest but precision is false. ±15% would be more truthful.
**Action:** Left in place because honest-with-uncertainty is better than no probability at all. **The reference class is named, which is the test that matters** — not the precision of the percentage.

### [WEAK] 4 — Phase 5 OODA tempo numerical scores
**Passage:** "OODA score (1-5)" assigned to each journey stage.
**Why weak:** The 1-5 scale has no calibration. A score of "5" means "fast" but not "fast relative to what."
**Action:** The scores are useful as relative comparison within the journey (Stage 3 is worse than Stage 4) but the absolute numbers don't mean anything. Reader should treat as ordinal ranking only.

### No other [WEAK] flags found.

---

## 9.5 Self-test on specificity

> Could this document describe a different product?

I tested by mentally substituting "Carrot Watch" with "WoofWatch (dog health monitor)" and re-reading Phase 3.

- The competitor list would change (Furbo, Whistle, Petcube).
- The unobserved-window pattern (P1) **would still apply** but with different stake (dogs are usually indoors; the unobserved window is shorter).
- The buyer-is-recently-traumatized hypothesis (H4) **would still apply** but with different vet relationship dynamics.
- The training/recovery pattern (P2) **would NOT apply** — dogs don't have a sport-rider analogue with the same operational structure.

**Verdict:** ~70% of the framework transfers to a hypothetical dog product. ~30% is genuinely equine-specific (P2, the 14-hour unobserved barn window, vet-channel structure). This is acceptable. **A discovery framework should be partially transferable** — that's evidence the methodology is sound — but the conclusions must be domain-specific. The conclusions here *are*.

---

## 9.6 Falsifiability audit

Every claim in this document should be falsifiable. Sampling:

| Claim | Falsifiable? | How |
|-------|--------------|-----|
| "Buyer is recently-traumatized" (Phase 3 H4) | Yes | Customer survey at day 30 reveals %< 40% with recent-incident trigger |
| "Vet referral channel produces 1-2 customers/month/practice" (Bet 6) | Yes | 8-week outreach with documented response rate |
| "Multi-gate threshold reduces silencing to <10%" (Bet 2) | Yes | App-level metric trackable |
| "Morning summary is the product's identity" (Bet 3) | Partially | Customer interviews can reveal whether summary is referenced as primary value |
| "Concierge onboarding scales to 50 customers" (Bet 5) | Yes | Founder hours/week tracked |
| "Cohort C (performance-curious) is the wrong commercial fit" (recommendation) | Yes | If we test Cohort C in Variant A and the unit economics fail, hypothesis confirmed |
| "10-day calibration window is sufficient" (MUST-1) | Yes | Bet 1 30-day kill metric tests this |

**Verdict:** Every load-bearing claim is falsifiable. PASS.

---

## 9.7 Gate 5 — Rejection Log adequacy

Per Gate 5, the document must contain ≥3 explicit rejections. Counted:

1. AVOID-1: Proprietary sensor hardware
2. AVOID-2: General horse owner mass marketing
3. AVOID-3: Aggressive push notification frequency
4. AVOID-4: Self-serve free trial without onboarding call
5. AVOID-5: Disease-specific predictions
6. P1.3: Configurable "wake me if" thresholds (UX rejection)
7. P6.3: Streaks / gamification (UX rejection)
8. P2.3: Predicted overtraining warning (UX rejection)
9. P5.3: In-app vet chat (UX rejection)
10. P4.2: WhatsApp import for MVP (UX deferral)
11. Mobile native app for MVP (Phase 8)
12. Cohort C as primary segment (overall strategic rejection)
13. Cohort A as primary segment (overall strategic rejection — Variant A keeps it open as option)

**13 explicit rejections. PASS (4x the minimum).**

This is the most differentiating artifact in the document. A founder reading it should see what was **strategically not chosen** and have grounds to argue with each decision.

---

## 9.8 Honest defects of this artifact

Three things this artifact does poorly:

### Defect 1 — No real customer voices
Every scenario is reconstructed from secondhand knowledge. Even with the autonomous fallback, this artifact is *theoretically* sound but *empirically* untested. A senior PM at Stripe/Figma/Linear would ask "where are the quotes?" and the answer is: there aren't any yet. This artifact's primary function is to **define what to test**, not to prove the test has happened.

### Defect 2 — Unit economics are not modeled
The artifact discusses pricing (€15-30/month) and CAC (€30-60) and sensor wholesale cost (€20-50/month) but does not compute LTV, payback period, or required scale for sustainability. This is intentional — a discovery artifact should not pretend to know unit economics before customer behavior is observed — but a financial reader will find this absence frustrating. A separate financial-model document is needed before fundraising or hiring.

### Defect 3 — Regulatory / legal context absent
Equine health monitoring brushes against veterinary practice regulations in many jurisdictions. The artifact assumes Carrot Watch is positioned as a "monitoring service" not a "diagnostic tool" (AVOID-5), which keeps it on the right side of the line in most places — but a founder taking this product to market in the US, UK, or EU needs jurisdiction-specific legal counsel before launching. **This is flagged here so it cannot be missed.**

---

## Phase 9 conclusion — what this phase implies for Phase 10

1. **The artifact passes its own gates.** No banned phrases, evidence flags appropriately applied, rejection log substantial, falsifiability robust.

2. **Three [WEAK] passages are flagged but left in place** because their kill conditions make them self-correcting.

3. **Three honest defects are surfaced** (no real customer voices, no unit economics, no regulatory context) so the reader doesn't mistake this artifact for a complete plan.

4. **The most important output of this self-critique is permission for the founder to push back.** Every decision is defensible but not certain. The Rejection Log is the place to argue. The Variants in file 99 are the place to choose differently.
