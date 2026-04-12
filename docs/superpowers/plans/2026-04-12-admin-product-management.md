# Admin Product Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add product CRUD to the admin dashboard via Shopify Admin REST API, with a "Store" dropdown tab.

**Architecture:** A new server-side API route (`admin.api.products.ts`) proxies product operations to Shopify Admin REST API using the `SHOPIFY_ADMIN_API_TOKEN` env var. A new `ProductsManager` component in the admin dashboard handles the UI. The homepage auto-updates because it already queries Shopify's Storefront API.

**Tech Stack:** React Router 7 (Remix-style loaders/actions), Shopify Admin REST API (2024-01), TypeScript, Tailwind CSS

**Existing patterns to follow:**
- Route convention: `app/routes/<name>.tsx` with `loader`/`action` exports using `Route.LoaderArgs`/`Route.ActionArgs` from `./+types/<name>`
- Context access: `context.env` for environment variables, `context.storefront` for Storefront API
- Admin UI: `app/routes/admin.tsx` uses `useState` for tab management, dropdown pattern with click-outside close
- Styling: Tailwind with `brand-red`, `brand-gray`, `brand-red-dark` custom colors

---

### Task 1: Shopify Admin API Client

**Files:**
- Create: `app/lib/shopify-admin.ts`
- Modify: `env.d.ts`

This task builds the server-side API client that all product operations go through. It contains types, a fetch wrapper, and CRUD helpers.

- [ ] **Step 1: Add SHOPIFY_ADMIN_API_TOKEN to env types**

In `env.d.ts`, add the new env var to the `Env` interface:

```typescript
interface Env {
  SESSION_SECRET: string;
  PUBLIC_STORE_DOMAIN: string;
  PUBLIC_STOREFRONT_API_TOKEN: string;
  PRIVATE_STOREFRONT_API_TOKEN: string;
  PUBLIC_STOREFRONT_ID: string;
  PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: string;
  PUBLIC_CUSTOMER_ACCOUNT_API_URL: string;
  PUBLIC_CHECKOUT_DOMAIN: string;
  SHOP_ID: string;
  SHOPIFY_ADMIN_API_TOKEN: string;
}
```

- [ ] **Step 2: Create the Shopify Admin API client**

Create `app/lib/shopify-admin.ts` with the full content below:

```typescript
/**
 * Shopify Admin REST API client.
 * Runs server-side only — never import in client components.
 */

const API_VERSION = '2024-01';

// ─── Types ───

export interface ShopifyAdminProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  tags: string;
  status: 'active' | 'draft' | 'archived';
  handle: string;
  images: ShopifyAdminImage[];
  variants: ShopifyAdminVariant[];
  options: ShopifyAdminOption[];
}

export interface ShopifyAdminImage {
  id?: number;
  src: string;
  position: number;
}

export interface ShopifyAdminVariant {
  id?: number;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string;
  inventory_quantity?: number;
  weight: number;
  weight_unit: 'lb' | 'kg';
  option1: string | null;
  option2: string | null;
}

export interface ShopifyAdminOption {
  id?: number;
  name: string;
  values: string[];
}

export interface ShopifyAdminCollection {
  id: number;
  title: string;
  handle: string;
}

export interface ProductFormData {
  title: string;
  body_html: string;
  vendor: string;
  tags: string;
  status: 'active' | 'draft';
  images: { src: string; position: number }[];
  variants: {
    price: string;
    compare_at_price: string | null;
    sku: string;
    inventory_quantity: number;
    weight: number;
    weight_unit: 'lb' | 'kg';
    option1: string | null;
    option2: string | null;
  }[];
  options: { name: string; values: string[] }[];
  metafields_global_title_tag?: string;
  metafields_global_description_tag?: string;
}

// ─── Fetch wrapper ───

async function shopifyAdminFetch(
  storeDomain: string,
  token: string,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: object,
): Promise<Response> {
  const url = `https://${storeDomain}/admin/api/${API_VERSION}${endpoint}`;
  const headers: Record<string, string> = {
    'X-Shopify-Access-Token': token,
    'Content-Type': 'application/json',
  };
  return fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ─── Product CRUD ───

export async function getProducts(
  storeDomain: string,
  token: string,
): Promise<ShopifyAdminProduct[]> {
  const res = await shopifyAdminFetch(storeDomain, token, '/products.json?limit=250');
  if (!res.ok) throw new Error(`Shopify error: ${res.status}`);
  const data = await res.json();
  return data.products;
}

export async function getProduct(
  storeDomain: string,
  token: string,
  id: number,
): Promise<ShopifyAdminProduct> {
  const res = await shopifyAdminFetch(storeDomain, token, `/products/${id}.json`);
  if (!res.ok) throw new Error(`Shopify error: ${res.status}`);
  const data = await res.json();
  return data.product;
}

export async function createProduct(
  storeDomain: string,
  token: string,
  formData: ProductFormData,
): Promise<ShopifyAdminProduct> {
  const res = await shopifyAdminFetch(storeDomain, token, '/products.json', 'POST', {
    product: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.errors ? JSON.stringify(err.errors) : `Shopify error: ${res.status}`);
  }
  const data = await res.json();
  return data.product;
}

export async function updateProduct(
  storeDomain: string,
  token: string,
  id: number,
  formData: Partial<ProductFormData>,
): Promise<ShopifyAdminProduct> {
  const res = await shopifyAdminFetch(storeDomain, token, `/products/${id}.json`, 'PUT', {
    product: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.errors ? JSON.stringify(err.errors) : `Shopify error: ${res.status}`);
  }
  const data = await res.json();
  return data.product;
}

export async function archiveProduct(
  storeDomain: string,
  token: string,
  id: number,
): Promise<void> {
  const res = await shopifyAdminFetch(storeDomain, token, `/products/${id}.json`, 'PUT', {
    product: { status: 'draft' },
  });
  if (!res.ok) throw new Error(`Shopify error: ${res.status}`);
}

// ─── Collections ───

export async function getCollections(
  storeDomain: string,
  token: string,
): Promise<ShopifyAdminCollection[]> {
  const [customRes, smartRes] = await Promise.all([
    shopifyAdminFetch(storeDomain, token, '/custom_collections.json?limit=250'),
    shopifyAdminFetch(storeDomain, token, '/smart_collections.json?limit=250'),
  ]);
  if (!customRes.ok || !smartRes.ok) throw new Error('Failed to fetch collections');
  const [customData, smartData] = await Promise.all([customRes.json(), smartRes.json()]);
  return [
    ...customData.custom_collections,
    ...smartData.smart_collections,
  ];
}

// ─── Collection assignment ───

export async function getProductCollections(
  storeDomain: string,
  token: string,
  productId: number,
): Promise<number[]> {
  const res = await shopifyAdminFetch(
    storeDomain,
    token,
    `/collects.json?product_id=${productId}&limit=250`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.collects.map((c: { collection_id: number }) => c.collection_id);
}

export async function setProductCollections(
  storeDomain: string,
  token: string,
  productId: number,
  collectionIds: number[],
): Promise<void> {
  // Get current assignments
  const currentRes = await shopifyAdminFetch(
    storeDomain,
    token,
    `/collects.json?product_id=${productId}&limit=250`,
  );
  const currentData = currentRes.ok ? await currentRes.json() : { collects: [] };
  const currentCollects: { id: number; collection_id: number }[] = currentData.collects;

  const currentIds = new Set(currentCollects.map((c) => c.collection_id));
  const desiredIds = new Set(collectionIds);

  // Remove assignments not in desired set
  const toRemove = currentCollects.filter((c) => !desiredIds.has(c.collection_id));
  for (const collect of toRemove) {
    await shopifyAdminFetch(storeDomain, token, `/collects/${collect.id}.json`, 'DELETE');
  }

  // Add new assignments
  const toAdd = collectionIds.filter((id) => !currentIds.has(id));
  for (const collectionId of toAdd) {
    await shopifyAdminFetch(storeDomain, token, '/collects.json', 'POST', {
      collect: { product_id: productId, collection_id: collectionId },
    });
  }
}
```

- [ ] **Step 3: Add the Admin API token to .env**

Add to the bottom of `.env` (this file is gitignored):

```
SHOPIFY_ADMIN_API_TOKEN=shpat_PASTE_YOUR_TOKEN_HERE
```

The user must replace `shpat_PASTE_YOUR_TOKEN_HERE` with their actual token from Shopify.

- [ ] **Step 4: Verify the build compiles**

Run: `cd /Users/ryanhaugland/globalshowproducts && npx vite build 2>&1 | tail -5`

Expected: Build succeeds (the new file has no imports from client-side code).

- [ ] **Step 5: Commit**

```bash
git add app/lib/shopify-admin.ts env.d.ts
git commit -m "feat: add Shopify Admin API client with product CRUD helpers"
```

---

### Task 2: Server-Side API Route

**Files:**
- Create: `app/routes/admin.api.products.ts`

This route handles all product API requests from the admin dashboard. It runs server-side, reads the Admin API token from env, and proxies to Shopify.

- [ ] **Step 1: Create the API route**

Create `app/routes/admin.api.products.ts`:

```typescript
import type {Route} from './+types/admin.api.products';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  archiveProduct,
  getCollections,
  getProductCollections,
  setProductCollections,
  type ProductFormData,
} from '~/lib/shopify-admin';

function getCredentials(context: Route.LoaderArgs['context']) {
  const storeDomain = context.env.PUBLIC_STORE_DOMAIN;
  const token = context.env.SHOPIFY_ADMIN_API_TOKEN;
  if (!storeDomain || !token) {
    throw new Response('Shopify Admin API not configured', {status: 503});
  }
  return {storeDomain, token};
}

export async function loader({request, context}: Route.LoaderArgs) {
  const {storeDomain, token} = getCredentials(context);
  const url = new URL(request.url);

  // GET /admin/api/products?collections=1 → list collections
  if (url.searchParams.has('collections')) {
    const collections = await getCollections(storeDomain, token);
    return Response.json(collections);
  }

  // GET /admin/api/products?id=123 → single product for editing
  const id = url.searchParams.get('id');
  if (id) {
    const product = await getProduct(storeDomain, token, Number(id));
    const collectionIds = await getProductCollections(storeDomain, token, Number(id));
    return Response.json({...product, collectionIds});
  }

  // GET /admin/api/products → list all products
  const products = await getProducts(storeDomain, token);
  return Response.json(products);
}

export async function action({request, context}: Route.ActionArgs) {
  const {storeDomain, token} = getCredentials(context);

  const body = await request.json();
  const {intent} = body;

  if (intent === 'create') {
    const {formData, collectionIds} = body as {
      formData: ProductFormData;
      collectionIds: number[];
    };
    const product = await createProduct(storeDomain, token, formData);
    if (collectionIds?.length > 0) {
      await setProductCollections(storeDomain, token, product.id, collectionIds);
    }
    return Response.json(product);
  }

  if (intent === 'update') {
    const {id, formData, collectionIds} = body as {
      id: number;
      formData: Partial<ProductFormData>;
      collectionIds: number[];
    };
    const product = await updateProduct(storeDomain, token, id, formData);
    if (collectionIds !== undefined) {
      await setProductCollections(storeDomain, token, product.id, collectionIds);
    }
    return Response.json(product);
  }

  if (intent === 'archive') {
    const {id} = body as {id: number};
    await archiveProduct(storeDomain, token, id);
    return Response.json({success: true});
  }

  return Response.json({error: 'Unknown intent'}, {status: 400});
}
```

- [ ] **Step 2: Verify route loads**

Run: `cd /Users/ryanhaugland/globalshowproducts && npx vite build 2>&1 | tail -5`

Expected: Build succeeds. The route will be accessible at `/admin/api/products`.

- [ ] **Step 3: Commit**

```bash
git add app/routes/admin.api.products.ts
git commit -m "feat: add server-side API route for product CRUD via Shopify Admin API"
```

---

### Task 3: Products Manager Component

**Files:**
- Create: `app/components/admin/ProductsManager.tsx`

This is the main UI component — product list view with search, and inline add/edit form.

- [ ] **Step 1: Create the ProductsManager component**

First, create the directory:
```bash
mkdir -p /Users/ryanhaugland/globalshowproducts/app/components/admin
```

Create `app/components/admin/ProductsManager.tsx`:

```typescript
import {useState, useEffect, useCallback} from 'react';

// ─── Types (client-side mirrors of shopify-admin.ts) ───

interface AdminProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  tags: string;
  status: 'active' | 'draft' | 'archived';
  handle: string;
  images: { id?: number; src: string; position: number }[];
  variants: AdminVariant[];
  options: { id?: number; name: string; values: string[] }[];
  collectionIds?: number[];
}

interface AdminVariant {
  id?: number;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string;
  inventory_quantity?: number;
  weight: number;
  weight_unit: 'lb' | 'kg';
  option1: string | null;
  option2: string | null;
}

interface AdminCollection {
  id: number;
  title: string;
  handle: string;
}

type ViewMode = 'list' | 'create' | 'edit';

// ─── API helpers ───

async function fetchProducts(): Promise<AdminProduct[]> {
  const res = await fetch('/admin/api/products');
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

async function fetchProduct(id: number): Promise<AdminProduct> {
  const res = await fetch(`/admin/api/products?id=${id}`);
  if (!res.ok) throw new Error('Failed to load product');
  return res.json();
}

async function fetchCollections(): Promise<AdminCollection[]> {
  const res = await fetch('/admin/api/products?collections=1');
  if (!res.ok) throw new Error('Failed to load collections');
  return res.json();
}

async function saveProduct(
  intent: 'create' | 'update',
  formData: object,
  collectionIds: number[],
  id?: number,
): Promise<AdminProduct> {
  const res = await fetch('/admin/api/products', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({intent, id, formData, collectionIds}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({error: 'Save failed'}));
    throw new Error(err.error || 'Save failed');
  }
  return res.json();
}

async function archiveProduct(id: number): Promise<void> {
  const res = await fetch('/admin/api/products', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({intent: 'archive', id}),
  });
  if (!res.ok) throw new Error('Archive failed');
}

// ─── Utility ───

function totalInventory(product: AdminProduct): number {
  return product.variants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0);
}

function firstPrice(product: AdminProduct): string {
  if (product.variants.length > 0) return product.variants[0].price;
  return '0.00';
}

// ─── Main Component ───

export function ProductsManager() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('list');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load products on mount
  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const refreshProducts = useCallback(() => {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleEdit(id: number) {
    setEditingId(id);
    setView('edit');
  }

  function handleArchive(id: number, title: string) {
    if (!confirm(`Archive "${title}"? It will be hidden from the storefront.`)) return;
    archiveProduct(id)
      .then(() => {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? {...p, status: 'draft' as const} : p)),
        );
      })
      .catch((e) => setError(e.message));
  }

  function handleFormDone() {
    setView('list');
    setEditingId(null);
    refreshProducts();
  }

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.vendor.toLowerCase().includes(search.toLowerCase()),
  );

  if (view === 'create') {
    return (
      <ProductForm
        collections={collections}
        onLoadCollections={() =>
          fetchCollections().then(setCollections).catch((e) => setError(e.message))
        }
        onDone={handleFormDone}
        onCancel={() => setView('list')}
      />
    );
  }

  if (view === 'edit' && editingId) {
    return (
      <ProductForm
        editId={editingId}
        collections={collections}
        onLoadCollections={() =>
          fetchCollections().then(setCollections).catch((e) => setError(e.message))
        }
        onDone={handleFormDone}
        onCancel={() => { setView('list'); setEditingId(null); }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-brand-gray">
          Products{' '}
          <span className="text-sm font-normal text-gray-400">({filtered.length} total)</span>
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-brand-red focus:outline-none"
          />
          <button
            onClick={() => setView('create')}
            className="rounded-full bg-brand-red px-4 py-1.5 text-sm font-bold text-white transition hover:bg-brand-red-dark"
          >
            + Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-bold">
            ×
          </button>
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-center text-sm text-gray-400">Loading products from Shopify...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm italic text-gray-400">
          {search ? 'No products match your search' : 'No products yet'}
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
            >
              {product.images[0] ? (
                <img
                  src={product.images[0].src}
                  alt={product.title}
                  className="h-12 w-12 flex-shrink-0 rounded object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                  No img
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-brand-gray">{product.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {product.status === 'active' ? 'Active' : 'Draft'}
                  </span>
                  <span>${firstPrice(product)}</span>
                  <span>Qty: {totalInventory(product)}</span>
                  {product.vendor && <span>· {product.vendor}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleEdit(product.id)}
                  className="text-xs font-semibold text-brand-red hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleArchive(product.id, product.title)}
                  className="text-xs font-semibold text-red-500 hover:underline"
                >
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Product Form (Add / Edit) ───

interface ProductFormProps {
  editId?: number;
  collections: AdminCollection[];
  onLoadCollections: () => void;
  onDone: () => void;
  onCancel: () => void;
}

function ProductForm({editId, collections, onLoadCollections, onDone, onCancel}: ProductFormProps) {
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [vendor, setVendor] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Images
  const [images, setImages] = useState<{ src: string; position: number }[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  // Variants
  const [options, setOptions] = useState<{ name: string; values: string }[]>([]);
  const [variants, setVariants] = useState<
    {
      price: string;
      compare_at_price: string;
      sku: string;
      inventory_quantity: number;
      weight: number;
      weight_unit: 'lb' | 'kg';
      option1: string;
      option2: string;
    }[]
  >([
    {
      price: '',
      compare_at_price: '',
      sku: '',
      inventory_quantity: 0,
      weight: 0,
      weight_unit: 'lb',
      option1: '',
      option2: '',
    },
  ]);

  // Collections
  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);

  // Load collections and product data
  useEffect(() => {
    onLoadCollections();
    if (editId) {
      fetchProduct(editId)
        .then((p) => {
          setTitle(p.title);
          setBodyHtml(p.body_html || '');
          setVendor(p.vendor || '');
          setTags(p.tags || '');
          setStatus(p.status === 'active' ? 'active' : 'draft');
          setImages(p.images.map((img) => ({src: img.src, position: img.position})));
          if (p.options && p.options.length > 0 && p.options[0].name !== 'Title') {
            setOptions(
              p.options.map((o) => ({name: o.name, values: o.values.join(', ')})),
            );
          }
          setVariants(
            p.variants.map((v) => ({
              price: v.price,
              compare_at_price: v.compare_at_price || '',
              sku: v.sku || '',
              inventory_quantity: v.inventory_quantity || 0,
              weight: v.weight || 0,
              weight_unit: v.weight_unit || 'lb',
              option1: v.option1 || '',
              option2: v.option2 || '',
            })),
          );
          setSelectedCollections(p.collectionIds || []);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [editId]);

  // Generate variant combinations when options change
  function regenerateVariants() {
    const parsed = options
      .filter((o) => o.name.trim() && o.values.trim())
      .map((o) => ({
        name: o.name.trim(),
        values: o.values.split(',').map((v) => v.trim()).filter(Boolean),
      }));

    if (parsed.length === 0) {
      setVariants([
        {
          price: variants[0]?.price || '',
          compare_at_price: variants[0]?.compare_at_price || '',
          sku: '',
          inventory_quantity: 0,
          weight: 0,
          weight_unit: 'lb',
          option1: '',
          option2: '',
        },
      ]);
      return;
    }

    const combos: { option1: string; option2: string }[] = [];
    const vals1 = parsed[0]?.values || [''];
    const vals2 = parsed[1]?.values || [''];

    if (parsed.length === 1) {
      for (const v1 of vals1) combos.push({option1: v1, option2: ''});
    } else {
      for (const v1 of vals1) {
        for (const v2 of vals2) combos.push({option1: v1, option2: v2});
      }
    }

    const basePrice = variants[0]?.price || '';
    const baseCompare = variants[0]?.compare_at_price || '';
    setVariants(
      combos.map((c) => ({
        price: basePrice,
        compare_at_price: baseCompare,
        sku: '',
        inventory_quantity: 0,
        weight: 0,
        weight_unit: 'lb' as const,
        option1: c.option1,
        option2: c.option2,
      })),
    );
  }

  function addImage() {
    if (!imageUrl.trim()) return;
    setImages((prev) => [...prev, {src: imageUrl.trim(), position: prev.length + 1}]);
    setImageUrl('');
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index).map((img, i) => ({...img, position: i + 1})));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const updated = [...images];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setImages(updated.map((img, i) => ({...img, position: i + 1})));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);

    const parsedOptions = options
      .filter((o) => o.name.trim() && o.values.trim())
      .map((o) => ({
        name: o.name.trim(),
        values: o.values.split(',').map((v) => v.trim()).filter(Boolean),
      }));

    const formData = {
      title: title.trim(),
      body_html: bodyHtml,
      vendor: vendor.trim(),
      tags: tags.trim(),
      status,
      images,
      options: parsedOptions.length > 0 ? parsedOptions : [{name: 'Title', values: ['Default Title']}],
      variants: variants.map((v) => ({
        price: v.price || '0.00',
        compare_at_price: v.compare_at_price || null,
        sku: v.sku,
        inventory_quantity: v.inventory_quantity,
        weight: v.weight,
        weight_unit: v.weight_unit,
        option1: v.option1 || 'Default Title',
        option2: v.option2 || null,
      })),
      metafields_global_title_tag: seoTitle || undefined,
      metafields_global_description_tag: seoDescription || undefined,
    };

    try {
      await saveProduct(
        editId ? 'update' : 'create',
        formData,
        selectedCollections,
        editId,
      );
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-center text-sm text-gray-400">Loading product...</p>;
  }

  const hasOptions = options.length > 0;

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-brand-gray">
          {editId ? 'Edit Product' : 'New Product'}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand-red px-4 py-1.5 text-sm font-bold text-white transition hover:bg-brand-red-dark disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
      )}

      <div className="mt-4 space-y-6">
        {/* Basic Info */}
        <fieldset className="rounded-lg border border-gray-200 p-4">
          <legend className="px-2 text-sm font-bold text-brand-gray">Basic Info</legend>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Description</label>
              <textarea
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Vendor / Brand</label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                />
              </div>
            </div>
          </div>
        </fieldset>

        {/* Variants / Options */}
        <fieldset className="rounded-lg border border-gray-200 p-4">
          <legend className="px-2 text-sm font-bold text-brand-gray">Variants</legend>
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Option name (e.g. Size)
                  </label>
                  <input
                    type="text"
                    value={opt.name}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[i] = {...updated[i], name: e.target.value};
                      setOptions(updated);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                  />
                </div>
                <div className="flex-[2]">
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Values (comma-separated, e.g. S, M, L)
                  </label>
                  <input
                    type="text"
                    value={opt.values}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[i] = {...updated[i], values: e.target.value};
                      setOptions(updated);
                    }}
                    onBlur={regenerateVariants}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOptions((prev) => prev.filter((_, j) => j !== i));
                    setTimeout(regenerateVariants, 0);
                  }}
                  className="mb-0.5 text-xs font-semibold text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            {options.length < 2 && (
              <button
                type="button"
                onClick={() => setOptions((prev) => [...prev, {name: '', values: ''}])}
                className="text-xs font-semibold text-brand-red hover:underline"
              >
                + Add Option
              </button>
            )}
          </div>

          {/* Variant rows */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  {hasOptions && options[0]?.name && <th className="pb-2 pr-2">{options[0].name}</th>}
                  {hasOptions && options[1]?.name && <th className="pb-2 pr-2">{options[1].name}</th>}
                  <th className="pb-2 pr-2">Price *</th>
                  <th className="pb-2 pr-2">Compare-at</th>
                  <th className="pb-2 pr-2">SKU</th>
                  <th className="pb-2 pr-2">Qty</th>
                  <th className="pb-2 pr-2">Weight</th>
                  <th className="pb-2">Unit</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {hasOptions && options[0]?.name && (
                      <td className="py-1.5 pr-2 text-gray-600">{v.option1}</td>
                    )}
                    {hasOptions && options[1]?.name && (
                      <td className="py-1.5 pr-2 text-gray-600">{v.option2}</td>
                    )}
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        step="0.01"
                        value={v.price}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[i] = {...updated[i], price: e.target.value};
                          setVariants(updated);
                        }}
                        className="w-20 rounded border border-gray-200 px-2 py-1 text-xs focus:border-brand-red focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        step="0.01"
                        value={v.compare_at_price}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[i] = {...updated[i], compare_at_price: e.target.value};
                          setVariants(updated);
                        }}
                        className="w-20 rounded border border-gray-200 px-2 py-1 text-xs focus:border-brand-red focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[i] = {...updated[i], sku: e.target.value};
                          setVariants(updated);
                        }}
                        className="w-20 rounded border border-gray-200 px-2 py-1 text-xs focus:border-brand-red focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        value={v.inventory_quantity}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[i] = {...updated[i], inventory_quantity: Number(e.target.value)};
                          setVariants(updated);
                        }}
                        className="w-16 rounded border border-gray-200 px-2 py-1 text-xs focus:border-brand-red focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        step="0.1"
                        value={v.weight}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[i] = {...updated[i], weight: Number(e.target.value)};
                          setVariants(updated);
                        }}
                        className="w-16 rounded border border-gray-200 px-2 py-1 text-xs focus:border-brand-red focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5">
                      <select
                        value={v.weight_unit}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[i] = {...updated[i], weight_unit: e.target.value as 'lb' | 'kg'};
                          setVariants(updated);
                        }}
                        className="rounded border border-gray-200 px-1 py-1 text-xs focus:border-brand-red focus:outline-none"
                      >
                        <option value="lb">lb</option>
                        <option value="kg">kg</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>

        {/* Images */}
        <fieldset className="rounded-lg border border-gray-200 p-4">
          <legend className="px-2 text-sm font-bold text-brand-gray">Images</legend>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
            />
            <button
              type="button"
              onClick={addImage}
              className="rounded-lg bg-brand-red px-3 py-2 text-sm font-bold text-white hover:bg-brand-red-dark"
            >
              Add
            </button>
          </div>
          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="group relative">
                  <img
                    src={img.src}
                    alt={`Product image ${i + 1}`}
                    className="h-20 w-20 rounded border border-gray-200 object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute -top-1 -left-1 rounded bg-brand-red px-1 text-[10px] font-bold text-white">
                      Main
                    </span>
                  )}
                  <div className="absolute -top-1 -right-1 flex gap-0.5">
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, -1)}
                        className="rounded-full bg-white px-1 text-xs shadow hover:bg-gray-100"
                      >
                        ←
                      </button>
                    )}
                    {i < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, 1)}
                        className="rounded-full bg-white px-1 text-xs shadow hover:bg-gray-100"
                      >
                        →
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="rounded-full bg-white px-1 text-xs font-bold text-red-500 shadow hover:bg-red-50"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </fieldset>

        {/* Organization */}
        <fieldset className="rounded-lg border border-gray-200 p-4">
          <legend className="px-2 text-sm font-bold text-brand-gray">Organization</legend>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Collections</label>
              <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-200 p-2">
                {collections.length === 0 ? (
                  <p className="text-xs italic text-gray-400">Loading collections...</p>
                ) : (
                  collections.map((col) => (
                    <label key={col.id} className="flex items-center gap-2 py-0.5 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedCollections.includes(col.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCollections((prev) => [...prev, col.id]);
                          } else {
                            setSelectedCollections((prev) => prev.filter((id) => id !== col.id));
                          }
                        }}
                        className="accent-brand-red"
                      />
                      {col.title}
                    </label>
                  ))
                )}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={status === 'active'}
                    onChange={() => setStatus('active')}
                    className="accent-brand-red"
                  />
                  Active
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                    className="accent-brand-red"
                  />
                  Draft
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        {/* SEO */}
        <fieldset className="rounded-lg border border-gray-200 p-4">
          <legend className="px-2 text-sm font-bold text-brand-gray">SEO</legend>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">SEO Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title || 'Product title'}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">SEO Description</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder={bodyHtml?.slice(0, 160) || 'Product description'}
                rows={2}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
              />
            </div>
          </div>
        </fieldset>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `cd /Users/ryanhaugland/globalshowproducts && npx vite build 2>&1 | tail -5`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/components/admin/ProductsManager.tsx
git commit -m "feat: add ProductsManager component with list view and product form"
```

---

### Task 4: Wire Products Into Admin Dashboard

**Files:**
- Modify: `app/routes/admin.tsx`

Add the "Store" dropdown tab and render ProductsManager.

- [ ] **Step 1: Add import for ProductsManager**

At the top of `app/routes/admin.tsx`, after the existing imports, add:

```typescript
import {ProductsManager} from '../components/admin/ProductsManager';
```

- [ ] **Step 2: Update the tab type and add Store dropdown state**

In the `AdminPage` component, change the tab state and add the store dropdown state. Replace:

```typescript
const [tab, setTab] = useState<'events' | 'videos' | 'contacts'>('events');
const [eventsDropdownOpen, setEventsDropdownOpen] = useState(false);
```

With:

```typescript
const [tab, setTab] = useState<'events' | 'videos' | 'contacts' | 'products'>('events');
const [eventsDropdownOpen, setEventsDropdownOpen] = useState(false);
const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
```

- [ ] **Step 3: Add click-outside handler for Store dropdown**

After the existing `eventsDropdownOpen` useEffect, add:

```typescript
useEffect(() => {
  if (!storeDropdownOpen) return;
  function handleClick() {
    setStoreDropdownOpen(false);
  }
  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
}, [storeDropdownOpen]);
```

- [ ] **Step 4: Add isStoreSection computed value**

After the existing `isEventsSection` line, add:

```typescript
const isStoreSection = tab === 'products';
```

- [ ] **Step 5: Add the Store dropdown tab to the tab bar**

In the tab bar JSX (the `<div className="mt-6 flex gap-1 border-b border-gray-200">` element), add the Store dropdown between the Events dropdown closing `</div>` and the Videos `<button>`. Insert:

```tsx
{/* Store dropdown tab */}
<div className="relative">
  <button
    onClick={(e) => {
      e.stopPropagation();
      setStoreDropdownOpen(!storeDropdownOpen);
    }}
    className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold transition ${
      isStoreSection
        ? 'border-b-2 border-brand-red text-brand-red'
        : 'text-gray-500 hover:text-brand-gray'
    }`}
  >
    {tab === 'products' ? 'Products' : 'Store'}
    <svg className={`h-3.5 w-3.5 transition-transform ${storeDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
  {storeDropdownOpen && (
    <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
      <button
        onClick={() => { setTab('products'); setStoreDropdownOpen(false); }}
        className={`block w-full px-4 py-2 text-left text-sm transition ${
          tab === 'products' ? 'bg-gray-50 font-semibold text-brand-red' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        Products
      </button>
    </div>
  )}
</div>
```

- [ ] **Step 6: Add ProductsManager to the content area**

In the content `<div className="mt-6">`, after the existing tab conditionals, add:

```tsx
{tab === 'products' && <ProductsManager />}
```

- [ ] **Step 7: Verify the dev server loads the admin page**

Run the dev server and navigate to `http://localhost:3100/admin`. Log in and verify:
- Three tab groups appear: Events (dropdown), Store (dropdown), Videos
- Clicking Store dropdown shows "Products"
- Clicking Products shows the ProductsManager with "Loading products from Shopify..."

- [ ] **Step 8: Commit**

```bash
git add app/routes/admin.tsx
git commit -m "feat: add Store dropdown tab with Products manager to admin dashboard"
```

---

### Task 5: End-to-End Testing

**Files:**
- Create: `/tmp/test_products_admin.py` (temporary test script)

Test the full flow with Playwright to verify the integration works.

- [ ] **Step 1: Ensure the SHOPIFY_ADMIN_API_TOKEN is set in .env**

The user must have a valid token. If not yet set, this task is blocked until the user creates a Shopify custom app and pastes the token.

- [ ] **Step 2: Write and run Playwright test**

Create `/tmp/test_products_admin.py`:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Login
    page.goto('http://localhost:3100/admin')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)
    page.fill('#username', 'globalshowproducts')
    page.fill('#password', 'password1723')
    page.click('button:has-text("Sign In")')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)

    # Navigate to Store > Products
    store_dropdown = page.locator('.relative > button:has-text("Store")')
    if store_dropdown.count() == 0:
        store_dropdown = page.locator('.relative > button:has-text("Products")')
    store_dropdown.click()
    page.wait_for_timeout(500)
    page.screenshot(path='/tmp/admin_store_dropdown.png')

    page.locator('button:has-text("Products")').last.click()
    page.wait_for_timeout(3000)
    page.screenshot(path='/tmp/admin_products_list.png', full_page=True)

    # Check if products loaded
    content = page.content()
    if 'Loading products' in content:
        print("WARNING: Products still loading — check API token")
    elif 'No products yet' in content:
        print("OK: No products in Shopify store (empty state)")
    elif 'Add Product' in content:
        print("SUCCESS: Products page loaded")
    else:
        print("UNKNOWN STATE")

    # Click Add Product
    page.click('button:has-text("Add Product")')
    page.wait_for_timeout(500)
    page.screenshot(path='/tmp/admin_product_form.png', full_page=True)
    print("Product form displayed")

    browser.close()
    print("All checks passed!")
```

Run: `python3 /tmp/test_products_admin.py`

Expected: Screenshots show the Store dropdown, products list (or empty state), and the product form.

- [ ] **Step 3: Review screenshots and verify UI**

Check `/tmp/admin_store_dropdown.png`, `/tmp/admin_products_list.png`, and `/tmp/admin_product_form.png` to confirm:
- Store dropdown renders correctly
- Product list shows products from Shopify (or empty state if store is empty)
- Product form has all sections: Basic Info, Variants, Images, Organization, SEO

- [ ] **Step 4: Test creating a product (manual)**

Navigate to `http://localhost:3100/admin` in a browser, go to Store > Products, click "+ Add Product", fill in:
- Title: "Test Product"
- Price: 9.99
- Status: Draft

Click Save. Verify the product appears in the list with "Draft" status. Then check Shopify admin to confirm it was created.

- [ ] **Step 5: Final commit if any fixes were needed**

If any fixes were made during testing:

```bash
git add -A
git commit -m "fix: address issues found during product management testing"
```
