import {useState, useEffect, useCallback} from 'react';
import {Link, useNavigate} from 'react-router';
import {getCart, updateQuantity, removeFromCart, addToCart} from '~/lib/cart';
import type {CartItem} from '~/lib/cart';
import {searchProducts} from '~/lib/mock-storefront';
import type {Product} from '~/lib/mock-storefront';
import {formatPrice} from '~/lib/utils';

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Refresh cart items when drawer opens
  useEffect(() => {
    if (open) {
      setItems(getCart());
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Search
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setSearchResults(searchProducts(searchQuery.trim()).slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleQuantityChange = useCallback((variantId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(variantId);
    } else {
      updateQuantity(variantId, newQty);
    }
    setItems(getCart());
  }, []);

  const handleRemove = useCallback((variantId: string) => {
    removeFromCart(variantId);
    setItems(getCart());
  }, []);

  const handleQuickAdd = useCallback((product: Product) => {
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
    setItems(getCart());
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  }, []);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-bold text-brand-gray">
            Your Cart ({items.reduce((sum, i) => sum + i.quantity, 0)})
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 && !showSearch ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <svg className="h-16 w-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 5h12.8M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              <p className="mt-4 text-sm font-medium text-gray-500">Your cart is empty</p>
              <button
                onClick={() => setShowSearch(true)}
                className="mt-4 rounded-lg bg-brand-red px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-red-dark"
              >
                Search Products
              </button>
            </div>
          ) : (
            <div className="px-5 py-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3 border-b border-gray-100 py-4 first:pt-0 last:border-0">
                  {/* Product image placeholder */}
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 border border-gray-200">
                    <span className="text-[8px] font-semibold text-gray-400">IMG</span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-brand-gray line-clamp-2">{item.title}</p>
                    {item.variantTitle !== 'Default' && (
                      <p className="mt-0.5 text-xs text-gray-400">{item.variantTitle}</p>
                    )}
                    <p className="mt-1 text-sm font-bold text-brand-red">
                      {formatPrice(item.price * item.quantity)}
                    </p>

                    {/* Quantity controls */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center rounded-lg border border-gray-200">
                        <button
                          onClick={() => handleQuantityChange(item.variantId, item.quantity - 1)}
                          className="px-2.5 py-1 text-sm font-bold text-gray-500 transition hover:text-brand-red"
                        >
                          -
                        </button>
                        <span className="min-w-[28px] text-center text-sm font-semibold text-brand-gray">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.variantId, item.quantity + 1)}
                          className="px-2.5 py-1 text-sm font-bold text-gray-500 transition hover:text-brand-red"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.variantId)}
                        className="text-xs text-gray-400 transition hover:text-brand-red"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add more products search */}
          {showSearch && (
            <div className="border-t border-gray-200 px-5 py-4">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products to add..."
                  className="flex-1 text-sm text-brand-gray placeholder-gray-400 outline-none"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 space-y-1">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-gray-50"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-gray-100">
                        <span className="text-[8px] font-semibold text-gray-400">{product.brand}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-brand-gray">{product.title}</p>
                        <p className="text-xs font-bold text-brand-red">{formatPrice(product.price)}</p>
                      </div>
                      <button
                        onClick={() => handleQuickAdd(product)}
                        className={`flex-shrink-0 rounded px-2.5 py-1.5 text-xs font-bold transition ${
                          addedId === product.id
                            ? 'bg-green-500 text-white'
                            : 'bg-brand-red text-white hover:bg-brand-red-dark'
                        }`}
                      >
                        {addedId === product.id ? 'Added!' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                <p className="mt-3 text-center text-xs text-gray-400">No products found</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-4">
          {items.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Subtotal</span>
                <span className="text-lg font-bold text-brand-gray">{formatPrice(subtotal)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="mb-3 w-full rounded-lg bg-brand-red py-3 text-sm font-bold text-white transition hover:bg-brand-red-dark"
              >
                Continue to Checkout
              </button>
            </>
          )}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-brand-gray transition hover:bg-gray-50"
          >
            {showSearch ? 'Hide Search' : 'Add More Products'}
          </button>
        </div>
      </div>
    </div>
  );
}
