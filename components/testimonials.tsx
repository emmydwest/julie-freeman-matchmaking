import { BadgeCheck, Star } from 'lucide-react'

const source = 'https://julieferman.com/testimonials/'
const stories = [
  { name: 'Brad & Claire', photo: '/stories/brad-claire.jpg', quote: 'She introduced me to Brad and we clicked.' },
  { name: 'Greg & Vicki', photo: '/stories/greg-vicki.jpg', quote: 'We are so happy...' },
]

export function SampleTestimonials() {
  return (
    <section className="testimonials-section" id="stories">
      <div className="section-intro">
        <div><p className="eyebrow">A more personal beginning</p><h2>Real connections.<br/><em>Stories worth sharing.</em></h2></div>
        <p>Couple photos and short excerpts from Julie’s published testimonials. The five-star displays are design previews, not submitted customer ratings.</p>
      </div>
      <div className="testimonial-grid couple-stories">
        {stories.map((story) => (
          <article key={story.name}>
            <img className="couple-photo" src={story.photo} alt={`${story.name}, pictured in Julie’s published testimonial`} width={112} height={112} loading="lazy" />
            <div className="story-rating" aria-label="Five out of five stars, design preview only">
              <span aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} fill="currentColor" />)}</span>
              <small>5.0 / 5 · Rating preview</small>
            </div>
            <blockquote>“{story.quote}”</blockquote>
            <div className="story-attribution"><h3>{story.name}</h3><a className="story-source-badge" href={source} target="_blank" rel="noreferrer"><BadgeCheck size={17} aria-hidden="true" /> Published story</a></div>
            <a className="story-read-more" href={source} target="_blank" rel="noreferrer">Read the original testimonial ↗</a>
          </article>
        ))}
      </div>
    </section>
  )
}
