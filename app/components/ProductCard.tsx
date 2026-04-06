import {useState, useCallback, useEffect} from 'react';
import {Link} from 'react-router';
import {formatPrice} from '~/lib/utils';
import {addToCart} from '~/lib/cart';
import {getAverageRating, getReviewCount} from '~/lib/reviews';
import {isInWishlist, toggleWishlist} from '~/lib/wishlist';
import {StarRating} from './StarRating';
import type {Product} from '~/lib/mock-storefront';

export function ProductCard({product}: {product: Product}) {
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setWishlisted(isInWishlist(product.id));
  }, [product.id]);

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const variant = product.variants[0];
      if (!variant || !product.available) return;
      addToCart({
        productId: product.id,
        variantId: variant.id,
        title: product.title,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        image: product.images[0] || '',
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    },
    [product],
  );

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const result = toggleWishlist(product.id);
      setWishlisted(result);
    },
    [product.id],
  );

  const avgRating = getAverageRating(product.id);
  const reviewCount = getReviewCount(product.id);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md">
      {/* Wishlist heart */}
      <button
        onClick={handleWishlist}
        className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 shadow-sm transition hover:bg-white hover:scale-110"
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg
          className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'fill-none text-gray-400'}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <Link to={`/products/${product.handle}`}>
        <div className="relative aspect-square bg-gray-50 flex items-center justify-center">
          <span className="text-sm font-semibold text-brand-gray-light">{product.brand}</span>
          {product.compareAtPrice && (
            <span className="absolute top-3 left-3 rounded-full bg-brand-red px-2.5 py-1 text-xs font-bold text-white">
              Sale!
            </span>
          )}
          {!product.available && (
            <span className="absolute top-3 left-3 rounded-full bg-gray-700 px-2.5 py-1 text-xs font-bold text-white">
              Sold Out
            </span>
          )}
        </div>
        <div className="p-4 pb-14">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-gray-light">
            {product.brand}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-brand-gray line-clamp-2 group-hover:text-brand-red transition-colors">
            {product.title}
          </h3>

          {/* Star rating */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <StarRating rating={avgRating} />
            <span className="text-xs text-gray-400">({reviewCount})</span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-bold text-brand-gray">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Quick Add to Cart */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={!product.available}
          className={`w-full rounded-lg py-2 text-xs font-bold transition ${
            !product.available
              ? 'cursor-not-allowed bg-gray-200 text-gray-400'
              : added
                ? 'bg-green-500 text-white'
                : 'bg-brand-red text-white hover:bg-brand-red-dark'
          }`}
        >
          {!product.available ? (
            'Sold Out'
          ) : added ? (
            <span className="flex items-center justify-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Added!
            </span>
          ) : (
            'Add to Cart'
          )}
        </button>
      </div>
    </div>
  );
}
