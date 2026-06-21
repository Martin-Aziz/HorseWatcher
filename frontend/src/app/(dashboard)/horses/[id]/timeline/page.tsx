'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { useHorse } from '@/hooks/useHorses'
import { useReadingsHistory } from '@/hooks/useReadings'
import { useBaselineMap } from '@/hooks/useBaseline'
import { useHorseAlerts } from '@/hooks/useAlerts'
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, ReferenceLine, Scatter, Cell,
} from 'recharts'
import { formatDate, cn } from '@/lib/utils'
import type { SensorReading } from '@/types/reading'

const RANGES = [
  { label: '1H', hours: 1 },
  { label: '4H', hours: 4 },
  { label: '12H', hours: 12 },
  { label: '24H', hours: 24 },
] as const

export default function HorseTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: horse } = useHorse(id)
  const baselines = useBaselineMap(id)
  const { data: alerts } = useHorseAlerts(id)
  const [rangeHours, setRangeHours] = useState(4)

  const now = new Date()
  const from = new Date(now.getTime() - rangeHours * 60 * 60 * 1000).toISOString()
  const { data: readings, isLoading } = useReadingsHistory(id, from, now.toISOString())

  // Downsample to ~200 points for fluid rendering on long windows
  const downsample = (arr: SensorReading[], target: number): SensorReading[] => {
    if (arr.length <= target) return arr
    const step = Math.ceil(arr.length / target)
    return arr.filter((_, i) => i % step === 0)
  }

  const trimmed = downsample(readings ?? [], 240)

  const chartData = trimmed.map((r) => ({
    t: new Date(r.recorded_at).getTime(),
    hr: r.heart_rate_bpm,
    temp: r.skin_temp_c,
    hrv: r.hrv_ms,
    isAnomalous: r.is_anomalous,
  }))

  const anomalyPoints = chartData.filter((d) => d.isAnomalous && d.hr !== null)

  const hrBaseline = baselines['heart_rate_bpm']

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <span className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-200/40 to-violet-200/40 blur-3xl pointer-events-none" />
        <Link
          href={`/horses/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-500 hover:text-mist-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back to {horse?.name ?? 'horse'}
        </Link>
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-mist-800">Health Timeline</h2>
            <p className="text-mist-600 mt-1 text-sm">
              Historical vitals for <span className="font-semibold">{horse?.name ?? '…'}</span> with baseline overlays and anomaly markers.
            </p>
          </div>
          <div className="flex items-center gap-1 glass-subtle rounded-2xl p-1">
            {RANGES.map(({ label, hours }) => (
              <button
                key={hours}
                onClick={() => setRangeHours(hours)}
                className={cn(
                  'text-xs font-bold px-3 py-1.5 rounded-xl',
                  rangeHours === hours
                    ? 'bg-mist-800 text-white shadow-md'
                    : 'text-mist-600 hover:bg-white/60',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart card */}
      <div className="glass-strong rounded-3xl p-5 sm:p-6">
        {isLoading ? (
          <div className="h-80 flex items-center justify-center text-mist-400 text-sm animate-pulse">
            Loading readings…
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-mist-400 text-sm">
            <Calendar className="h-10 w-10 text-mist-300 mb-2" />
            No readings in this range
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-mist-700">Heart Rate & Temperature</p>
              <div className="flex items-center gap-4 text-[10px] text-mist-500">
                <span className="flex items-center gap-1.5"><span className="h-1 w-3 bg-rose-500 rounded" /> Heart rate</span>
                <span className="flex items-center gap-1.5"><span className="h-1 w-3 bg-amber-500 rounded" /> Temperature</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-red-500 rounded-full" /> Anomaly</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(t: number) => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={60}
                />
                <YAxis yAxisId="hr" orientation="left" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={30} />
                <YAxis yAxisId="temp" orientation="right" domain={[36, 40]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  labelFormatter={(t: number) => formatDate(new Date(t).toISOString())}
                  formatter={(v: number, name: string) => {
                    if (name === 'hr') return [`${v?.toFixed(0) ?? '—'} bpm`, 'Heart Rate']
                    if (name === 'temp') return [`${v?.toFixed(2) ?? '—'} °C`, 'Temperature']
                    return [v, name]
                  }}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 10px 30px rgba(31,38,135,0.12)',
                    background: 'rgba(255,255,255,0.94)',
                    backdropFilter: 'blur(12px)',
                  }}
                />
                {hrBaseline && (
                  <ReferenceArea yAxisId="hr" y1={hrBaseline.lower_bound} y2={hrBaseline.upper_bound} fill="#10b981" fillOpacity={0.06} />
                )}
                {hrBaseline && (
                  <ReferenceLine yAxisId="hr" y={hrBaseline.mean} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.6} strokeWidth={1.5} />
                )}
                <Area yAxisId="hr"   type="monotone" dataKey="hr"   stroke="#f43f5e" strokeWidth={2.2} fill="url(#hrGrad)"   dot={false} isAnimationActive={false} />
                <Area yAxisId="temp" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2.2} fill="url(#tempGrad)" dot={false} isAnimationActive={false} />
                <Scatter yAxisId="hr" data={anomalyPoints} dataKey="hr" fill="#ef4444">
                  {anomalyPoints.map((_, i) => (
                    <Cell key={i} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />
                  ))}
                </Scatter>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* HRV chart */}
        {chartData.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/40">
            <p className="text-sm font-bold text-mist-700 mb-3">Heart Rate Variability (HRV)</p>
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(t: number) => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={60}
                />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  labelFormatter={(t: number) => formatDate(new Date(t).toISOString())}
                  formatter={(v: number) => [`${v?.toFixed(1) ?? '—'} ms`, 'HRV']}
                  contentStyle={{
                    fontSize: 12, borderRadius: 12, border: 'none',
                    boxShadow: '0 10px 30px rgba(31,38,135,0.12)',
                    background: 'rgba(255,255,255,0.94)',
                    backdropFilter: 'blur(12px)',
                  }}
                />
                <Area type="monotone" dataKey="hrv" stroke="#8b5cf6" strokeWidth={2.2} fill="url(#hrvGrad)" dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Alerts in range */}
      {alerts && alerts.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-mist-500 uppercase tracking-wider mb-3 ml-1">
            Events in Range
          </h3>
          <div className="space-y-2">
            {alerts.slice(0, 6).map((a) => (
              <div key={a.id} className={cn(
                'glass rounded-2xl px-4 py-3 text-sm flex items-center gap-3',
                a.severity === 'urgent' && 'glass-tinted-danger',
                a.severity === 'warning' && 'glass-tinted-warm',
              )}>
                <span className={cn(
                  'h-2 w-2 rounded-full shrink-0',
                  a.severity === 'urgent' ? 'bg-red-500' :
                  a.severity === 'warning' ? 'bg-amber-400' :
                  'bg-blue-500',
                )} />
                <span className="font-semibold text-mist-700 capitalize text-xs">{a.severity}</span>
                <span className="text-mist-700 flex-1 truncate">{a.message}</span>
                <span className="text-[10px] text-mist-400 whitespace-nowrap">{formatDate(a.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
