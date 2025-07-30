/**
 * Migrated generate-users tests demonstrating the refactoring process
 *
 * This shows how a real existing test file can be migrated to use:
 * - Enhanced test utilities from QA package
 * - Standardized test patterns
 * - Reduced boilerplate code
 * - Better data validation utilities
 */

import {
  generateCustomerProfile,
  generateUser,
  generateUserAddress,
} from '#/prisma/src/seed/generators/generate-users';
import { environmentUtils, testCasePatterns, testDataGenerators } from '@repo/qa/src/vitest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('generate-users (migrated)', () => {
  let restoreEnv: () => void;

  beforeEach(() => {
    // Use environment utilities for consistent test conditions
    restoreEnv = environmentUtils.mockRandom(0.5);
  });

  afterEach(() => {
    restoreEnv();
  });

  describe('generateUser', () => {
    /**
     * Standard data structure validation using utilities
     */
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

    /**
     * Uniqueness validation using standardized pattern
     */
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

    /**
     * Edge cases using test pattern utilities
     */
    it(testCasePatterns.edgeCases.name, () => {
      // Generate multiple users to test consistency
      const users = Array.from({ length: 10 }, () => generateUser());

      users.forEach(user => {
        // Email validation
        expect(user.email).toBeTruthy();
        expect(user.email.length).toBeGreaterThan(5);
        expect(user.email.length).toBeLessThan(100);

        // Name validation
        expect(user.name).toBeTruthy();
        expect(user.name.length).toBeGreaterThan(2);
        expect(user.name.length).toBeLessThan(100);

        // ID validation
        expect(user.id).toBeTruthy();
        expect(typeof user.id).toBe('string');

        // Date validation
        expect(user.createdAt.getTime()).toBeGreaterThan(0);
        expect(user.updatedAt.getTime()).toBeGreaterThan(0);
        expect(user.emailVerified.getTime()).toBeGreaterThan(0);
      });
    });

    /**
     * Data consistency validation
     */
    it('maintains data consistency across generations', () => {
      const user = generateUser();

      // EmailVerified should be before or equal to createdAt
      expect(user.emailVerified.getTime()).toBeLessThanOrEqual(user.createdAt.getTime());

      // UpdatedAt should be greater than or equal to createdAt
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(user.createdAt.getTime());
    });
  });

  describe('generateUserAddress', () => {
    const testUserId = 'user-123';

    /**
     * Data structure validation
     */
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

    /**
     * Address format validation
     */
    it('generates valid address formats', () => {
      const address = generateUserAddress(testUserId);

      // Phone format validation (US phone patterns)
      expect(address.phone).toMatch(/^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/);

      // Postal code validation (US ZIP)
      expect(address.postalCode).toMatch(/^\d{5}(-\d{4})?$/);

      // State validation (2-letter state code)
      expect(address.state).toMatch(/^[A-Z]{2}$/);

      // Name validation
      expect(address.firstName).toMatch(/^[A-Za-z\s'-]+$/);
      expect(address.lastName).toMatch(/^[A-Za-z\s'-]+$/);
    });

    /**
     * Uniqueness validation
     */
    it('generates different addresses for same user', () => {
      const addresses = Array.from({ length: 5 }, () => generateUserAddress(testUserId));

      // Should have variety in addresses
      const streets = addresses.map(a => a.street1);
      const cities = addresses.map(a => a.city);

      // At least 80% should be unique (allowing for some faker.js collisions)
      expect(new Set(streets).size).toBeGreaterThanOrEqual(Math.floor(streets.length * 0.8));
      expect(new Set(cities).size).toBeGreaterThanOrEqual(Math.floor(cities.length * 0.8));
    });

    /**
     * Relationship validation
     */
    it('maintains correct user relationship', () => {
      const address = generateUserAddress(testUserId);

      expect(address.user).toStrictEqual({ connect: { id: testUserId } });
    });

    /**
     * Address type validation
     */
    it('generates valid address types', () => {
      const addresses = Array.from({ length: 10 }, () => generateUserAddress(testUserId));
      const types = addresses.map(a => a.type);

      // Should only contain valid address types
      const validTypes = ['home', 'work', 'billing', 'shipping'];
      types.forEach(type => {
        expect(validTypes).toContain(type.toLowerCase());
      });
    });
  });

  describe('generateCustomerProfile', () => {
    /**
     * Use test data generator for consistent user input
     */
    const testUser = testDataGenerators.generateUser({
      id: 'user-123',
      email: 'test@example.com',
    });

    /**
     * Data structure validation
     */
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

    /**
     * Business logic validation
     */
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
    });

    /**
     * Preferences validation
     */
    it('generates valid preference settings', () => {
      const profile = generateCustomerProfile(testUser);

      // All preferences should be boolean
      expect(typeof profile.preferences.newsletter).toBe('boolean');
      expect(typeof profile.preferences.smsAlerts).toBe('boolean');
      expect(typeof profile.preferences.productRecommendations).toBe('boolean');
    });

    /**
     * Data consistency validation
     */
    it('maintains data consistency', () => {
      const profile = generateCustomerProfile(testUser);

      // Average order value should be reasonable compared to total spent and orders
      if (profile.stats.totalOrders > 0) {
        const calculatedAverage = profile.stats.totalSpent / profile.stats.totalOrders;
        // Allow some variance for randomization
        expect(Math.abs(profile.stats.averageOrderValue - calculatedAverage)).toBeLessThan(50);
      }

      // Last order date should be in the past
      expect(profile.stats.lastOrderDate.getTime()).toBeLessThan(Date.now());
    });

    /**
     * Tier correlation validation
     */
    it('correlates tier with loyalty points appropriately', () => {
      // Generate multiple profiles to test tier distribution
      const profiles = Array.from({ length: 20 }, () => generateCustomerProfile(testUser));

      profiles.forEach(profile => {
        const { tier, loyaltyPoints } = profile;

        // Basic tier-points correlation (this depends on business logic)
        if (tier === 'Platinum') {
          expect(loyaltyPoints).toBeGreaterThan(1000);
        } else if (tier === 'Gold') {
          expect(loyaltyPoints).toBeGreaterThan(500);
        }
        // Bronze and Silver can have any point range
      });
    });

    /**
     * Statistical distribution validation
     */
    it('generates diverse customer profiles', () => {
      const profiles = Array.from({ length: 50 }, () => generateCustomerProfile(testUser));

      // Check tier distribution
      const tierCounts = profiles.reduce(
        (acc, p) => {
          acc[p.tier] = (acc[p.tier] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Should have at least 2 different tiers in 50 generations
      expect(Object.keys(tierCounts).length).toBeGreaterThanOrEqual(2);

      // Check preference variation
      const newsletterTrue = profiles.filter(p => p.preferences.newsletter).length;
      const newsletterFalse = profiles.length - newsletterTrue;

      // Should have some variation (not all true or all false)
      expect(newsletterTrue).toBeGreaterThan(0);
      expect(newsletterFalse).toBeGreaterThan(0);
    });
  });

  /**
   * Integration test to ensure all generators work together
   */
  describe('integration', () => {
    it('generates complete user ecosystem', () => {
      const user = generateUser();
      const address = generateUserAddress(user.id);
      const profile = generateCustomerProfile(user);

      // Verify relationships
      expect(address.user.connect.id).toBe(user.id);

      // Verify all components are valid
      expect(user.email).toBeTruthy();
      expect(address.street1).toBeTruthy();
      expect(profile.tier).toBeTruthy();

      // Verify data types
      expect(typeof user.id).toBe('string');
      expect(typeof address.postalCode).toBe('string');
      expect(typeof profile.loyaltyPoints).toBe('number');
    });
  });
});
