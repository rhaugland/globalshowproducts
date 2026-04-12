# Admin Product Management via Shopify Admin API — Design Spec

## Goal

Allow the admin dashboard to create, edit, and archive products in the Shopify store. Changes sync to the live storefront automatically since the homepage already queries Shopify's Storefront API.

## Architecture

```
Admin Dashboard (browser)
  → form submit (POST to /admin/api/products route)
  → server-side action (holds Admin API token)
  → Shopify Admin REST API
  → Product created/updated/archived in Shopify
  → Homepage Storefront API queries reflect changes automatically
```

The Admin API token stays server-side — never exposed to the browser. The dashboard sends form data to a Remix action route, which proxies CRUD operations to Shopify.

### New Files

| File | Purpose |
|------|---------|
| `app/routes/admin.api.products.ts` | Server-side action route — proxies product CRUD to Shopify Admin REST API |
| `app/components/admin/ProductsManager.tsx` | Products list + form UI for the admin dashboard |
| `app/lib/shopify-admin.ts` | Shopify Admin API client helpers (fetch wrapper, types, error handling) |

### Modified Files

| File | Change |
|------|--------|
| `app/routes/admin.tsx` | Add "Store" dropdown tab with Products sub-item; import ProductsManager |
| `env.d.ts` | Add `SHOPIFY_ADMIN_API_TOKEN` to Env interface |
| `.env` | Add `SHOPIFY_ADMIN_API_TOKEN` value (not committed) |

## Setup Requirements

The client creates a Shopify custom app:

1. Shopify Admin → Settings → Apps and sales channels → Develop apps
2. Create app → Configure Admin API scopes: `write_products`, `read_products`, `write_inventory`, `read_inventory`
3. Install app → Copy Admin API access token
4. Add to `.env`: `SHOPIFY_ADMIN_API_TOKEN=shpat_xxxxx`

## Shopify Admin API Client (`app/lib/shopify-admin.ts`)

### Configuration

Uses environment variables:
- `PUBLIC_STORE_DOMAIN` (already exists) — e.g. `globalshowproducts-dev.myshopify.com`
- `SHOPIFY_ADMIN_API_TOKEN` (new) — the custom app's Admin API access token

API version: `2024-01`

Base URL: `https://{PUBLIC_STORE_DOMAIN}/admin/api/2024-01`

### Types

```typescript
export interface ShopifyAdminProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  tags: string;
  status: 'active' | 'draft' | 'archived';
  images: { id?: number; src: string; position: number }[];
  variants: ShopifyAdminVariant[];
  options: { name: string; values: string[] }[];
  metafields_global_title_tag?: string;
  metafields_global_description_tag?: string;
}

export interface ShopifyAdminVariant {
  id?: number;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string;
  inventory_quantity: number;
  weight: number;
  weight_unit: 'lb' | 'kg';
  option1: string | null;
  option2: string | null;
}

export interface ShopifyCollection {
  id: number;
  title: string;
  handle: string;
}
```

### Helper Functions

```typescript
shopifyAdminFetch(endpoint: string, method: string, body?: object): Promise<Response>
```

Thin wrapper that sets `X-Shopify-Access-Token` header and `Content-Type: application/json`.

```typescript
getProducts(): Promise<ShopifyAdminProduct[]>
getProduct(id: number): Promise<ShopifyAdminProduct>
createProduct(data: ProductFormData): Promise<ShopifyAdminProduct>
updateProduct(id: number, data: ProductFormData): Promise<ShopifyAdminProduct>
archiveProduct(id: number): Promise<void>  // sets status to 'draft'
getCollections(): Promise<ShopifyCollection[]>
assignProductToCollections(productId: number, collectionIds: number[]): Promise<void>
```

## Server-Side API Route (`app/routes/admin.api.products.ts`)

### Loader (GET)

Returns the product list from Shopify Admin API. Checks admin session first.

```
GET /admin/api/products → JSON array of products
GET /admin/api/products?id=123 → single product for edit form
GET /admin/api/products?collections=1 → list of collections for the assignment dropdown
```

### Action (POST)

Accepts form data with an `intent` field:

| Intent | Action | Shopify API Call |
|--------|--------|-----------------|
| `create` | Create new product | `POST /admin/api/2024-01/products.json` |
| `update` | Update existing product | `PUT /admin/api/2024-01/products/{id}.json` |
| `archive` | Set status to draft | `PUT /admin/api/2024-01/products/{id}.json` with `status: 'draft'` |

**Auth check:** Every request verifies admin session via cookie. Returns 401 if not authenticated.

**Error handling:** Shopify validation errors (e.g. missing title) are returned as JSON `{ error: string, fields?: Record<string, string> }`. The form displays field-level errors. Network failures return `{ error: "Failed to connect to Shopify" }`.

## Products Manager Component (`app/components/admin/ProductsManager.tsx`)

### State

```typescript
const [products, setProducts] = useState<ShopifyAdminProduct[]>([]);
const [loading, setLoading] = useState(true);
const [editing, setEditing] = useState<ShopifyAdminProduct | null>(null);  // null = list view, object = editing, 'new' = creating
const [collections, setCollections] = useState<ShopifyCollection[]>([]);
const [search, setSearch] = useState('');
const [saving, setSaving] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### List View

Displayed when `editing` is null.

```
┌──────────────────────────────────────────────────────┐
│  Products (24 total)              [Search...]        │
│                                   [+ Add Product]    │
│                                                      │
│  [img] Hover Ball Swoosh    Active   $9.99   Qty: 50│
│                                        Edit  Archive │
│  [img] Magic Sand Glow      Draft    $20.00  Qty: 12│
│                                        Edit  Archive │
└──────────────────────────────────────────────────────┘
```

- Table rows: thumbnail (first image, 48x48), title, status badge (green "Active" / gray "Draft"), price (first variant), total inventory, Edit button, Archive button
- Search bar filters by title (client-side)
- Status badges: `bg-green-100 text-green-700` for active, `bg-gray-100 text-gray-500` for draft
- Archive button shows confirmation: "Archive this product? It will be hidden from the storefront."

### Product Form (Add / Edit)

Replaces the list view inline (same pattern as Events form). Sections organized with headers:

**Basic Info Section**
- Title — text input, required
- Description — textarea (multi-line)
- Vendor/Brand — text input
- Tags — text input (comma-separated)

**Pricing Section** (shown when no variants, otherwise pricing is per-variant)
- Price — number input, required
- Compare-at price — number input (blank = no sale)

**Variants Section**
- "Add Option" button — adds an option type row (e.g. "Size")
- Each option type: name input + values input (comma-separated, e.g. "S, M, L")
- Up to 2 option types supported
- When options exist, a variant table auto-generates with all combinations:

```
┌───────────────────────────────────────────────────────┐
│  Size   Color    Price    Compare  SKU    Qty  Weight │
│  S      Red      $9.99            SK-01   50   0.5lb │
│  S      Blue     $9.99            SK-02   50   0.5lb │
│  M      Red      $10.99           SK-03   30   0.6lb │
│  ...                                                  │
└───────────────────────────────────────────────────────┘
```

- Each variant row is independently editable
- Default values: price from main price field, SKU blank, qty 0, weight 0

**Inventory & Shipping Section** (shown when no variants)
- SKU — text input
- Inventory quantity — number input
- Weight — number input + unit selector (lb/kg dropdown)

**Images Section**
- URL text input + "Add" button
- Added images show as thumbnail previews in a row
- Drag handle for reorder (first = featured image)
- X button to remove
- Minimum: display order, no drag-to-reorder in v1 (use up/down arrows instead)

**Organization Section**
- Collections — multi-select checkboxes (fetched from Shopify on form mount)
- Status — radio buttons: Active / Draft

**SEO Section**
- SEO title — text input (placeholder: product title)
- SEO description — textarea (placeholder: first 160 chars of description)

**Form Actions**
- "Save" button — right-aligned, `bg-brand-red text-white`, shows spinner while saving
- "Cancel" button — returns to list view, discards changes
- On success: returns to list view, product appears in list
- On error: field-level error messages + top-level error banner

### Data Flow

**Loading products:**
```
Component mounts → fetch('/admin/api/products') → setProducts(data) → setLoading(false)
```

**Creating a product:**
```
Fill form → click Save → setSaving(true)
→ fetch('/admin/api/products', { method: 'POST', body: { intent: 'create', ...formData } })
→ success: prepend to products list, setEditing(null)
→ error: display error, setSaving(false)
```

**Editing a product:**
```
Click Edit → fetch('/admin/api/products?id=123') → setEditing(product) → populate form
→ modify fields → click Save → setSaving(true)
→ fetch('/admin/api/products', { method: 'POST', body: { intent: 'update', id: 123, ...formData } })
→ success: update in products list, setEditing(null)
→ error: display error, setSaving(false)
```

**Archiving a product:**
```
Click Archive → confirm dialog
→ fetch('/admin/api/products', { method: 'POST', body: { intent: 'archive', id: 123 } })
→ success: update product status in list to 'draft'
→ error: display error toast
```

## Dashboard Tab Changes

The tab bar becomes:

```
[ Events ▾ ]  [ Store ▾ ]  [ Videos ]
```

- **Events dropdown**: Events, Contacts (existing, no change)
- **Store dropdown**: Products (new — same dropdown pattern as Events)
- **Videos**: standalone tab (no change)

Implementation: add a second dropdown state (`storeDropdownOpen`) using the same pattern as the existing Events dropdown. Tab type expands to include `'products'`:

```typescript
const [tab, setTab] = useState<'events' | 'videos' | 'contacts' | 'products'>('events');
```

## What This Does NOT Include

- No file/image upload (URL-only for images)
- No bulk operations (import/export CSV)
- No inventory tracking history
- No order management
- No collection CRUD (uses existing collections from Shopify)
- No product duplication
- No scheduled publishing
- No third option type for variants (Shopify supports 3, we support 2)
