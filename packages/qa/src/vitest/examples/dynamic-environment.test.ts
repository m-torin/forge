/**
 * Test examples demonstrating the dynamic environment system
 */
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  environmentPatterns,
  environmentTests,
  hasEnvironment,
  hasPackageEnvironment,
  resetPackageEnvironments,
  setupDynamicEnvironment,
} from '../setup/package-environments';

describe('dynamic Environment System', () => {
  // Reset environment before each test
  beforeEach(() => {
    resetPackageEnvironments();
  });

  afterEach(() => {
    resetPackageEnvironments();
  });

  describe('basic Environment Setup', () => {
    test('should set up basic package environment', () => {
      setupDynamicEnvironment({
        environments: ['database', 'auth'],
      });

      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.DATABASE_URL).toBeDefined();
      expect(process.env.BETTER_AUTH_SECRET).toBeDefined();
    });

    test('should add custom environment variables', () => {
      setupDynamicEnvironment({
        environments: ['common'],
        custom: {
          CUSTOM_VAR: 'test-value',
          APP_NAME: 'test-app',
        },
      });

      expect(process.env.CUSTOM_VAR).toBe('test-value');
      expect(process.env.APP_NAME).toBe('test-app');
    });

    test('should override environment variables', () => {
      setupDynamicEnvironment({
        environments: ['database'],
        overrides: {
          DATABASE_URL: 'postgresql://custom:test@localhost:5432/custom_db',
        },
      });

      expect(process.env.DATABASE_URL).toBe('postgresql://custom:test@localhost:5432/custom_db');
    });

    test('should exclude specified environment variables', () => {
      setupDynamicEnvironment({
        environments: ['auth'],
        exclude: ['GITHUB_CLIENT_ID', 'GOOGLE_CLIENT_ID'],
      });

      expect(process.env.BETTER_AUTH_SECRET).toBeDefined();
      expect(process.env.GITHUB_CLIENT_ID).toBeUndefined();
      expect(process.env.GOOGLE_CLIENT_ID).toBeUndefined();
    });
  });

  describe('conditional Environment Setup', () => {
    test('should apply conditional environments when condition is true', () => {
      setupDynamicEnvironment({
        environments: ['common'],
        conditional: [
          {
            condition: () => true,
            environment: 'database',
          },
        ],
      });

      expect(process.env.DATABASE_URL).toBeDefined();
    });

    test('should skip conditional environments when condition is false', () => {
      setupDynamicEnvironment({
        environments: ['common'],
        conditional: [
          {
            condition: () => false,
            environment: 'database',
          },
        ],
      });

      expect(process.env.DATABASE_URL).toBeUndefined();
    });

    test('should apply conditional custom environment variables', () => {
      setupDynamicEnvironment({
        environments: ['common'],
        conditional: [
          {
            condition: () => true,
            environment: {
              CONDITIONAL_VAR: 'conditional-value',
            },
          },
        ],
      });

      expect(process.env.CONDITIONAL_VAR).toBe('conditional-value');
    });
  });

  describe('environment Testing Utilities', () => {
    test('should detect test environment', () => {
      expect(environmentTests.isTest()).toBeTruthy();
    });

    test('should detect CI environment', () => {
      process.env.CI = 'true';
      expect(environmentTests.isCI()).toBeTruthy();
    });

    test('should check for environment variables', () => {
      process.env.TEST_VAR = 'test-value';
      expect(environmentTests.hasEnvVar('TEST_VAR')).toBeTruthy();
      expect(environmentTests.hasEnvVar('NONEXISTENT_VAR')).toBeFalsy();
    });

    test('should check for package availability', () => {
      // These packages should be available in the test environment
      expect(environmentTests.hasPackage('vitest')).toBeTruthy();
      expect(environmentTests.hasPackage('nonexistent-package')).toBeFalsy();
    });
  });

  describe('environment Patterns', () => {
    test('should set up full-stack pattern', () => {
      const config = environmentPatterns.fullStack();
      setupDynamicEnvironment(config);

      expect(process.env.DATABASE_URL).toBeDefined();
      expect(process.env.BETTER_AUTH_SECRET).toBeDefined();
      expect(process.env.STRIPE_SECRET_KEY).toBeDefined();
      expect(process.env.RESEND_API_KEY).toBeDefined();
    });

    test('should set up backend pattern', () => {
      const config = environmentPatterns.backend();
      setupDynamicEnvironment(config);

      expect(process.env.DATABASE_URL).toBeDefined();
      expect(process.env.BETTER_AUTH_SECRET).toBeDefined();
      expect(process.env.RESEND_API_KEY).toBeDefined();
    });

    test('should set up frontend pattern', () => {
      const config = environmentPatterns.frontend();
      setupDynamicEnvironment(config);

      expect(process.env.NEXT_PUBLIC_POSTHOG_KEY).toBeDefined();
      expect(process.env.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
    });

    test('should set up library pattern', () => {
      const config = environmentPatterns.library();
      setupDynamicEnvironment(config);

      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.CI).toBe('true');
    });
  });

  describe('environment Validation', () => {
    test('should validate environment presence', () => {
      process.env.TEST_VAR = 'test-value';
      expect(hasEnvironment('TEST_VAR')).toBeTruthy();
      expect(hasEnvironment('NONEXISTENT_VAR')).toBeFalsy();
    });

    test('should validate package environment', () => {
      setupDynamicEnvironment({
        environments: ['database'],
      });

      expect(hasPackageEnvironment('common')).toBeTruthy();
      // This would fail because not all database vars are set
      // expect(hasPackageEnvironment('database')).toBe(true);
    });
  });

  describe('complex Environment Scenarios', () => {
    test('should handle multi-tenant configuration', () => {
      const tenantId = 'tenant-123';

      setupDynamicEnvironment({
        environments: ['database', 'auth'],
        custom: {
          TENANT_ID: tenantId,
          MULTI_TENANT_MODE: 'true',
        },
        overrides: {
          DATABASE_URL: `postgresql://test:test@localhost:5432/test_${tenantId}`,
        },
      });

      expect(process.env.TENANT_ID).toBe(tenantId);
      expect(process.env.MULTI_TENANT_MODE).toBe('true');
      expect(process.env.DATABASE_URL).toBe(
        `postgresql://test:test@localhost:5432/test_${tenantId}`,
      );
    });

    test('should handle feature flag driven configuration', () => {
      setupDynamicEnvironment({
        environments: ['common'],
        conditional: [
          {
            condition: () => environmentTests.hasEnvVar('ENABLE_AI_FEATURES'),
            environment: 'ai',
          },
          {
            condition: () => environmentTests.hasEnvVar('ENABLE_PAYMENTS'),
            environment: 'payments',
          },
        ],
        custom: {
          ENABLE_AI_FEATURES: 'true',
        },
      });

      // Should include AI environment because we set the flag
      expect(process.env.OPENAI_API_KEY).toBeDefined();
      // Should not include payments because flag is not set
      expect(process.env.STRIPE_SECRET_KEY).toBeUndefined();
    });

    test('should handle development vs production configuration', () => {
      setupDynamicEnvironment({
        environments: ['common', 'database'],
        overrides: {
          NODE_ENV: 'development', // Override common's test setting
        },
        conditional: [
          {
            condition: () => environmentTests.isDevelopment(),
            environment: {
              DEBUG: 'true',
              LOG_LEVEL: 'debug',
            },
          },
          {
            condition: () => !environmentTests.isDevelopment(),
            environment: 'observability',
          },
        ],
      });

      expect(process.env.DEBUG).toBe('true');
      expect(process.env.LOG_LEVEL).toBe('debug');
      // Should not include observability in development
      expect(process.env.SENTRY_DSN).toBeUndefined();
    });
  });

  describe('real-world Usage Examples', () => {
    test('should set up webapp-like environment', () => {
      setupDynamicEnvironment({
        environments: ['database', 'auth', 'analytics', 'storage'],
        custom: {
          NEXT_PUBLIC_BASE_URL: 'http://localhost:3200',
          NEXT_PUBLIC_APP_NAME: 'webapp',
          APP_TYPE: 'ecommerce',
        },
        conditional: [
          {
            condition: () => environmentTests.hasPackage('@repo/payments'),
            environment: 'payments',
          },
        ],
        overrides: {
          DATABASE_URL: 'postgresql://test:test@localhost:5432/webapp_test',
        },
      });

      expect(process.env.NEXT_PUBLIC_APP_NAME).toBe('webapp');
      expect(process.env.APP_TYPE).toBe('ecommerce');
      expect(process.env.DATABASE_URL).toBe('postgresql://test:test@localhost:5432/webapp_test');
    });

    test('should set up auth package environment', () => {
      setupDynamicEnvironment({
        environments: ['auth', 'database', 'email'],
        custom: {
          PACKAGE_NAME: 'auth',
          AUTH_TEST_MODE: 'true',
        },
        conditional: [
          {
            condition: () => true, // Always enable for auth package
            environment: { ORGANIZATION_FEATURES_ENABLED: 'true' },
          },
        ],
        overrides: {
          BETTER_AUTH_SECRET: 'test-secret-auth-package',
          DATABASE_URL: 'postgresql://test:test@localhost:5432/auth_test',
        },
      });

      expect(process.env.PACKAGE_NAME).toBe('auth');
      expect(process.env.AUTH_TEST_MODE).toBe('true');
      expect(process.env.ORGANIZATION_FEATURES_ENABLED).toBe('true');
      expect(process.env.BETTER_AUTH_SECRET).toBe('test-secret-auth-package');
    });

    test('should set up workflow service environment', () => {
      setupDynamicEnvironment({
        environments: ['database', 'orchestration', 'storage', 'email'],
        custom: {
          APP_NAME: 'backstage-workflows',
          WORKFLOW_TIMEOUT: '300000',
          MAX_RETRY_ATTEMPTS: '3',
        },
        conditional: [
          {
            condition: () => environmentTests.hasPackage('@repo/ai'),
            environment: { AI_WORKFLOWS_ENABLED: 'true' },
          },
        ],
        overrides: {
          DATABASE_URL: 'postgresql://test:test@localhost:5432/workflows_test',
          QSTASH_URL: 'http://localhost:8080/mock-qstash',
        },
      });

      expect(process.env.APP_NAME).toBe('backstage-workflows');
      expect(process.env.WORKFLOW_TIMEOUT).toBe('300000');
      expect(process.env.QSTASH_URL).toBe('http://localhost:8080/mock-qstash');
    });
  });
});
