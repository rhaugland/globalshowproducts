import {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router';
import {getCart, getCartTotal, clearCart} from '~/lib/cart';
import {formatPrice} from '~/lib/utils';

type Step = 'shipping' | 'method' | 'payment' | 'confirmation';

const STEPS: {key: Step; label: string}[] = [
  {key: 'shipping', label: 'Shipping'},
  {key: 'method', label: 'Method'},
  {key: 'payment', label: 'Payment'},
  {key: 'confirmation', label: 'Confirmation'},
];

const SHIPPING_OPTIONS = [
  {id: 'standard', label: 'Standard Shipping', price: 5.99},
  {id: 'express', label: 'Express Shipping', price: 12.99},
  {id: 'free', label: 'Free Shipping', price: 0},
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('shipping');
  const [orderId, setOrderId] = useState('');

  // Shipping form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Method
  const [shippingMethod, setShippingMethod] = useState('standard');

  const cart = getCart();
  const subtotal = getCartTotal();
  const shippingCost =
    SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)?.price ?? 5.99;
  const tax = subtotal * 0.0825;
  const total = subtotal + shippingCost + tax;

  useEffect(() => {
    if (cart.length === 0 && step !== 'confirmation') {
      navigate('/collections');
    }
  }, [cart.length, step, navigate]);

  function handlePlaceOrder() {
    const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(id);
    clearCart();
    setStep('confirmation');
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Demo banner */}
      <div className="mb-8 rounded-lg border-2 border-brand-red bg-brand-red/5 px-4 py-3 text-center">
        <p className="font-semibold text-brand-red">
          Demo Mode &mdash; No real transactions will be processed
        </p>
      </div>

      <h1 className="text-3xl font-bold text-brand-gray">Checkout</h1>

      {/* Progress bar */}
      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                i <= currentStepIndex
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`hidden text-sm font-medium sm:block ${
                i <= currentStepIndex ? 'text-brand-gray' : 'text-gray-400'
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 ${
                  i < currentStepIndex ? 'bg-brand-red' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-10">
        {/* Step 1: Shipping */}
        {step === 'shipping' && (
          <div>
            <h2 className="text-xl font-bold text-brand-gray">Shipping Information</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep('method');
              }}
              className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-brand-red px-6 py-3 font-semibold text-white hover:bg-brand-red-dark transition"
                >
                  Continue to Shipping Method
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Shipping Method */}
        {step === 'method' && (
          <div>
            <h2 className="text-xl font-bold text-brand-gray">Shipping Method</h2>
            <div className="mt-6 space-y-3">
              {SHIPPING_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border-2 px-4 py-3 transition ${
                    shippingMethod === option.id
                      ? 'border-brand-red bg-brand-red/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={option.id}
                      checked={shippingMethod === option.id}
                      onChange={() => setShippingMethod(option.id)}
                      className="accent-brand-red"
                    />
                    <span className="font-medium text-brand-gray">{option.label}</span>
                  </div>
                  <span className="font-semibold text-brand-gray">
                    {option.price === 0 ? 'FREE' : formatPrice(option.price)}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('shipping')}
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('payment')}
                className="flex-1 rounded-lg bg-brand-red px-6 py-3 font-semibold text-white hover:bg-brand-red-dark transition"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 'payment' && (
          <div>
            <h2 className="text-xl font-bold text-brand-gray">Payment</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Card Number</label>
                <input
                  type="text"
                  defaultValue="4242 4242 4242 4242"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry</label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CVV</label>
                  <input
                    type="text"
                    defaultValue="123"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-8 rounded-lg bg-gray-50 p-6">
              <h3 className="font-bold text-brand-gray">Order Summary</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8.25%)</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-brand-gray">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('method')}
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="flex-1 rounded-lg bg-pop-green px-6 py-3 font-semibold text-white hover:bg-pop-green/90 transition"
              >
                Place Order (Demo)
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirmation' && (
          <div className="text-center py-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pop-green/10">
              <span className="text-4xl text-pop-green">&#10003;</span>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-brand-gray">Order Confirmed!</h2>
            <p className="mt-2 text-gray-600">
              Your order ID is <span className="font-bold text-brand-gray">{orderId}</span>
            </p>
            <p className="mt-4 text-sm text-gray-500">
              This is a demo &mdash; no real transaction was processed and no items will be shipped.
            </p>
            <Link
              to="/collections"
              className="mt-8 inline-block rounded-lg bg-brand-red px-8 py-3 font-semibold text-white hover:bg-brand-red-dark transition"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
