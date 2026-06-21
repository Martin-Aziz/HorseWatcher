import type { Metadata } from 'next'
import './globals.css'
import { ProviderTree } from '@/components/layout/ProviderTree'

export const metadata: Metadata = {
  title: 'HorseWatcher — Equine Health Intelligence',
  description: '24/7 AI-powered health monitoring for horses. Know the moment something changes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProviderTree>{children}</ProviderTree>
      </body>
    </html>
  )
}
