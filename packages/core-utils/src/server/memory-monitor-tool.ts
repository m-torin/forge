/**
 * MCP Tool: Memory Monitor
 * Monitors memory usage, detects pressure, and performs cleanup
 * Enhanced with Node.js 22+ optimizations and advanced leak detection
 */

import { scheduler } from 'node:timers/promises';
import type { MCPToolResponse } from '../types/mcp';
// Import cleanup functions statically to prevent RCE vulnerability
import { totalmem } from 'node:os';
import { globalAdvancedMemoryMonitor } from './advanced-memory-monitor';
import { globalMemoryAwareCacheRegistry } from './memory-aware-cache';
import { globalResourceLifecycleManager } from './resource-lifecycle-manager';
import { cleanupAllSessions } from './test-runner';
import { ok, runTool } from './tool-helpers';
import { validateSessionId } from './validation';
// Enhanced dynamic memory management with Node.js 22+ optimizations
class MemoryThresholdCalculator {
  private static cache: Map<string, { threshold: number; timestamp: number }> = new Map();
  private static readonly CACHE_TTL = 60000; // 1 minute cache

  static calculateDynamicThreshold(userThreshold?: number): number {
    if (userThreshold && userThreshold > 0 && userThreshold <= 16384) {
      // Max 16GB user threshold
      return userThreshold;
    }

    const cacheKey = 'dynamic_threshold';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.threshold;
    }

    // Enhanced system memory analysis
    const systemMemoryMB = Math.round(totalmem() / 1024 / 1024);
    const currentUsage = process.memoryUsage();
    const currentUsageMB = Math.round(currentUsage.rss / 1024 / 1024);

    // Adaptive threshold based on current usage and system capacity
    let baseThreshold;
    if (systemMemoryMB < 2048) {
      // < 2GB system
      baseThreshold = Math.round(systemMemoryMB * 0.15); // 15% for low-memory systems
    } else if (systemMemoryMB < 8192) {
      // 2-8GB system
      baseThreshold = Math.round(systemMemoryMB * 0.12); // 12% for medium systems
    } else {
      // > 8GB system
      baseThreshold = Math.round(systemMemoryMB * 0.1); // 10% for high-memory systems
    }

    // Factor in current usage - increase threshold if currently using more
    const usageAdjustedThreshold = Math.max(baseThreshold, currentUsageMB * 1.2);

    const calculatedThreshold = Math.max(
      256, // Minimum 256MB (reduced for containers)
      Math.min(
        12288, // Maximum 12GB (increased for modern systems)
        usageAdjustedThreshold,
      ),
    );

    // Cache the result
    this.cache.set(cacheKey, {
      threshold: calculatedThreshold,
      timestamp: Date.now(),
    });

    return calculatedThreshold;
  }

  static getMemoryPressureLevel(
    currentUsageMB: number,
    thresholdMB: number,
  ): {
    level: 'low' | 'medium' | 'high' | 'critical';
    percentage: number;
    recommendation: string;
  } {
    const percentage = (currentUsageMB / thresholdMB) * 100;

    if (percentage < 50) {
      return {
        level: 'low',
        percentage,
        recommendation: 'Memory usage is optimal',
      };
    } else if (percentage < 70) {
      return {
        level: 'medium',
        percentage,
        recommendation: 'Monitor memory usage, consider periodic cleanup',
      };
    } else if (percentage < 85) {
      return {
        level: 'high',
        percentage,
        recommendation: 'High memory usage detected, trigger cleanup operations',
      };
    } else {
      return {
        level: 'critical',
        percentage,
        recommendation: 'Critical memory usage, immediate cleanup required',
      };
    }
  }
}

// Wrapper function for backward compatibility
function calculateDynamicThreshold(userThreshold?: number): number {
  return MemoryThresholdCalculator.calculateDynamicThreshold(userThreshold);
}

export interface MemoryMonitorArgs {
  action:
    | 'getUsage'
    | 'checkPressure'
    | 'cleanup'
    | 'detectLeaks'
    | 'comprehensiveReport'
    | 'forceGC';
  threshold?: number;
  enableAdvancedAnalysis?: boolean;
  includeResourceTracking?: boolean;
  sessionId?: string;
  signal?: AbortSignal;
}

export const memoryMonitorTool = {
  name: 'memory_monitor',
  description: 'Enhanced memory monitoring with leak detection and Node.js 22+ optimizations',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'getUsage',
          'checkPressure',
          'cleanup',
          'detectLeaks',
          'comprehensiveReport',
          'forceGC',
        ],
        description: 'Action to perform',
      },
      threshold: {
        type: 'number',
        description:
          'Memory pressure threshold in MB (default: auto-calculated based on system memory)',
      },
      enableAdvancedAnalysis: {
        type: 'boolean',
        description: 'Enable advanced memory leak detection and analysis (default: false)',
      },
      includeResourceTracking: {
        type: 'boolean',
        description: 'Include resource lifecycle tracking in reports (default: false)',
      },
      sessionId: {
        type: 'string',
        description: 'Session identifier for tracking',
      },
      signal: {
        type: 'object',
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['action'],
  },

  async execute(args: MemoryMonitorArgs): Promise<MCPToolResponse> {
    return runTool('memory_monitor', args.action, async () => {
      const {
        action,
        threshold: userThreshold,
        enableAdvancedAnalysis = false,
        includeResourceTracking = false,
        sessionId,
      } = args;
      const threshold = calculateDynamicThreshold(userThreshold);

      // Validate session ID if provided
      if (sessionId) {
        const sessionValidation = validateSessionId(sessionId);
        if (!sessionValidation.isValid) {
          throw new Error(`Invalid session ID: ${sessionValidation.error}`);
        }
      }

      switch (action) {
        case 'getUsage': {
          const usage = process.memoryUsage();
          const systemMemoryMB = Math.round(totalmem() / 1024 / 1024);
          const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
          const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
          const externalMB = Math.round(usage.external / 1024 / 1024);
          const rssMB = Math.round(usage.rss / 1024 / 1024);

          // Enhanced memory analysis with Node.js 22+ features
          const pressureInfo = MemoryThresholdCalculator.getMemoryPressureLevel(
            heapUsedMB,
            threshold,
          );

          // Additional metrics for better monitoring
          const arrayBuffers = usage.arrayBuffers
            ? Math.round(usage.arrayBuffers / 1024 / 1024)
            : 0;
          const heapUtilization = Math.round((usage.heapUsed / usage.heapTotal) * 100);
          const systemUtilization = Math.round((rssMB / systemMemoryMB) * 100);

          const result: any = {
            // Basic metrics
            heapUsed: heapUsedMB,
            heapTotal: heapTotalMB,
            external: externalMB,
            rss: rssMB,
            arrayBuffers, // Node.js 22+ metric

            // Utilization metrics
            heapUtilization,
            systemUtilization,

            // Pressure analysis
            memoryPressure: pressureInfo,
            pressureThreshold: threshold,

            // System context
            systemTotalMemory: systemMemoryMB,

            // Performance insights
            gc: {
              available: typeof global.gc === 'function',
              recommended: pressureInfo.level === 'high' || pressureInfo.level === 'critical',
            },

            // Timestamp for tracking
            timestamp: Date.now(),
            uptime: Math.round(process.uptime()),
          };

          // Add advanced analysis if enabled
          if (enableAdvancedAnalysis) {
            const advancedPressure = globalAdvancedMemoryMonitor.getMemoryPressure();
            const cacheStats = globalMemoryAwareCacheRegistry.getGlobalStats();

            result.advanced = {
              pressure: advancedPressure,
              cacheStats,
              leakDetectionEnabled: true,
            };
          }

          // Add resource tracking if enabled
          if (includeResourceTracking) {
            const resourceStats = globalResourceLifecycleManager.getStatistics();
            result.resourceTracking = resourceStats;
          }

          return ok(result);
        }

        case 'checkPressure': {
          const usage = process.memoryUsage();
          const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
          const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
          const rssMB = Math.round(usage.rss / 1024 / 1024);
          const heapUtilization = Math.round((usage.heapUsed / usage.heapTotal) * 100);

          // Enhanced pressure analysis
          const pressureInfo = MemoryThresholdCalculator.getMemoryPressureLevel(
            heapUsedMB,
            threshold,
          );
          const isHigh = pressureInfo.level === 'high' || pressureInfo.level === 'critical';

          // Additional pressure indicators
          const systemPressure = rssMB / (totalmem() / 1024 / 1024) > 0.8;
          const heapFragmentation = (heapTotalMB - heapUsedMB) / heapTotalMB > 0.3;

          interface MemoryPressureResult {
            isHigh: boolean;
            level: string;
            heapUsedMB: number;
            heapTotalMB: number;
            heapUtilization: number;
            systemMemoryMB: number;
            threshold: number;
            pressureFactors: string[];
            emergencyCleanup?: boolean;
            emergencyCleanupError?: string;
            recommendations: string[];
            advancedAnalysis?: any;
          }

          const pressureFactors: string[] = [];
          const recommendations: string[] = [];

          if (heapUsedMB > threshold) pressureFactors.push('heap_size_exceeded');
          if (heapUtilization > 85) pressureFactors.push('high_heap_utilization');
          if (systemPressure) pressureFactors.push('system_memory_pressure');
          if (heapFragmentation) pressureFactors.push('heap_fragmentation');

          // Generate contextual recommendations
          if (pressureFactors.length > 0) {
            if (pressureFactors.includes('heap_size_exceeded')) {
              recommendations.push('Consider increasing heap size or implementing memory pooling');
            }
            if (pressureFactors.includes('high_heap_utilization')) {
              recommendations.push('Trigger garbage collection and cleanup unused objects');
            }
            if (pressureFactors.includes('heap_fragmentation')) {
              recommendations.push('Force GC to reduce heap fragmentation');
            }
          } else {
            recommendations.push('Memory usage is within normal parameters');
          }

          const result: MemoryPressureResult = {
            isHigh,
            level: pressureInfo.level,
            heapUsedMB,
            heapTotalMB,
            heapUtilization,
            systemMemoryMB: Math.round(totalmem() / 1024 / 1024),
            threshold,
            pressureFactors,
            recommendations,
          };

          // Add advanced analysis if enabled
          if (enableAdvancedAnalysis) {
            result.advancedAnalysis = globalAdvancedMemoryMonitor.getMemoryPressure();
          }

          // Enhanced emergency cleanup with better thresholds
          const criticalConditions = [
            heapUtilization > 95,
            heapUsedMB > 8000, // Increased threshold for modern systems
            pressureInfo.level === 'critical',
            systemPressure && heapUtilization > 80,
          ];

          if (criticalConditions.some(condition => condition)) {
            queueMicrotask(() => {
              process.stderr.write(
                `CRITICAL MEMORY PRESSURE: ${heapUsedMB}MB/${heapTotalMB}MB (${heapUtilization}%), factors: ${pressureFactors.join(', ')}\n`,
              );
            });

            try {
              // Enhanced cleanup sequence
              await cleanupAllSessions();

              // Clean up advanced memory management systems
              if (enableAdvancedAnalysis) {
                await globalMemoryAwareCacheRegistry.cleanupAll();
                await globalResourceLifecycleManager.forceCleanup({
                  priority: 'low',
                });
              }

              // Multiple GC passes for better cleanup
              if (global.gc) {
                for (let i = 0; i < 3; i++) {
                  global.gc();
                  await scheduler.wait(10); // Small delay between GC calls
                }
              }

              result.emergencyCleanup = true;
            } catch (error) {
              queueMicrotask(() => {
                process.stderr.write(
                  `Emergency cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`,
                );
              });
              result.emergencyCleanupError =
                error instanceof Error ? error.message : 'Unknown error';
            }
          }

          return ok(result);
        }

        case 'cleanup': {
          const beforeUsage = process.memoryUsage();
          const beforeHeapMB = Math.round(beforeUsage.heapUsed / 1024 / 1024);

          let gcPerformed = false;
          let error = null;
          let advancedCleanupResults: any = null;

          try {
            // Advanced cleanup if enabled
            if (enableAdvancedAnalysis) {
              const cacheCleanup = await globalMemoryAwareCacheRegistry.cleanupAll();
              const resourceCleanup = await globalResourceLifecycleManager.forceCleanup({
                olderThan: 300000, // 5 minutes
                priority: 'low',
              });
              const leakCleanup = await globalAdvancedMemoryMonitor.cleanupLeakedObjects();

              advancedCleanupResults = {
                cacheCleanup,
                resourceCleanup,
                leakCleanup,
              };
            }

            // Force garbage collection if available
            if (global.gc) {
              global.gc();
              gcPerformed = true;
            } else {
              error = 'Garbage collection not available (run with --expose-gc)';
            }
          } catch (err) {
            error = `Cleanup error: ${err instanceof Error ? err.message : 'Unknown error'}`;
          }

          // Small delay to allow GC to complete
          await scheduler.wait(100);

          const afterUsage = process.memoryUsage();
          const afterHeapMB = Math.round(afterUsage.heapUsed / 1024 / 1024);
          const freedMB = beforeHeapMB - afterHeapMB;

          const result: any = {
            success: gcPerformed && !error,
            gcPerformed,
            error,
            beforeHeapMB,
            afterHeapMB,
            freedMB,
            message: gcPerformed ? `GC performed, freed ${freedMB}MB` : error || 'GC not available',
          };

          if (advancedCleanupResults) {
            result.advancedCleanup = advancedCleanupResults;
          }

          return ok(result);
        }

        case 'detectLeaks': {
          if (!enableAdvancedAnalysis) {
            throw new Error(
              'Advanced analysis must be enabled for leak detection. Set enableAdvancedAnalysis: true',
            );
          }

          const leaks = await globalAdvancedMemoryMonitor.detectMemoryLeaks();
          const resourceStats = globalResourceLifecycleManager.getStatistics();

          return ok({
            totalLeaks: leaks.length,
            criticalLeaks: leaks.filter(l => l.severity === 'critical').length,
            highSeverityLeaks: leaks.filter(l => l.severity === 'high').length,
            leaks,
            resourceStats: {
              totalResources: resourceStats.resources.total,
              leakPatterns: resourceStats.leakPatterns,
            },
          });
        }

        case 'comprehensiveReport': {
          const usage = process.memoryUsage();
          const basicStats = {
            heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024),
            heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024),
            rssMemoryMB: Math.round(usage.rss / 1024 / 1024),
            timestamp: Date.now(),
          };

          let report: any = {
            basic: basicStats,
            pressure: MemoryThresholdCalculator.getMemoryPressureLevel(
              basicStats.heapUsedMB,
              threshold,
            ),
            system: {
              totalMemoryMB: Math.round(totalmem() / 1024 / 1024),
              uptime: process.uptime(),
            },
          };

          if (enableAdvancedAnalysis) {
            report.advanced = await globalAdvancedMemoryMonitor.getMemoryReport();
          }

          if (includeResourceTracking) {
            report.resourceTracking = globalResourceLifecycleManager.getStatistics();
            report.cacheAnalytics = globalMemoryAwareCacheRegistry.getGlobalStats();
          }

          return ok(report);
        }

        case 'forceGC': {
          if (!enableAdvancedAnalysis) {
            // Fallback to basic GC
            if (global.gc) {
              const beforeUsage = process.memoryUsage();
              global.gc();
              await scheduler.wait(100);
              const afterUsage = process.memoryUsage();

              return ok({
                success: true,
                method: 'basic',
                memoryFreed: Math.round((beforeUsage.heapUsed - afterUsage.heapUsed) / 1024 / 1024),
              });
            } else {
              throw new Error('Garbage collection not available (run with --expose-gc)');
            }
          }

          const gcResult = await globalAdvancedMemoryMonitor.performIntelligentGC({
            forceFullGC: true,
            waitForCompletion: true,
          });

          return ok(gcResult);
        }

        default:
          throw new Error(
            `Unknown action: ${action}. Supported actions: getUsage, checkPressure, cleanup, detectLeaks, comprehensiveReport, forceGC`,
          );
      }

      // This should never be reached due to default case throwing
      throw new Error('Unreachable code');
    });
  },
};
