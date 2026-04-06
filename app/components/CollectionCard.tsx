import {Link} from 'react-router';
import type {Collection} from '~/lib/mock-storefront';

const COLLECTION_STYLE: Record<string, {emoji: string; bg: string; accent: string}> = {
  scooters: {emoji: '\u{1F6F5}', bg: 'bg-cyan/10', accent: 'text-cyan'},
  toys: {emoji: '\u{1F9F8}', bg: 'bg-green/10', accent: 'text-green'},
  'tools-kits': {emoji: '\u{1F381}', bg: 'bg-orange/10', accent: 'text-orange'},
  'home-nature': {emoji: '\u{1F33F}', bg: 'bg-cyan/10', accent: 'text-cyan'},
  specials: {emoji: '\u{2B50}', bg: 'bg-orange/10', accent: 'text-orange'},
};

export function CollectionCard({collection}: {collection: Collection}) {
  const style = COLLECTION_STYLE[collection.handle] ?? {
    emoji: '\u{1F4E6}',
    bg: 'bg-gray-100',
    accent: 'text-navy',
  };

  return (
    <Link
      to={`/collections/${collection.handle}`}
      className="group block overflow-hidden rounded-2xl border-2 border-gray-100 bg-white transition-all hover:border-transparent hover:shadow-lg hover:scale-[1.02]"
    >
      <div className={`flex aspect-[16/9] items-center justify-center ${style.bg}`}>
        <span className="text-6xl transition-transform group-hover:scale-110">{style.emoji}</span>
      </div>
      <div className="p-5">
        <h3 className={`text-lg font-bold ${style.accent} transition-colors`}>
          {collection.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {collection.description}
        </p>
        <span className={`mt-3 inline-block text-sm font-semibold ${style.accent}`}>
          Shop now &rarr;
        </span>
      </div>
    </Link>
  );
}
