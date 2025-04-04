/**
 * MockRegistry
 * 
 * A global registry for managing mock values in tests.
 * This allows tests to override default values temporarily and ensures
 * consistent mock values across the test suite.
 */

import { exampleEnvVars } from '../env/core/values.ts';

// Default values from the existing example environment variables
const defaultValues: Record<string, any> = {
  // Authentication
  CLERK_SECRET_KEY: exampleEnvVars.CLERK_SECRET_KEY,
  CLERK_PUBLISHABLE_KEY: exampleEnvVars.CLERK_PUBLISHABLE_KEY,

  // Database
  DATABASE_URL: exampleEnvVars.DATABASE_URL,

  // Email
  RESEND_API_KEY: exampleEnvVars.RESEND_API_KEY,

  // Analytics
  GOOGLE_ANALYTICS_ID: exampleEnvVars.GOOGLE_ANALYTICS_ID,
  POSTHOG_API_KEY: exampleEnvVars.POSTHOG_API_KEY,

  // Payments
  STRIPE_SECRET_KEY: exampleEnvVars.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: exampleEnvVars.STRIPE_WEBHOOK_SECRET,

  // Feature flags
  FEATURE_FLAGS_API_KEY: exampleEnvVars.FEATURE_FLAGS_API_KEY,
};

/**
 * MockRegistry class for managing mock values in tests
 * 
 * This is implemented as a singleton to ensure consistent values across tests.
 */
export class MockRegistry {
  private static instance: MockRegistry;
  private values: Record<string, any> = { ...defaultValues };
  private originalValues: Record<string, any> = {};

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of MockRegistry
   */
  public static getInstance(): MockRegistry {
    if (!MockRegistry.instance) {
      MockRegistry.instance = new MockRegistry();
    }
    return MockRegistry.instance;
  }

  /**
   * Get a mock value by key
   * @param key The key to get
   * @returns The mock value
   */
  public get<T>(key: string): T {
    return this.values[key] as T;
  }

  /**
   * Set a mock value
   * @param key The key to set
   * @param value The value to set
   */
  public set<T>(key: string, value: T): void {
    this.values[key] = value;
  }

  /**
   * Override mock values temporarily for a callback
   * @param overrides The values to override
   * @param callback The callback to execute with overridden values
   */
  public override(overrides: Record<string, any>, callback: () => void): void {
    // Save original values
    this.originalValues = { ...this.values };
    
    // Apply overrides
    Object.entries(overrides).forEach(([key, value]) => {
      this.values[key] = value;
    });

    try {
      // Execute callback with overridden values
      callback();
    } finally {
      // Restore original values
      this.values = { ...this.originalValues };
    }
  }

  /**
   * Reset all mock values to defaults
   */
  public reset(): void {
    this.values = { ...defaultValues };
  }

  /**
   * Get all mock values
   * @returns All mock values
   */
  public getAll(): Record<string, any> {
    return { ...this.values };
  }

  /**
   * Set multiple mock values at once
   * @param values The values to set
   */
  public setAll(values: Record<string, any>): void {
    this.values = { ...this.values, ...values };
  }
}

// Export a singleton instance
export const mockRegistry = MockRegistry.getInstance();
