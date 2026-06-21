/**
 * Mock sensor data generator for HorseWatcher demo.
 *
 * Produces deterministic, investor-ready data:
 *   • 7 horses with distinct personalities (breed, age, temperament)
 *   • 30 days of baseline-quality historical readings per horse
 *   • 4 hours of recent high-resolution readings (1 every 10s)
 *   • Pre-seeded alerts at various severities
 *   • A live ticker that adds new readings every 2 seconds
 *   • Occasional anomalies that fire warning/urgent alerts in real time
 *
 * Why in-memory and not a database: this is a demo. The data lives for the
 * length of one tab. Refreshing the page regenerates from the same seed so
 * the storyline is reproducible.
 */

import type { Horse } from '@/types/horse'
import type { SensorReading } from '@/types/reading'
import type { Alert, AlertDismissReason } from '@/types/alert'
import type { HorseBaseline } from '@/types/baseline'
import type { OvernightSummary, OvernightTone } from '@/types/summary'
import type { HorseNote } from '@/types/note'

// ───────────────────────────────────────────────────────────────────────────
// Horse roster — 7 distinct personalities for a compelling demo
// ───────────────────────────────────────────────────────────────────────────

interface HorseProfile extends Horse {
  /** Per-horse baseline vitals used to drive simulation. */
  readonly profile: {
    restingHR: number
    restingHRV: number
    restingTemp: number
    /** Multiplier applied to noise — higher = more variable horse. */
    variability: number
    /** 0..1 — how often this horse is active vs resting. */
    activityBias: number
  }
}

const NOW = Date.now()
const ISO = (offsetMs: number) => new Date(NOW + offsetMs).toISOString()

export const HORSES: HorseProfile[] = [
  {
    id: 'h-luna',
    name: 'Luna',
    breed: 'Hanoverian',
    date_of_birth: '2017-04-12',
    sex: 'mare',
    color: 'Dark bay',
    weight_kg: 580,
    avatar_url: null,
    stable_id: 's-1',
    owner_id: 'u-anna',
    microchip_id: 'CW-001-LUNA',
    notes: 'Competition dressage mare. Sensitive, picks up tension quickly.',
    created_at: ISO(-30 * 86400_000),
    updated_at: ISO(-1 * 3600_000),
    profile: { restingHR: 34, restingHRV: 68, restingTemp: 37.7, variability: 1.0, activityBias: 0.55 },
  },
  {
    id: 'h-thunder',
    name: 'Thunder',
    breed: 'Thoroughbred',
    date_of_birth: '2015-08-22',
    sex: 'gelding',
    color: 'Chestnut',
    weight_kg: 510,
    avatar_url: null,
    stable_id: 's-1',
    owner_id: 'u-anna',
    microchip_id: 'CW-002-THUND',
    notes: 'Ex-racehorse. Hot temperament, recovers quickly after exercise.',
    created_at: ISO(-30 * 86400_000),
    updated_at: ISO(-2 * 3600_000),
    profile: { restingHR: 30, restingHRV: 80, restingTemp: 37.6, variability: 1.3, activityBias: 0.7 },
  },
  {
    id: 'h-willow',
    name: 'Willow',
    breed: 'Quarter Horse',
    date_of_birth: '2014-06-03',
    sex: 'mare',
    color: 'Palomino',
    weight_kg: 545,
    avatar_url: null,
    stable_id: 's-1',
    owner_id: 'u-anna',
    microchip_id: 'CW-003-WILL',
    notes: 'Calm trail horse. Currently showing mild elevated temperature — under observation.',
    created_at: ISO(-30 * 86400_000),
    updated_at: ISO(-10 * 60_000),
    profile: { restingHR: 36, restingHRV: 62, restingTemp: 38.4, variability: 0.8, activityBias: 0.4 },
  },
  {
    id: 'h-shadow',
    name: 'Shadow',
    breed: 'Friesian',
    date_of_birth: '2018-11-15',
    sex: 'stallion',
    color: 'Black',
    weight_kg: 620,
    avatar_url: null,
    stable_id: 's-1',
    owner_id: 'u-anna',
    microchip_id: 'CW-004-SHAD',
    notes: 'Show stallion. Steady baseline, strong recovery patterns.',
    created_at: ISO(-30 * 86400_000),
    updated_at: ISO(-30 * 60_000),
    profile: { restingHR: 32, restingHRV: 72, restingTemp: 37.8, variability: 0.7, activityBias: 0.5 },
  },
  {
    id: 'h-juno',
    name: 'Juno',
    breed: 'Arabian',
    date_of_birth: '2019-03-28',
    sex: 'mare',
    color: 'Grey',
    weight_kg: 460,
    avatar_url: null,
    stable_id: 's-1',
    owner_id: 'u-anna',
    microchip_id: 'CW-005-JUNO',
    notes: 'Young endurance prospect. High activity bias, naturally elevated HR.',
    created_at: ISO(-25 * 86400_000),
    updated_at: ISO(-45 * 60_000),
    profile: { restingHR: 38, restingHRV: 75, restingTemp: 37.9, variability: 1.1, activityBias: 0.65 },
  },
  {
    id: 'h-atlas',
    name: 'Atlas',
    breed: 'Belgian Draft',
    date_of_birth: '2013-01-10',
    sex: 'gelding',
    color: 'Sorrel',
    weight_kg: 820,
    avatar_url: null,
    stable_id: 's-1',
    owner_id: 'u-anna',
    microchip_id: 'CW-006-ATLAS',
    notes: 'Heavy draft. Lower resting HR, longer recovery curve.',
    created_at: ISO(-30 * 86400_000),
    updated_at: ISO(-2 * 3600_000),
    profile: { restingHR: 28, restingHRV: 65, restingTemp: 37.5, variability: 0.6, activityBias: 0.35 },
  },
  {
    id: 'h-piper',
    name: 'Piper',
    breed: 'Welsh Pony',
    date_of_birth: '2020-05-07',
    sex: 'filly',
    color: 'Bay',
    weight_kg: 320,
    avatar_url: null,
    stable_id: 's-1',
    owner_id: 'u-anna',
    microchip_id: 'CW-007-PIPER',
    notes: 'Young pony. URGENT: elevated heart rate and reduced HRV over last hour.',
    created_at: ISO(-22 * 86400_000),
    updated_at: ISO(-5 * 60_000),
    profile: { restingHR: 42, restingHRV: 70, restingTemp: 38.0, variability: 1.2, activityBias: 0.6 },
  },
]

// ───────────────────────────────────────────────────────────────────────────
// Deterministic PRNG — same seed = same demo every time
// ───────────────────────────────────────────────────────────────────────────

/** Mulberry32 — small, fast, deterministic 32-bit PRNG. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Standard normal via Box-Muller. */
function gauss(rng: () => number): number {
  const u1 = Math.max(rng(), 1e-9)
  const u2 = rng()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

// ───────────────────────────────────────────────────────────────────────────
// Activity state machine — drives realistic time-of-day variation
// ───────────────────────────────────────────────────────────────────────────

type ActivityState = 'resting' | 'walking' | 'trotting' | 'cantering' | 'stressed'

/**
 * Choose an activity state for a given hour. Night hours bias heavily to resting,
 * morning hours bias to activity, etc. The activityBias profile per horse shifts
 * the entire distribution up or down.
 */
function sampleActivityState(hour: number, profile: HorseProfile['profile'], rng: () => number): ActivityState {
  const isNight = hour >= 22 || hour < 6
  const isMorning = hour >= 7 && hour < 11
  const isAfternoon = hour >= 14 && hour < 18

  let activeWeight = 0.3 + profile.activityBias * 0.5
  if (isNight) activeWeight *= 0.15
  if (isMorning) activeWeight *= 1.4
  if (isAfternoon) activeWeight *= 1.1

  const r = rng()
  if (r > activeWeight) return 'resting'
  if (r > activeWeight * 0.6) return 'walking'
  if (r > activeWeight * 0.25) return 'trotting'
  if (r > activeWeight * 0.08) return 'cantering'
  return 'stressed'
}

interface StateVitals {
  hrMul: number
  tempDelta: number
  hrvDelta: number
  activity: [number, number]
}

const STATE_VITALS: Record<ActivityState, StateVitals> = {
  resting:   { hrMul: 1.00, tempDelta: 0.0,  hrvDelta: 0,   activity: [0, 5] },
  walking:   { hrMul: 1.35, tempDelta: 0.15, hrvDelta: -8,  activity: [20, 40] },
  trotting:  { hrMul: 2.20, tempDelta: 0.4,  hrvDelta: -22, activity: [55, 75] },
  cantering: { hrMul: 3.50, tempDelta: 0.8,  hrvDelta: -38, activity: [80, 95] },
  stressed:  { hrMul: 1.70, tempDelta: 0.35, hrvDelta: -28, activity: [10, 30] },
}

// ───────────────────────────────────────────────────────────────────────────
// Per-horse reading generation
// ───────────────────────────────────────────────────────────────────────────

interface GenerationContext {
  rng: () => number
  /** Whether this reading should be anomalous (drives alert generation). */
  forceAnomaly?: 'warning' | 'urgent'
}

function generateReading(
  horse: HorseProfile,
  timestamp: number,
  ctx: GenerationContext,
): SensorReading {
  const { rng } = ctx
  const hour = new Date(timestamp).getHours()
  const state = sampleActivityState(hour, horse.profile, rng)
  const vitals = STATE_VITALS[state]

  const noiseScale = horse.profile.variability

  let hr = horse.profile.restingHR * vitals.hrMul + gauss(rng) * 1.2 * noiseScale
  let temp = horse.profile.restingTemp + vitals.tempDelta + gauss(rng) * 0.08 * noiseScale
  let hrv = horse.profile.restingHRV + vitals.hrvDelta + gauss(rng) * 3.0 * noiseScale
  const [actMin, actMax] = vitals.activity
  let activity = actMin + rng() * (actMax - actMin)

  // Anomaly injection — push 3-4σ above baseline.
  let anomalyScore = 0.05 + rng() * 0.15
  let isAnomalous = false

  if (ctx.forceAnomaly === 'warning') {
    hr += 18 + rng() * 6
    temp += 0.5
    hrv -= 15
    anomalyScore = 0.68 + rng() * 0.15
    isAnomalous = true
  } else if (ctx.forceAnomaly === 'urgent') {
    hr += 28 + rng() * 8
    temp += 0.9
    hrv -= 25
    anomalyScore = 0.87 + rng() * 0.1
    isAnomalous = true
  }

  // Clamp to physiologically plausible ranges.
  hr = Math.max(20, Math.min(220, hr))
  temp = Math.max(36.5, Math.min(40.5, temp))
  hrv = Math.max(8, Math.min(120, hrv))
  activity = Math.max(0, Math.min(100, activity))

  return {
    id: `r-${horse.id}-${timestamp}`,
    horse_id: horse.id,
    device_id: `CW-DEV-${horse.id.slice(2, 6).toUpperCase()}`,
    recorded_at: new Date(timestamp).toISOString(),
    received_at: new Date(timestamp).toISOString(),
    heart_rate_bpm: Math.round(hr),
    hrv_ms: Math.round(hrv * 10) / 10,
    skin_temp_c: Math.round(temp * 100) / 100,
    rectal_temp_c: null,
    respiratory_rate: Math.round(12 + (hr - horse.profile.restingHR) * 0.15),
    activity_index: Math.round(activity * 10) / 10,
    steps_count: Math.round(activity * 8),
    lying_minutes: state === 'resting' ? Math.round(8 - rng() * 3) : 0,
    standing_minutes: state === 'resting' ? Math.round(2 + rng() * 3) : 10,
    anomaly_score: Math.round(anomalyScore * 10000) / 10000,
    is_anomalous: isAnomalous,
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Baseline computation — same math as the production ML service would do
// ───────────────────────────────────────────────────────────────────────────

function computeBaseline(
  horseId: string,
  metric: string,
  values: number[],
): HorseBaseline {
  if (values.length === 0) {
    throw new Error(`computeBaseline: no values for ${horseId}/${metric}`)
  }
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(values.length - 1, 1)
  const stdDev = Math.sqrt(variance)
  const sorted = [...values].sort((a, b) => a - b)
  const pct = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]
  const sigma = 2.5

  return {
    id: `bl-${horseId}-${metric}`,
    horse_id: horseId,
    metric,
    window_days: 30,
    mean: Math.round(mean * 100) / 100,
    std_dev: Math.round(stdDev * 100) / 100,
    p5: pct(5),
    p25: pct(25),
    p50: pct(50),
    p75: pct(75),
    p95: pct(95),
    lower_bound: Math.round((mean - sigma * stdDev) * 100) / 100,
    upper_bound: Math.round((mean + sigma * stdDev) * 100) / 100,
    sample_count: values.length,
    computed_at: ISO(-3600_000),
    valid_from: ISO(-30 * 86400_000),
    valid_until: null,
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Initial seed data
// ───────────────────────────────────────────────────────────────────────────

const SEED = 0xC44047  // Fixed seed: every page load replays the same demo.

/** Historical 4-hour high-res window per horse (every 10s = 1440 readings). */
const HISTORY_WINDOW_MS = 4 * 3600_000
const HISTORY_INTERVAL_MS = 10_000

/** Number of synthetic samples per metric used to compute baselines. */
const BASELINE_SAMPLES = 2000

interface SeededData {
  readingsByHorse: Map<string, SensorReading[]>
  baselinesByHorse: Map<string, HorseBaseline[]>
  alerts: Alert[]
}

function buildSeedData(): SeededData {
  const readingsByHorse = new Map<string, SensorReading[]>()
  const baselinesByHorse = new Map<string, HorseBaseline[]>()
  const alerts: Alert[] = []

  HORSES.forEach((horse, horseIdx) => {
    const rng = mulberry32(SEED + horseIdx * 1009)

    // 1. Historical readings — 4h window at 10s resolution
    const readings: SensorReading[] = []
    const startMs = NOW - HISTORY_WINDOW_MS

    // Pre-determine anomaly windows for this horse to make the demo compelling.
    // Willow: subtle warning around 30min ago. Piper: urgent now-ish.
    const anomalyWindows: Array<{ from: number; to: number; severity: 'warning' | 'urgent' }> = []
    if (horse.id === 'h-willow') {
      anomalyWindows.push({ from: NOW - 35 * 60_000, to: NOW - 25 * 60_000, severity: 'warning' })
    }
    if (horse.id === 'h-piper') {
      anomalyWindows.push({ from: NOW - 18 * 60_000, to: NOW - 1 * 60_000, severity: 'urgent' })
    }

    for (let t = startMs; t <= NOW; t += HISTORY_INTERVAL_MS) {
      const window = anomalyWindows.find((w) => t >= w.from && t <= w.to)
      readings.push(generateReading(horse, t, {
        rng,
        forceAnomaly: window?.severity,
      }))
    }
    readingsByHorse.set(horse.id, readings)

    // 2. Baselines — computed from a separate 30-day synthetic sample so baselines
    //    look stable and don't shift with the recent anomalies in the demo.
    const baselineRng = mulberry32(SEED + horseIdx * 7919)
    const synthetic = {
      heart_rate_bpm: [] as number[],
      hrv_ms: [] as number[],
      skin_temp_c: [] as number[],
      activity_index: [] as number[],
    }
    for (let i = 0; i < BASELINE_SAMPLES; i++) {
      const fakeHour = Math.floor(baselineRng() * 24)
      const fakeTs = NOW - i * 600_000 // synthetic 10-min spacing back in time
      const r = generateReading(horse, fakeTs, { rng: baselineRng })
      void fakeHour
      if (r.heart_rate_bpm !== null) synthetic.heart_rate_bpm.push(r.heart_rate_bpm)
      if (r.hrv_ms !== null) synthetic.hrv_ms.push(r.hrv_ms)
      if (r.skin_temp_c !== null) synthetic.skin_temp_c.push(r.skin_temp_c)
      if (r.activity_index !== null) synthetic.activity_index.push(r.activity_index)
    }
    baselinesByHorse.set(horse.id, [
      computeBaseline(horse.id, 'heart_rate_bpm', synthetic.heart_rate_bpm),
      computeBaseline(horse.id, 'hrv_ms', synthetic.hrv_ms),
      computeBaseline(horse.id, 'skin_temp_c', synthetic.skin_temp_c),
      computeBaseline(horse.id, 'activity_index', synthetic.activity_index),
    ])

    // 3. Alerts — pre-seeded matching the anomaly windows
    if (horse.id === 'h-willow') {
      alerts.push({
        id: `al-${horse.id}-1`,
        horse_id: horse.id,
        reading_id: null,
        severity: 'warning',
        status: 'active',
        metric: 'skin_temp_c',
        observed_value: 38.9,
        baseline_value: 37.8,
        deviation_pct: 2.9,
        message: 'Skin temperature has been 0.5–1.1°C above baseline for the last 30 minutes.',
        recommendation: 'Check water intake and shade access. Take rectal temperature if persistent. Contact vet if elevated >1h.',
        explainer: 'We flagged this because skin temperature averaged 38.9°C over the last 30 minutes — that\'s 1.1°C above Willow\'s personal baseline of 37.8°C, well outside her normal range of 37.3–38.3°C.',
        persistence_detail: 'Elevated for 30 minutes',
        acknowledged_by: null,
        acknowledged_at: null,
        resolved_at: null,
        dismissed_reason: null,
        dismissed_at: null,
        created_at: ISO(-32 * 60_000),
      })
    }
    if (horse.id === 'h-piper') {
      alerts.push({
        id: `al-${horse.id}-1`,
        horse_id: horse.id,
        reading_id: null,
        severity: 'urgent',
        status: 'active',
        metric: 'heart_rate_bpm',
        observed_value: 71,
        baseline_value: 42,
        deviation_pct: 69,
        message: 'Heart rate is 69% above resting baseline. HRV has dropped sharply over the last 18 minutes.',
        recommendation: 'Direct observation recommended. Check for visible distress, colic signs, or injury. Contact your veterinarian if not at rest.',
        explainer: 'Heart rate has averaged 71 bpm for 18 minutes — well above Piper\'s normal range of 30–55 bpm. The reading hasn\'t returned to baseline at any point in that window, which is what tipped this from a "watch" to an "urgent" alert.',
        persistence_detail: 'Elevated for 18 minutes, no return to baseline',
        acknowledged_by: null,
        acknowledged_at: null,
        resolved_at: null,
        dismissed_reason: null,
        dismissed_at: null,
        created_at: ISO(-16 * 60_000),
      })
      alerts.push({
        id: `al-${horse.id}-2`,
        horse_id: horse.id,
        reading_id: null,
        severity: 'warning',
        status: 'active',
        metric: 'hrv_ms',
        observed_value: 38,
        baseline_value: 70,
        deviation_pct: -45,
        message: 'Heart rate variability dropped 45% below baseline — typical sign of physiological stress.',
        recommendation: 'Combined with elevated HR this strongly suggests pain, stress, or systemic illness.',
        explainer: 'HRV has been at ~38 ms for 12 minutes — Piper\'s personal baseline is 70 ms with a normal floor of 55 ms. Sustained low HRV is one of the earliest physiological markers of pain or stress.',
        persistence_detail: 'Below baseline for 12 minutes',
        acknowledged_by: null,
        acknowledged_at: null,
        resolved_at: null,
        dismissed_reason: null,
        dismissed_at: null,
        created_at: ISO(-12 * 60_000),
      })
    }
    if (horse.id === 'h-thunder') {
      alerts.push({
        id: `al-${horse.id}-1`,
        horse_id: horse.id,
        reading_id: null,
        severity: 'info',
        status: 'acknowledged',
        metric: 'activity_index',
        observed_value: 88,
        baseline_value: 35,
        deviation_pct: 151,
        message: 'High activity sustained for 45 minutes — likely training session.',
        recommendation: 'Recovery window expected over the next 90 minutes. Monitor HRV for full recovery.',
        explainer: 'Activity index averaged 88/100 for 45 minutes — sustained high activity that matches Thunder\'s typical training pattern. This is flagged as info, not warning, because it follows his usual schedule.',
        persistence_detail: 'High activity for 45 minutes',
        acknowledged_by: 'u-anna',
        acknowledged_at: ISO(-90 * 60_000),
        resolved_at: null,
        dismissed_reason: null,
        dismissed_at: null,
        created_at: ISO(-2 * 3600_000),
      })
    }
  })

  return { readingsByHorse, baselinesByHorse, alerts }
}

// ───────────────────────────────────────────────────────────────────────────
// Public store — single instance for the page lifetime
//
// Implements the PM artifact's recommendations:
//   • Bet 2: multi-gate alert thresholds (score ≥0.85 + ≥10min persistence
//     + no return-to-band) — replaces the single-tick fire of the previous version
//   • Bet 3: morning overnight summary generation
//   • Bet 4: PDF-export-ready data assembly
//   • P3.2: per-alert "why this fired" explainer
//   • P3.3: dismissal with reason capture
//   • P4.1: notes capture with auto-vitals snapshot
// ───────────────────────────────────────────────────────────────────────────

/**
 * Per-horse anomaly tracker — replaces the simple "remaining tick" counter.
 *
 * Tracks the FULL run of an anomalous window so we can decide when (and whether)
 * to fire an alert. Multi-gate logic: only fires when we have ≥5 anomalous reads
 * in a row at score ≥0.85 with no return-to-band in between.
 */
interface AnomalyRun {
  startedAt: number
  /** All readings in the current anomalous run, including any return-to-band ticks. */
  readings: SensorReading[]
  /** Has an alert already been fired for THIS run? */
  alertFired: boolean
  /** Synthesised intended severity once the run is long enough to qualify. */
  intendedSeverity: 'warning' | 'urgent'
}

/** Persistence threshold in milliseconds — Bet 2 mandates ≥10 minutes for urgent. */
const URGENT_PERSISTENCE_MS = 10 * 60_000
/** A warning alert can fire after a shorter run; we use 4 minutes (~120 ticks). */
const WARNING_PERSISTENCE_MS = 4 * 60_000
/** Urgent score gate. */
const URGENT_SCORE_GATE = 0.85
/** Warning score gate. */
const WARNING_SCORE_GATE = 0.65

class MockStore {
  private data: SeededData
  /** Per-horse simulator state for the live ticker. */
  private liveRngs: Map<string, () => number> = new Map()
  /** Per-horse: is this horse currently in an anomalous trend window? */
  private anomalyTicks: Map<string, { remaining: number; severity: 'warning' | 'urgent' }> = new Map()
  /** Per-horse anomaly run tracker for multi-gate logic (Bet 2). */
  private anomalyRuns: Map<string, AnomalyRun> = new Map()
  /** Per-horse notes (P4.1). */
  private notesByHorse: Map<string, HorseNote[]> = new Map()
  /** Per-horse cached morning summary. Regenerated daily. */
  private summariesByHorse: Map<string, OvernightSummary> = new Map()
  /** Subscribers to live updates. */
  private subscribers: Set<(event: LiveEvent) => void> = new Set()
  private tickerId: ReturnType<typeof setInterval> | null = null

  constructor() {
    this.data = buildSeedData()
    HORSES.forEach((h, i) => {
      this.liveRngs.set(h.id, mulberry32(SEED + i * 4567 + 13))
    })
    // Piper continues its urgent state into live ticks at start.
    this.anomalyTicks.set('h-piper', { remaining: 30, severity: 'urgent' })

    // Pre-seed notes for demo storytelling (P4.1 misbehavior mining).
    this.seedNotes()

    // Pre-compute today's overnight summary for every horse.
    HORSES.forEach((h) => this.regenerateSummary(h.id))
  }

  // ─── Horses ─────────────────────────────────────────────────────────────

  getHorses(): Horse[] {
    return HORSES.map(({ profile, ...rest }) => {
      void profile
      return rest
    })
  }

  getHorse(id: string): Horse | null {
    const h = HORSES.find((h) => h.id === id)
    if (!h) return null
    const { profile, ...rest } = h
    void profile
    return rest
  }

  // ─── Readings ───────────────────────────────────────────────────────────

  getReadings(horseId: string, fromMs?: number, toMs?: number): SensorReading[] {
    const all = this.data.readingsByHorse.get(horseId) ?? []
    if (fromMs === undefined && toMs === undefined) return all
    return all.filter((r) => {
      const t = new Date(r.recorded_at).getTime()
      if (fromMs !== undefined && t < fromMs) return false
      if (toMs !== undefined && t > toMs) return false
      return true
    })
  }

  getLatestReading(horseId: string): SensorReading | null {
    const all = this.data.readingsByHorse.get(horseId)
    if (!all || all.length === 0) return null
    return all[all.length - 1]
  }

  // ─── Baselines ──────────────────────────────────────────────────────────

  getBaselines(horseId: string): HorseBaseline[] {
    return this.data.baselinesByHorse.get(horseId) ?? []
  }

  // ─── Alerts (with multi-gate + dismissal) ───────────────────────────────

  getAlerts(filter?: { status?: string; severity?: string; horseId?: string }): Alert[] {
    let alerts = this.data.alerts
    if (filter?.status) alerts = alerts.filter((a) => a.status === filter.status)
    if (filter?.severity) alerts = alerts.filter((a) => a.severity === filter.severity)
    if (filter?.horseId) alerts = alerts.filter((a) => a.horse_id === filter.horseId)
    return alerts.slice().sort((a, b) => b.created_at.localeCompare(a.created_at))
  }

  acknowledgeAlert(id: string, by: string): Alert | null {
    const alert = this.data.alerts.find((a) => a.id === id)
    if (!alert || alert.status !== 'active') return null
    alert.status = 'acknowledged'
    alert.acknowledged_by = by
    alert.acknowledged_at = new Date().toISOString()
    return alert
  }

  resolveAlert(id: string): Alert | null {
    const alert = this.data.alerts.find((a) => a.id === id)
    if (!alert) return null
    alert.status = 'resolved'
    alert.resolved_at = new Date().toISOString()
    return alert
  }

  /**
   * Dismiss an alert with a reason (P3.3 — "snooze with a reason").
   *
   * The reason captures WHY the user dismissed, which is the system's
   * learning signal. Each reason feeds back into threshold tuning.
   */
  dismissAlert(id: string, reason: AlertDismissReason): Alert | null {
    const alert = this.data.alerts.find((a) => a.id === id)
    if (!alert) return null
    alert.status = 'dismissed'
    alert.dismissed_reason = reason
    alert.dismissed_at = new Date().toISOString()
    return alert
  }

  // ─── Notes (P4.1) ───────────────────────────────────────────────────────

  getNotes(horseId: string): HorseNote[] {
    return (this.notesByHorse.get(horseId) ?? [])
      .slice()
      .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
  }

  addNote(horseId: string, content: string): HorseNote | null {
    if (!content.trim()) return null
    const latest = this.getLatestReading(horseId)
    const note: HorseNote = {
      id: `n-${horseId}-${Date.now()}`,
      horse_id: horseId,
      recorded_at: new Date().toISOString(),
      content: content.trim(),
      vitals_snapshot: latest ? {
        heart_rate_bpm: latest.heart_rate_bpm,
        skin_temp_c: latest.skin_temp_c,
        hrv_ms: latest.hrv_ms,
        activity_index: latest.activity_index,
      } : null,
      photo_url: null,
    }
    const list = this.notesByHorse.get(horseId) ?? []
    list.push(note)
    this.notesByHorse.set(horseId, list)
    return note
  }

  deleteNote(horseId: string, noteId: string): boolean {
    const list = this.notesByHorse.get(horseId) ?? []
    const idx = list.findIndex((n) => n.id === noteId)
    if (idx < 0) return false
    list.splice(idx, 1)
    this.notesByHorse.set(horseId, list)
    return true
  }

  private seedNotes() {
    // Piper — recent observations matching the urgent state for demo narrative
    this.notesByHorse.set('h-piper', [
      {
        id: 'n-h-piper-seed-1',
        horse_id: 'h-piper',
        recorded_at: new Date(NOW - 35 * 60_000).toISOString(),
        content: 'Less interested in hay than usual at evening feed. Drank ~1/2 normal water.',
        vitals_snapshot: { heart_rate_bpm: 48, skin_temp_c: 38.1, hrv_ms: 62, activity_index: 8 },
        photo_url: null,
      },
    ])
    // Willow — note matching her warning state
    this.notesByHorse.set('h-willow', [
      {
        id: 'n-h-willow-seed-1',
        horse_id: 'h-willow',
        recorded_at: new Date(NOW - 6 * 3600_000).toISOString(),
        content: 'Looked a bit lethargic during morning groom. Coat feels slightly damp at the neck.',
        vitals_snapshot: { heart_rate_bpm: 38, skin_temp_c: 38.4, hrv_ms: 60, activity_index: 15 },
        photo_url: null,
      },
    ])
  }

  // ─── Overnight summaries (Bet 3) ────────────────────────────────────────

  getOvernightSummary(horseId: string): OvernightSummary | null {
    return this.summariesByHorse.get(horseId) ?? null
  }

  /**
   * Regenerate the overnight summary for a horse from its overnight reading window.
   *
   * Overnight window = 10pm yesterday → 6am today, local time.
   * For the demo, we use the most recent 8 hours of recorded data
   * (which spans both real "overnight" data when it exists and a
   * mocked-overnight slice otherwise).
   */
  private regenerateSummary(horseId: string): OvernightSummary | null {
    const horse = HORSES.find((h) => h.id === horseId)
    if (!horse) return null

    const readings = this.data.readingsByHorse.get(horseId) ?? []
    if (readings.length === 0) return null

    // Take the last 8 hours as our "overnight window".
    const cutoff = Date.now() - 8 * 3600_000
    const window = readings.filter((r) => new Date(r.recorded_at).getTime() >= cutoff)
    if (window.length === 0) return null

    const baselines = this.data.baselinesByHorse.get(horseId) ?? []
    const baselineMap = Object.fromEntries(baselines.map((b) => [b.metric, b]))

    const anomalous = window.filter((r) => r.is_anomalous)
    const lyingMinutes = window.reduce((acc, r) => acc + (r.lying_minutes ?? 0), 0)
    const totalMinutes = window.length * (10 / 60) // tick interval ≈ 10s
    const expectedLying = totalMinutes * 0.4 // horses lie down ~30-50% of overnight at rest

    // Sleep score 0-100: high lying time without anomalies = good sleep.
    const lyingRatio = expectedLying > 0 ? Math.min(lyingMinutes / expectedLying, 1.5) : 0
    const anomalyPenalty = Math.min(anomalous.length * 8, 60)
    const sleepScore = Math.max(0, Math.min(100, Math.round(60 + lyingRatio * 35 - anomalyPenalty)))

    // Per-metric averages compared to baseline
    const avgHR = avg(window.map((r) => r.heart_rate_bpm).filter(isNumber))
    const avgTemp = avg(window.map((r) => r.skin_temp_c).filter(isNumber))
    const avgHRV = avg(window.map((r) => r.hrv_ms).filter(isNumber))

    const hrBaseline = baselineMap['heart_rate_bpm']
    const tempBaseline = baselineMap['skin_temp_c']
    const hrvBaseline = baselineMap['hrv_ms']

    const hrOff = hrBaseline && avgHR !== null && (avgHR < hrBaseline.lower_bound || avgHR > hrBaseline.upper_bound)
    const tempOff = tempBaseline && avgTemp !== null && (avgTemp < tempBaseline.lower_bound || avgTemp > tempBaseline.upper_bound)
    const hrvOff = hrvBaseline && avgHRV !== null && (avgHRV < hrvBaseline.lower_bound || avgHRV > hrvBaseline.upper_bound)

    let tone: OvernightTone = 'calm'
    if (anomalous.length >= 3 || (hrOff && tempOff)) tone = 'concerning'
    else if (anomalous.length > 0 || hrOff || tempOff || hrvOff) tone = 'noteworthy'

    const detail: string[] = []
    let headline = ''

    if (tone === 'calm') {
      headline = `${horse.name} slept calmly. Vitals stayed in band overnight.`
      if (sleepScore >= 80) {
        detail.push(`Rest was solid — sleep score ${sleepScore}/100.`)
      }
    } else if (tone === 'noteworthy') {
      const parts: string[] = []
      if (hrOff && avgHR !== null && hrBaseline) {
        const delta = avgHR - hrBaseline.mean
        parts.push(`heart rate ran ${Math.abs(delta).toFixed(0)} bpm ${delta > 0 ? 'above' : 'below'} typical`)
      }
      if (tempOff && avgTemp !== null && tempBaseline) {
        const delta = avgTemp - tempBaseline.mean
        parts.push(`temperature was ${Math.abs(delta).toFixed(1)}°C ${delta > 0 ? 'above' : 'below'} normal`)
      }
      if (hrvOff && avgHRV !== null && hrvBaseline) {
        parts.push(`HRV trended below baseline`)
      }
      if (anomalous.length > 0 && parts.length === 0) {
        parts.push(`${anomalous.length} short period${anomalous.length > 1 ? 's' : ''} outside baseline`)
      }
      headline = `${horse.name} had a slightly unusual night — ${parts[0] ?? 'worth a glance'}.`
      if (parts.length > 1) {
        detail.push(`Also: ${parts.slice(1).join('; ')}.`)
      }
      detail.push(`Worth checking on directly if you notice other changes today.`)
    } else {
      headline = `${horse.name} had a concerning overnight — multiple vitals outside baseline.`
      detail.push(`${anomalous.length} anomalous readings during the window.`)
      if (hrBaseline && avgHR !== null) {
        detail.push(`Average heart rate ${avgHR.toFixed(0)} bpm vs. baseline ${hrBaseline.mean.toFixed(0)}.`)
      }
      detail.push(`Recommend direct observation this morning before deciding on training or routine.`)
    }

    const summary: OvernightSummary = {
      horse_id: horseId,
      date: new Date(cutoff).toISOString().slice(0, 10),
      tone,
      headline,
      detail,
      quiet_night: tone === 'calm',
      sleep_score: sleepScore,
      lying_minutes: Math.round(lyingMinutes),
      anomalous_readings: anomalous.length,
    }
    this.summariesByHorse.set(horseId, summary)
    return summary
  }

  // ─── PDF export data assembly (Bet 4) ───────────────────────────────────

  /**
   * Assemble the data a vet would want to see in a single PDF/shareable view.
   *
   * Returns the structured payload — rendering to PDF is the caller's job
   * (the API route uses this with server-side HTML generation).
   */
  getVetExport(horseId: string, daysBack: number = 7): VetExportPayload | null {
    const horse = this.getHorse(horseId)
    if (!horse) return null
    const since = Date.now() - daysBack * 24 * 3600_000

    const readings = this.getReadings(horseId, since)
    const baselines = this.getBaselines(horseId)
    const alerts = this.data.alerts
      .filter((a) => a.horse_id === horseId && new Date(a.created_at).getTime() >= since)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    const notes = (this.notesByHorse.get(horseId) ?? [])
      .filter((n) => new Date(n.recorded_at).getTime() >= since)
      .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))

    // Down-sample readings to hourly for the PDF table (1 row/hour is plenty for a vet).
    const hourlySamples: SensorReading[] = []
    let lastHourBucket = -1
    readings.slice().reverse().forEach((r) => {
      const bucket = Math.floor(new Date(r.recorded_at).getTime() / 3600_000)
      if (bucket !== lastHourBucket) {
        hourlySamples.push(r)
        lastHourBucket = bucket
      }
    })

    return {
      horse,
      generated_at: new Date().toISOString(),
      window_days: daysBack,
      baselines,
      alerts,
      notes,
      hourly_readings: hourlySamples.reverse(),
      reading_count: readings.length,
      anomalous_count: readings.filter((r) => r.is_anomalous).length,
      summary: this.summariesByHorse.get(horseId) ?? null,
    }
  }

  // ─── Live ticker ────────────────────────────────────────────────────────

  subscribe(fn: (event: LiveEvent) => void): () => void {
    this.subscribers.add(fn)
    this.startTicker()
    return () => {
      this.subscribers.delete(fn)
      if (this.subscribers.size === 0) this.stopTicker()
    }
  }

  private startTicker() {
    if (this.tickerId !== null) return
    this.tickerId = setInterval(() => this.tick(), 2000)
  }

  private stopTicker() {
    if (this.tickerId !== null) {
      clearInterval(this.tickerId)
      this.tickerId = null
    }
  }

  /**
   * Single tick: generate a new reading per horse. Apply multi-gate alert logic.
   *
   * The alert decision flow (Bet 2):
   *   1. Generate the reading.
   *   2. If anomalous, append to the horse's anomaly run.
   *   3. If anomaly run has ≥5 readings AND ≥10min span AND no return-to-band
   *      AND no alert fired yet → fire urgent alert.
   *   4. If anomaly run has ≥2 readings AND ≥4min span AND no alert fired → fire warning.
   *   5. On return-to-band, close out the run.
   */
  private tick() {
    const now = Date.now()
    HORSES.forEach((horse) => {
      const rng = this.liveRngs.get(horse.id)!
      // Small chance to begin a new anomaly trend for any horse.
      if (!this.anomalyTicks.has(horse.id) && rng() < 0.008) {
        const severity = rng() < 0.3 ? 'urgent' : 'warning'
        this.anomalyTicks.set(horse.id, { remaining: 8 + Math.floor(rng() * 10), severity })
      }

      const anomalyState = this.anomalyTicks.get(horse.id)
      const reading = generateReading(horse, now, {
        rng,
        forceAnomaly: anomalyState?.severity,
      })

      if (anomalyState) {
        anomalyState.remaining -= 1
        if (anomalyState.remaining <= 0) this.anomalyTicks.delete(horse.id)
      }

      // Append reading and trim window.
      const list = this.data.readingsByHorse.get(horse.id) ?? []
      list.push(reading)
      const cutoff = now - HISTORY_WINDOW_MS
      while (list.length > 0 && new Date(list[0].recorded_at).getTime() < cutoff) {
        list.shift()
      }
      this.data.readingsByHorse.set(horse.id, list)

      this.emit({ type: 'reading', horseId: horse.id, reading })

      // Multi-gate alert logic (Bet 2 implementation).
      this.applyAlertGates(horse, reading, anomalyState?.severity)
    })
  }

  /**
   * Multi-gate alert evaluation per Bet 2.
   *
   * Three gates must all pass for an urgent alert:
   *   • Anomaly score ≥0.85
   *   • Persistence ≥10 minutes (the anomaly run)
   *   • No return-to-band reading within the run
   *
   * Warning fires on a shorter run (≥4 min, score ≥0.65). Both gates
   * exist to prevent the silent-the-app failure mode from Phase 3 ACH.
   */
  private applyAlertGates(
    horse: HorseProfile,
    reading: SensorReading,
    intendedSeverity: 'warning' | 'urgent' | undefined,
  ) {
    const score = reading.anomaly_score ?? 0
    const isAnomalous = reading.is_anomalous && score >= WARNING_SCORE_GATE

    let run = this.anomalyRuns.get(horse.id)

    if (!isAnomalous) {
      // Reading is back in band. If a run was open, this counts as a return-to-band
      // and resets the run (Bet 2's third gate). If an alert was already fired, the
      // run can just close cleanly.
      if (run && !run.alertFired) {
        // The run dies without firing — this is exactly what we want (the system
        // resisted a false alarm because the anomaly didn't persist).
        this.anomalyRuns.delete(horse.id)
      } else if (run && run.alertFired) {
        // The run had already fired; close it.
        this.anomalyRuns.delete(horse.id)
      }
      return
    }

    // Reading is anomalous — extend or start the run.
    if (!run) {
      run = {
        startedAt: new Date(reading.recorded_at).getTime(),
        readings: [reading],
        alertFired: false,
        intendedSeverity: intendedSeverity ?? (score >= URGENT_SCORE_GATE ? 'urgent' : 'warning'),
      }
      this.anomalyRuns.set(horse.id, run)
      return
    }

    run.readings.push(reading)
    if (run.alertFired) return

    const spanMs = new Date(reading.recorded_at).getTime() - run.startedAt
    const maxScore = Math.max(...run.readings.map((r) => r.anomaly_score ?? 0))
    const allAboveWarning = run.readings.every((r) => (r.anomaly_score ?? 0) >= WARNING_SCORE_GATE)

    // Urgent gate
    if (
      maxScore >= URGENT_SCORE_GATE &&
      spanMs >= URGENT_PERSISTENCE_MS &&
      allAboveWarning &&
      run.readings.length >= 5
    ) {
      const alert = this.synthesizeAlert(horse, reading, 'urgent', run)
      run.alertFired = true
      this.data.alerts.unshift(alert)
      this.emit({ type: 'alert', alert })
      return
    }

    // Warning gate
    if (
      spanMs >= WARNING_PERSISTENCE_MS &&
      allAboveWarning &&
      run.readings.length >= 2
    ) {
      const alert = this.synthesizeAlert(horse, reading, 'warning', run)
      run.alertFired = true
      this.data.alerts.unshift(alert)
      this.emit({ type: 'alert', alert })
    }
  }

  private synthesizeAlert(
    horse: HorseProfile,
    reading: SensorReading,
    severity: 'warning' | 'urgent',
    run: AnomalyRun,
  ): Alert {
    const hr = reading.heart_rate_bpm ?? horse.profile.restingHR
    const baselineHR = horse.profile.restingHR
    const deviation = Math.round(((hr - baselineHR) / baselineHR) * 100)
    const persistMin = Math.max(1, Math.round((Date.now() - run.startedAt) / 60_000))

    // P3.2 — every alert has an explainer naming WHY it fired
    const explainer = severity === 'urgent'
      ? `Heart rate has stayed at ${hr} bpm or higher for ${persistMin} minutes — ${deviation}% above ${horse.name}'s baseline of ${baselineHR} bpm. No reading returned to normal range during that window, which is what tipped this to an urgent alert.`
      : `Heart rate has been elevated to about ${hr} bpm for ${persistMin} minutes. That's ${deviation}% above ${horse.name}'s baseline of ${baselineHR} bpm.`

    return {
      id: `al-live-${horse.id}-${Date.now()}`,
      horse_id: horse.id,
      reading_id: reading.id,
      severity,
      status: 'active',
      metric: 'heart_rate_bpm',
      observed_value: hr,
      baseline_value: baselineHR,
      deviation_pct: deviation,
      message: severity === 'urgent'
        ? `Heart rate ${hr} bpm — ${deviation}% above baseline for ${persistMin} minutes. Please check on ${horse.name} now.`
        : `Heart rate ${hr} bpm — ${deviation}% above baseline. Worth a closer look.`,
      recommendation: severity === 'urgent'
        ? 'Go check directly. Look for visible signs of pain, distress, sweating, restlessness, or rolling. Contact your vet if anything looks off.'
        : 'No immediate action needed. If the pattern continues for another 30 minutes or you notice anything off, take a closer look.',
      explainer,
      persistence_detail: `${persistMin} minutes, no return to baseline`,
      acknowledged_by: null,
      acknowledged_at: null,
      resolved_at: null,
      dismissed_reason: null,
      dismissed_at: null,
      created_at: new Date().toISOString(),
    }
  }

  private emit(event: LiveEvent) {
    this.subscribers.forEach((fn) => {
      try {
        fn(event)
      } catch (err) {
        console.error('[MockStore] subscriber threw:', err)
      }
    })
  }
}

export interface VetExportPayload {
  horse: Horse
  generated_at: string
  window_days: number
  baselines: HorseBaseline[]
  alerts: Alert[]
  notes: HorseNote[]
  hourly_readings: SensorReading[]
  reading_count: number
  anomalous_count: number
  summary: OvernightSummary | null
}

export type LiveEvent =
  | { type: 'reading'; horseId: string; reading: SensorReading }
  | { type: 'alert'; alert: Alert }

// ─── Small math helpers ────────────────────────────────────────────────────

function avg(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

// Singleton — same instance across all imports during the page lifetime.
let _instance: MockStore | null = null
export function mockStore(): MockStore {
  if (_instance === null) {
    _instance = new MockStore()
  }
  return _instance
}
