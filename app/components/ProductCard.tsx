import {Link} from 'react-router';
import {formatPrice} from '~/lib/utils';
import type {Product} from '~/lib/mock-storefront';

export function ProductCard({product}: {product: Product}) {
  return (
    <Link
      to={`/products/${product.handle}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md"
    >
      <div className="relative aspect-square bg-gray-50 flex items-center justify-center">
        <span className="text-sm font-semibold text-brand-gray-light">{product.brand}</span>
        {product.compareAtPrice && (
          <span className="absolute top-3 left-3 rounded-full bg-brand-red px-2.5 py-1 text-xs font-bold text-white">
            Sale!
          </span>
        )}
        {!product.available && (
          <span className="absolute top-3 right-3 rounded-full bg-gray-700 px-2.5 py-1 text-xs font-bold text-white">
            Sold Out
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-gray-light">
          {product.brand}
        </p>
        <h3 className="mt-1 text-sm font-semibold text-brand-gray line-clamp-2 group-hover:text-brand-red transition-colors">
          {product.title}
        </h3>
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
  );
}
