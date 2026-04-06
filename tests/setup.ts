import '@testing-library/jest-dom/vitest';

// happy-dom v15 does not provide a working localStorage in vitest.
// Polyfill it with a simple in-memory implementation.
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.setItem !== 'function') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem(key: string) { return store.get(key) ?? null; },
    setItem(key: string, value: string) { store.set(key, String(value)); },
    removeItem(key: string) { store.delete(key); },
    clear() { store.clear(); },
    get length() { return store.size; },
    key(index: number) { return [...store.keys()][index] ?? null; },
  } as Storage;
}
