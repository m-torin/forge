export interface ChartSitemapsPayload {
  message?: string;
  options?: {
    includeImages?: boolean;
    followRedirects?: boolean;
  };
  url?: string;
}

interface WorkflowDefinition {
  defaultPayload: ChartSitemapsPayload;
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

const chartSitemapsDefinition: WorkflowDefinition = {
  defaultPayload: {
    url: 'https://example.com/sitemap.xml',
    message: 'Hello World from Chart Sitemaps!',
    options: {
      followRedirects: false,
      includeImages: true,
    },
  },
  metadata: {
    id: 'chart-sitemaps',
    color: 'cyan',
    description: 'Process and analyze chart sitemaps for data extraction',
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    features: [
      'Chart sitemap processing',
      'Data extraction',
      'URL analysis',
      'Structured data parsing',
    ],
    tags: ['jollyRoger', 'etl'],
    title: 'Chart Sitemaps',
  },
  workflow: async (context: any) => {
    const payload = context.requestPayload;

    // Log start step
    await context.run('log-start', async () => {
      console.log(
        `Starting chart sitemaps workflow: ${payload?.message || chartSitemapsDefinition.defaultPayload.message}`,
      );
      return { started: true };
    });

    // Process sitemap step
    await context.run('process-sitemap', async () => {
      if (!payload) {
        console.log('Processing sitemap: no URL provided');
      } else {
        console.log(`Processing sitemap: ${payload.url || 'no URL provided'}`);
      }
      return {
        url: payload?.url,
        message: payload?.message || chartSitemapsDefinition.defaultPayload.message,
        timestamp: new Date().toISOString(),
        workflowRunId: context.workflowRunId,
      };
    });

    return {
      data: {
        url: payload?.url,
        message: payload?.message || chartSitemapsDefinition.defaultPayload.message,
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

export default chartSitemapsDefinition;
