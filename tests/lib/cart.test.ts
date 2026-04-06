import {describe, it, expect, beforeEach} from 'vitest';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartTotal,
  getCartCount,
  type CartItem,
} from '~/lib/cart';

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'prod-1',
    variantId: 'var-1',
    title: 'Test Product',
    variantTitle: 'Default',
    price: 10,
    quantity: 1,
    image: 'https://example.com/img.png',
    ...overrides,
  };
}

describe('cart library', () => {
  beforeEach(() => {
    clearCart();
  });

  it('starts empty', () => {
    expect(getCart()).toEqual([]);
    expect(getCartCount()).toBe(0);
    expect(getCartTotal()).toBe(0);
  });

  it('adds an item', () => {
    const item = makeItem();
    const cart = addToCart(item);
    expect(cart).toHaveLength(1);
    expect(cart[0].variantId).toBe('var-1');
    expect(cart[0].quantity).toBe(1);
  });

  it('increments quantity for duplicate variant', () => {
    const item = makeItem({quantity: 2});
    addToCart(item);
    const cart = addToCart(makeItem({quantity: 3}));
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(5);
  });

  it('removes an item', () => {
    addToCart(makeItem());
    const cart = removeFromCart('var-1');
    expect(cart).toEqual([]);
  });

  it('updates quantity', () => {
    addToCart(makeItem({quantity: 1}));
    const cart = updateQuantity('var-1', 7);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(7);
  });

  it('removes item when quantity set to 0', () => {
    addToCart(makeItem());
    const cart = updateQuantity('var-1', 0);
    expect(cart).toEqual([]);
  });

  it('calculates total correctly with multiple items', () => {
    addToCart(makeItem({variantId: 'v1', price: 10, quantity: 2}));
    addToCart(makeItem({variantId: 'v2', price: 25, quantity: 3}));
    expect(getCartTotal()).toBe(95);
    expect(getCartCount()).toBe(5);
  });

  it('clears the cart', () => {
    addToCart(makeItem());
    addToCart(makeItem({variantId: 'v2'}));
    const cart = clearCart();
    expect(cart).toEqual([]);
    expect(getCart()).toEqual([]);
  });
});
