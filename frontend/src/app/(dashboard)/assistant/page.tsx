'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react'
import { useHorses } from '@/hooks/useHorses'
import { useLatestReading } from '@/hooks/useReadings'
import { useHorseAlerts } from '@/hooks/useAlerts'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTERS = [
  'Is my horse okay right now?',
  'What does the recent change in HRV suggest?',
  'Should I be worried about the active alerts?',
  'How was last night?',
]

export default function AssistantPage() {
  const { data: horses } = useHorses()
  const [selectedHorseId, setSelectedHorseId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (horses && horses.length > 0 && !selectedHorseId) {
      // Default to Piper (the urgent-case horse) for the most compelling demo.
      const piper = horses.find((h) => h.name === 'Piper')
      setSelectedHorseId(piper?.id ?? horses[0].id)
    }
  }, [horses, selectedHorseId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const selectedHorse = horses?.find((h) => h.id === selectedHorseId)
  const { data: latest } = useLatestReading(selectedHorseId)
  const { data: alerts } = useHorseAlerts(selectedHorseId)
  const activeAlerts = alerts?.filter((a) => a.status === 'active') ?? []

  async function sendMessage(messageText?: string) {
    const text = (messageText ?? input).trim()
    if (!text || !selectedHorseId || loading) return

    setError(null)
    const userMessage: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horse_id: selectedHorseId,
          message: userMessage.content,
          conversation_history: messages,
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = (await res.json()) as { reply: string; error?: string }
      if (data.error) {
        setError(data.error)
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'unknown error'
      setError(msg)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I couldn\'t reach the AI service. Check that the Claude Code CLI is installed and try again.' },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function clearChat() {
    setMessages([])
    setError(null)
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] pb-20 md:pb-0">
      {/* Header */}
      <div className="glass-strong rounded-3xl p-5 sm:p-6 mb-4 relative overflow-hidden">
        <span className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-gradient-to-br from-violet-200/50 to-indigo-300/40 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/30 shrink-0">
            <Sparkles className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-mist-800">AI Health Assistant</h2>
            <p className="text-sm text-mist-600">Live vitals + active alerts are sent with every question.</p>
          </div>
          {horses && horses.length > 0 && (
            <select
              value={selectedHorseId}
              onChange={(e) => {
                setSelectedHorseId(e.target.value)
                clearChat()
              }}
              aria-label="Select horse for AI assistant context"
              className="glass-subtle rounded-2xl px-4 py-2.5 text-sm font-semibold text-mist-700 cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              {horses.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Context summary */}
        {selectedHorse && latest && (
          <div className="relative mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <ContextChip label="HR" value={`${latest.heart_rate_bpm ?? '—'} bpm`} color="text-rose-500" />
            <ContextChip label="Temp" value={`${latest.skin_temp_c?.toFixed(1) ?? '—'}°C`} color="text-amber-500" />
            <ContextChip label="HRV" value={`${latest.hrv_ms?.toFixed(0) ?? '—'} ms`} color="text-violet-500" />
            <ContextChip
              label="Alerts"
              value={activeAlerts.length > 0 ? `${activeAlerts.length} active` : 'None'}
              color={activeAlerts.length > 0 ? 'text-red-500' : 'text-emerald-500'}
            />
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 glass rounded-3xl p-4 sm:p-6 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/30">
              <Sparkles className="h-10 w-10 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="font-bold text-mist-800 text-lg">
                Ask me about {selectedHorse?.name ?? 'your horse'}
              </p>
              <p className="text-sm text-mist-500 mt-1 max-w-md">
                Powered by Claude. I have access to live vitals, 30-day baselines, and active alerts.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full mt-2">
              {STARTERS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={!selectedHorseId}
                  className="glass-subtle rounded-2xl px-4 py-3 text-sm text-mist-700 hover:bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-tinted-danger rounded-2xl px-4 py-2.5 mb-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-xs text-red-800 flex-1 truncate">{error}</p>
          <button onClick={() => setError(null)} className="text-xs text-red-700 font-semibold">Dismiss</button>
        </div>
      )}

      {/* Input */}
      <div className="glass-strong rounded-2xl p-2 flex gap-2 items-center">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          placeholder={`Ask about ${selectedHorse?.name ?? 'your horse'}…`}
          aria-label="Type a message"
          className="flex-1 bg-transparent border-none outline-none text-sm text-mist-700 placeholder:text-mist-400 px-3"
          disabled={loading || !selectedHorseId}
        />
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            aria-label="Clear conversation"
            className="text-xs font-semibold text-mist-500 hover:text-mist-800 px-2"
          >
            Clear
          </button>
        )}
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim() || !selectedHorseId}
          aria-label="Send message"
          className="bg-gradient-to-br from-violet-500 to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 flex items-center gap-1.5 text-sm font-semibold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5"
        >
          <Send className="h-4 w-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  )
}

function ContextChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="glass-subtle rounded-xl px-3 py-2 flex items-baseline gap-2">
      <span className="text-[10px] font-semibold text-mist-500 uppercase tracking-wider">{label}</span>
      <span className={cn('text-sm font-bold tabular-nums', color)}>{value}</span>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex gap-3 max-w-[85%]', isUser ? 'ml-auto flex-row-reverse' : '')}>
      <div className={cn(
        'h-9 w-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md',
        isUser
          ? 'bg-gradient-to-br from-carrot-400 to-pink-500'
          : 'bg-gradient-to-br from-violet-500 to-indigo-600',
      )}>
        {isUser ? <User className="h-4 w-4 text-white" strokeWidth={2.5} /> : <Bot className="h-4 w-4 text-white" strokeWidth={2.5} />}
      </div>
      <div className={cn(
        'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
        isUser
          ? 'bg-gradient-to-br from-carrot-500 to-pink-500 text-white rounded-tr-md shadow-lg shadow-carrot-500/20'
          : 'glass-subtle text-mist-700 rounded-tl-md',
      )}>
        {message.content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-[85%]">
      <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
        <Bot className="h-4 w-4 text-white" strokeWidth={2.5} />
      </div>
      <div className="glass-subtle rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 bg-violet-400 rounded-full"
            style={{ animation: 'live-pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
