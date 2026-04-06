import {ProductCard} from './ProductCard';
import type {Product} from '~/lib/mock-storefront';

export function ProductGrid({products}: {products: Product[]}) {
  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-gray-500">No products found.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
