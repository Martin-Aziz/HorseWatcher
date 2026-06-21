'use client'

import { Moon, Sun, AlertTriangle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOvernightSummary } from '@/hooks/useOvernightSummary'

/**
 * Morning Overnight Summary card — Bet 3 in the PM artifact.
 *
 * This card IS the product's identity. Most days it reassures. On unusual
 * nights it surfaces specifics. On concerning nights it asks for direct
 * observation.
 *
 * Deliberately quiet by default. No streaks, no badges, no engagement bait.
 */
export function MorningSummaryCard({ horseId, horseName }: { horseId: string; horseName: string }) {
  const { data: summary, isLoading } = useOvernightSummary(horseId)

  if (isLoading) {
    return <div className="glass rounded-3xl h-32 animate-pulse" />
  }

  if (!summary) {
    return (
      <div className="glass rounded-3xl p-5 text-sm text-mist-500">
        Overnight summary will appear after the first calibration window.
      </div>
    )
  }

  const tint =
    summary.tone === 'calm' ? 'glass-tinted-success' :
    summary.tone === 'noteworthy' ? 'glass-tinted-warm' :
    'glass-tinted-danger'

  const iconBg =
    summary.tone === 'calm' ? 'from-emerald-400 to-teal-500' :
    summary.tone === 'noteworthy' ? 'from-amber-400 to-orange-500' :
    'from-rose-400 to-red-500'

  const Icon =
    summary.tone === 'calm' ? Moon :
    summary.tone === 'noteworthy' ? Sun :
    AlertTriangle

  return (
    <div className={cn(tint, 'rounded-3xl p-5 sm:p-6 relative overflow-hidden')}>
      <span className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/40 blur-3xl pointer-events-none" />

      <div className="relative flex items-start gap-4">
        <div className={cn(
          'h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0',
          iconBg,
        )}>
          <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1">
            <p className="text-[10px] font-bold text-mist-500 uppercase tracking-wider">
              Overnight summary · {new Date(summary.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
            {summary.quiet_night && (
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                Quiet night
              </span>
            )}
          </div>

          <p className="text-base sm:text-lg font-semibold text-mist-800 leading-snug">
            {summary.headline}
          </p>

          {summary.detail.length > 0 && (
            <ul className="mt-2 space-y-1">
              {summary.detail.map((d, i) => (
                <li key={i} className="text-sm text-mist-600 leading-snug">{d}</li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-4 mt-3 text-[11px] text-mist-500">
            {summary.sleep_score !== null && (
              <span><span className="font-bold text-mist-700">{summary.sleep_score}</span> sleep score</span>
            )}
            <span><span className="font-bold text-mist-700">{summary.lying_minutes}</span> min lying</span>
            {summary.anomalous_readings > 0 && (
              <span><span className="font-bold text-amber-700">{summary.anomalous_readings}</span> off-baseline</span>
            )}
          </div>
        </div>
      </div>

      {/* Suppress the unused-horseName prop warning while keeping the API consistent */}
      <span className="sr-only">{horseName}</span>
    </div>
  )
}
