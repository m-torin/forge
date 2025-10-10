/**
 * Advanced Tool Calling Example with AI SDK v5 RAG
 * Demonstrates multi-step reasoning, custom tools, and complex workflows
 */

import { openai } from '@ai-sdk/openai';
import { generateText, streamText, tool } from 'ai';
import { z } from 'zod/v3';
import { createProductionRAG, createRAGToolset, type RAGToolConfig } from '../index';

/**
 * Custom analysis tool that combines RAG with external APIs
 */
export function createAdvancedAnalysisTool(config: RAGToolConfig) {
  return tool({
    description:
      'Perform comprehensive analysis combining knowledge base search with data processing',
    inputSchema: z.object({
      topic: z.string().describe('The topic to analyze'),
      analysisType: z
        .enum(['trend', 'comparison', 'summary', 'prediction'])
        .describe('Type of analysis'),
      depth: z.enum(['shallow', 'medium', 'deep']).default('medium').describe('Analysis depth'),
      includeExternalData: z.boolean().default(false).describe('Include external data sources'),
      timeframe: z.string().optional().describe('Time period for analysis (e.g., "last 6 months")'),
    }),
    execute: async ({ topic, analysisType, depth, includeExternalData, timeframe }) => {
      const results = {
        topic,
        analysisType,
        findings: [] as Array<{ source: string; content: string; confidence: number }>,
        insights: [] as string[],
        recommendations: [] as string[],
        metadata: {
          searchQueries: [] as string[],
          sourcesUsed: 0,
          analysisDepth: depth,
          timestamp: new Date().toISOString(),
        },
      };

      // Generate search queries based on analysis type
      const searchQueries = generateSearchQueries(topic, analysisType, timeframe);
      results.metadata.searchQueries = searchQueries;

      // Search knowledge base for each query
      for (const query of searchQueries) {
        const searchResults = await config.vectorStore.queryDocuments(query, {
          topK: depth === 'deep' ? 10 : depth === 'medium' ? 7 : 5,
          threshold: 0.6,
          includeContent: true,
        });

        results.findings.push(
          ...searchResults.map(result => ({
            source: result.metadata?.title || result.metadata?.source || 'Knowledge Base',
            content: result.content || '',
            confidence: result.score,
          })),
        );
      }

      results.metadata.sourcesUsed = results.findings.length;

      // Generate insights based on findings
      results.insights = generateInsights(results.findings, analysisType);

      // Generate recommendations
      results.recommendations = generateRecommendations(results.findings, analysisType, topic);

      // Include external data if requested
      if (includeExternalData) {
        const externalData = await fetchExternalData(topic, analysisType);
        results.findings.push(...externalData);
      }

      return results;
    },
  });
}

/**
 * Custom workflow orchestration tool
 */
export function createWorkflowTool(config: RAGToolConfig) {
  return tool({
    description: 'Execute complex multi-step workflows with RAG integration',
    inputSchema: z.object({
      workflowType: z
        .enum(['research', 'analysis', 'synthesis', 'evaluation'])
        .describe('Workflow type'),
      steps: z
        .array(
          z.object({
            action: z.string().describe('Action to perform'),
            parameters: z.record(z.string(), z.any()).describe('Action parameters'),
          }),
        )
        .describe('Workflow steps'),
      parallelize: z.boolean().default(false).describe('Execute steps in parallel where possible'),
    }),
    execute: async ({ workflowType, steps, parallelize }, _context) => {
      const results = {
        workflowType,
        stepResults: [] as Array<{ step: number; action: string; result: any; duration: number }>,
        summary: '',
        totalDuration: 0,
        success: true,
        errors: [] as string[],
      };

      const startTime = Date.now();

      try {
        if (parallelize) {
          // Execute steps in parallel where dependencies allow
          const stepPromises = steps.map(async (step: any, index: number) => {
            const stepStart = Date.now();
            const result = await executeWorkflowStep(step, config);
            const duration = Date.now() - stepStart;

            return {
              step: index + 1,
              action: step.action,
              result,
              duration,
            };
          });

          results.stepResults = await Promise.all(stepPromises);
        } else {
          // Execute steps sequentially
          for (let i = 0; i < steps.length; i++) {
            const stepStart = Date.now();
            try {
              const result = await executeWorkflowStep(steps[i], config);
              const duration = Date.now() - stepStart;

              results.stepResults.push({
                step: i + 1,
                action: steps[i].action,
                result,
                duration,
              });
            } catch (error) {
              results.errors.push(
                `Step ${i + 1}: ${error instanceof Error ? error.message : String(error)}`,
              );
              results.success = false;
            }
          }
        }

        results.totalDuration = Date.now() - startTime;
        results.summary = generateWorkflowSummary(results);
      } catch (error) {
        results.success = false;
        results.errors.push(error instanceof Error ? error.message : String(error));
        results.totalDuration = Date.now() - startTime;
      }

      return results;
    },
  });
}

/**
 * Real-time collaboration tool
 */
export function createCollaborationTool(config: RAGToolConfig) {
  return tool({
    description: 'Facilitate real-time collaboration with shared knowledge and context',
    inputSchema: z.object({
      sessionId: z.string().describe('Collaboration session ID'),
      action: z.enum(['join', 'share', 'sync', 'leave']).describe('Collaboration action'),
      data: z.any().optional().describe('Data to share or sync'),
      participants: z.array(z.string()).optional().describe('Participant IDs'),
    }),
    execute: async ({ sessionId, action, data, participants }) => {
      const result = {
        sessionId,
        action,
        timestamp: new Date().toISOString(),
        success: false,
        data: null as any,
        participants: participants || [],
      };

      try {
        switch (action) {
          case 'join':
            result.data = await joinCollaborationSession(sessionId, config);
            result.success = true;
            break;

          case 'share':
            result.data = await shareKnowledge(sessionId, data, config);
            result.success = true;
            break;

          case 'sync':
            result.data = await syncCollaborationState(sessionId, config);
            result.success = true;
            break;

          case 'leave':
            result.data = await leaveCollaborationSession(sessionId);
            result.success = true;
            break;

          default:
            throw new Error(`Unknown collaboration action: ${action}`);
        }
      } catch (error) {
        result.success = false;
        result.data = { error: error instanceof Error ? error.message : String(error) };
      }

      return result;
    },
  });
}

/**
 * Complete tool calling example with complex workflow
 */
export async function demonstrateAdvancedToolCalling() {
  // Initialize RAG system
  const ragSystem = createProductionRAG({
    languageModel: openai('gpt-4o'),
    databaseConfig: { namespace: 'advanced-tools' },
  });

  // Create RAG tools
  const basicTools = createRAGToolset({
    vectorStore: ragSystem.vectorStore,
    enableSourceTracking: true,
    enableBatchProcessing: true,
  });

  // Create custom tools
  const advancedTools = {
    ...basicTools,
    advancedAnalysis: createAdvancedAnalysisTool({
      vectorStore: ragSystem.vectorStore,
      enableSourceTracking: true,
    }),
    workflowExecution: createWorkflowTool({
      vectorStore: ragSystem.vectorStore,
      enableSourceTracking: true,
    }),
    collaboration: createCollaborationTool({
      vectorStore: ragSystem.vectorStore,
      enableSourceTracking: true,
    }),
  };

  // Example 1: Complex analysis workflow
  const analysisResult = await generateText({
    model: openai('gpt-4o'),
    tools: advancedTools,
    messages: [
      {
        role: 'system',

        content: `You are an advanced AI analyst with access to comprehensive tools.
            Perform thorough analysis using multiple steps and cross-reference findings.`,
      },
      {
        role: 'user',

        content: `Perform a comprehensive analysis of machine learning trends in the healthcare industry.
            I need both current state analysis and future predictions.`,
      },
    ],
  });

  console.log('Analysis Result:', analysisResult.text);
  console.log('Tools Used:', analysisResult.toolCalls?.length || 0);

  // Example 2: Multi-step workflow with different tool combinations
  const workflowResult = streamText({
    model: openai('gpt-4o'),
    tools: advancedTools,
    messages: [
      {
        role: 'system',

        content:
          'You are a research coordinator. Break down complex research tasks into steps and execute them systematically.',
      },
      {
        role: 'user',

        content: `I need to research the impact of AI on software development productivity.
            Create a comprehensive research plan and execute it step by step.`,
      },
    ],
    onFinish: result => {
      console.log(`Workflow completed with ${result.toolCalls?.length || 0} tool calls`);
    },
  });

  return {
    analysisResult,
    workflowResult,
    ragSystem,
    tools: advancedTools,
  };
}

/**
 * Helper functions for advanced tool implementations
 */

function generateSearchQueries(topic: string, analysisType: string, timeframe?: string): string[] {
  const baseQueries = [topic, `${topic} trends`, `${topic} applications`, `${topic} challenges`];

  const typeQueries: Record<string, string[]> = {
    trend: [`${topic} market trends`, `${topic} growth patterns`, `${topic} adoption rates`],
    comparison: [`${topic} comparison`, `${topic} alternatives`, `${topic} versus`],
    summary: [`${topic} overview`, `${topic} fundamentals`, `${topic} key concepts`],
    prediction: [`${topic} future`, `${topic} predictions`, `${topic} forecasts`],
  };

  const queries = [...baseQueries, ...(typeQueries[analysisType] || [])];

  if (timeframe) {
    queries.push(`${topic} ${timeframe}`);
  }

  return queries;
}

function generateInsights(
  findings: Array<{ source: string; content: string; confidence: number }>,
  _analysisType: string,
): string[] {
  // This would typically use NLP analysis on the findings
  // For demo purposes, return sample insights
  return [
    `High confidence patterns identified across ${findings.length} sources`,
    `Key themes emerge from cross-source analysis`,
    `Confidence levels range from ${Math.min(...findings.map(f => f.confidence)).toFixed(2)} to ${Math.max(...findings.map(f => f.confidence)).toFixed(2)}`,
  ];
}

function generateRecommendations(
  findings: Array<{ source: string; content: string; confidence: number }>,
  _analysisType: string,
  _topic: string,
): string[] {
  return [
    `Focus on high-confidence findings (${findings.filter(f => f.confidence > 0.8).length} sources)`,
    `Consider additional research in areas with lower confidence`,
    `Implement findings gradually based on confidence levels`,
  ];
}

async function fetchExternalData(topic: string, analysisType: string) {
  // Simulate external API calls
  return [
    {
      source: 'External API',
      content: `External data for ${topic} (${analysisType})`,
      confidence: 0.7,
    },
  ];
}

async function executeWorkflowStep(
  step: { action: string; parameters: Record<string, any> },
  config: RAGToolConfig,
) {
  // Simulate step execution
  switch (step.action) {
    case 'search':
      return await config.vectorStore.queryDocuments(step.parameters.query, {
        topK: step.parameters.topK || 5,
      });
    case 'analyze':
      return { analysis: `Analysis result for ${step.parameters.topic}` };
    case 'synthesize':
      return { synthesis: `Synthesis of ${step.parameters.sources?.length || 0} sources` };
    default:
      return { result: `Executed ${step.action}` };
  }
}

function generateWorkflowSummary(results: any): string {
  const successSteps = results.stepResults.filter((r: any) => !r.error).length;
  const totalSteps = results.stepResults.length;
  const avgDuration =
    results.stepResults.reduce((acc: number, r: any) => acc + r.duration, 0) / totalSteps;

  return `Workflow completed: ${successSteps}/${totalSteps} steps successful, average step duration: ${avgDuration.toFixed(0)}ms`;
}

async function joinCollaborationSession(sessionId: string, config: RAGToolConfig) {
  return {
    sessionId,
    status: 'joined',
    sharedKnowledge: await config.vectorStore.queryDocuments('collaboration', { topK: 3 }),
  };
}

async function shareKnowledge(sessionId: string, data: any, _config: RAGToolConfig) {
  // In a real implementation, this would store shared knowledge
  return {
    sessionId,
    shared: true,
    data: data,
  };
}

async function syncCollaborationState(sessionId: string, _config: RAGToolConfig) {
  return {
    sessionId,
    synced: true,
    timestamp: new Date().toISOString(),
  };
}

async function leaveCollaborationSession(sessionId: string) {
  return {
    sessionId,
    status: 'left',
  };
}
