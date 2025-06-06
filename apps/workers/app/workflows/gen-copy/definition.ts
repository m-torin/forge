export interface GenCopyPayload {
  keywords?: string[];
  length?: 'short' | 'medium' | 'long';
  message?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  topic?: string;
}

interface WorkflowDefinition {
  defaultPayload: GenCopyPayload;
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

const genCopyDefinition: WorkflowDefinition = {
  defaultPayload: {
    keywords: ['smart', 'home', 'automation', 'IoT'],
    length: 'medium',
    message: 'Hello World from Gen Copy!',
    tone: 'friendly',
    topic: 'Smart Home Device',
  },
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
  workflow: async (context: any) => {
    const payload = context.requestPayload;
    let finalPayload;

    if (!payload) {
      // Handle missing payload case with specific defaults
      finalPayload = {
        keywords: [],
        length: 'medium',
        message: 'Hello World from Gen Copy!',
        tone: 'professional',
        topic: 'Product Description',
      };
    } else {
      finalPayload = {
        ...genCopyDefinition.defaultPayload,
        ...payload,
      };
    }

    // Prepare parameters step
    await context.run('prepare-params', async () => {
      console.log(`Preparing copy generation: ${finalPayload.message}`);
      console.log(
        `Topic: ${finalPayload.topic}, Tone: ${finalPayload.tone}, Length: ${finalPayload.length}`,
      );
      return {
        keywords: finalPayload.keywords,
        length: finalPayload.length,
        message: finalPayload.message,
        preparedAt: new Date().toISOString(),
        tone: finalPayload.tone,
        topic: finalPayload.topic,
      };
    });

    // Generate copy step
    await context.run('generate-copy', async () => {
      console.log(`Keywords: ${finalPayload.keywords.join(', ')}`);
      const generatedCopy = `${finalPayload.tone} copy about ${finalPayload.topic || finalPayload.message}. Keywords: ${finalPayload.keywords.join(', ')}. Length: ${finalPayload.length}`;
      return {
        generatedCopy,
        keywords: finalPayload.keywords,
        readabilityScore: Math.floor(Math.random() * 40) + 60,
        seoScore: Math.floor(Math.random() * 30) + 70,
        topic: finalPayload.topic,
      };
    });

    // Optimize SEO step
    await context.run('optimize-seo', async () => {
      console.log('Optimizing copy for SEO...');
      return {
        optimized: true,
        readabilityScore: Math.floor(Math.random() * 40) + 60,
        seoEnhancements: [
          'Added meta description',
          'Optimized keyword density',
          'Improved readability',
        ],
        seoScore: Math.floor(Math.random() * 30) + 70,
      };
    });

    const generatedText = `${finalPayload.tone} copy about ${finalPayload.topic || finalPayload.message}. Keywords: ${finalPayload.keywords.join(', ')}. Length: ${finalPayload.length}`;

    return {
      data: {
        generatedCopy: generatedText,
        keywords: finalPayload.keywords,
        length: finalPayload.length,
        optimized: true,
        params: {
          keywords: finalPayload.keywords,
          length: finalPayload.length,
          tone: finalPayload.tone,
          topic: finalPayload.topic,
        },
        readabilityScore: Math.floor(Math.random() * 40) + 60, // 60-100
        seoEnhancements: [
          'Added meta description',
          'Optimized keyword density',
          'Improved readability',
        ],
        seoScore: Math.floor(Math.random() * 30) + 70, // 70-100
        tone: finalPayload.tone,
        topic: finalPayload.topic,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        workflowRunId: context.workflowRunId,
      },
      status: 'success',
    };
  },
};

export default genCopyDefinition;
