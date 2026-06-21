export type OvernightTone = 'calm' | 'noteworthy' | 'concerning'

/**
 * The Morning Overnight Summary — the product's identity per Bet 3 of the PM artifact.
 *
 * One card delivered (in this demo, generated client-side) at 6 AM local for each horse.
 * Most days the tone is 'calm' — the product's job is to REASSURE before it informs.
 */
export interface OvernightSummary {
  horse_id: string
  /** ISO date of the overnight period covered (e.g. yesterday's date). */
  date: string
  tone: OvernightTone
  /**
   * The single sentence the owner reads first. Designed to fit on one line on a phone screen.
   * Example: "Charlie slept calmly. Heart rate stayed within band. Activity normal."
   */
  headline: string
  /** 1-3 short bullets with the specifics. Empty array on calm nights = "nothing to add". */
  detail: string[]
  /** Indicators surfaced to the badge layer. */
  quiet_night: boolean
  /** A rough "sleep quality" score derived from low-activity lying-time during the window. */
  sleep_score: number | null
  /** Minutes lying during the overnight window. */
  lying_minutes: number
  /** Number of anomalous readings in the overnight window. */
  anomalous_readings: number
}
