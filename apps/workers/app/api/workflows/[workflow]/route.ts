import { loadWorkflow } from '@/workflows/loader';
import { serve } from '@upstash/workflow/nextjs';
import { notFound } from 'next/navigation';

export async function POST(request: Request, context: { params: Promise<{ workflow: string }> }) {
  const params = await context.params;
  const workflowId = params.workflow;

  // Dynamically load the workflow definition
  const definition = await loadWorkflow(workflowId);

  if (!definition) {
    notFound();
  }

  // Create the handler for this specific workflow
  const handler = serve(definition.workflow, {
    retries: process.env.NODE_ENV === 'development' ? 1 : 3,
    verbose: process.env.NODE_ENV === 'development' ? true : undefined,
  });

  // Execute the handler
  return handler.POST(request);
}
