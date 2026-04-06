import collectionsData from '~/data/collections.json';
import productsData from '~/data/products.json';

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  selectedOptions: {name: string; value: string}[];
  available: boolean;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  brand: string;
  collectionIds: string[];
  price: number;
  compareAtPrice: number | null;
  currency: string;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  available: boolean;
}

const collections: Collection[] = collectionsData as Collection[];
const products: Product[] = productsData as Product[];

export function getCollections(): Collection[] {
  return collections;
}

export function getCollectionByHandle(handle: string): Collection | null {
  return collections.find((c) => c.handle === handle) ?? null;
}

export function getProductByHandle(handle: string): Product | null {
  return products.find((p) => p.handle === handle) ?? null;
}

export function getProductsByCollection(collectionId: string): Product[] {
  return products.filter((p) => p.collectionIds.includes(collectionId));
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter((p) => {
    const searchable = [p.title, p.brand, p.description, ...p.tags]
      .join(' ')
      .toLowerCase();
    return searchable.includes(lowerQuery);
  });
}

export function getFeaturedProducts(count: number = 8): Product[] {
  return products.slice(0, count);
}

export function getSpecials(): Product[] {
  return products.filter((p) => p.compareAtPrice !== null);
}
