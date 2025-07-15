import { ObservabilityManager } from '#/core/manager';
import type { LogLevel } from '#/core/types';
import { beforeEach, describe, expect, vi } from 'vitest';

// Use centralized test utilities
import { createTestData } from '../test-data-generators';
import {
  MockObservabilityPlugin,
  createMockPlugin,
  validatePluginCall,
  validatePluginNotCalled,
} from '../test-utils/shared-test-utilities';

describe('observabilityManager', () => {
  let manager: ObservabilityManager;
  let mockPlugin: MockObservabilityPlugin;

  beforeEach(() => {
    manager = new ObservabilityManager();
    mockPlugin = createMockPlugin();
  });

  describe('plugin Management', () => {
    test('should add a plugin successfully', () => {
      manager.addPlugin(mockPlugin);
      expect(manager.getPlugin('mock')).toBe(mockPlugin);
    });

    test('should get plugin by name', () => {
      manager.addPlugin(mockPlugin);
      const retrievedPlugin = manager.getPlugin('mock');
      expect(retrievedPlugin).toBe(mockPlugin);
    });

    test('should return undefined for non-existent plugin', () => {
      const plugin = manager.getPlugin('non-existent');
      expect(plugin).toBeUndefined();
    });

    test('should list all plugins', () => {
      const mockPlugin2 = createMockPlugin({ name: 'mock2' });

      manager.addPlugin(mockPlugin);
      manager.addPlugin(mockPlugin2);

      const plugins = manager.listPlugins();
      expect(plugins).toHaveLength(2);
      expect(plugins).toContain(mockPlugin);
      expect(plugins).toContain(mockPlugin2);
    });
  });

  describe('lifecycle Management', () => {
    test('should initialize all plugins', async () => {
      manager.addPlugin(mockPlugin);
      await manager.initialize();

      expect(mockPlugin.initialize).toHaveBeenCalledTimes(1);
    });

    test('should shutdown all plugins', async () => {
      manager.addPlugin(mockPlugin);
      await manager.shutdown();

      expect(mockPlugin.shutdown).toHaveBeenCalledTimes(1);
    });

    test('should handle plugin initialization errors gracefully', async () => {
      mockPlugin.initialize.mockRejectedValue(new Error('Init failed'));
      manager.addPlugin(mockPlugin);

      await expect(manager.initialize()).resolves.not.toThrow();
    });

    test('should handle plugin shutdown errors gracefully', async () => {
      mockPlugin.shutdown.mockRejectedValue(new Error('Shutdown failed'));
      manager.addPlugin(mockPlugin);

      await expect(manager.shutdown()).resolves.not.toThrow();
    });
  });

  describe('broadcasting', () => {
    test('should broadcast captureException to all enabled plugins', () => {
      const error = createTestData.error();
      const context = createTestData.context();

      manager.addPlugin(mockPlugin);
      manager.captureException(error, context);

      validatePluginCall(mockPlugin.captureException, [error, context]);
    });

    test('should broadcast captureMessage to all enabled plugins', () => {
      const message = 'Test message';
      const level: LogLevel = 'info';
      const context = createTestData.context();

      manager.addPlugin(mockPlugin);
      manager.captureMessage(message, level, context);

      validatePluginCall(mockPlugin.captureMessage, [message, level, context]);
    });

    test('should broadcast setUser to all enabled plugins', () => {
      const user = createTestData.user();

      manager.addPlugin(mockPlugin);
      manager.setUser(user);

      validatePluginCall(mockPlugin.setUser, [user]);
    });

    test('should broadcast addBreadcrumb to all enabled plugins', () => {
      const breadcrumb = createTestData.breadcrumb();

      manager.addPlugin(mockPlugin);
      manager.addBreadcrumb(breadcrumb);

      validatePluginCall(mockPlugin.addBreadcrumb, [breadcrumb]);
    });

    test('should skip disabled plugins', () => {
      mockPlugin.enabled = false;
      manager.addPlugin(mockPlugin);

      const error = createTestData.error();
      manager.captureException(error);

      validatePluginNotCalled(mockPlugin.captureException);
    });

    test('should handle plugin method errors gracefully', () => {
      mockPlugin.captureException.mockImplementation(() => {
        throw new Error('Plugin error');
      });

      manager.addPlugin(mockPlugin);

      expect(() => {
        manager.captureException(createTestData.error());
      }).not.toThrow();
    });
  });

  describe('scope Management', () => {
    test('should call withScope on all enabled plugins', () => {
      const callback = vi.fn();

      manager.addPlugin(mockPlugin);
      manager.withScope(callback);

      expect(mockPlugin.withScope).toHaveBeenCalledWith(callback);
    });

    test('should handle scope callback errors gracefully', () => {
      mockPlugin.withScope.mockImplementation(() => {
        throw new Error('Scope error');
      });

      manager.addPlugin(mockPlugin);

      expect(() => {
        manager.withScope(() => {});
      }).not.toThrow();
    });
  });

  describe('flushing', () => {
    test('should flush all plugins and return true if all succeed', async () => {
      mockPlugin.flush.mockResolvedValue(true);
      manager.addPlugin(mockPlugin);

      const result = await manager.flush();

      expect(mockPlugin.flush).toHaveBeenCalledTimes(1);
      expect(result).toBeTruthy();
    });

    test('should flush all plugins and return false if any fail', async () => {
      const mockPlugin2 = createMockPlugin({ name: 'mock2' });
      mockPlugin2.flush.mockResolvedValue(false);

      manager.addPlugin(mockPlugin);
      manager.addPlugin(mockPlugin2);

      const result = await manager.flush();

      expect(mockPlugin.flush).toHaveBeenCalledTimes(1);
      expect(mockPlugin2.flush).toHaveBeenCalledTimes(1);
      expect(result).toBeFalsy();
    });

    test('should handle flush errors gracefully', async () => {
      mockPlugin.flush.mockRejectedValue(new Error('Flush failed'));
      manager.addPlugin(mockPlugin);

      const result = await manager.flush();

      expect(result).toBeFalsy();
    });

    test('should pass timeout to plugins', async () => {
      const timeout = 5000;
      manager.addPlugin(mockPlugin);

      await manager.flush(timeout);

      expect(mockPlugin.flush).toHaveBeenCalledWith(timeout);
    });
  });

  describe('error Handling', () => {
    test('should handle plugins that throw synchronous errors', () => {
      const faultyPlugin = createMockPlugin({ name: 'faulty' });
      faultyPlugin.captureException.mockImplementation(() => {
        throw new Error('Sync error');
      });

      manager.addPlugin(faultyPlugin);

      expect(() => {
        manager.captureException(createTestData.error());
      }).not.toThrow();
    });

    test('should continue processing other plugins if one fails', () => {
      const faultyPlugin = createMockPlugin({ name: 'faulty' });
      faultyPlugin.captureException.mockImplementation(() => {
        throw new Error('Plugin failed');
      });

      manager.addPlugin(faultyPlugin);
      manager.addPlugin(mockPlugin);

      const error = createTestData.error();
      manager.captureException(error);

      validatePluginCall(mockPlugin.captureException, [error, undefined]);
    });
  });

  describe('edge Cases', () => {
    test('should handle empty plugin list', async () => {
      expect(() => manager.captureException(createTestData.error())).not.toThrow();
      expect(await manager.flush()).toBeTruthy();
      await expect(manager.initialize()).resolves.not.toThrow();
      await expect(manager.shutdown()).resolves.not.toThrow();
    });

    test('should handle null/undefined values gracefully', () => {
      manager.addPlugin(mockPlugin);

      expect(() => {
        manager.captureException(null as any);
        manager.captureMessage('');
        manager.setUser(null);
        manager.addBreadcrumb(null as any);
      }).not.toThrow();
    });
  });
});
