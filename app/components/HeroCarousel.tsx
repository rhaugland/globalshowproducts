import {useState, useEffect, useCallback} from 'react';
import {Link} from 'react-router';

const slides = [
  {
    emoji: '\u{1F6F5}',
    headline: 'Euro Scooter Mobility Scooters',
    description: 'Roma and Genoa models — freedom and independence',
    cta: 'Learn More',
    to: '/collections/scooters',
    bg: 'from-pop-cyan/20 to-pop-cyan/5',
    accent: 'bg-pop-cyan hover:bg-pop-cyan/80',
  },
  {
    emoji: '\u{2699}\u{FE0F}',
    headline: 'Funny Gears Toys & Puzzles',
    description: 'Build, create, and learn with our gear-based toys',
    cta: 'Shop Toys',
    to: '/collections/toys',
    bg: 'from-pop-green/20 to-pop-green/5',
    accent: 'bg-pop-green hover:bg-pop-green/80',
  },
  {
    emoji: '\u{1F380}',
    headline: 'Ribbon Fair Crafts & Tools',
    description: 'Professional bow-making tools and ribbon products',
    cta: 'Shop Tools',
    to: '/collections/tools-kits',
    bg: 'from-brand-red/20 to-brand-red/5',
    accent: 'bg-brand-red hover:bg-brand-red-dark',
  },
  {
    emoji: '\u{1F4A8}',
    headline: 'Summer Must-Haves',
    description: 'Portable Neck Fans, outdoor toys, and more — perfect for the season!',
    cta: 'View Products',
    to: '/collections',
    bg: 'from-pop-orange/20 to-pop-orange/5',
    accent: 'bg-pop-orange hover:bg-pop-orange/80',
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className="relative h-[340px] md:h-[400px]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${slide.bg} transition-opacity duration-700 ${
              i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center md:flex-row md:text-left">
              <span className="text-7xl md:text-9xl">{slide.emoji}</span>
              <div>
                <h2 className="text-3xl font-extrabold text-brand-gray md:text-4xl">
                  {slide.headline}
                </h2>
                <p className="mt-2 text-lg text-brand-gray-light">{slide.description}</p>
                <Link
                  to={slide.to}
                  className={`mt-4 inline-block rounded-full px-8 py-3 text-sm font-bold text-white shadow transition hover:scale-105 ${slide.accent}`}
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow transition hover:bg-white"
        aria-label="Previous slide"
      >
        <svg className="h-5 w-5 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow transition hover:bg-white"
        aria-label="Next slide"
      >
        <svg className="h-5 w-5 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              i === current ? 'w-6 bg-brand-red' : 'bg-brand-gray/30'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
