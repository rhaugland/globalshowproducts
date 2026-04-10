# Shopify Hybrid Storefront API Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the Hydrogen storefront to a real Shopify dev store via Storefront API, with automatic fallback to mock JSON data when no credentials are configured.

**Architecture:** A unified data layer (`storefront.ts`) detects whether Shopify credentials exist and either queries the Storefront API via GraphQL or delegates to existing mock functions. Routes switch from direct client-side calls to React Router loaders for server-side data fetching. Cart uses Hydrogen's built-in cart in Shopify mode; checkout redirects to Shopify's hosted checkout.

**Tech Stack:** Shopify Hydrogen, Storefront API (GraphQL), React Router 7, TypeScript, Tailwind CSS

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `app/lib/shopify-queries.ts` | Create | All Storefront API GraphQL query strings |
| `app/lib/normalize.ts` | Create | Maps Shopify API responses → existing Product/Collection types |
| `app/lib/storefront.ts` | Create | Unified data layer: Shopify API or mock fallback |
| `.env.example` | Create | Documents required environment variables |
| `env.d.ts` | Modify | Add new env var types to `Env` interface |
| `server.ts` | Modify | Pass new env vars through to context |
| `app/lib/context.ts` | Modify | Create real StorefrontClient when credentials exist |
| `app/routes/_index.tsx` | Modify | Switch to loader pattern with storefront.ts |
| `app/routes/collections._index.tsx` | Modify | Switch to loader pattern |
| `app/routes/collections.$handle.tsx` | Modify | Switch to loader pattern |
| `app/routes/products.$handle.tsx` | Modify | Switch to loader pattern |
| `app/routes/search.tsx` | Modify | Switch to loader pattern |
| `app/routes/wishlist.tsx` | Modify | Switch to loader for product lookups |
| `app/routes/cart.tsx` | Modify | Add Hydrogen cart support in Shopify mode |
| `app/routes/checkout.tsx` | Modify | Add Shopify checkout redirect |

---

### Task 1: Environment & Type Setup

**Files:**
- Create: `.env.example`
- Modify: `env.d.ts`
- Modify: `server.ts`

- [ ] **Step 1: Create `.env.example`**

```bash
# .env.example
SESSION_SECRET=your-session-secret

# Shopify Storefront API (optional — omit for mock/demo mode)
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
PUBLIC_STOREFRONT_API_TOKEN=your-storefront-api-token
```

- [ ] **Step 2: Add env var types to `env.d.ts`**

Add an `Env` interface to `env.d.ts`:

```typescript
/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

import '@total-typescript/ts-reset';

interface Env {
  SESSION_SECRET: string;
  PUBLIC_STORE_DOMAIN?: string;
  PUBLIC_STOREFRONT_API_TOKEN?: string;
}
```

- [ ] **Step 3: Update `server.ts` to pass new env vars**

```typescript
import {createRequestHandler} from 'react-router';

const handler = createRequestHandler(
  // @ts-expect-error virtual module
  () => import('virtual:react-router/server-build'),
  process.env.NODE_ENV,
);

export default async function (req: Request): Promise<Response> {
  return handler(req, {
    env: {
      SESSION_SECRET: process.env.SESSION_SECRET || 'dev-secret',
      PUBLIC_STORE_DOMAIN: process.env.PUBLIC_STORE_DOMAIN || '',
      PUBLIC_STOREFRONT_API_TOKEN: process.env.PUBLIC_STOREFRONT_API_TOKEN || '',
    },
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add .env.example env.d.ts server.ts
git commit -m "feat: add Shopify env var types and .env.example"
```

---

### Task 2: GraphQL Queries

**Files:**
- Create: `app/lib/shopify-queries.ts`

All Storefront API GraphQL queries needed by the storefront. Each query returns exactly the fields needed to populate our `Product` and `Collection` types.

- [ ] **Step 1: Create `app/lib/shopify-queries.ts`**

```typescript
export const COLLECTIONS_QUERY = `#graphql
  query Collections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        description
        image {
          url
          altText
        }
      }
    }
  }
` as const;

export const COLLECTION_BY_HANDLE_QUERY = `#graphql
  query CollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
      }
      products(first: 50) {
        nodes {
          id
          handle
          title
          description
          vendor
          tags
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            nodes {
              url
              altText
            }
          }
          variants(first: 20) {
            nodes {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
` as const;

export const PRODUCT_BY_HANDLE_QUERY = `#graphql
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      vendor
      tags
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        nodes {
          url
          altText
        }
      }
      variants(first: 20) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
` as const;

export const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      id
      handle
      title
      description
      vendor
      tags
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        nodes {
          url
          altText
        }
      }
      variants(first: 20) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
` as const;

export const FEATURED_PRODUCTS_QUERY = `#graphql
  query FeaturedProducts($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        id
        handle
        title
        description
        vendor
        tags
        availableForSale
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          nodes {
            url
            altText
          }
        }
        variants(first: 20) {
          nodes {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
` as const;

export const SEARCH_PRODUCTS_QUERY = `#graphql
  query SearchProducts($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: PRODUCT) {
      nodes {
        ... on Product {
          id
          handle
          title
          description
          vendor
          tags
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            nodes {
              url
              altText
            }
          }
          variants(first: 20) {
            nodes {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
` as const;

export const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts($first: Int!) {
    products(first: $first) {
      nodes {
        id
        handle
        title
        description
        vendor
        tags
        availableForSale
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          nodes {
            url
            altText
          }
        }
        variants(first: 20) {
          nodes {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
` as const;
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/shopify-queries.ts
git commit -m "feat: add Storefront API GraphQL queries"
```

---

### Task 3: Normalization Layer

**Files:**
- Create: `app/lib/normalize.ts`

Maps Shopify GraphQL response shapes to our existing `Product` and `Collection` interfaces so components don't change.

- [ ] **Step 1: Create `app/lib/normalize.ts`**

```typescript
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
    collectionIds: [], // not available from product query; unused when in Shopify mode
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
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/normalize.ts
git commit -m "feat: add normalization layer for Shopify API responses"
```

---

### Task 4: Unified Data Layer

**Files:**
- Create: `app/lib/storefront.ts`

The core of the hybrid approach. Each function accepts an optional `storefront` client. When present, queries Shopify. When absent, delegates to mock functions.

- [ ] **Step 1: Create `app/lib/storefront.ts`**

```typescript
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

  // Shopify has no "on sale" filter; fetch products and filter client-side
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

  // Storefront API doesn't have a direct ID lookup for products easily;
  // use the node query pattern
  const {product} = await storefront.query(PRODUCT_BY_HANDLE_QUERY, {
    variables: {handle: id},
  });
  return product ? normalizeProduct(product) : null;
}

/** Returns true if the storefront client is available (Shopify mode) */
export function isShopifyMode(storefront?: MaybeStorefront): boolean {
  return !!storefront;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/storefront.ts
git commit -m "feat: add unified data layer with Shopify/mock fallback"
```

---

### Task 5: Wire Up Hydrogen Context

**Files:**
- Modify: `app/lib/context.ts`

Update the Hydrogen context to create a real `StorefrontClient` when credentials are present. Expose the storefront client (or undefined) so routes can pass it to the data layer.

- [ ] **Step 1: Update `app/lib/context.ts`**

Replace the full file content with:

```typescript
import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';

/**
 * Creates Hydrogen context for React Router.
 * When PUBLIC_STOREFRONT_API_TOKEN is set, creates a real Storefront client.
 * Otherwise, Hydrogen initializes without API access (mock mode).
 */
export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext({
    env,
    request,
    cache,
    waitUntil,
    session,
    i18n: {language: 'EN', country: 'US'},
    cart: {
      queryFragment: CART_QUERY_FRAGMENT,
    },
  });

  return hydrogenContext;
}
```

Note: The Hydrogen context automatically creates the storefront client when `PUBLIC_STORE_DOMAIN` and `PUBLIC_STOREFRONT_API_TOKEN` are in the env. No manual `createStorefrontClient` call needed — Hydrogen reads these env vars by convention.

- [ ] **Step 2: Verify the app starts**

```bash
cd /Users/ryanhaugland/globalshowproducts && npm run dev
```

Open the site in a browser. It should still work in mock mode. If `PUBLIC_STOREFRONT_API_TOKEN` is set in `.env`, Hydrogen will initialize the storefront client automatically.

- [ ] **Step 3: Commit**

```bash
git add app/lib/context.ts
git commit -m "feat: wire Hydrogen context for real Storefront API"
```

---

### Task 6: Convert Homepage Route to Loader

**Files:**
- Modify: `app/routes/_index.tsx`

Switch from direct mock function calls to a React Router loader that uses the unified data layer. This is the pattern all subsequent route conversions follow.

- [ ] **Step 1: Rewrite `app/routes/_index.tsx`**

```typescript
import {Link} from 'react-router';
import type {Route} from './+types/_index';
import {getCollections, getFeaturedProducts, getSaleProducts} from '~/lib/storefront';
import {CollectionCard} from '~/components/CollectionCard';
import {ProductGrid} from '~/components/ProductGrid';
import {HeroCarousel} from '~/components/HeroCarousel';
import {SaleCarousel} from '~/components/SaleCarousel';

export async function loader({context}: Route.LoaderArgs) {
  const [collections, featuredProducts, saleProducts] = await Promise.all([
    getCollections(context.storefront),
    getFeaturedProducts(8, context.storefront),
    getSaleProducts(context.storefront),
  ]);
  return {collections, featuredProducts, saleProducts};
}

export default function Homepage({loaderData}: Route.ComponentProps) {
  const {collections, featuredProducts, saleProducts} = loaderData;

  return (
    <div>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* On Sale Now */}
      <SaleCarousel products={saleProducts} />

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-1 w-10 rounded bg-brand-red" />
          <h2 className="text-2xl font-extrabold text-brand-gray">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1 w-10 rounded bg-brand-red" />
            <h2 className="text-2xl font-extrabold text-brand-gray">Featured Products</h2>
          </div>
          <ProductGrid products={featuredProducts} />
          <div className="mt-8 text-center">
            <Link
              to="/collections"
              className="inline-block rounded-full bg-brand-red px-6 py-2 font-bold text-white transition hover:bg-brand-red-dark"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Test in browser**

```bash
cd /Users/ryanhaugland/globalshowproducts && npm run dev
```

Visit `http://localhost:3000/`. Verify the homepage loads with collections, featured products, and sale carousel. Data should come from Shopify if `.env` has credentials, or mock data if not.

- [ ] **Step 3: Commit**

```bash
git add app/routes/_index.tsx
git commit -m "feat: convert homepage to loader pattern with Shopify support"
```

---

### Task 7: Convert Collection Routes to Loaders

**Files:**
- Modify: `app/routes/collections._index.tsx`
- Modify: `app/routes/collections.$handle.tsx`

- [ ] **Step 1: Rewrite `app/routes/collections._index.tsx`**

```typescript
import type {Route} from './+types/collections._index';
import {getCollections} from '~/lib/storefront';
import {CollectionCard} from '~/components/CollectionCard';

export async function loader({context}: Route.LoaderArgs) {
  const collections = await getCollections(context.storefront);
  return {collections};
}

export default function CollectionsIndex({loaderData}: Route.ComponentProps) {
  const {collections} = loaderData;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-gray">All Collections</h1>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `app/routes/collections.$handle.tsx`**

Read the current file first to preserve any filtering/sorting UI, then replace with loader pattern:

```typescript
import type {Route} from './+types/collections.$handle';
import {getCollectionByHandle} from '~/lib/storefront';
import {ProductGrid} from '~/components/ProductGrid';

export async function loader({params, context}: Route.LoaderArgs) {
  const {collection, products} = await getCollectionByHandle(
    params.handle!,
    context.storefront,
  );

  if (!collection) {
    throw new Response('Collection not found', {status: 404});
  }

  return {collection, products};
}

export default function CollectionPage({loaderData}: Route.ComponentProps) {
  const {collection, products} = loaderData;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-gray">{collection.title}</h1>
      {collection.description && (
        <p className="mt-2 text-brand-gray-light">{collection.description}</p>
      )}
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
```

Note: Read the current `collections.$handle.tsx` before implementing — it may have brand filtering or sorting UI that should be preserved in the new version. The above is the minimal structure; carry forward any existing UI features.

- [ ] **Step 3: Test both routes in browser**

Visit `http://localhost:3000/collections` and click into a collection. Verify products load.

- [ ] **Step 4: Commit**

```bash
git add app/routes/collections._index.tsx app/routes/collections.\$handle.tsx
git commit -m "feat: convert collection routes to loader pattern with Shopify support"
```

---

### Task 8: Convert Product Detail Route to Loader

**Files:**
- Modify: `app/routes/products.$handle.tsx`

This is the most complex route — it uses mock-storefront, reviews, cart, and wishlist functions. Only the mock-storefront functions move to the loader. Client-side features (cart, wishlist, reviews) stay as-is.

- [ ] **Step 1: Read current file and update**

Read `app/routes/products.$handle.tsx` fully before editing. The key changes:

1. Add a loader that fetches product + related products from storefront.ts
2. Keep all client-side hooks (cart, wishlist, reviews) unchanged
3. Replace `getProductByHandle` and `getRelatedProducts` imports

Top of file changes:

```typescript
import type {Route} from './+types/products.$handle';
import {getProductByHandle, getRelatedProducts} from '~/lib/storefront';
// ... keep all other existing imports (cart, wishlist, reviews, components)

export async function loader({params, context}: Route.LoaderArgs) {
  const product = await getProductByHandle(params.handle!, context.storefront);
  if (!product) {
    throw new Response('Product not found', {status: 404});
  }
  const related = await getRelatedProducts(product.id, 4, context.storefront);
  return {product, related};
}

export default function ProductPage({loaderData}: Route.ComponentProps) {
  const {product, related} = loaderData;
  // ... rest of existing component, but using loaderData instead of direct calls
  // Remove the lines that call getProductByHandle() and getRelatedProducts() directly
  // All client-side hooks (useState for cart, wishlist, reviews) stay the same
}
```

- [ ] **Step 2: Test in browser**

Visit a product page like `http://localhost:3000/products/some-handle`. Verify:
- Product details load
- Variant selector works
- Add to cart works
- Related products show
- Reviews display

- [ ] **Step 3: Commit**

```bash
git add app/routes/products.\$handle.tsx
git commit -m "feat: convert product detail route to loader with Shopify support"
```

---

### Task 9: Convert Search Route to Loader

**Files:**
- Modify: `app/routes/search.tsx`

Search currently uses `useEffect` with mock `searchProducts()`. Convert to a loader that reads the `q` query param server-side.

- [ ] **Step 1: Rewrite `app/routes/search.tsx`**

Read the current file first to preserve UI. Key structure:

```typescript
import {useSearchParams} from 'react-router';
import type {Route} from './+types/search';
import {searchProducts} from '~/lib/storefront';
import {ProductGrid} from '~/components/ProductGrid';

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const results = query ? await searchProducts(query, context.storefront) : [];
  return {query, results};
}

export default function SearchPage({loaderData}: Route.ComponentProps) {
  const {query, results} = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-gray">Search</h1>
      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          setSearchParams({q: formData.get('q') as string});
        }}
      >
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search products..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        />
      </form>
      {query && (
        <div className="mt-8">
          <p className="text-brand-gray-light">
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </p>
          <div className="mt-4">
            <ProductGrid products={results} />
          </div>
        </div>
      )}
    </div>
  );
}
```

Note: Read the current search.tsx before implementing — preserve any existing UI features like search-as-you-type or result layout.

- [ ] **Step 2: Test in browser**

Visit `http://localhost:3000/search?q=test`. Verify results appear.

- [ ] **Step 3: Commit**

```bash
git add app/routes/search.tsx
git commit -m "feat: convert search route to loader with Shopify support"
```

---

### Task 10: Convert Wishlist Route

**Files:**
- Modify: `app/routes/wishlist.tsx`

Wishlist stores product IDs in localStorage. In mock mode, it looks up products by ID. In Shopify mode, we can't easily look up by GID, so we keep mock lookups for wishlist (it's a client-side feature anyway).

- [ ] **Step 1: Read current file and assess**

Read `app/routes/wishlist.tsx`. The wishlist uses `getProductById()` from mock-storefront. Since wishlists are client-side and product IDs differ between Shopify and mock, keep the wishlist using mock data for now. Only change the import path if needed.

If the file already works without changes, skip this task.

- [ ] **Step 2: Commit if changes were made**

```bash
git add app/routes/wishlist.tsx
git commit -m "feat: update wishlist route for hybrid mode"
```

---

### Task 11: Shopify Cart & Checkout Redirect

**Files:**
- Modify: `app/routes/cart.tsx`
- Modify: `app/routes/checkout.tsx`

In Shopify mode, the checkout button should redirect to Shopify's hosted checkout via the cart's `checkoutUrl`. In mock mode, the existing mock checkout stays.

- [ ] **Step 1: Update `app/routes/checkout.tsx`**

Read the current file first. Add a loader that checks for Shopify mode and provides the checkout URL:

```typescript
import type {Route} from './+types/checkout';
// ... keep existing imports

export async function loader({context}: Route.LoaderArgs) {
  const isShopify = !!context.storefront;
  let checkoutUrl: string | null = null;

  if (isShopify && context.cart) {
    try {
      const cart = await context.cart.get();
      checkoutUrl = cart?.checkoutUrl || null;
    } catch {
      // Cart may not exist yet
    }
  }

  return {isShopify, checkoutUrl};
}

export default function CheckoutPage({loaderData}: Route.ComponentProps) {
  const {isShopify, checkoutUrl} = loaderData;

  // If in Shopify mode with a valid checkout URL, redirect
  useEffect(() => {
    if (isShopify && checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  }, [isShopify, checkoutUrl]);

  // If Shopify mode but no checkout URL yet, show loading/redirect message
  if (isShopify) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-brand-gray">Redirecting to checkout...</h1>
        <p className="mt-4 text-gray-600">
          {checkoutUrl
            ? 'Taking you to secure checkout...'
            : 'Please add items to your cart first.'}
        </p>
      </div>
    );
  }

  // Mock mode: render existing checkout form
  // ... keep all existing mock checkout JSX below this point
}
```

- [ ] **Step 2: Update cart page checkout button**

In `app/routes/cart.tsx`, read the current file. Find the checkout button/link and update it:
- In Shopify mode: the "Checkout" link should go to the Shopify checkout URL
- In mock mode: the "Checkout" link stays as `/checkout`

Add a loader to get the checkout URL:

```typescript
export async function loader({context}: Route.LoaderArgs) {
  const isShopify = !!context.storefront;
  let checkoutUrl: string | null = null;

  if (isShopify && context.cart) {
    try {
      const cart = await context.cart.get();
      checkoutUrl = cart?.checkoutUrl || null;
    } catch {
      // Cart may not exist yet
    }
  }

  return {isShopify, checkoutUrl};
}
```

Then in the component, use `checkoutUrl || '/checkout'` for the checkout button href.

- [ ] **Step 3: Test both modes**

With `.env` credentials: verify checkout redirects to Shopify.
Without `.env` credentials: verify mock checkout form renders.

- [ ] **Step 4: Commit**

```bash
git add app/routes/cart.tsx app/routes/checkout.tsx
git commit -m "feat: add Shopify checkout redirect with mock fallback"
```

---

### Task 12: Import Products to Shopify Dev Store

**Files:**
- Existing: `scripts/export-to-shopify-csv.ts`

Generate the CSV from mock data and import into the Shopify dev store so the real API returns matching products.

- [ ] **Step 1: Generate the CSV**

```bash
cd /Users/ryanhaugland/globalshowproducts && npx tsx scripts/export-to-shopify-csv.ts
```

This should create a CSV file. Check the output for the file location.

- [ ] **Step 2: Import into Shopify**

In the Shopify admin (`globalshowproducts-dev.myshopify.com/admin`):
1. Go to **Products**
2. Click **Import**
3. Upload the generated CSV
4. Review and confirm the import

- [ ] **Step 3: Create collections in Shopify**

In the Shopify admin:
1. Go to **Products → Collections**
2. Create collections matching the handles in `app/data/collections.json`
3. Add products to each collection (can use automated rules by tag or vendor)

- [ ] **Step 4: Verify API returns data**

```bash
curl -s "https://globalshowproducts-dev.myshopify.com/api/2024-01/graphql.json" \
  -H "X-Shopify-Storefront-Access-Token: $PUBLIC_STOREFRONT_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ products(first: 3) { nodes { title handle } } }"}'
```

Should return your imported products.

---

### Task 13: End-to-End Smoke Test

- [ ] **Step 1: Start dev server with Shopify credentials**

```bash
cd /Users/ryanhaugland/globalshowproducts && npm run dev
```

- [ ] **Step 2: Test all converted routes**

| Route | What to verify |
|-------|---------------|
| `/` | Collections, featured products, sale carousel load from Shopify |
| `/collections` | All collections render |
| `/collections/some-handle` | Products in collection load |
| `/products/some-handle` | Product detail, variants, related products |
| `/search?q=test` | Search returns Shopify results |
| `/cart` | Cart page loads, checkout button has Shopify URL |
| `/checkout` | Redirects to Shopify hosted checkout |

- [ ] **Step 3: Test mock fallback**

Temporarily rename `.env` to `.env.bak` and restart. Verify the site works with mock data.

```bash
mv /Users/ryanhaugland/globalshowproducts/.env /Users/ryanhaugland/globalshowproducts/.env.bak
# restart dev server, test site
mv /Users/ryanhaugland/globalshowproducts/.env.bak /Users/ryanhaugland/globalshowproducts/.env
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete hybrid Shopify Storefront API integration"
```
