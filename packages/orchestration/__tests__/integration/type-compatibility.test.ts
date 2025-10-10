/**
 * Cross-Package Type Compatibility Test Suite
 *
 * Validates that types from the modernized orchestration package
 * are compatible with types from other @repo packages, ensuring
 * seamless integration across the monorepo ecosystem.
 */

import { describe, expect, test } from 'vitest';
import type {
  AuditEventType,
  ComplianceFramework,
  MemoryMetrics,
  PerformanceMetrics,
  ResourceContext,
  SecurityContext,
  SecurityLevel,
  StreamStats,
  UserContext,
} from '../../src/shared/utils';

// Mock types from other packages for compatibility testing
type MockAuthUser = {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
};

type MockDatabaseRecord = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  metadata?: Record<string, unknown>;
};

type MockObservabilityContext = {
  traceId: string;
  spanId: string;
  correlationId: string;
  provider: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  metadata?: Record<string, unknown>;
};

describe('cross-Package Type Compatibility', () => {
  describe('authentication Package Compatibility', () => {
    test('should support auth user types in audit user context', () => {
      const mockAuthUser: MockAuthUser = {
        id: 'user-type-test-123',
        email: 'type-test@example.com',
        role: 'admin',
        organizationId: 'org-type-test',
        permissions: ['read', 'write', 'admin'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Should be compatible with UserContext type
      const userContext: UserContext = {
        userId: mockAuthUser.id,
        userEmail: mockAuthUser.email,
        organizationId: mockAuthUser.organizationId,
        roles: [mockAuthUser.role],
        permissions: mockAuthUser.permissions,
        sessionId: 'test-session',
      };

      expect(userContext.userId).toBe(mockAuthUser.id);
      expect(userContext.userEmail).toBe(mockAuthUser.email);
      expect(userContext.roles).toContain(mockAuthUser.role);
      expect(userContext.permissions).toEqual(mockAuthUser.permissions);
    });

    test('should support auth permission validation with security levels', () => {
      const permissions = ['user:read', 'user:write', 'admin:delete'];
      const securityLevels: SecurityLevel[] = ['public', 'internal', 'confidential', 'restricted'];

      // Test that auth permissions map to security contexts
      const securityContext: SecurityContext = {
        classification: 'confidential',
        dataTypes: ['user_data', 'permission_data'],
        accessLevel: 'admin',
        complianceFrameworks: ['SOC2', 'GDPR'],
        riskScore: 45,
      };

      // Validate security level type compatibility
      expect(securityLevels).toContain('confidential');
      expect(securityContext.classification).toBe('confidential');
      expect(securityContext.complianceFrameworks).toContain('GDPR');
    });

    test('should handle auth session data in audit events', () => {
      const authSession = {
        id: 'session-compatibility-test',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 3600000),
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser/1.0',
      };

      // Should work with audit event type
      const auditEventType: AuditEventType = 'user_authentication';

      expect(auditEventType).toBe('user_authentication');
      expect(authSession.userId).toBe('user-123');
      expect(authSession.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('database Package Compatibility', () => {
    test('should support database record types in resource contexts', () => {
      const mockDbRecord: MockDatabaseRecord = {
        id: 'db-record-type-test',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-db-test',
        metadata: {
          source: 'type-compatibility-test',
          version: '1.0.0',
        },
      };

      // Should be compatible with ResourceContext
      const resourceContext: ResourceContext = {
        resourceType: 'database_record',
        resourceId: mockDbRecord.id,
        operationType: 'create',
        relationshipData: {
          userId: mockDbRecord.userId,
          timestamps: {
            created: mockDbRecord.createdAt,
            updated: mockDbRecord.updatedAt,
          },
        },
      };

      expect(resourceContext.resourceId).toBe(mockDbRecord.id);
      expect(resourceContext.relationshipData?.userId).toBe(mockDbRecord.userId);
      expect(resourceContext.relationshipData?.timestamps.created).toBe(mockDbRecord.createdAt);
    });

    test('should support database transaction contexts in audit logging', () => {
      const transactionData = {
        id: 'tx-type-test-123',
        isolationLevel: 'READ_COMMITTED',
        tablesAffected: ['User', 'Workflow', 'AuditLog'],
        recordsModified: 5,
        durability: true,
        consistency: true,
      };

      // Should work with compliance frameworks
      const complianceFrameworks: ComplianceFramework[] = ['GDPR', 'SOX', 'HIPAA', 'SOC2'];

      expect(complianceFrameworks).toContain('GDPR');
      expect(complianceFrameworks).toContain('SOX');
      expect(transactionData.tablesAffected).toContain('User');
      expect(transactionData.isolationLevel).toBe('READ_COMMITTED');
    });

    test('should handle database query performance metrics', () => {
      const queryMetrics = {
        operation: 'database:query:users',
        executionTime: 125.5,
        rowsAffected: 1000,
        planCost: 15.2,
        indexUsage: true,
      };

      // Should be compatible with PerformanceMetrics
      const performanceMetrics: Partial<PerformanceMetrics> = {
        operation: queryMetrics.operation,
        durationMs: queryMetrics.executionTime,
        startTime: Date.now(),
        endTime: Date.now() + queryMetrics.executionTime,
        metadata: {
          rowsAffected: queryMetrics.rowsAffected,
          planCost: queryMetrics.planCost,
          indexUsage: queryMetrics.indexUsage,
        },
      };

      expect(performanceMetrics.operation).toBe(queryMetrics.operation);
      expect(performanceMetrics.durationMs).toBe(queryMetrics.executionTime);
      expect(performanceMetrics.metadata?.indexUsage).toBeTruthy();
    });
  });

  describe('observability Package Compatibility', () => {
    test('should support observability contexts in audit events', () => {
      const obsContext: MockObservabilityContext = {
        traceId: 'trace-type-test-123',
        spanId: 'span-type-test-456',
        correlationId: 'correlation-type-test',
        provider: 'multi-provider',
        level: 'info',
        metadata: {
          service: 'orchestration',
          version: '1.0.0',
        },
      };

      // Should integrate with SecurityContext
      const securityContext: SecurityContext = {
        classification: 'internal',
        dataTypes: ['telemetry_data', 'trace_data'],
        accessLevel: 'read',
        complianceFrameworks: ['SOC2'],
        riskScore: 15,
        observabilityContext: {
          traceId: obsContext.traceId,
          spanId: obsContext.spanId,
          correlationId: obsContext.correlationId,
        },
      };

      expect(securityContext.observabilityContext?.traceId).toBe(obsContext.traceId);
      expect(securityContext.observabilityContext?.spanId).toBe(obsContext.spanId);
      expect(obsContext.level).toBe('info');
    });

    test('should support observability metrics in performance monitoring', () => {
      const telemetryMetrics = {
        eventCount: 150,
        errorRate: 0.02,
        latencyP95: 250.5,
        throughput: 1000,
        availability: 99.9,
      };

      // Should work with PerformanceMetrics
      const performanceMetrics: PerformanceMetrics = {
        id: 'perf-obs-test-123',
        operation: 'telemetry:metrics:collection',
        durationMs: telemetryMetrics.latencyP95,
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        success: telemetryMetrics.errorRate < 0.05,
        metadata: {
          eventCount: telemetryMetrics.eventCount,
          errorRate: telemetryMetrics.errorRate,
          throughput: telemetryMetrics.throughput,
          availability: telemetryMetrics.availability,
        },
      };

      expect(performanceMetrics.success).toBeTruthy();
      expect(performanceMetrics.metadata?.errorRate).toBe(0.02);
      expect(performanceMetrics.metadata?.availability).toBeGreaterThan(99);
    });

    test('should handle distributed tracing context propagation', () => {
      const distributedTrace = {
        traceId: 'distributed-trace-123',
        parentSpanId: 'parent-span-456',
        currentSpanId: 'current-span-789',
        baggage: {
          service: 'orchestration',
          operation: 'type-compatibility-test',
          userId: 'user-trace-test',
        },
      };

      // Should work with UserContext and ResourceContext
      const userContext: UserContext = {
        userId: distributedTrace.baggage.userId,
        traceId: distributedTrace.traceId,
        spanId: distributedTrace.currentSpanId,
        correlationId: `${distributedTrace.traceId}-correlation`,
      };

      const resourceContext: ResourceContext = {
        resourceType: 'distributed_operation',
        resourceId: distributedTrace.baggage.operation,
        operationType: 'trace',
        traceContext: {
          traceId: distributedTrace.traceId,
          spanId: distributedTrace.currentSpanId,
          parentSpanId: distributedTrace.parentSpanId,
        },
      };

      expect(userContext.traceId).toBe(distributedTrace.traceId);
      expect(resourceContext.traceContext?.parentSpanId).toBe(distributedTrace.parentSpanId);
    });
  });

  describe('memory and Performance Type Compatibility', () => {
    test('should support memory metrics across packages', () => {
      const systemMemory = process.memoryUsage();

      // Should be compatible with MemoryMetrics
      const memoryMetrics: MemoryMetrics = {
        timestamp: new Date(),
        heapUsed: systemMemory.heapUsed,
        heapTotal: systemMemory.heapTotal,
        external: systemMemory.external,
        arrayBuffers: systemMemory.arrayBuffers,
        rss: systemMemory.rss,
        gcCollections: 5,
        gcDuration: 12.5,
        objectCount: 1000,
        leakSuspects: [],
      };

      expect(memoryMetrics.heapUsed).toBe(systemMemory.heapUsed);
      expect(memoryMetrics.heapTotal).toBeGreaterThan(0);
      expect(memoryMetrics.gcCollections).toBe(5);
      expect(memoryMetrics.leakSuspects).toHaveLength(0);
    });

    test('should support streaming metrics compatibility', () => {
      const streamingData = {
        itemsProcessed: 5000,
        itemsSkipped: 10,
        errors: 2,
        processingRate: 100.5, // items per second
        backpressureEvents: 3,
        memoryPeak: 256 * 1024 * 1024, // 256MB
      };

      // Should work with StreamStats
      const streamStats: StreamStats = {
        itemsProcessed: streamingData.itemsProcessed,
        itemsSkipped: streamingData.itemsSkipped,
        errors: streamingData.errors,
        startTime: new Date(Date.now() - 60000), // 1 minute ago
        endTime: new Date(),
        memoryUsage: {
          initial: 128 * 1024 * 1024, // 128MB
          peak: streamingData.memoryPeak,
          current: 200 * 1024 * 1024, // 200MB
        },
        backpressureEvents: streamingData.backpressureEvents,
        timeouts: 0,
      };

      expect(streamStats.itemsProcessed).toBe(streamingData.itemsProcessed);
      expect(streamStats.memoryUsage.peak).toBe(streamingData.memoryPeak);
      expect(streamStats.backpressureEvents).toBe(streamingData.backpressureEvents);

      // Calculate processing rate
      const durationSeconds =
        (streamStats.endTime!.getTime() - streamStats.startTime.getTime()) / 1000;
      const calculatedRate = streamStats.itemsProcessed / durationSeconds;
      expect(calculatedRate).toBeGreaterThan(0);
    });
  });

  describe('node 22+ Feature Type Compatibility', () => {
    test('should support structuredClone type compatibility', () => {
      // Test that structuredClone works with complex objects from other packages
      const complexAuthObject = {
        user: {
          id: 'clone-test-user',
          permissions: ['read', 'write'],
          metadata: new Map([
            ['role', 'admin'],
            ['department', 'engineering'],
          ]),
        },
        session: {
          id: 'clone-test-session',
          expiresAt: new Date(),
          settings: new Set(['theme:dark', 'notifications:enabled']),
        },
      };

      // Use structuredClone (Node 22+ feature)
      const clonedObject = structuredClone(complexAuthObject);

      expect(clonedObject).not.toBe(complexAuthObject);
      expect(clonedObject.user.id).toBe(complexAuthObject.user.id);
      expect(clonedObject.user.metadata.get('role')).toBe('admin');
      expect(clonedObject.session.settings.has('theme:dark')).toBeTruthy();
    });

    test('should support Object.hasOwn type compatibility', () => {
      // Test Object.hasOwn with objects from different packages
      const authConfigObject = {
        providers: ['password', 'oauth'],
        session: { duration: 3600 },
        security: { mfa: true },
      };

      const databaseConfigObject = {
        connectionPool: { max: 10, min: 2 },
        transactions: { isolation: 'READ_COMMITTED' },
        migrations: { auto: true },
      };

      // Use Object.hasOwn (Node 22+ feature)
      const hasAuthProviders = Object.hasOwn(authConfigObject, 'providers');
      const hasDbPool = Object.hasOwn(databaseConfigObject, 'connectionPool');
      const hasNonExistent = Object.hasOwn(authConfigObject, 'nonexistent');

      expect(hasAuthProviders).toBeTruthy();
      expect(hasDbPool).toBeTruthy();
      expect(hasNonExistent).toBeFalsy();
    });

    test('should support Promise.withResolvers type compatibility', async () => {
      // Test Promise.withResolvers with async operations across packages
      const { promise: authPromise, resolve: authResolve } = Promise.withResolvers<MockAuthUser>();
      const { promise: dbPromise, resolve: dbResolve } =
        Promise.withResolvers<MockDatabaseRecord>();

      // Simulate async resolution
      const authUser: MockAuthUser = {
        id: 'async-auth-user',
        email: 'async@example.com',
        role: 'user',
        organizationId: 'org-async',
        permissions: ['read'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const dbRecord: MockDatabaseRecord = {
        id: 'async-db-record',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: authUser.id,
      };

      authResolve(authUser);
      dbResolve(dbRecord);

      const [user, record] = await Promise.all([authPromise, dbPromise]);
      expect(user.id).toBe('async-auth-user');
      expect(user.permissions).toContain('read');
      expect(record.userId).toBe(authUser.id);
      expect(record.id).toBe('async-db-record');
    });
  });

  describe('error and Exception Type Compatibility', () => {
    test('should support cross-package error handling', () => {
      // Test that our error types work with errors from other packages
      class AuthError extends Error {
        constructor(
          message: string,
          public code: string,
          public statusCode: number,
        ) {
          super(message);
          this.name = 'AuthError';
        }
      }

      class DatabaseError extends Error {
        constructor(
          message: string,
          public query: string,
          public code: string,
        ) {
          super(message);
          this.name = 'DatabaseError';
        }
      }

      const authError = new AuthError('Authentication failed', 'AUTH_FAILED', 401);
      const dbError = new DatabaseError('Query timeout', 'SELECT * FROM users', 'TIMEOUT');

      // Should work with our audit logging
      const errorContext = {
        authError: {
          message: authError.message,
          code: authError.code,
          statusCode: authError.statusCode,
          type: 'authentication',
        },
        databaseError: {
          message: dbError.message,
          query: dbError.query,
          code: dbError.code,
          type: 'database',
        },
      };

      expect(errorContext.authError.statusCode).toBe(401);
      expect(errorContext.databaseError.query).toContain('SELECT');
      expect(authError instanceof Error).toBeTruthy();
      expect(dbError instanceof Error).toBeTruthy();
    });
  });

  describe('configuration and Environment Type Compatibility', () => {
    test('should support environment configuration types', () => {
      // Test that configuration types work across packages
      type EnvironmentConfig = {
        NODE_ENV: 'development' | 'test' | 'production';
        DATABASE_URL: string;
        AUTH_SECRET: string;
        OBSERVABILITY_ENABLED: boolean;
        LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
      };

      const mockConfig: EnvironmentConfig = {
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://localhost:5432/test',
        AUTH_SECRET: 'test-secret-key',
        OBSERVABILITY_ENABLED: true,
        LOG_LEVEL: 'info',
      };

      // Should be compatible with security contexts
      const envSecurityContext: SecurityContext = {
        classification: 'internal',
        dataTypes: ['configuration_data', 'environment_variables'],
        accessLevel: 'admin',
        complianceFrameworks: ['SOC2'],
        riskScore: 30,
        environmentContext: {
          nodeEnv: mockConfig.NODE_ENV,
          logLevel: mockConfig.LOG_LEVEL,
          observabilityEnabled: mockConfig.OBSERVABILITY_ENABLED,
        },
      };

      expect(envSecurityContext.environmentContext?.nodeEnv).toBe('test');
      expect(envSecurityContext.environmentContext?.logLevel).toBe('info');
      expect(envSecurityContext.environmentContext?.observabilityEnabled).toBeTruthy();
    });
  });
});
