export interface HorseBaseline {
  id: string
  horse_id: string
  metric: string
  window_days: number
  mean: number
  std_dev: number
  p5: number
  p25: number
  p50: number
  p75: number
  p95: number
  lower_bound: number
  upper_bound: number
  sample_count: number
  computed_at: string
  valid_from: string
  valid_until: string | null
}
