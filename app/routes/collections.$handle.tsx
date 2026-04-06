import {useState, useMemo} from 'react';
import {useParams, Link} from 'react-router';
import {
  getCollectionByHandle,
  getProductsByCollection,
} from '~/lib/mock-storefront';
import type {Product} from '~/lib/mock-storefront';
import {ProductGrid} from '~/components/ProductGrid';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

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

export default function CollectionPage() {
  const {handle} = useParams();
  const [sort, setSort] = useState<SortOption>('default');

  const collection = handle ? getCollectionByHandle(handle) : null;

  const products = useMemo(() => {
    if (!collection) return [];
    return sortProducts(getProductsByCollection(collection.id), sort);
  }, [collection, sort]);

  if (!collection) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-brand-gray">404</h1>
          <p className="mt-2 text-gray-600">Collection not found.</p>
          <Link
            to="/collections"
            className="mt-4 inline-block text-brand-red hover:underline"
          >
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Link
        to="/collections"
        className="text-sm text-gray-500 hover:text-brand-gray"
      >
        &larr; All Collections
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-brand-gray">{collection.title}</h1>
      <p className="mt-2 text-gray-600">{collection.description}</p>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-brand-gray focus:border-brand-gray focus:outline-none focus:ring-1 focus:ring-brand-gray"
        >
          <option value="default">Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A-Z</option>
        </select>
      </div>

      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
