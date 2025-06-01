import type { WorkflowDefinition } from '../types';
import type { WorkflowContext } from '@upstash/workflow';

export interface GenCopyPayload {
  keywords?: string[];
  length?: 'short' | 'medium' | 'long';
  message?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  topic?: string;
}

const genCopyWorkflow = async (context: WorkflowContext<GenCopyPayload>) => {
  const {
    keywords = [],
    length = 'medium',
    message = 'Hello World from Gen Copy!',
    tone = 'professional',
    topic = 'Product Description',
  } = context.requestPayload || {};

  // Step 1: Prepare generation parameters
  const params = await context.run('prepare-params', async () => {
    console.log(`Preparing copy generation: ${message}`);
    console.log(`Topic: ${topic}, Tone: ${tone}, Length: ${length}`);
    console.log(`Keywords: ${keywords.join(', ')}`);

    return {
      keywords,
      length,
      preparedAt: new Date().toISOString(),
      tone,
      topic,
    };
  });

  // Step 2: Generate copy (placeholder)
  const result = await context.run('generate-copy', async () => {
    // In a real implementation, this would call an AI service
    const generatedCopy = `This is AI-generated ${tone} copy about ${topic}. Keywords: ${keywords.join(', ')}. Length: ${length}.`;

    return {
      generatedCopy,
      message,
      params,
      readabilityScore: Math.floor(Math.random() * 100),
      seoScore: Math.floor(Math.random() * 100),
      timestamp: new Date().toISOString(),
      workflowRunId: context.workflowRunId,
    };
  });

  // Step 3: SEO optimization (placeholder)
  const optimized = await context.run('optimize-seo', async () => {
    console.log('Optimizing copy for SEO...');
    return {
      ...result,
      optimized: true,
      seoEnhancements: [
        'Added meta description',
        'Optimized keyword density',
        'Improved readability',
      ],
    };
  });

  return {
    data: optimized,
    metadata: {
      timestamp: new Date().toISOString(),
      workflowRunId: context.workflowRunId,
    },
    status: 'success' as const,
  };
};

const definition: WorkflowDefinition = {
  metadata: {
    id: 'gen-copy',
    color: 'pink',
    description: 'AI-powered copy generation with SEO optimization',
    difficulty: 'intermediate',
    estimatedTime: '10-20 seconds',
    features: [
      'AI content generation',
      'SEO optimization',
      'Multiple tone options',
      'Keyword integration',
      'Readability scoring',
      'Length customization',
    ],
    tags: ['ai', 'seo', 'etl'],
    title: 'Generate Copy',
  },

  defaultPayload: {
    keywords: ['smart', 'home', 'automation', 'IoT'],
    length: 'medium',
    message: 'Hello World from Gen Copy!',
    tone: 'friendly',
    topic: 'Smart Home Device',
  },

  workflow: genCopyWorkflow,
};

export default definition;
