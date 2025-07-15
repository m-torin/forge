import {
  createInventoryRecord,
  createInventoryTransaction,
  generateInventoryHistory,
  generateStockLevels,
} from '#/prisma/src/seed/mappers/inventory-mapper';
import { describe, expect, it } from 'vitest';
// InventoryTransactionType enum values for testing
const InventoryTransactionType = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  RETURN: 'RETURN',
  ADJUSTMENT: 'ADJUSTMENT',
  TRANSFER: 'TRANSFER',
} as const;

describe('inventory-mapper', () => {
  const mockConfig = {
    productId: 'product-123',
    locationId: 'location-123',
    locationName: 'Test Warehouse',
    baseQuantity: 100,
    lowStockThreshold: 10,
  };

  describe('createInventoryRecord', () => {
    it('creates inventory record with correct structure', () => {
      const result = createInventoryRecord(mockConfig);

      expect(result.quantity).toBe(100);
      expect(result.reserved).toBe(10); // 10% of base quantity
      expect(result.available).toBe(90);
      expect(result.lowStockThreshold).toBe(10);
      expect(result.locationId).toBe('location-123');
      expect(result.locationName).toBe('Test Warehouse');
      expect(result.product).toStrictEqual({ connect: { id: 'product-123' } });
      expect((result.metadata as any)?.reorderPoint).toBe(20);
      expect((result.metadata as any)?.reorderQuantity).toBe(100);
    });

    it('handles variant inventory', () => {
      const variantConfig = { ...mockConfig, variantId: 'variant-123' };
      const result = createInventoryRecord(variantConfig);

      expect(result.variant).toStrictEqual({ connect: { id: 'variant-123' } });
      expect(result.product).toBeUndefined();
    });

    // Enhanced test coverage
    it('calculates reserved quantity correctly', () => {
      const configs = [
        { ...mockConfig, baseQuantity: 100 },
        { ...mockConfig, baseQuantity: 50 },
        { ...mockConfig, baseQuantity: 200 },
      ];

      configs.forEach(config => {
        const result = createInventoryRecord(config);
        const expectedReserved = Math.floor(config.baseQuantity * 0.1);
        expect(result.reserved).toBe(expectedReserved);
        expect(result.available).toBe(config.baseQuantity - expectedReserved);
      });
    });

    it('handles zero quantity gracefully', () => {
      const zeroConfig = { ...mockConfig, baseQuantity: 0 };
      const result = createInventoryRecord(zeroConfig);

      expect(result.quantity).toBe(0);
      expect(result.reserved).toBe(0);
      expect(result.available).toBe(0);
    });

    it('handles very large quantities', () => {
      const largeConfig = { ...mockConfig, baseQuantity: 10000 };
      const result = createInventoryRecord(largeConfig);

      expect(result.quantity).toBe(10000);
      expect(result.reserved).toBe(1000);
      expect(result.available).toBe(9000);
    });

    it('generates appropriate reorder points', () => {
      const configs = [
        { ...mockConfig, baseQuantity: 100, lowStockThreshold: 10 },
        { ...mockConfig, baseQuantity: 200, lowStockThreshold: 20 },
        { ...mockConfig, baseQuantity: 50, lowStockThreshold: 5 },
      ];

      configs.forEach(config => {
        const result = createInventoryRecord(config);
        const expectedReorderPoint = config.lowStockThreshold * 2;
        expect((result.metadata as any)?.reorderPoint).toBe(expectedReorderPoint);
      });
    });

    it('includes all required metadata fields', () => {
      const result = createInventoryRecord(mockConfig);

      expect(result.metadata).toHaveProperty('reorderPoint');
      expect(result.metadata).toHaveProperty('reorderQuantity');
      expect(result.metadata).toHaveProperty('lastUpdated');
      expect(result.metadata).toHaveProperty('source');
      expect((result.metadata as any)?.source).toBe('seed-data');
    });

    it('handles different location types', () => {
      const locations = [
        { id: 'warehouse-1', name: 'Main Warehouse' },
        { id: 'store-1', name: 'Downtown Store' },
        { id: 'distribution-1', name: 'Distribution Center' },
      ];

      locations.forEach(location => {
        const config = {
          ...mockConfig,
          locationId: location.id,
          locationName: location.name,
        };
        const result = createInventoryRecord(config);

        expect(result.locationId).toBe(location.id);
        expect(result.locationName).toBe(location.name);
      });
    });

    it('prioritizes variant over product when both provided', () => {
      const bothConfig = {
        ...mockConfig,
        variantId: 'variant-123',
      };
      const result = createInventoryRecord(bothConfig);

      expect(result.variant).toStrictEqual({ connect: { id: 'variant-123' } });
      expect(result.product).toBeUndefined();
    });
  });

  describe('createInventoryRecord edge cases', () => {
    it('handles missing required fields gracefully', () => {
      const result = createInventoryRecord({ ...mockConfig, productId: undefined! });
      expect(result.product).toBeUndefined();
    });
    it('handles negative baseQuantity and lowStockThreshold', () => {
      const negConfig = { ...mockConfig, baseQuantity: -10, lowStockThreshold: -2 };
      const result = createInventoryRecord(negConfig);
      expect(result.quantity).toBe(-10);
      expect(result.reserved).toBe(Math.floor(-10 * 0.1));
      expect(result.lowStockThreshold).toBe(-2);
    });
    it('handles missing location fields', () => {
      const result = createInventoryRecord({
        ...mockConfig,
        locationId: undefined!,
        locationName: undefined!,
      });
      expect(result.locationId).toBeUndefined();
      expect(result.locationName).toBeUndefined();
    });
    it('always includes metadata fields', () => {
      const result = createInventoryRecord({} as any);
      expect(result.metadata).toBeDefined();
      expect(result.metadata).toHaveProperty('reorderPoint');
      expect(result.metadata).toHaveProperty('reorderQuantity');
    });
  });

  describe('generateStockLevels', () => {
    it('generates stock levels within expected ranges', () => {
      const result = generateStockLevels('Clothing');

      expect(result.baseQuantity).toBeGreaterThan(0);
      expect(result.lowStockThreshold).toBeGreaterThan(0);
      expect(result.baseQuantity).toBeGreaterThan(result.lowStockThreshold);
    });

    it('generates different profiles', () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        results.push(generateStockLevels('Clothing'));
      }

      // Should have some variation
      const uniqueQuantities = new Set(results.map(r => r.baseQuantity));
      expect(uniqueQuantities.size).toBeGreaterThan(1);
    });

    // Enhanced test coverage
    it('generates appropriate levels for different categories', () => {
      const categories = ['Clothing', 'Electronics', 'Books', 'Home & Garden', 'Sports'];

      categories.forEach(category => {
        const result = generateStockLevels(category);

        expect(result.baseQuantity).toBeGreaterThan(0);
        expect(result.lowStockThreshold).toBeGreaterThan(0);
        expect(result.baseQuantity).toBeGreaterThan(result.lowStockThreshold);

        // Low stock threshold should be reasonable percentage of base quantity
        const thresholdPercentage = result.lowStockThreshold / result.baseQuantity;
        expect(thresholdPercentage).toBeGreaterThan(0.05); // At least 5%
        expect(thresholdPercentage).toBeLessThan(0.3); // No more than 30%
      });
    });

    it('generates consistent results for same category', () => {
      const result1 = generateStockLevels('Clothing');
      const result2 = generateStockLevels('Clothing');

      expect(result1.baseQuantity).toBe(result2.baseQuantity);
      expect(result1.lowStockThreshold).toBe(result2.lowStockThreshold);
    });

    it('handles special characters in category names', () => {
      const specialCategories = ['Home & Garden', 'Food & Beverage', 'Kids & Toys'];

      specialCategories.forEach(category => {
        const result = generateStockLevels(category);
        expect(result.baseQuantity).toBeGreaterThan(0);
        expect(result.lowStockThreshold).toBeGreaterThan(0);
      });
    });

    it('generates reasonable quantity ranges', () => {
      const results = [];
      for (let i = 0; i < 20; i++) {
        results.push(generateStockLevels('Clothing'));
      }

      const quantities = results.map(r => r.baseQuantity);
      const minQuantity = Math.min(...quantities);
      const maxQuantity = Math.max(...quantities);

      expect(minQuantity).toBeGreaterThan(0);
      expect(maxQuantity).toBeLessThan(1000); // Reasonable upper limit
      expect(maxQuantity).toBeGreaterThan(minQuantity);
    });
  });

  describe('createInventoryTransaction', () => {
    it('creates purchase transaction', () => {
      const result = createInventoryTransaction('inventory-123', 'PURCHASE' as any, 50);

      expect(result.type).toBe('PURCHASE' as any);
      expect(result.quantity).toBe(50);
      expect(result.inventory).toStrictEqual({ connect: { id: 'inventory-123' } });
      expect(result.notes).toContain('Restocked');
    });

    it('creates sale transaction', () => {
      const result = createInventoryTransaction('inventory-123', 'SALE' as any, -5);

      expect(result.type).toBe('SALE' as any);
      expect(result.quantity).toBe(-5);
      expect(result.notes).toContain('Sold');
    });

    it('creates return transaction', () => {
      const result = createInventoryTransaction('inventory-123', 'RETURN' as any, 2);

      expect(result.type).toBe('RETURN' as any);
      expect(result.quantity).toBe(2);
      expect(result.notes).toContain('return');
    });

    // Enhanced test coverage
    it('handles all transaction types', () => {
      const transactionTypes = [
        'PURCHASE' as any,
        'SALE' as any,
        'RETURN' as any,
        'ADJUSTMENT' as any,
        'TRANSFER' as any,
      ];

      transactionTypes.forEach(type => {
        const result = createInventoryTransaction('inventory-123', type, 10);

        expect(result.type).toBe(type);
        expect(result.inventory).toStrictEqual({ connect: { id: 'inventory-123' } });
        expect(result.notes).toBeDefined();
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.createdBy).toBe('system');
      });
    });

    it('generates appropriate notes for different transaction types', () => {
      const testCases = [
        { type: 'PURCHASE' as any, quantity: 50, expectedNote: 'Restocked' },
        { type: 'SALE' as any, quantity: -5, expectedNote: 'Sold' },
        { type: 'RETURN' as any, quantity: 2, expectedNote: 'return' },
        { type: 'ADJUSTMENT' as any, quantity: 10, expectedNote: 'adjustment' },
        { type: 'TRANSFER' as any, quantity: -20, expectedNote: 'transfer' },
      ];

      testCases.forEach(({ type, quantity, expectedNote }) => {
        const result = createInventoryTransaction('inventory-123', type, quantity);
        expect(result.notes!.toLowerCase()).toContain(expectedNote.toLowerCase());
      });
    });

    it('handles zero quantity transactions', () => {
      const result = createInventoryTransaction('inventory-123', 'ADJUSTMENT' as any, 0);

      expect(result.quantity).toBe(0);
      expect(result.notes).toContain('adjustment');
    });

    it('handles very large quantities', () => {
      const result = createInventoryTransaction('inventory-123', 'PURCHASE' as any, 10000);

      expect(result.quantity).toBe(10000);
      expect(result.notes).toContain('Restocked');
    });

    it('includes all required transaction fields', () => {
      const result = createInventoryTransaction('inventory-123', 'PURCHASE' as any, 50);

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('quantity');
      expect(result).toHaveProperty('inventory');
      expect(result).toHaveProperty('notes');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('createdBy');
      expect(result.createdBy).toBe('system');
    });
  });

  describe('generateInventoryHistory', () => {
    it('generates inventory history with transactions', () => {
      const result = generateInventoryHistory('inventory-123');

      expect(result.length).toBeGreaterThanOrEqual(5);
      expect(result.length).toBeLessThanOrEqual(15);

      result.forEach(transaction => {
        expect(transaction.inventoryId).toBe('inventory-123');
        expect(transaction.type).toBeDefined();
        expect(transaction.quantity).toBeDefined();
        expect(transaction.notes).toBeDefined();
        expect(transaction.createdAt).toBeInstanceOf(Date);
        expect(transaction.createdBy).toBe('system');
      });
    });

    it('sorts transactions by date', () => {
      const result = generateInventoryHistory('inventory-123');

      for (let i = 1; i < result.length; i++) {
        expect((result[i]!.createdAt as Date).getTime()).toBeGreaterThanOrEqual(
          (result[i - 1]!.createdAt as Date).getTime(),
        );
      }
    });

    // Enhanced test coverage
    it('generates realistic transaction patterns', () => {
      const result = generateInventoryHistory('inventory-123');

      // Should have a mix of transaction types
      const transactionTypes = result.map(t => t.type);
      const uniqueTypes = new Set(transactionTypes);
      expect(uniqueTypes.size).toBeGreaterThan(1);

      // Should have both positive and negative quantities
      const quantities = result.map(t => t.quantity);
      const hasPositive = quantities.some(q => q > 0);
      const hasNegative = quantities.some(q => q < 0);
      expect(hasPositive).toBe(true);
      expect(hasNegative).toBe(true);
    });

    it('generates transactions within reasonable date ranges', () => {
      const result = generateInventoryHistory('inventory-123');
      const now = new Date();
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

      result.forEach(transaction => {
        expect((transaction.createdAt! as Date).getTime()).toBeGreaterThanOrEqual(
          oneYearAgo.getTime(),
        );
        expect((transaction.createdAt! as Date).getTime()).toBeLessThanOrEqual(now.getTime());
      });
    });

    it('generates different histories for different inventory IDs', () => {
      const history1 = generateInventoryHistory('inventory-123');
      const history2 = generateInventoryHistory('inventory-456');

      // Should have different transaction counts or patterns
      expect(history1.length).not.toBe(history2.length);
    });

    it('includes appropriate transaction metadata', () => {
      const result = generateInventoryHistory('inventory-123');

      result.forEach(transaction => {
        expect(transaction).toHaveProperty('inventoryId');
        expect(transaction).toHaveProperty('type');
        expect(transaction).toHaveProperty('quantity');
        expect(transaction).toHaveProperty('notes');
        expect(transaction).toHaveProperty('createdAt');
        expect(transaction).toHaveProperty('createdBy');

        expect(typeof transaction.inventoryId).toBe('string');
        expect(typeof transaction.quantity).toBe('number');
        expect(typeof transaction.notes).toBe('string');
        expect(transaction.createdBy).toBe('system');
      });
    });

    it('generates realistic quantity ranges', () => {
      const result = generateInventoryHistory('inventory-123');

      result.forEach(transaction => {
        // Quantities should be reasonable
        expect(transaction.quantity).toBeGreaterThan(-1000);
        expect(transaction.quantity).toBeLessThan(1000);

        // Most transactions should be smaller
        expect(Math.abs(transaction.quantity)).toBeLessThan(500);
      });
    });

    it('maintains chronological order with realistic gaps', () => {
      const result = generateInventoryHistory('inventory-123');

      for (let i = 1; i < result.length; i++) {
        const timeDiff =
          (result[i]!.createdAt as Date).getTime() - (result[i - 1]!.createdAt as Date).getTime();

        // Transactions should be at least 1 hour apart
        expect(timeDiff).toBeGreaterThanOrEqual(60 * 60 * 1000);

        // But not more than 30 days apart
        expect(timeDiff).toBeLessThanOrEqual(30 * 24 * 60 * 60 * 1000);
      }
    });
  });
});
