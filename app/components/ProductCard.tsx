import {Link} from 'react-router';
import {formatPrice} from '~/lib/utils';
import type {Product} from '~/lib/mock-storefront';

export function ProductCard({product}: {product: Product}) {
  return (
    <Link
      to={`/products/${product.handle}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
        <span className="text-lg font-semibold text-gray-400 px-4 text-center">
          {product.brand}
        </span>
        {!product.available && (
          <span className="absolute top-2 right-2 rounded bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
            Out of Stock
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {product.brand}
        </p>
        <h3 className="mt-1 text-sm font-semibold text-charcoal line-clamp-2 group-hover:text-navy">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-bold text-navy">
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
  );
}
