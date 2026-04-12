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
// Credentials helper
// ---------------------------------------------------------------------------

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
  const {storeDomain, token} = getCredentials(context);
  const url = new URL(request.url);

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
}

// ---------------------------------------------------------------------------
// Action — POST requests
// ---------------------------------------------------------------------------

export async function action({request, context}: Route.ActionArgs) {
  const {storeDomain, token} = getCredentials(context);
  const body = await request.json() as {
    intent: string;
    id?: number | string;
    formData?: ProductFormData;
    collectionIds?: number[];
  };

  const {intent, id, formData, collectionIds} = body;

  if (intent === 'create') {
    const product = await createProduct(storeDomain, token, formData!);
    if (collectionIds?.length) {
      await setProductCollections(storeDomain, token, product.id, collectionIds);
    }
    return Response.json({product});
  }

  if (intent === 'update') {
    const product = await updateProduct(storeDomain, token, id!, formData!);
    if (collectionIds !== undefined) {
      await setProductCollections(storeDomain, token, product.id, collectionIds);
    }
    return Response.json({product});
  }

  if (intent === 'archive') {
    const product = await archiveProduct(storeDomain, token, id!);
    return Response.json({product});
  }

  return Response.json({error: `Unknown intent: ${intent}`}, {status: 400});
}
