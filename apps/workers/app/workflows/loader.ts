import type { WorkflowDefinition } from './types';

/**
 * Dynamically load a workflow definition
 */
export async function loadWorkflow(workflowId: string): Promise<WorkflowDefinition | null> {
  try {
    const workflowModule = await import(`./${workflowId}/definition`);
    return workflowModule.default || null;
  } catch (error) {
    console.error(`Failed to load workflow ${workflowId}:`, error);
    return null;
  }
}

/**
 * Get all available workflow IDs
 * This uses Webpack's require.context for dynamic discovery
 */
export function getAvailableWorkflows(): string[] {
  if (typeof window === 'undefined') {
    // Server-side: use require.context
    try {
      // @ts-ignore - webpack magic
      const context = require.context('./', true, /^\.\/[^_][^/]*\/definition\.ts$/);
      return context
        .keys()
        .map((key: string) => {
          const match = key.match(/^\.\/([^/]+)\/definition\.ts$/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[];
    } catch (error) {
      console.error('Failed to discover workflows:', error);
      return [];
    }
  }
  return [];
}

/**
 * Load all workflow metadata for the UI
 */
export async function loadAllWorkflowMetadata() {
  const workflowIds = getAvailableWorkflows();
  const metadata: Record<string, any> = {};

  for (const id of workflowIds) {
    const definition = await loadWorkflow(id);
    if (definition) {
      metadata[id] = {
        ...definition.metadata,
        defaultPayload: definition.defaultPayload,
      };
    }
  }

  return metadata;
}
