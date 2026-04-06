import {describe, it, expect} from 'vitest';
import {
  getCollections,
  getCollectionByHandle,
  getProductByHandle,
  getProductsByCollection,
  searchProducts,
  getFeaturedProducts,
  getSpecials,
} from '~/lib/mock-storefront';

describe('mock-storefront', () => {
  describe('getCollections', () => {
    it('returns all 5 collections', () => {
      const collections = getCollections();
      expect(collections).toHaveLength(5);
    });
  });

  describe('getCollectionByHandle', () => {
    it('finds the scooters collection by handle', () => {
      const collection = getCollectionByHandle('scooters');
      expect(collection).not.toBeNull();
      expect(collection!.handle).toBe('scooters');
      expect(collection!.title).toBe('Scooters');
    });

    it('returns null for a nonexistent handle', () => {
      const collection = getCollectionByHandle('nonexistent');
      expect(collection).toBeNull();
    });
  });

  describe('getProductByHandle', () => {
    it('finds a real product by handle', () => {
      const product = getProductByHandle('hover-ball-swoosh-ball');
      expect(product).not.toBeNull();
      expect(product!.handle).toBe('hover-ball-swoosh-ball');
      expect(product!.title).toBe('Hover Ball Swoosh Ball');
    });

    it('returns null for a nonexistent handle', () => {
      const product = getProductByHandle('nonexistent');
      expect(product).toBeNull();
    });
  });

  describe('getProductsByCollection', () => {
    it('returns scooter products for col-scooters', () => {
      const products = getProductsByCollection('col-scooters');
      expect(products.length).toBe(18);
      products.forEach((product) => {
        expect(product.collectionIds).toContain('col-scooters');
      });
    });

    it('returns empty array for unknown collection', () => {
      const products = getProductsByCollection('col-unknown');
      expect(products).toEqual([]);
    });
  });

  describe('searchProducts', () => {
    it('finds products by title containing "Roma"', () => {
      const results = searchProducts('Roma');
      expect(results.length).toBeGreaterThan(0);
      results.forEach((product) => {
        const searchable = [
          product.title,
          product.brand,
          product.description,
          ...product.tags,
        ]
          .join(' ')
          .toLowerCase();
        expect(searchable).toContain('roma');
      });
    });

    it('finds products by brand "Funny Gears"', () => {
      const results = searchProducts('Funny Gears');
      expect(results.length).toBeGreaterThanOrEqual(4);
    });

    it('returns empty array for nonsense query', () => {
      const results = searchProducts('xyzzy-nothing-matches-this-12345');
      expect(results).toEqual([]);
    });
  });

  describe('getFeaturedProducts', () => {
    it('returns 8 products by default', () => {
      const featured = getFeaturedProducts();
      expect(featured).toHaveLength(8);
    });

    it('returns the requested count', () => {
      const featured = getFeaturedProducts(3);
      expect(featured).toHaveLength(3);
    });
  });

  describe('getSpecials', () => {
    it('returns only products with a compareAtPrice', () => {
      const specials = getSpecials();
      expect(specials.length).toBe(12);
      specials.forEach((product) => {
        expect(product.compareAtPrice).not.toBeNull();
      });
    });
  });
});
