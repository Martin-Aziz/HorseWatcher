'use client'

import { use } from 'react'
import { ArrowLeft, Heart, Thermometer, Activity, Zap, Sparkles, TrendingUp, FileText } from 'lucide-react'
import Link from 'next/link'
import { useHorse } from '@/hooks/useHorses'
import { useLatestReading, useReadingsHistory } from '@/hooks/useReadings'
import { useHorseAlerts } from '@/hooks/useAlerts'
import { useBaselineMap } from '@/hooks/useBaseline'
import { VitalGauge } from '@/components/dashboard/VitalGauge'
import { VitalChart } from '@/components/dashboard/VitalChart'
import { MorningSummaryCard } from '@/components/dashboard/MorningSummaryCard'
import { AlertCard } from '@/components/alerts/AlertCard'
import { NotesPanel } from '@/components/horses/NotesPanel'
import { VetCheckButton } from '@/components/horses/VetCheckButton'
import { cn, statusBgColor, statusColor, deriveHorseStatus, formatRelative } from '@/lib/utils'

export default function HorseDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: horse, isLoading: loadingHorse } = useHorse(id)
  const { data: reading } = useLatestReading(id)
  const { data: alerts } = useHorseAlerts(id)
  const baselines = useBaselineMap(id)

  const now = new Date()
  const from = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
  const { data: history } = useReadingsHistory(id, from, now.toISOString())

  const activeAlerts = alerts?.filter((a) => a.status === 'active') ?? []
  const status = deriveHorseStatus(reading?.anomaly_score ?? null, activeAlerts.length)

  if (loadingHorse) {
    return (
      <div className="space-y-6">
        <div className="glass rounded-3xl h-32 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!horse) {
    return (
      <div className="glass-strong rounded-3xl p-12 text-center">
        <p className="text-4xl mb-3">🐴</p>
        <p className="font-bold text-mist-700">Horse not found</p>
        <Link href="/stable" className="text-sm text-carrot-500 hover:text-carrot-600 font-medium mt-3 inline-block">
          ← Back to stable
        </Link>
      </div>
    )
  }

  const initial = horse.name.charAt(0)
  const ageYears = horse.date_of_birth
    ? Math.floor((Date.now() - new Date(horse.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header card */}
      <div className={cn(
        'rounded-3xl p-6 sm:p-8 relative overflow-hidden',
        status === 'urgent' ? 'glass-tinted-danger' :
        status === 'warning' ? 'glass-tinted-warm' :
        'glass-strong',
      )}>
        <span className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-gradient-to-br from-carrot-200/40 to-pink-200/40 blur-3xl pointer-events-none" />

        <Link
          href="/stable"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-500 hover:text-mist-800 mb-5"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back to stable
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-br from-carrot-400 to-pink-500 flex items-center justify-center text-white font-bold text-4xl sm:text-5xl shadow-xl shadow-carrot-500/30 shrink-0">
            {initial}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-bold text-mist-800">{horse.name}</h1>
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm',
                status === 'urgent' ? 'bg-red-500 text-white urgent-pulse' :
                status === 'warning' ? 'bg-amber-400 text-white' :
                'bg-emerald-500 text-white',
              )}>
                <span className="h-1.5 w-1.5 rounded-full bg-white live-dot" />
                {status === 'ok' ? 'Healthy' : status}
              </div>
            </div>
            <p className="text-mist-600 mt-1.5 text-sm">
              {[
                horse.breed,
                horse.sex,
                horse.color,
                ageYears !== null && `${ageYears} years`,
                horse.weight_kg && `${horse.weight_kg} kg`,
              ].filter(Boolean).join(' · ')}
            </p>
            {reading && (
              <p className="text-xs text-mist-500 mt-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 live-dot" />
                Last reading {formatRelative(reading.recorded_at)} · Anomaly score {((reading.anomaly_score ?? 0) * 100).toFixed(0)}%
              </p>
            )}
            {horse.notes && (
              <p className="text-xs text-mist-600 mt-3 italic max-w-xl">&ldquo;{horse.notes}&rdquo;</p>
            )}
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Link
              href={`/horses/${id}/timeline`}
              className="bg-mist-800 hover:bg-mist-900 text-white px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-mist-800/20"
            >
              <TrendingUp className="h-4 w-4" />
              Timeline
            </Link>
            <a
              href={`/api/horses/${id}/vet-export?days=7`}
              target="_blank"
              rel="noreferrer"
              className="bg-white hover:bg-mist-50 text-mist-800 border border-mist-200 px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Vet report
            </a>
          </div>
        </div>
      </div>

      {/* Morning summary — Bet 3, the product's identity */}
      <MorningSummaryCard horseId={id} horseName={horse.name} />

      {/* Live vitals — large gauges */}
      <div>
        <p className="text-xs font-bold text-mist-500 uppercase tracking-wider mb-3 ml-1">Live Vitals</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <VitalGauge
            label="Heart Rate"
            value={reading?.heart_rate_bpm ?? null}
            unit="bpm"
            baseline={baselines['heart_rate_bpm']?.mean}
            lowerBound={baselines['heart_rate_bpm']?.lower_bound}
            upperBound={baselines['heart_rate_bpm']?.upper_bound}
            color="#f43f5e"
            icon={<Heart className="h-full w-full" strokeWidth={2.5} />}
            size="lg"
          />
          <VitalGauge
            label="HRV"
            value={reading?.hrv_ms ?? null}
            unit="ms"
            baseline={baselines['hrv_ms']?.mean}
            lowerBound={baselines['hrv_ms']?.lower_bound}
            upperBound={baselines['hrv_ms']?.upper_bound}
            color="#8b5cf6"
            icon={<Zap className="h-full w-full" strokeWidth={2.5} />}
            size="lg"
          />
          <VitalGauge
            label="Temperature"
            value={reading?.skin_temp_c ?? null}
            unit="°C"
            baseline={baselines['skin_temp_c']?.mean}
            lowerBound={baselines['skin_temp_c']?.lower_bound}
            upperBound={baselines['skin_temp_c']?.upper_bound}
            color="#f97316"
            icon={<Thermometer className="h-full w-full" strokeWidth={2.5} />}
            size="lg"
          />
          <VitalGauge
            label="Activity"
            value={reading?.activity_index ?? null}
            unit=""
            baseline={baselines['activity_index']?.mean}
            lowerBound={baselines['activity_index']?.lower_bound}
            upperBound={baselines['activity_index']?.upper_bound}
            color="#06b6d4"
            icon={<Activity className="h-full w-full" strokeWidth={2.5} />}
            size="lg"
          />
        </div>
      </div>

      {/* Charts + alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Charts */}
        <div className="lg:col-span-2 glass-strong rounded-3xl p-5 sm:p-6 space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-bold text-mist-800">Last 4 Hours</h2>
            <p className="text-xs text-mist-500">Updates live · green band = normal baseline</p>
          </div>
          <VitalChart readings={history ?? []} metric="heart_rate_bpm" baseline={baselines['heart_rate_bpm']} color="#f43f5e" />
          <VitalChart readings={history ?? []} metric="skin_temp_c"    baseline={baselines['skin_temp_c']}    color="#f97316" />
          <VitalChart readings={history ?? []} metric="hrv_ms"         baseline={baselines['hrv_ms']}         color="#8b5cf6" />
        </div>

        {/* Right column: alerts + decision support + AI */}
        <div className="space-y-3">
          <VetCheckButton
            horseName={horse.name}
            latestReading={reading}
            activeAlerts={activeAlerts}
          />

          <div className="flex items-center justify-between mb-1 mt-4">
            <h2 className="text-base font-bold text-mist-800">Active Alerts</h2>
            {activeAlerts.length > 0 && (
              <span className={cn(
                'text-xs font-bold rounded-full px-2 py-0.5',
                status === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
              )}>
                {activeAlerts.length}
              </span>
            )}
          </div>

          {activeAlerts.length === 0 ? (
            <div className="glass-tinted-success rounded-2xl p-5 text-center">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500 mx-auto flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/30">
                <Sparkles className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <p className="font-bold text-emerald-800 text-sm">All clear</p>
              <p className="text-xs text-emerald-700/80 mt-1">{horse.name} is doing great.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}

          <Link
            href="/assistant"
            className="glass-tinted-cool rounded-2xl p-4 flex items-start gap-3 hover:shadow-md transition-shadow mt-3"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-indigo-900">Ask AI about {horse.name}</p>
              <p className="text-xs text-indigo-700/80 mt-0.5 leading-snug">
                Plain-language interpretation of these vitals using live data.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Notes panel — P4.1 */}
      <NotesPanel horseId={id} horseName={horse.name} />
    </div>
  )
}
