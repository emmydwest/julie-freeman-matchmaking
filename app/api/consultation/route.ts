import { randomBytes } from 'node:crypto'
import { safeText, sendTelegram, visitorLines, type VisitorContext } from '@/lib/telegram'
import { withinRateLimit } from '@/lib/rate-limit'

type ConsultationRequest = {
  profile?: Record<string, unknown>
  context?: VisitorContext
}

const labels: Record<string, string> = {
  firstName: 'First name', lastName: 'Last name', email: 'Email', phone: 'Phone', age: 'Age', city: 'City / region',
  job: 'Occupation', ethnicity: 'Ethnicity', height: 'Height', weight: 'Weight', relationshipStatus: 'Relationship status',
  children: 'Children', wantsChildren: 'Wants children', smoking: 'Smoking', drinking: 'Drinking', hobbies: 'Hobbies',
  about: 'About', qualities: 'Desired qualities', partnerAge: 'Preferred age range', partnerEthnicity: 'Partner ethnicity preference',
  partnerLocation: 'Location flexibility', relationshipGoal: 'Relationship goal', idealRelationship: 'Ideal relationship',
  dealbreakers: 'Dealbreakers', matchNotes: 'Additional notes', confirmAdult: 'Adult confirmation', confirmSharing: 'Sharing consent',
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
    const answers = Object.entries(labels).map(([key, label]) => {
      const raw = profile[key]
      const value = Array.isArray(raw) ? raw.join(', ') : raw === true ? 'Yes' : raw === false ? 'No' : raw
      return `${label}: ${safeText(value || 'Not provided')}`
    })

    const message = [
      '💌 New matchmaking consultation',
      `Reference: ${reference}`,
      `Submitted: ${new Date().toISOString()}`,
      '',
      'PROFILE ANSWERS',
      ...answers,
      '',
      'VISITOR DETAILS',
      ...visitorLines(body.context || {}, request),
    ].join('\n')

    const result = await sendTelegram(message)
    return Response.json({ ok: true, reference, delivered: result.configured })
  } catch (error) {
    console.error('Consultation delivery failed', error)
    return Response.json({ ok: false, error: 'Could not submit the consultation.' }, { status: 500 })
  }
}
