import type { WorkflowContext } from '@upstash/workflow';
import type { WorkflowDefinition } from '../types';

export interface GenCopyPayload {
  message?: string;
  topic?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  keywords?: string[];
  length?: 'short' | 'medium' | 'long';
}

const genCopyWorkflow = async (context: WorkflowContext<GenCopyPayload>) => {
  const { 
    message = 'Hello World from Gen Copy!',
    topic = 'Product Description',
    tone = 'professional',
    keywords = [],
    length = 'medium'
  } = context.requestPayload || {};

  // Step 1: Prepare generation parameters
  const params = await context.run('prepare-params', async () => {
    console.log(`Preparing copy generation: ${message}`);
    console.log(`Topic: ${topic}, Tone: ${tone}, Length: ${length}`);
    console.log(`Keywords: ${keywords.join(', ')}`);
    
    return {
      topic,
      tone,
      keywords,
      length,
      preparedAt: new Date().toISOString(),
    };
  });

  // Step 2: Generate copy (placeholder)
  const result = await context.run('generate-copy', async () => {
    // In a real implementation, this would call an AI service
    const generatedCopy = `This is AI-generated ${tone} copy about ${topic}. Keywords: ${keywords.join(', ')}. Length: ${length}.`;
    
    return {
      message,
      params,
      generatedCopy,
      seoScore: Math.floor(Math.random() * 100),
      readabilityScore: Math.floor(Math.random() * 100),
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
      seoEnhancements: ['Added meta description', 'Optimized keyword density', 'Improved readability'],
    };
  });

  return {
    status: 'success' as const,
    data: optimized,
    metadata: {
      workflowRunId: context.workflowRunId,
      timestamp: new Date().toISOString(),
    },
  };
};

const definition: WorkflowDefinition = {
  metadata: {
    id: 'gen-copy',
    title: 'Generate Copy',
    description: 'AI-powered copy generation with SEO optimization',
    tags: ['ai', 'seo', 'etl'],
    difficulty: 'intermediate',
    estimatedTime: '10-20 seconds',
    color: 'pink',
    features: [
      'AI content generation',
      'SEO optimization',
      'Multiple tone options',
      'Keyword integration',
      'Readability scoring',
      'Length customization',
    ],
  },
  
  defaultPayload: {
    message: 'Hello World from Gen Copy!',
    topic: 'Smart Home Device',
    tone: 'friendly',
    keywords: ['smart', 'home', 'automation', 'IoT'],
    length: 'medium',
  },
  
  workflow: genCopyWorkflow,
};

export default definition;