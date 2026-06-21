# Thread Mining Queries

**Purpose:** Validate Phase 0 weak signals and Phase 2 pain scenarios by finding **real threads** in public communities where the problems are described in the user's own words — and no commercial solution is mentioned.

**Time budget:** 3 days. ~3 hours/day. Target outcome: 10 high-engagement threads, screen-captured or archived to `docs/pm/evidence/` for permanent reference.

---

## Why this matters

Phase 2's 10 scenarios are 10 of 10 `[ASSUMED]`. The artifact triggered the autonomous Gate 1 fallback. The two cheapest ways to upgrade Phase 2 to `[OBSERVED]` evidence are:
1. **Switching interviews** (file 50)
2. **Thread mining** (this file)

Threads have a unique value: they're **public, persistent, and shareable.** When you eventually pitch this product to investors or partners, "we found 47 threads on r/Equestrian describing this exact pain" is a stronger artifact than "we did 5 interviews and people said this."

---

## Source priority

Ranked by signal density (highest first):

1. **r/Equestrian** (Reddit) — large, active, mixed demographic
2. **r/Horses** (Reddit) — broader, often companion-horse owners
3. **r/Dressage, r/eventing, r/Showjumping** (Reddit) — Cohort A territory
4. **Chronicle of the Horse forums** (chronofhorse.com) — older, more competition-focused
5. **HorseAndHound forums** (UK) — UK-specific terminology, often more breeder-driven
6. **Practical Horseman / EquiSearch** — magazine community sections (lower volume but high-quality)
7. **Facebook groups:** "Senior Horses," "Equine Cushing's Group," "Boarding Barn Owners" — Cohort D and B respectively
8. **Discord:** Equestrian-focused servers (smaller, harder to mine systematically; deprioritize)
9. **YouTube comments** on colic-related vet education videos — surprisingly high signal

---

## Search query strings (copy-paste ready)

### For Pattern P1 (unobserved-window vulnerability)

```
site:reddit.com/r/Equestrian "colic" "found him" night OR morning
site:reddit.com/r/Equestrian "I wish I'd known" colic OR sick OR off
site:reddit.com/r/Horses "checking on him" middle of the night
site:reddit.com/r/Horses "barn camera" colic OR sick OR foaling
site:chronicleoftheforum "should have" colic OR caught earlier
site:reddit.com "stable cam" OR "barn cam" horse what works
```

### For Pattern P2 (training/recovery decision uncertainty)

```
site:reddit.com/r/Dressage "back from injury" return to work
site:reddit.com/r/Equestrian rehab "too soon" lameness
site:reddit.com/r/eventing recovery overtraining "should I"
site:reddit.com "HRV" horse OR equine
site:reddit.com "Equimetre" review OR experience
```

### For Pattern P3 (alert noise — proxy: any monitoring product)

```
site:reddit.com "false alarm" foal cam OR foalert OR stall cam
site:reddit.com "stopped using" barn cam OR foaling monitor
site:reddit.com "Foalert" OR "Equifone" review
```

### For Pattern P4 (ad-hoc data capture)

```
site:reddit.com/r/Equestrian "vet appointment" "couldn't remember" OR "forgot to mention"
site:reddit.com "kept a notebook" horse health
site:reddit.com "horse health app" recommend OR alternative
```

### For Pattern P5 (vet binary decision)

```
site:reddit.com "should I call the vet" horse
site:reddit.com "is this normal" horse not eating
site:reddit.com "didn't want to bother the vet" horse
site:chronicleoftheforum "watch and wait" colic OR off
```

### For Pattern P6 (monitoring burnout)

```
site:reddit.com "burned out" horse owner OR horse worrying
site:reddit.com "checking constantly" horse colic OR sick
site:reddit.com "stopped tracking" horse weight OR exercise
```

### For Cohort D — recently-traumatized owner

```
site:reddit.com "after he colicked" anxious OR worried
site:reddit.com "post-surgery" horse monitor
site:reddit.com "Cushing's diagnosis" management daily
site:reddit.com "near-miss" colic OR foaling
```

### For Cohort B — yard manager / breeder

```
site:reddit.com "boarding barn" night check OR night watch
site:reddit.com/r/Horses "lost a foal" OR "lost a mare" management
site:facebook.com "boarding barn owners" group monitoring
```

### For competitive product/workaround mentions

```
site:reddit.com Arioneo OR Equimetre review experience
site:reddit.com Protequus OR NIGHTWATCH equine
site:reddit.com "Garmin Blaze" horse review
site:reddit.com Equilab OR Equisense OR Seaver review
site:reddit.com ACARiS OR "horse protector" review
```

---

## What to capture for each high-engagement thread

Save in `docs/pm/evidence/threads/thread-NN-shortname.md`:

```markdown
# Thread NN — [short title]

**Source URL:** [link]
**Date posted:** [yyyy-mm-dd]
**Upvotes / engagement:** [N upvotes, M comments]
**Cohort signal:** [A / B / C / D / unknown]
**Pattern:** [P1 / P2 / P3 / P4 / P5 / P6]

**OP excerpt (verbatim):**
> [paste the original post — or the key paragraph]

**Top comments (verbatim, anonymized):**
1. [comment 1]
2. [comment 2]
3. [comment 3]

**Commercial product mentioned?** [Yes — list / No]

**Quote candidates for artifact** (3 sentences worth keeping):
1. "..."
2. "..."
3. "..."

**Phase 2 scenario this validates / contradicts:**
[Scenario #N — strengthens / weakens / unchanged]
```

---

## Acceptance criteria

You're done when you have **10 thread files** distributed roughly as:
- 4 for Pattern P1 (unobserved window) — the highest-priority pattern
- 2 for Pattern P3 (alert noise / monitoring product abandonment)
- 2 for Pattern P5 (vet binary decision)
- 2 for misbehavior mining (P4 — phone photos, WhatsApp transcripts)

If you find **fewer than 5 threads after 9 hours**, the weak signals from Phase 0 are weaker than hypothesized. **This is itself an important signal** — it suggests the pain, while real, may be less actively discussed than the artifact assumes. In that case:
- The unmet need may still be real but **less articulated**, suggesting heavier content-marketing investment to *create* the conversation
- Or the cohort framing in Phase 1 may need adjustment — perhaps the pain is felt but expressed in vocabulary the queries don't catch

Either way, returning to Phase 1 with this data is the right next step before committing to bets.

---

## What "high engagement" means

Practical thresholds for r/Equestrian and r/Horses:
- ≥50 upvotes on the OP, OR
- ≥30 substantive comments (filter out "good luck" replies)

For COTH forums:
- ≥10 replies and ≥2,000 views, OR
- Pinned/sticky thread on the subject

For Facebook groups:
- ≥30 reactions OR ≥20 comments

These thresholds filter noise from signal. A thread with 200 upvotes describing exactly Pain P1 is a piece of evidence worth a switching interview.

---

## When to re-run this

- Quarterly — vocabulary in horse-community discussions shifts over 6-12 month windows
- After any major industry event (Garmin Blaze launch, big-name vet endorsement of a competitor, regulatory change)
- After your own product launch — the threads will reference *you*, which is the meta-signal
