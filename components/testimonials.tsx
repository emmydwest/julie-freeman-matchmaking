const samples = [
  { name: 'Daniel', type: 'Man', quote: 'Having someone take the time to understand what I wanted made the whole process feel more personal.' },
  { name: 'Emma & Michael', type: 'Couple', quote: 'The best part was starting with shared values. Our first conversation felt relaxed and natural.' },
  { name: 'Claire', type: 'Woman', quote: 'I liked the thoughtfulness behind the introduction and being able to move at a pace that felt comfortable.' },
  { name: 'James', type: 'Man', quote: 'I was ready to spend less time searching and more time getting to know someone. That personal guidance mattered.' },
  { name: 'Sophie & David', type: 'Couple', quote: 'We would never have crossed paths on our own. It is lovely to imagine what one good introduction can begin.' },
  { name: 'Rachel', type: 'Woman', quote: 'Being asked about my values, my everyday life and what I hoped for made me feel heard.' },
]

function Avatar({ couple, index }: { couple: boolean; index: number }) {
  return <svg viewBox="0 0 80 80" role="img" aria-label="Illustrated sample avatar"><rect width="80" height="80" rx="40" fill={['#f6d5e2', '#eadce9', '#ecd6c9'][index % 3]}/>{(couple ? [27, 53] : [40]).map((x, i) => <g key={x}><path d={`M${x - 19} 80v-14q0-22 19-22t19 22v14`} fill={i ? '#b26989' : '#72566b'}/><ellipse cx={x} cy="30" rx="13" ry="16" fill={index % 2 ? '#b47d61' : '#e7b49a'}/><path d={`M${x - 14} 31v-9q1-18 17-13q14 3 11 22l-6-14q-9 11-22 14`} fill="#46313b"/></g>)}</svg>
}

export function SampleTestimonials() {
  return <section className="testimonials-section" id="stories"><div className="section-intro"><div><p className="eyebrow">The personal difference</p><h2>Room for a<br/><em>lovely new story.</em></h2></div><p>Sample testimonials for design preview. These fictional names, quotes and illustrated avatars are placeholders, not actual client endorsements.</p></div><div className="testimonial-grid">{samples.map((sample, index) => <article key={sample.name}><span className="sample-label">Illustrative review · not a real client</span><blockquote>“{sample.quote}”</blockquote><div className="review-person"><Avatar couple={sample.type === 'Couple'} index={index}/><div><strong>{sample.name}</strong><span>Sample {sample.type.toLowerCase()} story</span></div></div></article>)}</div></section>
}
