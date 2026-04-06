const CART_KEY = 'gsp-cart';

export interface CartItem {
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  price: number;
  quantity: number;
  image: string;
}

function persist(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToCart(item: CartItem): CartItem[] {
  const cart = getCart();
  const existing = cart.find((i) => i.variantId === item.variantId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push({...item});
  }
  persist(cart);
  return cart;
}

export function removeFromCart(variantId: string): CartItem[] {
  const cart = getCart().filter((i) => i.variantId !== variantId);
  persist(cart);
  return cart;
}

export function updateQuantity(variantId: string, quantity: number): CartItem[] {
  if (quantity <= 0) {
    return removeFromCart(variantId);
  }
  const cart = getCart();
  const item = cart.find((i) => i.variantId === variantId);
  if (item) {
    item.quantity = quantity;
  }
  persist(cart);
  return cart;
}

export function clearCart(): CartItem[] {
  persist([]);
  return [];
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}
