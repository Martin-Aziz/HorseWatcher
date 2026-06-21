'use client'

import { useState } from 'react'
import { Phone, X, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SensorReading } from '@/types/reading'
import type { Alert } from '@/types/alert'

/**
 * "Should I call the vet?" guided check — P5.1 of the PM artifact.
 *
 * Three quick questions. Output is one of three clear recommendations:
 *   • Call vet now
 *   • Watch and re-check in 4 hours
 *   • No reason to call based on current data
 *
 * Solves Pain P5 (the binary call-or-wait uncertainty) — the most expensive
 * mistake horse owners make in either direction.
 */
type Answer = 'yes' | 'no' | null

type Q = {
  id: 'eating' | 'activity' | 'demeanor'
  label: string
  hint: string
  /** Yes = "no concern". So "yes" answer = concern_score 0; "no" = concern_score 1. */
  invert?: boolean
}

const QUESTIONS: Q[] = [
  {
    id: 'eating',
    label: 'Is the horse eating and drinking normally?',
    hint: 'Compare to their usual appetite — not just "is there food in the bucket."',
  },
  {
    id: 'activity',
    label: 'Is the horse standing comfortably without restlessness or rolling?',
    hint: 'Pacing, repeated lying down/getting up, or pawing are all red flags.',
  },
  {
    id: 'demeanor',
    label: 'Does the horse seem responsive — looking at you, ears tracking sound?',
    hint: 'Dullness, hanging head, or unresponsiveness are concerning even with normal vitals.',
  },
]

export function VetCheckButton({
  horseName,
  latestReading,
  activeAlerts,
}: {
  horseName: string
  latestReading: SensorReading | null | undefined
  activeAlerts: Alert[]
}) {
  const [open, setOpen] = useState(false)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [step, setStep] = useState<'questions' | 'result'>('questions')

  const hasUrgentAlert = activeAlerts.some((a) => a.severity === 'urgent' && a.status === 'active')
  const concernCount = Object.values(answers).filter((v) => v === 'no').length
  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined && answers[q.id] !== null)

  // Recommendation logic — combines guided answers with current vitals/alerts
  let recommendation: 'call_now' | 'watch_4h' | 'no_concern' = 'no_concern'
  if (hasUrgentAlert || concernCount >= 2) recommendation = 'call_now'
  else if (concernCount === 1 || activeAlerts.some((a) => a.severity === 'warning')) recommendation = 'watch_4h'

  function reset() {
    setAnswers({})
    setStep('questions')
  }

  function close() {
    setOpen(false)
    setTimeout(reset, 200) // wait for close animation to finish before resetting
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full glass-tinted-cool rounded-2xl p-4 flex items-start gap-3 hover:shadow-md transition-all hover:-translate-y-0.5 text-left"
      >
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
          <Phone className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-indigo-900">Should I call the vet?</p>
          <p className="text-xs text-indigo-700/80 mt-0.5 leading-snug">
            3 quick questions. Get a clear recommendation in 60 seconds.
          </p>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-mist-900/40 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="glass-strong rounded-3xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-mist-100 text-mist-500"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>

            <div className="mb-5">
              <p className="text-[10px] font-bold text-mist-500 uppercase tracking-wider mb-1">
                Vet decision support
              </p>
              <h3 className="text-xl font-bold text-mist-800">
                {step === 'questions' ? `Quick check for ${horseName}` : `Recommendation for ${horseName}`}
              </h3>
              {step === 'questions' && (
                <p className="text-sm text-mist-600 mt-1">
                  Answer based on what you can see right now — not what the sensors say.
                </p>
              )}
            </div>

            {step === 'questions' && (
              <>
                <div className="space-y-4">
                  {QUESTIONS.map((q) => (
                    <div key={q.id} className="bg-white/60 rounded-2xl p-4">
                      <p className="text-sm font-semibold text-mist-800 leading-snug">
                        {q.label}
                      </p>
                      <p className="text-xs text-mist-500 mt-1 leading-snug">{q.hint}</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setAnswers((p) => ({ ...p, [q.id]: 'yes' }))}
                          className={cn(
                            'flex-1 text-sm font-semibold py-2 rounded-xl',
                            answers[q.id] === 'yes'
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                              : 'bg-white text-mist-700 hover:bg-emerald-50',
                          )}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setAnswers((p) => ({ ...p, [q.id]: 'no' }))}
                          className={cn(
                            'flex-1 text-sm font-semibold py-2 rounded-xl',
                            answers[q.id] === 'no'
                              ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                              : 'bg-white text-mist-700 hover:bg-red-50',
                          )}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep('result')}
                  disabled={!allAnswered}
                  className="w-full mt-5 bg-gradient-to-br from-blue-500 to-indigo-600 disabled:opacity-40 text-white font-semibold py-3 rounded-2xl shadow-lg shadow-indigo-500/30"
                >
                  See recommendation
                </button>
              </>
            )}

            {step === 'result' && (
              <RecommendationView
                recommendation={recommendation}
                concernCount={concernCount}
                hasUrgentAlert={hasUrgentAlert}
                latestReading={latestReading}
                onReset={reset}
                onClose={close}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

function RecommendationView({
  recommendation,
  concernCount,
  hasUrgentAlert,
  latestReading,
  onReset,
  onClose,
}: {
  recommendation: 'call_now' | 'watch_4h' | 'no_concern'
  concernCount: number
  hasUrgentAlert: boolean
  latestReading: SensorReading | null | undefined
  onReset: () => void
  onClose: () => void
}) {
  const config = {
    call_now: {
      tint: 'glass-tinted-danger',
      iconBg: 'from-red-500 to-rose-600',
      Icon: AlertCircle,
      title: 'Call the vet now',
      body: hasUrgentAlert
        ? 'There\'s an active urgent alert and your direct observation confirms concern. Don\'t wait — call now.'
        : 'Your answers indicate multiple concerning signs. This warrants a call. The vet would rather hear from you at a false alarm than miss a real one.',
    },
    watch_4h: {
      tint: 'glass-tinted-warm',
      iconBg: 'from-amber-400 to-orange-500',
      Icon: Clock,
      title: 'Watch and re-check in 4 hours',
      body: 'There\'s one concerning sign — not enough alone to call but enough to not ignore. Check again in 4 hours. If anything worsens, call sooner.',
    },
    no_concern: {
      tint: 'glass-tinted-success',
      iconBg: 'from-emerald-400 to-teal-500',
      Icon: CheckCircle2,
      title: 'No reason to call right now',
      body: 'Your direct observations look reassuring, and current vitals support that. Continue normal routine. Trust your gut if anything changes.',
    },
  }[recommendation]

  const Icon = config.Icon

  return (
    <div>
      <div className={cn(config.tint, 'rounded-2xl p-5 flex items-start gap-3 mb-4')}>
        <div className={cn(
          'h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0',
          config.iconBg,
        )}>
          <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base text-mist-800">{config.title}</p>
          <p className="text-sm text-mist-700 mt-1 leading-snug">{config.body}</p>
        </div>
      </div>

      {/* Context summary */}
      <div className="bg-white/60 rounded-2xl p-3 space-y-1 mb-4">
        <p className="text-[10px] font-bold text-mist-500 uppercase tracking-wider">Decision context</p>
        <p className="text-xs text-mist-600">
          • {concernCount === 0 ? 'All 3 direct observations look normal' : `${concernCount} of 3 observations concerning`}
        </p>
        {hasUrgentAlert && (
          <p className="text-xs text-red-600 font-semibold">• Active urgent alert</p>
        )}
        {latestReading && (
          <p className="text-xs text-mist-600">
            • Last reading: HR {latestReading.heart_rate_bpm ?? '—'} bpm, temp {latestReading.skin_temp_c?.toFixed(1) ?? '—'}°C
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onReset}
          className="flex-1 text-sm font-semibold text-mist-700 bg-white hover:bg-mist-50 py-2.5 rounded-xl"
        >
          Re-do
        </button>
        <button
          onClick={onClose}
          className="flex-1 text-sm font-semibold text-white bg-mist-800 hover:bg-mist-900 py-2.5 rounded-xl"
        >
          Got it
        </button>
      </div>

      <p className="text-[10px] text-mist-400 text-center mt-3 leading-snug">
        This is decision support, not medical advice. When in doubt, trust your gut and call your vet.
      </p>
    </div>
  )
}
