'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts'
import type { SensorReading } from '@/types/reading'
import type { HorseBaseline } from '@/types/baseline'
import { metricLabel, metricUnit } from '@/lib/utils'
import { useMemo } from 'react'

interface VitalChartProps {
  readings: SensorReading[]
  metric: 'heart_rate_bpm' | 'hrv_ms' | 'skin_temp_c' | 'activity_index'
  baseline?: HorseBaseline
  color: string
  height?: number
  showAxes?: boolean
}

export function VitalChart({ readings, metric, baseline, color, height = 140, showAxes = true }: VitalChartProps) {
  const data = useMemo(() => {
    return readings
      .map((r) => ({
        t: new Date(r.recorded_at).getTime(),
        value: r[metric] as number | null,
      }))
      .filter((d): d is { t: number; value: number } => d.value !== null)
  }, [readings, metric])

  if (data.length === 0) {
    return (
      <div className="flex flex-col">
        <p className="text-xs font-semibold text-mist-500 uppercase tracking-wider mb-2">{metricLabel(metric)}</p>
        <div style={{ height }} className="flex items-center justify-center text-mist-400 text-sm glass-subtle rounded-xl">
          No data yet
        </div>
      </div>
    )
  }

  const unit = metricUnit(metric)
  const gradId = `grad-${metric}-${color.replace('#', '')}`

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs font-semibold text-mist-500 uppercase tracking-wider">{metricLabel(metric)}</p>
        {baseline && (
          <p className="text-[10px] text-mist-400">
            normal {baseline.lower_bound.toFixed(unit === 'bpm' ? 0 : 1)}–{baseline.upper_bound.toFixed(unit === 'bpm' ? 0 : 1)} {unit}
          </p>
        )}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: showAxes ? 0 : -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.45} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
          {showAxes && (
            <XAxis
              dataKey="t"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(t: number) => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              minTickGap={50}
            />
          )}
          {showAxes && (
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={30} />
          )}
          <Tooltip
            labelFormatter={(t: number) => new Date(t).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            formatter={(v: number) => [`${v.toFixed(1)} ${unit}`, metricLabel(metric)]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 10px 30px rgba(31,38,135,0.12)',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(12px)',
            }}
          />

          {baseline && (
            <ReferenceArea
              y1={baseline.lower_bound}
              y2={baseline.upper_bound}
              fill="#10b981"
              fillOpacity={0.06}
            />
          )}
          {baseline && (
            <ReferenceLine
              y={baseline.mean}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              strokeOpacity={0.6}
            />
          )}

          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.2}
            fill={`url(#${gradId})`}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
