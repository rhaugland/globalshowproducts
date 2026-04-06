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
      <section className="bg-navy px-4 py-24 text-center text-white">
        <img
          src="/images/logo.jpg"
          alt="Global Show Products"
          className="mx-auto h-16 w-auto rounded-lg bg-white p-2 shadow-lg"
        />
        <h1 className="mt-6 text-4xl font-extrabold md:text-5xl">
          Crafts, Toys & Scooters
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
          Home of Ribbon Fair Crafts & Games and Euro Scooters — quality products for every occasion!
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/collections"
            className="rounded-full border-2 border-white bg-white px-8 py-3 text-lg font-bold text-navy shadow-lg transition hover:scale-105 hover:bg-white/90"
          >
            Shop Now
          </Link>
          <Link
            to="/collections/scooters"
            className="rounded-full border-2 border-orange bg-orange px-8 py-3 text-lg font-bold text-white transition hover:scale-105 hover:bg-orange/90"
          >
            Explore Scooters
          </Link>
        </div>
      </section>

      {/* Brand badges */}
      <section className="bg-sage/50 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 px-4">
          {['Ribbon Fair', 'Euro Scooter', 'Funny Gears', 'Magic Sand', 'Puzzle Car'].map(
            (brand, i) => (
              <span
                key={brand}
                className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                  i % 3 === 0
                    ? 'bg-orange/10 text-orange'
                    : i % 3 === 1
                      ? 'bg-cyan/10 text-cyan'
                      : 'bg-green/10 text-green'
                }`}
              >
                {brand}
              </span>
            ),
          )}
        </div>
      </section>

      {/* Collections Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold text-navy">
          Shop by Category
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-gray-500">
          From mobility scooters to creative toys and bow-making tools
        </p>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center gap-3">
            <div className="h-1 w-12 rounded bg-orange" />
            <h2 className="text-center text-3xl font-extrabold text-navy">
              Featured Products
            </h2>
            <div className="h-1 w-12 rounded bg-cyan" />
          </div>
          <div className="mt-10">
            <ProductGrid products={featuredProducts} />
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/collections"
              className="inline-block rounded-full border-2 border-cyan px-6 py-2 font-bold text-cyan transition hover:bg-cyan hover:text-white"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="bg-sage/30 px-4 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-extrabold text-navy">Our Story</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Founded by Betty Kriedberg, Global Show Products brings you a sophisticated
            and innovative line of quality ribbon products, bow-making tools, toys, and
            mobility scooters. We make crafting accessible and fun for families of all ages!
          </p>
          <Link
            to="/about"
            className="mt-6 inline-block rounded-full border-2 border-orange px-6 py-2 font-bold text-orange transition hover:bg-orange hover:text-white"
          >
            Learn More
          </Link>
        </div>
      </section>
    </div>
  );
}
