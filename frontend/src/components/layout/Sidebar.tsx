'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Heart,
  Bell,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAlerts } from '@/hooks/useAlerts'

const navItems = [
  { href: '/stable',    label: 'Stable',    icon: LayoutGrid },
  { href: '/horses',    label: 'Horses',    icon: Heart },
  { href: '/alerts',    label: 'Alerts',    icon: Bell },
  { href: '/assistant', label: 'AI Insights', icon: Sparkles },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const { data: alerts } = useAlerts({ status: 'active' })
  const urgentCount = alerts?.filter((a) => a.severity === 'urgent').length ?? 0
  const warningCount = alerts?.filter((a) => a.severity === 'warning').length ?? 0

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-4 sticky top-0 h-screen">
        <div className="glass-strong rounded-3xl flex flex-col h-full p-4">
          {/* Logo */}
          <Link href="/stable" className="flex items-center gap-2.5 px-3 py-3 mb-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-carrot-400 to-carrot-600 flex items-center justify-center shadow-lg shadow-carrot-500/30 text-white text-lg">
              🐴
            </div>
            <div>
              <p className="font-bold text-mist-800 leading-none">HorseWatcher</p>
              <p className="text-[10px] text-mist-500 font-medium tracking-wider uppercase mt-0.5">Health Intelligence</p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex-1 space-y-1 mt-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              const showBadge = href === '/alerts' && (urgentCount + warningCount > 0)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium relative overflow-hidden',
                    active
                      ? 'text-carrot-700 bg-gradient-to-r from-carrot-100/80 to-carrot-50/40 shadow-sm'
                      : 'text-mist-600 hover:text-mist-900 hover:bg-white/50',
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-carrot-500 rounded-r-full" />
                  )}
                  <Icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-carrot-600')} strokeWidth={active ? 2.5 : 2} />
                  <span className="flex-1">{label}</span>
                  {showBadge && (
                    <span className="flex items-center gap-1">
                      {urgentCount > 0 && (
                        <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center urgent-pulse">
                          {urgentCount}
                        </span>
                      )}
                      {warningCount > 0 && urgentCount === 0 && (
                        <span className="text-[10px] font-bold bg-amber-400 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                          {warningCount}
                        </span>
                      )}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Demo banner */}
          <div className="glass-tinted-warm rounded-2xl p-3 text-xs text-carrot-800 mt-4">
            <p className="font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 live-dot" />
              Live demo · simulated sensors
            </p>
            <p className="text-[11px] text-carrot-700/80 mt-1 leading-snug">
              Most days you'll see green. We'll be specific when you need to look.
            </p>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3 px-2 py-3 mt-2 border-t border-white/40">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-mist-800 truncate">Anna Müller</p>
              <p className="text-[11px] text-mist-500">Horse Owner · Demo</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 glass-strong rounded-2xl p-2 flex items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl flex-1',
                active ? 'text-carrot-600 bg-carrot-50' : 'text-mist-500',
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
