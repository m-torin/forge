import type { WorkflowContext } from '@upstash/workflow';
import type { WorkflowDefinition } from '../types';

export interface MapTaxtermPayload {
  message?: string;
  terms?: Array<{ id: string; name: string; category?: string }>;
}

const mapTaxtermWorkflow = async (context: WorkflowContext<MapTaxtermPayload>) => {
  const { message = 'Hello World from Map Taxterm!', terms = [] } = context.requestPayload || {};

  // Step 1: Validate input
  await context.run('validate-terms', async () => {
    console.log(`Starting taxonomy mapping: ${message}`);
    console.log(`Mapping ${terms.length} terms`);
    return { validated: true, termCount: terms.length };
  });

  // Step 2: Map terms (placeholder)
  const result = await context.run('map-terms', async () => {
    const mappedTerms = terms.map(term => ({
      ...term,
      mapped: true,
      mappedAt: new Date().toISOString(),
    }));
    
    console.log(`Mapped ${mappedTerms.length} taxonomy terms`);
    return {
      message,
      originalTerms: terms,
      mappedTerms,
      timestamp: new Date().toISOString(),
      workflowRunId: context.workflowRunId,
    };
  });

  return {
    status: 'success' as const,
    data: result,
    metadata: {
      workflowRunId: context.workflowRunId,
      timestamp: new Date().toISOString(),
    },
  };
};

const definition: WorkflowDefinition = {
  metadata: {
    id: 'map-taxterm',
    title: 'Map Taxonomy Terms',
    description: 'Map and organize taxonomy terms for classification',
    tags: ['jollyRoger', 'etl'],
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    color: 'lime',
    features: [
      'Taxonomy term mapping',
      'Classification system',
      'Hierarchical organization',
      'Category assignment',
    ],
  },
  
  defaultPayload: {
    message: 'Hello World from Map Taxterm!',
    terms: [
      { id: 'term-1', name: 'Electronics', category: 'root' },
      { id: 'term-2', name: 'Smartphones', category: 'electronics' },
      { id: 'term-3', name: 'Laptops', category: 'electronics' },
    ],
  },
  
  workflow: mapTaxtermWorkflow,
};

export default definition;