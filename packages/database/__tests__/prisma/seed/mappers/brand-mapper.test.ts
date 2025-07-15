import { BrandType, ContentStatus } from '#/prisma-generated/client';
import {
  createBrandFromVendor,
  createRetailerBrand,
  RETAILER_BRANDS,
} from '#/prisma/src/seed/mappers/brand-mapper';
import { describe, expect, it } from 'vitest';

describe('brand-mapper', () => {
  describe('createBrandFromVendor', () => {
    it('creates brand from vendor name correctly', () => {
      const result = createBrandFromVendor('TestBrand');

      expect(result.name).toBe('TestBrand');
      expect(result.slug).toBe('testbrand');
      expect(result.type).toBe(BrandType.LABEL);
      expect(result.status).toBe(ContentStatus.PUBLISHED);
      expect((result.copy as { description: string }).description).toContain('TestBrand');
    });

    it('handles vendor names with spaces', () => {
      const result = createBrandFromVendor('Test Brand Name');

      expect(result.name).toBe('Test Brand Name');
      expect(result.slug).toBe('test-brand-name');
    });

    // Enhanced test coverage
    it('handles vendor names with special characters', () => {
      const specialNames = [
        'Brand & Co.',
        'Brand-Corp',
        'Brand_Corp',
        'Brand@Corp',
        'Brand#Corp',
        'Brand$Corp',
        'Brand%Corp',
        'Brand^Corp',
        'Brand*Corp',
        'Brand(Corp)',
        'Brand[Corp]',
        'Brand{Corp}',
        'Brand|Corp',
        'Brand\\Corp',
        'Brand/Corp',
        'Brand:Corp',
        'Brand;Corp',
        'Brand"Corp"',
        "Brand'Corp'",
        'Brand<Corp>',
        'Brand?Corp',
        'Brand!Corp',
        'Brand~Corp',
        'Brand`Corp',
      ];

      specialNames.forEach(name => {
        const result = createBrandFromVendor(name);
        expect(result.name).toBe(name);
        expect(result.slug).toBe(name.toLowerCase().replace(/\s+/g, '-'));
        expect(result.type).toBe(BrandType.LABEL);
        expect(result.status).toBe(ContentStatus.PUBLISHED);
      });
    });

    it('handles empty vendor name', () => {
      const result = createBrandFromVendor('');
      expect(result.name).toBe('');
      expect(result.slug).toBe('');
      expect(result.type).toBe(BrandType.LABEL);
      expect(result.status).toBe(ContentStatus.PUBLISHED);
    });

    it('handles single character vendor name', () => {
      const result = createBrandFromVendor('A');
      expect(result.name).toBe('A');
      expect(result.slug).toBe('a');
      expect(result.type).toBe(BrandType.LABEL);
    });

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

    it('handles vendor names with numbers', () => {
      const result = createBrandFromVendor('Brand123');
      expect(result.name).toBe('Brand123');
      expect(result.slug).toBe('brand123');
    });

    it('handles vendor names with mixed case', () => {
      const result = createBrandFromVendor('BrAnD nAmE');
      expect(result.name).toBe('BrAnD nAmE');
      expect(result.slug).toBe('brand-name');
    });

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

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('copy');
      expect(result.copy).toHaveProperty('description');
      expect(result.copy).toHaveProperty('mission');
      expect(result.copy).toHaveProperty('values');
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
      expect(Array.isArray((result.copy as { values: string[] }).values)).toBe(true);
      expect((result.copy as { values: string[] }).values).toContain('Quality');
      expect((result.copy as { values: string[] }).values).toContain('Sustainability');
      expect((result.copy as { values: string[] }).values).toContain('Innovation');
      expect((result.copy as { values: string[] }).values).toContain('Style');
    });
  });

  describe('createRetailerBrand', () => {
    it('creates retailer brand with correct configuration', () => {
      const config = {
        name: 'Test Retailer',
        slug: 'test-retailer',
        type: BrandType.RETAILER,
        baseUrl: 'https://test.com',
        description: 'Test description',
        mission: 'Test mission',
        values: ['Value1', 'Value2'],
      };

      const result = createRetailerBrand(config);

      expect(result.name).toBe('Test Retailer');
      expect(result.slug).toBe('test-retailer');
      expect(result.type).toBe(BrandType.RETAILER);
      expect(result.baseUrl).toBe('https://test.com');
      expect((result.copy as { description: string }).description).toBe('Test description');
      expect((result.copy as { mission: string }).mission).toBe('Test mission');
      expect((result.copy as { values: string[] }).values).toStrictEqual(['Value1', 'Value2']);
    });

    // Enhanced test coverage
    it('handles all brand types', () => {
      const brandTypes = [BrandType.RETAILER, BrandType.MARKETPLACE, BrandType.LABEL];

      brandTypes.forEach(type => {
        const config = {
          name: `Test ${type}`,
          slug: `test-${type.toLowerCase()}`,
          type,
          baseUrl: 'https://test.com',
          description: 'Test description',
          mission: 'Test mission',
          values: ['Value1'],
        };

        const result = createRetailerBrand(config);
        expect(result.type).toBe(type);
      });
    });

    it('handles empty values array', () => {
      const config = {
        name: 'Test Retailer',
        slug: 'test-retailer',
        type: BrandType.RETAILER,
        baseUrl: 'https://test.com',
        description: 'Test description',
        mission: 'Test mission',
        values: [],
      };

      const result = createRetailerBrand(config);
      expect((result.copy as { values: string[] }).values).toStrictEqual([]);
    });

    it('handles very long descriptions and missions', () => {
      const longDescription = 'A'.repeat(1000);
      const longMission = 'B'.repeat(500);
      const config = {
        name: 'Test Retailer',
        slug: 'test-retailer',
        type: BrandType.RETAILER,
        baseUrl: 'https://test.com',
        description: longDescription,
        mission: longMission,
        values: ['Value1'],
      };

      const result = createRetailerBrand(config);
      expect((result.copy as { description: string }).description).toBe(longDescription);
      expect((result.copy as { mission: string }).mission).toBe(longMission);
    });

    it('handles special characters in all fields', () => {
      const config = {
        name: 'Brand & Co. (Retail)',
        slug: 'brand-co-retail',
        type: BrandType.RETAILER,
        baseUrl: 'https://test.com',
        description:
          'Description with special chars: &, @, #, $, %, ^, *, (, ), [, ], {, }, |, \\, /, :, ;, ", \', <, >, ?, !, ~, `',
        mission:
          'Mission with special chars: &, @, #, $, %, ^, *, (, ), [, ], {, }, |, \\, /, :, ;, ", \', <, >, ?, !, ~, `',
        values: ['Value & Co.', 'Value@Corp', 'Value#Corp', 'Value$Corp'],
      };

      const result = createRetailerBrand(config);
      expect(result.name).toBe('Brand & Co. (Retail)');
      expect((result.copy as { description: string }).description).toBe(
        'Description with special chars: &, @, #, $, %, ^, *, (, ), [, ], {, }, |, \\, /, :, ;, ", \', <, >, ?, !, ~, `',
      );
      expect((result.copy as { mission: string }).mission).toBe(
        'Mission with special chars: &, @, #, $, %, ^, *, (, ), [, ], {, }, |, \\, /, :, ;, ", \', <, >, ?, !, ~, `',
      );
      expect((result.copy as { values: string[] }).values).toStrictEqual([
        'Value & Co.',
        'Value@Corp',
        'Value#Corp',
        'Value$Corp',
      ]);
    });

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
        const config = {
          name: 'Test Retailer',
          slug: 'test-retailer',
          type: BrandType.RETAILER,
          baseUrl,
          description: 'Test description',
          mission: 'Test mission',
          values: ['Value1'],
        };

        const result = createRetailerBrand(config);
        expect(result.baseUrl).toBe(baseUrl);
      });
    });

    it('generates consistent results for same input', () => {
      const config = {
        name: 'Test Retailer',
        slug: 'test-retailer',
        type: BrandType.RETAILER,
        baseUrl: 'https://test.com',
        description: 'Test description',
        mission: 'Test mission',
        values: ['Value1', 'Value2'],
      };

      const result1 = createRetailerBrand(config);
      const result2 = createRetailerBrand(config);

      expect(result1.name).toBe(result2.name);
      expect(result1.slug).toBe(result2.slug);
      expect(result1.type).toBe(result2.type);
      expect(result1.baseUrl).toBe(result2.baseUrl);
      expect((result1.copy as { description: string }).description).toBe(
        (result2.copy as { description: string }).description,
      );
      expect((result1.copy as { mission: string }).mission).toBe(
        (result2.copy as { mission: string }).mission,
      );
      expect((result1.copy as { values: string[] }).values).toStrictEqual(
        (result2.copy as { values: string[] }).values,
      );
    });

    it('includes all required fields', () => {
      const config = {
        name: 'Test Retailer',
        slug: 'test-retailer',
        type: BrandType.RETAILER,
        baseUrl: 'https://test.com',
        description: 'Test description',
        mission: 'Test mission',
        values: ['Value1'],
      };

      const result = createRetailerBrand(config);

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('baseUrl');
      expect(result).toHaveProperty('copy');
      expect(result.copy).toHaveProperty('description');
      expect(result.copy).toHaveProperty('mission');
      expect(result.copy).toHaveProperty('values');
    });

    it('sets correct default status', () => {
      const config = {
        name: 'Test Retailer',
        slug: 'test-retailer',
        type: BrandType.RETAILER,
        baseUrl: 'https://test.com',
        description: 'Test description',
        mission: 'Test mission',
        values: ['Value1'],
      };

      const result = createRetailerBrand(config);
      expect(result.status).toBe(ContentStatus.PUBLISHED);
    });
  });

  describe('RETAILER_BRANDS', () => {
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

    // Enhanced test coverage
    it('has valid structure for all brands', () => {
      RETAILER_BRANDS.forEach(brand => {
        expect(brand).toHaveProperty('name');
        expect(brand).toHaveProperty('slug');
        expect(brand).toHaveProperty('type');
        expect(brand).toHaveProperty('baseUrl');
        expect(brand).toHaveProperty('description');
        expect(brand).toHaveProperty('mission');
        expect(brand).toHaveProperty('values');

        expect(brand.name).toBeTruthy();
        expect(brand.slug).toBeTruthy();
        expect(brand.baseUrl).toBeTruthy();
        expect(brand.description).toBeTruthy();
        expect(brand.mission).toBeTruthy();
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

    it('has appropriate descriptions', () => {
      RETAILER_BRANDS.forEach(brand => {
        expect(brand.description.length).toBeGreaterThan(10);
        expect(brand.description.length).toBeLessThan(500);
      });
    });

    it('has meaningful missions', () => {
      RETAILER_BRANDS.forEach(brand => {
        expect(brand.mission.length).toBeGreaterThan(5);
        expect(brand.mission.length).toBeLessThan(200);
      });
    });

    it('has appropriate values arrays', () => {
      RETAILER_BRANDS.forEach(brand => {
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
