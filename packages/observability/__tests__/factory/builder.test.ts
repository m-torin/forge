import { ObservabilityBuilder } from '#/factory/builder';
import { beforeEach, describe, expect, vi } from 'vitest';

// Use centralized test utilities
import { createTestData } from '../test-data-generators';
import {
  MockObservabilityPlugin,
  createMockPlugin,
  validatePluginCall,
} from '../test-utils/shared-test-utilities';

describe('observabilityBuilder', () => {
  let builder: ObservabilityBuilder;
  let mockPlugin: MockObservabilityPlugin;

  beforeEach(() => {
    builder = ObservabilityBuilder.create();
    mockPlugin = createMockPlugin();
  });

  describe('plugin Management', () => {
    test('should add a single plugin', () => {
      const result = builder.withPlugin(mockPlugin);

      expect(result).toBe(builder); // Should return builder for chaining

      const manager = builder.build();
      expect(manager.getPlugin('mock')).toBe(mockPlugin);
    });

    test('should add multiple plugins', () => {
      const mockPlugin2 = createMockPlugin({ name: 'mock2' });

      const result = builder.withPlugins([mockPlugin, mockPlugin2]);

      expect(result).toBe(builder); // Should return builder for chaining

      const manager = builder.build();
      expect(manager.getPlugin('mock')).toBe(mockPlugin);
      expect(manager.getPlugin('mock2')).toBe(mockPlugin2);
    });

    test('should handle empty plugin array', () => {
      const result = builder.withPlugins([]);

      expect(result).toBe(builder);

      const manager = builder.build();
      expect(manager.listPlugins()).toHaveLength(0);
    });

    test('should chain plugin additions', () => {
      const mockPlugin2 = createMockPlugin({ name: 'mock2' });

      const result = builder.withPlugin(mockPlugin).withPlugin(mockPlugin2);

      expect(result).toBe(builder);

      const manager = builder.build();
      expect(manager.listPlugins()).toHaveLength(2);
    });
  });

  describe('lifecycle Management', () => {
    test('should add lifecycle callbacks', () => {
      const onInitialized = vi.fn();
      const onShutdown = vi.fn();

      const result = builder.withLifecycle({
        onInitialized,
        onShutdown,
      });

      expect(result).toBe(builder);

      const manager = builder.build();
      expect(manager).toBeDefined();
    });

    test('should handle partial lifecycle callbacks', () => {
      const onInitialized = vi.fn();

      const result = builder.withLifecycle({
        onInitialized,
      });

      expect(result).toBe(builder);

      const manager = builder.build();
      expect(manager).toBeDefined();
    });

    test('should handle empty lifecycle object', () => {
      const result = builder.withLifecycle({});

      expect(result).toBe(builder);

      const manager = builder.build();
      expect(manager).toBeDefined();
    });
  });

  describe('auto-initialization', () => {
    test('should auto-initialize plugins when enabled', async () => {
      builder.withPlugin(mockPlugin);

      const manager = await builder.buildWithAutoInit();

      expect(mockPlugin.initialize).toHaveBeenCalledTimes(1);
      expect(manager.getPlugin('mock')).toBe(mockPlugin);
    });

    test('should handle initialization errors gracefully', async () => {
      mockPlugin.initialize.mockRejectedValue(new Error('Init failed'));
      builder.withPlugin(mockPlugin);

      const manager = await builder.buildWithAutoInit();

      expect(manager).toBeDefined();
    });

    test('should initialize multiple plugins', async () => {
      const mockPlugin2 = createMockPlugin({ name: 'mock2' });

      builder.withPlugins([mockPlugin, mockPlugin2]);

      const manager = await builder.buildWithAutoInit();

      expect(mockPlugin.initialize).toHaveBeenCalledTimes(1);
      expect(mockPlugin2.initialize).toHaveBeenCalledTimes(1);
      expect(manager.listPlugins()).toHaveLength(2);
    });
  });

  describe('builder Creation', () => {
    test('should create a new builder instance', () => {
      const builder1 = ObservabilityBuilder.create();
      const builder2 = ObservabilityBuilder.create();

      expect(builder1).not.toBe(builder2);
      expect(builder1).toBeInstanceOf(ObservabilityBuilder);
      expect(builder2).toBeInstanceOf(ObservabilityBuilder);
    });
  });

  describe('build Process', () => {
    test('should build a manager with plugins', () => {
      builder.withPlugin(mockPlugin);

      const manager = builder.build();

      expect(manager).toBeDefined();
      expect(manager.getPlugin('mock')).toBe(mockPlugin);
    });

    test('should build a manager without plugins', () => {
      const manager = builder.build();

      expect(manager).toBeDefined();
      expect(manager.listPlugins()).toHaveLength(0);
    });

    test('should allow building multiple managers from same builder', () => {
      builder.withPlugin(mockPlugin);

      const manager1 = builder.build();
      const manager2 = builder.build();

      expect(manager1).not.toBe(manager2);
      expect(manager1.getPlugin('mock')).toBe(mockPlugin);
      expect(manager2.getPlugin('mock')).toBe(mockPlugin);
    });
  });

  describe('error Handling', () => {
    test('should handle plugin addition errors gracefully', () => {
      // Test with null plugin
      expect(() => {
        builder.withPlugin(null as any);
      }).not.toThrow();

      // Test with invalid plugin
      expect(() => {
        builder.withPlugin({} as any);
      }).not.toThrow();
    });

    test('should handle plugin array errors gracefully', () => {
      expect(() => {
        builder.withPlugins(null as any);
      }).not.toThrow();

      expect(() => {
        builder.withPlugins([null, undefined] as any);
      }).not.toThrow();
    });
  });

  describe('integration Tests', () => {
    test('should create a fully functional observability system', async () => {
      const manager = await builder
        .withPlugin(mockPlugin)
        .withLifecycle({
          onInitialized: vi.fn(),
          onShutdown: vi.fn(),
        })
        .buildWithAutoInit();

      // Test the built manager
      const error = createTestData.error();
      manager.captureException(error);

      validatePluginCall(mockPlugin.captureException, [error, undefined]);
      expect(mockPlugin.initialize).toHaveBeenCalledTimes(1);
    });

    test('should handle complex plugin chains', () => {
      const mockPlugin2 = createMockPlugin({ name: 'mock2' });
      const mockPlugin3 = createMockPlugin({ name: 'mock3' });

      const manager = builder
        .withPlugin(mockPlugin)
        .withPlugins([mockPlugin2, mockPlugin3])
        .withLifecycle({
          onInitialized: vi.fn(),
        })
        .build();

      expect(manager.listPlugins()).toHaveLength(3);

      // Test broadcasting
      const message = 'Test message';
      manager.captureMessage(message);

      validatePluginCall(mockPlugin.captureMessage, [message, 'info', undefined]);
      validatePluginCall(mockPlugin2.captureMessage, [message, 'info', undefined]);
      validatePluginCall(mockPlugin3.captureMessage, [message, 'info', undefined]);
    });
  });

  describe('performance', () => {
    test('should handle large numbers of plugins efficiently', () => {
      const plugins = Array.from({ length: 100 }, (_, i) => createMockPlugin({ name: `mock${i}` }));

      const start = performance.now();

      const manager = builder.withPlugins(plugins).build();

      const end = performance.now();

      expect(manager.listPlugins()).toHaveLength(100);
      expect(end - start).toBeLessThan(100); // Should be fast
    });
  });
});
