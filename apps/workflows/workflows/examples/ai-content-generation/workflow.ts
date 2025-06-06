interface AIContentInput {
  prompt: string;
  contentType: 'blog-post' | 'social-media' | 'email' | 'product-description';
  length: 'short' | 'medium' | 'long';
  tone: 'professional' | 'casual' | 'friendly' | 'formal';
  language?: string;
  keywords?: string[];
  targetAudience?: string;
  customInstructions?: string;
}

interface AIContentOutput {
  content: string;
  metadata: {
    wordCount: number;
    characterCount: number;
    estimatedReadingTime: number; // in minutes
    keywords: string[];
    language: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  };
  generation: {
    model: string;
    tokensUsed: number;
    processingTime: number;
    cost: number;
  };
  alternatives?: string[]; // Alternative versions
}

async function generateContent(
  prompt: string,
  contentType: string,
  length: string,
  tone: string,
  options: {
    language?: string;
    keywords?: string[];
    targetAudience?: string;
    customInstructions?: string;
  },
): Promise<{
  content: string;
  tokensUsed: number;
  processingTime: number;
}> {
  const startTime = Date.now();

  // Simulate AI processing time based on length
  const processingTimes = {
    short: 2000, // 2 seconds
    medium: 5000, // 5 seconds
    long: 10000, // 10 seconds
  };

  await new Promise((resolve) =>
    setTimeout(resolve, processingTimes[length as keyof typeof processingTimes] || 5000),
  );

  // Generate mock content based on type and length
  const contentTemplates = {
    'blog-post': {
      short: `# ${prompt}\n\nThis is a concise blog post about ${prompt}. It covers the main points in a ${tone} tone and provides valuable insights for ${options.targetAudience || 'readers'}.`,
      medium: `# ${prompt}\n\n## Introduction\n\nThis blog post explores ${prompt} in detail. Written in a ${tone} tone, it's designed for ${options.targetAudience || 'general readers'}.\n\n## Main Content\n\nHere's where we dive deep into the topic, covering key aspects and providing actionable insights.\n\n## Conclusion\n\nIn summary, ${prompt} is an important topic that deserves attention.`,
      long: `# ${prompt}\n\n## Introduction\n\nWelcome to this comprehensive guide about ${prompt}. This detailed blog post is written in a ${tone} tone and specifically crafted for ${options.targetAudience || 'our audience'}.\n\n## Background\n\nTo understand ${prompt}, we need to look at the context and history.\n\n## Main Analysis\n\nLet's dive deep into the core concepts, exploring multiple perspectives and providing detailed explanations.\n\n## Practical Applications\n\nHere are some real-world applications and examples.\n\n## Future Considerations\n\nLooking ahead, here's what we might expect.\n\n## Conclusion\n\nIn conclusion, ${prompt} represents a significant opportunity for growth and understanding.`,
    },
    'social-media': {
      short: `🚀 Exciting news about ${prompt}! Perfect for ${options.targetAudience || 'everyone'}. #${prompt.replace(/\s+/g, '')}`,
      medium: `📢 Let's talk about ${prompt}!\n\nThis ${tone} post is all about sharing insights with ${options.targetAudience || 'our community'}. Here's what you need to know:\n\n✨ Key points and takeaways\n🎯 Actionable advice\n💡 Fresh perspectives\n\n#${prompt.replace(/\s+/g, '')}`,
      long: `🌟 Deep dive into ${prompt} 🌟\n\nI'm excited to share this ${tone} exploration with ${options.targetAudience || 'you all'}!\n\n🔍 What we'll cover:\n• Background and context\n• Key insights and analysis\n• Practical applications\n• Future implications\n\n💭 This topic is fascinating because it touches on so many aspects of modern life.\n\n🚀 Ready to learn more? Let's discuss in the comments!\n\n#${prompt.replace(/\s+/g, '')} #Innovation #Growth`,
    },
    email: {
      short: `Subject: Quick update on ${prompt}\n\nHi there!\n\nI wanted to quickly share some thoughts on ${prompt}. Hope this ${tone} message finds you well!\n\nBest regards`,
      medium: `Subject: Insights on ${prompt}\n\nDear ${options.targetAudience || 'Valued Reader'},\n\nI hope this email finds you well. I'm writing to share some valuable insights about ${prompt} in a ${tone} manner.\n\nHere are the key points:\n• Important consideration #1\n• Valuable insight #2\n• Actionable takeaway #3\n\nI'd love to hear your thoughts on this topic.\n\nBest regards`,
      long: `Subject: Comprehensive Analysis: ${prompt}\n\nDear ${options.targetAudience || 'Valued Reader'},\n\nGreetings! I hope this detailed email finds you in good health and spirits.\n\nI'm writing to provide you with a comprehensive analysis of ${prompt}, presented in a ${tone} tone that I believe will resonate with you.\n\n## Background\nLet me start by providing some context about this important topic.\n\n## Key Insights\nAfter careful consideration, here are the most valuable insights:\n\n1. First major point about the topic\n2. Second important consideration\n3. Third actionable insight\n\n## Next Steps\nBased on this analysis, here's what I recommend moving forward.\n\nI'd be delighted to discuss this further if you have any questions or would like to share your perspective.\n\nWarm regards`,
    },
    'product-description': {
      short: `${prompt} - The perfect solution for ${options.targetAudience || 'modern consumers'}. Experience quality and innovation in every detail.`,
      medium: `Introducing ${prompt}\n\nDesigned with ${options.targetAudience || 'you'} in mind, this exceptional product combines quality, innovation, and style in a ${tone} package.\n\nKey Features:\n• Premium quality materials\n• Innovative design\n• User-friendly experience\n• Outstanding value\n\nDiscover the difference today.`,
      long: `${prompt} - Excellence Redefined\n\nWelcome to a new standard of quality and innovation. Our ${prompt} represents the perfect blend of functionality, style, and value, crafted specifically for ${options.targetAudience || 'discerning customers'}.\n\n🌟 Premium Features:\n• State-of-the-art technology\n• Meticulously crafted design\n• Sustainable materials\n• Comprehensive warranty\n\n💡 Why Choose Us:\nWith years of experience and a commitment to excellence, we've created a product that exceeds expectations.\n\n🚀 Experience the Difference:\nJoin thousands of satisfied customers who have made the smart choice.\n\nOrder now and discover what makes us special.`,
    },
  };

  const content =
    contentTemplates[contentType as keyof typeof contentTemplates]?.[
      length as keyof (typeof contentTemplates)['blog-post']
    ] ||
    `Generated content about ${prompt} in ${tone} tone for ${options.targetAudience || 'general audience'}.`;

  // Add keywords if provided
  let finalContent = content;
  if (options.keywords && options.keywords.length > 0) {
    finalContent += `\n\nKeywords: ${options.keywords.join(', ')}`;
  }

  // Add custom instructions
  if (options.customInstructions) {
    finalContent += `\n\nCustom Note: ${options.customInstructions}`;
  }

  const processingTime = Date.now() - startTime;
  const tokensUsed = Math.round(finalContent.length / 4); // Rough token estimation

  return {
    content: finalContent,
    tokensUsed,
    processingTime,
  };
}

function analyzeContent(content: string) {
  const words = content.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;
  const characterCount = content.length;
  const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 words per minute

  // Extract potential keywords (simple approach)
  const keywords = words
    .filter((word) => word.length > 4)
    .map((word) => word.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .slice(0, 10);

  // Simple sentiment analysis
  const positiveWords = [
    'great',
    'excellent',
    'amazing',
    'wonderful',
    'fantastic',
    'good',
    'best',
    'perfect',
  ];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'poor', 'disappointing'];

  const positiveCount = positiveWords.filter((word) => content.toLowerCase().includes(word)).length;
  const negativeCount = negativeWords.filter((word) => content.toLowerCase().includes(word)).length;

  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (positiveCount > negativeCount) sentiment = 'positive';
  else if (negativeCount > positiveCount) sentiment = 'negative';

  return {
    wordCount,
    characterCount,
    estimatedReadingTime,
    keywords,
    sentiment,
  };
}

export default {
  id: 'ai-content-generation',
  name: 'AI Content Generator',
  description:
    'Generate high-quality content using AI for various purposes like blog posts, social media, emails, and product descriptions',
  version: '2.1.0',
  category: 'ai',
  tags: ['ai', 'content', 'generation', 'writing', 'marketing'],
  author: 'AI Team',
  timeout: 60000, // 1 minute
  retries: 2,
  concurrency: 2,

  inputSchema: {
    type: 'object',
    required: ['prompt', 'contentType', 'length', 'tone'],
    properties: {
      prompt: { type: 'string', minLength: 5, maxLength: 500 },
      contentType: {
        type: 'string',
        enum: ['blog-post', 'social-media', 'email', 'product-description'],
      },
      length: { type: 'string', enum: ['short', 'medium', 'long'] },
      tone: { type: 'string', enum: ['professional', 'casual', 'friendly', 'formal'] },
      language: { type: 'string', default: 'en' },
      keywords: {
        type: 'array',
        items: { type: 'string' },
        maxItems: 10,
      },
      targetAudience: { type: 'string', maxLength: 100 },
      customInstructions: { type: 'string', maxLength: 500 },
    },
  },

  outputSchema: {
    type: 'object',
    required: ['content', 'metadata', 'generation'],
    properties: {
      content: { type: 'string' },
      metadata: {
        type: 'object',
        properties: {
          wordCount: { type: 'number' },
          characterCount: { type: 'number' },
          estimatedReadingTime: { type: 'number' },
          keywords: { type: 'array', items: { type: 'string' } },
          language: { type: 'string' },
          sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
        },
      },
      generation: {
        type: 'object',
        properties: {
          model: { type: 'string' },
          tokensUsed: { type: 'number' },
          processingTime: { type: 'number' },
          cost: { type: 'number' },
        },
      },
      alternatives: { type: 'array', items: { type: 'string' } },
    },
  },

  async handler(input: AIContentInput): Promise<AIContentOutput> {
    console.log(
      `Generating ${input.contentType} content: "${input.prompt}" (${input.length}, ${input.tone})`,
    );

    // Validate input
    if (input.prompt.trim().length < 5) {
      throw new Error('Prompt must be at least 5 characters long');
    }

    try {
      // Generate main content
      const generation = await generateContent(
        input.prompt,
        input.contentType,
        input.length,
        input.tone,
        {
          language: input.language,
          keywords: input.keywords,
          targetAudience: input.targetAudience,
          customInstructions: input.customInstructions,
        },
      );

      // Analyze the generated content
      const analysis = analyzeContent(generation.content);

      // Calculate cost (example pricing: $0.002 per 1K tokens)
      const cost = (generation.tokensUsed / 1000) * 0.002;

      // Generate alternatives for short content
      const alternatives: string[] = [];
      if (input.length === 'short') {
        // Generate 2 alternative versions
        for (let i = 0; i < 2; i++) {
          const alt = await generateContent(
            input.prompt + ` (alternative ${i + 1})`,
            input.contentType,
            input.length,
            input.tone,
            {
              language: input.language,
              keywords: input.keywords,
              targetAudience: input.targetAudience,
            },
          );
          alternatives.push(alt.content);
        }
      }

      const result: AIContentOutput = {
        content: generation.content,
        metadata: {
          ...analysis,
          language: input.language || 'en',
        },
        generation: {
          model: 'gpt-4-turbo', // Mock model name
          tokensUsed: generation.tokensUsed,
          processingTime: generation.processingTime,
          cost,
        },
        alternatives: alternatives.length > 0 ? alternatives : undefined,
      };

      console.log(
        `Content generated successfully: ${analysis.wordCount} words, ${generation.tokensUsed} tokens, $${cost.toFixed(4)} cost`,
      );

      return result;
    } catch (error) {
      console.error('Content generation failed:', error);
      throw new Error(
        `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  },
};
