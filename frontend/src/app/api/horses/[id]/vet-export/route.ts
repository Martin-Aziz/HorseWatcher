/**
 * Vet-shareable health export — Bet 4 of the PM artifact.
 *
 * Returns an HTML page styled for printing/saving as PDF. Vets can open this
 * link from anywhere without a HorseWatcher account. The page works in any
 * browser's print-to-PDF.
 *
 * Endpoint: GET /api/horses/[id]/vet-export?days=7
 */

import { NextResponse, type NextRequest } from 'next/server'
import { mockStore, type VetExportPayload } from '@/lib/mockData'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params
  const daysParam = req.nextUrl.searchParams.get('days')
  const days = daysParam ? Math.min(Math.max(parseInt(daysParam, 10) || 7, 1), 30) : 7

  const payload = mockStore().getVetExport(id, days)
  if (!payload) {
    return new NextResponse('Horse not found', { status: 404 })
  }

  const html = renderVetReport(payload)
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

/**
 * Render the vet report as standalone HTML. Inline styles — print-friendly,
 * works in any browser, prints to PDF cleanly.
 */
function renderVetReport(p: VetExportPayload): string {
  const horseAge = p.horse.date_of_birth
    ? Math.floor((Date.now() - new Date(p.horse.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null

  const generated = new Date(p.generated_at)
  const generatedStr = generated.toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>HorseWatcher report — ${escapeHtml(p.horse.name)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 32px;
    font-family: ui-sans-serif, -apple-system, "Segoe UI", sans-serif;
    color: #1e293b;
    background: #fff;
    line-height: 1.5;
    max-width: 820px;
    margin: 0 auto;
  }
  h1, h2, h3 { margin: 0; font-weight: 700; }
  h1 { font-size: 26px; }
  h2 { font-size: 16px; margin-top: 28px; margin-bottom: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 800; }
  h3 { font-size: 14px; margin-bottom: 6px; }
  p { margin: 0; }
  .header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 2px solid #f97316;
    padding-bottom: 18px;
    margin-bottom: 18px;
  }
  .brand { font-size: 13px; color: #f97316; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
  .meta { font-size: 11px; color: #64748b; text-align: right; }
  .horse-meta { color: #64748b; font-size: 13px; margin-top: 4px; }
  .summary-box {
    background: #f8fafc;
    border-left: 4px solid #f97316;
    padding: 14px 16px;
    border-radius: 6px;
    margin-bottom: 8px;
  }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
  th { background: #f1f5f9; font-weight: 700; color: #334155; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
  tr:last-child td { border-bottom: none; }
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .badge-urgent { background: #fee2e2; color: #b91c1c; }
  .badge-warning { background: #fef3c7; color: #92400e; }
  .badge-info { background: #dbeafe; color: #1d4ed8; }
  .badge-ok { background: #d1fae5; color: #065f46; }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .stat {
    background: #f8fafc;
    border-radius: 8px;
    padding: 12px 14px;
  }
  .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
  .stat-value { font-size: 18px; font-weight: 700; color: #1e293b; margin-top: 2px; }
  .stat-sub { font-size: 11px; color: #64748b; }
  .anomalous { color: #b91c1c; font-weight: 700; }
  .note-block {
    background: #fffbeb;
    border-left: 3px solid #f59e0b;
    padding: 10px 12px;
    margin-bottom: 8px;
    border-radius: 4px;
    font-size: 13px;
  }
  .note-meta { font-size: 11px; color: #92400e; margin-top: 4px; }
  .footer {
    margin-top: 36px;
    padding-top: 14px;
    border-top: 1px solid #e2e8f0;
    font-size: 10px;
    color: #94a3b8;
    text-align: center;
    line-height: 1.6;
  }
  .actions {
    background: #fef3c7;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 12px;
    color: #78350f;
    margin-bottom: 18px;
  }
  @media print {
    body { padding: 20px; }
    .actions { display: none; }
  }
</style>
</head>
<body>
  <div class="actions">
    💡 <strong>To save as PDF:</strong> File → Print → "Save as PDF" (Cmd/Ctrl + P).
  </div>

  <div class="header">
    <div>
      <p class="brand">🐴 HorseWatcher Health Report</p>
      <h1>${escapeHtml(p.horse.name)}</h1>
      <p class="horse-meta">
        ${escapeHtml(p.horse.breed ?? 'Unknown breed')}
        ${horseAge !== null ? ` · ${horseAge} years` : ''}
        ${p.horse.sex ? ` · ${escapeHtml(p.horse.sex)}` : ''}
        ${p.horse.weight_kg ? ` · ${p.horse.weight_kg} kg` : ''}
      </p>
    </div>
    <div class="meta">
      Generated ${escapeHtml(generatedStr)}<br/>
      ${p.window_days}-day window<br/>
      ${p.reading_count} readings · ${p.anomalous_count > 0 ? `<span class="anomalous">${p.anomalous_count} anomalous</span>` : '0 anomalous'}
    </div>
  </div>

  ${p.summary ? `
    <h2>Most recent overnight</h2>
    <div class="summary-box">
      <p style="font-weight: 700;">${escapeHtml(p.summary.headline)}</p>
      ${p.summary.detail.length > 0 ? `
        <ul style="margin: 6px 0 0 18px; padding: 0; font-size: 13px;">
          ${p.summary.detail.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  ` : ''}

  <h2>Baselines (last 30 days)</h2>
  <div class="grid">
    ${p.baselines.map((b) => `
      <div class="stat">
        <p class="stat-label">${escapeHtml(metricLabel(b.metric))}</p>
        <p class="stat-value">${formatNumber(b.mean, b.metric)} ${unit(b.metric)}</p>
        <p class="stat-sub">Normal range: ${formatNumber(b.lower_bound, b.metric)}–${formatNumber(b.upper_bound, b.metric)} · n=${b.sample_count}</p>
      </div>
    `).join('')}
  </div>

  ${p.alerts.length > 0 ? `
    <h2>Alerts in window</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 16%">Time</th>
          <th style="width: 12%">Severity</th>
          <th style="width: 15%">Metric</th>
          <th>Detail</th>
          <th style="width: 12%">Status</th>
        </tr>
      </thead>
      <tbody>
        ${p.alerts.map((a) => `
          <tr>
            <td>${escapeHtml(new Date(a.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }))}</td>
            <td><span class="badge badge-${a.severity}">${escapeHtml(a.severity)}</span></td>
            <td>${escapeHtml(metricLabel(a.metric))}</td>
            <td>${escapeHtml(a.message)}${a.persistence_detail ? ` <em style="color:#64748b;font-size:11px;">(${escapeHtml(a.persistence_detail)})</em>` : ''}</td>
            <td>${escapeHtml(a.status)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : `
    <h2>Alerts in window</h2>
    <p style="font-size: 13px; color: #64748b;">No alerts fired in this window.</p>
  `}

  ${p.notes.length > 0 ? `
    <h2>Owner observations</h2>
    ${p.notes.map((n) => `
      <div class="note-block">
        <p>${escapeHtml(n.content)}</p>
        <p class="note-meta">
          ${escapeHtml(new Date(n.recorded_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }))}
          ${n.vitals_snapshot ? ` · HR ${n.vitals_snapshot.heart_rate_bpm ?? '—'} bpm, ${n.vitals_snapshot.skin_temp_c?.toFixed(1) ?? '—'}°C` : ''}
        </p>
      </div>
    `).join('')}
  ` : ''}

  <h2>Hourly readings</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 18%">When</th>
        <th>Heart Rate</th>
        <th>HRV</th>
        <th>Temp</th>
        <th>Activity</th>
        <th style="width: 10%">Flag</th>
      </tr>
    </thead>
    <tbody>
      ${p.hourly_readings.slice(-48).map((r) => `
        <tr>
          <td>${escapeHtml(new Date(r.recorded_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }))}</td>
          <td>${r.heart_rate_bpm ?? '—'} bpm</td>
          <td>${r.hrv_ms?.toFixed(1) ?? '—'} ms</td>
          <td>${r.skin_temp_c?.toFixed(2) ?? '—'}°C</td>
          <td>${r.activity_index?.toFixed(0) ?? '—'}</td>
          <td>${r.is_anomalous ? '<span class="badge badge-warning">flagged</span>' : ''}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ${p.hourly_readings.length > 48 ? `<p style="font-size:11px;color:#94a3b8;margin-top:6px;">Showing last 48 hourly samples of ${p.hourly_readings.length} in window.</p>` : ''}

  <div class="footer">
    HorseWatcher is decision-support tooling, not a diagnostic device.<br/>
    This report summarises wearable-sensor observations and owner-captured notes for veterinary review.
  </div>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function metricLabel(metric: string): string {
  const labels: Record<string, string> = {
    heart_rate_bpm: 'Heart Rate',
    hrv_ms: 'HRV',
    skin_temp_c: 'Skin Temperature',
    rectal_temp_c: 'Core Temperature',
    activity_index: 'Activity',
    respiratory_rate: 'Respiratory Rate',
  }
  return labels[metric] ?? metric
}

function unit(metric: string): string {
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

function formatNumber(n: number, metric: string): string {
  if (metric === 'heart_rate_bpm' || metric === 'activity_index' || metric === 'respiratory_rate') {
    return n.toFixed(0)
  }
  return n.toFixed(1)
}
