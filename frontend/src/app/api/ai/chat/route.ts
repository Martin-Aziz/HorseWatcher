/**
 * AI chat API route — shells out to the local Claude Code CLI.
 *
 * Why claude CLI: zero auth setup for the demo. The host machine already
 * has `claude` installed; we pipe a prompt to it and stream the reply back.
 *
 * In production this would call the Anthropic API directly with a server-side
 * key. For the demo, this is faster, free (uses the user's existing Claude
 * subscription), and showcases what the AI feature looks like end-to-end.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { spawn } from 'node:child_process'
import { mockStore } from '@/lib/mockData'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CLAUDE_BINARY = process.env.CLAUDE_CLI_PATH ?? 'claude'
const CLAUDE_TIMEOUT_MS = 30_000

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  horse_id: string
  message: string
  conversation_history?: ChatMessage[]
}

export async function POST(req: NextRequest) {
  let body: ChatRequest
  try {
    body = (await req.json()) as ChatRequest
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  if (!body.message || typeof body.message !== 'string') {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }
  if (body.message.length > 2000) {
    return NextResponse.json({ error: 'message too long (max 2000 chars)' }, { status: 400 })
  }

  const store = mockStore()
  const horse = body.horse_id ? store.getHorse(body.horse_id) : null
  if (body.horse_id && !horse) {
    return NextResponse.json({ error: 'horse not found' }, { status: 404 })
  }

  // Gather live context to inject into the prompt.
  const latest = horse ? store.getLatestReading(horse.id) : null
  const baselines = horse ? store.getBaselines(horse.id) : []
  const activeAlerts = horse ? store.getAlerts({ horseId: horse.id, status: 'active' }) : []
  const baselineMap = Object.fromEntries(baselines.map((b) => [b.metric, b]))

  const systemPrompt = buildSystemPrompt({
    horseName: horse?.name ?? 'this horse',
    horseBreed: horse?.breed ?? null,
    latest,
    baselineMap,
    activeAlerts: activeAlerts.length,
    alertSummary: activeAlerts.length > 0
      ? activeAlerts.map((a) => `${a.severity}: ${a.message}`).join(' | ')
      : 'none',
  })

  const conversation = body.conversation_history ?? []
  const fullPrompt = formatConversation(systemPrompt, conversation, body.message)

  try {
    const reply = await callClaudeCLI(fullPrompt)
    return NextResponse.json({ reply })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[ai/chat] Claude CLI failed:', msg)
    return NextResponse.json(
      {
        error: 'AI assistant unavailable',
        detail: msg,
        // Graceful fallback so the demo still works if claude CLI isn't installed.
        reply: buildFallbackReply(horse?.name ?? 'this horse', latest, activeAlerts.length),
      },
      { status: 200 },
    )
  }
}

interface PromptContext {
  horseName: string
  horseBreed: string | null
  latest: ReturnType<ReturnType<typeof mockStore>['getLatestReading']>
  baselineMap: Record<string, { mean: number; lower_bound: number; upper_bound: number }>
  activeAlerts: number
  alertSummary: string
}

function buildSystemPrompt(ctx: PromptContext): string {
  const lines: string[] = [
    `You are HorseWatcher AI, an equine health assistant helping monitor ${ctx.horseName}${ctx.horseBreed ? ` (${ctx.horseBreed})` : ''}.`,
    ``,
    `YOUR JOB IS TO REASSURE WHEN APPROPRIATE AND CONCERN WHEN APPROPRIATE — not to optimize performance.`,
    `This product serves owners after a vet event, owners who worry, and yard managers responsible for many horses.`,
    `Their primary need is peace of mind grounded in real data. Their secondary need is a clear signal when something needs attention.`,
    ``,
    `Tone rules:`,
    `• Warm, plain language. Like a knowledgeable friend, not a clinical report.`,
    `• Lead with reassurance when the data supports it. Don't manufacture concern.`,
    `• When concern is warranted, name it specifically and recommend an action.`,
    `• Keep responses under 100 words unless the user explicitly asks for detail.`,
    `• Never diagnose specific conditions (colic, laminitis, ulcers...). Describe observations and suggest direct check or vet consultation.`,
    `• Don't suggest the owner is overreacting — they came here because they care.`,
    ``,
    `Concern rating — use this exact scale when summarising:`,
    `• Normal — vitals match this horse's typical pattern`,
    `• Slightly elevated — one metric outside normal range but not concerning alone`,
    `• Moderate concern — multiple metrics deviating, or one persistent deviation`,
    `• High concern — recommend direct observation and likely vet consultation`,
    ``,
    `=== Live data for ${ctx.horseName} ===`,
  ]

  if (ctx.latest) {
    if (ctx.latest.heart_rate_bpm !== null) {
      const bl = ctx.baselineMap['heart_rate_bpm']
      lines.push(`Heart rate: ${ctx.latest.heart_rate_bpm} bpm` + (bl ? ` (baseline ${bl.mean.toFixed(0)}, normal range ${bl.lower_bound.toFixed(0)}–${bl.upper_bound.toFixed(0)})` : ''))
    }
    if (ctx.latest.skin_temp_c !== null) {
      const bl = ctx.baselineMap['skin_temp_c']
      lines.push(`Skin temperature: ${ctx.latest.skin_temp_c.toFixed(2)}°C` + (bl ? ` (baseline ${bl.mean.toFixed(2)}°C, normal range ${bl.lower_bound.toFixed(2)}–${bl.upper_bound.toFixed(2)})` : ''))
    }
    if (ctx.latest.hrv_ms !== null) {
      const bl = ctx.baselineMap['hrv_ms']
      lines.push(`Heart rate variability (HRV): ${ctx.latest.hrv_ms.toFixed(1)} ms` + (bl ? ` (baseline ${bl.mean.toFixed(0)} ms, lower HRV typically indicates stress)` : ''))
    }
    if (ctx.latest.activity_index !== null) {
      lines.push(`Activity index: ${ctx.latest.activity_index.toFixed(0)}/100`)
    }
    lines.push(`Anomaly score: ${((ctx.latest.anomaly_score ?? 0) * 100).toFixed(0)}% (>65% = warranting a look, >85% = urgent)`)
  } else {
    lines.push(`No recent readings available.`)
  }

  lines.push(``, `Active alerts: ${ctx.activeAlerts}`)
  if (ctx.activeAlerts > 0) {
    lines.push(`Alert details: ${ctx.alertSummary}`)
  } else {
    lines.push(`Status: no active alerts — most days this is the normal state, and that's good news.`)
  }

  lines.push(``, `Answer the user's question using this data. If everything looks normal, say so plainly and warmly.`)
  return lines.join('\n')
}

function formatConversation(
  system: string,
  history: ChatMessage[],
  userMessage: string,
): string {
  const parts = [system, '']
  history.slice(-6).forEach((m) => {
    parts.push(m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`)
  })
  parts.push(`User: ${userMessage}`)
  parts.push(`Assistant:`)
  return parts.join('\n')
}

function callClaudeCLI(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(CLAUDE_BINARY, ['-p', '--output-format', 'text'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: CLAUDE_TIMEOUT_MS,
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf-8')
    })
    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf-8')
    })

    proc.on('error', (err) => {
      reject(new Error(`claude CLI spawn failed: ${err.message}`))
    })

    proc.on('close', (code, signal) => {
      if (signal === 'SIGTERM') {
        reject(new Error('claude CLI timed out'))
        return
      }
      if (code !== 0) {
        reject(new Error(`claude CLI exited ${code}: ${stderr.slice(0, 300)}`))
        return
      }
      const reply = stdout.trim()
      if (!reply) {
        reject(new Error('claude CLI returned empty response'))
        return
      }
      resolve(reply)
    })

    proc.stdin.write(prompt)
    proc.stdin.end()
  })
}

function buildFallbackReply(
  horseName: string,
  latest: ReturnType<ReturnType<typeof mockStore>['getLatestReading']>,
  activeAlerts: number,
): string {
  const parts: string[] = []
  if (activeAlerts > 0) {
    parts.push(`${horseName} has ${activeAlerts} active alert${activeAlerts > 1 ? 's' : ''} worth checking.`)
  }
  if (latest?.heart_rate_bpm) {
    const score = (latest.anomaly_score ?? 0) * 100
    const concern = score > 85 ? 'High concern' : score > 65 ? 'Moderate concern' : score > 40 ? 'Slightly elevated' : 'Normal'
    parts.push(`Current heart rate is ${latest.heart_rate_bpm} bpm and skin temperature is ${latest.skin_temp_c?.toFixed(1)}°C. Status: ${concern}.`)
  }
  parts.push(`(AI assistant offline — showing data summary. Install Claude Code CLI to enable full chat.)`)
  return parts.join(' ')
}
