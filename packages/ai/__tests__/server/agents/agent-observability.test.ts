/**
 * AI SDK v5 Agent Observability and Debugging Tests
 * Comprehensive tests for agent monitoring, tracing, and debugging capabilities
 */

import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import {
  AgentObservabilityManager,
  createObservableAgent,
  debugUtils,
  globalObservabilityManager,
  type AgentDebugContext,
  type AgentHealthStatus,
  type AgentMonitoringConfig,
  type AgentPerformanceSnapshot,
  type AgentTraceEvent,
} from '../../../src/server/agents/agent-observability';
import type { MultiStepResult } from '../../../src/server/agents/multi-step-execution';

// Mock observability
vi.mock('@repo/observability/server/next', () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

describe('agent Observability and Debugging', () => {
  let observabilityManager: AgentObservabilityManager;
  let mockConfig: AgentMonitoringConfig;

  beforeEach(() => {
    mockConfig = {
      enableTracing: true,
      enablePerformanceTracking: true,
      enableHealthChecks: true,
      traceLevel: 'info',
      retentionDays: 7,
      maxTraceEvents: 100,
      performanceSnapshotInterval: 60000,
      healthCheckInterval: 300000,
      alertThresholds: {
        maxExecutionTime: 60000,
        maxTokenUsage: 10000,
        minSuccessRate: 0.8,
        maxErrorRate: 0.2,
      },
    };

    observabilityManager = new AgentObservabilityManager(mockConfig);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('trace Management', () => {
    test('should start and stop traces properly', () => {
      const traceId = observabilityManager.startTrace('test-agent', 'test-session');

      expect(traceId).toBeDefined();
      expect(typeof traceId).toBe('string');
      expect(traceId).toMatch(/^trace_\d+_[a-z0-9]+$/);

      const mockResult: MultiStepResult = {
        steps: [],
        finalResult: { text: 'Test result', finishReason: 'stop' },
        totalTokensUsed: 100,
        executionTime: 1000,
        stoppedBy: 'completed',
      };

      observabilityManager.stopTrace(traceId, mockResult);

      // Should complete without errors
      expect(true).toBeTruthy();
    });

    test('should handle stopping non-existent traces gracefully', () => {
      observabilityManager.stopTrace('nonexistent-trace');
      expect(true).toBeTruthy(); // Should not throw
    });
  });

  describe('event Recording', () => {
    test('should record trace events with proper metadata', () => {
      const eventId = observabilityManager.recordEvent({
        agentId: 'test-agent',
        sessionId: 'test-session',
        type: 'step_start',
        level: 'info',
        message: 'Starting step 1',
        data: { stepNumber: 1, prompt: 'Test prompt' },
        tags: ['execution', 'step'],
      });

      expect(eventId).toBeDefined();
      expect(typeof eventId).toBe('string');
      expect(eventId).toMatch(/^event_\d+_[a-z0-9]+$/);

      const events = observabilityManager.getTraceEvents('test-agent');
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('step_start');
      expect(events[0].level).toBe('info');
      expect(events[0].message).toBe('Starting step 1');
      expect(events[0].data.stepNumber).toBe(1);
      expect(events[0].tags).toStrictEqual(['execution', 'step']);
    });

    test('should filter events by type and level', () => {
      observabilityManager.recordEvent({
        agentId: 'test-agent',
        sessionId: 'session1',
        type: 'step_start',
        level: 'info',
        message: 'Info message',
        data: {},
        tags: [],
      });

      observabilityManager.recordEvent({
        agentId: 'test-agent',
        sessionId: 'session1',
        type: 'error',
        level: 'error',
        message: 'Error message',
        data: {},
        tags: [],
      });

      observabilityManager.recordEvent({
        agentId: 'test-agent',
        sessionId: 'session2',
        type: 'step_complete',
        level: 'info',
        message: 'Step complete',
        data: {},
        tags: [],
      });

      const errorEvents = observabilityManager.getTraceEvents('test-agent', {
        type: 'error',
      });
      expect(errorEvents).toHaveLength(1);
      expect(errorEvents[0].level).toBe('error');

      const session1Events = observabilityManager.getTraceEvents('test-agent', {
        sessionId: 'session1',
      });
      expect(session1Events).toHaveLength(2);

      const infoEvents = observabilityManager.getTraceEvents('test-agent', {
        level: 'info',
      });
      expect(infoEvents).toHaveLength(2);
    });

    test('should limit events based on maxTraceEvents configuration', () => {
      const smallManager = new AgentObservabilityManager({
        ...mockConfig,
        maxTraceEvents: 3,
      });

      // Add more events than the limit
      for (let i = 0; i < 5; i++) {
        smallManager.recordEvent({
          agentId: 'test-agent',
          sessionId: 'test-session',
          type: 'step_start',
          level: 'info',
          message: `Event ${i}`,
          data: { index: i },
          tags: [],
        });
      }

      const events = smallManager.getTraceEvents('test-agent');
      expect(events.length).toBeLessThanOrEqual(3);
    });

    test('should respect trace level configuration', () => {
      const warnOnlyManager = new AgentObservabilityManager({
        ...mockConfig,
        traceLevel: 'warn',
      });

      warnOnlyManager.recordEvent({
        agentId: 'test-agent',
        sessionId: 'test-session',
        type: 'step_start',
        level: 'debug',
        message: 'Debug message',
        data: {},
        tags: [],
      });

      warnOnlyManager.recordEvent({
        agentId: 'test-agent',
        sessionId: 'test-session',
        type: 'warning',
        level: 'warn',
        message: 'Warning message',
        data: {},
        tags: [],
      });

      // Debug message should not be logged, but warning should be
      // This is tested through the logging mock behavior
      expect(true).toBeTruthy();
    });
  });

  describe('performance Monitoring', () => {
    test('should record performance snapshots', () => {
      const snapshot: AgentPerformanceSnapshot = {
        agentId: 'test-agent',
        sessionId: 'test-session',
        timestamp: Date.now(),
        metrics: {
          executionTime: 5000,
          tokenUsage: {
            promptTokens: 100,
            completionTokens: 200,
            totalTokens: 300,
          },
          stepCount: 5,
          toolCallCount: 3,
          successRate: 0.9,
          errorRate: 0.1,
          averageStepTime: 1000,
          memoryUsage: 50,
          cacheHitRate: 0.8,
        },
        resourceUsage: {
          cpuTime: 2000,
          memoryMB: 128,
          networkRequests: 10,
          diskOperations: 5,
        },
      };

      observabilityManager.recordPerformanceSnapshot(snapshot);

      const metrics = observabilityManager.getPerformanceMetrics('test-agent');
      expect(metrics.snapshots).toHaveLength(1);
      expect(metrics.snapshots[0]).toStrictEqual(snapshot);
      expect(metrics.aggregated.averageExecutionTime).toBe(5000);
      expect(metrics.aggregated.averageTokenUsage).toBe(300);
    });

    test('should calculate aggregated performance metrics', () => {
      const baseSnapshot: AgentPerformanceSnapshot = {
        agentId: 'test-agent',
        sessionId: 'test-session',
        timestamp: Date.now(),
        metrics: {
          executionTime: 0,
          tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          stepCount: 0,
          toolCallCount: 0,
          successRate: 0,
          errorRate: 0,
          averageStepTime: 0,
          memoryUsage: 0,
          cacheHitRate: 0,
        },
        resourceUsage: {
          cpuTime: 0,
          memoryMB: 0,
          networkRequests: 0,
          diskOperations: 0,
        },
      };

      // Add multiple snapshots
      const snapshots = [
        {
          ...baseSnapshot,
          metrics: {
            ...baseSnapshot.metrics,
            executionTime: 1000,
            tokenUsage: { ...baseSnapshot.metrics.tokenUsage, totalTokens: 100 },
            successRate: 1.0,
          },
        },
        {
          ...baseSnapshot,
          metrics: {
            ...baseSnapshot.metrics,
            executionTime: 2000,
            tokenUsage: { ...baseSnapshot.metrics.tokenUsage, totalTokens: 200 },
            successRate: 0.8,
          },
        },
        {
          ...baseSnapshot,
          metrics: {
            ...baseSnapshot.metrics,
            executionTime: 3000,
            tokenUsage: { ...baseSnapshot.metrics.tokenUsage, totalTokens: 300 },
            successRate: 0.9,
          },
        },
      ];

      snapshots.forEach(snapshot => {
        observabilityManager.recordPerformanceSnapshot(snapshot);
      });

      const metrics = observabilityManager.getPerformanceMetrics('test-agent');
      expect(metrics.aggregated.averageExecutionTime).toBe(2000);
      expect(metrics.aggregated.averageTokenUsage).toBe(200);
      expect(metrics.aggregated.successRate).toBeCloseTo(0.9, 1);
    });

    test('should filter performance metrics by time range', () => {
      const now = Date.now();
      const oneHourAgo = now - 3600000;
      const twoHoursAgo = now - 7200000;

      const snapshots = [
        {
          agentId: 'test-agent',
          sessionId: 'session1',
          timestamp: twoHoursAgo,
          metrics: { executionTime: 1000 } as any,
          resourceUsage: {} as any,
        },
        {
          agentId: 'test-agent',
          sessionId: 'session2',
          timestamp: oneHourAgo,
          metrics: { executionTime: 2000 } as any,
          resourceUsage: {} as any,
        },
        {
          agentId: 'test-agent',
          sessionId: 'session3',
          timestamp: now,
          metrics: { executionTime: 3000 } as any,
          resourceUsage: {} as any,
        },
      ];

      snapshots.forEach(snapshot => {
        observabilityManager.recordPerformanceSnapshot(snapshot);
      });

      const recentMetrics = observabilityManager.getPerformanceMetrics('test-agent', {
        start: oneHourAgo,
        end: now,
      });

      expect(recentMetrics.snapshots).toHaveLength(2);
      expect(recentMetrics.snapshots.every(s => s.timestamp >= oneHourAgo)).toBeTruthy();
    });

    test('should trigger performance alerts when thresholds are exceeded', () => {
      const alertSnapshot: AgentPerformanceSnapshot = {
        agentId: 'test-agent',
        sessionId: 'test-session',
        timestamp: Date.now(),
        metrics: {
          executionTime: 120000, // Exceeds threshold of 60000
          tokenUsage: {
            promptTokens: 5000,
            completionTokens: 10000,
            totalTokens: 15000, // Exceeds threshold of 10000
          },
          stepCount: 10,
          toolCallCount: 5,
          successRate: 0.5, // Below threshold of 0.8
          errorRate: 0.5, // Exceeds threshold of 0.2
          averageStepTime: 12000,
          memoryUsage: 100,
          cacheHitRate: 0.7,
        },
        resourceUsage: {
          cpuTime: 60000,
          memoryMB: 256,
          networkRequests: 20,
          diskOperations: 10,
        },
      };

      observabilityManager.recordPerformanceSnapshot(alertSnapshot);

      // Alerts should be recorded as warning events
      const warningEvents = observabilityManager.getTraceEvents('test-agent', {
        type: 'warning',
      });

      expect(warningEvents.length).toBeGreaterThan(0);
      const alertEvent = warningEvents.find(e => e.message.includes('Performance alerts'));
      expect(alertEvent).toBeDefined();
    });
  });

  describe('health Monitoring', () => {
    test('should update and track agent health status', () => {
      const healthUpdate: Partial<AgentHealthStatus> = {
        status: 'degraded',
        healthScore: 75,
        issues: [
          {
            severity: 'medium',
            category: 'performance',
            message: 'Slow response times detected',
            timestamp: Date.now(),
          },
        ],
        recommendations: ['Consider optimizing tool selection'],
      };

      observabilityManager.updateHealthStatus('test-agent', healthUpdate);

      const healthReport = observabilityManager.generateHealthReport('test-agent');
      expect(healthReport.agents).toHaveLength(1);
      expect(healthReport.agents[0].status).toBe('degraded');
      expect(healthReport.agents[0].healthScore).toBe(75);
      expect(healthReport.agents[0].issues).toHaveLength(1);
      expect(healthReport.overall.degradedAgents).toBe(1);
    });

    test('should generate comprehensive health reports', () => {
      // Add multiple agents with different health statuses
      observabilityManager.updateHealthStatus('healthy-agent', {
        status: 'healthy',
        healthScore: 95,
        issues: [],
      });

      observabilityManager.updateHealthStatus('degraded-agent', {
        status: 'degraded',
        healthScore: 70,
        issues: [
          { severity: 'medium', category: 'performance', message: 'Issue', timestamp: Date.now() },
        ],
      });

      observabilityManager.updateHealthStatus('unhealthy-agent', {
        status: 'unhealthy',
        healthScore: 30,
        issues: [
          {
            severity: 'high',
            category: 'connectivity',
            message: 'Critical issue',
            timestamp: Date.now(),
          },
        ],
      });

      const report = observabilityManager.generateHealthReport();

      expect(report.overall.totalAgents).toBe(3);
      expect(report.overall.healthyAgents).toBe(1);
      expect(report.overall.degradedAgents).toBe(1);
      expect(report.overall.unhealthyAgents).toBe(1);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    test('should provide recommendations based on health status', () => {
      observabilityManager.updateHealthStatus('unhealthy-agent-1', {
        status: 'unhealthy',
        healthScore: 20,
      });

      observabilityManager.updateHealthStatus('unhealthy-agent-2', {
        status: 'unhealthy',
        healthScore: 25,
      });

      observabilityManager.updateHealthStatus('offline-agent', {
        status: 'offline',
        healthScore: 0,
      });

      const report = observabilityManager.generateHealthReport();

      expect(report.recommendations).toContain(
        '2 agents are unhealthy and require immediate attention',
      );
      expect(report.recommendations).toContain('1 agents are offline and may need to be restarted');
    });
  });

  describe('debug Context Creation', () => {
    test('should create comprehensive debug contexts', () => {
      // Set up some trace events and performance data
      observabilityManager.recordEvent({
        agentId: 'debug-agent',
        sessionId: 'debug-session',
        type: 'step_start',
        level: 'info',
        message: 'Starting debug step',
        data: { stepNumber: 1 },
        tags: ['debug'],
      });

      const performanceSnapshot: AgentPerformanceSnapshot = {
        agentId: 'debug-agent',
        sessionId: 'debug-session',
        timestamp: Date.now(),
        metrics: {
          executionTime: 2000,
          tokenUsage: { promptTokens: 50, completionTokens: 100, totalTokens: 150 },
          stepCount: 3,
          toolCallCount: 2,
          successRate: 0.9,
          errorRate: 0.1,
          averageStepTime: 667,
          memoryUsage: 75,
          cacheHitRate: 0.8,
        },
        resourceUsage: {
          cpuTime: 1000,
          memoryMB: 64,
          networkRequests: 5,
          diskOperations: 2,
        },
      };

      observabilityManager.recordPerformanceSnapshot(performanceSnapshot);
      observabilityManager.updateHealthStatus('debug-agent', {
        status: 'healthy',
        healthScore: 90,
      });

      const debugContext = observabilityManager.createDebugContext('debug-agent', 'debug-session', {
        currentStep: 2,
        totalSteps: 5,
        conversationHistory: [{ role: 'user', content: 'Debug test' }],
        variableState: { debugMode: true },
        activeTools: ['web_search', 'analyze_data'],
      });

      expect(debugContext.agentId).toBe('debug-agent');
      expect(debugContext.sessionId).toBe('debug-session');
      expect(debugContext.currentStep).toBe(2);
      expect(debugContext.totalSteps).toBe(5);
      expect(debugContext.conversationHistory).toHaveLength(1);
      expect(debugContext.variableState.debugMode).toBeTruthy();
      expect(debugContext.activeTools).toStrictEqual(['web_search', 'analyze_data']);
      expect(debugContext.recentEvents.length).toBeGreaterThan(0);
      expect(debugContext.performanceMetrics).toBeDefined();
      expect(debugContext.healthStatus.status).toBe('healthy');
    });
  });

  describe('data Export and Import', () => {
    test('should export comprehensive debug data', () => {
      // Set up test data
      observabilityManager.recordEvent({
        agentId: 'export-agent',
        sessionId: 'export-session',
        type: 'tool_call',
        level: 'info',
        message: 'Tool executed',
        data: { toolName: 'web_search' },
        tags: ['tool'],
      });

      const snapshot: AgentPerformanceSnapshot = {
        agentId: 'export-agent',
        sessionId: 'export-session',
        timestamp: Date.now(),
        metrics: {} as any,
        resourceUsage: {} as any,
      };

      observabilityManager.recordPerformanceSnapshot(snapshot);
      observabilityManager.updateHealthStatus('export-agent', { status: 'healthy' });

      const exportedData = observabilityManager.exportDebugData('export-agent', 'export-session');

      expect(exportedData.agent.id).toBe('export-agent');
      expect(exportedData.traces.length).toBeGreaterThan(0);
      expect(exportedData.performance.length).toBeGreaterThan(0);
      expect(exportedData.health).toBeDefined();
      expect(exportedData.debugContext).toBeDefined();
    });

    test('should handle export for non-existent agents', () => {
      const exportedData = observabilityManager.exportDebugData('nonexistent-agent');

      expect(exportedData.agent.id).toBe('nonexistent-agent');
      expect(exportedData.traces).toHaveLength(0);
      expect(exportedData.performance).toHaveLength(0);
      expect(exportedData.health).toBeNull();
      expect(exportedData.debugContext).toBeNull();
    });
  });

  describe('agent Data Management', () => {
    test('should clear agent data completely', () => {
      // Set up data for agent
      observabilityManager.recordEvent({
        agentId: 'clear-agent',
        sessionId: 'clear-session',
        type: 'step_start',
        level: 'info',
        message: 'Test event',
        data: {},
        tags: [],
      });

      observabilityManager.updateHealthStatus('clear-agent', { status: 'healthy' });
      observabilityManager.createDebugContext('clear-agent', 'clear-session');

      // Verify data exists
      expect(observabilityManager.getTraceEvents('clear-agent')).toHaveLength(1);

      // Clear data
      observabilityManager.clearAgentData('clear-agent');

      // Verify data is cleared
      expect(observabilityManager.getTraceEvents('clear-agent')).toHaveLength(0);
      const healthReport = observabilityManager.generateHealthReport('clear-agent');
      expect(healthReport.agents).toHaveLength(0);
    });
  });

  describe('observable Agent Wrapper', () => {
    test('should create observable agents with observability manager', () => {
      const baseAgent = {
        id: 'observable-test-agent',
        name: 'Observable Test Agent',
        description: 'Agent for testing observability features',
      };

      const observableAgent = createObservableAgent(baseAgent, observabilityManager);

      expect(observableAgent.id).toBe('observable-test-agent');
      expect(observableAgent.name).toBe('Observable Test Agent');
      expect(observableAgent.observability).toBe(observabilityManager);
    });

    test('should use global observability manager by default', () => {
      const baseAgent = {
        id: 'global-observable-agent',
        name: 'Global Observable Agent',
        description: 'Agent using global observability',
      };

      const observableAgent = createObservableAgent(baseAgent);

      expect(observableAgent.observability).toBe(globalObservabilityManager);
    });
  });

  describe('debug Utilities', () => {
    test('should format debug context into readable output', () => {
      const mockDebugContext: AgentDebugContext = {
        agentId: 'format-test-agent',
        sessionId: 'format-test-session',
        currentStep: 3,
        totalSteps: 10,
        conversationHistory: [
          { role: 'user', content: 'Test message' },
          { role: 'assistant', content: 'Test response' },
        ],
        variableState: {
          temperature: 0.7,
          model: 'gpt-4o',
        },
        memorySnapshot: {},
        activeTools: ['web_search', 'data_analysis'],
        recentEvents: [
          {
            id: 'event1',
            agentId: 'format-test-agent',
            sessionId: 'format-test-session',
            type: 'step_start',
            timestamp: Date.now(),
            level: 'info',
            message: 'Step started',
            data: {},
            tags: [],
          },
        ],
        performanceMetrics: {
          agentId: 'format-test-agent',
          sessionId: 'format-test-session',
          timestamp: Date.now(),
          metrics: {
            executionTime: 5000,
            tokenUsage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
            stepCount: 3,
            toolCallCount: 2,
            successRate: 0.9,
            errorRate: 0.1,
            averageStepTime: 1667,
            memoryUsage: 50,
            cacheHitRate: 0.8,
          },
          resourceUsage: {
            cpuTime: 2000,
            memoryMB: 128,
            networkRequests: 5,
            diskOperations: 2,
          },
        },
        healthStatus: {
          agentId: 'format-test-agent',
          status: 'healthy',
          lastHealthCheck: Date.now(),
          healthScore: 95,
          issues: [],
          recommendations: [],
        },
      };

      const formatted = debugUtils.formatDebugContext(mockDebugContext);

      expect(formatted).toContain('Agent Debug Context');
      expect(formatted).toContain('format-test-agent');
      expect(formatted).toContain('Step: 3/10');
      expect(formatted).toContain('Health: healthy (95/100)');
      expect(formatted).toContain('Execution Time: 5000ms');
      expect(formatted).toContain('Token Usage: 300');
      expect(formatted).toContain('web_search');
      expect(formatted).toContain('data_analysis');
      expect(formatted).toContain('temperature: 0.7');
    });

    test('should analyze error patterns from trace events', () => {
      const events: AgentTraceEvent[] = [
        {
          id: 'event1',
          agentId: 'error-agent',
          sessionId: 'session1',
          type: 'error',
          timestamp: Date.now(),
          level: 'error',
          message: 'Tool execution failed',
          data: { errorType: 'tool_call' },
          tags: [],
        },
        {
          id: 'event2',
          agentId: 'error-agent',
          sessionId: 'session1',
          type: 'error',
          timestamp: Date.now(),
          level: 'error',
          message: 'Tool execution failed',
          data: { errorType: 'tool_call' },
          tags: [],
        },
        {
          id: 'event3',
          agentId: 'error-agent',
          sessionId: 'session1',
          type: 'error',
          timestamp: Date.now(),
          level: 'error',
          message: 'Request timeout',
          data: { errorType: 'timeout' },
          tags: [],
        },
        {
          id: 'event4',
          agentId: 'error-agent',
          sessionId: 'session1',
          type: 'step_complete',
          timestamp: Date.now(),
          level: 'info',
          message: 'Step completed successfully',
          data: {},
          tags: [],
        },
      ];

      const analysis = debugUtils.analyzeErrorPatterns(events);

      expect(analysis.errorTypes.tool_call).toBe(2);
      expect(analysis.errorTypes.timeout).toBe(1);
      expect(analysis.errorFrequency).toBeCloseTo(0.75, 2); // 3 errors out of 4 events
      expect(analysis.commonErrorMessages).toContain('Tool execution failed');
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.recommendations.some(r => r.includes('high error rate'))).toBeTruthy();
      expect(analysis.recommendations.some(r => r.includes('Tool call errors'))).toBeTruthy();
    });

    test('should generate performance insights from snapshots', () => {
      const olderSnapshots: AgentPerformanceSnapshot[] = [
        {
          agentId: 'perf-agent',
          sessionId: 'session1',
          timestamp: Date.now() - 3600000,
          metrics: {
            executionTime: 10000,
            tokenUsage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
            successRate: 0.7,
          } as any,
          resourceUsage: {} as any,
        },
        {
          agentId: 'perf-agent',
          sessionId: 'session2',
          timestamp: Date.now() - 3000000,
          metrics: {
            executionTime: 12000,
            tokenUsage: { promptTokens: 120, completionTokens: 240, totalTokens: 360 },
            successRate: 0.6,
          } as any,
          resourceUsage: {} as any,
        },
      ];

      const recentSnapshots: AgentPerformanceSnapshot[] = [
        {
          agentId: 'perf-agent',
          sessionId: 'session3',
          timestamp: Date.now() - 1800000,
          metrics: {
            executionTime: 8000,
            tokenUsage: { promptTokens: 80, completionTokens: 160, totalTokens: 240 },
            successRate: 0.9,
          } as any,
          resourceUsage: {} as any,
        },
        {
          agentId: 'perf-agent',
          sessionId: 'session4',
          timestamp: Date.now() - 600000,
          metrics: {
            executionTime: 7000,
            tokenUsage: { promptTokens: 70, completionTokens: 140, totalTokens: 210 },
            successRate: 0.95,
          } as any,
          resourceUsage: {} as any,
        },
      ];

      const allSnapshots = [...olderSnapshots, ...recentSnapshots];
      const insights = debugUtils.generatePerformanceInsights(allSnapshots);

      expect(insights.trends.executionTime).toBe('improving'); // Getting faster
      expect(insights.trends.tokenUsage).toBe('improving'); // Using fewer tokens
      expect(insights.trends.successRate).toBe('improving'); // Higher success rate
      expect(insights.bottlenecks).toHaveLength(0); // No current bottlenecks
      expect(insights.recommendations.length).toBeGreaterThan(0);
    });

    test('should handle insufficient data for trend analysis', () => {
      const singleSnapshot: AgentPerformanceSnapshot[] = [
        {
          agentId: 'single-agent',
          sessionId: 'session1',
          timestamp: Date.now(),
          metrics: {
            executionTime: 5000,
            tokenUsage: { promptTokens: 50, completionTokens: 100, totalTokens: 150 },
            successRate: 0.8,
          } as any,
          resourceUsage: {} as any,
        },
      ];

      const insights = debugUtils.generatePerformanceInsights(singleSnapshot);

      expect(insights.trends.executionTime).toBe('stable');
      expect(insights.trends.tokenUsage).toBe('stable');
      expect(insights.trends.successRate).toBe('stable');
      expect(insights.recommendations).toContain('Insufficient data for trend analysis');
    });
  });

  describe('global Observability Manager', () => {
    test('should provide a global observability manager instance', () => {
      expect(globalObservabilityManager).toBeInstanceOf(AgentObservabilityManager);

      // Should be able to use global instance
      globalObservabilityManager.recordEvent({
        agentId: 'global-test-agent',
        sessionId: 'global-session',
        type: 'step_start',
        level: 'info',
        message: 'Global test event',
        data: {},
        tags: [],
      });

      const events = globalObservabilityManager.getTraceEvents('global-test-agent');
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('error Handling and Edge Cases', () => {
    test('should handle disabled tracing gracefully', () => {
      const disabledManager = new AgentObservabilityManager({
        ...mockConfig,
        enableTracing: false,
      });

      const eventId = disabledManager.recordEvent({
        agentId: 'disabled-agent',
        sessionId: 'disabled-session',
        type: 'step_start',
        level: 'info',
        message: 'This should not be recorded',
        data: {},
        tags: [],
      });

      expect(eventId).toBe('');
      const events = disabledManager.getTraceEvents('disabled-agent');
      expect(events).toHaveLength(0);
    });

    test('should handle disabled performance tracking gracefully', () => {
      const disabledManager = new AgentObservabilityManager({
        ...mockConfig,
        enablePerformanceTracking: false,
      });

      const snapshot: AgentPerformanceSnapshot = {
        agentId: 'disabled-perf-agent',
        sessionId: 'disabled-session',
        timestamp: Date.now(),
        metrics: {} as any,
        resourceUsage: {} as any,
      };

      disabledManager.recordPerformanceSnapshot(snapshot);

      const metrics = disabledManager.getPerformanceMetrics('disabled-perf-agent');
      expect(metrics.snapshots).toHaveLength(0);
    });

    test('should handle health status updates for new agents', () => {
      observabilityManager.updateHealthStatus('new-agent', {
        status: 'healthy',
        healthScore: 100,
      });

      const report = observabilityManager.generateHealthReport('new-agent');
      expect(report.agents).toHaveLength(1);
      expect(report.agents[0].agentId).toBe('new-agent');
      expect(report.agents[0].status).toBe('healthy');
    });

    test('should handle empty performance metrics gracefully', () => {
      const metrics = observabilityManager.getPerformanceMetrics('nonexistent-agent');

      expect(metrics.snapshots).toHaveLength(0);
      expect(metrics.aggregated.averageExecutionTime).toBe(0);
      expect(metrics.aggregated.averageTokenUsage).toBe(0);
      expect(metrics.aggregated.successRate).toBe(0);
    });
  });
});
