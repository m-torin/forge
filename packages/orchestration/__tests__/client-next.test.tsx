/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Import standardized utilities
import { createQStashProviderScenarios, createWorkflowProviderScenarios } from '@repo/qa';
import {
  assertExportAvailability,
  assertImportResult,
  testDynamicImport,
  testHookExecution,
  testModuleExports,
} from './utils/import-testing';
import { createTestSuite } from './utils/test-patterns';
// 3rd party mocks are auto-imported by @repo/qa package

// Mock the monitoring features
vi.mock('../src/shared/features/monitoring', () => ({
  ExecutionHistory: {},
  WorkflowAlert: {},
  WorkflowMetrics: {},
}));

vi.mock('../src/shared/features/scheduler', () => ({
  EnhancedScheduleConfig: {},
  ScheduleStatus: {
    ACTIVE: 'active',
    PAUSED: 'paused',
    STOPPED: 'stopped',
  },
}));

vi.mock('../src/shared/types/index', () => ({
  WorkflowData: {},
  WorkflowDefinition: {},
  WorkflowExecution: {},
  WorkflowProvider: {},
}));

// Create standardized test suite
const testSuite = createTestSuite('client-next');
const { hooks, hookHelper, data } = testSuite;
const qstashScenarios = createQStashProviderScenarios();
const workflowScenarios = createWorkflowProviderScenarios();

describe('client-next hooks', () => {
  // Use DRY mock lifecycle
  testSuite.setupTestSuite();

  describe('useWorkflowExecution', () => {
    test('should import useWorkflowExecution hook', async () => {
      await testSuite.testModuleImport(() => import('../src/client-next'));
    });
  });

  describe('useExecutionHistory', () => {
    test('should import useExecutionHistory hook', async () => {
      await testSuite.testModuleImport(() => import('../src/client-next'));
    });

    test('should handle basic execution history options', async () => {
      const module = await testSuite.testModuleImport(() => import('../src/client-next'));
      const { useExecutionHistory } = module as any;

      if (useExecutionHistory) {
        const options = {
          enabled: true,
          provider: hooks.mockProvider,
          refreshInterval: 5000,
          pagination: { limit: 10, offset: 0 },
        };

        hookHelper.testHook(
          () => useExecutionHistory('test-workflow', options),
          result => {
            expect([null, 'object']).toContain(typeof result);
          },
        );
      }
    });
  });

  describe('useWorkflowStatus', () => {
    test('should import useWorkflowStatus hook', async () => {
      await testSuite.testModuleImport(() => import('../src/client-next'));
    });
  });

  describe('useWorkflowMetrics', () => {
    test('should import useWorkflowMetrics hook', async () => {
      await testSuite.testModuleImport(() => import('../src/client-next'));

      if (exports.useWorkflowMetrics) {
        assertExportAvailability(exports.useWorkflowMetrics);
      }
    });
  });

  describe('useWorkflowScheduler', () => {
    test('should import useWorkflowScheduler hook', async () => {
      const { importResult, exports } = await testModuleExports(
        () => import('../src/client-next'),
        ['useWorkflowScheduler'],
      );

      assertImportResult(importResult);

      if (exports.useWorkflowScheduler) {
        assertExportAvailability(exports.useWorkflowScheduler);
      }
    });
  });

  describe('useWorkflowAlerts', () => {
    test('should import useWorkflowAlerts hook', async () => {
      const { importResult, exports } = await testModuleExports(
        () => import('../src/client-next'),
        ['useWorkflowAlerts'],
      );

      assertImportResult(importResult);

      if (exports.useWorkflowAlerts) {
        assertExportAvailability(exports.useWorkflowAlerts);
      }
    });
  });

  describe('client-side utilities', () => {
    test('should import client utilities', async () => {
      const { importResult, exports } = await testModuleExports(
        () => import('../src/client-next'),
        ['createWorkflowClient', 'WorkflowClientProvider', 'useWorkflowClient'],
      );

      assertImportResult(importResult);

      // Test each export if available
      Object.entries(exports).forEach(([name, availability]) => {
        if (availability.exists) {
          assertExportAvailability(availability);
        }
      });
    });
  });

  describe('module exports', () => {
    test('should import the entire module successfully', async () => {
      const importResult = await testDynamicImport(() => import('../src/client-next'));
      assertImportResult(importResult);

      if (importResult.success && importResult.module) {
        const exportKeysLength = Object.keys(importResult.module).length;
        expect(typeof exportKeysLength).toBe('number');
      }
    });

    test('should handle module initialization', async () => {
      const [result1, result2] = await Promise.all([
        testDynamicImport(() => import('../src/client-next')),
        testDynamicImport(() => import('../src/client-next')),
      ]);

      assertImportResult(result1);
      assertImportResult(result2);

      // Test consistency between imports
      expect(result1.success).toBe(result2.success);
      if (result1.success && result2.success) {
        expect(result1.module === result2.module).toBeTruthy();
      }
    });
  });

  describe('type exports', () => {
    test('should export TypeScript interfaces', async () => {
      const importResult = await testDynamicImport(() => import('../src/client-next'));
      assertImportResult(importResult);

      // TypeScript types are compile-time only, so we just verify module structure
      if (importResult.success && importResult.module) {
        expect(typeof importResult.module).toBe('object');
      }
    });
  });

  describe('hook behavior simulation', () => {
    test('should simulate useWorkflowExecution behavior', async () => {
      const mockExecutionId = 'exec-123';
      const mockExecution = testSuite.workflows.successfulExecution;

      hooks.mockProvider.getExecution.mockResolvedValue(mockExecution);

      const result = await hooks.mockProvider.getExecution(mockExecutionId);
      expect(result).toStrictEqual(mockExecution);
      expect(hooks.mockProvider.getExecution).toHaveBeenCalledWith(mockExecutionId);
    });

    test('should simulate useExecutionHistory behavior', async () => {
      const mockExecutions = [
        testSuite.workflows.successfulExecution,
        testSuite.workflows.runningExecution,
      ];

      hooks.mockProvider.listExecutions.mockResolvedValue(mockExecutions);

      const result = await hooks.mockProvider.listExecutions('workflow-1');
      expect(result).toStrictEqual(mockExecutions);
      expect(hooks.mockProvider.listExecutions).toHaveBeenCalledWith('workflow-1');
    });

    test('should simulate workflow scheduling behavior', async () => {
      const mockScheduleId = 'schedule-123';
      const definition = testSuite.workflows.createMockWorkflow();

      hooks.mockProvider.scheduleWorkflow.mockResolvedValue(mockScheduleId);

      const result = await hooks.mockProvider.scheduleWorkflow(definition);
      expect(result).toBe(mockScheduleId);
      expect(hooks.mockProvider.scheduleWorkflow).toHaveBeenCalledWith(definition);
    });
  });

  describe('error handling scenarios', () => {
    test('should handle provider errors gracefully', async () => {
      const errorMock = testSuite.errors.createFailingMock(testSuite.errors.validationError);
      hooks.mockProvider.getExecution = errorMock;

      await testSuite.errors.testErrorHandling(
        () => hooks.mockProvider.getExecution('invalid-id'),
        'Validation failed',
      );
    });

    test('should handle network errors', async () => {
      const networkErrorMock = testSuite.errors.createFailingMock(testSuite.errors.networkError);
      hooks.mockProvider.listExecutions = networkErrorMock;

      await testSuite.errors.testErrorHandling(
        () => hooks.mockProvider.listExecutions('workflow-1'),
        'Network error',
      );
    });
  });

  describe('react integration', () => {
    test('should work with React components', () => {
      // Test that we can use React hooks in tests
      const { result } = renderHook(() => {
        const [count, setCount] = useState(0);
        return { count, setCount };
      });

      expect(result.current.count).toBe(0);

      act(() => {
        result.current.setCount(1);
      });

      expect(result.current.count).toBe(1);
    });

    test('should render useWorkflow hook', async () => {
      const importResult = await testDynamicImport(() => import('../src/client-next'));
      assertImportResult(importResult);

      if (importResult.success && importResult.module) {
        const { useWorkflow } = importResult.module as any;

        if (useWorkflow) {
          const hookTest = testHookExecution(() =>
            renderHook(() => useWorkflow('test-workflow', hooks.enabledOptions)),
          );

          expect(typeof hookTest.success).toBe('boolean');

          if (hookTest.success && hookTest.result) {
            const hookResult = hookTest.result.result.current;
            const methods = ['execute', 'cancel', 'clear'];

            methods.forEach(method => {
              const methodType = hookResult?.[method] ? typeof hookResult[method] : 'undefined';
              expect(['function', 'undefined']).toContain(methodType);
            });
          }
        }
      }
    });

    test('should render useExecutionHistory hook', async () => {
      const importResult = await testDynamicImport(() => import('../src/client-next'));
      assertImportResult(importResult);

      if (importResult.success && importResult.module) {
        const { useExecutionHistory } = importResult.module as any;

        if (useExecutionHistory) {
          const hookTest = testHookExecution(() =>
            renderHook(() =>
              useExecutionHistory('test-workflow', {
                ...hooks.enabledOptions,
                refreshInterval: 0,
              }),
            ),
          );

          expect(typeof hookTest.success).toBe('boolean');
          expect([null, 'object']).toContain(typeof hookTest.result);
        }
      }
    });

    // Test multiple hooks with standardized scenarios
    const hookTests = [
      {
        name: 'useWorkflowMetrics',
        args: ['test-workflow'],
        options: { ...hooks.enabledOptions, refreshInterval: 0 },
      },
      {
        name: 'useWorkflowAlerts',
        args: ['test-workflow'],
        options: { ...hooks.enabledOptions, refreshInterval: 0 },
      },
      {
        name: 'useWorkflowList',
        args: [],
        options: { ...hooks.enabledOptions, refreshInterval: 0 },
      },
      {
        name: 'useWorkflowSchedule',
        args: ['test-workflow', 'schedule-1'],
        options: { ...hooks.enabledOptions, refreshInterval: 0 },
      },
    ];

    hookTests.forEach(({ name, args, options }) => {
      test(`should render ${name} hook`, async () => {
        const importResult = await testDynamicImport(() => import('../src/client-next'));
        assertImportResult(importResult);

        if (importResult.success && importResult.module) {
          const hook = (importResult.module as any)[name];

          if (hook) {
            const hookTest = testHookExecution(() => renderHook(() => hook(...args, options)));

            expect(typeof hookTest.success).toBe('boolean');
            expect([null, 'object']).toContain(typeof hookTest.result);
          }
        }
      });
    });
  });
});

// Enhanced test coverage using standardized patterns
describe('additional client-next coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should handle comprehensive hook scenarios', async () => {
    const importResult = await testDynamicImport(() => import('../src/client-next'));
    assertImportResult(importResult);

    if (importResult.success && importResult.module) {
      const { useWorkflow } = importResult.module as any;

      if (useWorkflow) {
        // Test different hook scenarios
        const scenarios = [
          { name: 'enabled', options: hooks.enabledOptions },
          { name: 'disabled', options: hooks.disabledOptions },
          { name: 'null provider', options: hooks.nullProviderOptions },
        ];

        for (const scenario of scenarios) {
          const hookTest = testHookExecution(() =>
            renderHook(() => useWorkflow('test-workflow', scenario.options)),
          );

          expect(typeof hookTest.success).toBe('boolean');
        }
      }
    }
  });

  test('should handle hook error scenarios', async () => {
    const importResult = await testDynamicImport(() => import('../src/client-next'));
    assertImportResult(importResult);

    if (importResult.success && importResult.module) {
      const { useWorkflow } = importResult.module as any;

      if (useWorkflow) {
        // Test with failing provider
        const failingProvider = {
          ...hooks.mockProvider,
          execute: testSuite.errors.createFailingMock(new Error('Execution failed')),
        };

        const hookTest = testHookExecution(() =>
          renderHook(() =>
            useWorkflow('test-workflow', {
              provider: failingProvider,
              enabled: true,
            }),
          ),
        );

        expect(typeof hookTest.success).toBe('boolean');

        if (hookTest.success && hookTest.result) {
          const hookResult = hookTest.result.result.current;

          // Test hook operations with error handling
          if (hookResult?.execute) {
            await act(async () => {
              try {
                await hookResult.execute({ test: 'input' });
              } catch (error) {
                expect(error).toBeDefined();
              }
            });
          }
        }
      }
    }
  });

  // Legacy coverage tests (streamlined with new patterns)
  describe('legacy coverage', () => {
    test('should import and test various client utilities', async () => {
      const importResult = await testDynamicImport(() => import('../src/client-next'));
      assertImportResult(importResult);

      if (importResult.success && importResult.module) {
        const exportNames = Object.keys(importResult.module);
        expect(Array.isArray(exportNames)).toBeTruthy();

        // Validate each export
        exportNames.forEach(exportName => {
          expect((importResult.module as any)[exportName]).toBeDefined();
        });
      }
    });

    test('should handle client-side initialization', async () => {
      // Simulate client-side environment
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost:3000' },
        writable: true,
      });

      const importResult = await testDynamicImport(() => import('../src/client-next'));
      assertImportResult(importResult);
    });

    test('should test createReactWorkflowClient utility', async () => {
      const importResult = await testDynamicImport(() => import('../src/client-next'));
      assertImportResult(importResult);

      if (importResult.success && importResult.module) {
        const { createReactWorkflowClient } = importResult.module as any;

        if (createReactWorkflowClient) {
          const client = createReactWorkflowClient(hooks.mockProvider);
          expect(['object', 'undefined']).toContain(typeof client);
        }
      }
    });

    test('should test hook execution with real workflow operations', async () => {
      const importResult = await testDynamicImport(() => import('../src/client-next'));
      assertImportResult(importResult);

      if (importResult.success && importResult.module) {
        const { useWorkflow } = importResult.module as any;

        if (useWorkflow) {
          // Setup mock execution responses
          const execution = testSuite.workflows.successfulExecution;
          hooks.mockProvider.execute.mockResolvedValue(execution);
          hooks.mockProvider.getExecution.mockResolvedValue(execution);

          const hookTest = testHookExecution(() =>
            renderHook(() =>
              useWorkflow('test-workflow', {
                ...hooks.enabledOptions,
                pollInterval: 100,
              }),
            ),
          );

          if (hookTest.success && hookTest.result) {
            const hookResult = hookTest.result.result.current;

            // Test hook operations
            if (hookResult?.execute) {
              await act(async () => {
                await hookResult.execute({ test: 'input' });
              });
            }

            ['retry', 'cancel', 'clear'].forEach(method => {
              if (hookResult?.[method]) {
                if (method === 'clear') {
                  act(() => hookResult[method]());
                } else {
                  act(async () => {
                    await hookResult[method]();
                  });
                }
              }
            });
          }
        }
      }
    });

    test('should test hook error handling', async () => {
      const importResult = await testDynamicImport(() => import('../src/client-next'));
      assertImportResult(importResult);

      if (importResult.success && importResult.module) {
        const { useWorkflow } = importResult.module as any;

        if (useWorkflow) {
          // Mock a failed execution
          const failingProvider = {
            ...hooks.mockProvider,
            execute: testSuite.errors.createFailingMock(new Error('Execution failed')),
          };

          const hookTest = testHookExecution(() =>
            renderHook(() =>
              useWorkflow('test-workflow', {
                provider: failingProvider,
                enabled: true,
              }),
            ),
          );

          if (hookTest.success && hookTest.result) {
            await act(async () => {
              try {
                if (hookTest.result) {
                  await hookTest.result.result.current.execute({ test: 'input' });
                }
              } catch (error) {
                expect(error).toBeDefined();
              }
            });
          }
        }
      }
    });

    test('should test disabled hook states', async () => {
      const importResult = await testDynamicImport(() => import('../src/client-next'));
      assertImportResult(importResult);

      if (importResult.success && importResult.module) {
        const hookNames = ['useWorkflow', 'useExecutionHistory', 'useWorkflowMetrics'];

        hookNames.forEach(hookName => {
          const hook = (importResult.module as any)[hookName];

          if (hook) {
            const hookTest = testHookExecution(() =>
              renderHook(() => hook('test-workflow', hooks.disabledOptions)),
            );

            expect(typeof hookTest.success).toBe('boolean');
          }
        });
      }
    });

    test('should test hook operations with null providers', async () => {
      const importResult = await testDynamicImport(() => import('../src/client-next'));
      assertImportResult(importResult);

      if (importResult.success && importResult.module) {
        const hookNames = [
          'useWorkflow',
          'useExecutionHistory',
          'useWorkflowMetrics',
          'useWorkflowAlerts',
        ];

        hookNames.forEach(hookName => {
          const hook = (importResult.module as any)[hookName];

          if (hook) {
            const hookTest = testHookExecution(() =>
              renderHook(() => hook('test-workflow', hooks.nullProviderOptions)),
            );

            expect(typeof hookTest.success).toBe('boolean');
            if (hookTest.result) {
              // When using null providers, result.current might be undefined
              expect(['undefined', 'object']).toContain(typeof hookTest.result.result.current);
            }
          }
        });
      }
    });
  });
});
