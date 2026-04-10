import type {Storefront} from '@shopify/hydrogen';
import type {Product, Collection} from '~/lib/mock-storefront';
import * as mock from '~/lib/mock-storefront';
import {normalizeProduct, normalizeCollection} from '~/lib/normalize';
import {
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCT_RECOMMENDATIONS_QUERY,
  FEATURED_PRODUCTS_QUERY,
  SEARCH_PRODUCTS_QUERY,
  ALL_PRODUCTS_QUERY,
} from '~/lib/shopify-queries';

type MaybeStorefront = Storefront | undefined | null;

export async function getCollections(
  storefront?: MaybeStorefront,
): Promise<Collection[]> {
  if (!storefront) return mock.getCollections();

  const {collections} = await storefront.query(COLLECTIONS_QUERY, {
    variables: {first: 50},
  });
  return collections.nodes.map(normalizeCollection);
}

export async function getCollectionByHandle(
  handle: string,
  storefront?: MaybeStorefront,
): Promise<{collection: Collection | null; products: Product[]}> {
  if (!storefront) {
    const collection = mock.getCollectionByHandle(handle);
    const products = collection
      ? mock.getProductsByCollection(collection.id)
      : [];
    return {collection, products};
  }

  const {collection} = await storefront.query(COLLECTION_BY_HANDLE_QUERY, {
    variables: {handle},
  });
  if (!collection) return {collection: null, products: []};

  return {
    collection: normalizeCollection(collection),
    products: collection.products.nodes.map(normalizeProduct),
  };
}

export async function getProductByHandle(
  handle: string,
  storefront?: MaybeStorefront,
): Promise<Product | null> {
  if (!storefront) return mock.getProductByHandle(handle);

  const {product} = await storefront.query(PRODUCT_BY_HANDLE_QUERY, {
    variables: {handle},
  });
  return product ? normalizeProduct(product) : null;
}

export async function getRelatedProducts(
  productId: string,
  count: number = 4,
  storefront?: MaybeStorefront,
): Promise<Product[]> {
  if (!storefront) return mock.getRelatedProducts(productId, count);

  const {productRecommendations} = await storefront.query(
    PRODUCT_RECOMMENDATIONS_QUERY,
    {variables: {productId}},
  );
  return (productRecommendations || []).slice(0, count).map(normalizeProduct);
}

export async function getFeaturedProducts(
  count: number = 8,
  storefront?: MaybeStorefront,
): Promise<Product[]> {
  if (!storefront) return mock.getFeaturedProducts(count);

  const {products} = await storefront.query(FEATURED_PRODUCTS_QUERY, {
    variables: {first: count},
  });
  return products.nodes.map(normalizeProduct);
}

export async function getSaleProducts(
  storefront?: MaybeStorefront,
): Promise<Product[]> {
  if (!storefront) return mock.getSaleProducts();

  const {products} = await storefront.query(ALL_PRODUCTS_QUERY, {
    variables: {first: 50},
  });
  return products.nodes
    .map(normalizeProduct)
    .filter((p: Product) => p.compareAtPrice !== null);
}

export async function searchProducts(
  query: string,
  storefront?: MaybeStorefront,
): Promise<Product[]> {
  if (!storefront) return mock.searchProducts(query);

  const {search} = await storefront.query(SEARCH_PRODUCTS_QUERY, {
    variables: {query, first: 40},
  });
  return search.nodes.map(normalizeProduct);
}

export async function getProductById(
  id: string,
  storefront?: MaybeStorefront,
): Promise<Product | null> {
  if (!storefront) return mock.getProductById(id);

  // In Shopify mode, product IDs are GIDs — not directly queryable by handle
  // For wishlist lookups, fall back to mock since wishlist stores mock IDs
  return mock.getProductById(id);
}

export function isShopifyMode(storefront?: MaybeStorefront): boolean {
  return !!storefront;
}
