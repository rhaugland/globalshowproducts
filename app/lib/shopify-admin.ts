/**
 * Shopify Admin REST API client
 * Server-side only — never import in client components.
 * API version: 2024-01
 */

const API_VERSION = '2024-01';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ShopifyAdminImage {
  id: number;
  product_id: number;
  position: number;
  src: string;
  alt: string | null;
  width: number;
  height: number;
}

export interface ShopifyAdminVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string | null;
  position: number;
  inventory_quantity: number;
  inventory_management: string | null;
  inventory_policy: string;
  fulfillment_service: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  weight: number;
  weight_unit: string;
  requires_shipping: boolean;
  taxable: boolean;
  barcode: string | null;
  image_id: number | null;
}

export interface ShopifyAdminOption {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyAdminProduct {
  id: number;
  title: string;
  body_html: string | null;
  vendor: string;
  product_type: string;
  handle: string;
  status: 'active' | 'archived' | 'draft';
  tags: string;
  variants: ShopifyAdminVariant[];
  options: ShopifyAdminOption[];
  images: ShopifyAdminImage[];
  image: ShopifyAdminImage | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ShopifyAdminCollection {
  id: number;
  title: string;
  handle: string;
  body_html: string | null;
  published_at: string | null;
  sort_order: string;
  image: ShopifyAdminImage | null;
  /** 'custom' | 'smart' — added client-side for disambiguation */
  collection_type?: 'custom' | 'smart';
}

/** Shape used when creating or updating a product via the admin form. */
export interface ProductFormData {
  title: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string;
  status?: 'active' | 'archived' | 'draft';
  variants?: Partial<ShopifyAdminVariant>[];
  options?: Partial<ShopifyAdminOption>[];
  images?: Partial<ShopifyAdminImage>[];
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function shopifyAdminFetch<T>(
  storeDomain: string,
  token: string,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown,
): Promise<T> {
  const url = `https://${storeDomain}/admin/api/${API_VERSION}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': token,
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Shopify Admin API error ${res.status} ${res.statusText} — ${endpoint}: ${text}`,
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Product CRUD
// ---------------------------------------------------------------------------

export async function getProducts(
  storeDomain: string,
  token: string,
  limit = 250,
): Promise<ShopifyAdminProduct[]> {
  const data = await shopifyAdminFetch<{products: ShopifyAdminProduct[]}>(
    storeDomain,
    token,
    `/products.json?limit=${limit}`,
  );
  return data.products;
}

export async function getProduct(
  storeDomain: string,
  token: string,
  productId: number | string,
): Promise<ShopifyAdminProduct> {
  const data = await shopifyAdminFetch<{product: ShopifyAdminProduct}>(
    storeDomain,
    token,
    `/products/${productId}.json`,
  );
  return data.product;
}

export async function createProduct(
  storeDomain: string,
  token: string,
  formData: ProductFormData,
): Promise<ShopifyAdminProduct> {
  const data = await shopifyAdminFetch<{product: ShopifyAdminProduct}>(
    storeDomain,
    token,
    '/products.json',
    'POST',
    {product: formData},
  );
  return data.product;
}

export async function updateProduct(
  storeDomain: string,
  token: string,
  productId: number | string,
  formData: Partial<ProductFormData>,
): Promise<ShopifyAdminProduct> {
  const data = await shopifyAdminFetch<{product: ShopifyAdminProduct}>(
    storeDomain,
    token,
    `/products/${productId}.json`,
    'PUT',
    {product: formData},
  );
  return data.product;
}

/** Sets a product's status to 'draft' (Shopify's equivalent of archiving). */
export async function archiveProduct(
  storeDomain: string,
  token: string,
  productId: number | string,
): Promise<ShopifyAdminProduct> {
  return updateProduct(storeDomain, token, productId, {status: 'draft'});
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export async function getCollections(
  storeDomain: string,
  token: string,
  limit = 250,
): Promise<ShopifyAdminCollection[]> {
  const [customData, smartData] = await Promise.all([
    shopifyAdminFetch<{custom_collections: ShopifyAdminCollection[]}>(
      storeDomain,
      token,
      `/custom_collections.json?limit=${limit}`,
    ),
    shopifyAdminFetch<{smart_collections: ShopifyAdminCollection[]}>(
      storeDomain,
      token,
      `/smart_collections.json?limit=${limit}`,
    ),
  ]);

  const custom = customData.custom_collections.map((c) => ({
    ...c,
    collection_type: 'custom' as const,
  }));
  const smart = smartData.smart_collections.map((c) => ({
    ...c,
    collection_type: 'smart' as const,
  }));

  return [...custom, ...smart];
}

interface Collect {
  id: number;
  collection_id: number;
  product_id: number;
}

/** Returns the collection IDs that currently contain the given product. */
export async function getProductCollections(
  storeDomain: string,
  token: string,
  productId: number | string,
): Promise<number[]> {
  const data = await shopifyAdminFetch<{collects: Collect[]}>(
    storeDomain,
    token,
    `/collects.json?product_id=${productId}`,
  );
  return data.collects.map((c) => c.collection_id);
}

/**
 * Diff-based: removes the product from collections it should no longer be in,
 * and adds it to collections that are new. Smart collections are managed by
 * Shopify rules and cannot be added/removed manually — they are silently
 * skipped if included in `desiredCollectionIds`.
 */
export async function setProductCollections(
  storeDomain: string,
  token: string,
  productId: number | string,
  desiredCollectionIds: number[],
): Promise<void> {
  // Fetch current collects (includes the collect ID needed for deletion)
  const currentData = await shopifyAdminFetch<{collects: Collect[]}>(
    storeDomain,
    token,
    `/collects.json?product_id=${productId}`,
  );
  const currentCollects = currentData.collects;

  const currentIds = new Set(currentCollects.map((c) => c.collection_id));
  const desiredIds = new Set(desiredCollectionIds);

  // Remove collects that are no longer desired
  const toRemove = currentCollects.filter((c) => !desiredIds.has(c.collection_id));
  // Add collects that don't exist yet
  const toAdd = desiredCollectionIds.filter((id) => !currentIds.has(id));

  await Promise.all([
    ...toRemove.map((c) =>
      shopifyAdminFetch<void>(storeDomain, token, `/collects/${c.id}.json`, 'DELETE'),
    ),
    ...toAdd.map((collectionId) =>
      shopifyAdminFetch<unknown>(storeDomain, token, '/collects.json', 'POST', {
        collect: {product_id: productId, collection_id: collectionId},
      }),
    ),
  ]);
}
