export interface SensorReading {
  id: string
  horse_id: string
  device_id: string
  recorded_at: string
  received_at: string
  heart_rate_bpm: number | null
  hrv_ms: number | null
  skin_temp_c: number | null
  rectal_temp_c: number | null
  respiratory_rate: number | null
  activity_index: number | null
  steps_count: number | null
  lying_minutes: number | null
  standing_minutes: number | null
  anomaly_score: number | null
  is_anomalous: boolean
}

export interface LiveReadingEvent {
  type: 'reading'
  horse_id: string
  heart_rate_bpm: number | null
  hrv_ms: number | null
  skin_temp_c: number | null
  activity_index: number | null
  anomaly_score: number | null
  recorded_at: string
}
