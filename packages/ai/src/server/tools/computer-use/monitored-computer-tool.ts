/**
 * Monitored Computer Tool
 * Computer tool with integrated resource monitoring and security controls
 */

import { logError, logInfo, logWarn } from '@repo/observability/server/next';
import { tool } from 'ai';
import {
  ComputerToolInputSchema,
  type ComputerToolConfig,
  type ComputerToolInput,
} from './computer-tool';
import { ComputerToolMonitor, type ComputerToolSecurityConfig } from './resource-monitoring';

/**
 * Enhanced computer tool configuration with monitoring
 */
export interface MonitoredComputerToolConfig extends ComputerToolConfig {
  /** Security and monitoring configuration */
  monitoring?: ComputerToolSecurityConfig;
  /** Enable automatic security monitoring */
  enableMonitoring?: boolean;
  /** Callback for security violations */
  onSecurityViolation?: (violation: { type: string; details: string }) => void;
  /** Callback for resource warnings */
  onResourceWarning?: (warning: { type: string; details: string; metrics: any }) => void;
}

/**
 * Create a monitored computer tool with security and resource tracking
 */
export function createMonitoredComputerTool(config: MonitoredComputerToolConfig = {}) {
  const {
    enableScreenshot = true,
    enableInput = true,
    screenshotProvider,
    inputSimulator,
    sandbox = false,
    maxWaitTime = 30,
    monitoring,
    enableMonitoring = true,
    onSecurityViolation,
    onResourceWarning,
  } = config;

  // Initialize monitor if enabled
  const monitor = enableMonitoring ? new ComputerToolMonitor(monitoring) : null;
  let monitoringStarted = false;

  return tool({
    description:
      'Monitored computer interaction tool - take screenshots and simulate user input with security monitoring',
    parameters: ComputerToolInputSchema,
    execute: async (input: ComputerToolInput, _options: any) => {
      // Start monitoring on first use
      if (monitor && !monitoringStarted) {
        monitor.startMonitoring();
        monitoringStarted = true;
      }

      const startTime = Date.now();

      // Pre-execution security check
      if (monitor) {
        const securityCheck = monitor.preActionCheck(input);
        if (!securityCheck.allowed) {
          const violation = {
            type: 'security_violation',
            details: securityCheck.reason || 'Unknown security violation',
          };

          if (onSecurityViolation) {
            onSecurityViolation(violation);
          }

          logWarn('Monitored Computer Tool: Security violation', {
            operation: 'monitored_computer_tool_security_violation',
            metadata: {
              action: input.action,
              reason: securityCheck.reason,
            },
          });

          return {
            action: input.action,
            success: false,
            error: `Security violation: ${securityCheck.reason}`,
            securityBlocked: true,
            timestamp: new Date().toISOString(),
          };
        }
      }

      let result: any;

      try {
        logInfo('Monitored Computer Tool: Executing action', {
          operation: 'monitored_computer_tool_execute',
          metadata: {
            action: input.action,
            sandbox,
            hasCoordinate: !!input.coordinate,
            monitoringEnabled: !!monitor,
          },
        });

        // Execute the action based on type
        result = await executeComputerAction(input, {
          enableScreenshot,
          enableInput,
          screenshotProvider,
          inputSimulator,
          sandbox,
          maxWaitTime,
        });

        const executionTime = Date.now() - startTime;

        // Record action in monitor
        if (monitor) {
          monitor.recordAction(input, result, executionTime);

          // Check for resource warnings
          const currentMetrics = monitor.getCurrentMetrics();

          // Check memory usage
          if (currentMetrics.memory.peakMemoryMB > (monitoring?.maxMemoryUsageMB || 500) * 0.8) {
            const warning = {
              type: 'memory_warning',
              details: `Memory usage approaching limit: ${currentMetrics.memory.peakMemoryMB.toFixed(2)}MB`,
              metrics: currentMetrics,
            };

            if (onResourceWarning) {
              onResourceWarning(warning);
            }

            logWarn('Monitored Computer Tool: Memory usage warning', {
              operation: 'monitored_computer_tool_memory_warning',
              metadata: warning,
            });
          }

          // Check error rate
          if (
            currentMetrics.errors.totalErrors > 0 &&
            currentMetrics.cpu.actionsPerformed > 5 &&
            currentMetrics.errors.totalErrors / currentMetrics.cpu.actionsPerformed > 0.2
          ) {
            const warning = {
              type: 'error_rate_warning',
              details: `High error rate detected: ${((currentMetrics.errors.totalErrors / currentMetrics.cpu.actionsPerformed) * 100).toFixed(1)}%`,
              metrics: currentMetrics,
            };

            if (onResourceWarning) {
              onResourceWarning(warning);
            }

            logWarn('Monitored Computer Tool: High error rate warning', {
              operation: 'monitored_computer_tool_error_rate_warning',
              metadata: warning,
            });
          }
        }

        // Add monitoring metadata to result
        if (monitor) {
          const currentMetrics = monitor.getCurrentMetrics();
          result.monitoring = {
            executionTime,
            resourceUsage: {
              memoryMB: currentMetrics.memory.peakMemoryMB,
              cpuPercent: currentMetrics.cpu.peakUsagePercent,
            },
            securityScore: currentMetrics.security.riskScore,
            actionCount: currentMetrics.cpu.actionsPerformed,
          };
        }

        return result;
      } catch (error) {
        const executionTime = Date.now() - startTime;

        const errorResult = {
          action: input.action,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };

        // Record failed action in monitor
        if (monitor) {
          monitor.recordAction(input, errorResult, executionTime);
        }

        logError('Monitored Computer Tool: Action failed', {
          operation: 'monitored_computer_tool_error',
          metadata: { action: input.action },
          error: error instanceof Error ? error : new Error(String(error)),
        });

        return errorResult;
      }
    },
  });
}

/**
 * Execute computer action with proper error handling
 */
async function executeComputerAction(
  input: ComputerToolInput,
  config: {
    enableScreenshot: boolean;
    enableInput: boolean;
    screenshotProvider?: () => Promise<string>;
    inputSimulator?: (action: ComputerToolInput) => Promise<boolean>;
    sandbox: boolean;
    maxWaitTime: number;
  },
): Promise<any> {
  const {
    enableScreenshot,
    enableInput,
    screenshotProvider,
    inputSimulator,
    sandbox,
    maxWaitTime,
  } = config;

  // Sandbox mode - return simulated results
  if (sandbox) {
    return simulateComputerAction(input);
  }

  switch (input.action) {
    case 'screenshot': {
      if (!enableScreenshot) {
        throw new Error('Screenshot capability is disabled');
      }

      const screenshot = screenshotProvider
        ? await screenshotProvider()
        : await defaultScreenshotProvider();

      return {
        action: 'screenshot',
        success: true,
        screenshot,
        resolution: [1920, 1080], // Default resolution
        timestamp: new Date().toISOString(),
      };
    }

    case 'click':
    case 'double_click':
    case 'right_click':
    case 'middle_click': {
      if (!enableInput) {
        throw new Error('Input simulation is disabled');
      }

      if (!input.coordinate) {
        throw new Error(`Coordinate required for ${input.action}`);
      }

      const success = inputSimulator
        ? await inputSimulator(input)
        : await defaultClickSimulator(input.action, input.coordinate);

      return {
        action: input.action,
        success,
        coordinate: input.coordinate,
        timestamp: new Date().toISOString(),
      };
    }

    case 'move':
    case 'drag': {
      if (!enableInput) {
        throw new Error('Input simulation is disabled');
      }

      if (!input.coordinate) {
        throw new Error(`Coordinate required for ${input.action}`);
      }

      const success = inputSimulator
        ? await inputSimulator(input)
        : await defaultMoveSimulator(input.action, input.coordinate);

      return {
        action: input.action,
        success,
        coordinate: input.coordinate,
        timestamp: new Date().toISOString(),
      };
    }

    case 'type': {
      if (!enableInput) {
        throw new Error('Input simulation is disabled');
      }

      if (!input.text) {
        throw new Error('Text required for type action');
      }

      const success = inputSimulator
        ? await inputSimulator(input)
        : await defaultTypeSimulator(input.text);

      return {
        action: 'type',
        success,
        textLength: input.text.length,
        timestamp: new Date().toISOString(),
      };
    }

    case 'key': {
      if (!enableInput) {
        throw new Error('Input simulation is disabled');
      }

      if (!input.key) {
        throw new Error('Key required for key action');
      }

      const success = inputSimulator
        ? await inputSimulator(input)
        : await defaultKeySimulator(input.key);

      return {
        action: 'key',
        success,
        key: input.key,
        timestamp: new Date().toISOString(),
      };
    }

    case 'scroll': {
      if (!enableInput) {
        throw new Error('Input simulation is disabled');
      }

      if (!input.direction || input.amount === undefined) {
        throw new Error('Direction and amount required for scroll action');
      }

      const success = inputSimulator
        ? await inputSimulator(input)
        : await defaultScrollSimulator(input.direction, input.amount);

      return {
        action: 'scroll',
        success,
        direction: input.direction,
        amount: input.amount,
        timestamp: new Date().toISOString(),
      };
    }

    case 'wait': {
      const waitTime = Math.min(input.amount || 1, maxWaitTime);
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));

      return {
        action: 'wait',
        success: true,
        duration: waitTime,
        timestamp: new Date().toISOString(),
      };
    }

    default:
      throw new Error(`Unknown action: ${input.action}`);
  }
}

/**
 * Simulate computer action in sandbox mode (same as original computer-tool.ts)
 */
function simulateComputerAction(input: ComputerToolInput) {
  const baseResult = {
    action: input.action,
    success: true,
    sandbox: true,
    timestamp: new Date().toISOString(),
  };

  switch (input.action) {
    case 'screenshot':
      return {
        ...baseResult,
        screenshot:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        resolution: [1920, 1080],
      };

    case 'click':
    case 'double_click':
    case 'right_click':
    case 'middle_click':
      return {
        ...baseResult,
        coordinate: input.coordinate || [0, 0],
        element: 'simulated_element',
      };

    case 'move':
    case 'drag':
      return {
        ...baseResult,
        coordinate: input.coordinate || [0, 0],
        distance: Math.sqrt(
          Math.pow(input.coordinate?.[0] || 0, 2) + Math.pow(input.coordinate?.[1] || 0, 2),
        ),
      };

    case 'type':
      return {
        ...baseResult,
        textLength: input.text?.length || 0,
        words: input.text?.split(' ').length || 0,
      };

    case 'key':
      return {
        ...baseResult,
        key: input.key,
        modifiers: input.key?.includes('+') ? input.key.split('+').slice(0, -1) : [],
      };

    case 'scroll':
      return {
        ...baseResult,
        direction: input.direction,
        amount: input.amount,
        pixels: (input.amount || 0) * 100,
      };

    case 'wait':
      return {
        ...baseResult,
        duration: input.amount || 1,
      };

    default:
      return baseResult;
  }
}

// Default implementations (same as original computer-tool.ts)
async function defaultScreenshotProvider(): Promise<string> {
  logInfo('Monitored Computer Tool: Taking screenshot (simulated)', {
    operation: 'monitored_computer_tool_screenshot',
  });
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}

async function defaultClickSimulator(
  action: string,
  coordinate: [number, number],
): Promise<boolean> {
  logInfo(`Monitored Computer Tool: Simulating ${action}`, {
    operation: 'monitored_computer_tool_click',
    metadata: { action, coordinate },
  });
  return true;
}

async function defaultMoveSimulator(
  action: string,
  coordinate: [number, number],
): Promise<boolean> {
  logInfo(`Monitored Computer Tool: Simulating ${action}`, {
    operation: 'monitored_computer_tool_move',
    metadata: { action, coordinate },
  });
  return true;
}

async function defaultTypeSimulator(text: string): Promise<boolean> {
  logInfo('Monitored Computer Tool: Simulating typing', {
    operation: 'monitored_computer_tool_type',
    metadata: { textLength: text.length },
  });
  return true;
}

async function defaultKeySimulator(key: string): Promise<boolean> {
  logInfo('Monitored Computer Tool: Simulating key press', {
    operation: 'monitored_computer_tool_key',
    metadata: { key },
  });
  return true;
}

async function defaultScrollSimulator(direction: string, amount: number): Promise<boolean> {
  logInfo('Monitored Computer Tool: Simulating scroll', {
    operation: 'monitored_computer_tool_scroll',
    metadata: { direction, amount },
  });
  return true;
}

/**
 * Get monitoring report from a monitored tool instance
 */
export function getMonitoringReport(_toolInstance: any): {
  metrics?: any;
  securityReport?: any;
  recommendations?: string[];
} | null {
  // In a real implementation, this would extract the monitor from the tool
  // For now, return null as this is a factory function
  return null;
}

/**
 * Monitoring utilities for computer tools
 */
export const monitoredComputerToolUtils = {
  /**
   * Create a secure monitored computer tool
   */
  createSecure: (additionalConfig?: Partial<MonitoredComputerToolConfig>) => {
    return createMonitoredComputerTool({
      sandbox: false,
      enableMonitoring: true,
      monitoring: {
        blockedRegions: [
          { x: 0, y: 0, width: 100, height: 50, name: 'top-left-corner' },
          { x: 1820, y: 0, width: 100, height: 50, name: 'top-right-corner' },
          { x: 0, y: 1030, width: 1920, height: 50, name: 'dock-area' },
        ],
        allowedActions: ['screenshot', 'click', 'type', 'wait'] as any,
        maxActionsPerMinute: 30,
        maxScreenshotsPerMinute: 15,
        blockSensitiveDataAccess: true,
        monitorClipboard: true,
        preventFileAccess: true,
        allowNetworkAccess: false,
        maxMemoryUsageMB: 200,
        maxCPUUsagePercent: 50,
        maxExecutionTimeMs: 60000,
      },
      ...additionalConfig,
    });
  },

  /**
   * Create a development-friendly monitored computer tool
   */
  createDevelopment: (additionalConfig?: Partial<MonitoredComputerToolConfig>) => {
    return createMonitoredComputerTool({
      sandbox: true, // Safe for development
      enableMonitoring: true,
      monitoring: {
        maxActionsPerMinute: 120,
        maxScreenshotsPerMinute: 60,
        blockSensitiveDataAccess: false,
        monitorClipboard: false,
        preventFileAccess: false,
        allowNetworkAccess: true,
        maxMemoryUsageMB: 1000,
        maxCPUUsagePercent: 90,
        maxExecutionTimeMs: 600000,
      },
      ...additionalConfig,
    });
  },

  /**
   * Create a testing-optimized monitored computer tool
   */
  createTesting: (additionalConfig?: Partial<MonitoredComputerToolConfig>) => {
    return createMonitoredComputerTool({
      sandbox: true,
      enableMonitoring: true,
      monitoring: {
        maxActionsPerMinute: 1000, // High limits for testing
        maxScreenshotsPerMinute: 500,
        blockSensitiveDataAccess: false,
        maxMemoryUsageMB: 2000,
        maxCPUUsagePercent: 100,
        maxExecutionTimeMs: 1800000, // 30 minutes
      },
      ...additionalConfig,
    });
  },
};
