/**
 * Advanced Agent + Computer Use Integration
 * Demonstrates combining multi-step agents with computer use tools
 */

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod/v4';
import {
  agentControlPresets,
  executeMultiStepAgent,
  executeSequentialAgents,
  multiStepPatterns,
  stopWhenPresets,
  streamMultiStepAgent,
  type MultiStepConfig,
} from '../src/server/agents';
import { createComputerUseTools, getComputerUsePreset } from '../src/server/tools/computer-use';
import { tool } from '../src/server/tools/simple-tools';

/**
 * Example 1: Research agent with computer use
 */
export async function researchAgentWithComputerUse() {
  // Create computer use tools
  const computerTools = getComputerUsePreset('research');

  // Add custom analysis tool
  const analysisTools = {
    analyzeCode: tool({
      description: 'Analyze code patterns and quality',
      parameters: z.object({
        filePath: z.string(),
        metrics: z.array(z.enum(['complexity', 'coverage', 'style'])),
      }),
      execute: async ({ filePath, metrics }) => {
        // Simulate code analysis
        return {
          filePath,
          metrics: metrics.map(m => ({ metric: m, score: Math.random() * 100 })),
          summary: 'Code analysis completed',
        };
      },
    }),
  };

  const config: MultiStepConfig = {
    model: anthropic('claude-3-opus-20241022'),
    tools: { ...computerTools, ...analysisTools },
    maxSteps: 20,
    stopWhen: [stopWhenPresets.research],
    experimental_prepareStep: agentControlPresets.researchAgent,
    onStepFinish: step => {
      console.log(`Research step ${step.stepNumber} completed`);
    },
  };

  const result = await executeMultiStepAgent(
    `Research the codebase architecture:
    1. Find all main entry points
    2. Analyze the dependency structure
    3. Identify key design patterns used
    4. Create a comprehensive architecture report`,
    config,
  );

  return result;
}

/**
 * Example 2: Code development agent with testing
 */
export async function codeDevelopmentAgentWithTesting() {
  const tools = createComputerUseTools({
    enableAll: true,
    sandbox: false,
  });

  // Phase 1: Planning
  const planningConfig: MultiStepConfig = {
    model: anthropic('claude-3-opus-20241022'),
    tools: tools.all,
    maxSteps: 5,
    temperature: 0.7,
    system: 'You are a strategic planner. Create detailed implementation plans.',
  };

  // Phase 2: Implementation
  const implementationConfig: MultiStepConfig = {
    model: anthropic('claude-3-opus-20241022'),
    tools: tools.all,
    maxSteps: 15,
    temperature: 0.3,
    system: 'You are a code implementation expert. Write clean, tested code.',
    experimental_prepareStep: ({ stepNumber }) => {
      // Use different models for different tasks
      if (stepNumber % 3 === 0) {
        return { model: openai('gpt-4-turbo') }; // Use GPT-4 for complex logic
      }
      return {};
    },
  };

  // Phase 3: Testing
  const testingConfig: MultiStepConfig = {
    model: anthropic('claude-3-opus-20241022'),
    tools: tools.all,
    maxSteps: 10,
    temperature: 0.2,
    system: 'You are a testing expert. Write comprehensive tests and ensure quality.',
  };

  const result = await executeSequentialAgents([
    {
      name: 'planner',
      prompt: 'Plan the implementation of a user authentication system with JWT tokens',
      config: planningConfig,
    },
    {
      name: 'developer',
      prompt: results => `Implement this plan:
${results[0].finalResult.text}`,
      config: implementationConfig,
    },
    {
      name: 'tester',
      prompt: results => `Test the implementation:
${results[1].finalResult.text}`,
      config: testingConfig,
    },
  ]);

  return result;
}

/**
 * Example 3: Streaming multi-step agent with real-time monitoring
 */
export async function streamingAgentWithMonitoring() {
  const tools = getComputerUsePreset('development');

  const config: MultiStepConfig = {
    model: anthropic('claude-3-opus-20241022'),
    tools,
    maxSteps: 25,
    stopWhen: [
      stopWhenPresets.extended,
      ({ steps }) => {
        // Stop if we've made significant progress
        const toolCalls = steps.flatMap(s => s.toolCalls || []);
        return toolCalls.length > 15;
      },
    ],
    experimental_prepareStep: ({ _stepNumber, totalTokensUsed }) => {
      // Adjust based on token usage
      if (totalTokensUsed && totalTokensUsed > 10000) {
        return {
          maxOutputTokens: 500, // Limit output when using many tokens
          temperature: 0.3, // Be more focused
        };
      }
      return {};
    },
  };

  const stream = await streamMultiStepAgent(
    `Refactor the authentication system:
    1. Analyze current implementation
    2. Identify code smells and issues
    3. Create refactoring plan
    4. Implement improvements
    5. Update tests
    6. Verify everything works`,
    {
      ...config,
      onChunk: chunk => {
        process.stdout.write(chunk);
      },
      onStep: step => {
        console.log(
          `
[Step ${step.stepNumber} completed with ${step.toolCalls?.length || 0} tool calls]
`,
        );
      },
    },
  );

  return stream;
}

/**
 * Example 4: Automated debugging with computer use
 */
export async function automatedDebuggingAgent() {
  const tools = createComputerUseTools({ sandbox: false });

  // Custom debugging patterns
  const debuggingConfig: MultiStepConfig = {
    model: anthropic('claude-3-opus-20241022'),
    tools: tools.all,
    maxSteps: 30,
    experimental_prepareStep: ({ _stepNumber, steps }) => {
      const lastStep = steps[steps.length - 1];

      // If we found an error, focus on that area
      if (lastStep?.toolResults?.some(r => r.output?.includes('error'))) {
        return {
          temperature: 0.2,
          toolChoice: { type: 'tool', toolName: 'textEditor_20241022' },
        };
      }

      // Otherwise, explore more broadly
      return { temperature: 0.5 };
    },
    stopWhen: [
      ({ steps }) => {
        // Stop when tests pass
        const lastBashResult = steps
          .flatMap(s => s.toolResults || [])
          .filter(r => r.toolName === 'bash_20241022')
          .pop();

        return lastBashResult?.output?.includes('All tests passed');
      },
    ],
  };

  const result = await executeMultiStepAgent(
    `Debug and fix the failing authentication tests:
    1. Run the test suite
    2. Identify failing tests
    3. Analyze the error messages
    4. Examine the relevant code
    5. Add debugging statements
    6. Fix the issues
    7. Verify all tests pass`,
    debuggingConfig,
  );

  return result;
}

/**
 * Example 5: Multi-agent system for full feature development
 */
export async function fullFeatureDevelopmentSystem() {
  const researchTools = getComputerUsePreset('research');
  const devTools = getComputerUsePreset('development');
  const testTools = createSecureComputerUseTools({
    bash: {
      allowedCommands: [/^npm\s+test/, /^jest/, /^vitest/],
    },
  });

  // Use the plan and execute pattern
  const result = await multiStepPatterns.planAndExecute(
    'Implement a real-time notification system with WebSockets',
    anthropic('claude-3-opus-20241022'),
    { ...researchTools, ...devTools, ...testTools.all },
  );

  return result;
}

/**
 * Example 6: Interactive development session
 */
export async function interactiveDevelopmentSession() {
  const tools = createComputerUseTools({ enableAll: true });

  const config: MultiStepConfig = {
    model: anthropic('claude-3-opus-20241022'),
    tools: tools.all,
    maxSteps: 50,
    experimental_prepareStep: ({ stepNumber, _steps }) => {
      // Adaptive strategy based on progress
      const phases = {
        exploration: stepNumber < 10,
        implementation: stepNumber >= 10 && stepNumber < 30,
        refinement: stepNumber >= 30,
      };

      if (phases.exploration) {
        return {
          temperature: 0.7,
          system: 'Explore the codebase and understand the context thoroughly.',
        };
      } else if (phases.implementation) {
        return {
          temperature: 0.3,
          system: 'Implement features carefully with best practices.',
          experimental_activeTools: ['textEditor_20241022', 'bash_20241022'],
        };
      } else {
        return {
          temperature: 0.2,
          system: 'Refine and optimize the implementation.',
        };
      }
    },
    onStepFinish: async step => {
      // Log progress
      console.log(`Step ${step.stepNumber}: ${step.text?.slice(0, 100)}...`);

      // Save checkpoints
      if (step.stepNumber % 10 === 0) {
        console.log('Creating checkpoint...');
        // Could save state here
      }
    },
  };

  const result = await executeMultiStepAgent(
    `Create a complete feature for user profile management:
    1. Design the database schema
    2. Implement the backend API
    3. Create the frontend components
    4. Add validation and error handling
    5. Write comprehensive tests
    6. Add documentation
    7. Ensure accessibility compliance`,
    config,
  );

  return result;
}

/**
 * Main example runner
 */
export async function runAdvancedExamples() {
  console.log('Running advanced agent + computer use examples...\n');

  try {
    // Example 1: Research
    console.log('1. Running research agent...');
    const researchResult = await researchAgentWithComputerUse();
    console.log(`Research completed in ${researchResult.steps.length} steps
`);

    // Example 2: Streaming development
    console.log('2. Running streaming development agent...');
    await streamingAgentWithMonitoring();
    console.log('\n');

    // Example 3: Debugging
    console.log('3. Running automated debugging...');
    const debugResult = await automatedDebuggingAgent();
    console.log(`Debugging completed: ${debugResult.stoppedBy}
`);
  } catch (error) {
    console.error('Error in advanced examples:', error);
  }
}

// Export patterns for reuse
export const advancedPatterns = {
  /**
   * Pattern: Progressive complexity handling
   */
  progressiveComplexity: (maxSteps: number) => ({
    experimental_prepareStep: ({ stepNumber }: any) => {
      const progress = stepNumber / maxSteps;
      return {
        temperature: 0.2 + progress * 0.5, // Increase creativity over time
        maxOutputTokens: 1000 + progress * 1000, // Allow longer outputs later
      };
    },
  }),

  /**
   * Pattern: Error recovery with backtracking
   */
  errorRecovery: () => ({
    onStepFinish: async (step: any) => {
      if (step.toolResults?.some((r: any) => r.error)) {
        console.log('Error detected, adjusting strategy...');
        // Could implement backtracking logic here
      }
    },
  }),

  /**
   * Pattern: Resource-aware execution
   */
  resourceAware: (limits: { maxTokens: number; maxTime: number }) => ({
    stopWhen: [
      ({ usage }: any) => (usage?.totalTokens || 0) > limits.maxTokens,
      ({ executionTime }: any) => executionTime > limits.maxTime,
    ],
  }),
};

// Run if executed directly
// Comment out to avoid runtime errors in the build
// if (require.main === module) {
//   runAdvancedExamples();
// }
