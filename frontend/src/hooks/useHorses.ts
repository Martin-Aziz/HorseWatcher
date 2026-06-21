'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockStore } from '@/lib/mockData'
import type { Horse } from '@/types/horse'

export function useHorses() {
  return useQuery<Horse[]>({
    queryKey: ['horses'],
    queryFn: async () => {
      // Mock delay to feel real
      await new Promise((r) => setTimeout(r, 120))
      return mockStore().getHorses()
    },
  })
}

export function useHorse(id: string) {
  return useQuery<Horse>({
    queryKey: ['horses', id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 80))
      const h = mockStore().getHorse(id)
      if (!h) throw new Error(`Horse ${id} not found`)
      return h
    },
    enabled: !!id,
  })
}

export function useCreateHorse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Horse>) => {
      void payload
      throw new Error('Adding horses is disabled in the demo. The 7 demo horses are pre-loaded.')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['horses'] }),
  })
}
