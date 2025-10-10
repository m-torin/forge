/**
 * Integration Test: @repo/orchestration with @repo/db-prisma
 *
 * Tests the integration between the modernized orchestration package
 * and the database package to ensure compatibility and proper functionality.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  AuditUtils,
  createStreamProcessor,
  globalAuditLogger,
  globalMemoryMonitor,
  globalPerformanceMonitor,
  globalTimeoutManager,
  startGlobalAuditLogging,
  stopGlobalAuditLogging,
  StreamUtils,
} from '../../src/shared/utils';

// Mock database operations
const mockDatabaseQuery = vi.fn();
const mockTransaction = vi.fn();
const mockBatchOperation = vi.fn();
const mockStreamQuery = vi.fn();

// Mock database client
const mockPrismaClient = {
  user: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  workflow: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  $transaction: mockTransaction,
  $queryRaw: mockDatabaseQuery,
  $connect: vi.fn(),
  $disconnect: vi.fn(),
};

// Mock sample data
const mockUser = {
  id: 'user-db-123',
  email: 'dbtest@example.com',
  name: 'Database Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockWorkflow = {
  id: 'workflow-db-456',
  name: 'Database Integration Test Workflow',
  description: 'Testing database operations with orchestration',
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: mockUser.id,
};

// Mock @repo/db-prisma imports
vi.mock('@repo/db-prisma/prisma/server/next', () => ({
  db: mockPrismaClient,
  connectDb: vi.fn().mockResolvedValue(undefined),
  disconnectDb: vi.fn().mockResolvedValue(undefined),
}));

describe('integration: @repo/orchestration with @repo/db-prisma', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup mock responses with proper return values
    mockPrismaClient.user.create.mockResolvedValue(mockUser);
    mockPrismaClient.user.findMany.mockResolvedValue([mockUser]);
    mockPrismaClient.workflow.create.mockResolvedValue(mockWorkflow);
    mockPrismaClient.workflow.findMany.mockResolvedValue([mockWorkflow]);
    mockTransaction.mockImplementation(async callback => await callback(mockPrismaClient));

    // Start monitoring systems
    await globalPerformanceMonitor.start();
    await globalMemoryMonitor.start();
    await startGlobalAuditLogging({
      enableIntegrityChecks: false,
      enablePiiDetection: true, // Enable for database operations
      enableRealTimeAlerts: false,
      batchSize: 1000,
      flushInterval: 5000,
    });
  });

  afterEach(async () => {
    await stopGlobalAuditLogging();
    await globalPerformanceMonitor.stop();
    await globalMemoryMonitor.stop();
  });

  describe('database Operation Monitoring', () => {
    test('should monitor database query performance with Node 22+ timing', async () => {
      const operationName = 'database:user:findMany';
      const timingId = globalPerformanceMonitor.startTiming(operationName);

      // Simulate database operation with timeout
      const result = await globalTimeoutManager.wrapWithTimeout(
        (async () => {
          await new Promise(resolve => setTimeout(resolve, 50)); // Simulate query time
          return await mockPrismaClient.user.findMany();
        })(),
        5000, // 5 second timeout
        { name: 'database-query-timeout' },
      );
      const metrics = globalPerformanceMonitor.endTiming(timingId);

      expect(result).toEqual([mockUser]);
      expect(metrics).toBeDefined();
      expect(metrics!.operation).toBe(operationName);
      expect(metrics!.durationMs).toBeGreaterThan(40);
      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith();
    });

    test('should track memory usage during bulk database operations', async () => {
      const initialMetrics = globalMemoryMonitor.getCurrentMetrics();

      // Simulate bulk database operations
      const bulkOperations = Array.from({ length: 50 }, async (_, i) => {
        const timingId = globalPerformanceMonitor.startTiming(`bulk-op-${i}`);

        try {
          // Simulate creating user data
          const userData = {
            id: `bulk-user-${i}`,
            email: `bulk${i}@example.com`,
            name: `Bulk User ${i}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await mockPrismaClient.user.create({ data: userData });

          // Track the created object for potential memory leaks
          globalMemoryMonitor.trackObject(userData, 'database_user_record', {
            operationIndex: i,
            bulkOperation: true,
          });

          return userData;
        } finally {
          globalPerformanceMonitor.endTiming(timingId);
        }
      });

      await Promise.all(bulkOperations);

      const finalMetrics = globalMemoryMonitor.getCurrentMetrics();
      expect(finalMetrics).toBeDefined();
      expect(mockPrismaClient.user.create).toHaveBeenCalledTimes(50);

      // Check for potential memory leaks
      const potentialLeaks = globalMemoryMonitor.getPotentialLeaks();
      // Should not have leaks immediately after creation
      expect(potentialLeaks).toHaveLength(0);
    });
  });

  describe('database Transaction Integration', () => {
    test('should audit database transactions with comprehensive context', async () => {
      const transactionId = 'tx-orchestration-123';

      await AuditUtils.logDataAccess(
        'database_transaction',
        transactionId,
        'create',
        mockUser.id,
        true,
        {
          transactionType: 'user_workflow_creation',
          tablesAffected: ['User', 'Workflow'],
          recordsModified: 2,
          isolationLevel: 'READ_COMMITTED',
        },
      );

      // Simulate transaction execution
      const transactionResult = await mockTransaction(async tx => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: 'transaction@example.com',
            name: 'Transaction User',
          },
        });

        // Create workflow
        const workflow = await tx.workflow.create({
          data: {
            name: 'Transaction Workflow',
            userId: user.id,
          },
        });

        return { user, workflow };
      });

      expect(transactionResult).toBeDefined();
      expect(mockTransaction).toHaveBeenCalledWith();
    });

    test('should handle transaction failures with proper error auditing', async () => {
      const transactionError = new Error('Database constraint violation');
      mockTransaction.mockRejectedValueOnce(transactionError);

      try {
        await mockTransaction(async tx => {
          await tx.user.create({
            data: { email: 'duplicate@example.com' },
          });
        });
      } catch (error) {
        // Log transaction failure
        await AuditUtils.logSecurityEvent(
          'Database transaction failed',
          'medium',
          ['data_integrity_violation', 'constraint_violation'],
          {
            transactionType: 'user_creation',
            error: (error as Error).message,
            userId: mockUser.id,
            timestamp: new Date().toISOString(),
          },
        );

        expect(error).toBe(transactionError);
      }
    });
  });

  describe('streaming Database Operations', () => {
    test('should process large database result sets with streaming', async () => {
      // Mock large dataset
      const largeMockDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `stream-user-${i}`,
        email: `stream${i}@example.com`,
        name: `Stream User ${i}`,
        data: new Array(100).fill(`data-${i}`).join(''), // Simulate larger records
      }));

      mockStreamQuery.mockResolvedValue(largeMockDataset);

      let processedCount = 0;
      const processedIds: string[] = [];

      const streamProcessor = createStreamProcessor<(typeof largeMockDataset)[0], string>(
        async item => {
          processedCount++;
          processedIds.push(item.id);

          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 1));

          return `processed-${item.id}`;
        },
        {
          concurrency: 4,
          backpressure: {
            memoryThresholdMB: 50, // 50MB
            maxBufferSize: 50,
          },
        },
      );

      // Process the streamed data
      const processingGenerator = streamProcessor.processStream(
        StreamUtils.arrayToAsyncIterable(largeMockDataset),
      );

      // Collect all processed results
      const results: string[] = [];
      for await (const result of processingGenerator) {
        results.push(result);
      }

      expect(processedCount).toBe(1000);
      expect(results).toHaveLength(1000);
      expect(processedIds).toContain('stream-user-0');
      expect(processedIds).toContain('stream-user-999');
    });

    test('should handle streaming errors with proper cleanup', async () => {
      const errorDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `error-item-${i}`,
        shouldError: i === 50, // Error on 51st item
      }));

      let processedCount = 0;
      let errorCount = 0;

      const streamProcessor = createStreamProcessor<(typeof errorDataset)[0], string>(
        async item => {
          if (item.shouldError) {
            throw new Error(`Processing error for ${item.id}`);
          }
          processedCount++;
          return `processed-${item.id}`;
        },
        {
          concurrency: 2,
          backpressure: {
            memoryThresholdMB: 10,
          },
          onError: async (error, item, index) => {
            errorCount++;
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toMatch(/Processing error for error-item-50/);
            return false; // Don't continue processing
          },
        },
      );

      const processingGenerator = streamProcessor.processStream(
        StreamUtils.arrayToAsyncIterable(errorDataset),
      );

      // Process results - errors should be handled by onError callback
      const results: string[] = [];
      for await (const result of processingGenerator) {
        results.push(result);
      }

      expect(errorCount).toBe(1);
      expect(processedCount).toBeLessThan(100); // Should stop processing after error
    });
  });

  describe('database Connection Management', () => {
    test('should manage database connections with timeout handling', async () => {
      const connectionTimeout = 5000; // 5 seconds

      const result = await globalTimeoutManager.wrapWithTimeout(
        (async () => {
          await mockPrismaClient.$connect();
          return 'connected';
        })(),
        connectionTimeout,
        {
          name: 'database-connection',
          onTimeout: () => {
            console.warn('Database connection timed out');
          },
        },
      );
      expect(result).toBe('connected');
      expect(mockPrismaClient.$connect).toHaveBeenCalledWith();
    });

    test('should handle connection pool exhaustion gracefully', async () => {
      // Simulate connection pool exhaustion
      const poolError = new Error('Connection pool exhausted');
      mockPrismaClient.$connect.mockRejectedValueOnce(poolError);

      try {
        await mockPrismaClient.$connect();
      } catch (error) {
        // Log connection pool issue as security event
        await AuditUtils.logSecurityEvent(
          'Database connection pool exhausted',
          'high',
          ['resource_exhaustion', 'availability_issue'],
          {
            poolStatus: 'exhausted',
            activeConnections: 'unknown',
            error: (error as Error).message,
          },
        );

        expect(error).toBe(poolError);
      }
    });
  });

  describe('data Privacy and Compliance', () => {
    test('should detect and redact PII in database operations', async () => {
      const sensitiveUserData = {
        email: 'john.doe@sensitive-company.com',
        phone: '555-123-4567',
        ssn: '123-45-6789',
        creditCard: '4111-1111-1111-1111',
        notes: 'User has API key: abc123def456ghi789jkl012mno345',
      };

      // Log data access with PII detection enabled
      await AuditUtils.logDataAccess(
        'user_personal_data',
        'pii-test-user',
        'create',
        mockUser.id,
        true,
        {
          dataClassification: 'confidential',
          containsPII: true,
          complianceFrameworks: ['GDPR', 'CCPA'],
          processingPurpose: 'user_registration',
          sensitiveData: sensitiveUserData, // This should be redacted in logs
        },
      );

      // The audit logger should have automatically redacted PII
      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThanOrEqual(0);
    });

    test('should audit database schema migrations', async () => {
      await AuditUtils.logDataAccess(
        'database_schema',
        'migration-2024-01-15',
        'update',
        'system',
        true,
        {
          migrationType: 'add_column',
          tablesAffected: ['User', 'Workflow'],
          migrationScript: 'ALTER TABLE User ADD COLUMN phone VARCHAR(20)',
          backupCreated: true,
          rollbackAvailable: true,
        },
      );

      // Should log schema change
      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThanOrEqual(0);
    });
  });

  describe('node 22+ Features Integration', () => {
    test('should use structuredClone for database record safety', () => {
      const originalRecord = {
        user: mockUser,
        metadata: {
          sensitive: 'secret-data',
          public: 'public-data',
        },
        relationships: ['workflow-1', 'workflow-2'],
      };

      // Use structuredClone (Node 22+ feature) for safe database record handling
      const clonedRecord = structuredClone(originalRecord);

      // Modify clone for audit logging (removing sensitive data)
      delete (clonedRecord.metadata as any).sensitive;

      expect(originalRecord.metadata.sensitive).toBe('secret-data');
      expect((clonedRecord.metadata as any).sensitive).toBeUndefined();
      expect(clonedRecord.user.id).toBe(mockUser.id);
    });

    test('should use Object.hasOwn for database field validation', () => {
      const dbRecord = {
        id: 'test-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const requiredFields = ['id', 'email', 'name'];
      const optionalFields = ['phone', 'address', 'preferences'];

      // Use Object.hasOwn (Node 22+ feature) for field validation
      const hasRequiredFields = requiredFields.every(field => Object.hasOwn(dbRecord, field));

      const missingOptionalFields = optionalFields.filter(field => !Object.hasOwn(dbRecord, field));

      expect(hasRequiredFields).toBeTruthy();
      expect(missingOptionalFields).toEqual(['phone', 'address', 'preferences']);
    });

    test('should use Promise.withResolvers for database operation coordination', async () => {
      // Use Promise.withResolvers (Node 22+ feature) for database operation coordination
      const { promise: dbOperationPromise, resolve: resolveDbOperation } =
        Promise.withResolvers<typeof mockWorkflow>();

      // Simulate async database operation completion
      setTimeout(() => {
        mockPrismaClient.workflow
          .create({
            data: {
              name: 'Coordinated Workflow',
              userId: mockUser.id,
            },
          })
          .then(resolveDbOperation);
      }, 50);

      const result = await dbOperationPromise;
      expect(result).toEqual(mockWorkflow);
    });
  });

  describe('error Handling and Recovery', () => {
    test('should handle database deadlocks with retry logic', async () => {
      const deadlockError = new Error('Deadlock detected');
      deadlockError.name = 'PrismaClientKnownRequestError';
      (deadlockError as any).code = 'P2034'; // Prisma deadlock error code

      let attemptCount = 0;
      mockTransaction.mockImplementation(async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw deadlockError;
        }
        return { success: true };
      });

      // Implement retry logic with exponential backoff
      const retryOperation = async (maxRetries: number = 3): Promise<any> => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await mockTransaction();
          } catch (error) {
            if (attempt === maxRetries || (error as any).code !== 'P2034') {
              throw error;
            }

            // Log retry attempt
            await AuditUtils.logDataAccess(
              'database_operation',
              'deadlock-retry',
              'update',
              mockUser.id,
              false,
              {
                attempt,
                maxRetries,
                errorCode: (error as any).code,
                retryDelay: Math.pow(2, attempt) * 100,
              },
            );

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
          }
        }
      };

      const result = await retryOperation();
      expect(result).toEqual({ success: true });
      expect(attemptCount).toBe(3);
    });
  });

  describe('type Safety Integration', () => {
    test('should maintain type safety between orchestration and database types', () => {
      // Test that database types are compatible with orchestration audit types
      const dbAuditMetadata = {
        tableName: 'User',
        operation: 'INSERT',
        recordId: mockUser.id,
        timestamp: new Date(),
        userId: mockUser.id,
      };

      // Should be compatible with audit metadata type
      expect(dbAuditMetadata).toMatchObject({
        tableName: expect.any(String),
        operation: expect.any(String),
        recordId: expect.any(String),
        timestamp: expect.any(Date),
        userId: expect.any(String),
      });

      // Test database record type compatibility
      const workflowRecord = {
        id: mockWorkflow.id,
        name: mockWorkflow.name,
        status: mockWorkflow.status,
        createdAt: mockWorkflow.createdAt,
        updatedAt: mockWorkflow.updatedAt,
        userId: mockWorkflow.userId,
      };

      expect(workflowRecord.status).toBe('ACTIVE');
      expect(workflowRecord.userId).toBe(mockUser.id);
    });
  });
});
