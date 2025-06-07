import { getAvailableWorkflows, loadWorkflow } from '@/workflows/loader';
import { notFound } from 'next/navigation';

import WorkflowPage from './workflow-page';

interface WorkflowSlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function WorkflowSlugPage({ params }: WorkflowSlugPageProps) {
  const { slug } = await params;

  // Load the workflow definition
  const definition = await loadWorkflow(slug);

  if (!definition) {
    notFound();
  }

  // Only pass serializable data to the client component
  const serializableDefinition = {
    defaultPayload: definition.defaultPayload,
    metadata: definition.metadata,
  };

  return <WorkflowPage definition={serializableDefinition} slug={slug} />;
}

// Generate static params for all available workflows
export async function generateStaticParams() {
  const workflows = getAvailableWorkflows();
  return workflows.map((workflow) => ({
    slug: workflow,
  }));
}
