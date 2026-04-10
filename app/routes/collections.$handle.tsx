import type {Route} from './+types/collections.$handle';
import {useState, useMemo} from 'react';
import {Link} from 'react-router';
import {getCollectionByHandle} from '~/lib/storefront';
import type {Product} from '~/lib/mock-storefront';
import {ProductGrid} from '~/components/ProductGrid';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'rating';

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
}

export async function loader({params, context}: Route.LoaderArgs) {
  const {collection, products} = await getCollectionByHandle(
    params.handle!,
    context.storefront,
  );
  if (!collection) {
    throw new Response('Collection not found', {status: 404});
  }
  return {collection, products};
}

export default function CollectionPage({loaderData}: Route.ComponentProps) {
  const {collection, products: allProducts} = loaderData;
  const [sort, setSort] = useState<SortOption>('default');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'in-stock' | 'on-sale'>('all');
  const [filterPriceMax, setFilterPriceMax] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const brands = useMemo(() => {
    return [...new Set(allProducts.map((p) => p.brand))].sort();
  }, [allProducts]);

  const maxPrice = useMemo(() => {
    return Math.ceil(Math.max(...allProducts.map((p) => p.price), 0));
  }, [allProducts]);

  const products = useMemo(() => {
    let filtered = [...allProducts];
    if (filterBrand !== 'all') {
      filtered = filtered.filter((p) => p.brand === filterBrand);
    }
    if (filterAvailability === 'in-stock') {
      filtered = filtered.filter((p) => p.available);
    } else if (filterAvailability === 'on-sale') {
      filtered = filtered.filter((p) => p.compareAtPrice !== null);
    }
    if (filterPriceMax !== null) {
      filtered = filtered.filter((p) => p.price <= filterPriceMax);
    }
    return sortProducts(filtered, sort);
  }, [allProducts, sort, filterBrand, filterAvailability, filterPriceMax]);

  const activeFilterCount = [
    filterBrand !== 'all',
    filterAvailability !== 'all',
    filterPriceMax !== null,
  ].filter(Boolean).length;

  function clearFilters() {
    setFilterBrand('all');
    setFilterAvailability('all');
    setFilterPriceMax(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Link to="/collections" className="text-sm text-gray-500 hover:text-brand-gray">
        &larr; All Collections
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-brand-gray">{collection.title}</h1>
      <p className="mt-2 text-gray-600">{collection.description}</p>

      {/* Toolbar */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              showFilters || activeFilterCount > 0
                ? 'border-brand-red bg-brand-red/5 text-brand-red'
                : 'border-gray-300 text-brand-gray hover:border-gray-400'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
          </button>
          <p className="text-sm text-gray-500">
            {products.length} {products.length === 1 ? 'product' : 'products'}
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="ml-2 text-brand-red hover:underline">
                Clear all
              </button>
            )}
          </p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-brand-gray focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A–Z</option>
        </select>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Brand */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Brand</label>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              >
                <option value="all">All Brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Availability</label>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value as 'all' | 'in-stock' | 'on-sale')}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              >
                <option value="all">All</option>
                <option value="in-stock">In Stock</option>
                <option value="on-sale">On Sale</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Max Price: {filterPriceMax !== null ? `$${filterPriceMax}` : 'Any'}
              </label>
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={filterPriceMax ?? maxPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFilterPriceMax(val >= maxPrice ? null : val);
                }}
                className="w-full accent-brand-red"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>$0</span>
                <span>${maxPrice}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
