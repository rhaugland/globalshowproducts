import {useRef, useState, useEffect} from 'react';
import {Link} from 'react-router';
import {formatPrice} from '~/lib/utils';
import type {Product} from '~/lib/mock-storefront';

export function SaleCarousel({products}: {products: Product[]}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', updateArrows, {passive: true});
    return () => el?.removeEventListener('scroll', updateArrows);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({left: dir === 'left' ? -320 : 320, behavior: 'smooth'});
  };

  if (products.length === 0) return null;

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Heading */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-1 w-10 rounded bg-brand-red" />
          <h2 className="text-2xl font-extrabold text-brand-gray">On Sale Now!</h2>
        </div>

        {/* Carousel wrapper */}
        <div className="relative">
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition hover:bg-gray-50"
              aria-label="Scroll left"
            >
              <svg className="h-5 w-5 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition hover:bg-gray-50"
              aria-label="Scroll right"
            >
              <svg className="h-5 w-5 text-brand-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Scrollable row */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
            style={{scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none'}}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[220px] flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
                style={{scrollSnapAlign: 'start'}}
              >
                {/* Image placeholder */}
                <div className="relative flex aspect-square items-center justify-center bg-gray-50 overflow-hidden">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.title} className="h-full w-full object-contain p-3" />
                  ) : (
                    <span className="text-xs font-semibold text-brand-gray-light">{product.brand}</span>
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-bold text-white">
                    Sale!
                  </span>
                </div>

                {/* Info */}
                <div className="p-3">
                  <Link
                    to={`/products/${product.handle}`}
                    className="block text-sm font-semibold text-brand-gray line-clamp-2 hover:text-brand-red transition-colors"
                  >
                    {product.title}
                  </Link>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-sm font-bold text-brand-red">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.compareAtPrice, product.currency)}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/products/${product.handle}`}
                    className="mt-2 block rounded bg-brand-red px-3 py-1.5 text-center text-xs font-bold text-white transition hover:bg-brand-red-dark"
                  >
                    Add to Cart
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
