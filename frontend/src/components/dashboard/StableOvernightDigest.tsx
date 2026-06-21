'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Moon, AlertTriangle, Sun, ArrowUpRight } from 'lucide-react'
import { mockStore } from '@/lib/mockData'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import type { OvernightSummary } from '@/types/summary'

/**
 * Stable-wide overnight digest — appears on the /stable page.
 *
 * Aggregates each horse's overnight summary into a single "how was last
 * night across the whole stable?" view. Surfaces the horses that need
 * attention without forcing the user to open each card.
 */
export function StableOvernightDigest() {
  const { data, isLoading } = useQuery({
    queryKey: ['stable-overnight'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 60))
      const horses = mockStore().getHorses()
      return horses.map((h) => ({
        horse: h,
        summary: mockStore().getOvernightSummary(h.id),
      }))
    },
    staleTime: 60 * 60_000,
  })

  const grouped = useMemo(() => {
    const calm: typeof data = []
    const noteworthy: typeof data = []
    const concerning: typeof data = []
    ;(data ?? []).forEach((entry) => {
      const s = entry.summary
      if (!s) return
      if (s.tone === 'concerning') concerning.push(entry)
      else if (s.tone === 'noteworthy') noteworthy.push(entry)
      else calm.push(entry)
    })
    return { calm, noteworthy, concerning }
  }, [data])

  if (isLoading || !data) {
    return <div className="glass rounded-3xl h-28 animate-pulse" />
  }

  const calmCount = grouped.calm?.length ?? 0
  const noteworthyCount = grouped.noteworthy?.length ?? 0
  const concerningCount = grouped.concerning?.length ?? 0

  // Choose card tint by worst tone in the stable
  const worstTone = concerningCount > 0 ? 'concerning' : noteworthyCount > 0 ? 'noteworthy' : 'calm'
  const tint =
    worstTone === 'concerning' ? 'glass-tinted-danger' :
    worstTone === 'noteworthy' ? 'glass-tinted-warm' :
    'glass-tinted-success'
  const iconBg =
    worstTone === 'concerning' ? 'from-rose-400 to-red-500' :
    worstTone === 'noteworthy' ? 'from-amber-400 to-orange-500' :
    'from-emerald-400 to-teal-500'
  const Icon = worstTone === 'concerning' ? AlertTriangle : worstTone === 'noteworthy' ? Sun : Moon

  let headline: string
  if (concerningCount > 0) {
    const names = grouped.concerning!.map((e) => e.horse.name).join(' and ')
    headline = `Concerning overnight for ${names}. ${calmCount + noteworthyCount} other horses had typical nights.`
  } else if (noteworthyCount > 0) {
    const names = grouped.noteworthy!.slice(0, 2).map((e) => e.horse.name).join(', ')
    const more = noteworthyCount > 2 ? ` and ${noteworthyCount - 2} more` : ''
    headline = `Slightly unusual overnight for ${names}${more}. Worth a glance at those, the rest had quiet nights.`
  } else {
    headline = `All ${calmCount} horses had quiet nights. Vitals stayed within baseline.`
  }

  return (
    <div className={cn(tint, 'rounded-3xl p-5 sm:p-6 relative overflow-hidden')}>
      <span className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/40 blur-3xl pointer-events-none" />

      <div className="relative flex items-start gap-4">
        <div className={cn(
          'h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0',
          iconBg,
        )}>
          <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-mist-500 uppercase tracking-wider">
            Stable overnight · {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
          <p className="text-base sm:text-lg font-semibold text-mist-800 leading-snug mt-0.5">
            {headline}
          </p>

          {/* Concerning horses — direct callouts */}
          {(grouped.concerning ?? []).map((entry) => entry.summary && (
            <Link
              key={entry.horse.id}
              href={`/horses/${entry.horse.id}`}
              className="mt-3 bg-white/70 hover:bg-white rounded-xl px-3 py-2 flex items-center justify-between gap-3 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-mist-800">{entry.horse.name}</p>
                <p className="text-xs text-mist-600 truncate">{entry.summary.headline}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-mist-500 shrink-0" strokeWidth={2.5} />
            </Link>
          ))}

          {/* Counts strip */}
          <div className="flex items-center gap-4 mt-3 text-[11px] text-mist-500">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-mist-700">{calmCount}</span> calm
            </span>
            {noteworthyCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="font-bold text-mist-700">{noteworthyCount}</span> noteworthy
              </span>
            )}
            {concerningCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="font-bold text-mist-700">{concerningCount}</span> concerning
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
