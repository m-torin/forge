/**
 * Tests for shared common schemas
 */

import { describe, expect } from 'vitest';
import {
  commonSchemas,
  compositeSchemas,
  extendSchema,
  makeArray,
  makeOptional,
} from '../../src/shared/common-schemas';

describe('common Schemas', () => {
  test('should validate basic schemas correctly', () => {
    // Test ID validation
    expect(() => commonSchemas.id.parse('550e8400-e29b-41d4-a716-446655440000')).not.toThrow();
    expect(() => commonSchemas.id.parse('invalid-uuid')).toThrow();

    // Test temperature validation
    expect(() => commonSchemas.temperature.parse(0.7)).not.toThrow();
    expect(() => commonSchemas.temperature.parse(2.5)).toThrow();
    expect(() => commonSchemas.temperature.parse(-0.1)).toThrow();

    // Test URL validation
    expect(() => commonSchemas.url.parse('https://example.com')).not.toThrow();
    expect(() => commonSchemas.url.parse('not-a-url')).toThrow();

    // Test email validation
    expect(() => commonSchemas.email.parse('test@example.com')).not.toThrow();
    expect(() => commonSchemas.email.parse('invalid-email')).toThrow();
  });

  test('should validate composite schemas correctly', () => {
    // Test pagination schema
    const validPagination = {
      limit: 20,
      offset: 0,
      page: 1,
    };
    expect(() => compositeSchemas.pagination.parse(validPagination)).not.toThrow();

    // Test search query schema
    const validSearch = {
      query: 'test search',
      limit: 10,
      offset: 0,
    };
    expect(() => compositeSchemas.searchQuery.parse(validSearch)).not.toThrow();

    // Test coordinates schema
    const validCoords = {
      latitude: 37.7749,
      longitude: -122.4194,
    };
    expect(() => compositeSchemas.coordinates.parse(validCoords)).not.toThrow();
  });

  test('should create optional schemas using ES2023 arrow function', () => {
    const optionalTitle = makeOptional(commonSchemas.title);

    expect(() => optionalTitle.parse(undefined)).not.toThrow();
    expect(() => optionalTitle.parse('Valid Title')).not.toThrow();
    expect(() => optionalTitle.parse('')).toThrow(); // Still requires min length when provided
  });

  test('should create array schemas using ES2023 arrow function', () => {
    const titleArray = makeArray(commonSchemas.title);

    expect(() => titleArray.parse(['Title 1', 'Title 2'])).not.toThrow();
    expect(() => titleArray.parse([])).not.toThrow();
    expect(() => titleArray.parse([''])).toThrow(); // Empty strings not allowed
  });

  test('should extend schemas using ES2023 arrow function', () => {
    const baseSchema = compositeSchemas.metadata;
    const extendedSchema = extendSchema(baseSchema, {
      category: commonSchemas.title,
      tags: commonSchemas.tagArray,
    });

    const validExtended = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test Title',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      category: 'Test Category',
      tags: ['tag1', 'tag2'],
    };

    expect(() => extendedSchema.parse(validExtended)).not.toThrow();
  });

  test('should have consistent enum values', () => {
    // Test enum parsing instead of internal structure
    expect(() => commonSchemas.sortOrder.parse('asc')).not.toThrow();
    expect(() => commonSchemas.sortOrder.parse('desc')).not.toThrow();
    expect(() => commonSchemas.sortOrder.parse('invalid')).toThrow();

    expect(() => commonSchemas.status.parse('active')).not.toThrow();
    expect(() => commonSchemas.status.parse('inactive')).not.toThrow();
    expect(() => commonSchemas.status.parse('pending')).not.toThrow();

    expect(() => commonSchemas.priority.parse('low')).not.toThrow();
    expect(() => commonSchemas.priority.parse('high')).not.toThrow();
  });

  test('should have reasonable defaults', () => {
    const temperatureResult = commonSchemas.temperature.parse(undefined);
    expect(temperatureResult).toBe(0.7);

    const limitResult = commonSchemas.limit.parse(undefined);
    expect(limitResult).toBe(10);

    const offsetResult = commonSchemas.offset.parse(undefined);
    expect(offsetResult).toBe(0);

    const pageResult = commonSchemas.page.parse(undefined);
    expect(pageResult).toBe(1);

    const sortOrderResult = commonSchemas.sortOrder.parse(undefined);
    expect(sortOrderResult).toBe('asc');
  });

  test('should validate specialized patterns correctly', () => {
    // Hex color validation
    expect(() => commonSchemas.hexColor.parse('#FF0000')).not.toThrow();
    expect(() => commonSchemas.hexColor.parse('#fff')).not.toThrow();
    expect(() => commonSchemas.hexColor.parse('red')).toThrow();

    // Phone number validation
    expect(() => commonSchemas.phoneNumber.parse('+1-555-123-4567')).not.toThrow();
    expect(() => commonSchemas.phoneNumber.parse('555 123 4567')).not.toThrow();
    expect(() => commonSchemas.phoneNumber.parse('abc')).toThrow();

    // Language code validation
    expect(() => commonSchemas.language.parse('en')).not.toThrow();
    expect(() => commonSchemas.language.parse('en-US')).not.toThrow();
    expect(() => commonSchemas.language.parse('invalid-lang-code')).toThrow();

    // Currency code validation
    expect(() => commonSchemas.currency.parse('USD')).not.toThrow();
    expect(() => commonSchemas.currency.parse('EUR')).not.toThrow();
    expect(() => commonSchemas.currency.parse('US')).toThrow(); // Must be 3 chars
  });
});
