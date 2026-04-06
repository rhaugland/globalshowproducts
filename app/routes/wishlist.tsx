import {useState, useEffect} from 'react';
import {Link} from 'react-router';
import {getWishlist} from '~/lib/wishlist';
import {getProductById} from '~/lib/mock-storefront';
import type {Product} from '~/lib/mock-storefront';
import {ProductCard} from '~/components/ProductCard';

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const ids = getWishlist();
    const items = ids.map((id) => getProductById(id)).filter(Boolean) as Product[];
    setProducts(items);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-gray">My Wishlist</h1>
      <p className="mt-2 text-gray-500">
        {products.length} {products.length === 1 ? 'item' : 'items'} saved
      </p>

      {products.length === 0 ? (
        <div className="mt-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-bold text-brand-gray">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-gray-500">
            Browse our products and tap the heart icon to save your favorites.
          </p>
          <Link
            to="/collections"
            className="mt-6 inline-block rounded-lg bg-brand-red px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-red-dark"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
