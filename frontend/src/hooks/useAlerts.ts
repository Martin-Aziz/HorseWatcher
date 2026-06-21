'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockStore, type LiveEvent } from '@/lib/mockData'
import { useAlertStore } from '@/store/alertStore'
import type { Alert, AlertDismissReason } from '@/types/alert'

export function useAlerts(params?: { status?: string; severity?: string }) {
  const qc = useQueryClient()

  const query = useQuery<Alert[]>({
    queryKey: ['alerts', params],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 80))
      return mockStore().getAlerts(params)
    },
  })

  // Live: new alerts append and urgent ones banner.
  const addBanner = useAlertStore((s) => s.addUrgentAlert)
  useEffect(() => {
    const unsub = mockStore().subscribe((event: LiveEvent) => {
      if (event.type !== 'alert') return
      qc.invalidateQueries({ queryKey: ['alerts'] })
      qc.invalidateQueries({ queryKey: ['alerts', 'horse', event.alert.horse_id] })
      if (event.alert.severity === 'urgent') {
        addBanner(event.alert)
      }
    })
    return unsub
  }, [qc, addBanner])

  return query
}

export function useHorseAlerts(horseId: string) {
  return useQuery<Alert[]>({
    queryKey: ['alerts', 'horse', horseId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 60))
      return mockStore().getAlerts({ horseId })
    },
    enabled: !!horseId,
  })
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const alert = mockStore().acknowledgeAlert(id, 'u-demo')
      if (!alert) throw new Error('Alert no longer active')
      return alert
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

export function useResolveAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const alert = mockStore().resolveAlert(id)
      if (!alert) throw new Error('Alert not found')
      return alert
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

/**
 * Dismiss an alert with a captured reason (P3.3 — "snooze with a reason").
 *
 * The reason is the system's learning signal: each dismissal teaches the
 * algorithm whether the alert was useful, premature, or noise.
 */
export function useDismissAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: { id: string; reason: AlertDismissReason }) => {
      const alert = mockStore().dismissAlert(args.id, args.reason)
      if (!alert) throw new Error('Alert not found')
      return alert
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}
