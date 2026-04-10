import type {Product, ProductVariant, Collection} from '~/lib/mock-storefront';

// Shopify GraphQL response types (minimal, matching our queries)
interface ShopifyImage {
  url: string;
  altText: string | null;
}

interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  selectedOptions: {name: string; value: string}[];
}

interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange: {
    minVariantPrice: ShopifyMoney;
  };
  images: {
    nodes: ShopifyImage[];
  };
  variants: {
    nodes: ShopifyVariant[];
  };
}

interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
}

export function normalizeProduct(sp: ShopifyProduct): Product {
  const price = parseFloat(sp.priceRange.minVariantPrice.amount);
  const compareAtRaw = parseFloat(sp.compareAtPriceRange.minVariantPrice.amount);
  const compareAtPrice = compareAtRaw > price ? compareAtRaw : null;

  const variants: ProductVariant[] = sp.variants.nodes.map((v) => ({
    id: v.id,
    title: v.title,
    price: parseFloat(v.price.amount),
    selectedOptions: v.selectedOptions,
    available: v.availableForSale,
  }));

  return {
    id: sp.id,
    handle: sp.handle,
    title: sp.title,
    description: sp.description,
    brand: sp.vendor,
    collectionIds: [], // not available from product query; unused in Shopify mode
    price,
    compareAtPrice,
    currency: sp.priceRange.minVariantPrice.currencyCode,
    images: sp.images.nodes.map((img) => img.url),
    variants,
    tags: sp.tags,
    available: sp.availableForSale,
  };
}

export function normalizeCollection(sc: ShopifyCollection): Collection {
  return {
    id: sc.id,
    handle: sc.handle,
    title: sc.title,
    description: sc.description,
    image: sc.image?.url ?? '',
  };
}
