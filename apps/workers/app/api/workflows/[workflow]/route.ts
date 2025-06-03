import { requireAuth } from '@/lib/auth';
import { loadWorkflow } from '@/workflows/loader';
import { serve } from '@upstash/workflow/nextjs';
import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function POST(request: Request, context: { params: Promise<{ workflow: string }> }) {
  // Validate authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

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
