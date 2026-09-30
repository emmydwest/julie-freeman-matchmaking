import { safeText, sendTelegram, visitorLines, type VisitorContext } from '@/lib/telegram'
import { withinRateLimit } from '@/lib/rate-limit'

const allowedEvents = new Set(['visit', 'section_view', 'click', 'form_started', 'form_step'])

export async function POST(request: Request) {
  try {
    const body = await request.json() as { event?: string; label?: string; context?: VisitorContext }
    if (!body.event || !allowedEvents.has(body.event)) return Response.json({ ok: false }, { status: 400 })
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local'
    if (!withinRateLimit(`telemetry:${ip}`, 120, 60_000)) return Response.json({ ok: false }, { status: 429 })

    const message = [
      body.event === 'visit' ? '🌐 New website visit' : '👆 Website activity',
      `Event: ${safeText(body.event, 60)}`,
      body.label ? `Action: ${safeText(body.label, 300)}` : '',
      `Time: ${new Date().toISOString()}`,
      '',
      ...visitorLines(body.context || {}, request),
    ].filter(Boolean).join('\n')

    const result = await sendTelegram(message)
    return Response.json({ ok: true, configured: result.configured })
  } catch (error) {
    console.error('Telemetry delivery failed', error)
    return Response.json({ ok: false }, { status: 500 })
  }
}
