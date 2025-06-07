import type { WorkflowDefinition } from './types';

// Workflow loader functions
export async function loadWorkflow(name: string): Promise<WorkflowDefinition | null> {
  try {
    // Dynamic import based on workflow name
    const workflowModule = await import(`./${name}/definition`);
    return workflowModule.default || workflowModule;
  } catch (error) {
    console.error(`Failed to load workflow ${name}:`, error);
    return null;
  }
}

export function getAvailableWorkflows(): string[] {
  // Return empty array on client side
  if (typeof window !== 'undefined') {
    return [];
  }

  // For now, return a static list of workflows
  // This avoids the dynamic require warning
  return [
    'basic',
    'chart-pdps',
    'chart-sitemaps',
    'gen-copy',
    'image-processing',
    'kitchen-sink',
    'map-taxterm',
    'import-external-media',
  ];
}

export async function loadAllWorkflowMetadata(): Promise<Record<string, any>> {
  const workflows = getAvailableWorkflows();
  const metadata: Record<string, any> = {};

  for (const workflowName of workflows) {
    try {
      const workflow = await loadWorkflow(workflowName);
      if (workflow && workflow.metadata) {
        metadata[workflowName] = workflow.metadata;
      }
    } catch (error) {
      console.error(`Failed to load metadata for ${workflowName}:`, error);
    }
  }

  return metadata;
}
