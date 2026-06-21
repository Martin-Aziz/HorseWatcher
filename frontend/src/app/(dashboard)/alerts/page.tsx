'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useAlerts } from '@/hooks/useAlerts'
import { useHorses } from '@/hooks/useHorses'
import { AlertCard } from '@/components/alerts/AlertCard'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'active',       label: 'Active' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'dismissed',    label: 'Dismissed' },
  { value: 'resolved',     label: 'Resolved' },
  { value: '',             label: 'All' },
] as const

const SEVERITY_OPTIONS = [
  { value: '',        label: 'All',     color: 'bg-mist-700' },
  { value: 'urgent',  label: 'Urgent',  color: 'bg-red-500' },
  { value: 'warning', label: 'Warning', color: 'bg-amber-400' },
  { value: 'info',    label: 'Info',    color: 'bg-blue-500' },
] as const

export default function AlertsPage() {
  const [severity, setSeverity] = useState('')
  const [status, setStatus] = useState('active')
  const { data: alerts, isLoading } = useAlerts({
    severity: severity || undefined,
    status: status || undefined,
  })
  const { data: horses } = useHorses()

  const horseMap = Object.fromEntries((horses ?? []).map((h) => [h.id, h.name]))

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <span className="absolute -top-12 -right-8 h-48 w-48 rounded-full bg-gradient-to-br from-red-200/40 to-amber-200/40 blur-3xl pointer-events-none" />
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-mist-800">Health Alerts</h2>
          <p className="text-mist-600 mt-1 text-sm">Anomalies detected across your horses, with recommended actions.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-3 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-mist-500 uppercase tracking-wider pr-1">Status</span>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value || 'all'}
              onClick={() => setStatus(s.value)}
              className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-full',
                status === s.value
                  ? 'bg-mist-800 text-white shadow-md shadow-mist-800/15'
                  : 'bg-white/60 text-mist-600 hover:bg-white',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-mist-500 uppercase tracking-wider pr-1">Severity</span>
          {SEVERITY_OPTIONS.map((s) => (
            <button
              key={s.value || 'all'}
              onClick={() => setSeverity(s.value)}
              className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5',
                severity === s.value
                  ? `${s.color} text-white shadow-md`
                  : 'bg-white/60 text-mist-600 hover:bg-white',
              )}
            >
              {s.value && (
                <span className={cn('h-1.5 w-1.5 rounded-full', severity === s.value ? 'bg-white' : s.color)} />
              )}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-baseline justify-between px-1">
        <p className="text-sm text-mist-500">
          {isLoading ? 'Loading…' : (
            alerts?.length === 1
              ? '1 alert'
              : `${alerts?.length ?? 0} alerts`
          )}
        </p>
      </div>

      {/* Alert list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      ) : alerts && alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} horseName={horseMap[alert.horse_id]} />
          ))}
        </div>
      ) : (
        <div className="glass-tinted-success rounded-3xl p-12 text-center">
          <div className="h-16 w-16 rounded-3xl bg-emerald-500 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
            <Sparkles className="h-8 w-8 text-white" strokeWidth={2.5} />
          </div>
          <p className="font-bold text-emerald-800">No alerts to show</p>
          <p className="text-sm text-emerald-700/80 mt-1">Everything looks healthy with the selected filters.</p>
        </div>
      )}
    </div>
  )
}
