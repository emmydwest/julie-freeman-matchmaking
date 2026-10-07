const TELEGRAM_API = 'https://api.telegram.org'

export type VisitorContext = {
  visitorId?: string
  device?: string
  platform?: string
  page?: string
}

function clean(value: unknown, max = 1200) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max)
}

function decodeHeader(value: string) {
  try { return decodeURIComponent(value) } catch { return value }
}

export function requestDetails(request: Request) {
  const headers = request.headers
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwarded || headers.get('x-real-ip') || 'Unavailable'
  const city = decodeHeader(headers.get('x-vercel-ip-city') || headers.get('cf-ipcity') || '')
  const region = headers.get('x-vercel-ip-country-region') || headers.get('cf-region') || ''
  const country = headers.get('x-vercel-ip-country') || headers.get('cf-ipcountry') || ''
  const location = [city, region, country].filter(Boolean).join(', ') || 'Unavailable from hosting provider'
  return {
    ip: clean(ip, 100),
    location: clean(location, 200),
    referrer: clean(headers.get('referer') || 'Direct / unavailable', 500),
  }
}

export function visitorLines(context: VisitorContext, request: Request) {
  const details = requestDetails(request)
  return [
    `👤 ${clean(context.visitorId || 'Visitor ID unavailable', 80)} · ${details.ip}`,
    `📍 ${details.location}`,
    `📱 ${clean(context.device || 'Device unavailable', 60)} · ${clean(context.platform || 'Platform unavailable', 80)}`,
    `🔗 ${clean(context.page || 'Page unavailable', 300)}`,
    `↩️ ${clean(details.referrer, 250)}`,
  ].filter(Boolean)
}

export async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return { configured: false }

  const chunks: string[] = []
  let remaining = clean(text, 16000)
  while (remaining) {
    let cut = Math.min(3900, remaining.length)
    if (cut < remaining.length) {
      const newline = remaining.lastIndexOf('\n', cut)
      if (newline > 2500) cut = newline
    }
    chunks.push(remaining.slice(0, cut))
    remaining = remaining.slice(cut).trimStart()
  }

  for (const chunk of chunks) {
    const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: chunk, disable_web_page_preview: true }),
      cache: 'no-store',
    })
    if (!response.ok) throw new Error(`Telegram returned ${response.status}`)
  }

  return { configured: true }
}

export function safeText(value: unknown, max = 1200) {
  return clean(value, max)
}
