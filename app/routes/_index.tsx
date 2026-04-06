import {Link} from 'react-router';
import {getCollections, getFeaturedProducts, getSaleProducts} from '~/lib/mock-storefront';
import {CollectionCard} from '~/components/CollectionCard';
import {ProductGrid} from '~/components/ProductGrid';
import {HeroCarousel} from '~/components/HeroCarousel';
import {SaleCarousel} from '~/components/SaleCarousel';

export default function Homepage() {
  const collections = getCollections();
  const featuredProducts = getFeaturedProducts(8);
  const saleProducts = getSaleProducts();

  return (
    <div>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* On Sale Now */}
      <SaleCarousel products={saleProducts} />

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-1 w-10 rounded bg-brand-red" />
          <h2 className="text-2xl font-extrabold text-brand-gray">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1 w-10 rounded bg-brand-red" />
            <h2 className="text-2xl font-extrabold text-brand-gray">Featured Products</h2>
          </div>
          <ProductGrid products={featuredProducts} />
          <div className="mt-8 text-center">
            <Link
              to="/collections"
              className="inline-block rounded-full bg-brand-red px-6 py-2 font-bold text-white transition hover:bg-brand-red-dark"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
