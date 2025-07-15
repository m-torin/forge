import { ContentStatus, TaxonomyType } from '#/prisma-generated/client';
import {
  colorTaxonomies,
  getAllTaxonomies,
  getStatusTaxonomy,
  sizeTaxonomies,
  statusTaxonomies,
} from '#/prisma/src/seed/mappers/taxonomy-mapper';
import { describe, expect, it } from 'vitest';

describe('taxonomy-mapper', () => {
  describe('statusTaxonomies', () => {
    it('contains expected status taxonomies', () => {
      expect(statusTaxonomies).toHaveLength(4);
      expect(statusTaxonomies[0].name).toBe('New in');
      expect(statusTaxonomies[1].name).toBe('Best Seller');
      expect(statusTaxonomies[2].name).toBe('Limited Edition');
      expect(statusTaxonomies[3].name).toBe('Trending');
    });

    it('has correct type and status', () => {
      statusTaxonomies.forEach(taxonomy => {
        expect(taxonomy.type).toBe(TaxonomyType.TAG);
        expect(taxonomy.status).toBe(ContentStatus.PUBLISHED);
      });
    });

    // Enhanced test coverage
    it('has valid structure for all status taxonomies', () => {
      statusTaxonomies.forEach(taxonomy => {
        expect(taxonomy).toHaveProperty('name');
        expect(taxonomy).toHaveProperty('slug');
        expect(taxonomy).toHaveProperty('type');
        expect(taxonomy).toHaveProperty('status');
        expect(taxonomy).toHaveProperty('copy');
        expect(taxonomy.copy as any).toHaveProperty('description');

        expect(taxonomy.name).toBeTruthy();
        expect(taxonomy.slug).toBeTruthy();
        expect((taxonomy.copy as any)?.description).toBeTruthy();
      });
    });

    it('has unique names and slugs', () => {
      const names = statusTaxonomies.map(t => t.name);
      const slugs = statusTaxonomies.map(t => t.slug);

      const uniqueNames = new Set(names);
      const uniqueSlugs = new Set(slugs);

      expect(uniqueNames.size).toBe(names.length);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('has appropriate descriptions', () => {
      statusTaxonomies.forEach(taxonomy => {
        expect((taxonomy.copy as any)?.description.length).toBeGreaterThan(5);
        expect((taxonomy.copy as any)?.description.length).toBeLessThan(100);
      });
    });

    it('has consistent slug format', () => {
      statusTaxonomies.forEach(taxonomy => {
        expect(taxonomy.slug).toMatch(/^[a-z-]+$/);
        expect(taxonomy.slug).not.toContain(' ');
        expect(taxonomy.slug).not.toContain('_');
      });
    });
  });

  describe('colorTaxonomies', () => {
    it('contains expected color taxonomies', () => {
      expect(colorTaxonomies.length).toBeGreaterThan(0);
      expect(colorTaxonomies[0].name).toBe('Black');
      expect(colorTaxonomies[0].type).toBe(TaxonomyType.COLOR);
    });

    it('has hex values in copy', () => {
      const blackTaxonomy = colorTaxonomies.find(t => t.name === 'Black');
      expect((blackTaxonomy?.copy as any)?.hex).toBe('#000000');
    });

    // Enhanced test coverage
    it('has valid structure for all color taxonomies', () => {
      colorTaxonomies.forEach(taxonomy => {
        expect(taxonomy).toHaveProperty('name');
        expect(taxonomy).toHaveProperty('slug');
        expect(taxonomy).toHaveProperty('type');
        expect(taxonomy).toHaveProperty('status');
        expect(taxonomy).toHaveProperty('copy');
        expect(taxonomy.copy as any).toHaveProperty('hex');
        expect(taxonomy.copy as any).toHaveProperty('description');

        expect(taxonomy.name).toBeTruthy();
        expect(taxonomy.slug).toBeTruthy();
        expect((taxonomy.copy as any)?.hex).toBeTruthy();
        expect((taxonomy.copy as any)?.description).toBeTruthy();
        expect(taxonomy.type).toBe(TaxonomyType.COLOR);
        expect(taxonomy.status).toBe(ContentStatus.PUBLISHED);
      });
    });

    it('has unique names and slugs', () => {
      const names = colorTaxonomies.map(t => t.name);
      const slugs = colorTaxonomies.map(t => t.slug);

      const uniqueNames = new Set(names);
      const uniqueSlugs = new Set(slugs);

      expect(uniqueNames.size).toBe(names.length);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('has valid hex color values', () => {
      colorTaxonomies.forEach(taxonomy => {
        const hex = (taxonomy.copy as any)?.hex;
        // Check for valid hex format or oklch format
        expect(hex).toMatch(/^(#[0-9A-Fa-f]{3,6}|oklch\([^)]+\))$/);
      });
    });

    it('has appropriate descriptions', () => {
      colorTaxonomies.forEach(taxonomy => {
        expect((taxonomy.copy as any)?.description.length).toBeGreaterThan(5);
        expect((taxonomy.copy as any)?.description.length).toBeLessThan(100);
      });
    });

    it('has consistent slug format', () => {
      colorTaxonomies.forEach(taxonomy => {
        expect(taxonomy.slug).toMatch(/^[a-z-]+$/);
        expect(taxonomy.slug).not.toContain(' ');
        expect(taxonomy.slug).not.toContain('_');
      });
    });

    it('includes common color variations', () => {
      const colorNames = colorTaxonomies.map(t => t.name);
      expect(colorNames).toContain('Black');
      expect(colorNames).toContain('White');
      expect(colorNames).toContain('Blue');
      expect(colorNames).toContain('Red');
      expect(colorNames).toContain('Green');
    });

    it('handles special color names', () => {
      const specialColors = colorTaxonomies.filter(
        t => t.name.includes(' ') || t.name.includes('-') || t.name.length > 10,
      );

      specialColors.forEach(taxonomy => {
        expect(taxonomy.slug).toMatch(/^[a-z-]+$/);
        expect((taxonomy.copy as any)?.hex).toBeTruthy();
      });
    });
  });

  describe('sizeTaxonomies', () => {
    it('contains expected size taxonomies', () => {
      expect(sizeTaxonomies).toHaveLength(6);
      expect(sizeTaxonomies[0].name).toBe('XXS');
      expect(sizeTaxonomies[5].name).toBe('XL');
    });

    it('has order values', () => {
      sizeTaxonomies.forEach((taxonomy, index) => {
        expect((taxonomy.copy as any)?.order).toBe(index + 1);
      });
    });

    // Enhanced test coverage
    it('has valid structure for all size taxonomies', () => {
      sizeTaxonomies.forEach(taxonomy => {
        expect(taxonomy).toHaveProperty('name');
        expect(taxonomy).toHaveProperty('slug');
        expect(taxonomy).toHaveProperty('type');
        expect(taxonomy).toHaveProperty('status');
        expect(taxonomy).toHaveProperty('copy');
        expect(taxonomy.copy as any).toHaveProperty('description');
        expect(taxonomy.copy as any).toHaveProperty('order');

        expect(taxonomy.name).toBeTruthy();
        expect(taxonomy.slug).toBeTruthy();
        expect((taxonomy.copy as any)?.description).toBeTruthy();
        expect(typeof (taxonomy.copy as any)?.order).toBe('number');
        expect(taxonomy.type).toBe(TaxonomyType.SIZE);
        expect(taxonomy.status).toBe(ContentStatus.PUBLISHED);
      });
    });

    it('has unique names and slugs', () => {
      const names = sizeTaxonomies.map(t => t.name);
      const slugs = sizeTaxonomies.map(t => t.slug);

      const uniqueNames = new Set(names);
      const uniqueSlugs = new Set(slugs);

      expect(uniqueNames.size).toBe(names.length);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('has sequential order values', () => {
      const orders = sizeTaxonomies.map(t => (t.copy as any)?.order).sort((a, b) => a - b);
      expect(orders).toStrictEqual([1, 2, 3, 4, 5, 6]);
    });

    it('has appropriate descriptions', () => {
      sizeTaxonomies.forEach(taxonomy => {
        expect((taxonomy.copy as any)?.description.length).toBeGreaterThan(5);
        expect((taxonomy.copy as any)?.description.length).toBeLessThan(50);
      });
    });

    it('has consistent slug format', () => {
      sizeTaxonomies.forEach(taxonomy => {
        expect(taxonomy.slug).toMatch(/^[a-z]+$/);
        expect(taxonomy.slug).not.toContain(' ');
        expect(taxonomy.slug).not.toContain('-');
        expect(taxonomy.slug).not.toContain('_');
      });
    });

    it('follows standard size progression', () => {
      const expectedSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL'];
      const actualSizes = sizeTaxonomies.map(t => t.name);
      expect(actualSizes).toStrictEqual(expectedSizes);
    });

    it('has logical size descriptions', () => {
      const sizeDescriptions = {
        XXS: 'Extra extra small',
        XS: 'Extra small',
        S: 'Small',
        M: 'Medium',
        L: 'Large',
        XL: 'Extra large',
      };

      sizeTaxonomies.forEach(taxonomy => {
        expect((taxonomy.copy as any)?.description).toBe(
          sizeDescriptions[taxonomy.name as keyof typeof sizeDescriptions],
        );
      });
    });
  });

  describe('getStatusTaxonomy', () => {
    it('maps status strings to taxonomy slugs', () => {
      expect(getStatusTaxonomy('New in')).toBe('new-in');
      expect(getStatusTaxonomy('Best Seller')).toBe('best-seller');
      expect(getStatusTaxonomy('Limited Edition')).toBe('limited-edition');
      expect(getStatusTaxonomy('Trending')).toBe('trending');
    });

    it('returns null for unknown status', () => {
      expect(getStatusTaxonomy('Unknown Status')).toBeNull();
    });

    // Enhanced test coverage
    it('handles case variations', () => {
      expect(getStatusTaxonomy('NEW IN')).toBe('new-in');
      expect(getStatusTaxonomy('new in')).toBe('new-in');
      expect(getStatusTaxonomy('New In')).toBe('new-in');
      expect(getStatusTaxonomy('BEST SELLER')).toBe('best-seller');
      expect(getStatusTaxonomy('best seller')).toBe('best-seller');
      expect(getStatusTaxonomy('Best seller')).toBe('best-seller');
    });

    it('handles extra whitespace', () => {
      expect(getStatusTaxonomy('  New in  ')).toBe('new-in');
      expect(getStatusTaxonomy('Best Seller  ')).toBe('best-seller');
      expect(getStatusTaxonomy('  Limited Edition')).toBe('limited-edition');
    });

    it('handles empty and null inputs', () => {
      expect(getStatusTaxonomy('')).toBeNull();
      expect(getStatusTaxonomy(null as any)).toBeNull();
      expect(getStatusTaxonomy(undefined as any)).toBeNull();
    });

    it('handles special characters in status', () => {
      expect(getStatusTaxonomy('New in!')).toBeNull();
      expect(getStatusTaxonomy('Best-Seller')).toBeNull();
      expect(getStatusTaxonomy('Limited_Edition')).toBeNull();
    });

    it('handles very long status strings', () => {
      const longStatus = 'A'.repeat(1000);
      expect(getStatusTaxonomy(longStatus)).toBeNull();
    });

    it('handles partial matches', () => {
      expect(getStatusTaxonomy('New')).toBeNull();
      expect(getStatusTaxonomy('Seller')).toBeNull();
      expect(getStatusTaxonomy('Edition')).toBeNull();
      expect(getStatusTaxonomy('Trend')).toBeNull();
    });

    it('handles similar but different statuses', () => {
      expect(getStatusTaxonomy('New Arrivals')).toBeNull();
      expect(getStatusTaxonomy('Best Sellers')).toBeNull();
      expect(getStatusTaxonomy('Limited Editions')).toBeNull();
      expect(getStatusTaxonomy('Trending Now')).toBeNull();
    });

    it('generates consistent results for same input', () => {
      const status = 'New in';
      const result1 = getStatusTaxonomy(status);
      const result2 = getStatusTaxonomy(status);
      const result3 = getStatusTaxonomy(status);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe('getAllTaxonomies', () => {
    it('combines all taxonomy types', () => {
      const allTaxonomies = getAllTaxonomies();
      expect(allTaxonomies.length).toBeGreaterThan(statusTaxonomies.length);
      expect(allTaxonomies.length).toBeGreaterThan(colorTaxonomies.length);
      expect(allTaxonomies.length).toBeGreaterThan(sizeTaxonomies.length);
    });

    // Enhanced test coverage
    it('returns correct total count', () => {
      const allTaxonomies = getAllTaxonomies();
      const expectedCount =
        statusTaxonomies.length + colorTaxonomies.length + sizeTaxonomies.length;
      expect(allTaxonomies.length).toBe(expectedCount);
    });

    it('includes all status taxonomies', () => {
      const allTaxonomies = getAllTaxonomies();
      const statusNames = statusTaxonomies.map(t => t.name);

      statusNames.forEach(name => {
        const found = allTaxonomies.find(t => t.name === name);
        expect(found).toBeDefined();
        expect(found!.type).toBe(TaxonomyType.TAG);
      });
    });

    it('includes all color taxonomies', () => {
      const allTaxonomies = getAllTaxonomies();
      const colorNames = colorTaxonomies.map(t => t.name);

      colorNames.forEach(name => {
        const found = allTaxonomies.find(t => t.name === name);
        expect(found).toBeDefined();
        expect(found!.type).toBe(TaxonomyType.COLOR);
      });
    });

    it('includes all size taxonomies', () => {
      const allTaxonomies = getAllTaxonomies();
      const sizeNames = sizeTaxonomies.map(t => t.name);

      sizeNames.forEach(name => {
        const found = allTaxonomies.find(t => t.name === name);
        expect(found).toBeDefined();
        expect(found!.type).toBe(TaxonomyType.SIZE);
      });
    });

    it('has unique names across all taxonomies', () => {
      const allTaxonomies = getAllTaxonomies();
      const names = allTaxonomies.map(t => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('has unique slugs across all taxonomies', () => {
      const allTaxonomies = getAllTaxonomies();
      const slugs = allTaxonomies.map(t => t.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('maintains correct structure for all taxonomies', () => {
      const allTaxonomies = getAllTaxonomies();

      allTaxonomies.forEach(taxonomy => {
        expect(taxonomy).toHaveProperty('name');
        expect(taxonomy).toHaveProperty('slug');
        expect(taxonomy).toHaveProperty('type');
        expect(taxonomy).toHaveProperty('status');
        expect(taxonomy).toHaveProperty('copy');

        expect(taxonomy.name).toBeTruthy();
        expect(taxonomy.slug).toBeTruthy();
        expect(taxonomy.status).toBe(ContentStatus.PUBLISHED);
      });
    });

    it('generates consistent results', () => {
      const result1 = getAllTaxonomies();
      const result2 = getAllTaxonomies();
      const result3 = getAllTaxonomies();

      expect(result1.length).toBe(result2.length);
      expect(result2.length).toBe(result3.length);
      expect(result1.map(t => t.name).sort()).toStrictEqual(result2.map(t => t.name).sort());
      expect(result2.map(t => t.name).sort()).toStrictEqual(result3.map(t => t.name).sort());
    });

    it('has appropriate type distribution', () => {
      const allTaxonomies = getAllTaxonomies();
      const typeCounts = {
        [TaxonomyType.TAG]: 0,
        [TaxonomyType.COLOR]: 0,
        [TaxonomyType.SIZE]: 0,
      };

      allTaxonomies.forEach(taxonomy => {
        typeCounts[taxonomy.type as keyof typeof typeCounts]++;
      });

      expect(typeCounts[TaxonomyType.TAG]).toBe(statusTaxonomies.length);
      expect(typeCounts[TaxonomyType.COLOR]).toBe(colorTaxonomies.length);
      expect(typeCounts[TaxonomyType.SIZE]).toBe(sizeTaxonomies.length);
    });
  });
});
