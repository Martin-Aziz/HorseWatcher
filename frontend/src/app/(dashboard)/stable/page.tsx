'use client'

import { useHorses } from '@/hooks/useHorses'
import { useLatestReading } from '@/hooks/useReadings'
import { useAlerts } from '@/hooks/useAlerts'
import { HorseCard } from '@/components/horses/HorseCard'
import { StableOvernightDigest } from '@/components/dashboard/StableOvernightDigest'
import { Activity, Heart, AlertTriangle, Users } from 'lucide-react'
import type { Horse } from '@/types/horse'
import { cn } from '@/lib/utils'

export default function StablePage() {
  const { data: horses, isLoading } = useHorses()
  const { data: alerts } = useAlerts({ status: 'active' })

  const urgentCount = alerts?.filter((a) => a.severity === 'urgent').length ?? 0
  const warningCount = alerts?.filter((a) => a.severity === 'warning').length ?? 0
  const horseCount = horses?.length ?? 0

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <span className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-gradient-to-br from-carrot-300/40 to-pink-300/30 blur-3xl pointer-events-none" />
        <span className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-sky-200/40 to-indigo-300/30 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="text-sm font-semibold text-carrot-600 mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 live-dot" />
            Monitoring quietly · 7 horses
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-mist-800 leading-tight">
            Good day, <span className="text-gradient-carrot">Anna</span>.
          </h2>
          <p className="text-mist-600 mt-2 max-w-xl">
            Everything below updates live. Most days you'll see green and that's the point — peace of mind, grounded in real data. When something needs your attention, we'll be specific about why.
          </p>
        </div>
      </div>

      {/* Stable-wide overnight digest — the morning ritual at stable scale */}
      <StableOvernightDigest />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Horses Monitored"
          value={horseCount.toString()}
          icon={<Users className="h-5 w-5" />}
          accent="from-violet-400 to-indigo-500"
        />
        <StatCard
          label="Healthy Status"
          value={(horseCount - urgentCount - warningCount).toString()}
          icon={<Heart className="h-5 w-5" />}
          accent="from-emerald-400 to-teal-500"
        />
        <StatCard
          label="Active Warnings"
          value={warningCount.toString()}
          icon={<Activity className="h-5 w-5" />}
          accent="from-amber-400 to-orange-500"
          alert={warningCount > 0}
        />
        <StatCard
          label="Urgent Alerts"
          value={urgentCount.toString()}
          icon={<AlertTriangle className="h-5 w-5" />}
          accent="from-rose-400 to-red-500"
          alert={urgentCount > 0}
        />
      </div>

      {/* Horse grid */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-lg font-bold text-mist-800">Your Horses</h3>
          <p className="text-xs text-mist-500">Tap any card for the full picture</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-3xl h-52 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-24 md:pb-4">
            {(horses ?? []).map((horse) => (
              <HorseCardWithReading key={horse.id} horse={horse} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({
  label, value, icon, accent, alert,
}: {
  label: string
  value: string
  icon: React.ReactNode
  accent: string
  alert?: boolean
}) {
  return (
    <div className={cn(
      'glass rounded-2xl p-4 relative overflow-hidden',
      alert && 'glass-tinted-warm',
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          'h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br',
          accent,
        )}>
          {icon}
        </span>
        {alert && (
          <span className="h-2 w-2 rounded-full bg-red-500 live-dot" />
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-mist-800 tabular-nums">{value}</p>
      <p className="text-xs text-mist-500 mt-0.5">{label}</p>
    </div>
  )
}

function HorseCardWithReading({ horse }: { horse: Horse }) {
  const { data: reading } = useLatestReading(horse.id)
  return <HorseCard horse={horse} latestReading={reading} />
}
