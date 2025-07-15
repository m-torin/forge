import { faker } from '@faker-js/faker';
import { type Page } from '@playwright/test';

/**
 * Test data generation utilities
 */
export class TestDataGenerator {
  /**
   * Generate a unique test email
   */
  static email(prefix = 'test'): string {
    return `${prefix}-${Date.now()}-${faker.string.alphanumeric(5)}@example.com`;
  }

  /**
   * Generate a test user
   */
  static user() {
    return {
      email: this.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: 'Test123!@#',
      phone: faker.phone.number(),
    };
  }

  /**
   * Generate test organization
   */
  static organization() {
    return {
      name: `Test Org ${faker.company.name()}`,
      description: faker.company.catchPhrase(),
      slug: `test-org-${faker.string.alphanumeric(8)}`,
    };
  }

  /**
   * Generate test product
   */
  static product() {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
    };
  }

  /**
   * Generate test API key
   */
  static apiKey() {
    return `sk_test_${faker.string.alphanumeric(32)}`;
  }
}

/**
 * Database seeding utilities for tests
 */
export class TestDataSeeder {
  constructor(private readonly apiUrl: string) {}

  /**
   * Seed test users
   */
  async seedUsers(count = 1): Promise<any[]> {
    const users = [];
    for (let i = 0; i < count; i++) {
      const userData = TestDataGenerator.user();
      // This would make an API call to create the user
      // Implementation depends on your API
      users.push(userData);
    }
    return users;
  }

  /**
   * Clean up test data
   */
  async cleanup(prefix = 'test-') {
    // This would clean up test data based on naming convention
    console.log(`Cleaning up test data with prefix: ${prefix}`);
  }
}

/**
 * Environment data utilities for tests
 */
export class EnvironmentData {
  /**
   * Get API URL from environment
   */
  static getApiUrl(): string {
    return process.env.API_URL || 'http://localhost:3000';
  }

  /**
   * Get test user credentials
   */
  static getTestUser() {
    return {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'Test123!@#',
    };
  }

  /**
   * Get test API key
   */
  static getTestApiKey(): string {
    return process.env.TEST_API_KEY || 'test-api-key';
  }

  /**
   * Check if running in CI environment
   */
  static isCI(): boolean {
    return process.env.CI === 'true';
  }

  /**
   * Get test organization ID
   */
  static getTestOrgId(): string | undefined {
    return process.env.TEST_ORG_ID;
  }
}

/**
 * Local storage and cookie utilities
 */
export class StorageUtils {
  constructor(private readonly page: Page) {}

  /**
   * Set local storage item
   */
  async setLocalStorage(key: string, value: any) {
    await this.page.evaluate(
      ([k, v]) => {
        localStorage.setItem(k, JSON.stringify(v));
      },
      [key, value],
    );
  }

  /**
   * Get local storage item
   */
  async getLocalStorage<T>(key: string): Promise<T | null> {
    return this.page.evaluate(k => {
      const item = localStorage.getItem(k);
      return item ? JSON.parse(item) : null;
    }, key);
  }

  /**
   * Clear local storage
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * Set cookie
   */
  async setCookie(name: string, value: string, options?: any) {
    await this.page.context().addCookies([
      {
        name,
        domain: new URL(this.page.url()).hostname,
        path: '/',
        value,
        ...options,
      },
    ]);
  }

  /**
   * Get cookie
   */
  async getCookie(name: string) {
    const cookies = await this.page.context().cookies();
    return cookies.find(c => c.name === name);
  }

  /**
   * Clear all cookies
   */
  async clearCookies() {
    await this.page.context().clearCookies();
  }
}

/**
 * Test fixtures for common test data
 */
export const testFixtures = {
  /**
   * Valid test credentials
   */
  validUser: {
    email: 'test@example.com',
    password: 'Test123!@#',
  },

  /**
   * Invalid test credentials
   */
  invalidUser: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },

  /**
   * Test organization
   */
  testOrganization: {
    name: 'Test Organization',
    slug: 'test-org',
  },

  /**
   * Test API responses
   */
  apiResponses: {
    error: { message: 'Operation failed', status: 'error' },
    success: { message: 'Operation completed', status: 'success' },
    unauthorized: { message: 'Unauthorized', status: 'error' },
  },
};
