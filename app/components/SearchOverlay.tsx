import {useState, useEffect, useRef, useCallback} from 'react';
import {Link, useNavigate} from 'react-router';
import {searchProducts} from '~/lib/mock-storefront';
import {addToCart} from '~/lib/cart';
import {formatPrice} from '~/lib/utils';
import type {Product} from '~/lib/mock-storefront';

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setAddedId(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      setResults(searchProducts(query.trim()).slice(0, 6));
    } else {
      setResults([]);
    }
  }, [query]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleAddToCart = useCallback(
    (product: Product, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const variant = product.variants[0];
      if (!variant) return;
      addToCart({
        productId: product.id,
        variantId: variant.id,
        title: product.title,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        image: product.images[0] || '',
      });
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 1500);
    },
    [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search panel */}
      <div className="relative z-10 mx-4 w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        {/* Search input */}
        <form onSubmit={handleSubmit} className="flex items-center border-b border-gray-200 px-5 py-4">
          <svg
            className="mr-3 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 text-lg text-brand-gray placeholder-gray-400 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="ml-2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-3 rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500"
          >
            ESC
          </button>
        </form>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-h-[400px] overflow-y-auto p-2">
            {results.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.handle}`}
                onClick={onClose}
                className="flex items-center gap-4 rounded-lg p-3 transition hover:bg-gray-50"
              >
                {/* Product image */}
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400">
                    {product.brand}
                  </span>
                </div>

                {/* Product info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-gray">
                    {product.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-sm font-bold text-brand-red">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.compareAtPrice, product.currency)}
                      </span>
                    )}
                    {product.compareAtPrice && (
                      <span className="rounded bg-brand-red/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-red">
                        SALE
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick add to cart */}
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className={`flex-shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition ${
                    addedId === product.id
                      ? 'bg-green-500 text-white'
                      : 'bg-brand-red text-white hover:bg-brand-red-dark'
                  }`}
                >
                  {addedId === product.id ? (
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Added
                    </span>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              </Link>
            ))}

            {/* View all results link */}
            <button
              onClick={() => {
                onClose();
                navigate(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
              className="mt-1 block w-full rounded-lg py-2.5 text-center text-sm font-semibold text-brand-red transition hover:bg-brand-red/5"
            >
              View all results for &ldquo;{query}&rdquo;
            </button>
          </div>
        )}

        {/* No results */}
        {query.trim().length >= 2 && results.length === 0 && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-500">
              No products found for &ldquo;{query}&rdquo;
            </p>
          </div>
        )}

        {/* Hint when empty */}
        {query.trim().length < 2 && (
          <div className="px-5 py-6 text-center">
            <p className="text-xs text-gray-400">
              Type at least 2 characters to search
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
