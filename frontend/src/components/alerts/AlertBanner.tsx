'use client'

import { X, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useAlertStore } from '@/store/alertStore'

export function AlertBanner() {
  const { urgentAlerts, dismissAlert } = useAlertStore()

  if (urgentAlerts.length === 0) return null

  const alert = urgentAlerts[0]

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-3">
      <div className="glass-tinted-danger rounded-2xl px-4 py-3 flex items-start gap-3 relative overflow-hidden">
        <span className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 animate-pulse pointer-events-none" />
        <div className="h-9 w-9 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/30 urgent-pulse">
          <AlertTriangle className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-red-900 text-sm">Urgent Alert</p>
          <p className="text-sm text-red-800 leading-snug">{alert.message}</p>
        </div>
        <Link
          href={`/horses/${alert.horse_id}`}
          className="text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl px-3 py-1.5 whitespace-nowrap shadow-md shadow-red-600/25 self-center"
        >
          View horse →
        </Link>
        {urgentAlerts.length > 1 && (
          <span className="text-xs bg-white/80 text-red-700 rounded-full px-2 py-0.5 self-start font-semibold">
            +{urgentAlerts.length - 1} more
          </span>
        )}
        <button
          onClick={() => dismissAlert(alert.id)}
          aria-label="Dismiss alert"
          className="p-1 rounded-lg hover:bg-white/40 text-red-700 self-start"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
