/**
 * Simple Step Factory Examples
 * 
 * Basic examples for testing and demonstration purposes.
 */

import { z } from 'zod';
import {
  createWorkflowStep,
  StepTemplates,
  type StepExecutionContext,
  type StepExecutionResult,
} from '../shared/index.js';

/**
 * Simple greeting step example
 */
export function createGreetingStep() {
  return createWorkflowStep(
    {
      name: 'Simple Greeting',
      description: 'Creates a simple greeting message',
      version: '1.0.0',
      category: 'utility',
      tags: ['greeting', 'simple'],
    },
    async (context: StepExecutionContext<{ name: string }>): Promise<StepExecutionResult<{ message: string }>> => {
      const { input } = context;
      
      return {
        success: true,
        output: {
          message: `Hello, ${input.name}!`
        },
        performance: context.performance,
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
    }
  );
}

/**
 * Create HTTP request step using template
 */
export function createApiStep() {
  return StepTemplates.http(
    'User Data API',
    'Fetch user data from API'
  );
}

/**
 * Create delay step using template
 */
export function createWaitStep() {
  return StepTemplates.delay('Wait 1 Second', 1000);
}