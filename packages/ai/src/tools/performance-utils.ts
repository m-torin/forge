/**
 * Performance Tracking Utilities for AI SDK Tools
 *
 * Provides lightweight performance monitoring for tool execution
 * Optional utilities for performance analysis
 */

import { type Tool } from 'ai';

// Internal tracking store (hidden from users)
const performanceStore = new Map<string, { calls: number; totalTime: number }>();

/**
 * Wrap tool with performance tracking
 */
export function wrapWithTracking(name: string, tool: Tool): Tool {
  const originalExecute = tool.execute;

  return {
    ...tool,
    execute: async (args: any, options: any) => {
      const start = Date.now();
      try {
        const result = await originalExecute?.(args, options);
        const elapsed = Date.now() - start;

        const stats = performanceStore.get(name) || { calls: 0, totalTime: 0 };
        stats.calls++;
        stats.totalTime += elapsed;
        performanceStore.set(name, stats);

        return result;
      } catch (error) {
        const elapsed = Date.now() - start;

        const stats = performanceStore.get(name) || { calls: 0, totalTime: 0 };
        stats.calls++;
        stats.totalTime += elapsed;
        performanceStore.set(name, stats);

        throw error;
      }
    },
  };
}

/**
 * Get performance metrics (only available when tracking is enabled)
 */
export function getMetrics(): Record<string, { calls: number; avgTime: number }> {
  const metrics: Record<string, { calls: number; avgTime: number }> = {};

  for (const [name, stats] of performanceStore) {
    metrics[name] = {
      calls: stats.calls,
      avgTime: stats.calls > 0 ? stats.totalTime / stats.calls : 0,
    };
  }

  return metrics;
}

/**
 * Clear performance metrics
 */
export function clearMetrics(): void {
  performanceStore.clear();
}

/**
 * Utility to wrap multiple tools with performance tracking
 */
export function wrapToolsWithTracking(tools: Record<string, Tool>): Record<string, Tool> {
  const wrapped: Record<string, Tool> = {};

  for (const [name, tool] of Object.entries(tools)) {
    wrapped[name] = wrapWithTracking(name, tool);
  }

  return wrapped;
}

/**
 * Get performance summary for debugging
 */
export function getPerformanceSummary(): {
  totalTools: number;
  totalCalls: number;
  averageTime: number;
  slowestTool: string | null;
  fastestTool: string | null;
} {
  const metrics = getMetrics();
  const toolNames = Object.keys(metrics);

  if (toolNames.length === 0) {
    return {
      totalTools: 0,
      totalCalls: 0,
      averageTime: 0,
      slowestTool: null,
      fastestTool: null,
    };
  }

  const totalCalls = Object.values(metrics).reduce((sum, m) => sum + m.calls, 0);
  const totalTime = Object.values(metrics).reduce((sum, m) => sum + m.avgTime * m.calls, 0);

  let slowestTool = toolNames[0];
  let fastestTool = toolNames[0];

  for (const toolName of toolNames) {
    if (metrics[toolName].avgTime > metrics[slowestTool].avgTime) {
      slowestTool = toolName;
    }
    if (metrics[toolName].avgTime < metrics[fastestTool].avgTime) {
      fastestTool = toolName;
    }
  }

  return {
    totalTools: toolNames.length,
    totalCalls,
    averageTime: totalCalls > 0 ? totalTime / totalCalls : 0,
    slowestTool,
    fastestTool,
  };
}
