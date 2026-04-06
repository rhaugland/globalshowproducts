import {useState} from 'react';
import {useParams, Link} from 'react-router';
import {getProductByHandle} from '~/lib/mock-storefront';
import {addToCart} from '~/lib/cart';
import {formatPrice} from '~/lib/utils';
import {VariantSelector} from '~/components/VariantSelector';

export default function ProductPage() {
  const {handle} = useParams();
  const product = handle ? getProductByHandle(handle) : null;

  const [selectedVariantId, setSelectedVariantId] = useState(
    product?.variants[0]?.id ?? '',
  );
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-brand-gray">404</h1>
          <p className="mt-2 text-gray-600">Product not found.</p>
          <Link
            to="/collections"
            className="mt-4 inline-block text-brand-red hover:underline"
          >
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId,
  );

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Link
        to="/collections"
        className="text-sm text-gray-500 hover:text-brand-gray"
      >
        &larr; Back to shop
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Image placeholder */}
        <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
          <span className="text-2xl font-semibold text-gray-400">
            {product.brand}
          </span>
        </div>

        {/* Details */}
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            {product.brand}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-brand-gray">
            {product.title}
          </h1>

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

          <p className="mt-6 text-gray-700 leading-relaxed">
            {product.description}
          </p>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.available}
            className={`mt-6 w-full rounded-lg px-6 py-3 text-lg font-semibold text-white transition ${
              !product.available
                ? 'cursor-not-allowed bg-gray-300'
                : addedToCart
                  ? 'bg-pop-green'
                  : 'bg-brand-red hover:bg-brand-red-dark'
            }`}
          >
            {addedToCart ? 'Added to Cart \u2713' : 'Add to Cart'}
          </button>

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
    </div>
  );
}
