import {useState} from 'react';
import {Link} from 'react-router';
import {getCart, updateQuantity, removeFromCart} from '~/lib/cart';
import {formatPrice} from '~/lib/utils';
import {CartLineItem} from '~/components/CartLineItem';

export default function CartPage() {
  const [cart, setCart] = useState(getCart);

  function handleUpdateQuantity(variantId: string, quantity: number) {
    const updated = updateQuantity(variantId, quantity);
    setCart(updated);
  }

  function handleRemove(variantId: string) {
    const updated = removeFromCart(variantId);
    setCart(updated);
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-brand-gray">Your Cart is Empty</h1>
        <p className="mt-3 text-gray-500">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          to="/collections"
          className="mt-6 inline-block rounded-lg bg-brand-red px-6 py-3 font-semibold text-white hover:bg-brand-red-dark transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-gray">Your Cart</h1>

      <div className="mt-8">
        {cart.map((item) => (
          <CartLineItem
            key={item.variantId}
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex justify-between text-lg font-semibold text-brand-gray">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Tax and shipping calculated at checkout.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            to="/collections"
            className="text-center text-brand-red hover:underline font-medium"
          >
            Continue Shopping
          </Link>
          <Link
            to="/checkout"
            className="rounded-lg bg-brand-red px-8 py-3 text-center font-semibold text-white hover:bg-brand-red-dark transition"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
