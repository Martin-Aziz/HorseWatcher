# Switching Interview Script

**Purpose:** Validate or falsify assumption A1 — *"Buyers will be in the 90-day post-incident window"* — and gather raw customer language for everything else.

**Target:** 5 interviews this week. Mix:
- 2 owners whose horse had a colic / laminitis / surgery / Cushing's diagnosis within the last 18 months (Cohort D)
- 2 boarding-yard managers or small-stable owners (Cohort B)
- 1 competition rider (Cohort A — for negative control: do they describe the same triggers?)

**Time:** 45 minutes per call. Recorded with consent. **No incentives** at first (you want people who care enough to talk for free — they're the early adopters); offer €25 Amazon voucher if response rate is low.

---

## Format rules

- **Open-ended questions only.** No leading. No "would you use a product that does X?"
- **Listen for the timeline.** When did they first notice the problem? What changed?
- **Probe for the specific moment.** "Tell me about a specific time..." not "in general, what's hard?"
- **Don't pitch.** Not once. They will ask what you're building. Say "I'm trying to understand the problem before I build anything specific. Can I tell you more after the interview?"
- **Record the exact words.** "He seemed off" is a quote. Their vocabulary is the moat.

---

## The 5 questions

### Q1 — Triggering moment (target: the H4 falsification)

> "Take me to the moment you first felt that you wanted a better way to monitor your horse's health. What was happening?"

**What to listen for:**
- Recent incident (colic, surgery, injury) → supports H4
- Vague "always wanted this" → does not support H4; flag
- Specific competition or training event → Cohort A pattern
- Multi-horse responsibility → Cohort B pattern

**Probe:**
- "What were you doing at that moment?"
- "When was that, roughly?"
- "Did you do anything about it that week, or did the moment pass?"

---

### Q2 — Current workaround (operation-level specificity)

> "Walk me through what you do today to keep track of your horse's health. Start with this morning."

**What to listen for:**
- Phone photos of thermometers / weight scales
- Notebook entries
- WhatsApp threads with yard or vet
- Stable cameras (which brand?)
- Visual checks (how often, what for?)

**Probe:**
- "And when something looks off — what's the next step you take?"
- "Have you ever tried using an app for this? What happened?"
- "When you talk to your vet, how do you remember what you've seen?"

**Critical:** This question tests whether the WhatsApp/photo workaround (Pattern P4) is real and observable. If it is, the misbehavior-mined scenarios are validated.

---

### Q3 — The last vet visit

> "Tell me about the last vet visit for this horse — the one beyond a routine vaccination. Walk me through how you decided to call the vet and what happened."

**What to listen for:**
- The exact decision process for "call vs. wait" (validates Pattern P5)
- Whether they had information they wished was structured
- The cost of being wrong (false alarm vs. missed emergency)
- Whether they remember the vet asking questions they couldn't answer

**Probe:**
- "Did you wish you'd had something to show them?"
- "Did you delay the call because you weren't sure?"
- "Did you call earlier than you needed to, just in case?"

---

### Q4 — The thing that wakes them up at night

> "Is there a specific thing you worry about with this horse that wakes you up at night, or that you can't stop checking on?"

**What to listen for:**
- The unobserved window (Pattern P1)
- The post-incident hyper-vigilance (Cohort D)
- The yard-manager weight of responsibility (Cohort B)
- Or — if no specific worry — they may not be in the buying segment

**Probe:**
- "What do you do in those moments?"
- "Has anything ever happened that made you wish you'd checked more often?"

---

### Q5 — The "magic wand" question (LAST — only after they've told their story)

> "If you could wave a magic wand and have a single thing told to you about your horse every morning, what would it be?"

**What to listen for:**
- "If he had a quiet night" (validates Bet 3 — morning summary)
- "If anything was different" (validates Pattern P1)
- "His training readiness" (Cohort A)
- "Which one to check first" (Cohort B)

**This is the only solution-shaped question.** It's late in the interview so it doesn't bias the rest. Their answer is your product brief — in their words.

---

## Wrap-up

- Ask: "Is there anything you wish I'd asked about that I didn't?"
- Tell them: "I'm building a tool that listens to a wearable sensor and gives you a baseline-driven health view. Can I show it to you in 4-6 weeks once it's further along?"
- **Get permission to follow up.** They become your first beta cohort.

---

## After each interview — write within 24 hours

A one-page write-up:

```
INTERVIEW #__
Date / time / channel:
Cohort guess (A/B/C/D):
Triggering moment (Q1 verbatim):
Cohort signal (recent incident? yes/no/partial):
Workaround inventory (Q2 specifics):
Vet visit narrative (Q3 highlights):
Sleep-worry (Q4):
Magic wand (Q5 verbatim):

3 EXACT QUOTES to keep:
1.
2.
3.

DECISION CHANGES from this interview:
(Did anything in the artifact need to be re-considered based on this conversation?)
```

---

## Threshold for re-running this skill

If after 5 interviews:
- **<3 are post-incident**, assumption A1 is weakened; the H4 hypothesis from Phase 3 ACH may be wrong. **Re-run this skill** with the updated cohort framing.
- **3+ describe Pattern P4 (ad-hoc photo/note capture)** in Q2, the misbehavior mining is validated and Bet 4 (vet PDF) becomes higher-confidence.
- **3+ describe Pattern P3 fatigue** (silenced alerts, ignored cameras), Bet 2 (multi-gate alerts) is validated as the most-load-bearing bet.
- **0-1 describe Pattern P1 (overnight worry)**, the entire core hypothesis is shaky and needs reconsideration.

---

## Sample outreach copy (for finding interviewees)

For Reddit / Facebook horse groups:

> Hi — I'm working on a project around how horse owners track their horse's health, especially after a colic or other vet event. Looking to chat with 3-5 people who've been through something like that in the last year or so. 45 mins, completely informal, no sales pitch — I'm trying to understand the problem before building anything specific. If that's you, DM me. Happy to share what I learn afterward.

For vet practice newsletters (asking the practice to forward):

> A startup is researching how horse owners would value a wearable health monitor after a vet event. They're looking to interview owners (45 min, no obligation). If you'd like to be connected, reply to this email.

For LinkedIn / equine-industry connections:

> Quick ask — I'm doing customer research for an equine health monitoring concept. Looking specifically for boarding-yard managers and breeders who watch a lot of horses. Would you have 45 minutes for a no-pitch conversation, or know someone who would?
