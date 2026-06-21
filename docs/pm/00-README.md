# Carrot Watch — Product Discovery Artifact

**Author:** Virtual PM (adversarial review)
**Date:** 21 June 2026
**Status:** First-pass discovery document — pre-validation
**Reading order:** 00 → 10, then `99-VARIANTS.md`

---

## What this artifact is — and what it isn't

This is a structured product-thinking artifact for Carrot Watch, an equine preventive health platform currently shipped as a frontend-only investor demo (in `/frontend`). It exists to **pressure-test the product hypothesis** before the team commits engineering capacity to a real backend, hardware partnerships, or paid acquisition.

It is **not** a roadmap. It is not a pitch deck. It is a falsifiable plan with kill metrics.

The artifact treats every claim about user behavior as a hypothesis until evidence is named. Every component of the proposed MVP is encoded as a formal bet with a 30/60/90-day kill metric. Every excluded option is documented in the Rejection Log so future contributors can see what was *decided against*, not just what was decided.

---

## ⚠️ Evidence caveat (read before believing anything below)

This skill was executed in an offline environment. Web search was unavailable. Every `[QUOTED]` or `[OBSERVED]` flag in this document refers to **plausible secondhand evidence** the author has encountered in equestrian publications, vet forums, and prior wearable-product reviews — but **none of it has been freshly verified for this artifact.**

The founder must treat every evidence flag in this document as `[ASSUMED]` until validated through the switching interview script (`50-switching-interview-script.md`) and the community thread mining queries (`51-thread-mining-queries.md`). The entire artifact has been written **assuming the user has not yet talked to 10 horse owners.** If they have, every section needs to be re-graded with their actual transcript evidence.

This is itself an asymmetric advantage: the team can validate cheaply and quickly. But it must happen before any of the bets in `07-mvp-bet-encoding.md` are committed to.

---

## Table of contents

| # | File | What's in it |
|---|------|--------------|
| 00 | `00-README.md` | This index |
| 01 | `01-phase0-intelligence.md` | Status quo map, asymmetric advantage audit, weak signal scan |
| 02 | `02-phase1-cohorts.md` | 4 situation-anchored cohorts + switching interview reconstructions |
| 03 | `03-phase2-pain-scenarios.md` | 10 narrative-transported pain scenarios + ODI restatements |
| 04 | `04-phase3-core-problem-ach.md` | 6 problem patterns + ACH adversarial test per pattern |
| 05 | `05-phase4-requirements.md` | MUST/NICE/AVOID requirements with assumption audit |
| 06 | `06-phase5-journey.md` | User journey with stakes + OODA tempo score |
| 07 | `07-phase6-ux-audit.md` | UX interventions traced to pain (or rejected) |
| 08 | `08-phase7-mvp-bets.md` | MVP components as formal bets with kill metrics + AI contract + pre-mortem |
| 09 | `09-phase8-technical-blueprint.md` | Technical plan as mission-type orders + cycle time analysis |
| 10 | `10-phase9-self-critique.md` | Anti-sycophancy check, banned phrase scan, weak-flag rewrites |
| 11 | `11-phase10-completion-report.md` | Decisions log, assumptions list, **rejection log**, next actions, metrics |
| 50 | `50-switching-interview-script.md` | Field-ready 5-question script for horse owners |
| 51 | `51-thread-mining-queries.md` | Exact search strings for Reddit, HN, equine forums |
| 99 | `99-variants.md` | Two strategic variants surfaced for founder decision |

---

## How to use this

1. **Read it in order once.** It's structured so each phase builds on the previous one. The bets in Phase 7 don't make sense without the pains in Phase 2, and the pains don't make sense without the cohorts in Phase 1.

2. **Then re-read the Rejection Log first.** That tells you what strategic choices were made. Disagree with any of them? That's the conversation worth having.

3. **Run the switching interview script** (file 50) with 5 horse owners before committing to any bet in Phase 7. Estimated time: 6 days for 5 calls. Estimated cost: $0–$200 (gift cards optional but recommended for completion rates).

4. **Re-run this skill** when (a) you have 5+ switching interview transcripts, (b) any kill metric crosses its threshold, or (c) 90 days have passed.

---

## One-line summary

Carrot Watch is a bet that **horse owners will pay €15–30/month per horse for early warning of health deviations** — but the artifact concludes that the *active sport-rider and breeder/yard-manager* segments are the only ones where the willingness-to-pay evidence is plausible enough to justify hardware-product investment, and the *anxious recreational owner* segment (which the founder's instinct gravitates toward) is the **hardest** segment to monetize because their stake on failure is emotional rather than financial.

The recommended path is a Concierge-MVP service for sport riders and breeders, using off-the-shelf wearable sensors (e.g., Equimetre, Hoofstep) re-packaged with Carrot Watch's baseline engine and alert UX, rather than building hardware. This deferred-hardware path is detailed in **Variant B** of `99-variants.md`. Variant A is the founder's original direct-to-consumer hardware path with its risks made explicit.

The single highest-priority action for this week is **not building anything new** — it is running 5 switching interviews and 3 days of community thread mining. Those activities are scoped in files 50 and 51.
