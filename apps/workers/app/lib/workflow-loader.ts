import { loadAllWorkflowMetadata } from '@/workflows/loader';

/**
 * Load all workflow metadata including legacy workflows
 * This runs on the server and returns client-safe metadata
 */
export async function getAllWorkflowMetadata() {
  const metadata = await loadAllWorkflowMetadata();

  // Transform to match the expected format
  return Object.entries(metadata).reduce(
    (acc, [id, workflow]) => {
      acc[id] = {
        id,
        color: workflow.color || 'blue',
        defaultPayload: workflow.defaultPayload,
        description: workflow.description,
        difficulty: workflow.difficulty,
        estimatedTime: workflow.estimatedTime,
        features: workflow.features,
        tags: workflow.tags,
        title: workflow.title,
      };
      return acc;
    },
    {} as Record<string, any>,
  );
}
