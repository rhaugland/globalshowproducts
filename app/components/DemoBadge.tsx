import {useRouteLoaderData} from 'react-router';

export function DemoBadge() {
  const rootData = useRouteLoaderData('root') as {isShopifyConnected?: boolean} | undefined;
  const isConnected = rootData?.isShopifyConnected ?? false;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-brand-gray px-4 py-2 text-sm font-semibold text-white shadow-lg">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${
          isConnected ? 'bg-green-400 animate-pulse' : 'bg-amber-400'
        }`}
      />
      {isConnected ? 'Shopify Connected' : 'Demo Mode'}
    </div>
  );
}
