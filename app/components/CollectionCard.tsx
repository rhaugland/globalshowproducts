import {Link} from 'react-router';
import type {Collection} from '~/lib/mock-storefront';

const COLLECTION_EMOJIS: Record<string, string> = {
  scooters: '\u{1F6F5}',
  toys: '\u{1F9F8}',
  'tools-kits': '\u{1F527}',
  'home-nature': '\u{1F33F}',
  specials: '\u{2B50}',
};

export function CollectionCard({collection}: {collection: Collection}) {
  const emoji = COLLECTION_EMOJIS[collection.handle] ?? '\u{1F4E6}';

  return (
    <Link
      to={`/collections/${collection.handle}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="flex aspect-[16/9] items-center justify-center bg-gray-100">
        <span className="text-6xl">{emoji}</span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-navy group-hover:text-orange">
          {collection.title}
        </h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {collection.description}
        </p>
      </div>
    </Link>
  );
}
