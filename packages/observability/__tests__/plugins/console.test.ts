import { ConsolePlugin, ConsoleServerPlugin } from '#/plugins/console';
import { vi } from 'vitest';

// Use centralized test factory and utilities
import { createObservabilityTestSuite, createScenarios } from '../plugin-test-factory';
import { createTestData } from '../test-data-generators';

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Create plugin factory for testing
function createConsoleTestPlugin(config?: any) {
  const originalConsole = global.console;
  global.console = mockConsole as any;

  const plugin = new ConsolePlugin({
    enabled: true,
    prefix: '[Test]',
    ...config,
  });

  // Restore console after test
  const cleanup = () => {
    global.console = originalConsole;
  };

  return Object.assign(plugin, { cleanup });
}

// Generate standard test suite for ConsolePlugin
createObservabilityTestSuite({
  pluginName: 'console',
  createPlugin: createConsoleTestPlugin,
  defaultConfig: {
    enabled: true,
    prefix: '[Test]',
  },
  scenarios: [
    ...createScenarios.initialization([
      {
        name: 'custom configuration',
        description: 'should initialize with custom configuration',
        test: (plugin: any) => {
          const customPlugin = createConsoleTestPlugin({
            enabled: false,
            prefix: '[Custom]',
            colors: false,
          });

          expect(customPlugin.name).toBe('console');
          expect(customPlugin.enabled).toBeFalsy();

          customPlugin.cleanup();
        },
      },
    ]),
    ...createScenarios.integration([
      {
        name: 'console integration workflow',
        description: 'should handle complete Console workflow',
        test: async (plugin: any) => {
          await plugin.initialize();

          // Set user
          const user = createTestData.user();
          plugin.setUser(user);
          expect(mockConsole.info).toHaveBeenCalledWith('[Test]', 'User set:', user);

          // Add breadcrumb
          const breadcrumb = createTestData.breadcrumb();
          plugin.addBreadcrumb(breadcrumb);
          expect(mockConsole.log).toHaveBeenCalledWith('[Test]', 'Breadcrumb:', breadcrumb);

          // Capture message
          const message = 'Integration test message';
          plugin.captureMessage(message, 'info');
          expect(mockConsole.info).toHaveBeenCalledWith(
            '[Test]',
            'Info:',
            message,
            expect.any(Object),
          );

          // Capture error
          const error = createTestData.error();
          plugin.captureException(error);
          expect(mockConsole.error).toHaveBeenCalledWith(
            '[Test]',
            'Error:',
            error,
            expect.any(Object),
          );

          // Flush
          await (plugin as any).flush();
          expect(mockConsole.log).toHaveBeenCalledWith('[Test]', 'Flushed');

          // Shutdown
          await plugin.shutdown();

          (plugin as any).cleanup?.();
        },
      },
    ]),
  ],
  isServerPlugin: false,
});

// Generate standard test suite for ConsoleServerPlugin
createObservabilityTestSuite({
  pluginName: 'console',
  createPlugin: (config: any) => {
    const originalConsole = global.console;
    global.console = mockConsole as any;

    const plugin = new ConsoleServerPlugin({
      enabled: true,
      prefix: '[Test Server]',
      ...config,
    });

    const cleanup = () => {
      global.console = originalConsole;
    };

    return Object.assign(plugin, { cleanup });
  },
  defaultConfig: {
    enabled: true,
    prefix: '[Test Server]',
  },
  scenarios: [
    ...createScenarios.initialization([
      {
        name: 'server plugin initialization',
        description: 'should initialize server plugin correctly',
        test: (plugin: any) => {
          expect(plugin.name).toBe('console');
          expect(plugin.enabled).toBeTruthy();
          (plugin as any).cleanup?.();
        },
      },
    ]),
  ],
  isServerPlugin: true,
});
