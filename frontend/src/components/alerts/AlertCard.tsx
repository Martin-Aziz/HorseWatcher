'use client'

import { useState } from 'react'
import { AlertTriangle, Info, CheckCircle2, X, Eye } from 'lucide-react'
import { cn, severityColor, formatRelative, metricLabel } from '@/lib/utils'
import type { Alert, AlertDismissReason } from '@/types/alert'
import { useAcknowledgeAlert, useDismissAlert } from '@/hooks/useAlerts'

interface AlertCardProps {
  alert: Alert
  horseName?: string
}

const DISMISS_REASONS: { value: AlertDismissReason; label: string; description: string }[] = [
  {
    value: 'already_aware_training',
    label: 'Already aware — training session',
    description: 'I knew about this and it matches a known training/exercise event.',
  },
  {
    value: 'saw_horse_fine',
    label: 'I checked — horse is fine',
    description: 'I verified directly. Nothing wrong.',
  },
  {
    value: 'already_aware_other',
    label: 'Already aware — other',
    description: 'I knew about this for another reason (vet, farrier, weather).',
  },
  {
    value: 'false_alarm',
    label: 'False alarm — no cause',
    description: 'I can\'t see any reason this should have fired.',
  },
]

export function AlertCard({ alert, horseName }: AlertCardProps) {
  const acknowledge = useAcknowledgeAlert()
  const dismiss = useDismissAlert()
  const [showExplainer, setShowExplainer] = useState(false)
  const [showDismiss, setShowDismiss] = useState(false)

  const tint =
    alert.severity === 'urgent' ? 'glass-tinted-danger' :
    alert.severity === 'warning' ? 'glass-tinted-warm' :
    'glass'

  const iconBg =
    alert.severity === 'urgent' ? 'bg-red-500 shadow-red-500/30' :
    alert.severity === 'warning' ? 'bg-amber-400 shadow-amber-400/30' :
    'bg-blue-500 shadow-blue-500/30'

  const Icon = alert.severity === 'info' ? Info : AlertTriangle

  return (
    <div className={cn(tint, 'rounded-2xl p-4 space-y-2.5')}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-md',
          iconBg,
          alert.severity === 'urgent' && alert.status === 'active' && 'urgent-pulse',
        )}>
          <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={cn('text-sm font-bold capitalize', severityColor(alert.severity))}>
              {alert.severity}
            </span>
            <span className="text-xs text-mist-500">·</span>
            <span className="text-xs text-mist-600 font-medium">{metricLabel(alert.metric)}</span>
            {horseName && (
              <>
                <span className="text-xs text-mist-500">·</span>
                <span className="text-xs text-mist-700 font-semibold">{horseName}</span>
              </>
            )}
            <span className="text-[10px] text-mist-400 ml-auto whitespace-nowrap">{formatRelative(alert.created_at)}</span>
          </div>
          <p className="text-sm text-mist-700 leading-snug mt-1">{alert.message}</p>
          {alert.persistence_detail && (
            <p className="text-[11px] text-mist-500 mt-1">
              {alert.persistence_detail}
            </p>
          )}
        </div>
      </div>

      {alert.recommendation && (
        <p className="text-xs text-mist-600 leading-snug pl-12 italic">
          {alert.recommendation}
        </p>
      )}

      {/* P3.2 — Alert explainer (why this fired) */}
      {alert.explainer && (
        <div className="pl-12">
          <button
            onClick={() => setShowExplainer(!showExplainer)}
            className="text-xs font-semibold text-mist-600 hover:text-mist-900 flex items-center gap-1"
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={2.5} />
            {showExplainer ? 'Hide' : 'Why did this fire?'}
          </button>
          {showExplainer && (
            <p className="text-xs text-mist-600 mt-2 bg-white/50 rounded-xl p-3 leading-snug">
              {alert.explainer}
            </p>
          )}
        </div>
      )}

      {/* P3.3 — Acknowledge + Dismiss with reason */}
      {alert.status === 'active' && (
        <div className="pl-12 pt-1 flex flex-wrap gap-2">
          <button
            onClick={() => acknowledge.mutate(alert.id)}
            disabled={acknowledge.isPending}
            className="text-xs font-semibold text-mist-700 hover:text-mist-900 flex items-center gap-1 bg-white/60 hover:bg-white px-2.5 py-1 rounded-lg disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
            {acknowledge.isPending ? 'Acknowledging…' : 'Acknowledge'}
          </button>
          <button
            onClick={() => setShowDismiss(!showDismiss)}
            className="text-xs font-semibold text-mist-500 hover:text-mist-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/40"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            Dismiss…
          </button>
        </div>
      )}

      {/* Dismiss reason picker */}
      {showDismiss && alert.status === 'active' && (
        <div className="pl-12">
          <div className="bg-white/70 rounded-xl p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider font-bold text-mist-500">
              Why are you dismissing? (helps us improve)
            </p>
            {DISMISS_REASONS.map((r) => (
              <button
                key={r.value}
                onClick={() => {
                  dismiss.mutate({ id: alert.id, reason: r.value })
                  setShowDismiss(false)
                }}
                disabled={dismiss.isPending}
                className="block w-full text-left rounded-lg hover:bg-white px-2.5 py-2 transition-colors disabled:opacity-50"
              >
                <p className="text-xs font-semibold text-mist-700">{r.label}</p>
                <p className="text-[11px] text-mist-500">{r.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {alert.status === 'acknowledged' && (
        <span className="pl-12 text-xs text-mist-500 flex items-center gap-1 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.5} />
          Acknowledged {alert.acknowledged_at ? formatRelative(alert.acknowledged_at) : ''}
        </span>
      )}

      {alert.status === 'dismissed' && (
        <span className="pl-12 text-xs text-mist-500 flex items-center gap-1 font-medium">
          <X className="h-3.5 w-3.5 text-mist-400" strokeWidth={2.5} />
          Dismissed
          {alert.dismissed_reason && (
            <span className="text-mist-400">
              · {DISMISS_REASONS.find((r) => r.value === alert.dismissed_reason)?.label.toLowerCase() ?? alert.dismissed_reason}
            </span>
          )}
        </span>
      )}

      {alert.status === 'resolved' && (
        <span className="pl-12 text-xs text-mist-500 flex items-center gap-1 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
          Resolved
        </span>
      )}
    </div>
  )
}
