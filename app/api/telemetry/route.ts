import { sendTelegram, visitorLines, type VisitorContext } from '@/lib/telegram'
import { withinRateLimit } from '@/lib/rate-limit'

const allowedEvents = new Set(['visit', 'form_started'])

function eventTitle(event: string) {
  return event === 'visit' ? '🌐 SITE VISIT' : '📝 QUESTIONNAIRE OPENED'
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { event?: string; context?: VisitorContext }
    if (!body.event || !allowedEvents.has(body.event)) return Response.json({ ok: false }, { status: 400 })
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local'
    if (!withinRateLimit(`telemetry:${ip}`, 12, 10 * 60_000)) return Response.json({ ok: false }, { status: 429 })

    const message = [
      eventTitle(body.event),
      `🕒 ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC`,
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
