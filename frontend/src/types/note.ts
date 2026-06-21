/**
 * Owner-captured notes anchored to a moment in time.
 *
 * Per P4.1 (notes / photo timestamp capture) and the misbehavior-mining
 * scenarios 6 and 7. Owners are already capturing health observations
 * ad-hoc — give them a place to put them with a vitals snapshot attached
 * so the data is vet-ready.
 */
export interface HorseNote {
  id: string
  horse_id: string
  /** When the note was taken. */
  recorded_at: string
  content: string
  /** Snapshot of the horse's vitals at the moment the note was captured. */
  vitals_snapshot: {
    heart_rate_bpm: number | null
    skin_temp_c: number | null
    hrv_ms: number | null
    activity_index: number | null
  } | null
  /** Optional photo URL — not yet used by the demo. */
  photo_url: string | null
}
