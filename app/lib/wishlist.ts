const STORAGE_KEY = 'gsp_wishlist';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getWishlist(): string[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function isInWishlist(productId: string): boolean {
  return getWishlist().includes(productId);
}

export function toggleWishlist(productId: string): boolean {
  const list = getWishlist();
  const index = list.indexOf(productId);
  if (index >= 0) {
    list.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return false; // removed
  } else {
    list.push(productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true; // added
  }
}

export function getWishlistCount(): number {
  return getWishlist().length;
}
