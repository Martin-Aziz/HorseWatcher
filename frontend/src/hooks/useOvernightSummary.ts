'use client'

import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/lib/mockData'
import type { OvernightSummary } from '@/types/summary'

export function useOvernightSummary(horseId: string) {
  return useQuery<OvernightSummary | null>({
    queryKey: ['overnight-summary', horseId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 50))
      return mockStore().getOvernightSummary(horseId)
    },
    enabled: !!horseId,
    // Overnight summaries change only at the daily boundary — long stale time is fine.
    staleTime: 60 * 60_000,
  })
}
