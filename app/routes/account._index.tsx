import {useState, useEffect} from 'react';
import {Link} from 'react-router';
import {getCurrentUser, isLoggedIn, logout, updateProfile, getOrders} from '~/lib/auth';
import type {Order} from '~/lib/auth';
import {formatPrice} from '~/lib/utils';

function StatusBadge({status}: {status: string}) {
  const colorMap: Record<string, string> = {
    Delivered: 'bg-green/10 text-green',
    Shipped: 'bg-blue-100 text-blue-700',
    Processing: 'bg-yellow-100 text-yellow-700',
    Cancelled: 'bg-red-100 text-red-700',
  };
  const classes = colorMap[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {status}
    </span>
  );
}

export default function AccountPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<{email: string; name: string} | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');

  useEffect(() => {
    const li = isLoggedIn();
    setLoggedIn(li);
    if (li) {
      const u = getCurrentUser();
      setUser(u);
      setNameValue(u?.name ?? '');
      setOrders(getOrders());
    }
  }, []);

  function handleLogout() {
    logout();
    setLoggedIn(false);
    setUser(null);
  }

  function handleSaveName() {
    updateProfile({name: nameValue});
    setUser((prev) => (prev ? {...prev, name: nameValue} : prev));
    setEditingName(false);
  }

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-navy">My Account</h1>
        <p className="mt-4 text-gray-500">Please sign in to view your account.</p>
        <Link
          to="/account/login"
          className="mt-6 inline-block rounded-lg bg-orange px-6 py-3 font-semibold text-white hover:bg-orange/90 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-navy">My Account</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          Sign Out
        </button>
      </div>

      {/* Profile Section */}
      <div className="mt-8 rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-navy">Profile</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500 w-16">Name</span>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="text-sm font-medium text-green hover:underline"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingName(false);
                    setNameValue(user?.name ?? '');
                  }}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-navy">{user?.name}</span>
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  className="text-sm text-orange hover:underline"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500 w-16">Email</span>
            <span className="text-sm text-navy">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-navy">Order History</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-gray-500">No orders yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-navy">{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <span className="text-sm text-gray-500">{order.date}</span>
                </div>
                <div className="mt-3 space-y-1">
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-600">
                      {item.quantity}x {item.title}
                      {item.variant !== 'Default' ? ` (${item.variant})` : ''} &mdash;{' '}
                      {formatPrice(item.price)}
                    </p>
                  ))}
                </div>
                <div className="mt-3 text-right font-semibold text-navy">
                  Total: {formatPrice(order.total)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
