/**
 * Agent Performance Monitoring Tests
 * Testing performance tracking, metrics collection, and optimization recommendations
 */

import '@repo/qa/vitest/setup/next-app';
import { afterEach, beforeEach, describe, expect } from 'vitest';
import {
  AgentPerformanceMonitor,
  performanceAnalysisUtils,
} from '../../../src/server/agents/performance-monitoring';

describe('agentPerformanceMonitor', () => {
  let monitor: AgentPerformanceMonitor;

  beforeEach(() => {
    monitor = new AgentPerformanceMonitor({
      enablePerformanceTracking: true,
      trackMemoryUsage: true,
      performanceThresholds: {
        maxExecutionTime: 5000,
        maxMemoryUsage: 50 * 1024 * 1024, // 50MB
        maxStepDuration: 1000,
      },
      samplingConfig: {
        sampleRate: 1.0, // 100% sampling for tests
        maxSamples: 100,
      },
    });
  });

  afterEach(() => {
    monitor.destroy();
  });

  describe('basic Performance Tracking', () => {
    test('should track step execution performance', async () => {
      const stepId = 'test-step-1';
      const workflowId = 'test-workflow';

      // Start tracking
      monitor.startStepTracking(stepId, workflowId, {
        stepName: 'Test Step',
        stepType: 'action',
        complexity: 'medium',
      });

      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100));

      // End tracking
      monitor.endStepTracking(stepId, {
        success: true,
        resultSize: 1024,
      });

      const metrics = monitor.getStepMetrics(stepId);
      expect(metrics).toBeDefined();
      expect(metrics!.executionTime).toBeGreaterThan(90);
      expect(metrics!.executionTime).toBeLessThan(150);
      expect(metrics!.success).toBeTruthy();
      expect(metrics!.resultSize).toBe(1024);
    });

    test('should track memory usage during step execution', async () => {
      const stepId = 'memory-test-step';
      const workflowId = 'memory-workflow';

      monitor.startStepTracking(stepId, workflowId, {
        stepName: 'Memory Test Step',
        stepType: 'action',
        complexity: 'high',
      });

      // Simulate memory-intensive operation
      const largeArray = new Array(1000).fill('memory-test-data');

      monitor.endStepTracking(stepId, {
        success: true,
        memoryDelta: 1024 * 1024, // 1MB memory increase
      });

      const metrics = monitor.getStepMetrics(stepId);
      expect(metrics).toBeDefined();
      expect(metrics!.memoryUsage?.memoryDelta).toBe(1024 * 1024);
    });

    test('should handle step tracking errors gracefully', async () => {
      const stepId = 'error-step';
      const workflowId = 'error-workflow';

      monitor.startStepTracking(stepId, workflowId, {
        stepName: 'Error Step',
        stepType: 'action',
        complexity: 'low',
      });

      // End tracking with error
      monitor.endStepTracking(stepId, {
        success: false,
        error: 'Step execution failed',
        errorType: 'runtime_error',
      });

      const metrics = monitor.getStepMetrics(stepId);
      expect(metrics).toBeDefined();
      expect(metrics!.success).toBeFalsy();
      expect(metrics!.error).toBe('Step execution failed');
      expect(metrics!.errorType).toBe('runtime_error');
    });
  });

  describe('workflow Performance Analysis', () => {
    test('should track complete workflow performance', async () => {
      const workflowId = 'complete-workflow';
      const steps = ['step1', 'step2', 'step3'];

      // Execute a complete workflow
      for (let i = 0; i < steps.length; i++) {
        const stepId = steps[i];
        monitor.startStepTracking(stepId, workflowId, {
          stepName: `Step ${i + 1}`,
          stepType: 'action',
          complexity: 'medium',
        });

        await new Promise(resolve => setTimeout(resolve, 50 + i * 25)); // Increasing delays

        monitor.endStepTracking(stepId, {
          success: true,
          resultSize: 100 * (i + 1),
        });
      }

      const workflowMetrics = monitor.getWorkflowMetrics(workflowId);
      expect(workflowMetrics).toBeDefined();
      expect(workflowMetrics!.totalSteps).toBe(3);
      expect(workflowMetrics!.completedSteps).toBe(3);
      expect(workflowMetrics!.totalExecutionTime).toBeGreaterThan(120); // ~50+75+100ms
      expect(workflowMetrics!.averageStepDuration).toBeGreaterThan(40);
    });

    test('should identify performance bottlenecks', async () => {
      const workflowId = 'bottleneck-workflow';
      const steps = [
        { id: 'fast-step', delay: 10 },
        { id: 'slow-step', delay: 200 }, // Bottleneck
        { id: 'normal-step', delay: 50 },
      ];

      for (const step of steps) {
        monitor.startStepTracking(step.id, workflowId, {
          stepName: step.id,
          stepType: 'action',
          complexity: 'medium',
        });

        await new Promise(resolve => setTimeout(resolve, step.delay));

        monitor.endStepTracking(step.id, { success: true });
      }

      const bottlenecks = monitor.identifyBottlenecks(workflowId);
      expect(bottlenecks).toBeDefined();
      expect(bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks[0].stepId).toBe('slow-step');
      expect(bottlenecks[0].impact).toBeGreaterThan(0.5); // High impact
    });

    test('should calculate workflow efficiency metrics', async () => {
      const workflowId = 'efficiency-workflow';

      // Execute workflow with mixed performance
      const stepConfigs = [
        { id: 'efficient-step', delay: 30, success: true },
        { id: 'inefficient-step', delay: 150, success: true },
        { id: 'failed-step', delay: 50, success: false },
      ];

      for (const config of stepConfigs) {
        monitor.startStepTracking(config.id, workflowId, {
          stepName: config.id,
          stepType: 'action',
          complexity: 'medium',
        });

        await new Promise(resolve => setTimeout(resolve, config.delay));

        monitor.endStepTracking(config.id, {
          success: config.success,
          error: config.success ? undefined : 'Simulated failure',
        });
      }

      const efficiency = monitor.calculateWorkflowEfficiency(workflowId);
      expect(efficiency).toBeDefined();
      expect(efficiency.overallEfficiency).toBeLessThan(1.0); // Should be less than 100% due to failure
      expect(efficiency.successRate).toBeCloseTo(2 / 3, 1); // 2 out of 3 steps succeeded
      expect(efficiency.performanceScore).toBeGreaterThan(0);
      expect(efficiency.performanceScore).toBeLessThan(100);
    });
  });

  describe('optimization Recommendations', () => {
    test('should generate performance optimization recommendations', async () => {
      const workflowId = 'optimization-workflow';

      // Create scenarios that should trigger various recommendations
      const scenarios = [
        { id: 'slow-step', delay: 300, complexity: 'high' },
        { id: 'memory-heavy-step', delay: 100, complexity: 'high', memoryDelta: 10 * 1024 * 1024 },
        { id: 'failing-step', delay: 50, complexity: 'low', success: false },
      ];

      for (const scenario of scenarios) {
        monitor.startStepTracking(scenario.id, workflowId, {
          stepName: scenario.id,
          stepType: 'action',
          complexity: scenario.complexity as any,
        });

        await new Promise(resolve => setTimeout(resolve, scenario.delay));

        monitor.endStepTracking(scenario.id, {
          success: scenario.success !== false,
          error: scenario.success === false ? 'Test failure' : undefined,
          memoryDelta: scenario.memoryDelta,
        });
      }

      const recommendations = monitor.getOptimizationRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);

      const performanceRecs = recommendations.filter(r => r.type === 'performance');
      const memoryRecs = recommendations.filter(r => r.type === 'memory');
      const reliabilityRecs = recommendations.filter(r => r.type === 'reliability');

      expect(performanceRecs.length).toBeGreaterThan(0);
      expect(memoryRecs.length).toBeGreaterThan(0);
      expect(reliabilityRecs.length).toBeGreaterThan(0);
    });

    test('should prioritize recommendations by impact', async () => {
      const workflowId = 'priority-workflow';

      // Create a critical performance issue
      monitor.startStepTracking('critical-step', workflowId, {
        stepName: 'Critical Slow Step',
        stepType: 'action',
        complexity: 'high',
      });

      await new Promise(resolve => setTimeout(resolve, 500)); // Very slow

      monitor.endStepTracking('critical-step', { success: true });

      const recommendations = monitor.getOptimizationRecommendations();
      const highPriorityRecs = recommendations.filter(r => r.priority === 'high');

      expect(highPriorityRecs.length).toBeGreaterThan(0);
      expect(highPriorityRecs[0].expectedImprovement).toBeGreaterThan(20);
    });
  });

  describe('performance Alerting', () => {
    test('should detect performance threshold violations', async () => {
      const alertMonitor = new AgentPerformanceMonitor({
        enablePerformanceTracking: true,
        performanceThresholds: {
          maxExecutionTime: 5000,
          maxStepDuration: 100, // Low threshold for testing
          maxMemoryUsage: 10 * 1024 * 1024, // 10MB
        },
        alerting: {
          enabled: true,
          thresholdViolationAlert: true,
        },
      });

      const stepId = 'threshold-violation-step';
      const workflowId = 'threshold-workflow';

      alertMonitor.startStepTracking(stepId, workflowId, {
        stepName: 'Threshold Violation Step',
        stepType: 'action',
        complexity: 'low',
      });

      // Exceed the threshold
      await new Promise(resolve => setTimeout(resolve, 150));

      alertMonitor.endStepTracking(stepId, { success: true });

      const alerts = alertMonitor.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(alert => alert.type === 'performance_threshold_violation')).toBeTruthy();

      alertMonitor.destroy();
    });

    test('should alert on memory usage spikes', async () => {
      const memoryMonitor = new AgentPerformanceMonitor({
        enablePerformanceTracking: true,
        trackMemoryUsage: true,
        performanceThresholds: {
          maxMemoryUsage: 5 * 1024 * 1024, // 5MB threshold
        },
        alerting: {
          enabled: true,
          memoryUsageAlert: true,
        },
      });

      const stepId = 'memory-spike-step';
      const workflowId = 'memory-workflow';

      memoryMonitor.startStepTracking(stepId, workflowId, {
        stepName: 'Memory Spike Step',
        stepType: 'action',
        complexity: 'high',
      });

      memoryMonitor.endStepTracking(stepId, {
        success: true,
        memoryDelta: 10 * 1024 * 1024, // 10MB spike
      });

      const alerts = memoryMonitor.getActiveAlerts();
      expect(alerts.some(alert => alert.type === 'memory_usage_alert')).toBeTruthy();

      memoryMonitor.destroy();
    });
  });

  describe('historical Performance Analysis', () => {
    test('should track performance trends over time', async () => {
      const workflowId = 'trend-workflow';

      // Simulate performance degradation over time
      for (let i = 0; i < 10; i++) {
        const stepId = `trend-step-${i}`;
        monitor.startStepTracking(stepId, workflowId, {
          stepName: `Trend Step ${i}`,
          stepType: 'action',
          complexity: 'medium',
        });

        // Gradually increasing execution time
        await new Promise(resolve => setTimeout(resolve, 50 + i * 10));

        monitor.endStepTracking(stepId, { success: true });
      }

      const trends = monitor.analyzePerformanceTrends(workflowId);
      expect(trends).toBeDefined();
      expect(trends.executionTimeTrend).toBe('degrading');
      expect(trends.trendSignificance).toBeGreaterThan(0.5);
    });

    test('should identify performance patterns', async () => {
      const workflowId = 'pattern-workflow';

      // Create a repeating pattern
      const pattern = [30, 60, 90, 60, 30]; // Performance cycle

      for (let cycle = 0; cycle < 3; cycle++) {
        for (let i = 0; i < pattern.length; i++) {
          const stepId = `pattern-step-${cycle}-${i}`;
          monitor.startStepTracking(stepId, workflowId, {
            stepName: `Pattern Step ${cycle}-${i}`,
            stepType: 'action',
            complexity: 'medium',
          });

          await new Promise(resolve => setTimeout(resolve, pattern[i]));

          monitor.endStepTracking(stepId, { success: true });
        }
      }

      const patterns = monitor.identifyPerformancePatterns(workflowId);
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].patternType).toBeDefined();
      expect(patterns[0].confidence).toBeGreaterThan(0.5);
    });
  });

  describe('resource Usage Monitoring', () => {
    test('should monitor CPU and memory usage', async () => {
      const resourceMonitor = new AgentPerformanceMonitor({
        enablePerformanceTracking: true,
        trackMemoryUsage: true,
        trackResourceUsage: true,
        samplingConfig: {
          resourceSamplingInterval: 100, // Sample every 100ms
        },
      });

      const stepId = 'resource-step';
      const workflowId = 'resource-workflow';

      resourceMonitor.startStepTracking(stepId, workflowId, {
        stepName: 'Resource Monitoring Step',
        stepType: 'action',
        complexity: 'high',
      });

      // Simulate resource-intensive work
      const intensiveWork = () => {
        const start = Date.now();
        while (Date.now() - start < 200) {
          Math.random() * Math.random();
        }
      };

      intensiveWork();

      resourceMonitor.endStepTracking(stepId, { success: true });

      const resourceMetrics = resourceMonitor.getResourceMetrics(stepId);
      expect(resourceMetrics).toBeDefined();
      expect(resourceMetrics!.samples.length).toBeGreaterThan(0);

      resourceMonitor.destroy();
    });
  });

  describe('performance Reporting', () => {
    test('should generate comprehensive performance reports', async () => {
      const workflowId = 'report-workflow';

      // Execute a diverse workflow
      const stepConfigs = [
        { id: 'fast-step', delay: 30, success: true, complexity: 'low' },
        { id: 'slow-step', delay: 200, success: true, complexity: 'high' },
        { id: 'failed-step', delay: 50, success: false, complexity: 'medium' },
        {
          id: 'memory-step',
          delay: 100,
          success: true,
          complexity: 'high',
          memoryDelta: 5 * 1024 * 1024,
        },
      ];

      for (const config of stepConfigs) {
        monitor.startStepTracking(config.id, workflowId, {
          stepName: config.id,
          stepType: 'action',
          complexity: config.complexity as any,
        });

        await new Promise(resolve => setTimeout(resolve, config.delay));

        monitor.endStepTracking(config.id, {
          success: config.success,
          error: config.success ? undefined : 'Test failure',
          memoryDelta: config.memoryDelta,
        });
      }

      const report = monitor.generatePerformanceReport(workflowId);

      expect(report).toBeDefined();
      expect(report.summary.totalSteps).toBe(4);
      expect(report.summary.successfulSteps).toBe(3);
      expect(report.summary.failedSteps).toBe(1);
      expect(report.bottlenecks.length).toBeGreaterThan(0);
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.metrics.averageExecutionTime).toBeGreaterThan(0);
    });

    test('should export performance data in multiple formats', async () => {
      const workflowId = 'export-workflow';

      // Execute a simple workflow
      monitor.startStepTracking('export-step', workflowId, {
        stepName: 'Export Step',
        stepType: 'action',
        complexity: 'medium',
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      monitor.endStepTracking('export-step', { success: true });

      const jsonExport = monitor.exportData('json');
      const csvExport = monitor.exportData('csv');

      expect(jsonExport).toBeDefined();
      expect(typeof jsonExport).toBe('string');
      expect(() => JSON.parse(jsonExport)).not.toThrow();

      expect(csvExport).toBeDefined();
      expect(typeof csvExport).toBe('string');
      expect(csvExport).toContain('stepId,workflowId,executionTime');
    });
  });
});

describe('performanceAnalysisUtils', () => {
  describe('statistical Analysis', () => {
    test('should calculate performance statistics accurately', () => {
      const executionTimes = [100, 150, 200, 120, 180, 90, 160];

      const stats = performanceAnalysisUtils.calculateStatistics(executionTimes);

      expect(stats.mean).toBeCloseTo(142.86, 1);
      expect(stats.median).toBe(150);
      expect(stats.min).toBe(90);
      expect(stats.max).toBe(200);
      expect(stats.standardDeviation).toBeGreaterThan(0);
      expect(stats.p95).toBeGreaterThan(stats.median);
    });

    test('should detect performance anomalies', () => {
      const normalTimes = [100, 110, 95, 105, 98];
      const anomalousTimes = [100, 110, 500, 105, 98]; // 500ms is anomalous

      const normalAnomalies = performanceAnalysisUtils.detectAnomalies(normalTimes);
      const anomalousData = performanceAnalysisUtils.detectAnomalies(anomalousTimes);

      expect(normalAnomalies).toHaveLength(0);
      expect(anomalousData.length).toBeGreaterThan(0);
      expect(anomalousData[0].value).toBe(500);
    });
  });

  describe('trend Analysis', () => {
    test('should identify improving performance trends', () => {
      const improvingTimes = [200, 180, 160, 140, 120, 100]; // Decreasing = improving

      const trend = performanceAnalysisUtils.analyzeTrend(improvingTimes);

      expect(trend.direction).toBe('improving');
      expect(trend.strength).toBeGreaterThan(0.8);
      expect(trend.significance).toBeGreaterThan(0.05);
    });

    test('should identify degrading performance trends', () => {
      const degradingTimes = [100, 120, 140, 160, 180, 200]; // Increasing = degrading

      const trend = performanceAnalysisUtils.analyzeTrend(degradingTimes);

      expect(trend.direction).toBe('degrading');
      expect(trend.strength).toBeGreaterThan(0.8);
      expect(trend.significance).toBeGreaterThan(0.05);
    });

    test('should identify stable performance', () => {
      const stableTimes = [100, 105, 98, 102, 99, 103, 101]; // Small variations

      const trend = performanceAnalysisUtils.analyzeTrend(stableTimes);

      expect(trend.direction).toBe('stable');
      expect(trend.strength).toBeLessThan(0.3);
    });
  });

  describe('performance Prediction', () => {
    test('should predict future performance based on trends', () => {
      const historicalTimes = [100, 110, 120, 130, 140]; // Linear increase

      const predictions = performanceAnalysisUtils.predictPerformance(historicalTimes, 3);

      expect(predictions).toHaveLength(3);
      expect(predictions[0]).toBeGreaterThan(140);
      expect(predictions[2]).toBeGreaterThan(predictions[0]);
    });

    test('should provide confidence intervals for predictions', () => {
      const historicalTimes = [100, 105, 110, 115, 120];

      const prediction = performanceAnalysisUtils.predictWithConfidence(historicalTimes, 1);

      expect(prediction.value).toBeGreaterThan(120);
      expect(prediction.confidenceInterval.lower).toBeLessThan(prediction.value);
      expect(prediction.confidenceInterval.upper).toBeGreaterThan(prediction.value);
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
    });
  });
});
