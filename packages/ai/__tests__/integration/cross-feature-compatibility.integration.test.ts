/**
 * Cross-Feature Compatibility Integration Tests
 * Testing seamless integration between all AI SDK v5 features
 */

import '@repo/qa/vitest/setup/next-app';
import { afterEach, beforeEach, describe, expect } from 'vitest';

// Import all major feature components
import { MultiStepAgentManager } from '../../src/server/agents/multi-step-manager';
import { OptimizedConditionFactory } from '../../src/server/agents/optimized-conditions';
import { AgentPerformanceMonitor } from '../../src/server/agents/performance-monitoring';
import { PromptCacheAnalytics } from '../../src/server/prompts/cache-analytics';
import {
  EnhancedPromptCache,
  PromptTemplateEngine,
  PromptVersionManager,
} from '../../src/server/prompts/template-engine';
import { RAGSystem } from '../../src/server/rag/hybrid-search';
import { BackpressureController } from '../../src/server/streaming/advanced/backpressure';
import { AdvancedFlowController } from '../../src/server/streaming/advanced/flow-control';
import {
  ComputerToolMonitor,
  MonitoredComputerTool,
} from '../../src/server/tools/computer-use/resource-monitoring';

describe('cross-Feature Compatibility Integration', () => {
  let agentManager: MultiStepAgentManager;
  let performanceMonitor: AgentPerformanceMonitor;
  let conditionFactory: OptimizedConditionFactory;
  let backpressureController: BackpressureController;
  let flowController: AdvancedFlowController;
  let computerMonitor: ComputerToolMonitor;
  let templateEngine: PromptTemplateEngine;
  let versionManager: PromptVersionManager;
  let promptCache: EnhancedPromptCache;
  let cacheAnalytics: PromptCacheAnalytics;
  let ragSystem: RAGSystem;

  beforeEach(async () => {
    // Initialize all major components
    agentManager = new MultiStepAgentManager({
      maxConcurrentWorkflows: 10,
      enablePerformanceMonitoring: true,
      enableAdvancedLogging: true,
    });

    performanceMonitor = new AgentPerformanceMonitor({
      enablePerformanceTracking: true,
      trackMemoryUsage: true,
      performanceThresholds: {
        maxExecutionTime: 10000,
        maxMemoryUsage: 100 * 1024 * 1024,
      },
    });

    conditionFactory = new OptimizedConditionFactory({
      enableCaching: true,
      enableParallelExecution: true,
      cacheTTL: 5000,
    });

    backpressureController = new BackpressureController({
      maxBufferSize: 1000,
      memoryManagement: {
        enableMemoryTracking: true,
        maxMemoryMB: 100,
      },
    });

    flowController = new AdvancedFlowController({
      enableQoS: true,
      trafficShaping: {
        enableShaping: true,
        maxBandwidth: 10000,
      },
    });

    computerMonitor = new ComputerToolMonitor({
      resourceLimits: {
        maxMemoryMB: 50,
        maxCpuPercent: 80,
      },
      monitoring: {
        enableResourceTracking: true,
        enableSecurityChecks: true,
      },
    });

    templateEngine = new PromptTemplateEngine({
      enableInheritance: true,
      enableComposition: true,
      cachingEnabled: true,
    });

    versionManager = new PromptVersionManager({
      enableSemanticVersioning: true,
      enableABTesting: true,
      maxVersionHistory: 10,
    });

    promptCache = new EnhancedPromptCache({
      maxSize: 1000,
      ttl: 3600000,
      enableAnalytics: true,
    });

    cacheAnalytics = new PromptCacheAnalytics({
      enablePatternDetection: true,
      enableTemporalAnalysis: true,
      reportingInterval: 1000,
    });

    ragSystem = new RAGSystem({
      enableHybridSearch: true,
      enableSemanticCaching: true,
      performanceOptimization: true,
    });
  });

  afterEach(() => {
    // Cleanup all components
    agentManager?.destroy();
    performanceMonitor?.destroy();
    conditionFactory?.destroy();
    backpressureController?.destroy();
    flowController?.destroy();
    computerMonitor?.destroy();
    templateEngine?.destroy();
    versionManager?.destroy();
    promptCache?.destroy();
    cacheAnalytics?.destroy();
    ragSystem?.destroy();
  });

  describe('agent + Performance + Streaming Integration', () => {
    test('should execute multi-step agent with performance monitoring and streaming optimization', async () => {
      const workflowId = 'integrated-workflow-1';

      // Create a complex multi-step workflow
      const workflow = await agentManager.createWorkflow(workflowId, {
        name: 'Integrated Performance Workflow',
        steps: [
          {
            id: 'data-collection',
            name: 'Data Collection',
            type: 'parallel',
            actions: [
              { type: 'fetch_data', source: 'api-1' },
              { type: 'fetch_data', source: 'api-2' },
              { type: 'fetch_data', source: 'database' },
            ],
          },
          {
            id: 'data-processing',
            name: 'Data Processing',
            type: 'sequential',
            condition: conditionFactory.createOptimizedCondition({
              type: 'data_availability',
              requirements: ['api-1', 'api-2', 'database'],
            }),
            actions: [
              { type: 'transform_data', format: 'normalized' },
              { type: 'validate_data', schema: 'v2' },
            ],
          },
          {
            id: 'streaming-output',
            name: 'Streaming Output',
            type: 'streaming',
            backpressureHandling: true,
            qosLevel: 'high',
          },
        ],
      });

      // Start performance monitoring
      performanceMonitor.startWorkflowTracking(workflowId, {
        workflowName: 'Integrated Performance Workflow',
        expectedDuration: 5000,
      });

      // Configure streaming for the output step
      const streamId = `${workflowId}-streaming-output`;
      backpressureController.configureStream(streamId, {
        priority: 'high',
        qosLevel: 'high',
      });

      await flowController.configureQoSForStream(streamId, {
        priority: 'high',
        maxLatency: 100,
        guaranteedBandwidth: 5000,
      });

      // Execute the workflow
      const executionResult = await agentManager.executeWorkflow(workflowId);

      expect(executionResult.success).toBeTruthy();
      expect(executionResult.completedSteps).toBe(3);

      // Verify performance monitoring captured metrics
      const performanceMetrics = performanceMonitor.getWorkflowMetrics(workflowId);
      expect(performanceMetrics).toBeDefined();
      expect(performanceMetrics!.totalExecutionTime).toBeGreaterThan(0);
      expect(performanceMetrics!.completedSteps).toBe(3);

      // Verify streaming was optimized
      const streamingMetrics = backpressureController.getStreamMetrics(streamId);
      expect(streamingMetrics.itemsProcessed).toBeGreaterThan(0);
      expect(streamingMetrics.averageLatency).toBeLessThan(200);
    });

    test('should handle workflow failures with graceful degradation across all systems', async () => {
      const workflowId = 'failure-handling-workflow';

      // Create workflow with intentional failure point
      const workflow = await agentManager.createWorkflow(workflowId, {
        name: 'Failure Handling Workflow',
        errorHandling: {
          enableGracefulDegradation: true,
          retryAttempts: 2,
          fallbackStrategy: 'partial_completion',
        },
        steps: [
          {
            id: 'success-step',
            name: 'Success Step',
            type: 'action',
            actions: [{ type: 'simple_operation', data: 'test' }],
          },
          {
            id: 'failure-step',
            name: 'Failure Step',
            type: 'action',
            actions: [{ type: 'failing_operation', shouldFail: true }],
          },
          {
            id: 'recovery-step',
            name: 'Recovery Step',
            type: 'action',
            condition: conditionFactory.createOptimizedCondition({
              type: 'error_recovery',
              fallbackEnabled: true,
            }),
            actions: [{ type: 'recovery_operation', mode: 'fallback' }],
          },
        ],
      });

      performanceMonitor.startWorkflowTracking(workflowId, {
        workflowName: 'Failure Handling Workflow',
        expectedFailures: 1,
      });

      const executionResult = await agentManager.executeWorkflow(workflowId);

      // Should succeed with partial completion
      expect(executionResult.success).toBeTruthy();
      expect(executionResult.completedSteps).toBe(2); // Success + Recovery steps
      expect(executionResult.failedSteps).toBe(1);

      // Verify performance monitoring tracked the failure
      const performanceMetrics = performanceMonitor.getWorkflowMetrics(workflowId);
      expect(performanceMetrics!.failedSteps).toBe(1);
      expect(performanceMetrics!.errorRecoveryCount).toBe(1);
    });
  });

  describe('computer Tools + Security + Resource Monitoring Integration', () => {
    test('should execute computer tools with comprehensive monitoring and security', async () => {
      const monitoredTool = new MonitoredComputerTool({
        monitoring: {
          enableResourceTracking: true,
          enableSecurityChecks: true,
          enablePerformanceAnalysis: true,
        },
        security: {
          enableSandboxing: true,
          strictMode: true,
          allowedOperations: ['screen_capture', 'text_processing'],
        },
        integration: {
          performanceMonitor,
          computerMonitor,
        },
      });

      const workflowId = 'computer-tools-workflow';

      // Create workflow using computer tools
      const workflow = await agentManager.createWorkflow(workflowId, {
        name: 'Computer Tools Workflow',
        enableComputerTools: true,
        steps: [
          {
            id: 'screen-capture',
            name: 'Screen Capture',
            type: 'computer_tool',
            tool: 'screen_capture',
            parameters: {
              region: { x: 0, y: 0, width: 800, height: 600 },
              format: 'png',
            },
          },
          {
            id: 'text-processing',
            name: 'Text Processing',
            type: 'computer_tool',
            tool: 'text_processing',
            parameters: {
              text: 'Sample text for processing',
              operation: 'analyze_sentiment',
            },
          },
        ],
      });

      performanceMonitor.startWorkflowTracking(workflowId, {
        workflowName: 'Computer Tools Workflow',
        enableComputerToolMonitoring: true,
      });

      const executionResult = await agentManager.executeWorkflow(workflowId, {
        computerToolHandler: monitoredTool,
      });

      expect(executionResult.success).toBeTruthy();
      expect(executionResult.completedSteps).toBe(2);

      // Verify security monitoring
      const securityReport = computerMonitor.generateSecurityReport();
      expect(securityReport.violations).toHaveLength(0);
      expect(securityReport.successfulOperations).toBe(2);

      // Verify resource monitoring
      const resourceMetrics = computerMonitor.getResourceMetrics();
      expect(resourceMetrics.peakMemoryUsage).toBeLessThan(50 * 1024 * 1024); // Within limits
      expect(resourceMetrics.peakCpuUsage).toBeLessThan(80); // Within limits

      monitoredTool.destroy();
    });
  });

  describe('prompt Management + Caching + RAG Integration', () => {
    test('should integrate prompt management with RAG and advanced caching', async () => {
      const workflowId = 'prompt-rag-workflow';

      // Create prompt templates with inheritance
      await templateEngine.createTemplate('base-rag-template', {
        content: `You are an AI assistant with access to knowledge base.
Context: {{context}}
User Query: {{query}}
Instructions: {{instructions}}`,
        variables: ['context', 'query', 'instructions'],
      });

      await templateEngine.createTemplate('analysis-template', {
        content: `{{> base-rag-template}}
Additional Analysis Instructions:
- Provide detailed reasoning
- Include confidence scores
- Suggest follow-up questions`,
        inherits: 'base-rag-template',
        variables: ['context', 'query', 'instructions'],
      });

      // Create version for A/B testing
      await versionManager.createVersion('analysis-template', {
        version: '2.0.0',
        changes: 'Enhanced reasoning instructions',
        abTestConfig: {
          enabled: true,
          trafficSplit: 0.3,
        },
      });

      const workflow = await agentManager.createWorkflow(workflowId, {
        name: 'Prompt RAG Workflow',
        enableRAG: true,
        enablePromptCaching: true,
        steps: [
          {
            id: 'rag-search',
            name: 'RAG Search',
            type: 'rag_query',
            hybridSearch: true,
            cacheResults: true,
          },
          {
            id: 'prompt-generation',
            name: 'Prompt Generation',
            type: 'prompt_template',
            template: 'analysis-template',
            useVersioning: true,
            enableCaching: true,
          },
          {
            id: 'ai-generation',
            name: 'AI Generation',
            type: 'llm_call',
            enableStreaming: true,
            cacheResponse: true,
          },
        ],
      });

      // Execute with RAG context
      const executionContext = {
        query: 'What are the best practices for AI system integration?',
        searchConfig: {
          enableHybridSearch: true,
          enableSemanticCaching: true,
          maxResults: 10,
        },
      };

      performanceMonitor.startWorkflowTracking(workflowId, {
        workflowName: 'Prompt RAG Workflow',
        enableCacheAnalytics: true,
      });

      const executionResult = await agentManager.executeWorkflow(workflowId, {
        context: executionContext,
        ragSystem,
        promptCache,
        templateEngine,
      });

      expect(executionResult.success).toBeTruthy();
      expect(executionResult.completedSteps).toBe(3);

      // Verify RAG integration
      const ragMetrics = ragSystem.getPerformanceMetrics();
      expect(ragMetrics.queriesProcessed).toBe(1);
      expect(ragMetrics.averageRetrievalTime).toBeGreaterThan(0);

      // Verify prompt caching
      const cacheMetrics = cacheAnalytics.getCacheMetrics();
      expect(cacheMetrics.totalRequests).toBeGreaterThan(0);
      expect(cacheMetrics.hitRate).toBeGreaterThanOrEqual(0);

      // Verify template versioning
      const versionMetrics = versionManager.getVersionMetrics('analysis-template');
      expect(versionMetrics.totalUsage).toBe(1);
    });

    test('should optimize prompt caching based on usage patterns', async () => {
      const workflowId = 'cache-optimization-workflow';

      // Simulate repeated queries with variations
      const queryPatterns = [
        'What is machine learning?',
        'What is machine learning used for?',
        'What is deep learning?',
        'What is machine learning?', // Repeat for cache hit
        'How does machine learning work?',
        'What is machine learning?', // Another repeat
      ];

      for (let i = 0; i < queryPatterns.length; i++) {
        const query = queryPatterns[i];

        const workflow = await agentManager.createWorkflow(`${workflowId}-${i}`, {
          name: `Cache Optimization Query ${i}`,
          steps: [
            {
              id: 'rag-search',
              name: 'RAG Search',
              type: 'rag_query',
              query,
              enableCaching: true,
            },
            {
              id: 'prompt-template',
              name: 'Prompt Template',
              type: 'prompt_template',
              template: 'base-rag-template',
              variables: { query },
              enableCaching: true,
            },
          ],
        });

        await agentManager.executeWorkflow(`${workflowId}-${i}`, {
          ragSystem,
          promptCache,
          templateEngine,
        });
      }

      // Analyze cache performance
      const cacheAnalysis = cacheAnalytics.generateAnalysisReport();

      expect(cacheAnalysis.hitRate).toBeGreaterThan(0.3); // Should have cache hits
      expect(cacheAnalysis.patternAnalysis.similarQueries.length).toBeGreaterThan(0);
      expect(cacheAnalysis.optimizationRecommendations.length).toBeGreaterThan(0);

      // Verify cache optimization was applied
      const optimizations = promptCache.getOptimizationMetrics();
      expect(optimizations.cacheEfficiency).toBeGreaterThan(0.5);
    });
  });

  describe('end-to-End Complex Workflow Integration', () => {
    test('should execute complex multi-feature workflow with full integration', async () => {
      const workflowId = 'complex-integration-workflow';

      // Create comprehensive workflow using all features
      const workflow = await agentManager.createWorkflow(workflowId, {
        name: 'Complex Integration Workflow',
        enableAllFeatures: true,
        steps: [
          {
            id: 'initial-rag-search',
            name: 'Initial RAG Search',
            type: 'rag_query',
            hybridSearch: true,
            cacheEnabled: true,
            parallelQueries: 3,
          },
          {
            id: 'computer-analysis',
            name: 'Computer Analysis',
            type: 'computer_tool',
            tool: 'screen_analysis',
            security: { sandboxed: true },
            resourceLimits: { maxMemory: 25 * 1024 * 1024 },
          },
          {
            id: 'prompt-optimization',
            name: 'Prompt Optimization',
            type: 'prompt_template',
            template: 'analysis-template',
            optimization: {
              enableVersioning: true,
              enableABTesting: true,
              cacheOptimization: true,
            },
          },
          {
            id: 'parallel-processing',
            name: 'Parallel Processing',
            type: 'parallel',
            actions: [
              {
                type: 'llm_call',
                model: 'gpt-4',
                enableStreaming: true,
                backpressureHandling: true,
              },
              {
                type: 'llm_call',
                model: 'claude-3',
                enableStreaming: true,
                qosLevel: 'high',
              },
              {
                type: 'computer_tool',
                tool: 'data_visualization',
                monitoring: { enableAll: true },
              },
            ],
          },
          {
            id: 'results-aggregation',
            name: 'Results Aggregation',
            type: 'aggregation',
            condition: conditionFactory.createOptimizedCondition({
              type: 'all_parallel_complete',
              timeout: 10000,
            }),
            streaming: {
              enableBackpressure: true,
              qosLevel: 'critical',
            },
          },
          {
            id: 'final-optimization',
            name: 'Final Optimization',
            type: 'optimization',
            targets: ['performance', 'memory', 'caching'],
          },
        ],
      });

      // Configure comprehensive monitoring
      performanceMonitor.startWorkflowTracking(workflowId, {
        workflowName: 'Complex Integration Workflow',
        enableAllMonitoring: true,
        trackResourceUsage: true,
        trackCachePerformance: true,
        trackSecurityEvents: true,
      });

      // Configure streaming for parallel steps
      const streamConfigs = ['gpt-4-stream', 'claude-3-stream', 'aggregation-stream'];
      for (const streamId of streamConfigs) {
        backpressureController.configureStream(`${workflowId}-${streamId}`, {
          priority: streamId.includes('aggregation') ? 'critical' : 'high',
          memoryManagement: { enableTracking: true },
        });

        await flowController.configureQoSForStream(`${workflowId}-${streamId}`, {
          priority: streamId.includes('aggregation') ? 'critical' : 'high',
          maxLatency: streamId.includes('aggregation') ? 50 : 100,
        });
      }

      // Execute the complex workflow
      const startTime = Date.now();
      const executionResult = await agentManager.executeWorkflow(workflowId, {
        ragSystem,
        computerMonitor,
        promptCache,
        templateEngine,
        backpressureController,
        flowController,
        performanceMonitor,
      });

      const totalExecutionTime = Date.now() - startTime;

      // Verify successful execution
      expect(executionResult.success).toBeTruthy();
      expect(executionResult.completedSteps).toBe(6);
      expect(totalExecutionTime).toBeLessThan(15000); // Should complete within 15s

      // Verify comprehensive performance metrics
      const performanceReport = performanceMonitor.generateComprehensiveReport(workflowId);
      expect(performanceReport.overallEfficiency).toBeGreaterThan(0.7);
      expect(performanceReport.resourceUtilization.memory.peak).toBeLessThan(100 * 1024 * 1024);
      expect(performanceReport.securityCompliance.score).toBeGreaterThan(0.9);

      // Verify streaming performance
      const streamingReport = backpressureController.generateStreamingReport();
      expect(streamingReport.totalStreamsProcessed).toBe(3);
      expect(streamingReport.averageLatency).toBeLessThan(150);
      expect(streamingReport.backpressureEvents).toBeLessThan(5);

      // Verify cache optimization
      const cacheReport = cacheAnalytics.generateOptimizationReport();
      expect(cacheReport.hitRate).toBeGreaterThan(0.4);
      expect(cacheReport.memoryEfficiency).toBeGreaterThan(0.8);

      // Verify computer tools security
      const securityReport = computerMonitor.generateComplianceReport();
      expect(securityReport.violations).toHaveLength(0);
      expect(securityReport.complianceScore).toBeGreaterThan(0.95);

      // Verify cross-feature integration points
      const integrationReport = agentManager.generateIntegrationReport(workflowId);
      expect(integrationReport.featureInteractions.length).toBeGreaterThan(10);
      expect(integrationReport.compatibilityScore).toBeGreaterThan(0.9);
      expect(integrationReport.optimizationOpportunities.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('error Recovery and Resilience Integration', () => {
    test('should handle system-wide failures with coordinated recovery', async () => {
      const workflowId = 'resilience-test-workflow';

      // Create workflow that will encounter various failure modes
      const workflow = await agentManager.createWorkflow(workflowId, {
        name: 'Resilience Test Workflow',
        errorHandling: {
          enableGlobalRecovery: true,
          coordinatedFailover: true,
          maxRecoveryAttempts: 3,
        },
        steps: [
          {
            id: 'cache-failure-test',
            name: 'Cache Failure Test',
            type: 'prompt_template',
            template: 'failing-template',
            errorHandling: { fallbackToUncached: true },
          },
          {
            id: 'streaming-failure-test',
            name: 'Streaming Failure Test',
            type: 'streaming',
            simulateFailure: { type: 'backpressure_overflow' },
            errorHandling: { enableBufferRecovery: true },
          },
          {
            id: 'computer-tool-failure-test',
            name: 'Computer Tool Failure Test',
            type: 'computer_tool',
            tool: 'restricted_operation',
            errorHandling: { enableSandboxRecovery: true },
          },
        ],
      });

      performanceMonitor.startWorkflowTracking(workflowId, {
        workflowName: 'Resilience Test Workflow',
        enableFailureTracking: true,
      });

      const executionResult = await agentManager.executeWorkflow(workflowId, {
        simulateFailures: true,
        enableRecovery: true,
      });

      // Should succeed with recovery
      expect(executionResult.success).toBeTruthy();
      expect(executionResult.recoveryAttempts).toBeGreaterThan(0);
      expect(executionResult.completedSteps).toBe(3);

      // Verify coordinated recovery metrics
      const recoveryReport = performanceMonitor.generateRecoveryReport(workflowId);
      expect(recoveryReport.totalFailures).toBeGreaterThan(0);
      expect(recoveryReport.successfulRecoveries).toBe(recoveryReport.totalFailures);
      expect(recoveryReport.recoveryEfficiency).toBeGreaterThan(0.8);
    });
  });
});
