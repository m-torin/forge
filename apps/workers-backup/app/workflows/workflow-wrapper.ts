import type { WorkflowContext } from './types';

export type WrappedWorkflowFunction<T = any> = (context: WorkflowContext<T>) => Promise<any>;

export function wrapWorkflow<T = any>(
  workflowFn: (context: WorkflowContext<T>) => Promise<any>,
): WrappedWorkflowFunction<T> {
  return async (context: WorkflowContext<T>): Promise<any> => {
    try {
      const result = await workflowFn(context);
      return result;
    } catch (error) {
      console.error(`Workflow ${context.workflowRunId} failed:`, error);
      throw error;
    }
  };
}
