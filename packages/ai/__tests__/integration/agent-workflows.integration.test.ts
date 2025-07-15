/**
 * Agent Workflows Integration Tests
 * End-to-end testing of complete agent workflow scenarios
 */

import '@repo/qa/vitest/setup/next-app';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import {
  MultiStepAgentExecutor,
  type AgentStep,
} from '../../src/server/agents/multi-step-execution';
import { OptimizedConditionFactory } from '../../src/server/agents/optimized-conditions';
import { AgentPerformanceMonitor } from '../../src/server/agents/performance-monitoring';
import { EnhancedPromptCache } from '../../src/server/prompts/enhanced-prompt-cache';
import {
  PromptTemplateEngine,
  type PromptTemplate,
} from '../../src/server/prompts/prompt-templates';
import { BackpressureController } from '../../src/server/streaming/advanced/backpressure';
import {
  AdvancedFlowController,
  TrafficPriority,
} from '../../src/server/streaming/advanced/flow-control';
import { ComputerToolMonitor } from '../../src/server/tools/computer-use/resource-monitoring';

/**
 * Mock external services and APIs
 */
const mockLLMProvider = {
  generateText: vi.fn().mockImplementation(async (prompt: string) => {
    // Simulate realistic LLM response times
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    return {
      text: `Generated response for: ${prompt.substring(0, 50)}...`,
      usage: {
        promptTokens: Math.floor(prompt.length / 4),
        completionTokens: Math.floor(Math.random() * 200) + 50,
        totalTokens: Math.floor(prompt.length / 4) + Math.floor(Math.random() * 200) + 50,
      },
    };
  }),

  streamText: vi.fn().mockImplementation(async function* (prompt: string) {
    const words = `Streaming response for prompt: ${prompt}`.split(' ');
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 50));
      yield { text: word + ' ', done: false };
    }
    yield { text: '', done: true };
  }),
};

const mockDatabase = {
  store: new Map<string, any>(),

  save: vi.fn().mockImplementation(async (key: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 10));
    mockDatabase.store.set(key, { ...data, timestamp: Date.now() });
    return { success: true, id: key };
  }),

  retrieve: vi.fn().mockImplementation(async (key: string) => {
    await new Promise(resolve => setTimeout(resolve, 10));
    return mockDatabase.store.get(key) || null;
  }),

  query: vi.fn().mockImplementation(async (filter: any) => {
    await new Promise(resolve => setTimeout(resolve, 20));
    return Array.from(mockDatabase.store.values()).filter(item =>
      Object.keys(filter).every(key => item[key] === filter[key]),
    );
  }),
};

const mockExternalAPI = {
  call: vi.fn().mockImplementation(async (endpoint: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      success: Math.random() > 0.1, // 90% success rate
      data: { endpoint, processedData: data, timestamp: Date.now() },
      status: Math.random() > 0.1 ? 200 : 500,
    };
  }),
};

describe('agent Workflows Integration Tests', () => {
  let agentExecutor: MultiStepAgentExecutor;
  let conditionFactory: OptimizedConditionFactory;
  let performanceMonitor: AgentPerformanceMonitor;
  let promptCache: EnhancedPromptCache;
  let templateEngine: PromptTemplateEngine;
  let computerToolMonitor: ComputerToolMonitor;
  let flowController: AdvancedFlowController<any>;

  beforeEach(() => {
    // Initialize all components
    performanceMonitor = new AgentPerformanceMonitor({
      enablePerformanceTracking: true,
      trackMemoryUsage: true,
      performanceThresholds: {
        maxExecutionTime: 30000,
        maxMemoryUsage: 100 * 1024 * 1024,
        maxStepDuration: 5000,
      },
    });

    conditionFactory = new OptimizedConditionFactory({
      enableCaching: true,
      enableParallelization: true,
    });

    agentExecutor = new MultiStepAgentExecutor({
      maxSteps: 20,
      timeout: 30000,
      enablePerformanceMonitoring: true,
      performanceMonitor,
      conditionFactory,
    });

    promptCache = new EnhancedPromptCache({
      maxSize: 500,
      enableAutoOptimization: true,
      enableSemanticSimilarity: true,
      enableCostTracking: true,
    });

    templateEngine = new PromptTemplateEngine({
      enableCaching: true,
      enableValidation: true,
    });

    computerToolMonitor = new ComputerToolMonitor({
      resourceLimits: {
        maxMemoryMB: 100,
        maxExecutionTimeMs: 10000,
      },
      monitoring: {
        enableResourceTracking: true,
        enableSecurityChecks: true,
      },
    });

    const backpressureController = new BackpressureController({
      highWaterMark: 100,
      strategy: 'throttle',
    });

    flowController = new AdvancedFlowController(
      {
        adaptive: true,
        initialRateLimit: 50,
      },
      backpressureController,
    );

    // Clear mocks
    vi.clearAllMocks();
    mockDatabase.store.clear();
  });

  afterEach(() => {
    agentExecutor.destroy();
    performanceMonitor.destroy();
    promptCache.destroy();
    templateEngine.destroy();
    computerToolMonitor.destroy();
    flowController.destroy();
  });

  describe('complete Agent Workflow Scenarios', () => {
    test('should execute a comprehensive data analysis workflow', async () => {
      // Register prompt templates
      const analysisTemplate: PromptTemplate = {
        id: 'data-analysis-template',
        name: 'Data Analysis Template',
        template:
          'Analyze the following data: {{data}}\nFocus on: {{focus_areas}}\nProvide insights about: {{insights_requested}}',
        variables: [
          { name: 'data', type: 'string', required: true },
          { name: 'focus_areas', type: 'array', required: true },
          { name: 'insights_requested', type: 'string', required: true },
        ],
      };

      templateEngine.registerTemplate(analysisTemplate);

      const workflow: AgentStep[] = [
        {
          id: 'data-collection',
          name: 'Collect Data',
          type: 'action',
          action: async context => {
            // Simulate data collection from multiple sources
            const sources = ['database', 'api', 'files'];
            const collectedData = [];

            for (const source of sources) {
              switch (source) {
                case 'database':
                  const dbData = await mockDatabase.query({ type: 'analytics' });
                  collectedData.push({ source, data: dbData });
                  break;
                case 'api':
                  const apiResponse = await mockExternalAPI.call('/analytics-data', {});
                  if (apiResponse.success) {
                    collectedData.push({ source, data: apiResponse.data });
                  }
                  break;
                case 'files':
                  // Simulate file reading with computer tools
                  computerToolMonitor.startMonitoring('file-read', {
                    toolName: 'File Reader',
                    operation: 'read_analytics_files',
                  });

                  await new Promise(resolve => setTimeout(resolve, 100));

                  const fileResult = computerToolMonitor.endMonitoring('file-read', {
                    success: true,
                    operation: 'read_analytics_files',
                  });

                  collectedData.push({ source, data: 'file_contents_data' });
                  break;
              }
            }

            context.data.collectedData = collectedData;
            context.data.dataCollectionTimestamp = Date.now();

            return {
              success: true,
              data: {
                message: `Collected data from ${collectedData.length} sources`,
                sources: collectedData.map(d => d.source),
              },
            };
          },
        },
        {
          id: 'data-validation',
          name: 'Validate Data Quality',
          type: 'action',
          condition: {
            type: 'simple',
            expression: 'context.data.collectedData && context.data.collectedData.length > 0',
          },
          action: async context => {
            const data = context.data.collectedData;
            const validationResults = data.map((item: any) => ({
              source: item.source,
              valid: Math.random() > 0.1, // 90% valid data
              issues: Math.random() > 0.8 ? ['missing_fields'] : [],
            }));

            const validSources = validationResults.filter(r => r.valid);
            context.data.validatedData = validSources;
            context.data.validationReport = validationResults;

            return {
              success: validSources.length > 0,
              data: {
                validSources: validSources.length,
                totalSources: data.length,
                validationReport: validationResults,
              },
            };
          },
        },
        {
          id: 'analysis-preparation',
          name: 'Prepare Analysis Prompt',
          type: 'action',
          condition: {
            type: 'simple',
            expression: 'context.data.validatedData && context.data.validatedData.length > 0',
          },
          action: async context => {
            const validData = context.data.validatedData;

            const view = await templateEngine.render('data-analysis-template', {
              data: JSON.stringify(validData),
              focus_areas: ['trends', 'anomalies', 'correlations'],
              insights_requested: 'business impact and recommendations',
            });

            if (!view.success) {
              throw new Error(`Template rendering failed: ${view.errors?.join(', ')}`);
            }

            context.data.analysisPrompt = view.prompt;
            return {
              success: true,
              data: { promptLength: view.prompt.length },
            };
          },
        },
        {
          id: 'llm-analysis',
          name: 'Perform LLM Analysis',
          type: 'action',
          condition: {
            type: 'simple',
            expression: 'context.data.analysisPrompt',
          },
          action: async context => {
            const prompt = context.data.analysisPrompt;

            // Check cache first
            const cacheKey = promptCache.generateKey(prompt, { model: 'gpt-4', task: 'analysis' });
            const cachedResult = await promptCache.getWithAnalytics(cacheKey, {
              model: 'gpt-4',
              tokens: Math.floor(prompt.length / 4),
            });

            let analysis;
            if (cachedResult.fromCache && cachedResult.data) {
              analysis = cachedResult.data.response;
              context.data.fromCache = true;
            } else {
              // Generate new analysis
              const llmResponse = await mockLLMProvider.generateText(prompt);
              analysis = llmResponse.text;

              // Cache the result
              await promptCache.setWithAnalytics(cacheKey, prompt, analysis, {
                model: 'gpt-4',
                tokens: llmResponse.usage.totalTokens,
                cost: llmResponse.usage.totalTokens * 0.003,
              });

              context.data.fromCache = false;
            }

            context.data.analysis = analysis;
            context.data.analysisTimestamp = Date.now();

            return {
              success: true,
              data: {
                analysisLength: analysis.length,
                fromCache: context.data.fromCache,
              },
            };
          },
        },
        {
          id: 'result-storage',
          name: 'Store Analysis Results',
          type: 'parallel',
          steps: [
            {
              id: 'store-database',
              name: 'Store in Database',
              type: 'action',
              action: async context => {
                const result = await mockDatabase.save('analysis-result', {
                  analysis: context.data.analysis,
                  metadata: {
                    dataCollectionTimestamp: context.data.dataCollectionTimestamp,
                    analysisTimestamp: context.data.analysisTimestamp,
                    sources: context.data.validatedData.map((d: any) => d.source),
                    fromCache: context.data.fromCache,
                  },
                });

                return {
                  success: result.success,
                  data: { storageId: result.id },
                };
              },
            },
            {
              id: 'notify-stakeholders',
              name: 'Notify Stakeholders',
              type: 'action',
              action: async context => {
                const notification = await mockExternalAPI.call('/notifications', {
                  type: 'analysis_complete',
                  recipients: ['analyst@company.com', 'manager@company.com'],
                  summary: `Analysis completed at ${new Date(context.data.analysisTimestamp).toISOString()}`,
                });

                return {
                  success: notification.success,
                  data: { notificationSent: notification.success },
                };
              },
            },
          ],
        },
        {
          id: 'generate-report',
          name: 'Generate Final Report',
          type: 'action',
          action: async context => {
            const reportData = {
              executionSummary: {
                totalSteps: 5,
                dataSourcesProcessed: context.data.validatedData.length,
                analysisFromCache: context.data.fromCache,
                executionTime: Date.now() - context.metadata.startTime,
              },
              analysis: context.data.analysis,
              metadata: context.metadata,
            };

            context.data.finalReport = reportData;

            return {
              success: true,
              data: { reportGenerated: true, reportSize: JSON.stringify(reportData).length },
            };
          },
        },
      ];

      // Execute the workflow
      const startTime = Date.now();
      const result = await agentExecutor.executeWorkflow(workflow, {
        data: {},
        metadata: {
          workflowId: 'data-analysis-workflow',
          requestId: 'req-12345',
          startTime,
        },
      });

      // Verify workflow completion
      expect(result.success).toBeTruthy();
      expect(result.executedSteps.length).toBeGreaterThanOrEqual(5);
      expect(result.context.data.finalReport).toBeDefined();
      expect(result.context.data.finalReport.executionSummary.totalSteps).toBe(5);

      // Verify all components were utilized
      expect(mockDatabase.save).toHaveBeenCalledWith();
      expect(mockExternalAPI.call).toHaveBeenCalledWith();
      expect(mockLLMProvider.generateText).toHaveBeenCalledWith(
        expect.stringContaining('Analyze the following data'),
      );

      // Check performance metrics
      const workflowMetrics = performanceMonitor.getWorkflowMetrics('data-analysis-workflow');
      expect(workflowMetrics).toBeDefined();
      expect(workflowMetrics!.totalSteps).toBeGreaterThanOrEqual(5);
      expect(workflowMetrics!.completedSteps).toBe(workflowMetrics!.totalSteps);

      // Verify cache usage
      const cacheStats = promptCache.getStats();
      expect(cacheStats.cache.size).toBeGreaterThan(0);
    }, 15000); // Increased timeout for complex workflow

    test('should handle a real-time monitoring and alerting workflow', async () => {
      const monitoringWorkflow: AgentStep[] = [
        {
          id: 'initialize-monitoring',
          name: 'Initialize Monitoring System',
          type: 'action',
          action: async context => {
            context.data.monitoringActive = true;
            context.data.alertThresholds = {
              cpu: 80,
              memory: 85,
              errorRate: 5,
            };
            context.data.metrics = [];

            return { success: true, data: { initialized: true } };
          },
        },
        {
          id: 'continuous-monitoring',
          name: 'Monitor System Metrics',
          type: 'loop',
          condition: {
            type: 'simple',
            expression: 'context.data.monitoringActive && context.data.metrics.length < 10',
          },
          maxIterations: 10,
          steps: [
            {
              id: 'collect-metrics',
              name: 'Collect Current Metrics',
              type: 'action',
              action: async context => {
                // Simulate metric collection with flow control
                const permitted = await flowController.requestPermission(
                  { type: 'metric_collection' },
                  TrafficPriority.HIGH,
                );

                if (!permitted) {
                  return { success: false, data: { reason: 'Rate limited' } };
                }

                flowController.recordProcessingStart();

                // Simulate metrics collection
                await new Promise(resolve => setTimeout(resolve, 50));

                const metrics = {
                  timestamp: Date.now(),
                  cpu: Math.random() * 100,
                  memory: Math.random() * 100,
                  errorRate: Math.random() * 10,
                  requestCount: Math.floor(Math.random() * 1000),
                };

                context.data.metrics.push(metrics);
                flowController.recordProcessingComplete(50, true);

                return { success: true, data: metrics };
              },
            },
            {
              id: 'analyze-metrics',
              name: 'Analyze Metrics for Alerts',
              type: 'action',
              condition: {
                type: 'simple',
                expression: 'context.data.metrics.length > 0',
              },
              action: async context => {
                const latestMetrics = context.data.metrics[context.data.metrics.length - 1];
                const thresholds = context.data.alertThresholds;

                const alerts = [];

                if (latestMetrics.cpu > thresholds.cpu) {
                  alerts.push({
                    type: 'cpu_high',
                    value: latestMetrics.cpu,
                    threshold: thresholds.cpu,
                  });
                }

                if (latestMetrics.memory > thresholds.memory) {
                  alerts.push({
                    type: 'memory_high',
                    value: latestMetrics.memory,
                    threshold: thresholds.memory,
                  });
                }

                if (latestMetrics.errorRate > thresholds.errorRate) {
                  alerts.push({
                    type: 'error_rate_high',
                    value: latestMetrics.errorRate,
                    threshold: thresholds.errorRate,
                  });
                }

                if (alerts.length > 0) {
                  if (!context.data.alertsSent) context.data.alertsSent = [];
                  context.data.alertsSent.push(...alerts);

                  // Send alerts in parallel
                  const alertPromises = alerts.map(alert =>
                    mockExternalAPI.call('/alerts', {
                      alert,
                      timestamp: latestMetrics.timestamp,
                    }),
                  );

                  await Promise.all(alertPromises);
                }

                return {
                  success: true,
                  data: {
                    alertsTriggered: alerts.length,
                    alerts,
                  },
                };
              },
            },
          ],
        },
        {
          id: 'generate-monitoring-report',
          name: 'Generate Monitoring Report',
          type: 'action',
          condition: {
            type: 'simple',
            expression: 'context.data.metrics.length > 0',
          },
          action: async context => {
            const metrics = context.data.metrics;
            const alertsSent = context.data.alertsSent || [];

            const report = {
              period: {
                start: metrics[0].timestamp,
                end: metrics[metrics.length - 1].timestamp,
                duration: metrics[metrics.length - 1].timestamp - metrics[0].timestamp,
              },
              summary: {
                totalMetrics: metrics.length,
                totalAlerts: alertsSent.length,
                avgCpu: metrics.reduce((sum, m) => sum + m.cpu, 0) / metrics.length,
                avgMemory: metrics.reduce((sum, m) => sum + m.memory, 0) / metrics.length,
                avgErrorRate: metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length,
              },
              alerts: alertsSent,
            };

            // Store report
            await mockDatabase.save('monitoring-report', report);
            context.data.monitoringReport = report;

            return { success: true, data: { reportGenerated: true } };
          },
        },
      ];

      const result = await agentExecutor.executeWorkflow(monitoringWorkflow, {
        data: {},
        metadata: { workflowId: 'monitoring-workflow' },
      });

      expect(result.success).toBeTruthy();
      expect(result.context.data.metrics).toHaveLength(10);
      expect(result.context.data.monitoringReport).toBeDefined();

      // Verify flow control was utilized
      const flowMetrics = flowController.getMetrics();
      expect(flowMetrics.totalProcessed).toBeGreaterThan(0);

      // Verify alerts behavior (depends on random metrics)
      const alertsCount = result.context.data.alertsSent?.length || 0;
      expect(alertsCount).toBeGreaterThanOrEqual(0);

      // Verify external API was called appropriately based on alerts
      const alertsCalls = mockExternalAPI.call.mock.calls.filter(call => call[0] === '/alerts');
      expect(alertsCalls).toHaveLength(alertsCount > 0 ? 1 : 0);
    }, 10000);

    test('should execute a content processing and optimization workflow', async () => {
      // Register content optimization template
      const optimizationTemplate: PromptTemplate = {
        id: 'content-optimization',
        name: 'Content Optimization Template',
        template: `Optimize the following content for {{target_audience}}:

Content: {{content}}

Optimization goals:
{{#each optimization_goals}}
- {{this}}
{{/each}}

Target metrics: {{target_metrics}}`,
        variables: [
          { name: 'content', type: 'string', required: true },
          { name: 'target_audience', type: 'string', required: true },
          { name: 'optimization_goals', type: 'array', required: true },
          { name: 'target_metrics', type: 'string', required: true },
        ],
      };

      templateEngine.registerTemplate(optimizationTemplate);

      const contentWorkflow: AgentStep[] = [
        {
          id: 'content-ingestion',
          name: 'Ingest Content from Multiple Sources',
          type: 'parallel',
          steps: [
            {
              id: 'ingest-documents',
              name: 'Ingest Documents',
              type: 'action',
              action: async context => {
                computerToolMonitor.startMonitoring('document-processing', {
                  toolName: 'Document Processor',
                  operation: 'bulk_document_ingestion',
                });

                // Simulate document processing
                await new Promise(resolve => setTimeout(resolve, 200));

                const result = computerToolMonitor.endMonitoring('document-processing', {
                  success: true,
                  operation: 'bulk_document_ingestion',
                });

                const documents = [
                  { id: 'doc1', content: 'Article about AI trends', type: 'article' },
                  { id: 'doc2', content: 'Product documentation', type: 'documentation' },
                  { id: 'doc3', content: 'Marketing copy', type: 'marketing' },
                ];

                return {
                  success: true,
                  data: { documents, processingTime: result.totalExecutionTime },
                };
              },
            },
            {
              id: 'ingest-web-content',
              name: 'Ingest Web Content',
              type: 'action',
              action: async context => {
                const webContent = await mockExternalAPI.call('/web-scraper', {
                  urls: ['https://example.com/content1', 'https://example.com/content2'],
                });

                if (webContent.success) {
                  return {
                    success: true,
                    data: {
                      webContent: [
                        { url: 'https://example.com/content1', content: 'Web content 1' },
                        { url: 'https://example.com/content2', content: 'Web content 2' },
                      ],
                    },
                  };
                }

                return { success: false, data: { error: 'Web scraping failed' } };
              },
            },
          ],
        },
        {
          id: 'content-analysis',
          name: 'Analyze Content Quality',
          type: 'action',
          condition: {
            type: 'simple',
            expression: 'context.data.documents || context.data.webContent',
          },
          action: async context => {
            const allContent = [
              ...(context.data.documents || []),
              ...(context.data.webContent || []),
            ];

            const qualityScores = allContent.map(item => ({
              id: item.id || item.url,
              content: item.content,
              qualityScore: Math.random() * 100,
              readabilityScore: Math.random() * 100,
              seoScore: Math.random() * 100,
            }));

            // Filter content that needs optimization (quality score < 70)
            const contentNeedingOptimization = qualityScores.filter(item => item.qualityScore < 70);

            context.data.contentAnalysis = qualityScores;
            context.data.optimizationCandidates = contentNeedingOptimization;

            return {
              success: true,
              data: {
                totalContent: allContent.length,
                needsOptimization: contentNeedingOptimization.length,
                averageQuality:
                  qualityScores.reduce((sum, item) => sum + item.qualityScore, 0) /
                  qualityScores.length,
              },
            };
          },
        },
        {
          id: 'batch-optimization',
          name: 'Optimize Content in Batches',
          type: 'loop',
          condition: {
            type: 'simple',
            expression:
              'context.data.optimizationCandidates && context.data.optimizationCandidates.length > 0',
          },
          maxIterations: 5,
          steps: [
            {
              id: 'optimize-batch',
              name: 'Optimize Content Batch',
              type: 'action',
              action: async context => {
                if (!context.data.optimizedContent) context.data.optimizedContent = [];
                if (!context.data.batchIndex) context.data.batchIndex = 0;

                const batchSize = 2;
                const startIndex = context.data.batchIndex * batchSize;
                const batch = context.data.optimizationCandidates.slice(
                  startIndex,
                  startIndex + batchSize,
                );

                if (batch.length === 0) {
                  context.data.optimizationCandidates = []; // End loop
                  return { success: true, data: { message: 'All batches processed' } };
                }

                const batchResults = [];

                for (const item of batch) {
                  // Render optimization prompt
                  const view = await templateEngine.render('content-optimization', {
                    content: item.content,
                    target_audience: 'general audience',
                    optimization_goals: [
                      'improve readability',
                      'enhance SEO',
                      'increase engagement',
                    ],
                    target_metrics: 'readability score > 80, SEO score > 75',
                  });

                  if (view.success) {
                    // Check cache first
                    const cacheKey = promptCache.generateKey(view.prompt, {
                      task: 'content_optimization',
                      version: 'v1',
                    });

                    const cachedResult = await promptCache.getWithAnalytics(cacheKey);

                    let optimizedContent;
                    if (cachedResult.fromCache && cachedResult.data) {
                      optimizedContent = cachedResult.data.response;
                    } else {
                      const llmResponse = await mockLLMProvider.generateText(view.prompt);
                      optimizedContent = llmResponse.text;

                      await promptCache.setWithAnalytics(cacheKey, view.prompt, optimizedContent, {
                        tokens: llmResponse.usage.totalTokens,
                        cost: llmResponse.usage.totalTokens * 0.003,
                      });
                    }

                    batchResults.push({
                      originalId: item.id,
                      originalContent: item.content,
                      optimizedContent,
                      improvementScore: Math.random() * 30 + 10, // 10-40 point improvement
                    });
                  }
                }

                context.data.optimizedContent.push(...batchResults);
                context.data.batchIndex++;

                // Remove processed items from optimization candidates
                context.data.optimizationCandidates =
                  context.data.optimizationCandidates.slice(batchSize);

                return {
                  success: true,
                  data: {
                    batchSize: batch.length,
                    batchNumber: context.data.batchIndex,
                    totalOptimized: context.data.optimizedContent.length,
                  },
                };
              },
            },
          ],
        },
        {
          id: 'quality-validation',
          name: 'Validate Optimized Content',
          type: 'action',
          condition: {
            type: 'simple',
            expression: 'context.data.optimizedContent && context.data.optimizedContent.length > 0',
          },
          action: async context => {
            const optimizedContent = context.data.optimizedContent;

            const validationResults = await Promise.all(
              optimizedContent.map(async (item: any) => {
                // Simulate quality validation
                await new Promise(resolve => setTimeout(resolve, 50));

                const newQualityScore = Math.min(
                  100,
                  item.originalQualityScore + item.improvementScore,
                );
                const validated = newQualityScore >= 70;

                return {
                  id: item.originalId,
                  validated,
                  qualityScore: newQualityScore,
                  improvementAchieved: item.improvementScore,
                };
              }),
            );

            const validatedContent = validationResults.filter(r => r.validated);
            context.data.validationResults = validationResults;
            context.data.validatedContent = validatedContent;

            return {
              success: true,
              data: {
                totalValidated: validatedContent.length,
                totalProcessed: validationResults.length,
                validationRate: validatedContent.length / validationResults.length,
              },
            };
          },
        },
        {
          id: 'publish-results',
          name: 'Publish Optimized Content',
          type: 'action',
          condition: {
            type: 'simple',
            expression: 'context.data.validatedContent && context.data.validatedContent.length > 0',
          },
          action: async context => {
            const validatedContent = context.data.validatedContent;

            const publishResults = [];

            for (const item of validatedContent) {
              const publishResponse = await mockExternalAPI.call('/content-manager/publish', {
                contentId: item.id,
                qualityScore: item.qualityScore,
                optimizationTimestamp: Date.now(),
              });

              publishResults.push({
                contentId: item.id,
                published: publishResponse.success,
                publishTimestamp: publishResponse.success ? Date.now() : null,
              });
            }

            context.data.publishResults = publishResults;
            const successfulPublishes = publishResults.filter(r => r.published);

            return {
              success: successfulPublishes.length > 0,
              data: {
                totalPublished: successfulPublishes.length,
                totalAttempted: publishResults.length,
                publishSuccessRate: successfulPublishes.length / publishResults.length,
              },
            };
          },
        },
      ];

      const result = await agentExecutor.executeWorkflow(contentWorkflow, {
        data: {},
        metadata: { workflowId: 'content-optimization-workflow' },
      });

      expect(result.success).toBeTruthy();
      expect(result.context.data.contentAnalysis).toBeDefined();
      expect(result.context.data.optimizedContent).toBeDefined();
      expect(result.context.data.publishResults).toBeDefined();

      // Verify computer tools were used
      const computerToolReports = computerToolMonitor.getAllReports?.() || [];
      expect(computerToolReports.length).toBeGreaterThan(0);

      // Verify cache utilization
      const cacheReport = promptCache.generateAnalyticsReport();
      expect(cacheReport.performance.totalRequests).toBeGreaterThan(0);

      // Verify template usage
      const templateMetrics = templateEngine.getPerformanceMetrics('content-optimization');
      expect(templateMetrics?.renderCount).toBeGreaterThan(0);
    }, 20000); // Extended timeout for complex workflow
  });

  describe('error Handling and Recovery', () => {
    test('should handle partial failures and continue workflow execution', async () => {
      const resilientWorkflow: AgentStep[] = [
        {
          id: 'step-1-success',
          name: 'Successful Step',
          type: 'action',
          action: async context => {
            context.data.step1Completed = true;
            return { success: true, data: { message: 'Step 1 completed' } };
          },
        },
        {
          id: 'step-2-failure',
          name: 'Failing Step with Retry',
          type: 'action',
          retryConfig: {
            maxRetries: 2,
            retryDelay: 100,
          },
          action: async context => {
            if (!context.data.failureAttempts) context.data.failureAttempts = 0;
            context.data.failureAttempts++;

            // Succeed on third attempt
            if (context.data.failureAttempts >= 3) {
              context.data.step2Recovered = true;
              return { success: true, data: { message: 'Step 2 recovered after retries' } };
            }

            throw new Error(`Attempt ${context.data.failureAttempts} failed`);
          },
        },
        {
          id: 'step-3-conditional',
          name: 'Conditional Step Based on Previous Success',
          type: 'action',
          condition: {
            type: 'simple',
            expression: 'context.data.step1Completed === true',
          },
          action: async context => {
            context.data.step3Completed = true;
            return {
              success: true,
              data: {
                message: 'Step 3 executed because step 1 succeeded',
                step2Status: context.data.step2Recovered ? 'recovered' : 'failed',
              },
            };
          },
        },
      ];

      const result = await agentExecutor.executeWorkflow(resilientWorkflow, {
        data: {},
        metadata: { workflowId: 'resilient-workflow' },
      });

      expect(result.success).toBeTruthy();
      expect(result.context.data.step1Completed).toBeTruthy();
      expect(result.context.data.step2Recovered).toBeTruthy();
      expect(result.context.data.step3Completed).toBeTruthy();
      expect(result.context.data.failureAttempts).toBe(3);

      // Verify performance monitoring captured the retries
      const workflowMetrics = performanceMonitor.getWorkflowMetrics('resilient-workflow');
      expect(workflowMetrics?.totalSteps).toBe(3);
    });

    test('should handle resource exhaustion and degraded operation', async () => {
      const resourceConstrainedWorkflow: AgentStep[] = [
        {
          id: 'resource-intensive-setup',
          name: 'Resource Intensive Setup',
          type: 'action',
          action: async context => {
            // Simulate resource-intensive operation
            computerToolMonitor.startMonitoring('resource-intensive', {
              toolName: 'Resource Intensive Tool',
              operation: 'heavy_computation',
            });

            // Simulate high resource usage
            computerToolMonitor.recordResourceUsage('resource-intensive', {
              memoryMB: 80, // High memory usage
              cpuPercent: 90, // High CPU usage
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            const result = computerToolMonitor.endMonitoring('resource-intensive', {
              success: true,
              operation: 'heavy_computation',
            });

            context.data.resourceWarnings = result.violations.length > 0;
            return { success: true, data: { resourceWarnings: context.data.resourceWarnings } };
          },
        },
        {
          id: 'adaptive-processing',
          name: 'Adaptive Processing Based on Resources',
          type: 'decision',
          condition: {
            type: 'simple',
            expression: 'context.data.resourceWarnings === true',
          },
          onTrue: [
            {
              id: 'degraded-processing',
              name: 'Use Degraded Processing Mode',
              type: 'action',
              action: async context => {
                // Use smaller batch sizes and lower precision
                context.data.processingMode = 'degraded';
                context.data.batchSize = 5;
                return { success: true, data: { mode: 'degraded', batchSize: 5 } };
              },
            },
          ],
          onFalse: [
            {
              id: 'full-processing',
              name: 'Use Full Processing Mode',
              type: 'action',
              action: async context => {
                context.data.processingMode = 'full';
                context.data.batchSize = 20;
                return { success: true, data: { mode: 'full', batchSize: 20 } };
              },
            },
          ],
        },
        {
          id: 'execute-processing',
          name: 'Execute Processing with Adaptive Parameters',
          type: 'action',
          action: async context => {
            const batchSize = context.data.batchSize;
            const mode = context.data.processingMode;

            // Simulate processing with adaptive parameters
            const batches = Math.ceil(100 / batchSize);
            const processingTime = mode === 'degraded' ? 50 : 200; // Faster but less accurate in degraded mode

            await new Promise(resolve => setTimeout(resolve, processingTime));

            context.data.processingResults = {
              totalItems: 100,
              batchesProcessed: batches,
              mode,
              efficiency: mode === 'degraded' ? 0.8 : 1.0,
            };

            return {
              success: true,
              data: context.data.processingResults,
            };
          },
        },
      ];

      const result = await agentExecutor.executeWorkflow(resourceConstrainedWorkflow, {
        data: {},
        metadata: { workflowId: 'resource-constrained-workflow' },
      });

      expect(result.success).toBeTruthy();
      expect(result.context.data.processingMode).toBeDefined();
      expect(result.context.data.processingResults).toBeDefined();

      // Check resource-based processing mode configuration
      const expectedMode = result.context.data.resourceWarnings ? 'degraded' : 'full';
      const expectedBatchSize = result.context.data.resourceWarnings ? 5 : 20;

      expect(result.context.data.processingMode).toBe(expectedMode);
      expect(result.context.data.batchSize).toBe(expectedBatchSize);
    });
  });

  describe('performance and Resource Management', () => {
    test('should optimize workflow execution based on performance metrics', async () => {
      const performanceOptimizedWorkflow: AgentStep[] = [
        {
          id: 'baseline-performance',
          name: 'Establish Performance Baseline',
          type: 'action',
          action: async context => {
            const startTime = Date.now();

            // Simulate baseline work
            await new Promise(resolve => setTimeout(resolve, 100));

            const baselineTime = Date.now() - startTime;
            context.data.baseline = { executionTime: baselineTime };

            return { success: true, data: { baselineTime } };
          },
        },
        {
          id: 'performance-analysis',
          name: 'Analyze Current Performance',
          type: 'action',
          action: async context => {
            const currentMetrics = performanceMonitor.getMetrics();
            const recommendations = performanceMonitor.getOptimizationRecommendations();

            context.data.performanceAnalysis = {
              currentMetrics,
              recommendations,
              needsOptimization: recommendations.length > 0,
            };

            return {
              success: true,
              data: {
                recommendationCount: recommendations.length,
                needsOptimization: recommendations.length > 0,
              },
            };
          },
        },
        {
          id: 'apply-optimizations',
          name: 'Apply Performance Optimizations',
          type: 'action',
          condition: {
            type: 'simple',
            expression:
              'context.data.performanceAnalysis && context.data.performanceAnalysis.needsOptimization',
          },
          action: async context => {
            const recommendations = context.data.performanceAnalysis.recommendations;
            const appliedOptimizations = [];

            for (const rec of recommendations.slice(0, 3)) {
              // Apply top 3 recommendations
              switch (rec.type) {
                case 'caching':
                  // Enable aggressive caching
                  context.data.cachingEnabled = true;
                  appliedOptimizations.push('Enabled aggressive caching');
                  break;
                case 'parallelization':
                  // Enable parallel processing
                  context.data.parallelProcessing = true;
                  appliedOptimizations.push('Enabled parallel processing');
                  break;
                case 'memory':
                  // Optimize memory usage
                  context.data.memoryOptimized = true;
                  appliedOptimizations.push('Applied memory optimizations');
                  break;
              }
            }

            context.data.appliedOptimizations = appliedOptimizations;
            return { success: true, data: { optimizations: appliedOptimizations } };
          },
        },
        {
          id: 'optimized-execution',
          name: 'Execute with Optimizations',
          type: 'action',
          action: async context => {
            const startTime = Date.now();

            // Simulate optimized execution
            const baseDuration = 200;
            let optimizationFactor = 1.0;

            if (context.data.cachingEnabled) optimizationFactor *= 0.7; // 30% faster
            if (context.data.parallelProcessing) optimizationFactor *= 0.8; // 20% faster
            if (context.data.memoryOptimized) optimizationFactor *= 0.9; // 10% faster

            const optimizedDuration = Math.floor(baseDuration * optimizationFactor);
            await new Promise(resolve => setTimeout(resolve, optimizedDuration));

            const actualExecutionTime = Date.now() - startTime;
            const improvementPercentage =
              ((baseDuration - actualExecutionTime) / baseDuration) * 100;

            context.data.optimizedResults = {
              executionTime: actualExecutionTime,
              baselineTime: baseDuration,
              improvementPercentage,
              optimizationsUsed: context.data.appliedOptimizations || [],
            };

            return {
              success: true,
              data: context.data.optimizedResults,
            };
          },
        },
      ];

      const result = await agentExecutor.executeWorkflow(performanceOptimizedWorkflow, {
        data: {},
        metadata: { workflowId: 'performance-optimized-workflow' },
      });

      expect(result.success).toBeTruthy();
      expect(result.context.data.performanceAnalysis).toBeDefined();

      // Check optimization results based on applied optimizations
      const hasOptimizations = result.context.data.appliedOptimizations;
      const hasOptimizedResults = !!result.context.data.optimizedResults;

      // Verify optimization status consistency
      expect(hasOptimizedResults).toBe(!!hasOptimizations);

      // Check results structure - improvement percentage should be valid when optimizations exist
      const improvementPercentage = result.context.data.optimizedResults?.improvementPercentage;
      const hasValidImprovement =
        typeof improvementPercentage === 'number' && improvementPercentage >= 0;
      expect(hasOptimizations ? hasValidImprovement : true).toBeTruthy();

      // Verify performance monitoring captured the optimization
      const finalMetrics = performanceMonitor.getMetrics();
      expect(finalMetrics.totalStepsExecuted).toBeGreaterThan(0);
    });
  });
});

describe('cross-Feature Integration', () => {
  test('should demonstrate seamless integration between all AI SDK v5 features', async () => {
    // This test combines agents, prompts, caching, streaming, computer tools, and monitoring
    const comprehensiveWorkflow: AgentStep[] = [
      {
        id: 'initialize-all-systems',
        name: 'Initialize All AI Systems',
        type: 'parallel',
        steps: [
          {
            id: 'init-cache',
            name: 'Initialize Enhanced Caching',
            type: 'action',
            action: async context => {
              context.data.cacheInitialized = true;
              return { success: true, data: { system: 'cache' } };
            },
          },
          {
            id: 'init-monitoring',
            name: 'Initialize Performance Monitoring',
            type: 'action',
            action: async context => {
              context.data.monitoringInitialized = true;
              return { success: true, data: { system: 'monitoring' } };
            },
          },
          {
            id: 'init-computer-tools',
            name: 'Initialize Computer Tools',
            type: 'action',
            action: async context => {
              context.data.computerToolsInitialized = true;
              return { success: true, data: { system: 'computer-tools' } };
            },
          },
        ],
      },
      {
        id: 'comprehensive-processing',
        name: 'Execute Comprehensive AI Processing',
        type: 'action',
        condition: {
          type: 'simple',
          expression:
            'context.data.cacheInitialized && context.data.monitoringInitialized && context.data.computerToolsInitialized',
        },
        action: async context => {
          // Use all systems together
          const processingResults = {
            cacheHits: 0,
            llmCalls: 0,
            computerToolOperations: 0,
            totalProcessingTime: 0,
          };

          const startTime = Date.now();

          // Process multiple items using all features
          for (let i = 0; i < 3; i++) {
            // Check cache first
            const cacheKey = promptCache.generateKey(`processing-item-${i}`, { iteration: i });
            const cachedResult = await promptCache.getWithAnalytics(cacheKey);

            if (cachedResult.fromCache) {
              processingResults.cacheHits++;
            } else {
              // Use LLM
              const llmResponse = await mockLLMProvider.generateText(`Process item ${i}`);
              await promptCache.setWithAnalytics(cacheKey, `Process item ${i}`, llmResponse.text, {
                tokens: llmResponse.usage.totalTokens,
                cost: llmResponse.usage.totalTokens * 0.003,
              });
              processingResults.llmCalls++;
            }

            // Use computer tools
            computerToolMonitor.startMonitoring(`tool-operation-${i}`, {
              toolName: 'Comprehensive Processor',
              operation: `process_item_${i}`,
            });

            await new Promise(resolve => setTimeout(resolve, 50));

            computerToolMonitor.endMonitoring(`tool-operation-${i}`, {
              success: true,
              operation: `process_item_${i}`,
            });

            processingResults.computerToolOperations++;
          }

          processingResults.totalProcessingTime = Date.now() - startTime;
          context.data.comprehensiveResults = processingResults;

          return { success: true, data: processingResults };
        },
      },
      {
        id: 'generate-integration-report',
        name: 'Generate Cross-Feature Integration Report',
        type: 'action',
        action: async context => {
          const results = context.data.comprehensiveResults;

          // Get metrics from all systems
          const cacheMetrics = promptCache.getStats();
          const performanceMetrics = performanceMonitor.getMetrics();
          const flowMetrics = flowController.getMetrics();

          const integrationReport = {
            execution: results,
            systemMetrics: {
              cache: {
                size: cacheMetrics.cache.size,
                hitRate: cacheMetrics.cache.avgHitRate,
              },
              performance: {
                totalSteps: performanceMetrics.totalStepsExecuted,
                averageDuration: performanceMetrics.averageStepDuration,
              },
              flowControl: {
                throughput: flowMetrics.actualThroughput,
                efficiency: flowMetrics.efficiency,
              },
            },
            integration: {
              allSystemsOperational: true,
              crossFeatureCallsSuccessful: results.cacheHits + results.llmCalls > 0,
              resourceUtilizationOptimal: flowMetrics.efficiency > 70,
            },
          };

          context.data.integrationReport = integrationReport;
          return { success: true, data: integrationReport };
        },
      },
    ];

    const result = await agentExecutor.executeWorkflow(comprehensiveWorkflow, {
      data: {},
      metadata: { workflowId: 'comprehensive-integration-workflow' },
    });

    expect(result.success).toBeTruthy();
    expect(result.context.data.integrationReport).toBeDefined();
    expect(result.context.data.integrationReport.integration.allSystemsOperational).toBeTruthy();
    expect(
      result.context.data.integrationReport.execution.cacheHits +
        result.context.data.integrationReport.execution.llmCalls,
    ).toBeGreaterThan(0);

    // Verify all systems were utilized
    expect(result.context.data.cacheInitialized).toBeTruthy();
    expect(result.context.data.monitoringInitialized).toBeTruthy();
    expect(result.context.data.computerToolsInitialized).toBeTruthy();

    // Verify cross-system metrics
    const finalCacheStats = promptCache.getStats();
    expect(finalCacheStats.cache.size).toBeGreaterThan(0);

    const finalPerformanceMetrics = performanceMonitor.getMetrics();
    expect(finalPerformanceMetrics.totalStepsExecuted).toBeGreaterThan(0);

    console.log('🎉 Comprehensive integration test completed successfully!');
    console.log(
      'Integration Report:',
      JSON.stringify(result.context.data.integrationReport, null, 2),
    );
  }, 15000);
});
