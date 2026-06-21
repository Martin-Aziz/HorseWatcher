# Phase 0 — Intelligence Gathering

> **Question this phase answers:** Before we describe a single user pain, what is the actual context this product walks into? What are users doing right now, what are we structurally able to do that incumbents cannot, and where is demand forming that hasn't yet crystallized?

---

## 0.1 Status Quo Map

The product hypothesis lives or dies on **switching costs**, not feature gaps. The most likely failure mode for Carrot Watch is not "competitors have more features" — it's "the workaround stack is good enough that nobody switches."

### Direct competitors

| Product | What it does well | What it does badly | Switching cost to leave |
|---------|-------------------|--------------------|-------------------------|
| **Arioneo Equimetre** | Strong cardio/locomotion data for training, used by racing yards | Performance-focused, not 24/7 wellness; €1,000+ device | High once embedded in training routine |
| **NIGHTWATCH (Protequus)** | Foaling/colic alarm, real-time emergency detection, vet-trusted | Expensive (~$500 + subscription), narrow use case | Medium — owners keep it as backup even after switching |
| **Garmin Blaze (new)** | Brand trust, wellness/fitness positioning, tail-mounted | Unknown long-term data quality; likely treated as a Garmin accessory, not a health platform | Low (Garmin's brand floor) |
| **Equilab / Equisense / Seaver** | Riding-session tracking, training metrics | Worn during rides only; not continuous; gamified for amateurs | Very low — installed alongside other apps |
| **ACARiS Horse Protector** | Camera + AI, livestream, colic/birth alarms | Stationary camera (stable-bound); not on the horse | Medium — physically mounted infrastructure |

`[ASSUMED]` Feature/price comparisons are from secondhand recall. **Validate against current product pages and Reddit threads before quoting any of this externally.**

### Adjacent competitors (solving 60% of the job through a different framing)

- **Vet telemedicine apps** (Felix Smart, video-call services) — solve "I need expert advice now" but not "I need to know before it's bad."
- **Apple Watch for the rider** — yard managers occasionally wear health-tracking watches *they cross-reference with horse mood* — a workaround behavior we should observe.
- **Stable camera systems** (Wyze cams pointed at stalls) — solve "is the horse still standing at 2am?" cheaply.

### Workaround stacks — the most underestimated competitor

> This is the segment most product founders dismiss. It is usually the largest.

`[ASSUMED]` What the typical conscientious horse owner is doing today:

- Daily visit + visual inspection (often morning + evening)
- WhatsApp group with stable staff: "How was Luna today?"
- Paper logbook or notebook for unusual observations
- Spreadsheet for vet bills, vaccinations, farrier visits
- Stationary camera (Wyze, Nest) for night watch on a flagged horse
- Manually taking rectal temperature when something feels off
- "Trust the yard manager" — outsourcing health observation to whoever runs the barn

This stack costs €0–50/month in tools and ~20 minutes of cognitive load per day. **For Carrot Watch to displace it, the product must be either 10x better at one of these jobs or solve a job none of them solve.**

Most likely candidate for "job none of them solve": **the 14 hours between evening check and morning check, when the horse is unobserved.** That window is the wedge.

### Inertia / non-consumption

Horse owners who do nothing beyond annual vet checkups. This is probably the **largest** segment — anywhere from 50–70% of leisure horse owners globally `[ASSUMED]` — and the **worst** segment to target. They tolerate the pain. They've already decided it's not worth solving. Acquiring them means changing their belief about the problem first, which is a marketing problem more than a product problem.

`[CRITICAL]` The founder's instinct (based on the demo's persona Anna) targets *exactly this segment* — anxious recreational owners. This is flagged as the highest strategic risk in Phase 7.

---

## 0.2 Asymmetric Advantage Audit

To compete with Arioneo (training/race-track focused) and Protequus (vet-channel distribution), the team must do three things they structurally cannot:

### 1. **Ship a behavior change in 48 hours**
Arioneo has hardware certification cycles; Protequus has FDA-adjacent positioning that forces conservative iteration. A solo/small founder can deploy a UI change to web *today* if the alert wording is wrong.

**Constraint:** This advantage evaporates the moment the team builds proprietary hardware. Hardware iteration cycles are months. **Bet implication:** Phase 7 should resist hardware-first thinking.

### 2. **Serve a yard size too small for enterprise sales**
A 3–8 horse boutique dressage barn or private breeder is too small for Arioneo's sales cycle but is exactly large enough to pay €100–300/month for monitoring. This is the market gap.

**Cost of pursuing this:** Concierge-style onboarding (someone literally drives sensors to the yard for the first install). Not scalable in classical SaaS terms — and that is the point. Build a moat through high-touch service before automating.

### 3. **Reverse a major roadmap decision in one meeting**
If "the AI assistant" turns out to be the killer feature and "the live dashboard" turns out to be wallpaper, a solo founder can pivot in 7 days. Garmin cannot.

### 4. **Personally respond to every signup email for the first 90 days**
At 50 paid customers, that's still under 60 minutes a day. The data this generates — *the actual language users describe their horses' health with* — is the moat. No competitor of any size will do this consistently.

### 5. **Run an experiment that would embarrass a brand-name company**
Example: "We sent owners daily SMS summaries hand-written by the founder for 3 months to see what language made them respond" — Protequus would never do this. Solo founder absolutely can.

`[CHECK]` Three asymmetric moves were required minimum. Five named. PASS.

---

## 0.3 Weak Signal Scan

Where is the conversation happening *now* that suggests demand is forming but no commercial solution has crystallized?

`[ASSUMED — must be validated; see file 51 for exact search queries]`

### Communities with high-engagement, low-commercial-solution discussions

1. **r/Equestrian (Reddit)** — frequent posts: "How did you know your horse was colicking before it got bad?" — answers are anecdotes about *gut feel* and *eating slower*. No product is mentioned. **This is the signal.** When a community shares wisdom about a problem and never names a product, the market hasn't been served.

2. **Chronicle of the Horse (COTH) forums** — long threads on senior horse care, weight loss diagnosis, recovery from injury. High thread counts, low product references.

3. **The Stable Mate (Discord/Facebook groups for boarding-barn owners)** — barn managers discussing "what do you do for a horse that drops weight overnight?" `[ASSUMED — verify]`

4. **r/Horses, r/Dressage** — competition-rider segment posting about HRV, recovery, overtraining concerns. **This audience reads athletic-performance literature.** They will understand the value proposition without needing to be educated. Easiest first-customer segment.

### Vocabulary shifts to monitor

- **"Equine HRV"** entering vocabulary from human-athletic-performance world (Whoop, Oura crossover). When recreational riders start using "HRV" naturally in posts, they're primed for a product that visualizes it.
- **"Quiet signs of colic"** — emerging interest in subclinical detection.
- **"Behavioral baseline"** — phrase appearing in vet education content `[ASSUMED]`.

### High-engagement posts with no commercial solution

`[UNVALIDATED — must run thread mining]`

Hypothesis: there exist posts in horse communities with 100+ upvotes describing the exact problem Carrot Watch solves, where the top comments are sympathy + "I started checking on her every two hours" — never a product recommendation. **Finding 3 such threads validates the Phase 2 pains. Not finding them means the pain might be too rare to anchor a business on.**

This is the cheapest experiment in the entire document. See `51-thread-mining-queries.md`.

---

## Phase 0 conclusion — what this phase implies for Phase 1

1. **The workaround stack is the real competitor**, not other products. Phase 1 cohort framing must capture *what they're doing today*, not what they say they wish they had.

2. **The recreational anxious-owner segment** (founder's instinctive target) is the worst commercial fit despite being the most emotionally resonant. Phase 1 cohorts must include at least 2 alternative segments: **competitive sport rider** and **breeder/yard manager**.

3. **The 14-hour unobserved window** is the candidate wedge. Phase 2 pain scenarios must probe this aggressively.

4. **The team's asymmetric advantages collapse if hardware is built in-house.** Phase 7 bet encoding must explicitly consider sensor-hardware-as-rented vs. sensor-hardware-as-built.

5. **Validating weak signals is the highest-leverage action this week.** Not building features.
