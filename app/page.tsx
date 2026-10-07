'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Heart, LockKeyhole, Menu, ShieldCheck, Sparkles, UserRoundCheck, X } from 'lucide-react'
import { ContactButtons, HeroCarousel, IntroductionVideo, SocialLinks, WhatsAppIcon } from '@/components/site-extras'
import { SampleTestimonials } from '@/components/testimonials'

const firstNames = [
  'Amelia', 'Sofia', 'Maya', 'Elena', 'Nora', 'Olivia', 'Camila', 'Naomi', 'Isla', 'Ava',
  'Zara', 'Mila', 'Layla', 'Chloe', 'Iris', 'Lucy', 'Aria', 'Lena', 'Grace', 'Mia',
  'Eva', 'Leah', 'Ruby', 'Clara', 'Jade', 'Emma',
]
const surnames = [
  'Bennett', 'Carter', 'Reyes', 'Morgan', 'Hayes', 'Rivera', 'Brooks', 'Sullivan', 'Parker',
  'Foster', 'Romero', 'Collins', 'Bell', 'Mendoza', 'Hughes', 'Flores', 'Ramirez', 'Price',
  'Ward', 'Ellis', 'Navarro', 'Bailey', 'Cruz', 'Cooper', 'Dawson', 'Kim',
]
const missingProfileNumbers = new Set([5741, 5801])
const profileNumbers = Array.from({ length: 158 }, (_, index) => 5657 + index).filter((number) => !missingProfileNumbers.has(number))
const profiles = profileNumbers.map((number, index) => ({
  image: `/profiles/IMG_${number}.${number === 5814 ? 'PNG' : 'JPG'}`,
  name: `${firstNames[index % firstNames.length]} ${surnames[(index * 7 + Math.floor(index / firstNames.length)) % surnames.length]}`,
  side: index % 2 === 0 ? 'left' : 'right',
}))

const steps = ['About you', 'Your life', 'Who you seek', 'The details']
const hobbies = ['Travel', 'Fitness', 'Food & wine', 'Live music', 'The outdoors', 'Art & culture', 'Reading', 'Sports', 'Dancing', 'Cooking', 'Film', 'Volunteering']
const qualities = ['Warm', 'Ambitious', 'Playful', 'Family-minded', 'Adventurous', 'Intellectual', 'Grounded', 'Affectionate', 'Independent', 'Creative']
const offices = [
  'Oak Park, California',
  'Los Angeles, California',
  'Santa Fe, New Mexico',
  'Denver, Colorado',
]

type FormState = {
  firstName: string; lastName: string; email: string; phone: string; age: string; city: string
  job: string; ethnicity: string; height: string; weight: string; relationshipStatus: string
  children: string; wantsChildren: string; smoking: string; drinking: string; hobbies: string[]
  about: string; qualities: string[]; partnerAge: string; partnerEthnicity: string
  partnerLocation: string; relationshipGoal: string; idealRelationship: string
  dealbreakers: string; matchNotes: string; confirmAdult: boolean; confirmSharing: boolean
}

const initialForm: FormState = {
  firstName: '', lastName: '', email: '', phone: '', age: '', city: '', job: '', ethnicity: '',
  height: '', weight: '', relationshipStatus: '', children: '', wantsChildren: '', smoking: '',
  drinking: '', hobbies: [], about: '', qualities: [], partnerAge: '', partnerEthnicity: '',
  partnerLocation: '', relationshipGoal: '', idealRelationship: '', dealbreakers: '', matchNotes: '',
  confirmAdult: false, confirmSharing: false,
}

type Consent = 'accepted' | 'declined' | null

function visitorContext() {
  let visitorId = sessionStorage.getItem('jfm-visitor-id')
  if (!visitorId) {
    visitorId = crypto.randomUUID()
    sessionStorage.setItem('jfm-visitor-id', visitorId)
  }
  const ua = navigator.userAgent
  const device = /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : /Windows/i.test(ua) ? 'Windows' : /Macintosh|Mac OS X/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : 'Other'
  return {
    visitorId, device, platform: navigator.platform || 'Unavailable',
    page: `${window.location.origin}${window.location.pathname}`,
  }
}

function ProfileImage({ profile, eager = false }: { profile: (typeof profiles)[number]; eager?: boolean }) {
  return <div className={`profile-photo profile-photo-${profile.side}`}><img src={profile.image} alt={`${profile.name}, private matchmaking member`} loading={eager ? 'eager' : 'lazy'} /></div>
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [visibleProfiles, setVisibleProfiles] = useState(12)
  const [form, setForm] = useState<FormState>(initialForm)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [consultationId, setConsultationId] = useState('')
  const [deliveryConfigured, setDeliveryConfigured] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [consent, setConsent] = useState<Consent>(null)

  const report = useCallback((event: string, label?: string) => {
    if (localStorage.getItem('jfm-reporting-consent') !== 'accepted') return
    void fetch('/api/telemetry', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
      body: JSON.stringify({ event, label, context: visitorContext() }),
    }).catch(() => undefined)
  }, [])

  useEffect(() => {
    const preference = localStorage.getItem('jfm-reporting-consent') as Consent
    if (preference === 'accepted' || preference === 'declined') setConsent(preference)
  }, [])

  useEffect(() => {
    if (consent !== 'accepted') return
    if (sessionStorage.getItem('jfm-visit-reported') === 'yes') return
    sessionStorage.setItem('jfm-visit-reported', 'yes')
    report('visit')
  }, [consent, report])

  useEffect(() => {
    document.body.style.overflow = formOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [formOpen])

  const progress = useMemo(() => `${((step + 1) / steps.length) * 100}%`, [step])
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }))
  const toggleList = (key: 'hobbies' | 'qualities', value: string) => {
    const current = form[key]
    update(key, current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  }
  const openForm = () => {
    setSaved(false)
    setStep(0)
    setFormOpen(true)
    if (sessionStorage.getItem('jfm-form-started-reported') !== 'yes') {
      sessionStorage.setItem('jfm-form-started-reported', 'yes')
      report('form_started')
    }
  }
  const submitProfile = async (event: FormEvent) => {
    event.preventDefault()
    if (step < steps.length - 1) { setStep(step + 1); return }
    setSubmitting(true)
    setSaveError('')
    try {
      const response = await fetch('/api/consultation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: form }),
      })
      const result = await response.json() as { ok?: boolean; reference?: string; delivered?: boolean; error?: string }
      if (!response.ok || !result.reference) throw new Error(result.error || 'Your profile could not be sent.')
      setConsultationId(result.reference)
      setDeliveryConfigured(result.delivered !== false)
      setSaved(true)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Your profile could not be sent. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  const downloadProfile = () => {
    const contents = Object.entries(form).map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1')}: ${Array.isArray(value) ? value.join(', ') : value}`).join('\n\n')
    const url = URL.createObjectURL(new Blob([contents], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = 'my-matchmaking-profile.txt'; link.click(); URL.revokeObjectURL(url)
  }

  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Julie Ferman Matchmaking home"><span className="brand-mark">JF</span><span>Julie Ferman<small>Personal matchmaking</small></span></a>
        <nav className="desktop-nav" aria-label="Main navigation"><a href="#members">Meet our members</a><a href="#difference">Why matchmaking</a><a href="#julie">Meet Julie</a><a href="#process">How it works</a></nav>
        <button className="nav-cta" onClick={openForm}>Start your profile <ArrowRight size={16} /></button>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation">{menuOpen ? <X /> : <Menu />}</button>
      </header>

      {menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation"><a href="#members" onClick={() => setMenuOpen(false)}>Meet our members</a><a href="#difference" onClick={() => setMenuOpen(false)}>Why matchmaking</a><a href="#julie" onClick={() => setMenuOpen(false)}>Meet Julie</a><a href="#process" onClick={() => setMenuOpen(false)}>How it works</a><button onClick={() => { setMenuOpen(false); openForm() }}>Start your profile</button></nav>}

      <HeroCarousel onStart={openForm} />

      <section className="marquee" aria-label="Our values"><span>25+ years of matchmaking</span><i>♥</i><span>40,000+ singles registered</span><i>♥</i><span>1,500+ couples credited</span><i>♥</i><span>Personal introductions</span></section>

      <section className="watch-section" id="watch"><div><p className="eyebrow">Before you schedule</p><h2>Meet Julie.<br/><em>Hear it from her.</em></h2><p>Take a moment to watch Julie explain why a personal conversation is the best place to begin.</p><p className="fee-note">Connection fees start at <strong>$50</strong> and vary by service. Speak with the team to confirm the cost before proceeding.</p><ContactButtons /></div><IntroductionVideo /></section>

      <section className="members-section" id="members">
        <div className="section-intro"><div><p className="eyebrow"><span /> A glimpse of our private network</p><h2>Women open to<br /><em>something real.</em></h2></div><p>These are a few of the women in our community. We share personal details only when there is mutual interest, because discretion matters on both sides.</p></div>
        <div className="profile-grid">
          {profiles.slice(0, visibleProfiles).map((profile, index) => <article className="profile-card" key={profile.image}><ProfileImage profile={profile} eager={index < 4} /><div className="profile-meta"><div><h3>{profile.name}</h3><p>Private profile</p></div><span><Heart size={15} /></span></div></article>)}
        </div>
        <div className="gallery-footer"><p>{visibleProfiles} of {profiles.length} private profiles</p>{visibleProfiles < profiles.length && <button className="load-button" onClick={() => setVisibleProfiles((count) => Math.min(count + 12, profiles.length))}>Show more women <ArrowRight size={16} /></button>}</div>
        <p className="alias-note"><ShieldCheck size={15} /> Display names are privacy aliases. Full profile details are shared only with permission.</p>
      </section>

      <section className="difference-section" id="difference">
        <div className="difference-heading"><p className="eyebrow light"><span /> A better way to meet</p><h2>Dating apps give you options.<br /><em>Julie gives you direction.</em></h2></div>
        <div className="comparison">
          <div className="comparison-column comparison-muted"><span className="comparison-label">The dating app cycle</span><div><strong>01</strong><p>Pay for visibility, boosts and conversations that go nowhere.</p></div><div><strong>02</strong><p>Sort through profiles without knowing who is serious or compatible.</p></div><div><strong>03</strong><p>Spend your time screening strangers and second-guessing their intentions.</p></div></div>
          <div className="comparison-column comparison-bright"><span className="comparison-label">The Julie Ferman approach</span><div><strong>01</strong><p>Tell an experienced matchmaker who you are and what you hope to find.</p></div><div><strong>02</strong><p>Receive introductions selected for values, lifestyle and mutual potential.</p></div><div><strong>03</strong><p>Meet with context and clarity, then give feedback that sharpens the next match.</p></div></div>
        </div>
      </section>

      <section className="process-section" id="process">
        <div className="process-copy"><p className="eyebrow"><span /> Personal, considered, discreet</p><h2>We do the looking.<br /><em>You do the meeting.</em></h2><p>Great matchmaking begins before the introduction. Your profile helps us understand the life you have built, the way you connect and the woman who could feel at home in it.</p><button className="primary-button" onClick={openForm}>Build my private profile <ArrowRight size={18} /></button></div>
        <div className="process-list"><article><span>01</span><div><h3>Tell us your story</h3><p>Complete a private profile covering your background, lifestyle, values and relationship goals.</p></div></article><article><span>02</span><div><h3>We learn your rhythm</h3><p>Your answers help us look beyond a checklist and understand the kind of connection that suits your life.</p></div></article><article><span>03</span><div><h3>Meet with intention</h3><p>When interest is mutual, we make a personal introduction and let the two of you take it from there.</p></div></article></div>
      </section>

      <section className="julie-section" id="julie">
        <div className="julie-portrait"><img src="/julie-portrait.jpg" alt="Julie Ferman smiling" /><div className="portrait-badge glass-panel"><Sparkles size={17} /><span>Matchmaker<br />Dating coach<br />Connector</span></div></div>
        <div className="julie-story"><p className="eyebrow"><span /> Meet your matchmaker</p><h2>Hi, I’m Julie.<br /><em>I know the people you should meet.</em></h2><p>For more than 25 years, Julie Ferman has helped relationship-minded singles make clearer choices and create meaningful connections. Her work combines a deeply personal interview process, an extensive private network and the instinct that comes from thousands of real introductions.</p>
          <a className="primary-button" href="#watch">Watch Julie’s introduction <ArrowRight size={16}/></a>
        </div>
      </section>

      <SampleTestimonials />
      <section className="press-section"><p className="eyebrow"><span /> Featured and trusted</p><h2>A recognized voice<br /><em>in modern matchmaking.</em></h2><div className="press-row"><img src="/press-washington-post.png" alt="The Washington Post" /><img src="/press-ft.png" alt="Financial Times" /><img src="/press-la-times.png" alt="Los Angeles Times" /><img src="/press-globeandmail.png" alt="The Globe and Mail" /><img src="/press-startribune.png" alt="Star Tribune" /></div></section>

      <section className="contact-section" id="contact"><div><p className="eyebrow light"><span /> Personal service, global reach</p><h2>Start wherever<br /><em>you are.</em></h2><p>Julie works personally with relationship-minded singles across cities, states and borders. Begin with your private profile and let the right conversation follow.</p><SocialLinks /></div><div className="office-cards">{offices.map((office, index) => <div key={office}><span>0{index + 1}</span><p>{office}</p></div>)}</div></section>

      <section className="final-cta"><p className="eyebrow light"><span /> Your next chapter can start differently</p><h2>You have done the swiping.<br /><em>Let us make the introduction.</em></h2><button className="cream-button" onClick={openForm}>Start my profile <ArrowRight size={18} /></button><p className="small-print">For men aged 18 and over. Submitted profiles are sent privately to Julie’s team.</p></section>

      <footer className="full-footer"><div className="footer-columns"><div><a className="brand footer-brand" href="#top"><span className="brand-mark">JF</span><span>Julie Ferman<small>Personal matchmaking</small></span></a><p>Thoughtful introductions. Real conversations. A more personal beginning.</p><SocialLinks /></div><div><h3>Explore</h3><a href="#members">Meet our members</a><a href="#watch">Watch Julie</a><a href="#process">How it works</a><button onClick={openForm}>Begin your questionnaire</button></div><div><h3>Let’s talk</h3><ContactButtons/><a href="https://wa.me/14782765512">WhatsApp: +1 (478) 276-5512</a><a href="tel:+14782765512">Call / text: +1 (478) 276-5512</a><p>Connection fees from $50.<br/>Final pricing confirmed with the team.</p></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Julie Ferman Matchmaking</span><span>For adults aged 18 and over.</span><button className="privacy-choice-link" onClick={() => { localStorage.removeItem('jfm-reporting-consent'); setConsent(null) }}>Privacy choices</button><a href="#top">Back to top ↑</a></div></footer>
      <a className="floating-whatsapp" href="https://wa.me/14782765512" target="_blank" rel="noreferrer" aria-label="Chat with Julie on WhatsApp"><WhatsAppIcon/><span>Chat with Julie</span></a>

      {formOpen && <div className="form-backdrop" role="presentation"><div className="form-panel" role="dialog" aria-modal="true" aria-labelledby="form-title"><button className="close-button" onClick={() => setFormOpen(false)} aria-label="Close questionnaire"><X /></button>
        {!saved ? <form onSubmit={submitProfile}>
          <div className="form-header"><p className="eyebrow"><span /> Your private profile</p><div className="step-count">Step {step + 1} of {steps.length}</div><h2 id="form-title">{steps[step]}</h2><div className="progress-track"><span style={{ width: progress }} /></div></div>
          <div className="form-body">
            {step === 0 && <div className="form-step"><p className="step-intro">Start with the basics. These details help us understand who you are and how to reach you.</p><div className="field-grid two">
              <label>First name *<input required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="James" /></label>
              <label>Last name *<input required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Anderson" /></label>
              <label>Email address *<input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="james@example.com" /></label>
              <label>Phone number<input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="Optional" /></label>
              <label>Age *<input required type="number" min="18" max="100" value={form.age} onChange={(e) => update('age', e.target.value)} placeholder="38" /></label>
              <label>City / region *<input required value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Where are you based?" /></label>
              <label>Occupation *<input required value={form.job} onChange={(e) => update('job', e.target.value)} placeholder="What do you do?" /></label>
              <label>Ethnicity<select value={form.ethnicity} onChange={(e) => update('ethnicity', e.target.value)}><option value="">Prefer not to say</option><option>Asian</option><option>Black / African heritage</option><option>Hispanic / Latino</option><option>Middle Eastern / North African</option><option>White / European heritage</option><option>Mixed heritage</option><option>Another background</option></select></label>
              <label>Height<input value={form.height} onChange={(e) => update('height', e.target.value)} placeholder={'e.g. 6\'1" / 185 cm'} /></label>
              <label>Weight<input value={form.weight} onChange={(e) => update('weight', e.target.value)} placeholder="Optional" /></label>
            </div></div>}

            {step === 1 && <div className="form-step"><p className="step-intro">Compatibility lives in everyday life. Help us understand yours.</p><div className="field-grid two">
              <label>Current relationship status<select required value={form.relationshipStatus} onChange={(e) => update('relationshipStatus', e.target.value)}><option value="">Select one</option><option>Single</option><option>Divorced</option><option>Widowed</option><option>Separated</option></select></label>
              <label>Do you have children?<select value={form.children} onChange={(e) => update('children', e.target.value)}><option value="">Select one</option><option>No</option><option>Yes, living at home</option><option>Yes, living independently</option></select></label>
              <label>Would you like children?<select value={form.wantsChildren} onChange={(e) => update('wantsChildren', e.target.value)}><option value="">Select one</option><option>Yes</option><option>No</option><option>Open to it</option><option>Not sure</option></select></label>
              <label>Smoking<select value={form.smoking} onChange={(e) => update('smoking', e.target.value)}><option value="">Select one</option><option>Never</option><option>Socially</option><option>Regularly</option><option>Trying to quit</option></select></label>
              <label>Drinking<select value={form.drinking} onChange={(e) => update('drinking', e.target.value)}><option value="">Select one</option><option>Never</option><option>Socially</option><option>Regularly</option></select></label>
            </div><fieldset><legend>How do you enjoy spending your time?</legend><p className="field-help">Choose as many as you like.</p><div className="chip-grid">{hobbies.map((hobby) => <button type="button" className={form.hobbies.includes(hobby) ? 'selected' : ''} onClick={() => toggleList('hobbies', hobby)} key={hobby}>{form.hobbies.includes(hobby) && <Check size={14} />}{hobby}</button>)}</div></fieldset><label>Tell us about yourself<textarea value={form.about} onChange={(e) => update('about', e.target.value)} placeholder="What are you proud of? What makes a good weekend? What should someone understand about you?" rows={5} /></label></div>}

            {step === 2 && <div className="form-step"><p className="step-intro">Forget the perfect résumé. Describe the woman and relationship that would feel right.</p><fieldset><legend>Which qualities draw you in?</legend><p className="field-help">Choose the ones that matter most.</p><div className="chip-grid">{qualities.map((quality) => <button type="button" className={form.qualities.includes(quality) ? 'selected' : ''} onClick={() => toggleList('qualities', quality)} key={quality}>{form.qualities.includes(quality) && <Check size={14} />}{quality}</button>)}</div></fieldset><div className="field-grid two">
              <label>Preferred age range<input value={form.partnerAge} onChange={(e) => update('partnerAge', e.target.value)} placeholder="e.g. 30–42" /></label>
              <label>Ethnicity preference<select value={form.partnerEthnicity} onChange={(e) => update('partnerEthnicity', e.target.value)}><option value="">Open to all backgrounds</option><option>Asian</option><option>Black / African heritage</option><option>Hispanic / Latino</option><option>Middle Eastern / North African</option><option>White / European heritage</option><option>Mixed heritage</option><option>Another background</option></select></label>
              <label>Location flexibility<select value={form.partnerLocation} onChange={(e) => update('partnerLocation', e.target.value)}><option value="">Select one</option><option>Local only</option><option>Within driving distance</option><option>Open to long-distance</option><option>Open to relocating</option></select></label>
              <label>Relationship goal *<select required value={form.relationshipGoal} onChange={(e) => update('relationshipGoal', e.target.value)}><option value="">Select one</option><option>A committed relationship</option><option>Marriage</option><option>Companionship that can grow</option><option>Still exploring</option></select></label>
            </div><label>Describe the relationship you want<textarea value={form.idealRelationship} onChange={(e) => update('idealRelationship', e.target.value)} placeholder="What would a healthy, happy partnership look like in your day-to-day life?" rows={5} /></label></div>}

            {step === 3 && <div className="form-step"><p className="step-intro">The details that never fit neatly into a dating profile are often the ones that matter most.</p><label>What are your non-negotiables or dealbreakers?<textarea value={form.dealbreakers} onChange={(e) => update('dealbreakers', e.target.value)} placeholder="Lifestyle, values, family plans, communication style…" rows={5} /></label><label>Anything else your matchmaker should know?<textarea value={form.matchNotes} onChange={(e) => update('matchNotes', e.target.value)} placeholder="Tell us what we have not asked but should understand." rows={5} /></label><label className="check-label"><input required type="checkbox" checked={form.confirmAdult} onChange={(e) => update('confirmAdult', e.target.checked)} /><span>I confirm that I am at least 18 years old and the information I have provided is accurate.</span></label><label className="check-label"><input required type="checkbox" checked={form.confirmSharing} onChange={(e) => update('confirmSharing', e.target.checked)} /><span>I agree to send my completed profile to Julie’s team through their private Telegram notifications so they can contact me about matchmaking.</span></label><div className="privacy-box"><LockKeyhole size={20} /><div><strong>Your information goes directly to Julie’s team</strong><p>Your city, preferences and other profile answers help the team find suitable introductions. Submitted answers are delivered through Telegram; optional visit analytics are a separate choice.</p></div></div></div>}
          </div>
          <div className="form-footer">{step > 0 ? <button type="button" className="back-button" onClick={() => setStep(step - 1)}><ChevronLeft size={17} /> Back</button> : <span />}<button className="form-next" type="submit" disabled={submitting}>{submitting ? 'Sending securely…' : step < steps.length - 1 ? 'Continue' : 'Send my profile'} {!submitting && <ArrowRight size={17}/>}</button></div>
          {saveError && <p className="form-submit-error" role="alert">{saveError}</p>}
        </form> : <div className="success-state"><div className="success-icon"><Check /></div><p className="eyebrow"><span /> {deliveryConfigured ? 'Profile received' : 'Reference created'}</p><h2>Thank you, {form.firstName || 'there'}.</h2><p>{deliveryConfigured ? 'Your answers have been submitted to Julie’s team. Save your consultation reference and include it when you contact Julie so she can find your profile quickly.' : 'Telegram reporting is not configured on this environment yet. Your reference was created, but please download your answers and send them to Julie directly.'}</p><div className="consultation-reference"><span>Your consultation reference</span><strong>{consultationId}</strong></div><ContactButtons consultationId={consultationId}/><p className="contact-instruction">WhatsApp Julie at <strong>+1 (478) 276-5512</strong> or call/text <strong>+1 (478) 276-5512</strong> and mention <strong>{consultationId}</strong>.</p><p className="fee-note">Connection fees start at <strong>$50</strong>. The team will confirm your service and price.</p><button className="primary-button" onClick={downloadProfile}>Download my answers <ArrowRight size={16}/></button><button className="back-button" onClick={() => setFormOpen(false)}>Return to the site</button></div>}
      </div></div>}
      {consent === null && <aside className="privacy-consent" aria-label="Privacy choices"><div><strong><span aria-hidden="true">🍪</span> Make yourself at home</strong><p>Allow optional analytics to help improve the site, or continue with necessary storage only. Matching uses the details you choose to share in your profile.</p><details className="consent-details"><summary>What does optional analytics collect?</summary><p>If you allow analytics, your IP address, approximate location, device/browser details and site activity are sent to Julie’s team through Telegram. Your choice is saved in your browser and can be changed using Privacy choices in the footer.</p></details></div><div><button onClick={() => { localStorage.setItem('jfm-reporting-consent', 'declined'); setConsent('declined') }}>Necessary only</button><button className="consent-accept" onClick={() => { localStorage.setItem('jfm-reporting-consent', 'accepted'); setConsent('accepted') }}>Allow analytics</button></div></aside>}
    </main>
  )
}
