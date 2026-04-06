import {useState} from 'react';

interface TrackingEvent {
  date: string;
  time: string;
  location: string;
  status: string;
  detail: string;
}

interface TrackingResult {
  trackingNumber: string;
  carrier: string;
  status: 'in_transit' | 'out_for_delivery' | 'delivered' | 'processing';
  estimatedDelivery: string;
  events: TrackingEvent[];
}

function generateMockTracking(trackingNumber: string): TrackingResult {
  const upper = trackingNumber.toUpperCase().trim();

  // Determine carrier from prefix
  let carrier = 'USPS';
  if (upper.startsWith('1Z') || upper.startsWith('UPS')) carrier = 'UPS';
  else if (upper.startsWith('FX') || upper.startsWith('7')) carrier = 'FedEx';

  // Use the tracking number to seed a deterministic status
  const seed = upper.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const statuses: TrackingResult['status'][] = ['processing', 'in_transit', 'out_for_delivery', 'delivered'];
  const statusIndex = seed % statuses.length;
  const status = statuses[statusIndex];

  const today = new Date();
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'});

  const events: TrackingEvent[] = [];

  // Build events based on status
  const d1 = new Date(today);
  d1.setDate(d1.getDate() - 3);
  events.push({
    date: fmt(d1),
    time: '2:15 PM',
    location: 'Eden Prairie, MN',
    status: 'Order Processed',
    detail: 'Shipment information sent to carrier',
  });

  if (statusIndex >= 1) {
    const d2 = new Date(today);
    d2.setDate(d2.getDate() - 2);
    events.push({
      date: fmt(d2),
      time: '8:42 AM',
      location: 'Eden Prairie, MN',
      status: 'Picked Up',
      detail: `Package picked up by ${carrier}`,
    });

    const d3 = new Date(today);
    d3.setDate(d3.getDate() - 1);
    events.push({
      date: fmt(d3),
      time: '11:30 PM',
      location: 'Minneapolis, MN',
      status: 'In Transit',
      detail: `Departed ${carrier} facility`,
    });
  }

  if (statusIndex >= 2) {
    events.push({
      date: fmt(today),
      time: '6:18 AM',
      location: 'Local Distribution Center',
      status: 'Out for Delivery',
      detail: 'Package is out for delivery today',
    });
  }

  if (statusIndex >= 3) {
    events.push({
      date: fmt(today),
      time: '1:45 PM',
      location: 'Destination City',
      status: 'Delivered',
      detail: 'Package delivered — left at front door',
    });
  }

  const estDate = new Date(today);
  estDate.setDate(estDate.getDate() + (status === 'delivered' ? 0 : status === 'out_for_delivery' ? 0 : 2));

  return {
    trackingNumber: upper,
    carrier,
    status,
    estimatedDelivery: fmt(estDate),
    events: events.reverse(),
  };
}

const statusLabels: Record<TrackingResult['status'], string> = {
  processing: 'Processing',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

const statusColors: Record<TrackingResult['status'], string> = {
  processing: 'bg-yellow-100 text-yellow-700',
  in_transit: 'bg-blue-100 text-blue-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
};

const progressSteps = ['Processing', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];

function getProgressIndex(status: TrackingResult['status']): number {
  switch (status) {
    case 'processing': return 0;
    case 'in_transit': return 2;
    case 'out_for_delivery': return 3;
    case 'delivered': return 4;
  }
}

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [searched, setSearched] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = trackingNumber.trim();
    if (!trimmed) return;
    setResult(generateMockTracking(trimmed));
    setSearched(true);
  }

  const progressIndex = result ? getProgressIndex(result.status) : -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-brand-gray">Track Your Shipment</h1>
        <p className="mx-auto mt-3 max-w-lg text-gray-500">
          Enter your tracking number below to see the latest status of your order.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number (e.g. 1Z999AA10123456784)"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-red px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-red-dark"
          >
            Track
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Supports USPS, UPS, and FedEx tracking numbers. This is a demo — results are simulated.
        </p>
      </form>

      {/* Results */}
      {searched && result && (
        <div className="mt-10">
          {/* Status header */}
          <div className="rounded-xl border border-gray-200 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Tracking Number
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-brand-gray">
                  {result.trackingNumber}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Carrier
                </p>
                <p className="mt-1 text-sm font-bold text-brand-gray">{result.carrier}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Est. Delivery
                </p>
                <p className="mt-1 text-sm font-bold text-brand-gray">{result.estimatedDelivery}</p>
              </div>
              <div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusColors[result.status]}`}
                >
                  {statusLabels[result.status]}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                {progressSteps.map((step, i) => (
                  <div key={step} className="flex flex-1 flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        i <= progressIndex
                          ? 'bg-brand-red text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {i <= progressIndex ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`mt-1.5 text-center text-[10px] font-medium leading-tight ${
                        i <= progressIndex ? 'text-brand-gray' : 'text-gray-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              {/* Connecting lines */}
              <div className="relative -mt-[52px] mx-4 flex">
                {progressSteps.slice(0, -1).map((_, i) => (
                  <div
                    key={i}
                    className={`h-0.5 flex-1 ${
                      i < progressIndex ? 'bg-brand-red' : 'bg-gray-200'
                    }`}
                    style={{marginTop: '16px'}}
                  />
                ))}
              </div>
              <div className="h-8" />
            </div>
          </div>

          {/* Event timeline */}
          <div className="mt-6 rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-brand-gray">Shipment History</h3>
            <div className="mt-4">
              {result.events.map((event, i) => (
                <div key={i} className="flex gap-4">
                  {/* Timeline dot & line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`mt-1 h-3 w-3 rounded-full ${
                        i === 0 ? 'bg-brand-red' : 'bg-gray-300'
                      }`}
                    />
                    {i < result.events.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200" />
                    )}
                  </div>

                  {/* Event content */}
                  <div className="pb-6 last:pb-0">
                    <p className="text-sm font-bold text-brand-gray">{event.status}</p>
                    <p className="mt-0.5 text-sm text-gray-600">{event.detail}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {event.date} at {event.time} — {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
