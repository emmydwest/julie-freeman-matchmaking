import { randomBytes } from 'node:crypto'
import { safeText, sendTelegram } from '@/lib/telegram'
import { withinRateLimit } from '@/lib/rate-limit'

type ConsultationRequest = {
  profile?: Record<string, unknown>
}

function answer(profile: Record<string, unknown>, key: string, label: string) {
  const raw = profile[key]
  const value = Array.isArray(raw) ? raw.join(', ') : raw === true ? 'Yes' : raw === false ? 'No' : raw
  const compact = safeText(value || '', 1200).replace(/\s+/g, ' ')
  return compact ? `${label}: ${compact}` : ''
}

function answerGroup(profile: Record<string, unknown>, title: string, fields: Array<[string, string]>) {
  const values = fields.map(([key, label]) => answer(profile, key, label)).filter(Boolean)
  return values.length ? [title, `• ${values.join('  ·  ')}`] : []
}

function consultationId() {
  const date = new Date().toISOString().slice(2, 10).replaceAll('-', '')
  return `JFM-${date}-${randomBytes(3).toString('hex').toUpperCase()}`
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local'
    if (!withinRateLimit(`consultation:${ip}`, 5, 10 * 60_000)) {
      return Response.json({ ok: false, error: 'Too many submissions. Please wait a few minutes and try again.' }, { status: 429 })
    }
    const body = await request.json() as ConsultationRequest
    const profile = body.profile || {}
    if (!profile.confirmAdult || !profile.confirmSharing || !profile.firstName || !profile.email) {
      return Response.json({ ok: false, error: 'Required profile details or consent are missing.' }, { status: 400 })
    }

    const reference = consultationId()
    const message = [
      '💌 NEW MATCHMAKING CONSULTATION',
      `🆔 ${reference}  ·  🕒 ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC`,
      '✅ Adult and sharing consent confirmed',
      '',
      ...answerGroup(profile, '👤 CONTACT & BASICS', [
        ['firstName', 'First'], ['lastName', 'Last'], ['age', 'Age'], ['city', 'City'],
        ['job', 'Work'], ['email', 'Email'], ['phone', 'Phone'],
      ]),
      ...answerGroup(profile, '🌿 LIFESTYLE', [
        ['relationshipStatus', 'Status'], ['ethnicity', 'Background'], ['children', 'Children'],
        ['wantsChildren', 'Wants children'], ['smoking', 'Smoking'], ['drinking', 'Drinking'],
        ['height', 'Height'], ['weight', 'Weight'], ['hobbies', 'Hobbies'],
      ]),
      ...answerGroup(profile, '💞 MATCH PREFERENCES', [
        ['relationshipGoal', 'Goal'], ['partnerAge', 'Age range'], ['partnerEthnicity', 'Background'],
        ['partnerLocation', 'Location'], ['qualities', 'Qualities'],
      ]),
      ...answerGroup(profile, '📝 PERSONAL NOTES', [
        ['about', 'About'], ['idealRelationship', 'Ideal relationship'],
        ['dealbreakers', 'Dealbreakers'], ['matchNotes', 'Extra notes'],
      ]),
    ].join('\n')

    const result = await sendTelegram(message)
    return Response.json({ ok: true, reference, delivered: result.configured })
  } catch (error) {
    console.error('Consultation delivery failed', error)
    return Response.json({ ok: false, error: 'Could not submit the consultation.' }, { status: 500 })
  }
}
