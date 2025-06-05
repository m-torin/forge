import { describe, it, expect } from 'vitest';
import { createClientAnalytics } from '../src/client';
import { createServerAnalytics } from '../src/server';
import { ecommerce } from '../src/shared/emitters';

describe('Analytics Package', () => {
  it('should export client analytics functions', () => {
    expect(createClientAnalytics).toBeDefined();
    expect(typeof createClientAnalytics).toBe('function');
  });

  it('should export server analytics functions', () => {
    expect(createServerAnalytics).toBeDefined();
    expect(typeof createServerAnalytics).toBe('function');
  });

  it('should export ecommerce emitters', () => {
    expect(ecommerce).toBeDefined();
    expect(ecommerce.productViewed).toBeDefined();
    expect(ecommerce.orderCompleted).toBeDefined();
  });

  it('should create valid ecommerce events', () => {
    const event = ecommerce.productViewed({
      product_id: 'test-123',
      name: 'Test Product',
      price: 99.99
    });

    expect(event).toMatchObject({
      type: 'track',
      event: 'Product Viewed',
      properties: expect.objectContaining({
        product_id: 'test-123',
        name: 'Test Product',
        price: 99.99
      })
    });
  });
});