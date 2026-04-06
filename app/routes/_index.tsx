import {Link} from 'react-router';
import {getCollections, getFeaturedProducts} from '~/lib/mock-storefront';
import {CollectionCard} from '~/components/CollectionCard';
import {ProductGrid} from '~/components/ProductGrid';

export default function Homepage() {
  const collections = getCollections();
  const featuredProducts = getFeaturedProducts(8);

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy px-4 py-20 text-center text-white">
        <h1 className="text-4xl font-bold md:text-5xl">
          Global Show Products
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
          Quality products from trusted brands around the world — scooters,
          toys, tools, and more.
        </p>
        <Link
          to="/collections"
          className="mt-8 inline-block rounded-lg bg-orange px-8 py-3 text-lg font-semibold text-white transition hover:bg-orange/90"
        >
          Shop Now
        </Link>
      </section>

      {/* Collections Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-navy">
          Shop by Category
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-navy">
            Featured Products
          </h2>
          <div className="mt-10">
            <ProductGrid products={featuredProducts} />
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-navy">Our Story</h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">
          Global Show Products connects you with quality brands and innovative
          products from around the world. From mobility scooters to creative
          toys and professional tools, we curate the best for you.
        </p>
        <Link
          to="/about"
          className="mt-6 inline-block rounded-lg border-2 border-navy px-6 py-2 font-semibold text-navy transition hover:bg-navy hover:text-white"
        >
          Learn More
        </Link>
      </section>
    </div>
  );
}
