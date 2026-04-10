import {createRequestHandler} from 'react-router';

const handler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  process.env.NODE_ENV,
);

export default async function (req: Request): Promise<Response> {
  // Hydrogen Vite plugin adds storefront, cart, session, etc. to context at runtime.
  // We only provide env here; the rest is injected by the hydrogen() plugin.
  return handler(req, {
    env: {
      SESSION_SECRET: process.env.SESSION_SECRET || 'dev-secret',
      PUBLIC_STORE_DOMAIN: process.env.PUBLIC_STORE_DOMAIN || '',
      PUBLIC_STOREFRONT_API_TOKEN: process.env.PUBLIC_STOREFRONT_API_TOKEN || '',
      PRIVATE_STOREFRONT_API_TOKEN: process.env.PRIVATE_STOREFRONT_API_TOKEN || '',
      PUBLIC_STOREFRONT_ID: process.env.PUBLIC_STOREFRONT_ID || '',
      PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: process.env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID || '',
      PUBLIC_CUSTOMER_ACCOUNT_API_URL: process.env.PUBLIC_CUSTOMER_ACCOUNT_API_URL || '',
      PUBLIC_CHECKOUT_DOMAIN: process.env.PUBLIC_CHECKOUT_DOMAIN || '',
      SHOP_ID: process.env.SHOP_ID || '',
    },
  } as any);
}
