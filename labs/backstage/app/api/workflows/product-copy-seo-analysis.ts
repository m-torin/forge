/**
 * Product Copy SEO Analysis Workflow
 * Analyze product copy for SEO data generation and optimization
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  createWorkflowStep,
  StepTemplates,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from '@repo/orchestration/server/next';

// Input schemas
const ProductCopySEOAnalysisInput = z.object({
  aiConfig: z.object({
    provider: z.enum(['openai', 'anthropic', 'gemini']).default('openai'),
    generateVariations: z.boolean().default(true),
    model: z.string().default('gpt-4'),
    temperature: z.number().min(0).max(1).default(0.7),
  }),
  analysisConfig: z.object({
    competitorAnalysis: z.boolean().default(true),
    contentOptimization: z.boolean().default(true),
    keywordResearch: z.boolean().default(true),
    schemaGeneration: z.boolean().default(true),
    targetLanguage: z.string().default('en'),
    targetMarket: z.enum(['us', 'uk', 'ca', 'au', 'global']).default('us'),
  }),
  mode: z.enum(['single', 'batch', 'continuous']).default('batch'),
  products: z.array(
    z.object({
      brand: z.string(),
      category: z.array(z.string()),
      currentSEO: z
        .object({
          canonicalUrl: z.string().optional(),
          keywords: z.array(z.string()).optional(),
          metaDescription: z.string().optional(),
          metaTitle: z.string().optional(),
        })
        .optional(),
      description: z.string(),
      productId: z.string(),
      specifications: z.record(z.string()).optional(),
      title: z.string(),
    }),
  ),
  seoSettings: z.object({
    descriptionLength: z.object({
      max: z.number().default(160),
      min: z.number().default(120),
      optimal: z.number().default(155),
    }),
    keywordDensity: z.object({
      max: z.number().default(0.03), // 3%
      min: z.number().default(0.005), // 0.5%
      optimal: z.number().default(0.015), // 1.5%
    }),
    readabilityTarget: z.object({
      fleschScore: z.number().default(60), // 60-70 is ideal for general audience
      gradeLevel: z.number().default(8),
    }),
    titleLength: z.object({
      max: z.number().default(60),
      min: z.number().default(30),
      optimal: z.number().default(55),
    }),
  }),
});

// SEO analysis result schema
const SEOAnalysisResult = z.object({
  analysis: z.object({
    currentScore: z.number(),
    improvements: z.array(
      z.object({
        type: z.string(),
        currentValue: z.any(),
        impact: z.number(),
        priority: z.enum(['high', 'medium', 'low']),
        suggestedValue: z.any(),
      }),
    ),
    optimizedScore: z.number(),
  }),
  competitorInsights: z
    .object({
      gaps: z.array(z.string()),
      opportunities: z.array(z.string()),
      topCompetitors: z.array(
        z.object({
          domain: z.string(),
          relevance: z.number(),
          strengths: z.array(z.string()),
        }),
      ),
    })
    .optional(),
  keywords: z.object({
    branded: z.array(z.string()),
    longtail: z.array(z.string()),
    primary: z.array(
      z.object({
        difficulty: z.number(),
        keyword: z.string(),
        relevance: z.number(),
        volume: z.number(),
      }),
    ),
    secondary: z.array(z.string()),
  }),
  optimizedContent: z.object({
    bulletPoints: z.array(z.string()),
    description: z.object({
      optimized: z.string(),
      original: z.string(),
      score: z.number(),
      variations: z.array(z.string()),
    }),
    headings: z.array(
      z.object({
        keywords: z.array(z.string()),
        level: z.number(),
        text: z.string(),
      }),
    ),
    title: z.object({
      optimized: z.string(),
      original: z.string(),
      score: z.number(),
      variations: z.array(z.string()),
    }),
  }),
  productId: z.string(),
  readability: z.object({
    fleschScore: z.number(),
    gradeLevel: z.number(),
    sentenceComplexity: z.number(),
    suggestions: z.array(z.string()),
  }),
  structuredData: z.object({
    breadcrumb: z.any(),
    faq: z.any().optional(),
    product: z.any(),
    review: z.any().optional(),
  }),
});

// Step factory for AI content optimization
const aiContentOptimizerFactory = createWorkflowStep(
  {
    name: 'AI Content Optimizer',
    category: 'ai',
    tags: ['seo', 'content', 'optimization'],
    version: '1.0.0',
  },
  async (context) => {
    const { type, aiConfig, content, keywords } = context.input;

    // Simulate AI optimization
    const optimized = await optimizeContent(content, keywords, aiConfig, type);

    return optimized;
  },
);

async function optimizeContent(
  content: any,
  keywords: any,
  aiConfig: any,
  type: string,
): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  switch (type) {
    case 'title':
      return {
        optimized: `${content} - Best ${keywords.primary[0]} | Compare Prices & Reviews`,
        score: 0.85 + Math.random() * 0.15,
        variations: [
          `Top ${keywords.primary[0]} - ${content} Reviews & Deals`,
          `${content} | Best ${keywords.primary[0]} ${new Date().getFullYear()}`,
          `Buy ${content} - Compare ${keywords.primary[0]} Prices`,
        ],
      };

    case 'description':
      return {
        optimized: `Shop for ${content} and compare prices from top retailers. Find the best ${keywords.primary[0]} with our comprehensive reviews, price tracking, and exclusive deals. Free shipping available.`,
        score: 0.82 + Math.random() * 0.18,
        variations: [
          `Discover the best deals on ${content}. Compare ${keywords.primary[0]} from multiple sellers, read verified reviews, and save up to 40% with our price alerts.`,
          `Looking for ${content}? We compare prices from Amazon, Walmart, Target and more. Find the perfect ${keywords.primary[0]} with our expert buying guides.`,
        ],
      };

    default:
      return { optimized: content, score: 0.7 };
  }
}

// Step 1: Analyze current product copy
export const analyzeCurrentCopyStep = compose(
  createStepWithValidation(
    'analyze-copy',
    async (input: z.infer<typeof ProductCopySEOAnalysisInput>) => {
      const { products, seoSettings } = input;

      const copyAnalysis = [];

      for (const product of products) {
        const analysis = analyzeProductCopy(product, seoSettings);
        copyAnalysis.push({
          analysis,
          issues: identifyIssues(analysis, seoSettings),
          productId: product.productId,
        });
      }

      return {
        ...input,
        analysisStarted: new Date().toISOString(),
        averageScore:
          copyAnalysis.reduce((sum, a) => sum + a.analysis.score, 0) / copyAnalysis.length,
        copyAnalysis,
        totalProducts: products.length,
      };
    },
    (input) => input.products.length > 0,
    (output) => output.copyAnalysis.length > 0,
  ),
  (step: any) => withStepTimeout(step, 60000),
  (step: any) => withStepMonitoring(step),
);

function analyzeProductCopy(product: any, settings: any): any {
  const titleLength = product.title.length;
  const descriptionLength = product.description.length;
  const wordCount = product.description.split(/\s+/).length;

  // Calculate basic SEO score
  let score = 0;

  // Title scoring
  if (titleLength >= settings.titleLength.min && titleLength <= settings.titleLength.max) {
    score += 0.2;
    if (Math.abs(titleLength - settings.titleLength.optimal) < 5) {
      score += 0.1;
    }
  }

  // Description scoring
  if (
    descriptionLength >= settings.descriptionLength.min &&
    descriptionLength <= settings.descriptionLength.max
  ) {
    score += 0.2;
    if (Math.abs(descriptionLength - settings.descriptionLength.optimal) < 10) {
      score += 0.1;
    }
  }

  // Content quality scoring
  const hasNumbers = /\d/.test(product.title);
  const hasPowerWords = /best|top|premium|quality|exclusive/i.test(product.title);
  if (hasNumbers) score += 0.1;
  if (hasPowerWords) score += 0.1;

  // Readability scoring
  const avgSentenceLength = descriptionLength / (product.description.split(/[.!?]/).length || 1);
  if (avgSentenceLength < 20) score += 0.1;

  return {
    metrics: {
      avgSentenceLength,
      descriptionLength,
      hasNumbers,
      hasPowerWords,
      titleLength,
      wordCount,
    },
    readability: calculateReadability(product.description),
    score: Math.min(score, 1),
  };
}

function identifyIssues(analysis: any, settings: any): any[] {
  const issues = [];

  if (analysis.metrics.titleLength < settings.titleLength.min) {
    issues.push({
      type: 'title_too_short',
      message: `Title is ${settings.titleLength.min - analysis.metrics.titleLength} characters too short`,
      severity: 'high',
    });
  }

  if (analysis.metrics.titleLength > settings.titleLength.max) {
    issues.push({
      type: 'title_too_long',
      message: `Title is ${analysis.metrics.titleLength - settings.titleLength.max} characters too long`,
      severity: 'high',
    });
  }

  if (!analysis.metrics.hasNumbers && !analysis.metrics.hasPowerWords) {
    issues.push({
      type: 'weak_title',
      message: 'Title lacks numbers or power words',
      severity: 'medium',
    });
  }

  if (analysis.readability.gradeLevel > 12) {
    issues.push({
      type: 'complex_content',
      message: 'Content is too complex for general audience',
      severity: 'medium',
    });
  }

  return issues;
}

function calculateReadability(text: string): any {
  // Simplified Flesch Reading Ease calculation
  const sentences = text.split(/[.!?]/).filter((s) => s.trim()).length || 1;
  const words = text.split(/\s+/).filter((w) => w).length || 1;
  const syllables = text.split(/\s+/).reduce((sum, word) => sum + countSyllables(word), 0);

  const avgWordsPerSentence = words / sentences;
  const avgSyllablesPerWord = syllables / words;

  const fleschScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  const gradeLevel = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

  return {
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10,
    avgWordsPerSentence: Math.round(avgWordsPerSentence),
    fleschScore: Math.max(0, Math.min(100, fleschScore)),
    gradeLevel: Math.max(0, Math.round(gradeLevel)),
  };
}

function countSyllables(word: string): number {
  // Simple syllable counter
  word = word.toLowerCase();
  let count = 0;
  const vowels = 'aeiouy';
  let previousWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }

  // Adjust for silent e
  if (word.endsWith('e') && count > 1) {
    count--;
  }

  return Math.max(1, count);
}

// Step 2: Perform keyword research
export const performKeywordResearchStep = compose(
  createStep('keyword-research', async (data: any) => {
    const { analysisConfig, products } = data;

    if (!analysisConfig.keywordResearch) {
      return {
        ...data,
        keywordResearchSkipped: true,
      };
    }

    const keywordData = [];

    for (const product of products) {
      const keywords = await researchKeywords(product, analysisConfig.targetMarket);
      keywordData.push({
        keywords,
        productId: product.productId,
      });
    }

    return {
      ...data,
      keywordData,
      keywordResearchComplete: true,
    };
  }),
  (step: any) =>
    withStepRetry(step, {
      backoff: true,
      maxRetries: 3,
    }),
);

async function researchKeywords(product: any, market: string): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Simulate keyword research
  const baseKeywords = [
    product.brand.toLowerCase(),
    ...product.category.map((c: string) => c.toLowerCase()),
    product.title.toLowerCase().split(' ').slice(0, 3).join(' '),
  ];

  return {
    branded: [
      product.brand.toLowerCase(),
      `${product.brand.toLowerCase()} official`,
      `${product.brand.toLowerCase()} ${market}`,
    ],
    longtail: [
      `where to buy ${product.title.toLowerCase()}`,
      `${product.title.toLowerCase()} price comparison`,
      `is ${product.brand.toLowerCase()} ${baseKeywords[1]} worth it`,
      `${product.brand.toLowerCase()} vs competitors`,
    ],
    primary: baseKeywords.slice(0, 3).map((kw) => ({
      difficulty: Math.floor(Math.random() * 100),
      keyword: kw,
      relevance: 0.7 + Math.random() * 0.3,
      volume: Math.floor(Math.random() * 10000) + 1000,
    })),
    secondary: [
      `${baseKeywords[0]} reviews`,
      `best ${baseKeywords[1]}`,
      `${baseKeywords[0]} ${baseKeywords[1]}`,
      `cheap ${baseKeywords[0]}`,
      `${baseKeywords[0]} deals`,
    ],
  };
}

// Step 3: Analyze competitors
export const analyzeCompetitorsStep = createStep('analyze-competitors', async (data: any) => {
  const { analysisConfig, keywordData, products } = data;

  if (!analysisConfig.competitorAnalysis) {
    return {
      ...data,
      competitorAnalysisSkipped: true,
    };
  }

  const competitorData = [];

  for (const product of products) {
    const keywords = keywordData.find((k: any) => k.productId === product.productId)?.keywords;
    const competitors = await analyzeCompetitors(product, keywords);
    competitorData.push({
      competitors,
      productId: product.productId,
    });
  }

  return {
    ...data,
    competitorAnalysisComplete: true,
    competitorData,
  };
});

async function analyzeCompetitors(product: any, keywords: any): Promise<any> {
  // Simulate competitor analysis
  const topCompetitors = [
    {
      domain: 'competitor1.com',
      relevance: 0.9,
      strengths: ['Strong brand presence', 'High domain authority', 'Rich content'],
    },
    {
      domain: 'competitor2.com',
      relevance: 0.85,
      strengths: ['User reviews', 'Detailed specifications', 'Video content'],
    },
    {
      domain: 'competitor3.com',
      relevance: 0.8,
      strengths: ['Price comparison', 'Fast loading', 'Mobile optimized'],
    },
  ];

  const gaps = [
    'Missing comparison charts',
    'No user-generated content',
    'Limited long-tail keyword coverage',
    'Weak internal linking',
  ];

  const opportunities = [
    'Target "vs" comparison keywords',
    'Create buying guides',
    'Add FAQ sections',
    'Implement review schema',
  ];

  return {
    gaps: gaps.slice(0, Math.floor(Math.random() * 3) + 1),
    opportunities: opportunities.slice(0, Math.floor(Math.random() * 3) + 1),
    topCompetitors,
  };
}

// Step 4: Optimize content with AI
export const optimizeContentStep = compose(
  createStep('optimize-content', async (data: any) => {
    const { aiConfig, keywordData, products, seoSettings } = data;

    const optimizedContent = [];

    for (const product of products) {
      const keywords = keywordData.find((k: any) => k.productId === product.productId)?.keywords;

      // Optimize title
      const titleOptimization = await aiContentOptimizerFactory.handler({
        input: {
          type: 'title',
          aiConfig,
          content: product.title,
          keywords,
        },
      });

      // Optimize description
      const descriptionOptimization = await aiContentOptimizerFactory.handler({
        input: {
          type: 'description',
          aiConfig,
          content: product.description,
          keywords,
        },
      });

      // Generate headings and bullet points
      const structuredContent = generateStructuredContent(product, keywords);

      optimizedContent.push({
        description: {
          original: product.description,
          ...descriptionOptimization,
        },
        productId: product.productId,
        title: {
          original: product.title,
          ...titleOptimization,
        },
        ...structuredContent,
      });
    }

    return {
      ...data,
      contentOptimized: true,
      optimizedContent,
    };
  }),
  (step: any) => withStepTimeout(step, 120000), // 2 minutes
);

function generateStructuredContent(product: any, keywords: any): any {
  // Generate SEO-friendly headings
  const headings = [
    {
      keywords: [keywords.primary[0]?.keyword],
      level: 1,
      text: product.title,
    },
    {
      keywords: [product.brand.toLowerCase(), product.category[0].toLowerCase()],
      level: 2,
      text: `Why Choose ${product.brand} ${product.category[0]}?`,
    },
    {
      keywords: ['features', 'benefits'],
      level: 2,
      text: 'Key Features & Benefits',
    },
    {
      keywords: ['specs', 'specifications'],
      level: 2,
      text: 'Specifications',
    },
    {
      keywords: ['price', 'buy', 'comparison'],
      level: 2,
      text: 'Price Comparison & Where to Buy',
    },
  ];

  // Generate bullet points
  const bulletPoints = [
    `✓ ${product.brand} quality and reliability`,
    `✓ Compare prices from multiple retailers`,
    `✓ Free shipping available from select sellers`,
    `✓ ${Math.floor(Math.random() * 90) + 10}% of buyers rate 4+ stars`,
    `✓ Price match guarantee available`,
  ];

  if (product.specifications) {
    Object.entries(product.specifications)
      .slice(0, 3)
      .forEach(([key, value]) => {
        bulletPoints.push(`✓ ${key}: ${value}`);
      });
  }

  return {
    bulletPoints,
    headings,
  };
}

// Step 5: Generate structured data
export const generateStructuredDataStep = createStep(
  'generate-structured-data',
  async (data: any) => {
    const { analysisConfig, keywordData, optimizedContent, products } = data;

    if (!analysisConfig.schemaGeneration) {
      return {
        ...data,
        structuredDataSkipped: true,
      };
    }

    const structuredDataList = [];

    for (const product of products) {
      const optimized = optimizedContent.find((o: any) => o.productId === product.productId);
      const keywords = keywordData.find((k: any) => k.productId === product.productId)?.keywords;

      const structuredData = generateProductSchema(product, optimized, keywords);
      structuredDataList.push({
        productId: product.productId,
        structuredData,
      });
    }

    return {
      ...data,
      structuredDataGenerated: true,
      structuredDataList,
    };
  },
);

function generateProductSchema(product: any, optimized: any, keywords: any): any {
  const baseUrl = 'https://example.com';

  return {
    breadcrumb: {
      '@type': 'BreadcrumbList',
      '@context': 'https://schema.org',
      itemListElement: [
        {
          name: 'Home',
          '@type': 'ListItem',
          item: baseUrl,
          position: 1,
        },
        ...product.category.map((cat: string, idx: number) => ({
          name: cat,
          '@type': 'ListItem',
          item: `${baseUrl}/${cat.toLowerCase().replace(/\s+/g, '-')}`,
          position: idx + 2,
        })),
        {
          name: product.title,
          '@type': 'ListItem',
          item: `${baseUrl}/products/${product.productId}`,
          position: product.category.length + 2,
        },
      ],
    },
    faq: keywords?.longtail
      ? {
          '@type': 'FAQPage',
          '@context': 'https://schema.org',
          mainEntity: keywords.longtail.slice(0, 3).map((question: string) => ({
            name: question,
            '@type': 'Question',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Find the best deals on ${product.title} at our price comparison platform. We track prices from multiple retailers to help you save.`,
            },
          })),
        }
      : null,
    product: {
      name: optimized?.title?.optimized || product.title,
      '@type': 'Product',
      '@context': 'https://schema.org',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: (3.5 + Math.random() * 1.5).toFixed(1),
        reviewCount: Math.floor(Math.random() * 1000) + 100,
      },
      brand: {
        name: product.brand,
        '@type': 'Brand',
      },
      category: product.category.join(' > '),
      description: optimized?.description?.optimized || product.description,
      image: `${baseUrl}/images/${product.productId}.jpg`,
      offers: {
        '@type': 'AggregateOffer',
        availability: 'https://schema.org/InStock',
        highPrice: Math.floor(Math.random() * 200) + 100,
        lowPrice: Math.floor(Math.random() * 50) + 10,
        offerCount: Math.floor(Math.random() * 10) + 3,
        priceCurrency: 'USD',
      },
      sku: product.productId,
    },
  };
}

// Step 6: Calculate SEO improvements
export const calculateImprovementsStep = createStep('calculate-improvements', async (data: any) => {
  const { competitorData, copyAnalysis, optimizedContent, structuredDataList } = data;

  const improvements = [];

  for (const analysis of copyAnalysis) {
    const optimized = optimizedContent.find((o: any) => o.productId === analysis.productId);
    const structuredData = structuredDataList.find((s: any) => s.productId === analysis.productId);
    const competitors = competitorData?.find((c: any) => c.productId === analysis.productId);

    const productImprovements = calculateProductImprovements(
      analysis,
      optimized,
      structuredData,
      competitors,
    );

    improvements.push({
      currentScore: analysis.analysis.score,
      improvements: productImprovements.improvements,
      optimizedScore: productImprovements.newScore,
      productId: analysis.productId,
    });
  }

  return {
    ...data,
    improvements,
    improvementsCalculated: true,
  };
});

function calculateProductImprovements(
  analysis: any,
  optimized: any,
  structuredData: any,
  competitors: any,
): any {
  const improvements = [];
  let scoreImprovement = 0;

  // Title optimization
  if (optimized?.title?.score > 0.8) {
    improvements.push({
      type: 'title_optimization',
      currentValue: optimized.title.original,
      impact: 0.2,
      priority: 'high',
      suggestedValue: optimized.title.optimized,
    });
    scoreImprovement += 0.2;
  }

  // Description optimization
  if (optimized?.description?.score > 0.8) {
    improvements.push({
      type: 'description_optimization',
      currentValue: optimized.description.original.substring(0, 100) + '...',
      impact: 0.15,
      priority: 'high',
      suggestedValue: optimized.description.optimized.substring(0, 100) + '...',
    });
    scoreImprovement += 0.15;
  }

  // Structured data
  if (structuredData) {
    improvements.push({
      type: 'add_structured_data',
      currentValue: null,
      impact: 0.1,
      priority: 'medium',
      suggestedValue: 'Product, Breadcrumb, FAQ schemas',
    });
    scoreImprovement += 0.1;
  }

  // Competitor gaps
  if (competitors?.competitors?.gaps?.length > 0) {
    improvements.push({
      type: 'address_content_gaps',
      currentValue: null,
      impact: 0.05 * competitors.competitors.gaps.length,
      priority: 'medium',
      suggestedValue: competitors.competitors.gaps,
    });
    scoreImprovement += 0.05 * competitors.competitors.gaps.length;
  }

  // Readability improvements
  if (analysis.analysis.readability.gradeLevel > 10) {
    improvements.push({
      type: 'improve_readability',
      currentValue: `Grade level: ${analysis.analysis.readability.gradeLevel}`,
      impact: 0.05,
      priority: 'low',
      suggestedValue: 'Grade level: 8-9',
    });
    scoreImprovement += 0.05;
  }

  return {
    improvements,
    newScore: Math.min(1, analysis.analysis.score + scoreImprovement),
  };
}

// Step 7: Store SEO data
export const storeSEODataStep = compose(
  StepTemplates.database('store-seo-data', 'Store SEO analysis and optimizations'),
  (step: any) => withStepRetry(step, { maxRetries: 3 }),
);

// Step 8: Generate SEO report
export const generateSEOReportStep = createStep('generate-report', async (data: any) => {
  const { competitorData, copyAnalysis, improvements, keywordData, optimizedContent, products } =
    data;

  const report = {
    competitiveAnalysis: competitorData
      ? {
          commonGaps: getCommonGaps(competitorData),
          opportunities: getCommonOpportunities(competitorData),
        }
      : null,
    contentMetrics: {
      averageReadability:
        copyAnalysis.reduce((sum: number, a: any) => sum + a.analysis.readability.fleschScore, 0) /
        copyAnalysis.length,
      descriptionsOptimized: optimizedContent.filter((o: any) => o.description.score > 0.8).length,
      titlesOptimized: optimizedContent.filter((o: any) => o.title.score > 0.8).length,
    },
    keywordOpportunities: getKeywordOpportunities(keywordData),
    recommendations: generateSEORecommendations(data),
    reportId: `seo_analysis_${Date.now()}`,
    summary: {
      averageCurrentScore: data.averageScore,
      averageOptimizedScore:
        improvements.reduce((sum: number, i: any) => sum + i.optimizedScore, 0) /
        improvements.length,
      productsAnalyzed: products.length,
      totalImprovements: improvements.reduce(
        (sum: number, i: any) => sum + i.improvements.length,
        0,
      ),
    },
    timestamp: new Date().toISOString(),
    topImprovements: getTopImprovements(improvements),
  };

  return {
    ...data,
    analysisComplete: true,
    report,
  };
});

function getTopImprovements(improvements: any[]): any[] {
  const allImprovements = improvements.flatMap((i) =>
    i.improvements.map((imp: any) => ({
      productId: i.productId,
      ...imp,
    })),
  );

  return allImprovements.sort((a: any, b: any) => b.impact - a.impact).slice(0, 10);
}

function getKeywordOpportunities(keywordData: any[]): any[] {
  if (!keywordData || keywordData.length === 0) return [];

  const allKeywords = keywordData.flatMap((kd) =>
    kd.keywords.primary.filter((k: any) => k.volume > 5000 && k.difficulty < 50),
  );

  return allKeywords
    .sort((a: any, b: any) => b.volume - a.volume)
    .slice(0, 10)
    .map((k) => ({
      difficulty: k.difficulty,
      keyword: k.keyword,
      opportunity: 'high',
      volume: k.volume,
    }));
}

function getCommonGaps(competitorData: any[]): string[] {
  const gapCounts = new Map();

  competitorData.forEach((cd) => {
    cd.competitors?.gaps?.forEach((gap: string) => {
      gapCounts.set(gap, (gapCounts.get(gap) || 0) + 1);
    });
  });

  return Array.from(gapCounts.entries())
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5)
    .map(([gap]) => gap);
}

function getCommonOpportunities(competitorData: any[]): string[] {
  const oppCounts = new Map();

  competitorData.forEach((cd) => {
    cd.competitors?.opportunities?.forEach((opp: string) => {
      oppCounts.set(opp, (oppCounts.get(opp) || 0) + 1);
    });
  });

  return Array.from(oppCounts.entries())
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5)
    .map(([opp]) => opp);
}

function generateSEORecommendations(data: any): any[] {
  const recommendations = [];

  // Low average score
  if (data.averageScore < 0.6) {
    recommendations.push({
      type: 'overall_quality',
      action: 'implement_comprehensive_optimization',
      message: 'Overall SEO score is low across products',
      priority: 'high',
    });
  }

  // Missing structured data
  if (!data.analysisConfig.schemaGeneration) {
    recommendations.push({
      type: 'structured_data',
      action: 'enable_schema_generation',
      benefit: '10-15% improvement in rich snippets',
      message: 'Structured data generation is disabled',
      priority: 'medium',
    });
  }

  // Readability issues
  const avgReadability =
    data.copyAnalysis.reduce((sum: number, a: any) => sum + a.analysis.readability.gradeLevel, 0) /
    data.copyAnalysis.length;

  if (avgReadability > 10) {
    recommendations.push({
      type: 'readability',
      action: 'simplify_product_descriptions',
      message: `Average reading level is grade ${avgReadability.toFixed(1)}`,
      priority: 'medium',
      target: 'Grade 8-9 reading level',
    });
  }

  // Competitor analysis disabled
  if (!data.analysisConfig.competitorAnalysis) {
    recommendations.push({
      type: 'competitive_intelligence',
      action: 'enable_competitor_analysis',
      benefit: 'Identify content gaps and opportunities',
      message: 'Competitor analysis is disabled',
      priority: 'low',
    });
  }

  return recommendations;
}

// Main workflow definition
export const productCopySEOAnalysisWorkflow = {
  id: 'product-copy-seo-analysis',
  name: 'Product Copy SEO Analysis',
  config: {
    concurrency: {
      max: 3, // Limit concurrent analysis jobs
    },
    maxDuration: 7200000, // 2 hours
    schedule: {
      cron: '0 4 * * 1', // Weekly on Monday at 4 AM
      timezone: 'UTC',
    },
  },
  description: 'Analyze product copy for SEO optimization and data generation',
  features: {
    aiOptimization: true,
    competitorAnalysis: true,
    keywordResearch: true,
    readabilityAnalysis: true,
    structuredData: true,
  },
  steps: [
    analyzeCurrentCopyStep,
    performKeywordResearchStep,
    analyzeCompetitorsStep,
    optimizeContentStep,
    generateStructuredDataStep,
    calculateImprovementsStep,
    storeSEODataStep,
    generateSEOReportStep,
  ],
  version: '1.0.0',
};
