/**
 * Enhanced Agentic Tools Examples - AI SDK v5 Compliant
 *
 * Demonstrates the latest tool patterns including:
 * - experimental_activeTools for dynamic tool limiting
 * - Tool call repair mechanisms
 * - Progressive tool unlocking strategies
 */

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod/v4';
import {
  StoppingConditions,
  agenticTool,
  createAgentWorkflow,
  repairPresets,
  repairableTools,
} from '../src/server/tools';

/**
 * Example 1: Dynamic Tool Limiting with experimental_activeTools
 * Shows how tools are progressively unlocked as the agent advances
 */
async function progressiveToolUnlockingExample() {
  console.log('🔧 Progressive Tool Unlocking Example');

  const tools = {
    research: agenticTool({
      description: 'Research information about a topic',
      parameters: z.object({
        topic: z.string(),
        depth: z.enum(['basic', 'detailed', 'comprehensive']).default('basic'),
      }),
      execute: async ({ topic, depth }) => ({
        findings: [`${depth} research on ${topic}`, 'Key insights found', 'Sources identified'],
        nextSteps: depth === 'basic' ? ['Need deeper analysis'] : ['Ready for analysis'],
      }),
    }),

    analyze: agenticTool({
      description: 'Analyze research findings',
      parameters: z.object({
        findings: z.array(z.string()),
        analysisType: z.enum(['qualitative', 'quantitative']).default('qualitative'),
      }),
      execute: async ({ findings: _findings, analysisType }) => ({
        insights: [
          `${analysisType} analysis completed`,
          'Patterns identified',
          'Conclusions drawn',
        ],
        confidence: 0.85,
        needsValidation: true,
      }),
    }),

    validate: agenticTool({
      description: 'Validate analysis results',
      parameters: z.object({
        insights: z.array(z.string()),
        confidence: z.number(),
      }),
      execute: async ({ insights, confidence }) => ({
        validated: confidence > 0.8,
        finalInsights: insights,
        qualityScore: confidence * 1.1,
      }),
    }),

    report: agenticTool({
      description: 'Generate final report',
      parameters: z.object({
        insights: z.array(z.string()),
        qualityScore: z.number(),
      }),
      execute: async ({ insights: _insights, qualityScore }) => ({
        report: 'Comprehensive analysis report',
        sections: ['Executive Summary', 'Findings', 'Recommendations'],
        quality: qualityScore > 0.9 ? 'Excellent' : 'Good',
      }),
    }),
  };

  const workflow = createAgentWorkflow({
    tools,
    maxSteps: 6,
    activeToolsStrategy: 'progressive', // Tools unlock progressively
    stopWhen: StoppingConditions.whenToolCalled('report'),
    hooks: {
      onStepFinish: async ({ stepNumber, toolCalls }) => {
        console.log(`Step ${stepNumber}: Used ${toolCalls?.[0]?.toolName || 'thinking'}`);

        // Show which tools are active at this step
        const activeTools = workflow.getActiveTools(stepNumber);
        console.log(`  Active tools: ${activeTools.join(', ')}`);
      },
    },
  });

  const result = await generateText({
    model: openai('gpt-4o'),
    ...workflow,
    system: `You are a research analyst. Follow this sequence:
1. Research the topic with basic depth first
2. Perform analysis once research is complete
3. Validate your analysis
4. Generate a final report
Notice that tools become available progressively as you advance.`,
    prompt: 'Analyze the impact of AI SDK v5 on developer productivity',
  });

  console.log('Final result:', result.text);
  console.log(`Total steps: ${workflow.getStepHistory().length}`);
}

/**
 * Example 2: Tool Call Repair with Advanced Error Handling
 * Shows how tools automatically repair malformed inputs
 */
async function toolRepairExample() {
  console.log('🔧 Tool Call Repair Example');

  // Create a tool that's prone to input validation issues
  const dataProcessor = agenticTool({
    description: 'Process structured data with strict validation',
    parameters: z.object({
      data: z.object({
        name: z.string(),
        age: z.number().positive(),
        email: z.string().email(),
        tags: z.array(z.string()),
      }),
      format: z.enum(['json', 'csv', 'xml']),
    }),
    execute: async ({ data, format }) => {
      // Simulate processing
      return {
        processed: true,
        format,
        records: 1,
        validatedData: data,
      };
    },
    // Enable comprehensive repair for handling malformed inputs
    repairConfig: repairPresets.comprehensive,
    trackHistory: true,
  });

  // Create a tool with custom repair strategies
  const apiCaller = agenticTool({
    description: 'Call external API with retry logic',
    parameters: z.object({
      endpoint: z.string().url(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
      payload: z.record(z.any()).optional(),
    }),
    execute: async ({ endpoint, method, payload: _payload }) => {
      // Simulate API call that might fail
      if (Math.random() < 0.3) {
        throw new Error('API temporarily unavailable');
      }

      return {
        status: 200,
        data: { message: 'API call successful', method, endpoint },
        timestamp: new Date().toISOString(),
      };
    },
    repairConfig: {
      maxRetries: 3,
      repairStrategies: ['retry', 'sanitize'],
      timeout: 5000,
      onRepairAttempt: async ({ toolName, attempt, strategy }) => {
        console.log(`  🔄 Repair attempt ${attempt} for ${toolName} using ${strategy}`);
      },
      onRepairSuccess: async ({ toolName, totalAttempts, successfulStrategy }) => {
        console.log(
          `  ✅ ${toolName} repaired after ${totalAttempts} attempts using ${successfulStrategy}`,
        );
      },
    },
  });

  const workflow = createAgentWorkflow({
    tools: {
      processData: dataProcessor,
      callApi: apiCaller,
    },
    maxSteps: 4,
    activeToolsStrategy: 'all',
    hooks: {
      onStepFinish: async ({ stepNumber, toolCalls: _toolCalls, toolResults }) => {
        console.log(`Step ${stepNumber} completed`);
        if (toolResults?.length) {
          console.log(`  Results: ${toolResults.map(r => r.toolName).join(', ')}`);
        }
      },
    },
  });

  const result = await generateText({
    model: openai('gpt-4o'),
    ...workflow,
    system: `You are a data processing assistant. Process the given data and make API calls as needed.
The tools have built-in repair mechanisms that will handle input validation issues and API failures automatically.`,
    prompt: `Process this user data and then call an API to save it:
    {
      "name": "John Doe",
      "age": "25",  // Note: string instead of number - will be auto-repaired
      "email": "john@example.com",
      "tags": ["user", "premium"]
    }
    Use JSON format and call https://api.example.com/users endpoint.`,
  });

  console.log('Processing complete:', result.text);
}

/**
 * Example 3: Conditional Tool Activation
 * Shows how tools can be dynamically enabled based on context
 */
async function conditionalToolsExample() {
  console.log('🎯 Conditional Tool Activation Example');

  const tools = {
    basicSearch: agenticTool({
      description: 'Perform basic search',
      parameters: z.object({ query: z.string() }),
      execute: async ({ query }) => ({
        results: [`Basic result for ${query}`],
        complexity: 'low',
        needsAdvanced: query.includes('complex') || query.includes('detailed'),
      }),
    }),

    advancedSearch: agenticTool({
      description: 'Perform advanced search with filtering',
      parameters: z.object({
        query: z.string(),
        filters: z.array(z.string()).optional(),
        sortBy: z.string().optional(),
      }),
      execute: async ({ query, filters, sortBy }) => ({
        results: [`Advanced result for ${query}`, 'Detailed analysis', 'Filtered data'],
        complexity: 'high',
        confidence: 0.95,
      }),
    }),

    expertAnalysis: agenticTool({
      description: 'Expert level analysis and insights',
      parameters: z.object({
        data: z.any(),
        analysisDepth: z.enum(['surface', 'deep', 'comprehensive']),
      }),
      execute: async ({ data, analysisDepth }) => ({
        expertInsights: [`${analysisDepth} analysis completed`, 'Expert recommendations provided'],
        confidence: analysisDepth === 'comprehensive' ? 0.98 : 0.85,
      }),
    }),
  };

  const workflow = createAgentWorkflow({
    tools,
    maxSteps: 5,
    // Custom function to determine active tools based on context
    activeToolsStrategy: context => {
      const lastStep = context.steps[context.steps.length - 1];
      const lastResult = lastStep?.toolResults?.[0]?.result;

      // Start with basic search only
      if (context.stepNumber === 0) {
        return ['basicSearch'];
      }

      // If basic search indicates need for advanced tools, unlock them
      if (lastResult?.needsAdvanced || lastResult?.complexity === 'low') {
        return ['basicSearch', 'advancedSearch'];
      }

      // If we have high confidence results, enable expert analysis
      if (lastResult?.confidence > 0.9) {
        return ['basicSearch', 'advancedSearch', 'expertAnalysis'];
      }

      return ['basicSearch', 'advancedSearch'];
    },
    hooks: {
      experimental_prepareStep: async context => {
        const activeTools = workflow.getActiveTools(context.stepNumber);
        console.log(`Step ${context.stepNumber}: Available tools: ${activeTools.join(', ')}`);

        return {
          experimental_activeTools: activeTools,
        };
      },
    },
  });

  const result = await generateText({
    model: openai('gpt-4o'),
    ...workflow,
    system: `You are a search specialist. Start with basic search, then use more advanced tools as they become available based on your findings.`,
    prompt: 'I need a complex and detailed analysis of machine learning trends in 2024',
  });

  console.log('Search and analysis complete:', result.text);
}

/**
 * Example 4: Production-Ready Tool with Comprehensive Error Handling
 * Shows enterprise-grade tool configuration
 */
async function productionToolExample() {
  console.log('🏭 Production-Ready Tool Example');

  const productionTool = agenticTool({
    description: 'Enterprise data processing tool',
    parameters: z.object({
      data: z.any(),
      processingMode: z.enum(['fast', 'accurate', 'comprehensive']),
      errorHandling: z.enum(['strict', 'lenient']).default('lenient'),
    }),
    execute: async ({ data, processingMode, errorHandling }) => {
      // Simulate complex processing
      if (processingMode === 'comprehensive' && Math.random() < 0.2) {
        throw new Error('Processing timeout - data too complex');
      }

      return {
        processed: true,
        mode: processingMode,
        quality: processingMode === 'comprehensive' ? 'excellent' : 'good',
        dataIntegrity: errorHandling === 'strict' ? 'validated' : 'processed',
      };
    },
    repairConfig: {
      maxRetries: 5,
      repairStrategies: ['sanitize', 'validate', 'fallback', 'retry'],
      timeout: 30000,
      onRepairAttempt: async context => {
        console.log(
          `🔧 Attempting repair: ${context.strategy} (attempt ${context.attempt}/${context.maxRetries})`,
        );
      },
      onRepairSuccess: async context => {
        console.log(`✅ Tool repaired successfully using ${context.successfulStrategy}`);
      },
      onRepairFailure: async context => {
        console.error(`❌ Tool repair failed after ${context.totalAttempts} attempts`);
      },
    },
    trackHistory: true,
  });

  // Also create a version with user input repair preset
  const robustTool = repairableTools.withComprehensiveRepair(
    agenticTool({
      description: 'Robust processing tool',
      parameters: z.object({
        input: z.string(),
        options: z.record(z.any()).optional(),
      }),
      execute: async ({ input, options }) => ({
        output: `Processed: ${input}`,
        options: options || {},
        timestamp: Date.now(),
      }),
    }),
  );

  const workflow = createAgentWorkflow({
    tools: {
      enterprise: productionTool,
      robust: robustTool,
    },
    maxSteps: 3,
    repairConfig: {
      maxRetries: 3,
      repairStrategies: ['retry', 'fallback'],
    },
  });

  const result = await generateText({
    model: openai('gpt-4o'),
    ...workflow,
    system:
      'You are an enterprise data processor. Handle data processing requests with full error recovery.',
    prompt:
      'Process this complex dataset with comprehensive analysis: {"records": 10000, "format": "mixed", "quality": "variable"}',
  });

  console.log('Enterprise processing complete:', result.text);
}

/**
 * Run all enhanced examples
 */
async function runEnhancedExamples() {
  console.log('🚀 Enhanced Agentic Tools Examples - AI SDK v5 Compliant');
  console.log('='.repeat(60));

  try {
    await progressiveToolUnlockingExample();
    console.log('\n' + '='.repeat(60));

    await toolRepairExample();
    console.log('\n' + '='.repeat(60));

    await conditionalToolsExample();
    console.log('\n' + '='.repeat(60));

    await productionToolExample();

    console.log('\n✨ All examples completed successfully!');
  } catch (error) {
    console.error('Error running enhanced examples:', error);
  }
}

// Export examples for testing
export {
  conditionalToolsExample,
  productionToolExample,
  progressiveToolUnlockingExample,
  toolRepairExample,
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runEnhancedExamples();
}
