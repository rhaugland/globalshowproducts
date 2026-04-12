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
// ---------------------------------------------------------------------------
// Auth + credentials helpers
// ---------------------------------------------------------------------------

function requireAuth(request: Request) {
  // Simple shared-secret header that the dashboard sends with every request.
  const authHeader = request.headers.get('X-Admin-Auth');
  if (authHeader !== 'globalshowproducts') {
    throw new Response('Unauthorized', {status: 401});
  }
}

function getCredentials(context: Route.LoaderArgs['context']) {
  const storeDomain = context.env.PUBLIC_STORE_DOMAIN;
  const token = context.env.SHOPIFY_ADMIN_API_TOKEN;
  if (!storeDomain || !token) {
    throw new Response('Shopify Admin API not configured', {status: 503});
  }
  return {storeDomain, token};
}

// ---------------------------------------------------------------------------
// Loader — GET requests
// ---------------------------------------------------------------------------

export async function loader({request, context}: Route.LoaderArgs) {
  requireAuth(request);
  const {storeDomain, token} = getCredentials(context);
  const url = new URL(request.url);

  try {
    if (url.searchParams.get('collections') === '1') {
      const collections = await getCollections(storeDomain, token);
      return Response.json({collections});
    }

    const id = url.searchParams.get('id');
    if (id) {
      const [product, collectionIds] = await Promise.all([
        getProduct(storeDomain, token, id),
        getProductCollections(storeDomain, token, id),
      ]);
      return Response.json({product, collectionIds});
    }

    const products = await getProducts(storeDomain, token);
    return Response.json({products});
  } catch (err) {
    if (err instanceof Response) throw err;
    return Response.json(
      {error: err instanceof Error ? err.message : 'Failed to fetch from Shopify'},
      {status: 500},
    );
  }
}

// ---------------------------------------------------------------------------
// Action — POST requests
// ---------------------------------------------------------------------------

export async function action({request, context}: Route.ActionArgs) {
  requireAuth(request);
  const {storeDomain, token} = getCredentials(context);

  let body: {
    intent: string;
    id?: number | string;
    formData?: ProductFormData;
    collectionIds?: number[];
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({error: 'Invalid JSON body'}, {status: 400});
  }

  const {intent, id, formData, collectionIds} = body;

  try {
    if (intent === 'create') {
      if (!formData?.title) {
        return Response.json({error: 'formData with title is required'}, {status: 400});
      }
      const product = await createProduct(storeDomain, token, formData);
      if (collectionIds?.length) {
        await setProductCollections(storeDomain, token, product.id, collectionIds);
      }
      return Response.json({product});
    }

    if (intent === 'update') {
      if (!id) {
        return Response.json({error: 'Product id is required for update'}, {status: 400});
      }
      const product = await updateProduct(storeDomain, token, id, formData || {});
      if (collectionIds !== undefined) {
        await setProductCollections(storeDomain, token, product.id, collectionIds);
      }
      return Response.json({product});
    }

    if (intent === 'archive') {
      if (!id) {
        return Response.json({error: 'Product id is required for archive'}, {status: 400});
      }
      const product = await archiveProduct(storeDomain, token, id);
      return Response.json({product});
    }

    return Response.json({error: `Unknown intent: ${intent}`}, {status: 400});
  } catch (err) {
    if (err instanceof Response) throw err;
    return Response.json(
      {error: err instanceof Error ? err.message : 'Shopify operation failed'},
      {status: 500},
    );
  }
}
