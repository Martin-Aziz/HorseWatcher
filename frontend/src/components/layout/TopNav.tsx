'use client'

import { Search } from 'lucide-react'
import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/stable':    'Stable Overview',
  '/horses':    'Your Horses',
  '/alerts':    'Health Alerts',
  '/assistant': 'AI Health Insights',
}

export function TopNav() {
  const pathname = usePathname()
  const title = Object.entries(titles).find(([k]) => pathname.startsWith(k))?.[1] ?? 'HorseWatcher'
  const date = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  return (
    <header className="hidden md:flex items-center justify-between px-8 pt-6 pb-2">
      <div>
        <p className="text-xs font-semibold text-mist-500 uppercase tracking-wider">{date}</p>
        <h1 className="text-2xl font-bold text-mist-800 mt-0.5">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="glass rounded-2xl px-4 py-2.5 flex items-center gap-2.5 w-72">
          <Search className="h-4 w-4 text-mist-400" strokeWidth={2.5} />
          <input
            type="search"
            placeholder="Search horses…"
            aria-label="Search horses"
            className="flex-1 bg-transparent border-none outline-none text-sm text-mist-700 placeholder:text-mist-400"
          />
          <kbd className="text-[10px] text-mist-400 bg-white/50 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
        </div>
      </div>
    </header>
  )
}
