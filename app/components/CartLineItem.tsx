import type {CartItem} from '~/lib/cart';
import {formatPrice} from '~/lib/utils';

interface CartLineItemProps {
  item: CartItem;
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemove: (variantId: string) => void;
}

export function CartLineItem({item, onUpdateQuantity, onRemove}: CartLineItemProps) {
  return (
    <div className="flex items-start gap-4 border-b border-gray-200 py-6">
      {/* Image placeholder */}
      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <span className="text-xs text-gray-400">Image</span>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold text-navy">{item.title}</h3>
            {item.variantTitle && item.variantTitle !== 'Default' && (
              <p className="mt-0.5 text-sm text-gray-500">{item.variantTitle}</p>
            )}
          </div>
          <p className="font-semibold text-navy">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-4">
          {/* Quantity stepper */}
          <div className="flex items-center border border-gray-300 rounded">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.variantId, item.quantity - 1)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.variantId)}
            className="text-sm text-red-500 hover:text-red-700 transition"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
