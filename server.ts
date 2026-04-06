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
    },
  });
}
