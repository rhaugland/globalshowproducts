import {Link} from 'react-router';
import type {Collection} from '~/lib/mock-storefront';

const COLLECTION_STYLE: Record<string, {emoji: string; bg: string; accent: string}> = {
  scooters: {emoji: '\u{1F6F5}', bg: 'bg-pop-cyan/10', accent: 'text-pop-cyan'},
  toys: {emoji: '\u{1F9F8}', bg: 'bg-pop-green/10', accent: 'text-pop-green'},
  'tools-kits': {emoji: '\u{1F381}', bg: 'bg-brand-red/10', accent: 'text-brand-red'},
  'home-nature': {emoji: '\u{1F33F}', bg: 'bg-pop-cyan/10', accent: 'text-pop-cyan'},
  specials: {emoji: '\u{2B50}', bg: 'bg-pop-orange/10', accent: 'text-pop-orange'},
};

export function CollectionCard({collection}: {collection: Collection}) {
  const style = COLLECTION_STYLE[collection.handle] ?? {
    emoji: '\u{1F4E6}', bg: 'bg-gray-100', accent: 'text-brand-gray',
  };

  return (
    <Link
      to={`/collections/${collection.handle}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:shadow-lg hover:scale-[1.02]"
    >
      <div className={`flex aspect-[16/9] items-center justify-center ${style.bg}`}>
        <span className="text-6xl transition-transform group-hover:scale-110">{style.emoji}</span>
      </div>
      <div className="p-5">
        <h3 className={`text-lg font-bold ${style.accent}`}>{collection.title}</h3>
        <p className="mt-1 text-sm text-brand-gray-light line-clamp-2">{collection.description}</p>
        <span className={`mt-3 inline-block text-sm font-semibold ${style.accent}`}>Shop now &rarr;</span>
      </div>
    </Link>
  );
}
