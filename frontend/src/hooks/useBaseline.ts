'use client'

import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/lib/mockData'
import type { HorseBaseline } from '@/types/baseline'

export function useBaselines(horseId: string) {
  return useQuery<HorseBaseline[]>({
    queryKey: ['baselines', horseId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 40))
      return mockStore().getBaselines(horseId)
    },
    enabled: !!horseId,
    staleTime: 5 * 60_000,
  })
}

export function useBaselineMap(horseId: string): Record<string, HorseBaseline> {
  const { data } = useBaselines(horseId)
  if (!data) return {}
  return Object.fromEntries(data.map((b) => [b.metric, b]))
}
