export interface MapTaxtermPayload {
  message?: string;
  terms?: {
    id: string;
    name: string;
    category?: string;
  }[];
}

interface WorkflowDefinition {
  defaultPayload: MapTaxtermPayload;
  metadata: {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: string;
    features: string[];
    tags: string[];
    color: string;
  };
  workflow: (context: any) => Promise<any>;
}

const mapTaxtermDefinition: WorkflowDefinition = {
  defaultPayload: {
    message: 'Hello World from Map Taxterm!',
    terms: [
      { id: 'term-1', name: 'Electronics', category: 'root' },
      { id: 'term-2', name: 'Smartphones', category: 'electronics' },
      { id: 'term-3', name: 'Laptops', category: 'electronics' },
    ],
  },
  metadata: {
    id: 'map-taxterm',
    color: 'lime',
    description: 'Map and organize taxonomy terms for classification',
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    features: [
      'Taxonomy term mapping',
      'Classification system',
      'Hierarchical organization',
      'Category assignment',
    ],
    tags: ['jollyRoger', 'etl'],
    title: 'Map Taxonomy Terms',
  },
  workflow: async (context: any) => {
    const payload = context.requestPayload || {};
    const message = payload.message || mapTaxtermDefinition.defaultPayload.message;
    const terms = payload.terms || [];

    // Validate terms step
    await context.run('validate-terms', async () => {
      console.log(`Starting taxonomy mapping: ${message}`);
      console.log(`Mapping ${terms.length} terms`);
      return { validated: true, termCount: terms.length };
    });

    // Map terms step
    await context.run('map-terms', async () => {
      console.log(`Mapped ${terms.length} taxonomy terms`);

      const mappedTerms = terms.map((term: any) => ({
        ...term,
        mapped: true,
        mappedAt: new Date().toISOString(),
      }));

      return {
        mappedTerms,
        originalTerms: terms,
        timestamp: new Date().toISOString(),
        workflowRunId: context.workflowRunId,
      };
    });

    const mappedTerms = terms.map((term: any) => ({
      ...term,
      mapped: true,
      mappedAt: new Date().toISOString(),
    }));

    return {
      data: {
        mappedTerms,
        message,
        originalTerms: terms,
        timestamp: new Date().toISOString(),
        workflowRunId: context.workflowRunId,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        workflowRunId: context.workflowRunId,
      },
      status: 'success',
    };
  },
};

export default mapTaxtermDefinition;
