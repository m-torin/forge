import { ProductStatus, ProductType } from '#/prisma-generated/client';
import {
  generateProduct,
  generateProductMedia,
  generateProductName,
  generateProductSKU,
  generateProductVariants,
} from '#/prisma/src/seed/generators/generate-products';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('generate-products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateProductName', () => {
    it('generates product names with category', () => {
      const name = generateProductName('Dresses');
      expect(name).toContain('Dress');
    });

    it('generates product names for different categories', () => {
      const dressName = generateProductName('Dresses');
      const topName = generateProductName('Tops');

      expect(dressName).not.toBe(topName);
      expect(dressName).toContain('Dress');
      expect(topName).toContain('Top');
    });
  });

  describe('generateProductSKU', () => {
    it('generates SKU from handle', () => {
      const sku = generateProductSKU('test-product');
      expect(sku).toMatch(/^TES-\d{4}$/);
    });

    it('generates different SKUs for different handles', () => {
      const sku1 = generateProductSKU('product-one');
      const sku2 = generateProductSKU('product-two');
      expect(sku1).not.toBe(sku2);
    });
  });

  describe('generateProduct', () => {
    it('generates product with correct structure', () => {
      const existingSlugs = new Set<string>();
      const brandId = 'brand-123';
      const result = generateProduct('Dresses', brandId, existingSlugs);

      expect(result.name).toBeDefined();
      expect(result.slug).toBeDefined();
      expect(result.category).toBe('Dresses');
      expect(result.status).toBe(ProductStatus.ACTIVE);
      expect(result.type).toBe(ProductType.PHYSICAL);
      expect(result.brand).toBe(brandId);
      expect(result.price).toBeGreaterThan(0);
      expect(result.currency).toBe('USD');
    });

    it('ensures unique slugs', () => {
      const existingSlugs = new Set<string>(['test-product']);
      const brandId = 'brand-123';
      const result = generateProduct('Dresses', brandId, existingSlugs);

      expect(result.slug).not.toBe('test-product');
      expect(existingSlugs.has(result.slug)).toBe(true);
    });
  });

  describe('generateProductVariants', () => {
    it('generates variants for parent product', () => {
      const parentProduct = {
        id: 'parent-123',
        name: 'Test Product',
        slug: 'test-product',
        category: 'Dresses',
      };
      const variants = generateProductVariants(parentProduct, 'Dresses');

      expect(variants.length).toBeGreaterThan(0);
      variants.forEach((variant: any) => {
        expect(variant.type).toBe(ProductType.VARIANT);
        expect(variant.parent).toStrictEqual({ connect: { id: 'parent-123' } });
        expect(variant.attributes.color).toBeDefined();
        expect(variant.attributes.size).toBeDefined();
      });
    });

    it('sets first variant as default', () => {
      const parentProduct = {
        id: 'parent-123',
        name: 'Test Product',
        slug: 'test-product',
        category: 'Dresses',
      };
      const variants = generateProductVariants(parentProduct, 'Dresses');

      expect(variants[0].isDefault).toBe(true);
    });
  });

  describe('generateProductMedia', () => {
    it('generates media items for product', () => {
      const productId = 'product-123';
      const productName = 'Test Product';
      const mediaItems = generateProductMedia(productId, productName);

      expect(mediaItems.length).toBeGreaterThanOrEqual(3);
      expect(mediaItems.length).toBeLessThanOrEqual(5);

      mediaItems.forEach((media: any, index: number) => {
        expect(media.url).toBeDefined();
        expect(media.altText).toContain('Test Product');
        expect(media.type).toBe('IMAGE');
        expect(media.sortOrder).toBe(index);
        expect(media.productId).toBe(productId);
      });
    });
  });
});
