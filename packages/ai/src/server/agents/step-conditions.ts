/**
 * AI SDK v5 Step Conditions
 * Implementation of stopWhen conditions following official documentation
 */

// Re-export core step conditions from AI SDK v5
// Import type for custom conditions
import { type StopCondition } from 'ai';

// Type alias for generic usage
export type StepCondition = StopCondition<any>;

// Create our own textContains function since it's used throughout the codebase
export function textContains(searchText: string): StepCondition {
  return ({ steps }) => {
    const lastStep = steps[steps.length - 1];
    const text = lastStep?.text || '';
    return text.includes(searchText);
  };
}

// Create our own stepCountIs function since it's not exported from AI SDK v5
export function stepCountIs(count: number): StepCondition {
  return ({ steps }) => {
    return steps.length === count;
  };
}

export { hasToolCall } from 'ai';

// These functions don't exist in the AI SDK, so we define them locally
export const stepCountAtLeast = (count: number): StepCondition => {
  return ({ steps }) => {
    return steps.length >= count;
  };
};

export const stepCountAtMost = (count: number): StepCondition => {
  return ({ steps }) => {
    return steps.length <= count;
  };
};

// Additional custom conditions for enhanced control

/**
 * Stop when the assistant mentions needing clarification
 */
export const needsClarification: StepCondition = ({ steps }) => {
  const lastStep = steps[steps.length - 1];
  const text = lastStep?.text;
  const clarificationPatterns = [
    /could you clarify/i,
    /can you provide more/i,
    /i need more information/i,
    /please specify/i,
    /what do you mean by/i,
  ];

  return clarificationPatterns.some(pattern => pattern.test(text || ''));
};

/**
 * Stop when the assistant indicates task completion
 */
export const taskComplete: StepCondition = ({ steps }) => {
  const lastStep = steps[steps.length - 1];
  const text = lastStep?.text;
  const completionPatterns = [
    /task completed/i,
    /all done/i,
    /finished successfully/i,
    /completed all steps/i,
    /nothing more to do/i,
  ];

  return completionPatterns.some(pattern => pattern.test(text || ''));
};

/**
 * Create a custom condition based on a predicate function
 */
export function customCondition(predicate: (context: { steps: any[] }) => boolean): StepCondition {
  return predicate as StepCondition;
}

/**
 * Stop when total tokens exceed a limit
 */
export function maxTotalTokens(limit: number): StepCondition {
  return ({ steps }: any) => {
    // Calculate total tokens from all steps
    const totalTokens = steps.reduce((sum: number, step: any) => {
      return sum + (step.usage?.totalTokens || 0);
    }, 0);
    return totalTokens >= limit;
  };
}

/**
 * Stop when a specific error pattern is detected
 */
export function hasError(errorPattern?: RegExp): StepCondition {
  return ({ steps }: any) => {
    const lastStep = steps[steps.length - 1];
    const toolResults = lastStep?.toolResults || [];
    return (
      toolResults.some((result: any) => {
        if (result.error) {
          if (errorPattern) {
            return errorPattern.test(result.error.message || '');
          }
          return true;
        }
        return false;
      }) || false
    );
  };
}

/**
 * Common preset conditions
 */
export const stopWhenPresets = {
  // Conservative: stop early to prevent runaway
  conservative: [stepCountIs(3), hasError(), needsClarification] as StepCondition[],

  // Standard: balanced approach
  standard: [stepCountIs(5), taskComplete, hasError()] as StepCondition[],

  // Extended: allow longer chains
  extended: [stepCountIs(10), taskComplete, hasError(/critical|fatal/i)] as StepCondition[],

  // Research: for complex multi-step research
  research: [stepCountIs(20), taskComplete, maxTotalTokens(50000)] as StepCondition[],
};
