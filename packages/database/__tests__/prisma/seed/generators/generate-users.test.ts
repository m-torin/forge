import {
  generateCustomerProfile,
  generateUser,
  generateUserAddress,
} from '#/prisma/src/seed/generators/generate-users';
import { environmentUtils, testCasePatterns, testDataGenerators } from '@repo/qa/vitest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('generate-users', () => {
  let restoreEnv: () => void;

  beforeEach(() => {
    // Use environment utilities for consistent test conditions
    restoreEnv = environmentUtils.mockRandom(0.5);
  });

  afterEach(() => {
    restoreEnv();
  });

  describe('generateUser', () => {
    it(testCasePatterns.dataStructure.name, () => {
      const result = generateUser();

      // Use utility patterns for common validations
      const requiredFields = ['email', 'name', 'id', 'emailVerified', 'createdAt', 'updatedAt'];
      requiredFields.forEach(field => {
        expect(result).toHaveProperty(field);
        expect(result[field]).toBeDefined();
      });

      // Specific format validations
      expect(result.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(result.name).toMatch(/\w+\s+\w+/); // First and last name
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('generates unique users on multiple calls', () => {
      const users = Array.from({ length: 5 }, () => generateUser());

      // Check uniqueness for key fields
      const emails = users.map(u => u.email);
      const names = users.map(u => u.name);
      const ids = users.map(u => u.id);

      expect(new Set(emails).size).toBe(emails.length);
      expect(new Set(names).size).toBe(names.length);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('generateUserAddress', () => {
    const testUserId = 'user-123';

    it(testCasePatterns.dataStructure.name, () => {
      const result = generateUserAddress(testUserId);

      const requiredFields = [
        'type',
        'firstName',
        'lastName',
        'street1',
        'city',
        'state',
        'country',
        'postalCode',
        'phone',
        'user',
      ];

      requiredFields.forEach(field => {
        expect(result).toHaveProperty(field);
        expect(result[field]).toBeDefined();
      });

      // Specific validations
      expect(result.country).toBe('US');
      expect(result.user).toStrictEqual({ connect: { id: testUserId } });
    });

    it('generates different addresses for same user', () => {
      const addresses = Array.from({ length: 5 }, () => generateUserAddress(testUserId));

      // Should have variety in addresses
      const streets = addresses.map(a => a.street1);
      const cities = addresses.map(a => a.city);

      // At least 80% should be unique (allowing for some faker.js collisions)
      expect(new Set(streets).size).toBeGreaterThanOrEqual(Math.floor(streets.length * 0.8));
      expect(new Set(cities).size).toBeGreaterThanOrEqual(Math.floor(cities.length * 0.8));
    });
  });

  describe('generateCustomerProfile', () => {
    // Use test data generator for consistent user input
    const testUser = testDataGenerators.generateUser({
      id: 'user-123',
      email: 'test@example.com',
    });

    it(testCasePatterns.dataStructure.name, () => {
      const result = generateCustomerProfile(testUser);

      // Main properties
      expect(result).toHaveProperty('loyaltyPoints');
      expect(result).toHaveProperty('tier');
      expect(result).toHaveProperty('preferences');
      expect(result).toHaveProperty('stats');

      // Preferences structure
      expect(result.preferences).toHaveProperty('newsletter');
      expect(result.preferences).toHaveProperty('smsAlerts');
      expect(result.preferences).toHaveProperty('productRecommendations');

      // Stats structure
      expect(result.stats).toHaveProperty('totalOrders');
      expect(result.stats).toHaveProperty('totalSpent');
      expect(result.stats).toHaveProperty('averageOrderValue');
      expect(result.stats).toHaveProperty('lastOrderDate');
    });

    it('generates valid business data ranges', () => {
      const profile = generateCustomerProfile(testUser);

      // Loyalty points validation
      expect(profile.loyaltyPoints).toBeGreaterThanOrEqual(0);
      expect(profile.loyaltyPoints).toBeLessThanOrEqual(5000);

      // Tier validation
      const validTiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
      expect(validTiers).toContain(profile.tier);

      // Stats validation
      expect(profile.stats.totalOrders).toBeGreaterThanOrEqual(0);
      expect(profile.stats.totalSpent).toBeGreaterThanOrEqual(0);
      expect(profile.stats.averageOrderValue).toBeGreaterThanOrEqual(50);
      expect(profile.stats.lastOrderDate).toBeInstanceOf(Date);

      // All preferences should be boolean
      expect(typeof profile.preferences.newsletter).toBe('boolean');
      expect(typeof profile.preferences.smsAlerts).toBe('boolean');
      expect(typeof profile.preferences.productRecommendations).toBe('boolean');
    });
  });
});
