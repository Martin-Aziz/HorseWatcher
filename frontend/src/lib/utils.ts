import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { AlertSeverity, AlertStatus } from '@/types/alert'
import type { HorseStatus } from '@/types/horse'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function severityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'urgent': return 'text-red-600'
    case 'warning': return 'text-amber-500'
    case 'info': return 'text-blue-500'
  }
}

export function severityBg(severity: AlertSeverity): string {
  switch (severity) {
    case 'urgent': return 'bg-red-50 border-red-200'
    case 'warning': return 'bg-amber-50 border-amber-200'
    case 'info': return 'bg-blue-50 border-blue-200'
  }
}

export function statusColor(status: HorseStatus): string {
  switch (status) {
    case 'ok': return 'text-emerald-600'
    case 'warning': return 'text-amber-500'
    case 'urgent': return 'text-red-600'
    case 'unknown': return 'text-slate-400'
  }
}

export function statusBgColor(status: HorseStatus): string {
  switch (status) {
    case 'ok': return 'bg-emerald-500'
    case 'warning': return 'bg-amber-400'
    case 'urgent': return 'bg-red-500'
    case 'unknown': return 'bg-slate-300'
  }
}

export function deriveHorseStatus(anomalyScore: number | null, activeAlerts: number): HorseStatus {
  if (activeAlerts > 0) {
    return anomalyScore !== null && anomalyScore >= 0.85 ? 'urgent' : 'warning'
  }
  if (anomalyScore === null) return 'unknown'
  if (anomalyScore >= 0.85) return 'urgent'
  if (anomalyScore >= 0.65) return 'warning'
  return 'ok'
}

export function metricLabel(metric: string): string {
  const labels: Record<string, string> = {
    heart_rate_bpm: 'Heart Rate',
    hrv_ms: 'HRV',
    skin_temp_c: 'Temperature',
    rectal_temp_c: 'Core Temp',
    activity_index: 'Activity',
    respiratory_rate: 'Resp. Rate',
  }
  return labels[metric] ?? metric
}

export function metricUnit(metric: string): string {
  const units: Record<string, string> = {
    heart_rate_bpm: 'bpm',
    hrv_ms: 'ms',
    skin_temp_c: '°C',
    rectal_temp_c: '°C',
    activity_index: '',
    respiratory_rate: '/min',
  }
  return units[metric] ?? ''
}
