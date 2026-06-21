# Phase 2 — Pain Scenario Engine

> **Question this phase answers:** What does the user actually do, feel, and lose in the specific moment the problem occurs? Not abstractly — physically, named, with a time of day and a device in hand.

**Format rule:** 10 scenarios, no more, no fewer. Each is 4–7 sentences. Each ends with an ODI (Ulwick) outcome statement that converts the narrative into a rankable specification. Each is flagged with evidence grade. ≥2 must be misbehavior-mined.

**Evidence grade summary for this phase:**
- `[QUOTED]`: 0 of 10 (no fresh interviews conducted)
- `[OBSERVED]`: 0 of 10 (no session recordings / support data)
- `[ASSUMED]`: 10 of 10
- `[UNVALIDATED — run switching interviews before betting on this]`

**⚠️ Gate 1 — autonomous fallback triggered.** All 10 scenarios exceed the >3 assumed threshold. The interview script in file 50 and thread mining queries in file 51 are the mandatory next step before Phase 7 bets are committed.

---

## Scenario 1 — The 4:47 AM colic discovery

It's 4:47 AM on a Tuesday in February. The breeder hears a sound through the monitor she keeps by her bed — a noise she's been listening for since her mare lost her foal three years ago. She is out of bed and pulling boots over pyjamas in 90 seconds, walking through the dark to the foaling barn with her phone flashlight, heart already racing because she remembers exactly how this felt the last time. She finds the mare cast against the wall, sweating, the bedding scraped into a half-circle from rolling. She calls the vet at 4:53 AM. The vet arrives at 6:10 AM. The mare survives, the foal does not. For the next 18 months she will replay whether the cameras in the stall had caught the early signs at midnight that she slept through.

`[ASSUMED — composite drawn from breeder anecdotes in forums and industry trade press]`

**ODI outcome:** Minimize the time between *the earliest physiological deviation from baseline* and *the breeder being woken from sleep*, when monitoring a high-value horse during the night window.

---

## Scenario 2 — The 18-month event horse comes back wrong

It's a Saturday at 10am at a training yard in Wellington. A semi-pro event rider has brought her 8-year-old gelding back into work after 6 weeks off for a soft-tissue injury. Week 2 of return-to-work. She rides for 35 minutes, walking and trotting, no canter. The horse feels "fine — maybe a touch stiff behind." She gives him a day off Sunday. Monday morning she gets him out of the stall and he's lame. Not severely — a 1.5 on a 5-point scale — but lame, on the same leg. She stands in the aisle holding the lead rope, trying to remember if the stiffness on Saturday meant something or if she'd done it Monday turning out. She calls the vet. Diagnosis: pushed too soon. Another 4 weeks of layup. The season is over.

`[ASSUMED — drawn from rehab literature and rider blog posts]`

**ODI outcome:** Minimize the rider's uncertainty about *whether yesterday's training intensity is sustainable today*, when in the first 8 weeks of return-to-work after injury.

---

## Scenario 3 — The yard manager and the false alarm fatigue

It's the third night in a row the boarding-yard owner's phone has buzzed at 1:30 AM with an alert from a stable camera system. The first night, she got dressed and went out. The second night, she got out of bed, checked the camera feed on her phone, decided the horse was fine. The third night, she silences the notification without looking. The fourth night, the system goes off and she sleeps through it on purpose. The fifth night, a horse colics and the system doesn't trigger because the camera was pointed at the wrong stall. The next morning, she has to explain to a boarder why she didn't respond. She switches the system off entirely the following week.

`[ASSUMED — Alert fatigue is well-documented in hospital nursing literature; transfer to equine context is hypothesized but unvalidated]`

**ODI outcome:** Minimize the ratio of *alerts that do not require human action* to *alerts that do*, when monitoring multiple horses in a yard at night.

---

## Scenario 4 — The Whoop owner who can't translate

It's 9:14 AM on a Wednesday. A recreational dressage rider with a corporate job opens her Whoop app on the train to work. Recovery score: 38%. She looks at it for a moment, decides she'll do an easy gym session instead of a hard one. Then she thinks about her horse, who she'll ride that evening. She has no equivalent number for him. She has Equilab data from last Saturday's ride, but it's a snapshot from one session, not a recovery signal. She types "horse HRV tracker" into Google during the commute. The first three results are clinical research papers and a €1,200 device targeted at racing yards. She closes the tab. That evening, she does her normal training session because she has no reason to do otherwise. The horse goes well. She has no idea if she made the right call.

`[ASSUMED — based on overlap behaviour between Whoop users and rider demographics, unvalidated]`

**ODI outcome:** Minimize the cognitive load of translating *horse readiness* into *today's training decision*, when the rider already uses a personal recovery tracker.

---

## Scenario 5 — The vet visit that could have been avoided (or arrived too late)

It's a Thursday at 6pm. An owner notices her 22-year-old gelding has eaten about 60% of his evening hay, when he normally eats 95%. She doesn't know if this matters. She knows she'd feel foolish calling the vet for a "he didn't finish his dinner" — but she remembers last March, when a similar half-eaten dinner became colic surgery by 11 PM. She compromises: she texts her vet. The vet replies at 7:30 ("watch him, call me if it gets worse"). She watches him until 11pm, falls asleep on the tack-room couch, wakes at 3am to find him fine. The next day she's exhausted at work and not sure if she did the right thing. The cycle repeats two weeks later with a different small change.

`[ASSUMED — drawn from forum posts about post-colic anxiety]`

**ODI outcome:** Minimize the owner's *binary decision uncertainty* (call vet vs. wait) when observing a small behavioural change in a horse with prior medical history.

---

## Scenario 6 — Misbehavior mining: the rectal thermometer photograph

It's 7:15 AM and an owner is standing in the wash stall holding her phone up to a rectal thermometer she's just used on her horse, taking a photo of the digital readout. She is doing this because the thermometer doesn't save history and she wants to text the number to her vet to compare against last week. She has a folder on her phone called "Charlie" with 47 such photos — thermometer readings, photos of legs, screenshots of weights from the feed scale. She does not have a single chronological view of any of these. When she goes to find the trend, she has to scroll backwards through her camera roll, mixed in with photos of dinners and her children.

`[ASSUMED — but this exact behaviour pattern is common across pet-owner verticals and verifiable through 5-minute user testing]`

**ODI outcome:** Minimize the manual effort of *constructing a chronological health view* from observations the owner is already making, when the data points are captured ad-hoc on a phone.

---

## Scenario 7 — Misbehavior mining: the WhatsApp transcript as medical record

It's 2 PM at a vet's office. The vet is talking to an owner whose horse has just had a 30-minute exam. The owner is scrolling through a WhatsApp thread with her yard manager going back 4 months, reading out small observations — "stiff Tuesday," "didn't drink as much Friday," "spooky at the corner Saturday" — that the vet is asking about. She loses track of which week she's reading. The vet asks "and was that the same week he was on bute?" She doesn't know. The information exists; it's just unstructured, in a chat thread, mixed with stable gossip and pictures of someone's birthday cake. The vet visit costs €230 and leaves with a "probably nothing, but let's repeat bloodwork."

`[ASSUMED — but verifiable: ask 10 horse owners "what does your WhatsApp with your yard manager look like" and observe]`

**ODI outcome:** Minimize the *structured-data extraction cost* of converting ongoing observations into a vet-usable history, when the observations are happening organically in chat.

---

## Scenario 8 — The night-shift handover gap

It's 10:48 PM. The day groom at a training yard has just finished evening feeds and is about to hand over to the night-checker (who will do rounds at midnight and 4 AM). He sends a voice memo on WhatsApp summarizing today: "Atlas's water bucket was a bit lower than usual, Luna seemed twitchy at evening turnout, Piper kicked the wall once." The night-checker listens to it 90 minutes later on her drive in. By midnight rounds, she's forgotten which horse was which. She does her rounds based on her own observation, missing the cue that Piper was already showing signs of low-grade discomfort 4 hours earlier. By 6 AM Piper is showing classic mild colic. The yard's veterinary cost: €600. The information that would have shortened diagnosis time by 6 hours existed — it was in the day groom's head at 10 PM.

`[ASSUMED — but mirrors known shift-handover literature from hospitals]`

**ODI outcome:** Minimize *information loss between shift handovers* when staff observations are time-sensitive and lightly verbal.

---

## Scenario 9 — The competition warm-up uncertainty

It's 9:20 AM at a competition venue. The warm-up arena for an Intermediate dressage test starting at 10:14 AM. A rider has just completed her warm-up and is walking the horse on a loose rein for the final 5 minutes before her test. The horse felt sharp — possibly *too* sharp. Adrenaline-sharp, not training-sharp. She tries to decide whether to do another 90 seconds of canter to take the edge off, or whether that will tip him into tiredness during the test. She has no objective signal. She makes the call on instinct (do nothing). The test scores 67.2% — fine, not her best, and she will spend the drive home wondering whether one more minute of canter would have made the difference.

`[ASSUMED — drawn from rider forums and competition-prep content]`

**ODI outcome:** Minimize the rider's *real-time decision uncertainty* about whether the horse is *peaked, peaking, or past peak* during competition warm-up.

---

## Scenario 10 — The owner who has given up

It's a Wednesday evening. An owner who used to track everything about her horse has stopped. Three years ago she had a notebook, a spreadsheet, a Wyze cam. Two and a half years ago her horse was diagnosed with a chronic condition that requires monitoring forever. She tracked aggressively for 6 months. She burned out. She now does the visual check, the routine feed, and trusts that "if something's wrong, I'll see it." She is right about 80% of the time. The other 20%, she sees it later than she would have if she'd kept tracking. She doesn't blame herself — the tracking was unsustainable. She has not adopted any product because adopting one feels like committing to the same exhausting routine she just escaped.

`[ASSUMED — but represents the durably-non-consuming segment from Phase 0]`

**ODI outcome:** Minimize the *cognitive effort of sustained monitoring* such that an owner who has previously burned out on manual tracking can re-engage.

---

## Phase 2 conclusion — what this phase implies for Phase 3

1. **The pains are clustered around three meta-jobs:**
   - **Loss prevention** (scenarios 1, 3, 5, 8)
   - **Optimization / readiness** (scenarios 2, 4, 9)
   - **Reducing the work of caring** (scenarios 6, 7, 10)

2. **Scenario 3 (false alarm fatigue) is the most underappreciated pain.** It will not appear in the founder's instinct list. It is the pain that *killed* products like the early generations of medical alarm systems. Carrot Watch's alert layer must solve for this from day one.

3. **Scenarios 6 and 7 (the misbehavior mining ones) reveal the largest hidden opportunity** — owners are already collecting health data in chaotic ways. A product that *structures the data they're already capturing* may be more valuable than a product that adds new sensors. This is a strong argument for Variant B (concierge / structured-observation MVP) in `99-variants.md`.

4. **No `[QUOTED]` evidence in the entire phase.** Every scenario must be tested against real interview transcripts before Phase 7 commits. This is a hard prerequisite, not a recommendation.
