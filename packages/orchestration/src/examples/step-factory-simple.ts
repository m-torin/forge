/**
 * Simple Step Factory Examples
 *
 * Demonstrates basic usage of the orchestration package's step creation utilities.
 * These examples show the foundational patterns for building workflow steps
 * using both templates and custom step definitions.
 *
 * Examples Included:
 * - HTTP request step using built-in template
 * - Custom greeting step with validation
 * - Delay step using built-in template
 * - Input/output validation with Zod schemas
 *
 * This is the simpler, more direct approach compared to the advanced factory patterns.
 * Use these examples when you need straightforward step creation without complex
 * configuration or enhancement patterns.
 *
 * Prerequisites:
 * - @repo/orchestration package configured
 * - Zod for schema validation
 *
 * Environment: Node.js Server-Side
 *
 * @see ./simple-step-api.ts for function-based approach
 */

import { z } from 'zod/v4';

import {
  createWorkflowStep,
  type StepExecutionContext,
  type StepExecutionResult,
  StepTemplates,
} from '../shared/index';

/**
 * Create HTTP request step using template
 */
export function createApiStep() {
  return StepTemplates.http('User Data API', 'Fetch user data from API');
}

/**
 * Simple greeting step example
 */
export function createGreetingStep() {
  return createWorkflowStep(
    {
      category: 'utility',
      description: 'Creates a simple greeting message',
      name: 'Simple Greeting',
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
        performance: context?.performance,
        success: true,
      };
    },
    {
      validationConfig: {
        input: z.object({
          name: z.string().min(1, 'Name is required'),
        }),
        output: z.object({
          message: z.string(),
        }),
        validateInput: true,
        validateOutput: true,
      },
    },
  );
}

/**
 * Create delay step using template
 */
export function createWaitStep() {
  return StepTemplates.delay('Wait 1 Second', 1000);
}
