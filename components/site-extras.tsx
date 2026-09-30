'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, Phone, MessageCircle, Volume2, VolumeX, Maximize } from 'lucide-react'
import { BrandIcon } from '@/components/brand-icon'

export function WhatsAppIcon() {
  return <BrandIcon brand="whatsapp" />
}

export function ContactButtons({ consultationId }: { consultationId?: string }) {
  const message = consultationId ? `Hello Julie, I completed my matchmaking profile. My consultation reference is ${consultationId}.` : ''
  const whatsapp = `https://wa.me/14143177395${message ? `?text=${encodeURIComponent(message)}` : ''}`
  const sms = `sms:+13215224265${message ? `?body=${encodeURIComponent(message)}` : ''}`
  return <div className="contact-buttons"><a className="whatsapp-button" href={whatsapp} target="_blank" rel="noreferrer"><WhatsAppIcon /> WhatsApp Julie</a><a href="tel:+13215224265"><Phone size={16}/> Call Julie</a><a href={sms}><MessageCircle size={16}/> Text Julie</a></div>
}

export function SocialLinks() {
  return <div className="social-links"><a href="https://instagram.com/julieferman" target="_blank" rel="noreferrer"><BrandIcon brand="instagram" /> Instagram</a><a href="https://linkedin.com/in/julieferman" target="_blank" rel="noreferrer"><BrandIcon brand="linkedin" /> LinkedIn</a><a href="https://youtube.com/channel/UCbzcqJioANEXrYQ26EHDOjw" target="_blank" rel="noreferrer"><BrandIcon brand="youtube" /> YouTube</a></div>
}

const slides = [
  { title: 'Stop swiping.', accent: 'Meet someone worth knowing.', text: 'Thoughtful, personal introductions shaped around your values, chemistry and real life.', photos: [] },
  { title: 'A little spark.', accent: 'A world of possibility.', text: 'Start with a conversation about you. Let Julie help you discover who could be a wonderful fit.', photos: [5662, 5671, 5720, 5740] },
  { title: 'Your kind of person.', accent: 'Your kind of connection.', text: 'Different personalities. Different stories. A personal search for the connection that feels right to you.', photos: [5683, 5694, 5712, 5735, 5753] },
  { title: 'Make room', accent: 'for your next chapter.', text: 'Look beyond a photograph. Shared values, everyday compatibility and mutual interest make an introduction meaningful.', photos: [5667, 5718, 5787] },
]

export function HeroCarousel({ onStart }: { onStart: () => void }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true)
  }, [])
  useEffect(() => {
    if (paused || hovered || focused) return
    const timer = window.setInterval(() => setActive((s) => (s + 1) % slides.length), 7000)
    return () => clearInterval(timer)
  }, [paused, hovered, focused])
  const slide = slides[active]
  return <section className={`hero carousel-hero ${active ? 'collage-hero' : ''}`} aria-label="Meet Julie and our community" aria-roledescription="carousel" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false) }}>
    <img className="hero-background" src="/julie-hero-landscape.jpg" alt="Julie Ferman, matchmaker and dating coach" />
    <div className="hero-scrim" />
    <div className="hero-slide" key={active} role="group" aria-roledescription="slide" aria-label={`${active + 1} of ${slides.length}`}>
      <div className="hero-copy glass-panel"><p className="eyebrow">Personal matchmaking for men</p><h1>{slide.title}<br/><em>{slide.accent}</em></h1><p className="hero-lead">{slide.text}</p><div className="hero-actions"><button className="primary-button" onClick={onStart}>Start your story <ChevronRight size={16}/></button><a href="#watch" className="secondary-link">Watch Julie’s introduction</a></div><div className="hero-contact"><p>Prefer a conversation first?</p><ContactButtons /></div><p className="hero-fee">Connection fees from <strong>$50</strong> · Personal introductions</p></div>
      {active > 0 && <div className={`hero-mosaic mosaic-${slide.photos.length}`}>{slide.photos.map((number, index) => <figure key={number}><div className={`profile-photo profile-photo-${index % 2 ? 'right' : 'left'}`}><img src={`/profiles/IMG_${number}.JPG`} alt="A preview from the women’s network" /></div><figcaption>{['A new possibility', 'An introduction away', 'A story to discover', 'Room for connection', 'Meet with intention'][index]}</figcaption></figure>)}</div>}
      {active === 0 && <div className="hero-proof glass-panel"><span>Matchmaking since 2001</span><strong>40,000+</strong><small>singles privately registered</small><strong>1,500+</strong><small>couples credited</small></div>}
    </div>
    <div className="carousel-controls"><button aria-label="Previous slide" onClick={() => setActive((s) => (s + 3) % 4)}><ChevronLeft size={16}/></button>{slides.map((_, index) => <button key={index} className={`slide-dot ${index === active ? 'active' : ''}`} aria-label={`Go to slide ${index + 1}`} aria-current={index === active ? 'true' : undefined} onClick={() => setActive(index)}/>) }<button aria-label="Next slide" onClick={() => setActive((s) => (s + 1) % 4)}><ChevronRight size={16}/></button><button aria-label={paused ? 'Play slideshow' : 'Pause slideshow'} onClick={() => setPaused(!paused)}>{paused ? <Play size={14}/> : <Pause size={14}/>}</button><span>0{active + 1} / 04</span></div>
  </section>
}

function timestamp(seconds: number) { return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}` }

export function IntroductionVideo() {
  const video = useRef<HTMLVideoElement>(null)
  const player = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState('')
  const toggle = async () => {
    if (!video.current) return
    try { if (video.current.paused) await video.current.play(); else video.current.pause() } catch { setError('Playback could not start. Please try again or open the video below.') }
  }
  return <div className="custom-player" ref={player}>
    <video ref={video} src="/WhySchedule.mp4" poster="/julie-hero-landscape.jpg" preload="metadata" playsInline onPlay={() => { setPlaying(true); setError('') }} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onLoadedMetadata={() => setDuration(video.current?.duration || 0)} onTimeUpdate={() => setTime(video.current?.currentTime || 0)} onError={() => setError('This browser could not play the video. Please open it directly below.')} />
    {!playing && <button className="video-play-overlay" onClick={toggle} aria-label="Play Julie’s introduction"><Play size={25} fill="currentColor"/><span>Why schedule with Julie?</span></button>}
    <div className="player-controls"><button onClick={toggle} aria-label={playing ? 'Pause video' : 'Play video'}>{playing ? <Pause size={18}/> : <Play size={18}/>}</button><span>{timestamp(time)}</span><input aria-label="Video progress" type="range" min="0" max={duration || 1} step="0.1" value={time} onChange={(e) => { if (video.current) { video.current.currentTime = Number(e.target.value); setTime(Number(e.target.value)) } }}/><span>{timestamp(duration)}</span><button aria-label={muted ? 'Unmute video' : 'Mute video'} onClick={() => { if (video.current) { video.current.muted = !muted; setMuted(!muted) } }}>{muted ? <VolumeX size={18}/> : <Volume2 size={18}/>}</button><button aria-label="Fullscreen video" onClick={async () => { try { if (player.current?.requestFullscreen) await player.current.requestFullscreen(); else if (video.current) video.current.controls = true } catch { if (video.current) video.current.controls = true } }}><Maximize size={18}/></button></div>
    {error && <p className="player-error" role="alert">{error} <a href="/WhySchedule.mp4">Open video</a></p>}
  </div>
}
