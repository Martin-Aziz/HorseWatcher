'use client'

import { cn } from '@/lib/utils'

interface VitalGaugeProps {
  label: string
  value: number | null
  unit?: string
  baseline?: number
  lowerBound?: number
  upperBound?: number
  color: string
  /** Tailwind gradient classes (from-… to-…) for the value text. */
  gradient?: string
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function VitalGauge({
  label, value, unit = '', baseline, lowerBound, upperBound,
  color, gradient, icon, size = 'md',
}: VitalGaugeProps) {
  const formatted = value !== null
    ? (Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1))
    : '—'

  const deviation = value !== null && baseline ? ((value - baseline) / baseline) * 100 : null

  // Determine status visualisation
  const inBand = value !== null && lowerBound !== undefined && upperBound !== undefined
    ? value >= lowerBound && value <= upperBound
    : true

  const sizeClasses = {
    sm: { card: 'p-3 gap-1',  label: 'text-[10px]', value: 'text-2xl', icon: 'h-3.5 w-3.5' },
    md: { card: 'p-4 gap-1',  label: 'text-xs',     value: 'text-3xl', icon: 'h-4 w-4' },
    lg: { card: 'p-5 gap-1.5',label: 'text-xs',     value: 'text-4xl', icon: 'h-4 w-4' },
  }[size]

  return (
    <div className={cn('glass rounded-2xl flex flex-col relative overflow-hidden', sizeClasses.card)}>
      {/* Background tint glow */}
      <span
        className="absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-25 pointer-events-none"
        style={{ background: color }}
      />

      <div className="flex items-center justify-between relative">
        <span className={cn('font-semibold text-mist-500 uppercase tracking-wider', sizeClasses.label)}>
          {label}
        </span>
        {icon && (
          <span className={sizeClasses.icon} style={{ color }}>
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 relative">
        <span
          className={cn('font-bold tabular-nums leading-none', sizeClasses.value, gradient && 'text-gradient-carrot')}
          style={!gradient ? { color } : undefined}
        >
          {formatted}
        </span>
        {unit && (
          <span className="text-xs text-mist-400 font-semibold">{unit}</span>
        )}
      </div>

      {/* Baseline comparison */}
      <div className="flex items-center justify-between mt-1 relative">
        {baseline !== undefined && (
          <span className="text-[10px] text-mist-400 font-medium">
            baseline {baseline.toFixed(unit === 'bpm' ? 0 : 1)}
          </span>
        )}
        {deviation !== null && (
          <span className={cn(
            'text-[10px] font-bold rounded-full px-1.5 py-0.5',
            !inBand && Math.abs(deviation) > 25 ? 'bg-red-100 text-red-600' :
            !inBand ? 'bg-amber-100 text-amber-600' :
            'bg-emerald-100 text-emerald-600',
          )}>
            {deviation > 0 ? '+' : ''}{deviation.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  )
}
