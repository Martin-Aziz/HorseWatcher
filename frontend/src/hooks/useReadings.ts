'use client'

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { mockStore, type LiveEvent } from '@/lib/mockData'
import type { SensorReading } from '@/types/reading'

export function useLatestReading(horseId: string) {
  const qc = useQueryClient()

  const query = useQuery<SensorReading | null>({
    queryKey: ['readings', horseId, 'latest'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 60))
      return mockStore().getLatestReading(horseId)
    },
    enabled: !!horseId,
  })

  // Subscribe to live updates for this horse — push directly into React Query cache
  // so all consumers re-render automatically.
  useEffect(() => {
    if (!horseId) return
    const unsub = mockStore().subscribe((event: LiveEvent) => {
      if (event.type === 'reading' && event.horseId === horseId) {
        qc.setQueryData(['readings', horseId, 'latest'], event.reading)
      }
    })
    return unsub
  }, [horseId, qc])

  return query
}

export function useReadingsHistory(horseId: string, fromIso: string, toIso: string) {
  const qc = useQueryClient()

  const query = useQuery<SensorReading[]>({
    queryKey: ['readings', horseId, 'history', fromIso, toIso],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 100))
      return mockStore().getReadings(
        horseId,
        new Date(fromIso).getTime(),
        new Date(toIso).getTime(),
      )
    },
    enabled: !!horseId,
  })

  // Append live readings into the history series too so charts grow in real time.
  useEffect(() => {
    if (!horseId) return
    const unsub = mockStore().subscribe((event: LiveEvent) => {
      if (event.type !== 'reading' || event.horseId !== horseId) return
      qc.setQueryData<SensorReading[]>(
        ['readings', horseId, 'history', fromIso, toIso],
        (prev) => {
          if (!prev) return prev
          const tNow = new Date(event.reading.recorded_at).getTime()
          const tTo = new Date(toIso).getTime()
          if (tNow > tTo + 60_000) return prev // outside window
          return [...prev.slice(-1999), event.reading]
        },
      )
    })
    return unsub
  }, [horseId, fromIso, toIso, qc])

  return query
}
