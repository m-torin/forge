/**
 * Refactored brand-mapper tests using centralized QA utilities
 *
 * This demonstrates the DRY approach for mapper function tests using:
 * - Real enum imports for type safety
 * - Centralized test patterns
 * - Reduced boilerplate code
 */

import { BrandType, ContentStatus } from '#/prisma-generated/client';
import {
  createBrandFromVendor,
  createRetailerBrand,
  RETAILER_BRANDS,
} from '#/prisma/src/seed/mappers/brand-mapper';
import { environmentUtils } from '@repo/qa/src/vitest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('brand-mapper (refactored)', () => {
  let restoreEnv: () => void;

  beforeEach(() => {
    // Setup deterministic environment for consistent testing
    restoreEnv = environmentUtils.mockRandom(0.5);
  });

  afterEach(() => {
    restoreEnv();
  });

  describe('createBrandFromVendor', () => {
    /**
     * Test data scenarios for comprehensive coverage
     */
    const testScenarios = [
      {
        name: 'creates brand from vendor name correctly',
        input: 'TestBrand',
        expectedName: 'TestBrand',
        expectedSlug: 'testbrand',
      },
      {
        name: 'handles vendor names with spaces',
        input: 'Test Brand Name',
        expectedName: 'Test Brand Name',
        expectedSlug: 'test-brand-name',
      },
      {
        name: 'handles empty vendor name',
        input: '',
        expectedName: '',
        expectedSlug: '',
      },
      {
        name: 'handles single character vendor name',
        input: 'A',
        expectedName: 'A',
        expectedSlug: 'a',
      },
      {
        name: 'handles vendor names with numbers',
        input: 'Brand123',
        expectedName: 'Brand123',
        expectedSlug: 'brand123',
      },
      {
        name: 'handles vendor names with mixed case',
        input: 'BrAnD nAmE',
        expectedName: 'BrAnD nAmE',
        expectedSlug: 'brand-name',
      },
    ];

    // Generate standard test cases
    testScenarios.forEach(({ name, input, expectedName, expectedSlug }) => {
      it(name, () => {
        const result = createBrandFromVendor(input);

        expect(result.name).toBe(expectedName);
        expect(result.slug).toBe(expectedSlug);
        expect(result.type).toBe(BrandType.LABEL);
        expect(result.status).toBe(ContentStatus.PUBLISHED);
        expect((result.copy as { description: string }).description).toContain(input);
      });
    });

    /**
     * Special character handling tests
     */
    it('handles vendor names with special characters', () => {
      const specialNames = [
        'Brand & Co.',
        'Brand-Corp',
        'Brand_Corp',
        'Brand@Corp',
        'Brand#Corp',
        'Brand$Corp',
      ];

      specialNames.forEach(name => {
        const result = createBrandFromVendor(name);
        expect(result.name).toBe(name);
        expect(result.slug).toBe(name.toLowerCase().replace(/\s+/g, '-'));
        expect(result.type).toBe(BrandType.LABEL);
        expect(result.status).toBe(ContentStatus.PUBLISHED);
      });
    });

    /**
     * Edge case tests
     */
    it('handles very long vendor names', () => {
      const longName = 'A'.repeat(1000);
      const result = createBrandFromVendor(longName);
      expect(result.name).toBe(longName);
      expect(result.slug).toBe(longName.toLowerCase().replace(/\s+/g, '-'));
    });

    it('handles vendor names with multiple consecutive spaces', () => {
      const result = createBrandFromVendor('Brand   Name');
      expect(result.name).toBe('Brand   Name');
      expect(result.slug).toBe('brand---name');
    });

    it('handles vendor names with leading/trailing spaces', () => {
      const result = createBrandFromVendor('  Brand Name  ');
      expect(result.name).toBe('  Brand Name  ');
      expect(result.slug).toBe('--brand-name--');
    });

    /**
     * Consistency and structure tests
     */
    it('generates consistent results for same input', () => {
      const vendorName = 'TestBrand';
      const result1 = createBrandFromVendor(vendorName);
      const result2 = createBrandFromVendor(vendorName);

      expect(result1.name).toBe(result2.name);
      expect(result1.slug).toBe(result2.slug);
      expect(result1.type).toBe(result2.type);
      expect(result1.status).toBe(result2.status);
    });

    it('includes all required fields', () => {
      const result = createBrandFromVendor('TestBrand');

      const requiredFields = ['name', 'slug', 'type', 'status', 'copy'];
      requiredFields.forEach(field => {
        expect(result).toHaveProperty(field);
      });

      const copyFields = ['description', 'mission', 'values'];
      copyFields.forEach(field => {
        expect(result.copy).toHaveProperty(field);
      });
    });

    it('generates appropriate copy content', () => {
      const result = createBrandFromVendor('TestBrand');

      expect((result.copy as { description: string }).description).toContain('TestBrand');
      expect((result.copy as { description: string }).description).toContain(
        'premium fashion brand',
      );
      expect((result.copy as { mission: string }).mission).toBe(
        'Creating timeless fashion that empowers and inspires.',
      );

      const values = (result.copy as { values: string[] }).values;
      expect(Array.isArray(values)).toBe(true);
      expect(values).toContain('Quality');
      expect(values).toContain('Sustainability');
      expect(values).toContain('Innovation');
      expect(values).toContain('Style');
    });
  });

  describe('createRetailerBrand', () => {
    /**
     * Standard retailer configuration for testing
     */
    const createTestConfig = (overrides = {}) => ({
      name: 'Test Retailer',
      slug: 'test-retailer',
      type: BrandType.RETAILER,
      baseUrl: 'https://test.com',
      description: 'Test description',
      mission: 'Test mission',
      values: ['Value1', 'Value2'],
      ...overrides,
    });

    it('creates retailer brand with correct configuration', () => {
      const config = createTestConfig();
      const result = createRetailerBrand(config);

      expect(result.name).toBe(config.name);
      expect(result.slug).toBe(config.slug);
      expect(result.type).toBe(config.type);
      expect(result.baseUrl).toBe(config.baseUrl);
      expect((result.copy as { description: string }).description).toBe(config.description);
      expect((result.copy as { mission: string }).mission).toBe(config.mission);
      expect((result.copy as { values: string[] }).values).toStrictEqual(config.values);
    });

    /**
     * Brand type variation tests
     */
    it('handles all brand types', () => {
      const brandTypes = [BrandType.RETAILER, BrandType.MARKETPLACE, BrandType.LABEL];

      brandTypes.forEach(type => {
        const config = createTestConfig({
          name: `Test ${type}`,
          slug: `test-${type.toLowerCase()}`,
          type,
        });

        const result = createRetailerBrand(config);
        expect(result.type).toBe(type);
      });
    });

    /**
     * Edge case tests
     */
    it('handles empty values array', () => {
      const config = createTestConfig({ values: [] });
      const result = createRetailerBrand(config);

      expect((result.copy as { values: string[] }).values).toStrictEqual([]);
    });

    it('handles very long descriptions and missions', () => {
      const longDescription = 'A'.repeat(1000);
      const longMission = 'B'.repeat(500);

      const config = createTestConfig({
        description: longDescription,
        mission: longMission,
      });

      const result = createRetailerBrand(config);
      expect((result.copy as { description: string }).description).toBe(longDescription);
      expect((result.copy as { mission: string }).mission).toBe(longMission);
    });

    /**
     * URL format tests
     */
    it('handles different URL formats', () => {
      const urlFormats = [
        'https://www.test.com',
        'https://test.com',
        'http://www.test.com',
        'http://test.com',
        'https://test.com/',
        'https://test.com/path',
        'https://test.com/path?param=value',
        'https://test.com/path#fragment',
      ];

      urlFormats.forEach(baseUrl => {
        const config = createTestConfig({ baseUrl });
        const result = createRetailerBrand(config);
        expect(result.baseUrl).toBe(baseUrl);
      });
    });

    /**
     * Consistency tests
     */
    it('generates consistent results for same input', () => {
      const config = createTestConfig();
      const result1 = createRetailerBrand(config);
      const result2 = createRetailerBrand(config);

      expect(result1.name).toBe(result2.name);
      expect(result1.slug).toBe(result2.slug);
      expect(result1.type).toBe(result2.type);
      expect(result1.baseUrl).toBe(result2.baseUrl);
    });

    it('includes all required fields', () => {
      const config = createTestConfig();
      const result = createRetailerBrand(config);

      const requiredFields = ['name', 'slug', 'type', 'status', 'baseUrl', 'copy'];
      requiredFields.forEach(field => {
        expect(result).toHaveProperty(field);
      });

      const copyFields = ['description', 'mission', 'values'];
      copyFields.forEach(field => {
        expect(result.copy).toHaveProperty(field);
      });
    });

    it('sets correct default status', () => {
      const config = createTestConfig();
      const result = createRetailerBrand(config);

      expect(result.status).toBe(ContentStatus.PUBLISHED);
    });
  });

  describe('RETAILER_BRANDS', () => {
    /**
     * Data structure validation
     */
    it('contains expected retailer brands', () => {
      expect(RETAILER_BRANDS).toHaveLength(3);
      expect(RETAILER_BRANDS[0].name).toBe('Target');
      expect(RETAILER_BRANDS[1].name).toBe('Walmart');
      expect(RETAILER_BRANDS[2].name).toBe('Amazon');
    });

    it('has correct brand types', () => {
      expect(RETAILER_BRANDS[0].type).toBe(BrandType.RETAILER);
      expect(RETAILER_BRANDS[1].type).toBe(BrandType.RETAILER);
      expect(RETAILER_BRANDS[2].type).toBe(BrandType.MARKETPLACE);
    });

    /**
     * Comprehensive validation using test patterns
     */
    it('has valid structure for all brands', () => {
      const requiredFields = [
        'name',
        'slug',
        'type',
        'baseUrl',
        'description',
        'mission',
        'values',
      ];

      RETAILER_BRANDS.forEach(brand => {
        requiredFields.forEach(field => {
          expect(brand).toHaveProperty(field);
          expect(brand[field]).toBeTruthy();
        });

        expect(Array.isArray(brand.values)).toBe(true);
        expect(brand.values.length).toBeGreaterThan(0);
      });
    });

    it('has unique names and slugs', () => {
      const names = RETAILER_BRANDS.map(b => b.name);
      const slugs = RETAILER_BRANDS.map(b => b.slug);

      const uniqueNames = new Set(names);
      const uniqueSlugs = new Set(slugs);

      expect(uniqueNames.size).toBe(names.length);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('has valid URLs', () => {
      RETAILER_BRANDS.forEach(brand => {
        expect(brand.baseUrl).toMatch(/^https?:\/\/.+/);
      });
    });

    /**
     * Content quality validation
     */
    it('has appropriate content lengths', () => {
      RETAILER_BRANDS.forEach(brand => {
        expect(brand.description.length).toBeGreaterThan(10);
        expect(brand.description.length).toBeLessThan(500);
        expect(brand.mission.length).toBeGreaterThan(5);
        expect(brand.mission.length).toBeLessThan(200);

        expect(brand.values.length).toBeGreaterThan(0);
        expect(brand.values.length).toBeLessThan(10);

        brand.values.forEach(value => {
          expect(typeof value).toBe('string');
          expect(value.length).toBeGreaterThan(0);
        });
      });
    });

    it('has consistent brand type distribution', () => {
      const retailerCount = RETAILER_BRANDS.filter(b => b.type === BrandType.RETAILER).length;
      const marketplaceCount = RETAILER_BRANDS.filter(b => b.type === BrandType.MARKETPLACE).length;

      expect(retailerCount).toBe(2);
      expect(marketplaceCount).toBe(1);
    });
  });
});
