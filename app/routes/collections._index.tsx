import {getCollections} from '~/lib/mock-storefront';
import {CollectionCard} from '~/components/CollectionCard';

export default function CollectionsIndex() {
  const collections = getCollections();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-gray">All Collections</h1>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}
