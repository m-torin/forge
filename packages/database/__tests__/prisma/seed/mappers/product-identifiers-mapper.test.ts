import {
  generateProductIdentifiers,
  generateVariantIdentifiers,
} from '#/prisma/src/seed/mappers/product-identifiers-mapper';
import { describe, expect, it } from 'vitest';

describe('product-identifiers-mapper', () => {
  const mockConfig = {
    productId: 'product-123',
    productName: 'Test Product',
    brandName: 'TestBrand',
    category: 'Clothing',
  };

  describe('generateProductIdentifiers', () => {
    it('generates product identifiers with correct structure', () => {
      const result = generateProductIdentifiers(mockConfig);

      expect(result.product).toStrictEqual({ connect: { id: 'product-123' } });
      expect(result.upcA).toBeDefined();
      expect(result.ean13).toBeDefined();
      expect(result.asin).toBeDefined();
      expect(result.mpn!).toBeDefined();
      expect(((result as any).metadata as any).generatedAt).toBeDefined();
      expect(((result as any).metadata as any).source).toBe('seed-data');
    });

    it('generates valid UPC format', () => {
      const result = generateProductIdentifiers(mockConfig);
      expect(result.upcA).toMatch(/^\d{12}$/);
    });

    it('generates valid EAN format', () => {
      const result = generateProductIdentifiers(mockConfig);
      expect(result.ean13).toMatch(/^\d{13}$/);
    });

    it('generates valid ASIN format', () => {
      const result = generateProductIdentifiers(mockConfig);
      expect(result.asin).toMatch(/^B0[A-Z0-9]{8}$/);
    });

    it('generates MPN with brand prefix', () => {
      const result = generateProductIdentifiers(mockConfig);
      expect(result.mpn!).toMatch(/^TES-\d{6}[A-Z]$/);
    });

    it('includes ISBN for book category', () => {
      const bookConfig = { ...mockConfig, category: 'Books' };
      const result = generateProductIdentifiers(bookConfig);
      expect(result.isbn13).toBeDefined();
      expect(result.isbn13).toMatch(/^978-\d-\d{4}-\d{4}-\d$/);
    });

    it('excludes ISBN for non-book category', () => {
      const result = generateProductIdentifiers(mockConfig);
      expect(result.isbn13).toBeUndefined();
    });

    // Enhanced test coverage
    it('generates unique identifiers for different products', () => {
      const result1 = generateProductIdentifiers(mockConfig);
      const result2 = generateProductIdentifiers({ ...mockConfig, productId: 'product-456' });

      expect(result1.upcA).not.toBe(result2.upcA);
      expect(result1.ean13).not.toBe(result2.ean13);
      expect(result1.asin).not.toBe(result2.asin);
      expect(result1.mpn!).not.toBe(result2.mpn!);
    });

    it('handles different brand names correctly', () => {
      const brands = ['Nike', 'Adidas', 'Apple', 'Samsung', 'Sony'];

      brands.forEach(brand => {
        const config = { ...mockConfig, brandName: brand };
        const result = generateProductIdentifiers(config);

        expect(result.mpn!).toMatch(
          new RegExp(`^${brand.toUpperCase().substring(0, 3)}-\\d{6}[A-Z]$`),
        );
      });
    });

    it('generates valid check digits for UPC', () => {
      const result = generateProductIdentifiers(mockConfig);
      const upc = result.upcA;

      // Validate UPC check digit
      const digits = upc!.split('').map(Number);
      const sum = digits.slice(0, 11).reduce((acc: number, digit: number, index: number) => {
        return acc + digit * (index % 2 === 0 ? 3 : 1);
      }, 0);
      const checkDigit = (10 - (sum % 10)) % 10;

      expect(digits[11]).toBe(checkDigit);
    });

    it('generates valid check digits for EAN', () => {
      const result = generateProductIdentifiers(mockConfig);
      const ean = result.ean13;

      // Validate EAN check digit
      const digits = ean!.split('').map(Number);
      const sum = digits.slice(0, 12).reduce((acc: number, digit: number, index: number) => {
        return acc + digit * (index % 2 === 0 ? 1 : 3);
      }, 0);
      const checkDigit = (10 - (sum % 10)) % 10;

      expect(digits[12]).toBe(checkDigit);
    });

    it('handles special characters in brand names', () => {
      const specialBrands = ['Nike&Co', 'Adidas-USA', 'Apple Inc.', 'Samsung Electronics'];

      specialBrands.forEach(brand => {
        const config = { ...mockConfig, brandName: brand };
        const result = generateProductIdentifiers(config);

        expect(result.mpn!).toBeDefined();
        expect(result.mpn!.length).toBeGreaterThan(0);
      });
    });

    it('generates consistent results for same input', () => {
      const result1 = generateProductIdentifiers(mockConfig);
      const result2 = generateProductIdentifiers(mockConfig);

      expect(result1.upcA).toBe(result2.upcA);
      expect(result1.ean13).toBe(result2.ean13);
      expect(result1.asin).toBe(result2.asin);
      expect(result1.mpn!).toBe(result2.mpn!);
    });

    it('handles empty brand name gracefully', () => {
      const emptyBrandConfig = { ...mockConfig, brandName: '' };
      const result = generateProductIdentifiers(emptyBrandConfig);

      expect(result.mpn!).toBeDefined();
      expect(result.mpn!.length).toBeGreaterThan(0);
    });

    it('generates different ASINs for different products', () => {
      const asins = new Set();

      for (let i = 0; i < 10; i++) {
        const config = { ...mockConfig, productId: `product-${i}` };
        const result = generateProductIdentifiers(config);
        asins.add(result.asin);
      }

      expect(asins.size).toBe(10);
    });

    it('includes all required metadata fields', () => {
      const result = generateProductIdentifiers(mockConfig);

      expect((result as any).metadata as any).toHaveProperty('generatedAt');
      expect((result as any).metadata as any).toHaveProperty('source');
      expect((result as any).metadata as any).toHaveProperty('productId');
      expect((result as any).metadata as any).toHaveProperty('brandName');
      expect((result as any).metadata as any).toHaveProperty('category');
      expect(((result as any).metadata as any).source).toBe('seed-data');
      expect(((result as any).metadata as any).productId).toBe('product-123');
      expect(((result as any).metadata as any).brandName).toBe('TestBrand');
      expect(((result as any).metadata as any).category).toBe('Clothing');
    });

    it('handles different categories appropriately', () => {
      const categories = ['Clothing', 'Electronics', 'Books', 'Home & Garden', 'Sports'];

      categories.forEach(category => {
        const config = { ...mockConfig, category };
        const result = generateProductIdentifiers(config);

        expect(((result as any).metadata as any).category).toBe(category);

        if (category === 'Books') {
          expect(result.isbn13).toBeDefined();
        } else {
          expect(result.isbn13).toBeUndefined();
        }
      });
    });

    it('generates valid ISBN check digit for books', () => {
      const bookConfig = { ...mockConfig, category: 'Books' };
      const result = generateProductIdentifiers(bookConfig);
      const isbn = result.isbn13!.replace(/-/g, '');

      // Validate ISBN-13 check digit
      const digits = isbn.split('').map(Number);
      const sum = digits.slice(0, 12).reduce((acc: number, digit: number, index: number) => {
        return acc + digit * (index % 2 === 0 ? 1 : 3);
      }, 0);
      const checkDigit = (10 - (sum % 10)) % 10;

      expect(digits[12]).toBe(checkDigit);
    });

    it('handles very long product names', () => {
      const longNameConfig = {
        ...mockConfig,
        productName:
          'This is a very long product name that should be handled gracefully by the identifier generator',
      };

      const result = generateProductIdentifiers(longNameConfig);

      expect(result.upcA).toMatch(/^\d{12}$/);
      expect(result.ean13).toMatch(/^\d{13}$/);
      expect(result.asin).toMatch(/^B0[A-Z0-9]{8}$/);
      expect(result.mpn!).toMatch(/^TES-\d{6}[A-Z]$/);
    });
  });

  describe('generateVariantIdentifiers', () => {
    it('generates variant identifiers with unique UPC', () => {
      const parentIdentifiers = generateProductIdentifiers(mockConfig);
      const variantSKU = 'TEST-PRODUCT-RED-M';
      const result = generateVariantIdentifiers(parentIdentifiers, variantSKU);

      expect(result.upcA).not.toBe(parentIdentifiers.upcA);
      expect(result.asin).toBe(parentIdentifiers.asin);
      expect(((result as any).metadata as any).variantSKU).toBe(variantSKU);
      expect(((result as any).metadata as any).parentASIN).toBe(parentIdentifiers.asin);
    });

    // Enhanced variant test coverage
    it('generates different UPCs for different variants', () => {
      const parentIdentifiers = generateProductIdentifiers(mockConfig);
      const variant1 = generateVariantIdentifiers(parentIdentifiers, 'TEST-PRODUCT-RED-M');
      const variant2 = generateVariantIdentifiers(parentIdentifiers, 'TEST-PRODUCT-BLUE-L');

      expect(variant1.upcA).not.toBe(variant2.upcA);
      expect(variant1.upcA).not.toBe(parentIdentifiers.upcA);
      expect(variant2.upcA).not.toBe(parentIdentifiers.upcA);
    });

    it('maintains same ASIN across variants', () => {
      const parentIdentifiers = generateProductIdentifiers(mockConfig);
      const variants = ['TEST-PRODUCT-RED-M', 'TEST-PRODUCT-BLUE-L', 'TEST-PRODUCT-GREEN-XL'];

      variants.forEach(sku => {
        const variant = generateVariantIdentifiers(parentIdentifiers, sku);
        expect(variant.asin).toBe(parentIdentifiers.asin);
      });
    });

    it('includes variant-specific metadata', () => {
      const parentIdentifiers = generateProductIdentifiers(mockConfig);
      const variantSKU = 'TEST-PRODUCT-RED-M';
      const result = generateVariantIdentifiers(parentIdentifiers, variantSKU);

      expect((result as any).metadata as any).toHaveProperty('variantSKU');
      expect((result as any).metadata as any).toHaveProperty('parentASIN');
      expect((result as any).metadata as any).toHaveProperty('isVariant');
      expect(((result as any).metadata as any).variantSKU).toBe(variantSKU);
      expect(((result as any).metadata as any).parentASIN).toBe(parentIdentifiers.asin);
      expect(((result as any).metadata as any).isVariant).toBe(true);
    });

    it('generates valid UPC for variants', () => {
      const parentIdentifiers = generateProductIdentifiers(mockConfig);
      const variantSKU = 'TEST-PRODUCT-RED-M';
      const result = generateVariantIdentifiers(parentIdentifiers, variantSKU);

      expect(result.upcA).toMatch(/^\d{12}$/);

      // Validate UPC check digit
      const digits = result.upcA!.split('').map(Number);
      const sum = digits.slice(0, 11).reduce((acc: number, digit: number, index: number) => {
        return acc + digit * (index % 2 === 0 ? 3 : 1);
      }, 0);
      const checkDigit = (10 - (sum % 10)) % 10;

      expect(digits[11]).toBe(checkDigit);
    });

    it('handles special characters in variant SKU', () => {
      const parentIdentifiers = generateProductIdentifiers(mockConfig);
      const specialSKUs = [
        'TEST-PRODUCT-RED-M',
        'TEST-PRODUCT-BLUE-L&XL',
        'TEST-PRODUCT-GREEN-XL+',
        'TEST-PRODUCT-YELLOW-S/M',
      ];

      specialSKUs.forEach(sku => {
        const result = generateVariantIdentifiers(parentIdentifiers, sku);
        expect(((result as any).metadata as any).variantSKU).toBe(sku);
        expect(result.upcA).toMatch(/^\d{12}$/);
      });
    });

    it('generates consistent variant identifiers for same input', () => {
      const parentIdentifiers = generateProductIdentifiers(mockConfig);
      const variantSKU = 'TEST-PRODUCT-RED-M';

      const result1 = generateVariantIdentifiers(parentIdentifiers, variantSKU);
      const result2 = generateVariantIdentifiers(parentIdentifiers, variantSKU);

      expect(result1.upcA).toBe(result2.upcA);
      expect(result1.asin).toBe(result2.asin);
      expect((result1 as any).metadata.variantSKU).toBe((result2 as any).metadata.variantSKU);
    });

    it('inherits parent metadata correctly', () => {
      const parentIdentifiers = generateProductIdentifiers(mockConfig);
      const variantSKU = 'TEST-PRODUCT-RED-M';
      const result = generateVariantIdentifiers(parentIdentifiers, variantSKU);

      expect(((result as any).metadata as any).source).toBe(
        (parentIdentifiers as any).metadata.source,
      );
      expect(((result as any).metadata as any).productId).toBe(
        (parentIdentifiers as any).metadata.productId,
      );
      expect(((result as any).metadata as any).brandName).toBe(
        (parentIdentifiers as any).metadata.brandName,
      );
      expect(((result as any).metadata as any).category).toBe(
        (parentIdentifiers as any).metadata.category,
      );
    });
  });
});
