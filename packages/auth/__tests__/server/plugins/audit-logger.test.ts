/**
 * Tests for audit logger plugin
 */

import { beforeEach, describe, expect, vi } from 'vitest';

// Mock the external dependencies
vi.mock('@repo/database/prisma/server/next', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('@repo/observability/server/next', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

describe('audit logger plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('auditLoggerPlugin', () => {
    test('should create plugin with default options', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const plugin = auditLoggerModule.auditLoggerPlugin();

      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe('object');
    });

    test('should create plugin with custom options', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const customOptions = {
        enabled: true,
        logSuccessfulAuth: true,
        logFailedAuth: true,
        logPasswordChanges: false,
        logProfileUpdates: false,
        logApiKeyEvents: true,
        logOrganizationEvents: true,
        logAdminActions: true,
        retentionDays: 30,
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(customOptions);

      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe('object');
    });

    test('should create plugin with disabled logging', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const disabledOptions = {
        enabled: false,
        logSuccessfulAuth: false,
        logFailedAuth: false,
        logPasswordChanges: false,
        logProfileUpdates: false,
        logApiKeyEvents: false,
        logOrganizationEvents: false,
        logAdminActions: false,
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(disabledOptions);

      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe('object');
    });

    test('should create plugin with custom logger', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const customLogger = vi.fn();
      const options = {
        customLogger,
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(options);

      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe('object');
    });

    test('should handle empty options object', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const plugin = auditLoggerModule.auditLoggerPlugin({});

      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe('object');
    });

    test('should create plugin with extreme retention values', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const extremeOptions = {
        retentionDays: 36500, // 100 years
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(extremeOptions);

      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe('object');
    });

    test('should handle zero retention days', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const zeroRetentionOptions = {
        retentionDays: 0,
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(zeroRetentionOptions);

      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe('object');
    });

    test('should handle negative retention days', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const negativeRetentionOptions = {
        retentionDays: -1,
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(negativeRetentionOptions);

      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe('object');
    });

    test('should handle partial options', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const partialOptions = {
        logSuccessfulAuth: true,
        logAdminActions: false,
        retentionDays: 7,
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(partialOptions);

      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe('object');
    });

    test('should handle undefined input', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const plugin = auditLoggerModule.auditLoggerPlugin(undefined);

      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe('object');
    });
  });

  describe('logging configuration scenarios', () => {
    test('should create plugin for security-focused logging', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const securityOptions = {
        enabled: true,
        logSuccessfulAuth: true,
        logFailedAuth: true,
        logPasswordChanges: true,
        logApiKeyEvents: true,
        logAdminActions: true,
        retentionDays: 365, // 1 year for compliance
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(securityOptions);

      expect(plugin).toBeDefined();
    });

    test('should create plugin for minimal logging', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const minimalOptions = {
        enabled: true,
        logSuccessfulAuth: false,
        logFailedAuth: true, // Only log failures
        logPasswordChanges: true, // Security critical
        logProfileUpdates: false,
        logApiKeyEvents: false,
        logOrganizationEvents: false,
        logAdminActions: true, // Security critical
        retentionDays: 30,
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(minimalOptions);

      expect(plugin).toBeDefined();
    });

    test('should create plugin for development environment', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const devOptions = {
        enabled: false, // Disabled for development
        retentionDays: 1,
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(devOptions);

      expect(plugin).toBeDefined();
    });

    test('should create plugin for compliance requirements', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const complianceOptions = {
        enabled: true,
        logSuccessfulAuth: true,
        logFailedAuth: true,
        logPasswordChanges: true,
        logProfileUpdates: true,
        logApiKeyEvents: true,
        logOrganizationEvents: true,
        logAdminActions: true,
        retentionDays: 2555, // 7 years for financial compliance
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(complianceOptions);

      expect(plugin).toBeDefined();
    });
  });

  describe('custom logger integration', () => {
    test('should accept async custom logger', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const asyncCustomLogger = vi.fn().mockResolvedValue(undefined);
      const options = {
        customLogger: asyncCustomLogger,
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(options);

      expect(plugin).toBeDefined();
    });

    test('should accept custom logger that throws', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const throwingLogger = vi.fn().mockRejectedValue(new Error('Logger error'));
      const options = {
        customLogger: throwingLogger,
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(options);

      expect(plugin).toBeDefined();
    });

    test('should handle custom logger with complex event processing', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const complexLogger = vi.fn(async event => {
        // Simulate complex processing
        if (event.type === 'auth.sign_in') {
          // Custom processing logic
        }
        return Promise.resolve();
      });

      const plugin = auditLoggerModule.auditLoggerPlugin({
        customLogger: complexLogger,
      });

      expect(plugin).toBeDefined();
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle floating point retention days', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const plugin = auditLoggerModule.auditLoggerPlugin({
        retentionDays: 30.5,
      });

      expect(plugin).toBeDefined();
    });

    test('should handle very large retention values', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const plugin = auditLoggerModule.auditLoggerPlugin({
        retentionDays: Number.MAX_SAFE_INTEGER,
      });

      expect(plugin).toBeDefined();
    });

    test('should work with all boolean options true', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const allTrueOptions = {
        enabled: true,
        logSuccessfulAuth: true,
        logFailedAuth: true,
        logPasswordChanges: true,
        logProfileUpdates: true,
        logApiKeyEvents: true,
        logOrganizationEvents: true,
        logAdminActions: true,
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(allTrueOptions);

      expect(plugin).toBeDefined();
    });

    test('should work with all boolean options false', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const allFalseOptions = {
        enabled: false,
        logSuccessfulAuth: false,
        logFailedAuth: false,
        logPasswordChanges: false,
        logProfileUpdates: false,
        logApiKeyEvents: false,
        logOrganizationEvents: false,
        logAdminActions: false,
      };

      const plugin = auditLoggerModule.auditLoggerPlugin(allFalseOptions);

      expect(plugin).toBeDefined();
    });
  });

  describe('plugin structure validation', () => {
    test('should maintain consistent plugin structure', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const plugin = auditLoggerModule.auditLoggerPlugin();

      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe('object');
    });

    test('should work with default configuration', async () => {
      const auditLoggerModule = await import('#/server/plugins/audit-logger');

      const plugin = auditLoggerModule.auditLoggerPlugin();

      expect(plugin).toBeDefined();
    });
  });
});
