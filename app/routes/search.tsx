import {useState, useEffect, useRef} from 'react';
import {useSearchParams} from 'react-router';
import {searchProducts} from '~/lib/mock-storefront';
import type {Product} from '~/lib/mock-storefront';
import {ProductGrid} from '~/components/ProductGrid';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query) {
      setResults(searchProducts(query));
    } else {
      setResults([]);
    }
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      setSearchParams({q: trimmed});
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-gray">Search</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search products..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand-red px-6 py-2 font-semibold text-white hover:bg-brand-red-dark transition"
        >
          Search
        </button>
      </form>

      {query && (
        <div className="mt-8">
          <p className="mb-4 text-sm text-gray-500">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
          <ProductGrid products={results} />
        </div>
      )}
    </div>
  );
}
