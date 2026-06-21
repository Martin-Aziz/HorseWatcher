'use client'

import { useHorses } from '@/hooks/useHorses'
import { useLatestReading } from '@/hooks/useReadings'
import { HorseCard } from '@/components/horses/HorseCard'
import type { Horse } from '@/types/horse'

export default function HorsesPage() {
  const { data: horses, isLoading } = useHorses()

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <span className="absolute -top-12 -right-8 h-44 w-44 rounded-full bg-gradient-to-br from-pink-200/50 to-carrot-200/50 blur-3xl pointer-events-none" />
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-mist-800">All Horses</h2>
          <p className="text-mist-600 mt-1 text-sm">Complete roster with live vitals.</p>
        </div>
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
            <HorseCardConnected key={horse.id} horse={horse} />
          ))}
        </div>
      )}
    </div>
  )
}

function HorseCardConnected({ horse }: { horse: Horse }) {
  const { data: reading } = useLatestReading(horse.id)
  return <HorseCard horse={horse} latestReading={reading} />
}
