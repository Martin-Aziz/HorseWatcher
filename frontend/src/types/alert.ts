export type AlertSeverity = 'info' | 'warning' | 'urgent'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'suppressed' | 'dismissed'

/** Why a user dismissed an alert. Captured per P3.3 (snooze with reason). */
export type AlertDismissReason =
  | 'already_aware_training'
  | 'already_aware_other'
  | 'saw_horse_fine'
  | 'false_alarm'

export interface Alert {
  id: string
  horse_id: string
  reading_id: string | null
  severity: AlertSeverity
  status: AlertStatus
  metric: string
  observed_value: number | null
  baseline_value: number | null
  deviation_pct: number | null
  message: string
  recommendation: string | null
  /** Plain-language explanation of WHY the alert fired (per P3.2). */
  explainer: string | null
  /** Human-readable persistence detail, e.g. "elevated for 12 minutes". */
  persistence_detail: string | null
  acknowledged_by: string | null
  acknowledged_at: string | null
  resolved_at: string | null
  dismissed_reason: AlertDismissReason | null
  dismissed_at: string | null
  created_at: string
}
