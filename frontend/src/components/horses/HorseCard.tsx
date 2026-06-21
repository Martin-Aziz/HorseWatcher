'use client'

import Link from 'next/link'
import { Heart, Thermometer, Activity, Zap, ArrowUpRight } from 'lucide-react'
import { cn, statusBgColor, formatRelative, deriveHorseStatus, metricUnit } from '@/lib/utils'
import type { Horse } from '@/types/horse'
import type { SensorReading } from '@/types/reading'
import { useHorseAlerts } from '@/hooks/useAlerts'
import { useBaselineMap } from '@/hooks/useBaseline'

interface HorseCardProps {
  horse: Horse
  latestReading?: SensorReading | null
}

export function HorseCard({ horse, latestReading }: HorseCardProps) {
  const { data: alerts } = useHorseAlerts(horse.id)
  const baselines = useBaselineMap(horse.id)
  const activeAlerts = alerts?.filter((a) => a.status === 'active') ?? []
  const status = deriveHorseStatus(latestReading?.anomaly_score ?? null, activeAlerts.length)

  const initial = horse.name.charAt(0)
  // Per-horse gradient — deterministic from id
  const gradients = [
    'from-rose-300 to-orange-400',
    'from-amber-300 to-pink-400',
    'from-emerald-300 to-teal-400',
    'from-slate-400 to-indigo-500',
    'from-sky-300 to-blue-500',
    'from-stone-400 to-amber-600',
    'from-purple-300 to-fuchsia-400',
  ]
  const gradient = gradients[(horse.id.charCodeAt(2) || 0) % gradients.length]

  const cardTint =
    status === 'urgent' ? 'glass-tinted-danger' :
    status === 'warning' ? 'glass-tinted-warm' :
    'glass'

  return (
    <Link href={`/horses/${horse.id}`} className="block group">
      <div className={cn(
        cardTint,
        'rounded-3xl p-5 relative overflow-hidden',
        'hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300',
      )}>
        {/* Decorative glow */}
        <span
          className={cn(
            'absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-30 bg-gradient-to-br pointer-events-none',
            gradient,
          )}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              'h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0 bg-gradient-to-br',
              gradient,
            )}>
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-mist-800 text-base leading-tight truncate">{horse.name}</p>
              <p className="text-xs text-mist-500 truncate">{horse.breed}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={cn('h-2 w-2 rounded-full live-dot', statusBgColor(status))} />
            <span className="text-[11px] font-semibold text-mist-600 uppercase tracking-wide">{status}</span>
          </div>
        </div>

        {/* Vitals */}
        {latestReading ? (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <VitalPill
              icon={<Heart className="h-3.5 w-3.5" strokeWidth={2.5} />}
              label="HR"
              value={latestReading.heart_rate_bpm}
              unit="bpm"
              baseline={baselines['heart_rate_bpm']?.mean}
              accent="text-rose-500"
            />
            <VitalPill
              icon={<Thermometer className="h-3.5 w-3.5" strokeWidth={2.5} />}
              label="Temp"
              value={latestReading.skin_temp_c}
              unit="°C"
              decimals={1}
              baseline={baselines['skin_temp_c']?.mean}
              accent="text-amber-500"
            />
            <VitalPill
              icon={<Zap className="h-3.5 w-3.5" strokeWidth={2.5} />}
              label="HRV"
              value={latestReading.hrv_ms}
              unit="ms"
              baseline={baselines['hrv_ms']?.mean}
              accent="text-violet-500"
            />
            <VitalPill
              icon={<Activity className="h-3.5 w-3.5" strokeWidth={2.5} />}
              label="Activity"
              value={latestReading.activity_index}
              unit=""
              baseline={baselines['activity_index']?.mean}
              accent="text-sky-500"
            />
          </div>
        ) : (
          <div className="h-20 flex items-center justify-center text-xs text-mist-400 mb-4">
            Awaiting first reading…
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-mist-500 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 live-dot" />
            {latestReading ? formatRelative(latestReading.recorded_at) : 'no data'}
          </span>
          {activeAlerts.length > 0 ? (
            <span className={cn(
              'font-semibold flex items-center gap-1',
              status === 'urgent' ? 'text-red-600' : 'text-amber-600',
            )}>
              {activeAlerts.length} alert{activeAlerts.length > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-mist-400 flex items-center gap-1 group-hover:text-carrot-600 transition-colors">
              View
              <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function VitalPill({
  icon, label, value, unit, baseline, decimals = 0, accent,
}: {
  icon: React.ReactNode
  label: string
  value: number | null
  unit: string
  baseline?: number
  decimals?: number
  accent: string
}) {
  const deviation = value !== null && baseline ? ((value - baseline) / baseline) * 100 : null
  const isHigh = deviation !== null && Math.abs(deviation) > 25
  const isMed = deviation !== null && Math.abs(deviation) > 12

  return (
    <div className="glass-subtle rounded-xl px-2.5 py-2 flex items-center gap-2">
      <span className={cn('shrink-0', accent)}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-mist-500 leading-none mb-0.5 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm font-bold text-mist-800 tabular-nums leading-none">
          {value !== null ? value.toFixed(decimals) : '—'}
          {unit && <span className="text-[10px] text-mist-400 ml-0.5 font-medium">{unit}</span>}
        </p>
      </div>
      {deviation !== null && Math.abs(deviation) > 5 && (
        <span className={cn(
          'text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none',
          isHigh ? 'bg-red-100 text-red-600' :
          isMed ? 'bg-amber-100 text-amber-600' :
          'bg-emerald-100 text-emerald-600',
        )}>
          {deviation > 0 ? '+' : ''}{deviation.toFixed(0)}%
        </span>
      )}
    </div>
  )
}
// metricUnit import kept for downstream consumers
void metricUnit
