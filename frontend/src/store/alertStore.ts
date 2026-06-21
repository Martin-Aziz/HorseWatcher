'use client'

import { create } from 'zustand'
import type { Alert } from '@/types/alert'

interface AlertStoreState {
  urgentAlerts: Alert[]
  addUrgentAlert: (alert: Alert) => void
  dismissAlert: (id: string) => void
  clearAll: () => void
}

export const useAlertStore = create<AlertStoreState>((set) => ({
  urgentAlerts: [],

  addUrgentAlert: (alert) =>
    set((state) => ({
      urgentAlerts: [alert, ...state.urgentAlerts].slice(0, 5), // keep most recent 5
    })),

  dismissAlert: (id) =>
    set((state) => ({
      urgentAlerts: state.urgentAlerts.filter((a) => a.id !== id),
    })),

  clearAll: () => set({ urgentAlerts: [] }),
}))
