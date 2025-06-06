/**
 * Simple Step Factory Examples
 *
 * Basic examples for testing and demonstration purposes.
 */

import { z } from 'zod';

import {
  createWorkflowStep,
  type StepExecutionContext,
  type StepExecutionResult,
  StepTemplates,
} from '../shared/index';

/**
 * Simple greeting step example
 */
export function createGreetingStep() {
  return createWorkflowStep(
    {
      name: 'Simple Greeting',
      category: 'utility',
      description: 'Creates a simple greeting message',
      tags: ['greeting', 'simple'],
      version: '1.0.0',
    },
    async (
      context: StepExecutionContext<{ name: string }>,
    ): Promise<StepExecutionResult<{ message: string }>> => {
      const { input } = context;

      return {
        output: {
          message: `Hello, ${input.name}!`,
        },
        performance: context.performance,
        success: true,
      };
    },
    {
      validationConfig: {
        validateInput: true,
        validateOutput: true,
        input: z.object({
          name: z.string().min(1, 'Name is required'),
        }),
        output: z.object({
          message: z.string(),
        }),
      },
    },
  );
}

/**
 * Create HTTP request step using template
 */
export function createApiStep() {
  return StepTemplates.http('User Data API', 'Fetch user data from API');
}

/**
 * Create delay step using template
 */
export function createWaitStep() {
  return StepTemplates.delay('Wait 1 Second', 1000);
}
