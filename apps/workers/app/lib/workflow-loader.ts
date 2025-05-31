import { loadAllWorkflowMetadata } from '@/workflows/loader';

/**
 * Load all workflow metadata including legacy workflows
 * This runs on the server and returns client-safe metadata
 */
export async function getAllWorkflowMetadata() {
  const metadata = await loadAllWorkflowMetadata();
  
  // Transform to match the expected format
  return Object.entries(metadata).reduce((acc, [id, workflow]) => {
    acc[id] = {
      id,
      title: workflow.title,
      description: workflow.description,
      tags: workflow.tags,
      difficulty: workflow.difficulty,
      estimatedTime: workflow.estimatedTime,
      color: workflow.color || 'blue',
      features: workflow.features,
      defaultPayload: workflow.defaultPayload,
    };
    return acc;
  }, {} as Record<string, any>);
}