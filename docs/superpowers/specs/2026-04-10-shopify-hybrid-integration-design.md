# Shopify Hybrid Storefront API Integration

**Date:** 2026-04-10
**Status:** Approved
**Project:** globalshowproducts

## Overview

Wire up the existing Hydrogen storefront to a real Shopify dev store via the Storefront API, while preserving the current mock data as a fallback when no credentials are configured. This enables the site to work as a standalone demo (no Shopify account needed) or as a live headless storefront connected to a real Shopify store.

## Goals

1. Real product/collection data from Shopify Storefront API when credentials are present
2. Automatic fallback to mock JSON data when credentials are absent
3. Shopify-hosted checkout redirect in live mode (Shopify handles payment, tax, shipping)
4. Existing mock checkout preserved for demo/fallback mode
5. Server-side cart via Hydrogen's cart API in live mode

## Architecture

```
Route Loaders
     │
     ▼
storefront.ts (unified data layer)
     │
     ├── PUBLIC_STOREFRONT_API_TOKEN set? ──▶ Shopify Storefront API (GraphQL)
     │
     └── No token? ──▶ mock-storefront.ts (local JSON files)
```

### Detection Logic

A single check at context creation time: if `PUBLIC_STOREFRONT_API_TOKEN` and `PUBLIC_STORE_DOMAIN` are both non-empty strings, the app operates in **Shopify mode**. Otherwise, **mock mode**. No feature flags or config files needed.

## Data Layer: `lib/storefront.ts`

New file that exports the same function signatures as `mock-storefront.ts` but accepts the Hydrogen `storefront` client as an optional parameter. When the client exists, it executes GraphQL queries. When it doesn't, it delegates to the mock functions.

### Functions

| Function | Shopify Mode | Mock Mode |
|----------|-------------|-----------|
| `getCollections(storefront?)` | `query { collections(first: 50) { ... } }` | `collectionsData` JSON |
| `getCollectionByHandle(handle, storefront?)` | `query { collection(handle: $handle) { ... } }` | filter JSON by handle |
| `getProductByHandle(handle, storefront?)` | `query { product(handle: $handle) { ... } }` | filter JSON by handle |
| `getProductsByCollection(handle, storefront?)` | `query { collection(handle: $handle) { products { ... } } }` | filter JSON by collectionId |
| `searchProducts(query, storefront?)` | `query { search(query: $query, types: PRODUCT) { ... } }` | local string matching |
| `getFeaturedProducts(count, storefront?)` | `query { products(first: $count, sortKey: BEST_SELLING) { ... } }` | slice JSON |
| `getSaleProducts(storefront?)` | `query { products(first: 20) { ... } }` + filter compareAtPrice | filter JSON |
| `getRelatedProducts(productId, count, storefront?)` | `query { productRecommendations(productId: $id) { ... } }` | scored matching |

### Data Normalization

Shopify API returns a different shape than our mock types. A `normalize` layer maps Shopify GraphQL responses to our existing `Product` and `Collection` interfaces so components don't need to change.

```typescript
// Shopify API → our Product interface
function normalizeProduct(shopifyProduct: ShopifyProduct): Product { ... }
function normalizeCollection(shopifyCollection: ShopifyCollection): Collection { ... }
```

## Cart

### Shopify Mode
Use Hydrogen's built-in server-side cart (`context.cart`). This provides:
- Server-managed cart state via Storefront API
- `cart.checkoutUrl` for redirect to Shopify checkout
- Automatic line item management

The existing `lib/cart.ts` (localStorage) is still used for:
- Quick client-side cart count display
- Optimistic UI updates before server confirms

### Mock Mode
Current `lib/cart.ts` localStorage cart continues to work exactly as-is.

## Checkout

### Shopify Mode
When the user clicks "Checkout":
1. Get `checkoutUrl` from the Hydrogen cart
2. `window.location.href = checkoutUrl` — redirects to Shopify's hosted checkout
3. Shopify handles payment processing, tax calculation, shipping rates
4. No custom checkout form needed

### Mock Mode
Existing multi-step checkout (`checkout.tsx`) continues to work with the simulated flow.

### Detection in UI
The checkout route checks if we're in Shopify mode (via a context flag or presence of cart `checkoutUrl`). If yes, redirect immediately. If no, render the mock checkout form.

## Environment Variables

### Required for Shopify mode
```
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
PUBLIC_STOREFRONT_API_TOKEN=your-storefront-api-token
SESSION_SECRET=any-random-string
```

### Required for mock mode (existing)
```
SESSION_SECRET=any-random-string
```

## Files to Create

| File | Purpose |
|------|---------|
| `lib/storefront.ts` | Unified data layer with GraphQL queries and mock fallback |
| `lib/shopify-queries.ts` | All Storefront API GraphQL query strings |
| `lib/normalize.ts` | Maps Shopify API responses → our Product/Collection types |
| `.env.example` | Documents all environment variables |

## Files to Modify

| File | Change |
|------|--------|
| `lib/context.ts` | Create real `StorefrontClient` when credentials exist; expose `isShopifyMode` flag |
| `env.d.ts` | Add `PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_TOKEN` to `Env` interface |
| `server.ts` | Pass new env vars through |
| `routes/_index.tsx` | Import from `storefront.ts`, use loader for server-side data fetching |
| `routes/collections._index.tsx` | Same swap |
| `routes/collections.$handle.tsx` | Same swap |
| `routes/products.$handle.tsx` | Same swap |
| `routes/search.tsx` | Same swap |
| `routes/cart.tsx` | Use Hydrogen cart in Shopify mode |
| `routes/checkout.tsx` | Add Shopify checkout redirect path |
| `routes/wishlist.tsx` | Adapt to use Shopify product IDs |

## Files NOT Changed

- All components (`components/*.tsx`) — they consume the same `Product`/`Collection` types
- `lib/auth.ts`, `lib/reviews.ts`, `lib/admin-data.ts` — unrelated features
- `lib/wishlist.ts` — stays localStorage-based
- `data/*.json` — mock data preserved as-is
- `scripts/export-to-shopify-csv.ts` — already exists for product import

## Route Loading Pattern

Routes currently call mock functions directly in the component body (client-side). For Shopify mode, data must be fetched server-side via loaders because the Storefront API requires server-side authentication.

### Pattern change:
```typescript
// BEFORE: client-side direct import
export default function Homepage() {
  const products = getFeaturedProducts(8);
  // ...
}

// AFTER: server-side loader with client hydration
export async function loader({ context }: Route.LoaderArgs) {
  const products = await getFeaturedProducts(8, context.storefront);
  return { products };
}

export default function Homepage({ loaderData }: Route.ComponentProps) {
  const { products } = loaderData;
  // ... same JSX
}
```

In mock mode, `context.storefront` is undefined, so `getFeaturedProducts` falls back to JSON data. The loader pattern works for both modes.

## Testing Strategy

- Existing tests continue to pass (mock mode is default)
- Manual testing with Shopify dev store for live mode
- CSV import to populate dev store with matching product catalog

## Product Import Flow

1. Run `npx tsx scripts/export-to-shopify-csv.ts` to generate CSV
2. In Shopify admin: Products → Import → upload CSV
3. Products appear in the store with matching handles
4. The storefront shows real Shopify data instead of mock JSON

## Out of Scope

- Customer authentication (Shopify Customer Account API) — future work
- Webhook handling — not needed for storefront reads
- Admin API integration — the admin panel stays as-is with local data
- Inventory management — read-only storefront
