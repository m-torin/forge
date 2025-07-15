/**
 * Agentic Workflow Examples
 *
 * Demonstrates advanced multi-step AI agent patterns using the AI SDK v5
 */

import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import * as mathjs from 'mathjs';
import { z } from 'zod/v4';
import {
  AgenticPatterns,
  agenticTool,
  commonAgenticTools,
  createAgentWorkflow,
  StoppingConditions,
} from '../src/server/tools/agentic-tools';

/**
 * Example 1: Multi-Step Math Problem Solver
 * Agent that breaks down complex math problems into steps
 */
async function mathProblemSolver() {
  console.log('🧮 Multi-Step Math Problem Solver\n');

  // Define tools
  const tools = {
    analyze: tool({
      description: 'Analyze the math problem and identify required operations',
      parameters: z.object({
        problem: z.string().describe('The math problem to analyze'),
      }),
      execute: async ({ problem: _problem }) => {
        return {
          steps: [
            'Calculate hourly earnings',
            'Calculate daily earnings',
            'Calculate fuel costs',
            'Calculate net profit',
          ],
          variables: {
            hourlyRate: 9461,
            hoursPerDay: 12,
            fuelPerHour: 12,
            fuelPrice: 134,
          },
        };
      },
    }),

    calculate: tool({
      description: 'Perform mathematical calculations',
      parameters: z.object({ expression: z.string() }),
      execute: async ({ expression }) => mathjs.evaluate(expression),
    }),

    answer: tool({
      description: 'Provide the final answer with explanation',
      parameters: z.object({
        steps: z.array(
          z.object({
            calculation: z.string(),
            result: z.number(),
            reasoning: z.string(),
          }),
        ),
        finalAnswer: z.number(),
        explanation: z.string(),
      }),
      // No execute - this terminates the agent
    }),
  };

  const result = await generateText({
    model: openai('gpt-4o'),
    tools,
    maxSteps: 10,
    stopWhen: StoppingConditions.whenToolCalled('answer'),
    system: 'You are a math tutor. Solve problems step by step, explaining your reasoning.',
    prompt:
      'A taxi driver earns $9461 per hour. If he works 12 hours a day and uses 12 liters of fuel per hour at $134 per liter, how much is his net profit per day?',
    onStepFinish: ({ toolCalls, toolResults, stepNumber }) => {
      console.log(`Step ${stepNumber} completed:`, {
        tools: toolCalls?.map(tc => tc.toolName),
        results: toolResults?.length,
      });
    },
  });

  console.log('Final answer:', result.text);
  console.log('Total steps:', result.steps.length);
}

/**
 * Example 2: Research and Report Agent
 * Agent that researches a topic, analyzes findings, and generates a report
 */
async function researchAgent() {
  console.log('\n📚 Research and Report Agent');

  const workflow = createAgentWorkflow({
    tools: {
      research: agenticTool({
        description: 'Research information about a topic',
        parameters: z.object({
          topic: z.string(),
          sources: z.array(z.string()).optional(),
        }),
        execute: async ({ topic }) => {
          // Simulate research
          return {
            findings: [
              `${topic} is experiencing rapid growth`,
              'Key trends include automation and personalization',
              'Market size expected to double by 2025',
            ],
            sources: ['Industry Report 2024', 'Tech Analysis Blog', 'Market Research Study'],
          };
        },
        trackHistory: true,
      }),

      analyze: agenticTool({
        description: 'Analyze research findings',
        parameters: z.object({
          findings: z.array(z.string()),
          perspective: z.enum(['technical', 'business', 'user']),
        }),
        execute: async ({ findings: _findings, perspective }) => {
          return {
            insights: [
              `From a ${perspective} perspective, this is significant`,
              'Three key implications identified',
              'Recommendations for stakeholders',
            ],
            confidence: 0.85,
          };
        },
        trackHistory: true,
      }),

      generateReport: agenticTool({
        description: 'Generate a comprehensive report',
        parameters: z.object({
          research: z.any(),
          analysis: z.any(),
          format: z.enum(['executive', 'technical', 'detailed']),
        }),
        execute: async ({ research: _research, analysis: _analysis, format }) => {
          return {
            title: 'Research Report: AI in 2024',
            summary: 'Executive summary of findings',
            sections: ['Introduction', 'Research Findings', 'Analysis', 'Recommendations'],
            format,
            wordCount: 1500,
          };
        },
        experimental_toToolResultContent: result => ({
          type: 'text',
          text: `# ${result.title}

${result.summary}

Sections: ${result.sections.join(', ')}`,
        }),
      }),
    },
    maxSteps: 5,
    stopWhen: StoppingConditions.whenToolCalled('generateReport'),
    hooks: {
      onStepFinish: async ({ stepNumber, toolCalls }) => {
        console.log(`Research step ${stepNumber}: ${toolCalls?.[0]?.toolName || 'thinking'}`);
      },
    },
  });

  const _result = await generateText({
    model: openai('gpt-4o'),
    ...workflow,
    system:
      'You are a research analyst. Research the topic, analyze findings, then generate a report.',
    prompt: 'Research and create a report about "The Future of AI in Healthcare"',
  });

  console.log('Research complete. Steps taken:', workflow.getStepHistory().length);
  console.log(
    'All tool calls:',
    workflow.getAllToolCalls().map(tc => tc.toolName),
  );
}

/**
 * Example 3: Customer Service Agent with Escalation
 * Agent that handles customer queries with conditional escalation
 */
async function customerServiceAgent() {
  console.log('🤝 Customer Service Agent with Escalation');

  const agent = AgenticPatterns.conditional({
    evaluator: tool({
      description: 'Evaluate customer query complexity',
      parameters: z.object({
        query: z.string(),
        customerHistory: z
          .object({
            previousIssues: z.number(),
            accountType: z.enum(['basic', 'premium', 'enterprise']),
          })
          .optional(),
      }),
      execute: async ({ query }) => {
        const complexity = query.length > 100 ? 'complex' : 'simple';
        return { branch: complexity, confidence: 0.9 };
      },
    }),

    branches: {
      simple: tool({
        description: 'Handle simple customer queries',
        parameters: z.object({ query: z.string() }),
        execute: async ({ query: _query }) => ({
          response: 'Here is the solution to your query...',
          resolved: true,
          satisfactionScore: 4.5,
        }),
      }),

      complex: tool({
        description: 'Escalate to human agent',
        parameters: z.object({
          query: z.string(),
          context: z.any(),
        }),
        execute: async ({ query: _query }) => ({
          escalated: true,
          ticketId: 'TICKET-12345',
          estimatedWaitTime: '5-10 minutes',
          message: 'Your query has been escalated to a specialist.',
        }),
      }),
    },

    default: tool({
      description: 'Default response for unhandled cases',
      parameters: z.object({ query: z.string() }),
      execute: async () => ({
        message: 'Thank you for contacting us. We will get back to you soon.',
        ticketCreated: true,
      }),
    }),
  });

  const result = await generateText({
    model: openai('gpt-4o'),
    ...agent,
    system: 'You are a helpful customer service agent. Evaluate queries and respond appropriately.',
    prompt: 'I have been trying to reset my password for 3 days and nothing works. This is urgent!',
  });

  console.log('Customer service response:', result.text);
  console.log(
    'Actions taken:',
    agent.getAllToolCalls().map(tc => tc.toolName),
  );
}

/**
 * Example 4: Code Review Agent with Iterative Refinement
 * Agent that reviews code and suggests improvements iteratively
 */
async function codeReviewAgent() {
  console.log('💻 Code Review Agent with Refinement');

  const reviewAgent = AgenticPatterns.retryWithRefinement({
    tool: agenticTool({
      description: 'Review code and suggest improvements',
      parameters: z.object({
        code: z.string(),
        language: z.string(),
        previousFeedback: z.string().optional(),
      }),
      execute: async ({ code, language: _language, previousFeedback }) => {
        return {
          issues: [
            'Missing error handling',
            'Could use more descriptive variable names',
            'Consider adding comments',
          ],
          suggestions: [
            'Add try-catch blocks',
            'Rename variables for clarity',
            'Add JSDoc comments',
          ],
          improvedCode: code + '\n// Improved version',
          score: previousFeedback ? 85 : 70,
        };
      },
    }),

    validator: tool({
      description: 'Validate code review results',
      parameters: z.object({
        review: z.any(),
        criteria: z.array(z.string()).optional(),
      }),
      execute: async ({ review }) => {
        const valid = review.score >= 80;
        return {
          valid,
          feedback: valid ? 'Code meets quality standards' : 'Code needs further improvements',
          score: review.score,
        };
      },
    }),

    maxRetries: 3,
  });

  const result = await generateText({
    model: openai('gpt-4o'),
    ...reviewAgent,
    system:
      'You are a code reviewer. Review the code and iteratively improve it until it meets quality standards.',
    prompt: `Review this code:

    function calculate(x, y) {
      return x + y;
    }`,
  });

  console.log('Code review complete:', result.text);
  console.log('Iterations:', reviewAgent.getStepHistory().length / 2);
}

/**
 * Example 5: Planning and Execution Agent
 * Agent that creates a plan and executes it step by step
 */
async function planningAgent() {
  console.log('📋 Planning and Execution Agent');

  const _stepHistory = new StepHistoryTracker();

  const result = await generateText({
    model: openai('gpt-4o'),
    tools: {
      ...commonAgenticTools,

      executeStep: agenticTool({
        description: 'Execute a planned step',
        parameters: z.object({
          step: z.object({
            action: z.string(),
            description: z.string(),
          }),
          context: z.any().optional(),
        }),
        execute: async ({ step }, context) => {
          console.log(`Executing: ${step.action} (Step ${context.stepNumber + 1})`);
          return {
            completed: true,
            output: `Completed ${step.action}`,
            duration: Math.random() * 1000 + 500,
          };
        },
        trackHistory: true,
      }),
    },

    maxSteps: 10,
    stopWhen: [
      StoppingConditions.afterSteps(10),
      StoppingConditions.whenTextContains('COMPLETE'),
      StoppingConditions.afterDuration(30000), // 30 second timeout
    ],

    onStepFinish: ({ stepNumber, toolCalls, text }) => {
      if (toolCalls?.length) {
        console.log(`Step ${stepNumber + 1}: ${toolCalls[0].toolName}`);
      }
      if (text?.includes('COMPLETE')) {
        console.log('✅ Plan execution complete!');
      }
    },

    experimental_prepareStep: async ({ stepNumber, steps }) => {
      // First step: always plan
      if (stepNumber === 0) {
        return { toolChoice: { type: 'tool', toolName: 'planningTool' } };
      }

      // Check if we have a plan
      const plan = steps[0]?.toolResults?.[0]?.result;
      if (!plan?.steps) return;

      // Execute next step in plan
      const currentStepIndex = stepNumber - 1;
      if (currentStepIndex < plan.steps.length) {
        return { toolChoice: { type: 'tool', toolName: 'executeStep' } };
      }

      // All steps complete, validate
      return { toolChoice: { type: 'tool', toolName: 'validationTool' } };
    },

    system:
      'You are a planning agent. Create a plan, execute each step, then validate the results.',
    prompt: 'Plan and execute a strategy to improve code quality in a large codebase',
  });

  console.log('Final result:', result.text);
  console.log('Total steps executed:', result.steps.length);
}

/**
 * Run all examples
 */
async function runExamples() {
  console.log('🚀 Agentic Workflow Examples');
  console.log('='.repeat(50));

  try {
    await mathProblemSolver();
    console.log('' + '='.repeat(50));

    await researchAgent();
    console.log('' + '='.repeat(50));

    await customerServiceAgent();
    console.log('' + '='.repeat(50));

    await codeReviewAgent();
    console.log('' + '='.repeat(50));

    await planningAgent();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export individual examples for testing
export { codeReviewAgent, customerServiceAgent, mathProblemSolver, planningAgent, researchAgent };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}
