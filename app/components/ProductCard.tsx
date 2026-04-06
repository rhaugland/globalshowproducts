import {Link} from 'react-router';
import {formatPrice} from '~/lib/utils';
import type {Product} from '~/lib/mock-storefront';

const BRAND_COLORS: Record<string, string> = {
  'Euro Scooter': 'text-cyan bg-cyan/10',
  'Funny Gears': 'text-green bg-green/10',
  'Puzzle Car': 'text-cyan bg-cyan/10',
  'Magic Sand': 'text-orange bg-orange/10',
  'Ribbon Fair': 'text-orange bg-orange/10',
  Gloria: 'text-green bg-green/10',
  Mylec: 'text-cyan bg-cyan/10',
  GSP: 'text-navy bg-navy/10',
};

export function ProductCard({product}: {product: Product}) {
  const brandStyle = BRAND_COLORS[product.brand] ?? 'text-gray-500 bg-gray-100';

  return (
    <Link
      to={`/products/${product.handle}`}
      className="group block overflow-hidden rounded-2xl border-2 border-gray-100 bg-white transition-all hover:border-transparent hover:shadow-lg hover:scale-[1.02]"
    >
      <div className="relative aspect-square bg-gray-50 flex items-center justify-center">
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${brandStyle}`}>
          {product.brand}
        </span>
        {product.compareAtPrice && (
          <span className="absolute top-3 left-3 rounded-full bg-orange px-2.5 py-1 text-xs font-bold text-white">
            Sale!
          </span>
        )}
        {!product.available && (
          <span className="absolute top-3 right-3 rounded-full bg-gray-800 px-2.5 py-1 text-xs font-bold text-white">
            Sold Out
          </span>
        )}
      </div>
      <div className="p-4">
        <p className={`text-xs font-bold uppercase tracking-wide ${brandStyle.split(' ')[0]}`}>
          {product.brand}
        </p>
        <h3 className="mt-1 text-sm font-semibold text-charcoal line-clamp-2 group-hover:text-navy">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-bold text-navy">
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
