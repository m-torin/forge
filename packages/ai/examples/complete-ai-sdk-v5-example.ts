/**
 * Complete AI SDK v5 Tools Example
 *
 * Demonstrates all the advanced tool patterns and features:
 * - experimental_activeTools for dynamic tool limiting
 * - Tool call repair mechanisms
 * - Language model middleware (guardrails, caching, logging)
 * - Enhanced MCP integration
 * - Tool execution validation and error recovery
 * - Tool result streaming and progressive disclosure
 */

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod/v4';
import {
  // Agentic tools
  agenticTool,
  createAgentWorkflow,
  // MCP integration
  createMCPToolset,
  // Streaming
  createStreamingTool,
  mcpHealthTool,
  // Middleware
  middlewareTools,
  // Tool repair
  repairPresets,
  streamingExamples,
  streamingUtils,
  // Validation
  validatedTools,
} from '../src/server/tools';

/**
 * Example 1: Complete Production Agent with All Features
 * Shows a sophisticated agent using every advanced pattern
 */
async function completeProductionAgent() {
  console.log('🚀 Complete Production Agent Example');

  // Create base tools with comprehensive capabilities
  const researchTool = validatedTools.withStrictValidation(
    middlewareTools.withProductionMiddleware(
      agenticTool({
        description: 'Research information with validation and middleware',
        parameters: z.object({
          topic: z.string().min(1).max(200),
          depth: z.enum(['basic', 'detailed', 'comprehensive']).default('basic'),
          sources: z.array(z.string()).optional(),
        }),
        execute: async ({ topic, depth, sources }) => {
          // Simulate research with potential for errors (testing repair mechanisms)
          if (Math.random() < 0.2) {
            throw new Error('Research API temporarily unavailable');
          }

          return {
            topic,
            findings: [
              `${depth} research on ${topic}`,
              'Key insights discovered',
              'Multiple sources consulted',
            ],
            sources: sources || ['Academic papers', 'Industry reports', 'Expert interviews'],
            confidence: depth === 'comprehensive' ? 0.95 : 0.8,
            timestamp: new Date().toISOString(),
          };
        },
        repairConfig: repairPresets.comprehensive,
        trackHistory: true,
      }),
    ),
  );

  // Streaming analysis tool for large datasets
  const analysisStream = createStreamingTool({
    description: 'Perform streaming analysis with progress tracking',
    parameters: z.object({
      data: z.any(),
      analysisType: z.enum(['statistical', 'semantic', 'predictive']).default('statistical'),
    }),
    trackProgress: true,
    enableIntermediateResults: true,

    execute: async function* (args, stream) {
      const { data: _data, analysisType } = args;
      const stages = ['preprocessing', 'analysis', 'validation', 'reporting'];
      const progressTracker = streamingUtils.createProgressTracker(stages.length, 'Analysis');

      let results: any = { type: analysisType, stages: {} };

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];

        if (stream.isCancelled()) {
          break;
        }

        // Simulate stage processing
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

        const stageResult = {
          stage,
          completed: true,
          insights: [`${stage} insights for ${analysisType} analysis`],
          metrics: { accuracy: 0.85 + Math.random() * 0.1 },
        };

        results.stages[stage] = stageResult;

        // Emit progress and intermediate results
        const progress = progressTracker.increment(1, `Completed ${stage}`);
        stream.progress(progress);
        stream.intermediate(stageResult, stage);

        yield {
          type: 'intermediate' as const,
          data: stageResult,
          timestamp: Date.now(),
          sequence: stream.getSequence(),
          metadata: { stage, progress: progress.percentage },
        };
      }

      return {
        ...results,
        summary: `${analysisType} analysis completed with ${stages.length} stages`,
        finalScore: 0.92,
        completedAt: new Date().toISOString(),
      };
    },
  });

  // MCP tools integration
  const mcpTools = await createMCPToolset({
    autoDiscover: true,
    includeServerPrefix: false,
  });

  // Create enhanced workflow with all advanced features
  const workflow = createAgentWorkflow({
    tools: {
      research: researchTool,
      analysis: analysisStream,
      health: mcpHealthTool,
      ...mcpTools,
    },
    maxSteps: 8,
    activeToolsStrategy: context => {
      // Progressive tool unlocking based on workflow stage
      const stepNumber = context.stepNumber;
      const baseTools = ['research'];

      if (stepNumber >= 1) baseTools.push('health');
      if (stepNumber >= 2) baseTools.push('analysis');
      if (stepNumber >= 3) baseTools.push(...Object.keys(mcpTools));

      return baseTools;
    },
    repairConfig: {
      maxRetries: 3,
      repairStrategies: ['retry', 'fallback'],
    },
    hooks: {
      onStepFinish: async ({ stepNumber, toolCalls, toolResults }) => {
        console.log(`🔄 Step ${stepNumber}: ${toolCalls?.[0]?.toolName || 'thinking'}`);

        if (toolResults?.length) {
          const result = toolResults[0].result;
          if (result._middleware) {
            console.log(`  📊 Middleware: ${result._middleware.applied.join(', ')}`);
            console.log(`  ⏱️  Duration: ${result._middleware.duration}ms`);
          }
        }
      },

      experimental_prepareStep: async context => {
        const activeTools = workflow.getActiveTools(context.stepNumber);
        console.log(`  🔧 Active tools: ${activeTools.join(', ')}`);

        return {
          activeTools, // Using stable API (AI SDK v5.0+)
        };
      },
    },
  });

  // Execute the complete workflow
  const result = await generateText({
    model: openai('gpt-4o'),
    ...workflow,
    system: `You are an advanced AI research assistant with access to:
    - Research tools with automatic error recovery and middleware
    - Streaming analysis capabilities with progress tracking
    - MCP server integration for file system and web access
    - Comprehensive validation and caching

    Your tools are progressively unlocked as you work through the problem.
    All tools have built-in error recovery, validation, and performance monitoring.`,
    prompt: `Conduct a comprehensive analysis of "AI SDK v5 adoption trends" including:
    1. Research the topic thoroughly
    2. Analyze any available data
    3. Check system health
    4. Use external tools as needed

    Show your work step by step and utilize the advanced capabilities available.`,
  });

  console.log('✅ Complete workflow finished!');
  console.log(`📊 Total steps: ${workflow.getStepHistory().length}`);
  console.log(
    `🛠️  Tools used: ${[...new Set(workflow.getAllToolCalls().map(tc => tc.toolName))].join(', ')}`,
  );
  console.log('📄 Final result:', result.text);
}

/**
 * Example 2: Streaming Data Processing Pipeline
 * Shows real-time streaming with multiple tools
 */
async function streamingDataPipeline() {
  console.log('📊 Streaming Data Processing Pipeline');

  // Create streaming tools for different stages
  const dataIngestion = streamingExamples.dataProcessor;
  const analysis = streamingExamples.multiStageAnalyzer;

  // Mock large dataset
  const largeDataset = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    value: Math.random() * 1000,
    category: ['A', 'B', 'C'][i % 3],
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
  }));

  console.log('🔄 Starting streaming data ingestion...');

  // Stream data processing
  const processingStream = dataIngestion.stream({
    data: largeDataset,
    batchSize: 5,
    delay: 100,
  });

  let processedData: any = null;

  for await (const chunk of processingStream) {
    if (chunk.type === 'progress') {
      console.log(`  📈 Progress: ${chunk.data.percentage}% - ${chunk.data.message}`);
      if (chunk.data.estimatedTimeRemaining) {
        console.log(`     ⏰ ETA: ${Math.round(chunk.data.estimatedTimeRemaining / 1000)}s`);
      }
    } else if (chunk.type === 'intermediate') {
      console.log(`  📦 Processed batch ${chunk.metadata?.batchIndex + 1}`);
    } else if (chunk.type === 'partial') {
      console.log(`  📊 Partial results: ${chunk.data.length} items processed`);
    } else if (chunk.type === 'final') {
      processedData = chunk.data;
      console.log(`  ✅ Processing complete: ${processedData.totalProcessed} items`);
    }
  }

  if (processedData) {
    console.log('🔍 Starting streaming analysis...');

    // Stream analysis of processed data
    const analysisStream = analysis.stream({
      input: processedData,
      stages: ['validate', 'aggregate', 'pattern-detect', 'insights'],
    });

    for await (const chunk of analysisStream) {
      if (chunk.type === 'progress') {
        console.log(`  📈 Analysis: ${chunk.data.percentage}% - ${chunk.data.message}`);
      } else if (chunk.type === 'intermediate') {
        console.log(`  🔬 Completed stage: ${chunk.metadata?.stage}`);
      } else if (chunk.type === 'final') {
        console.log(`  ✅ Analysis complete: ${chunk.data.completedStages.join(' → ')}`);
        console.log(
          `  📊 Final insights: ${JSON.stringify(chunk.data.finalResult).slice(0, 100)}...`,
        );
      }
    }
  }
}

/**
 * Example 3: Error Recovery and Resilience Demo
 * Shows how tools handle failures gracefully
 */
async function errorRecoveryDemo() {
  console.log('🛡️ Error Recovery and Resilience Demo');

  // Create tool that randomly fails to test recovery
  const unreliableTool = validatedTools.withGracefulDegradation(
    agenticTool({
      description: 'Unreliable tool for testing error recovery',
      parameters: z.object({
        task: z.string(),
        failureRate: z.number().min(0).max(1).default(0.3),
      }),
      execute: async ({ task, failureRate }) => {
        console.log(`    🎲 Attempting: ${task} (failure rate: ${failureRate * 100}%)`);

        if (Math.random() < failureRate) {
          const errorTypes = [
            'Network timeout',
            'Service unavailable',
            'Rate limit exceeded',
            'Invalid response format',
          ];
          const error = errorTypes[Math.floor(Math.random() * errorTypes.length)];
          throw new Error(error);
        }

        return {
          task,
          status: 'success',
          result: `Successfully completed: ${task}`,
          timestamp: new Date().toISOString(),
        };
      },
      repairConfig: {
        maxRetries: 4,
        repairStrategies: ['retry', 'fallback'],
        onRepairAttempt: async context => {
          console.log(`    🔧 Repair attempt ${context.attempt}: ${context.strategy}`);
        },
        onRepairSuccess: async context => {
          console.log(`    ✅ Recovered after ${context.totalAttempts} attempts`);
        },
        onRepairFailure: async context => {
          console.log(`    ❌ Failed after ${context.totalAttempts} attempts`);
        },
      },
    }),
  );

  const tasks = [
    'Process user data',
    'Generate report',
    'Send notifications',
    'Update database',
    'Sync with external API',
  ];

  for (const task of tasks) {
    try {
      console.log(`
🔄 Task: ${task}`);
      const result = await unreliableTool.execute({ task, failureRate: 0.4 });
      console.log(`    ✅ ${result.status}: ${result.result}`);
    } catch (error) {
      console.log(`    ❌ Final failure: ${error instanceof Error ? error.message : error}`);
    }
  }
}

/**
 * Run all examples
 */
async function runCompleteDemo() {
  console.log('🎯 Complete AI SDK v5 Tools Demo');
  console.log('='.repeat(50));

  try {
    await completeProductionAgent();
    console.log('' + '='.repeat(50));

    await streamingDataPipeline();
    console.log('' + '='.repeat(50));

    await errorRecoveryDemo();

    console.log('\n🎉 All demos completed successfully!');
    console.log('\n📋 Features demonstrated:');
    console.log('✅ activeTools (stable API) - Progressive tool unlocking');
    console.log('✅ Tool call repair - Automatic error recovery');
    console.log('✅ Middleware - Guardrails, caching, logging');
    console.log('✅ MCP integration - External server tools');
    console.log('✅ Validation - Input/output validation');
    console.log('✅ Streaming - Real-time progress updates');
    console.log('✅ Circuit breakers - Resilience patterns');
    console.log('✅ Performance monitoring - Execution metrics');
  } catch (error) {
    console.error('❌ Demo error:', error);
  }
}

// Export functions for testing
export { completeProductionAgent, errorRecoveryDemo, streamingDataPipeline };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteDemo();
}
