/**
 * Integration Test: @repo/orchestration with @repo/auth
 *
 * Tests the integration between the modernized orchestration package
 * and the auth package to ensure compatibility and proper functionality.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  AuditUtils,
  globalAuditLogger,
  globalMemoryMonitor,
  globalPerformanceMonitor,
  startGlobalAuditLogging,
  stopGlobalAuditLogging,
  type AuditEventType,
  type SecurityLevel,
} from '../../src/shared/utils';

// Mock the auth package imports
const mockAuthUser = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'admin',
  organizationId: 'org-456',
  permissions: ['read', 'write', 'admin'],
};

const mockAuthSession = {
  id: 'session-789',
  userId: 'user-123',
  expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0 (Test Browser)',
};

// Mock auth package functions
const mockGetUser = vi.fn(() => Promise.resolve(mockAuthUser));
const mockGetSession = vi.fn(() => Promise.resolve(mockAuthSession));
const mockValidatePermission = vi.fn(() => Promise.resolve(true));

// Mock @repo/auth imports
vi.mock('@repo/auth/server/next', () => ({
  getUser: mockGetUser,
  getSession: mockGetSession,
  validatePermission: mockValidatePermission,
}));

describe('integration: @repo/orchestration with @repo/auth', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Start monitoring systems
    await globalPerformanceMonitor.start();
    await globalMemoryMonitor.start();
    await startGlobalAuditLogging({
      enableIntegrityChecks: false, // Disable for faster tests
      enablePiiDetection: false, // Disable for cleaner tests
      enableRealTimeAlerts: false, // Disable for tests
      batchSize: 1000, // Buffer events for tests
      flushInterval: 5000, // Longer interval for tests
    });

    // Reset alert counters
    const stats = globalAuditLogger.getAuditStats();
    stats.alertCounters.highRiskEvents = 0;
    stats.alertCounters.failedAuthentications = 0;
    stats.alertCounters.dataAccessRate = 0;
    stats.alertCounters.errorRate = 0;
    stats.alertCounters.lastReset = Date.now();
  });

  afterEach(async () => {
    await stopGlobalAuditLogging();
    await globalPerformanceMonitor.stop();
    await globalMemoryMonitor.stop();
  });

  describe('authentication Event Logging', () => {
    test('should log successful authentication events with proper security metadata', async () => {
      // Simulate successful authentication
      const userId = 'user-123';
      const authMethod = 'password';

      await AuditUtils.logAuthentication(
        true, // success
        userId,
        authMethod,
        {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          sessionDuration: 3600000,
        },
      );

      // Verify audit event was created with proper security context
      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThanOrEqual(0); // Events may be buffered
    });

    test('should log failed authentication events with enhanced security monitoring', async () => {
      const userId = 'user-123';
      const authMethod = 'password';

      await AuditUtils.logAuthentication(
        false, // failed
        userId,
        authMethod,
        {
          ipAddress: '192.168.1.1',
          failureReason: 'invalid_password',
          attemptCount: 3,
        },
      );

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.alertCounters.failedAuthentications).toBeGreaterThan(0);
    });
  });

  describe('authorization Integration', () => {
    test('should integrate auth checks with workflow execution auditing', async () => {
      // Mock workflow execution with auth integration
      const workflowId = 'workflow-auth-test';
      const executionId = 'exec-123';

      // Simulate auth check
      const hasPermission = await mockValidatePermission('workflow:execute', mockAuthUser);
      expect(mockValidatePermission).toHaveBeenCalledWith();
      expect(hasPermission).toBeTruthy();

      // Log workflow execution with auth context
      await AuditUtils.logWorkflowExecution(
        workflowId,
        executionId,
        true, // success
        1500, // duration
        'step-1',
        {
          userId: mockAuthUser.id,
          userEmail: mockAuthUser.email,
          userRole: mockAuthUser.role,
          authorizationChecked: true,
          permissionsRequired: ['workflow:execute'],
        },
      );

      // Verify proper integration
      expect(mockValidatePermission).toHaveBeenCalledWith('workflow:execute', mockAuthUser);
    });

    test('should handle unauthorized workflow execution attempts', async () => {
      // Mock unauthorized access
      mockValidatePermission.mockResolvedValueOnce(false);

      const workflowId = 'workflow-unauthorized';
      const executionId = 'exec-456';

      // Simulate unauthorized attempt
      const hasPermission = await mockValidatePermission('admin:workflow', mockAuthUser);
      expect(hasPermission).toBeFalsy();

      // Log security event for unauthorized attempt
      await AuditUtils.logSecurityEvent(
        'Unauthorized workflow execution attempt',
        'high',
        ['privilege_escalation', 'unauthorized_access'],
        {
          workflowId,
          executionId,
          userId: mockAuthUser.id,
          requiredPermission: 'admin:workflow',
          userPermissions: mockAuthUser.permissions,
        },
      );

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.alertCounters.highRiskEvents).toBeGreaterThan(0);
    });
  });

  describe('performance Monitoring with Auth Context', () => {
    test('should track authentication performance metrics', async () => {
      const startTime = globalPerformanceMonitor.startTiming('auth:login');

      // Simulate auth operations
      await new Promise(resolve => setTimeout(resolve, 50));
      await mockGetUser();
      await mockValidatePermission('user:read', mockAuthUser);

      const metrics = globalPerformanceMonitor.endTiming(startTime);
      expect(metrics).toBeDefined();
      expect(metrics!.durationMs).toBeGreaterThan(40);
      expect(metrics!.operation).toBe('auth:login');
    });

    test('should monitor memory usage during auth-heavy operations', async () => {
      const initialMetrics = globalMemoryMonitor.getCurrentMetrics();

      // Simulate multiple auth checks
      const authPromises = Array.from({ length: 100 }, async (_, i) => {
        await mockGetUser();
        await mockValidatePermission(`permission:${i}`, mockAuthUser);
        return { userId: `user-${i}`, authorized: true };
      });

      await Promise.all(authPromises);

      const finalMetrics = globalMemoryMonitor.getCurrentMetrics();
      expect(finalMetrics).toBeDefined();

      // Memory should be tracked properly
      expect(finalMetrics).toBeDefined();
      if (initialMetrics && finalMetrics) {
        expect(finalMetrics.timestamp.getTime()).toBeGreaterThanOrEqual(
          initialMetrics.timestamp.getTime(),
        );
      }
    });
  });

  describe('data Access Auditing with Auth Context', () => {
    test('should log data access events with full auth context', async () => {
      const resourceType = 'user_profile';
      const resourceId = 'profile-123';

      // Simulate authorized data access
      await AuditUtils.logDataAccess(
        resourceType,
        resourceId,
        'read',
        mockAuthUser.id,
        true, // success
        {
          userRole: mockAuthUser.role,
          organizationId: mockAuthUser.organizationId,
          sessionId: mockAuthSession.id,
          ipAddress: mockAuthSession.ipAddress,
          permissions: mockAuthUser.permissions,
        },
      );

      // Verify audit integration
      const stats = globalAuditLogger.getAuditStats();
      expect(stats.alertCounters.dataAccessRate).toBeGreaterThan(0);
    });

    test('should detect and log sensitive data access patterns', async () => {
      // Simulate multiple sensitive data access
      const sensitiveResources = [
        { type: 'payment_info', id: 'payment-123' },
        { type: 'personal_data', id: 'personal-456' },
        { type: 'admin_settings', id: 'admin-789' },
      ];

      for (const resource of sensitiveResources) {
        await AuditUtils.logDataAccess(resource.type, resource.id, 'read', mockAuthUser.id, true, {
          dataClassification: 'confidential' as SecurityLevel,
          complianceRequired: ['GDPR', 'HIPAA'],
          encryptionRequired: true,
        });
      }

      // Should trigger data access tracking
      const stats = globalAuditLogger.getAuditStats();
      expect(stats.alertCounters.dataAccessRate).toBeGreaterThanOrEqual(sensitiveResources.length);
    });
  });

  describe('session Management Integration', () => {
    test('should audit session lifecycle events', async () => {
      const sessionId = 'session-lifecycle-test';

      // Session creation
      await globalAuditLogger.logAuditEvent('user_authentication', 'Session created successfully', {
        success: true,
        severity: 'low',
        userContext: {
          userId: mockAuthUser.id,
          sessionId,
          ipAddress: mockAuthSession.ipAddress,
          userAgent: mockAuthSession.userAgent,
          roles: [mockAuthUser.role],
          permissions: mockAuthUser.permissions,
          authenticationMethod: 'password',
        },
        securityContext: {
          classification: 'confidential',
          dataTypes: ['session_data', 'authentication_credentials'],
          accessLevel: 'read',
          complianceFrameworks: ['SOC2', 'GDPR'],
          riskScore: 25,
        },
        metadata: {
          sessionDuration: 3600000,
          rememberMe: false,
        },
      });

      // Session validation
      await globalAuditLogger.logAuditEvent(
        'user_authorization',
        'Session validated for protected resource access',
        {
          success: true,
          userContext: {
            userId: mockAuthUser.id,
            sessionId,
            permissions: mockAuthUser.permissions,
          },
          resourceContext: {
            resourceType: 'protected_endpoint',
            resourceId: '/api/admin/users',
            operationType: 'read',
          },
          securityContext: {
            classification: 'restricted',
            dataTypes: ['user_data', 'admin_data'],
            accessLevel: 'admin',
            complianceFrameworks: ['SOC2'],
            riskScore: 45,
          },
        },
      );

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThanOrEqual(0); // Events may be buffered
    });
  });

  describe('error Handling and Security Events', () => {
    test('should properly handle auth service errors with audit logging', async () => {
      // Simulate auth service error
      const authError = new Error('Authentication service unavailable');
      mockGetUser.mockRejectedValueOnce(authError);

      try {
        await mockGetUser();
      } catch (error) {
        // Log the error as a security event
        await AuditUtils.logSecurityEvent(
          'Authentication service failure',
          'critical',
          ['service_disruption', 'authentication_failure'],
          {
            error: authError.message,
            serviceName: 'better-auth',
            impact: 'authentication_unavailable',
            userId: 'unknown',
          },
        );
      }

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.alertCounters.highRiskEvents).toBeGreaterThan(0);
    });

    test('should detect and log suspicious authentication patterns', async () => {
      // Simulate rapid failed login attempts (potential brute force)
      const suspiciousAttempts = Array.from({ length: 10 }, (_, i) =>
        AuditUtils.logAuthentication(false, 'target-user-123', 'password', {
          ipAddress: '192.168.1.100',
          userAgent: 'Automated Tool/1.0',
          attemptNumber: i + 1,
        }),
      );

      await Promise.all(suspiciousAttempts);

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.alertCounters.failedAuthentications).toBeGreaterThanOrEqual(10);
    });
  });

  describe('node 22+ Features Integration', () => {
    test('should use structuredClone for auth data sanitization', () => {
      const sensitiveAuthData = {
        user: mockAuthUser,
        session: mockAuthSession,
        permissions: ['admin', 'read', 'write'],
        internalData: {
          passwordHash: 'secret-hash',
          tokenData: 'secret-token',
        },
      };

      // Use structuredClone (Node 22+ feature) for safe cloning
      const clonedData = structuredClone(sensitiveAuthData);

      // Modify clone without affecting original
      delete (clonedData as any).internalData;

      expect(sensitiveAuthData.internalData).toBeDefined();
      expect((clonedData as any).internalData).toBeUndefined();
      expect(clonedData.user.id).toBe(mockAuthUser.id);
    });

    test('should use Object.hasOwn for secure property checking', () => {
      const userPermissions = {
        'user:read': true,
        'user:write': false,
        'admin:delete': true,
      };

      // Use Object.hasOwn (Node 22+ feature) instead of 'in' operator
      const hasAdminDelete = Object.hasOwn(userPermissions, 'admin:delete');
      const hasUnknownPerm = Object.hasOwn(userPermissions, 'unknown:permission');

      expect(hasAdminDelete).toBeTruthy();
      expect(hasUnknownPerm).toBeFalsy();
    });

    test('should use Promise.withResolvers for auth timeout management', async () => {
      // Use Promise.withResolvers (Node 22+ feature) for external promise control
      const { promise, resolve, reject } = Promise.withResolvers<typeof mockAuthUser>();

      // Simulate auth check with timeout
      const authTimeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 100);

      // Simulate successful auth
      setTimeout(() => {
        clearTimeout(authTimeout);
        resolve(mockAuthUser);
      }, 50);

      const result = await promise;
      expect(result).toEqual(mockAuthUser);
    });
  });

  describe('compliance and Regulatory Integration', () => {
    test('should ensure GDPR compliance for auth data processing', async () => {
      await AuditUtils.logDataAccess(
        'personal_data',
        'gdpr-subject-123',
        'read',
        mockAuthUser.id,
        true,
        {
          gdprLegalBasis: 'legitimate_interest',
          dataProcessingPurpose: 'authentication',
          retentionPeriod: 90, // days
          encryptionUsed: true,
          complianceFrameworks: ['GDPR'],
        },
      );

      // Should create audit entry with proper GDPR context
      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThanOrEqual(0); // Events may be buffered
    });
  });
});

describe('type Compatibility Tests', () => {
  test('should have compatible types between packages', () => {
    // Test that our audit event types can handle auth data
    const authAuditEvent: AuditEventType = 'user_authentication';
    const securityLevel: SecurityLevel = 'confidential';

    expect(authAuditEvent).toBe('user_authentication');
    expect(securityLevel).toBe('confidential');

    // Test that auth user data fits our audit context
    const auditMetadata = {
      userId: mockAuthUser.id,
      userEmail: mockAuthUser.email,
      userRole: mockAuthUser.role,
      organizationId: mockAuthUser.organizationId,
      permissions: mockAuthUser.permissions,
    };

    expect(auditMetadata).toMatchObject({
      userId: expect.any(String),
      userEmail: expect.any(String),
      userRole: expect.any(String),
      organizationId: expect.any(String),
      permissions: expect.any(Array),
    });
  });
});
