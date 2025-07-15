/**
 * AI SDK v5 Agent Framework Examples
 * Comprehensive examples showing how to use the advanced agent framework
 */

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { tool } from 'ai';
import { z } from 'zod/v4';

// Import agent framework components
import {
  // Agent orchestration
  AgentOrchestrator,
  AgentValidator,
  agentControlPresets,
  agentUtils,
  // Agent controls
  createAgentControlStrategy,
  createProblemSolvingAgent,
  // Agent patterns
  createResearchAgent,
  // Multi-step execution
  executeMultiStepAgent,
  executeParallelAgents,
  executeSequentialAgents,
  getRecommendedAgentPattern,

  // Agent utilities
  globalAgentExecutor,
  hasToolCall,
  // Step conditions
  stepCountAtMost,
  stopWhenPresets,
  textContains,
  type AgentDefinition,
  type MultiStepConfig,
  type PrepareStepCallback,
  type WorkflowDefinition,
} from '../src/server';

/**
 * Example tools for demonstrations
 */
const exampleTools = {
  webSearch: tool({
    description: 'Search the web for information',
    inputSchema: z.object({
      query: z.string().describe('Search query'),
      maxResults: z.number().optional().default(5),
    }),
    execute: async ({ query, maxResults }) => {
      // Simulate web search
      return {
        results: [
          {
            title: `Result 1 for ${query}`,
            url: 'https://example.com/1',
            snippet: 'Sample content...',
          },
          {
            title: `Result 2 for ${query}`,
            url: 'https://example.com/2',
            snippet: 'More content...',
          },
        ].slice(0, maxResults),
      };
    },
  }),

  analyzeData: tool({
    description: 'Analyze data and provide insights',
    inputSchema: z.object({
      data: z.string().describe('Data to analyze'),
      analysisType: z.enum(['trend', 'summary', 'comparison']).default('summary'),
    }),
    execute: async ({ data: _data, analysisType }) => {
      return {
        analysis: `${analysisType} analysis of provided data`,
        insights: ['Key insight 1', 'Key insight 2'],
        confidence: 0.85,
      };
    },
  }),

  generateReport: tool({
    description: 'Generate a comprehensive report',
    inputSchema: z.object({
      title: z.string().describe('Report title'),
      sections: z.array(z.string()).describe('Report sections'),
      data: z.string().optional().describe('Supporting data'),
    }),
    execute: async ({ title, sections, data: _data }) => {
      return {
        report: `# ${title}

${sections
  .map(
    s => `## ${s}

Content for ${s}...
`,
  )
  .join('\n')}`,
        wordCount: 1200,
        generatedAt: new Date().toISOString(),
      };
    },
  }),

  validateSolution: tool({
    description: 'Validate a proposed solution',
    inputSchema: z.object({
      solution: z.string().describe('Solution to validate'),
      criteria: z.array(z.string()).describe('Validation criteria'),
    }),
    execute: async ({ solution: _solution, criteria }) => {
      return {
        valid: true,
        score: 0.92,
        feedback: criteria.map(c => ({ criterion: c, passed: true, comment: 'Looks good' })),
        recommendations: ['Consider edge case X', 'Optimize for performance'],
      };
    },
  }),
};

/**
 * Example 1: Basic Multi-Step Agent with stopWhen conditions
 */
export async function basicMultiStepAgentExample() {
  console.log('🤖 Example 1: Basic Multi-Step Agent');

  const config: MultiStepConfig = {
    model: openai('gpt-4o'),
    tools: exampleTools,
    maxSteps: 10,
    system: 'You are a helpful research assistant. Conduct thorough research and provide insights.',
    temperature: 0.7,

    // Custom stop conditions
    stopWhen: [
      stepCountAtMost(8), // Stop at most after 8 steps
      hasToolCall('generateReport'), // Stop when report is generated
      textContains('research complete'), // Stop when this text appears
    ],
  };

  try {
    const result = await executeMultiStepAgent(
      'Research the impact of AI on modern education and generate a comprehensive report',
      config,
    );

    console.log('✅ Research completed!');
    console.log(`📊 Steps: ${result.steps.length}`);
    console.log(`⏱️  Time: ${result.executionTime}ms`);
    console.log(`🪙 Tokens: ${result.totalTokensUsed}`);
    console.log(`🛑 Stopped by: ${result.stoppedBy}`);

    return result;
  } catch (error) {
    console.error('❌ Research failed:', error);
    throw error;
  }
}

/**
 * Example 2: Advanced Agent with prepareStep controls
 */
export async function advancedAgentControlsExample() {
  console.log('🚀 Example 2: Advanced Agent Controls');

  // Create a prepareStep that switches strategies per phase
  const researchPrepareStep: PrepareStepCallback = createAgentControlStrategy({
    phases: [
      {
        startStep: 0,
        endStep: 2,
        temperature: 0.8,
        system: 'Planning phase: Focus on creating a comprehensive research plan.',
        tools: ['webSearch'],
      },
      {
        startStep: 3,
        endStep: 6,
        temperature: 0.3,
        system: 'Research phase: Gather accurate, detailed information.',
        tools: ['webSearch', 'analyzeData'],
      },
      {
        startStep: 7,
        temperature: 0.5,
        system: 'Synthesis phase: Create insights and generate final report.',
        tools: ['analyzeData', 'generateReport'],
      },
    ],
  });

  const config: MultiStepConfig = {
    model: openai('gpt-4o'),
    tools: exampleTools,
    maxSteps: 10,
    experimental_prepareStep: researchPrepareStep,
    stopWhen: stopWhenPresets.researchAgent,
  };

  const result = await executeMultiStepAgent(
    'Analyze the future of renewable energy technology',
    config,
  );

  console.log('✅ Advanced research completed with phase-based controls!');
  console.log(`📊 Phases executed across ${result.steps.length} steps`);

  return result;
}

/**
 * Example 3: Parallel Agent Execution
 */
export async function parallelAgentsExample() {
  console.log('⚡ Example 3: Parallel Agent Execution');

  const agents = [
    {
      name: 'market-researcher',
      prompt: 'Research market trends in electric vehicles',
      config: {
        model: openai('gpt-4o'),
        tools: exampleTools,
        maxSteps: 6,
        system: 'You are a market research specialist.',
      },
    },
    {
      name: 'tech-analyst',
      prompt: 'Analyze technical innovations in electric vehicle batteries',
      config: {
        model: anthropic('claude-3-5-sonnet-20241022'),
        tools: exampleTools,
        maxSteps: 6,
        system: 'You are a technical analysis expert.',
      },
    },
    {
      name: 'policy-researcher',
      prompt: 'Research government policies affecting electric vehicle adoption',
      config: {
        model: openai('gpt-4o'),
        tools: exampleTools,
        maxSteps: 5,
        system: 'You are a policy research specialist.',
      },
    },
  ];

  const results = await executeParallelAgents(agents);

  console.log('✅ Parallel research completed!');
  console.log(`📊 ${Object.keys(results).length} agents executed simultaneously`);

  Object.entries(results).forEach(([name, result]) => {
    console.log(`  ${name}: ${result.steps.length} steps, ${result.totalTokensUsed} tokens`);
  });

  return results;
}

/**
 * Example 4: Sequential Agent Pipeline
 */
export async function sequentialAgentPipelineExample() {
  console.log('🔄 Example 4: Sequential Agent Pipeline');

  const pipeline = [
    {
      name: 'data-collector',
      prompt: 'Collect comprehensive data about sustainable agriculture practices',
      config: {
        model: openai('gpt-4o'),
        tools: exampleTools,
        maxSteps: 8,
        system: 'You are a data collection specialist.',
      },
    },
    {
      name: 'data-analyzer',
      prompt: previousResults => {
        const collectedData = previousResults[0]?.finalResult?.text || '';
        return `Analyze this collected data and identify key patterns:

${collectedData}`;
      },
      config: {
        model: anthropic('claude-3-5-sonnet-20241022'),
        tools: exampleTools,
        maxSteps: 6,
        system: 'You are a data analysis expert.',
      },
    },
    {
      name: 'report-generator',
      prompt: previousResults => {
        const analysisResults = previousResults[1]?.finalResult?.text || '';
        return `Generate a comprehensive report based on this analysis:

${analysisResults}`;
      },
      config: {
        model: openai('gpt-4o'),
        tools: exampleTools,
        maxSteps: 4,
        system: 'You are a report writing specialist.',
      },
    },
  ];

  const results = await executeSequentialAgents(pipeline);

  console.log('✅ Sequential pipeline completed!');
  console.log(`📊 ${results.length} agents executed in sequence`);

  results.forEach((result, index) => {
    console.log(`  Stage ${index + 1}: ${result.steps.length} steps, ${result.executionTime}ms`);
  });

  return results;
}

/**
 * Example 5: Agent Orchestrator with Complex Workflow
 */
export async function agentOrchestratorExample() {
  console.log('🎭 Example 5: Agent Orchestrator Workflow');

  const orchestrator = new AgentOrchestrator();

  // Register specialized agents
  const researchAgent: AgentDefinition = {
    id: 'researcher',
    name: 'Research Specialist',
    description: 'Conducts comprehensive research',
    model: openai('gpt-4o'),
    tools: exampleTools,
    maxSteps: 10,
    system: 'You are a research specialist. Gather comprehensive information.',
    experimental_prepareStep: agentControlPresets.researchAgent,
  };

  const analysisAgent: AgentDefinition = {
    id: 'analyst',
    name: 'Data Analyst',
    description: 'Analyzes data and provides insights',
    model: anthropic('claude-3-5-sonnet-20241022'),
    tools: exampleTools,
    maxSteps: 8,
    system: 'You are a data analyst. Provide deep insights.',
  };

  const reportingAgent: AgentDefinition = {
    id: 'reporter',
    name: 'Report Generator',
    description: 'Creates comprehensive reports',
    model: openai('gpt-4o'),
    tools: exampleTools,
    maxSteps: 5,
    system: 'You are a report writer. Create clear, actionable reports.',
  };

  orchestrator.registerAgent(researchAgent);
  orchestrator.registerAgent(analysisAgent);
  orchestrator.registerAgent(reportingAgent);

  // Define complex workflow
  const workflow: WorkflowDefinition = {
    id: 'comprehensive-analysis',
    name: 'Comprehensive Analysis Workflow',
    description: 'Multi-stage analysis with parallel research and sequential processing',
    agents: [researchAgent, analysisAgent, reportingAgent],
    workflow: {
      id: 'root',
      type: 'sequential',
      name: 'Main Workflow',
      children: [
        {
          id: 'parallel-research',
          type: 'parallel',
          name: 'Parallel Research Phase',
          children: [
            {
              id: 'primary-research',
              type: 'agent',
              name: 'Primary Research',
              agentId: 'researcher',
              prompt: context => `${context.variables.initialPrompt} - Focus on primary sources`,
            },
            {
              id: 'secondary-research',
              type: 'agent',
              name: 'Secondary Research',
              agentId: 'researcher',
              prompt: context => `${context.variables.initialPrompt} - Focus on secondary analysis`,
            },
          ],
        },
        {
          id: 'analysis',
          type: 'agent',
          name: 'Data Analysis',
          agentId: 'analyst',
          prompt: context => {
            const primaryResearch = context.results['primary-research']?.finalResult?.text || '';
            const secondaryResearch =
              context.results['secondary-research']?.finalResult?.text || '';
            return `Analyze these research findings:

Primary: ${primaryResearch}

Secondary: ${secondaryResearch}`;
          },
        },
        {
          id: 'conditional-deep-dive',
          type: 'conditional',
          name: 'Conditional Deep Dive',
          condition: context => {
            const analysisResult = context.results.analysis?.finalResult?.text || '';
            return analysisResult.toLowerCase().includes('requires further investigation');
          },
          children: [
            {
              id: 'deep-dive-research',
              type: 'agent',
              name: 'Deep Dive Research',
              agentId: 'researcher',
              prompt: 'Conduct deeper investigation based on initial analysis findings',
            },
          ],
        },
        {
          id: 'final-report',
          type: 'agent',
          name: 'Final Report Generation',
          agentId: 'reporter',
          prompt: context => {
            const analysisResult = context.results.analysis?.finalResult?.text || '';
            const deepDive = context.results['deep-dive-research']?.finalResult?.text || '';
            return `Generate comprehensive report:

Analysis: ${analysisResult}

Deep Dive: ${deepDive}`;
          },
        },
      ],
    },
  };

  const result = await orchestrator.executeWorkflow(
    workflow,
    'Research and analyze the impact of quantum computing on cybersecurity',
    { priority: 'high', domain: 'technology' },
  );

  console.log('✅ Complex workflow completed!');
  console.log(`📊 Workflow: ${result.success ? 'Success' : 'Failed'}`);
  console.log(`⏱️  Total time: ${result.executionTime}ms`);
  console.log(`🪙 Total tokens: ${result.totalTokensUsed}`);
  console.log(`📄 Results: ${Object.keys(result.results).length} agent executions`);

  return result;
}

/**
 * Example 6: Agent Pattern Usage
 */
export async function agentPatternsExample() {
  console.log('🎨 Example 6: Agent Patterns');

  // Get recommended pattern for use case
  const recommendedPattern = getRecommendedAgentPattern('market research project');
  console.log(`📋 Recommended pattern: ${recommendedPattern}`);

  // Create agents using patterns
  const researchAgent = createResearchAgent('market-researcher', {
    model: openai('gpt-4o'),
    tools: exampleTools,
    customization: {
      maxSteps: 12,
      temperature: 0.6,
      systemPrompt: 'You are a market research specialist focusing on emerging technologies.',
    },
  });

  const problemSolvingAgent = createProblemSolvingAgent('problem-solver', {
    model: anthropic('claude-3-5-sonnet-20241022'),
    tools: exampleTools,
    customization: {
      maxSteps: 15,
      temperature: 0.7,
    },
  });

  console.log(`🔬 Created research agent: ${researchAgent.name}`);
  console.log(`🧩 Created problem-solving agent: ${problemSolvingAgent.name}`);

  // Execute using pattern-based agents
  const orchestrator = new AgentOrchestrator();
  orchestrator.registerAgent(researchAgent);
  orchestrator.registerAgent(problemSolvingAgent);

  const researchResult = await orchestrator.executeAgent(
    'market-researcher',
    'Research emerging trends in AI-powered customer service solutions',
  );

  const problemResult = await orchestrator.executeAgent(
    'problem-solver',
    'How can companies effectively integrate AI customer service while maintaining human touch?',
  );

  console.log('✅ Pattern-based agents completed!');
  console.log(`📊 Research: ${researchResult.steps.length} steps`);
  console.log(`🧩 Problem-solving: ${problemResult.steps.length} steps`);

  return { researchResult, problemResult };
}

/**
 * Example 7: Agent Validation and Performance Analysis
 */
export async function agentValidationExample() {
  console.log('🔍 Example 7: Agent Validation & Performance Analysis');

  // Validate agent configuration
  const config: MultiStepConfig = {
    model: openai('gpt-4o'),
    tools: exampleTools,
    maxSteps: 15,
    temperature: 0.5,
    system: 'You are a helpful assistant.',
  };

  const validation = AgentValidator.validateAgentConfig(config);
  console.log(`✅ Config valid: ${validation.valid}`);
  console.log(`⚠️  Warnings: ${validation.warnings.length}`);
  console.log(`❌ Errors: ${validation.errors.length}`);

  // Execute with validation
  const results = [];
  for (let i = 0; i < 3; i++) {
    const result = await agentUtils.validateAndExecute(
      `test-agent-${i}`,
      `Analyze topic ${i + 1}: Impact of technology on society`,
      config,
    );
    results.push(result);
  }

  // Analyze performance
  console.log('📈 Performance Analysis:');
  const metrics = globalAgentExecutor.getGlobalMetrics();
  console.log(`  Total executions: ${metrics.totalExecutions}`);
  console.log(`  Average execution time: ${Math.round(metrics.averageExecutionTime)}ms`);
  console.log(`  Average token usage: ${Math.round(metrics.averageTokenUsage)}`);
  console.log(`  Success rate: ${Math.round(metrics.successRate * 100)}%`);

  return { validation, results, metrics };
}

/**
 * Main example runner
 */
export async function runAllExamples() {
  console.log('🌟 Starting AI SDK v5 Agent Framework Examples');

  try {
    // Example 1: Basic multi-step agent
    await basicMultiStepAgentExample();
    console.log('\n' + '='.repeat(60) + '\n');

    // Example 2: Advanced agent controls
    await advancedAgentControlsExample();
    console.log('\n' + '='.repeat(60) + '\n');

    // Example 3: Parallel agents
    await parallelAgentsExample();
    console.log('\n' + '='.repeat(60) + '\n');

    // Example 4: Sequential pipeline
    await sequentialAgentPipelineExample();
    console.log('\n' + '='.repeat(60) + '\n');

    // Example 5: Complex orchestration
    await agentOrchestratorExample();
    console.log('\n' + '='.repeat(60) + '\n');

    // Example 6: Agent patterns
    await agentPatternsExample();
    console.log('\n' + '='.repeat(60) + '\n');

    // Example 7: Validation and performance
    await agentValidationExample();

    console.log('\n🎉 All examples completed successfully!');
  } catch (error) {
    console.error('\n❌ Example execution failed:', error);
    throw error;
  }
}

// Export individual examples for selective execution
export {
  advancedAgentControlsExample,
  agentOrchestratorExample,
  agentPatternsExample,
  agentValidationExample,
  basicMultiStepAgentExample,
  parallelAgentsExample,
  sequentialAgentPipelineExample,
};
