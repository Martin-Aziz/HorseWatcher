# 🐴 HorseWatcher

**Equine health intelligence — a live, glassmorphism demo of what 24/7 AI horse monitoring looks like.**

> *"Is my horse okay today?"* HorseWatcher answers continuously, for every horse, with live vitals, personalised baselines, smart alerts, and a Claude-powered AI assistant.

This is a **frontend-only demo** built to show partners and investors what the product feels like. No backend, no database, no auth — every reading is generated in-browser from a deterministic simulator that imitates real wearable sensors. Refresh the page and the storyline replays from the same seed.

---

## What's in the demo

- **7 distinct horses** — Luna (dressage mare), Thunder (ex-racehorse), Willow (calm trail horse with mild fever 🟡), Shadow (show stallion), Juno (endurance Arabian), Atlas (heavy draft), Piper (young pony in urgent state 🔴).
- **Live vitals updating every 2 seconds** — heart rate, HRV, skin temperature, activity index.
- **30 days of synthetic baseline data per horse** — drives the "compared to normal" badges.
- **Pre-seeded alerts** at every severity (info, warning, urgent) plus new alerts firing during the demo as the simulator drifts horses into anomalous windows.
- **AI Health Assistant** — a Next.js API route that shells out to the local **Claude Code CLI**, with live context injected (current vitals, baselines, active alerts) so Claude can answer questions like *"Is Piper okay right now?"* with the actual data.
- **Glassmorphism UI** — frosted glass cards, blurred gradient backgrounds, soft shadows, smooth transitions, fully responsive (mobile bottom-nav + desktop sidebar).

---

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**.

That's it. No database. No Docker. No `.env` setup.

### AI assistant (optional)

The AI tab works out of the box if you have **Claude Code CLI** installed:

```bash
which claude
# /opt/homebrew/bin/claude  ← if this is empty, install from https://claude.com/claude-code
```

If `claude` isn't installed, the assistant falls back to a built-in summary of the live data so the page never breaks.

To override the path: `CLAUDE_CLI_PATH=/path/to/claude npm run dev`.

---

## Architecture (frontend-only)

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js 15 App Router                                          │
│  ─────────────────────                                          │
│                                                                 │
│  src/app/(dashboard)/                                           │
│    stable/page.tsx          ← Stable overview (hero + grid)    │
│    horses/page.tsx          ← All horses list                  │
│    horses/[id]/page.tsx     ← Live dashboard (4 vitals + chart)│
│    horses/[id]/timeline/    ← Historical multi-metric chart    │
│    alerts/page.tsx          ← Alert feed with filters          │
│    assistant/page.tsx       ← AI chat                          │
│                                                                 │
│  src/app/api/ai/chat/route.ts                                   │
│    └─ spawn('claude', ['-p', '--output-format', 'text'])        │
│       ↑ live horse context injected into the prompt             │
│                                                                 │
│  src/lib/mockData.ts                                            │
│    └─ Singleton store — deterministic PRNG seed,                │
│       Markov-chain activity simulator, 2s live ticker,          │
│       subscribers wired into React Query cache.                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- **In-memory mock store, not localStorage** — page refresh resets to a clean seeded state, so the demo is reproducible every time.
- **React Query + subscribe pattern** — the live ticker pushes new readings directly into the React Query cache via `setQueryData`, so every consumer re-renders automatically without polling.
- **Claude Code CLI as the LLM** — zero auth setup, uses the user's existing Claude subscription, demonstrates the AI feature with real model responses.
- **Tailwind v4 with custom `@theme`** — glassmorphism utilities (`.glass`, `.glass-strong`, `.glass-tinted-warm`, etc.) defined in `globals.css`.

---

## What's intentionally not built

This is a demo. The original full-stack architecture (Go backend, Python ML service, Postgres, Redis) still lives in `backend/` and `ml/` — but it's not wired into the demo. When you're ready to ship for real, the data hooks in `src/hooks/*.ts` swap to fetch from the Go API and the simulator becomes the real device pipeline.

- ❌ No login / auth
- ❌ No persistence (refresh = reset)
- ❌ No real sensor ingestion
- ❌ No Docker

These are all production concerns. The demo's job is to show the experience.

---

## File tree (frontend)

```
frontend/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── stable/page.tsx
│   │   │   ├── horses/page.tsx
│   │   │   ├── horses/[id]/page.tsx
│   │   │   ├── horses/[id]/timeline/page.tsx
│   │   │   ├── alerts/page.tsx
│   │   │   └── assistant/page.tsx
│   │   ├── api/ai/chat/route.ts     ← Claude CLI bridge
│   │   ├── globals.css              ← Glassmorphism utilities
│   │   ├── layout.tsx
│   │   └── page.tsx                 ← redirect → /stable
│   ├── components/
│   │   ├── alerts/AlertBanner.tsx
│   │   ├── alerts/AlertCard.tsx
│   │   ├── dashboard/VitalChart.tsx
│   │   ├── dashboard/VitalGauge.tsx
│   │   ├── horses/HorseCard.tsx
│   │   └── layout/{Sidebar,TopNav,ProviderTree}.tsx
│   ├── hooks/use{Horses,Readings,Alerts,Baseline}.ts
│   ├── lib/{mockData,queryClient,utils}.ts
│   ├── store/alertStore.ts          ← Urgent banner
│   └── types/{horse,reading,alert,baseline,user}.ts
├── package.json
├── postcss.config.mjs
└── next.config.ts
```

---

## Demo script (for partners)

1. **Open `/stable`** — show the 4 stat cards, the horse grid. Point at Piper (red status pulsing).
2. **Click Piper** → live dashboard. Heart rate is elevated, two active alerts visible.
3. **Click "Timeline"** → 4-hour chart showing the anomaly spike with red dots overlaid on the baseline band.
4. **Click "AI Insights"** → it auto-selects Piper. Click *"Should I be worried about the active alerts?"*. Claude reads the live data and responds.
5. **Wait 60 seconds** on `/stable` — watch another horse occasionally drift into a warning state. New alert appears in the sidebar with a pulsing badge.

---

## License & credits

Built as a HorseWatcher product demo. Uses Next.js, Tailwind 4, Recharts, Lucide, React Query, Zustand, and Claude Code.
