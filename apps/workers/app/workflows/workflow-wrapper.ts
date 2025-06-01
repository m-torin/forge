import type { WorkflowContext } from '@upstash/workflow';

/**
 * Wrapper to adapt enhanced workflows to standard WorkflowContext
 * This allows us to use workflows from @repo/orchestration/examples
 */
export function wrapWorkflow<T = any>(
  enhancedWorkflow: (context: any) => Promise<any>,
): (context: WorkflowContext<T>) => Promise<any> {
  return async (context: WorkflowContext<T>) => {
    // The enhanced workflows expect additional properties that aren't in WorkflowContext
    // We'll pass the context as-is and let the workflow handle it
    return enhancedWorkflow(context as any);
  };
}
