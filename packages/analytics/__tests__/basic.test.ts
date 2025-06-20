import { describe, expect } from 'vitest';

import { createClientAnalytics } from '../src/client';
import { createServerAnalytics } from '../src/server';
import { ecommerce } from '../src/shared/emitters';

describe('analytics Package', () => {
  test('should export client analytics functions', () => {
    expect(createClientAnalytics).toBeDefined();
    expect(typeof createClientAnalytics).toBe('function');
  });

  test('should export server analytics functions', () => {
    expect(createServerAnalytics).toBeDefined();
    expect(typeof createServerAnalytics).toBe('function');
  });

  test('should export ecommerce emitters', () => {
    expect(ecommerce).toBeDefined();
    expect(ecommerce.productViewed).toBeDefined();
    expect(ecommerce.orderCompleted).toBeDefined();
  });

  test('should create valid ecommerce events', () => {
    const event = ecommerce.productViewed({
      product_id: 'test-123',
      name: 'Test Product',
      price: 99.99,
    });

    expect(event).toMatchObject({
      type: 'track',
      event: 'Product Viewed',
      properties: expect.objectContaining({
        product_id: 'test-123',
        name: 'Test Product',
        price: 99.99,
      }),
    });
  });
});
