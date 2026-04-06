import {useState, useEffect} from 'react';
import {useParams, Link} from 'react-router';
import {getProductByHandle, getRelatedProducts} from '~/lib/mock-storefront';
import {addToCart} from '~/lib/cart';
import {formatPrice} from '~/lib/utils';
import {getReviewsForProduct, getAverageRating, getReviewCount} from '~/lib/reviews';
import {isInWishlist, toggleWishlist} from '~/lib/wishlist';
import {VariantSelector} from '~/components/VariantSelector';
import {StarRating} from '~/components/StarRating';
import {ProductCard} from '~/components/ProductCard';

export default function ProductPage() {
  const {handle} = useParams();
  const product = handle ? getProductByHandle(handle) : null;

  const [selectedVariantId, setSelectedVariantId] = useState(
    product?.variants[0]?.id ?? '',
  );
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    if (product) setWishlisted(isInWishlist(product.id));
  }, [product]);

  if (!product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-brand-gray">404</h1>
          <p className="mt-2 text-gray-600">Product not found.</p>
          <Link to="/collections" className="mt-4 inline-block text-brand-red hover:underline">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const reviews = getReviewsForProduct(product.id);
  const avgRating = getAverageRating(product.id);
  const reviewCount = getReviewCount(product.id);
  const related = getRelatedProducts(product.id, 4);

  function handleAddToCart() {
    if (!selectedVariant || !product) return;
    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      image: product.images[0] ?? '',
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleWishlist() {
    const result = toggleWishlist(product.id);
    setWishlisted(result);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Link to="/collections" className="text-sm text-gray-500 hover:text-brand-gray">
        &larr; Back to shop
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Image placeholder */}
        <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
          <span className="text-2xl font-semibold text-gray-400">{product.brand}</span>
        </div>

        {/* Details */}
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            {product.brand}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-brand-gray">{product.title}</h1>

          {/* Rating summary */}
          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={avgRating} size="md" />
            <span className="text-sm text-gray-500">
              {avgRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-brand-gray">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                product.available ? 'bg-pop-green' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-600">
              {product.available ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="mt-6">
            <VariantSelector
              variants={product.variants}
              selectedId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />
          </div>

          <p className="mt-6 text-gray-700 leading-relaxed">{product.description}</p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.available}
              className={`flex-1 rounded-lg px-6 py-3 text-lg font-semibold text-white transition ${
                !product.available
                  ? 'cursor-not-allowed bg-gray-300'
                  : addedToCart
                    ? 'bg-pop-green'
                    : 'bg-brand-red hover:bg-brand-red-dark'
              }`}
            >
              {addedToCart ? 'Added to Cart \u2713' : 'Add to Cart'}
            </button>

            {/* Wishlist button */}
            <button
              onClick={handleWishlist}
              className={`rounded-lg border-2 px-4 py-3 transition ${
                wishlisted
                  ? 'border-red-200 bg-red-50 text-red-500'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-red-400'
              }`}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg
                className={`h-6 w-6 ${wishlisted ? 'fill-current' : 'fill-none'}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-gray">Customer Reviews</h2>
          <div className="flex items-center gap-2">
            <StarRating rating={avgRating} size="md" />
            <span className="text-sm font-semibold text-brand-gray">{avgRating.toFixed(1)} out of 5</span>
          </div>
        </div>

        {/* Rating breakdown */}
        <div className="mt-4 max-w-sm">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 py-0.5">
                <span className="w-8 text-right text-xs font-medium text-gray-500">{star} star</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-yellow-400" style={{width: `${pct}%`}} />
                </div>
                <span className="w-8 text-xs text-gray-400">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Individual reviews */}
        <div className="mt-8 space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red/10 text-xs font-bold text-brand-red">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-gray">{review.author}</p>
                  <p className="text-xs text-gray-400">{review.date}</p>
                </div>
              </div>
              <div className="mt-2">
                <StarRating rating={review.rating} />
              </div>
              <p className="mt-1 text-sm font-semibold text-brand-gray">{review.title}</p>
              <p className="mt-1 text-sm text-gray-600">{review.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-brand-gray">You May Also Like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
