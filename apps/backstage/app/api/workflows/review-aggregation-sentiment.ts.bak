/**
 * Review Aggregation & Sentiment Analysis Workflow
 * Collect and analyze product reviews across merchants to derive insights
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  createWorkflowStep,
  StepTemplates,
  withStepBulkhead,
  withStepMonitoring,
  withStepTimeout,
} from '@repo/orchestration';

// Input schemas
const ReviewAggregationInput = z.object({
  aggregationConfig: z.object({
    deduplication: z.boolean().default(true),
    includeUnverified: z.boolean().default(false),
    languages: z.array(z.string()).default(['en']),
    minimumReviews: z.number().default(5),
    qualityThreshold: z.number().min(0).max(1).default(0.7),
  }),
  analysisConfig: z.object({
    identifyTrends: z.boolean().default(true),
    alertOnIssues: z.boolean().default(true),
    compareCompetitors: z.boolean().default(true),
    extractInsights: z.boolean().default(true),
    generateSummaries: z.boolean().default(true),
  }),
  scope: z.object({
    all: z.boolean().default(false),
    categories: z.array(z.string()).optional(),
    merchants: z.array(z.string()).optional(),
    products: z.array(z.string()).optional(),
    timeRange: z
      .object({
        end: z.string().datetime(),
        start: z.string().datetime(),
      })
      .optional(),
  }),
  sentimentConfig: z.object({
    confidence: z.number().min(0).max(1).default(0.8),
    aspects: z
      .array(
        z.enum([
          'overall',
          'quality',
          'value',
          'shipping',
          'customer-service',
          'packaging',
          'features',
        ]),
      )
      .default(['overall', 'quality', 'value']),
    emotions: z.boolean().default(true),
    model: z.enum(['rule-based', 'ml-basic', 'ml-advanced', 'llm']).default('ml-advanced'),
    topics: z.boolean().default(true),
  }),
  sources: z
    .array(
      z.enum(['merchant-api', 'web-scraping', 'third-party', 'direct-submission', 'social-media']),
    )
    .default(['merchant-api']),
});

// Review schema
const Review = z.object({
  author: z.object({
    id: z.string().optional(),
    name: z.string(),
    location: z.string().optional(),
    verified: z.boolean(),
  }),
  content: z.string(),
  date: z.string().datetime(),
  helpfulVotes: z.number().default(0),
  images: z.array(z.string()).optional(),
  merchantId: z.string(),
  merchantResponse: z
    .object({
      content: z.string(),
      date: z.string().datetime(),
    })
    .optional(),
  metadata: z.object({
    deviceType: z.string().optional(),
    language: z.string(),
    platform: z.string(),
    purchaseVerified: z.boolean(),
  }),
  productId: z.string(),
  rating: z.number().min(1).max(5),
  reviewId: z.string(),
  source: z.string(),
  title: z.string().optional(),
  totalVotes: z.number().default(0),
});

// Sentiment analysis result schema
const SentimentAnalysis = z.object({
  aspects: z.record(
    z.object({
      mentions: z.array(z.string()),
      score: z.number().min(-1).max(1),
      sentiment: z.enum(['positive', 'neutral', 'negative']),
    }),
  ),
  emotions: z
    .object({
      anger: z.number(),
      anticipation: z.number(),
      disgust: z.number(),
      fear: z.number(),
      joy: z.number(),
      sadness: z.number(),
      surprise: z.number(),
      trust: z.number(),
    })
    .optional(),
  keywords: z.array(
    z.object({
      frequency: z.number(),
      sentiment: z.enum(['positive', 'neutral', 'negative']),
      word: z.string(),
    }),
  ),
  overall: z.object({
    confidence: z.number().min(0).max(1),
    score: z.number().min(-1).max(1),
    sentiment: z.enum(['positive', 'neutral', 'negative']),
  }),
  reviewId: z.string(),
  topics: z
    .array(
      z.object({
        relevance: z.number(),
        sentiment: z.enum(['positive', 'neutral', 'negative']),
        topic: z.string(),
      }),
    )
    .optional(),
});

// Step factory for sentiment analysis
const sentimentAnalyzerFactory = createWorkflowStep(
  {
    name: 'Sentiment Analyzer',
    category: 'ml',
    tags: ['nlp', 'sentiment', 'text-analysis'],
    version: '1.0.0',
  },
  async (context) => {
    const { config, reviews } = context.input;
    const analyzedReviews = [];

    for (const review of reviews) {
      const analysis = await analyzeSentiment(review, config);
      analyzedReviews.push(analysis);
    }

    return analyzedReviews;
  },
);

// Mock sentiment analysis
async function analyzeSentiment(review: any, config: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  const text = review.content.toLowerCase();

  // Overall sentiment based on rating and text
  let sentimentScore = (review.rating - 3) / 2; // Convert 1-5 to -1 to 1

  // Adjust based on text analysis
  const positiveWords = ['great', 'excellent', 'amazing', 'love', 'perfect', 'best', 'fantastic'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'poor', 'disappointed'];

  positiveWords.forEach((word) => {
    if (text.includes(word)) sentimentScore += 0.1;
  });

  negativeWords.forEach((word) => {
    if (text.includes(word)) sentimentScore -= 0.1;
  });

  sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

  // Aspect-based sentiment
  const aspects = {};
  if (config.aspects.includes('quality')) {
    aspects[('quality' as any)] = analyzeAspect(text, ['quality', 'build', 'material', 'durable']);
  }
  if (config.aspects.includes('value')) {
    aspects[('value' as any)] = analyzeAspect(text, [
      'price',
      'value',
      'worth',
      'money',
      'expensive',
      'cheap',
    ]);
  }
  if (config.aspects.includes('shipping')) {
    aspects[('shipping' as any)] = analyzeAspect(text, ['shipping', 'delivery', 'arrived', 'package']);
  }

  // Emotions
  const emotions = config.emotions ? analyzeEmotions(text) : undefined;

  // Topics
  const topics = config.topics ? extractTopics(text) : undefined;

  // Keywords
  const keywords = extractKeywords(text);

  return {
    aspects,
    emotions,
    keywords,
    overall: {
      confidence: 0.8 + Math.random() * 0.2,
      score: sentimentScore,
      sentiment: sentimentScore > 0.2 ? 'positive' : sentimentScore < -0.2 ? 'negative' : 'neutral',
    },
    reviewId: review.reviewId,
    topics,
  };
}

function analyzeAspect(text: string, keywords: string[]): any {
  const mentions = keywords.filter((keyword) => text.includes(keyword));

  if (mentions.length === 0) return null;

  // Simulate aspect sentiment
  const score = -0.5 + Math.random();

  return {
    mentions,
    score,
    sentiment: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral',
  };
}

function analyzeEmotions(text: string): any {
  // Simulate emotion detection
  return {
    anger: Math.random() * 0.2,
    anticipation: Math.random() * 0.4,
    disgust: Math.random() * 0.1,
    fear: Math.random() * 0.2,
    joy: Math.random() * 0.5,
    sadness: Math.random() * 0.2,
    surprise: Math.random() * 0.3,
    trust: Math.random() * 0.5,
  };
}

function extractTopics(text: string): any[] {
  // Simulate topic extraction
  const topics = [
    'product quality',
    'customer service',
    'packaging',
    'delivery time',
    'value for money',
  ];

  return topics
    .filter(() => Math.random() > 0.6)
    .map((topic) => ({
      relevance: Math.random(),
      sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any,
      topic,
    }));
}

function extractKeywords(text: string): any[] {
  const words = text
    .split(/\s+/)
    .filter((word) => word.length > 4)
    .reduce(
      (acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  return Object.entries(words)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, frequency]) => ({
      frequency,
      sentiment: Math.random() > 0.5 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative',
      word,
    }));
}

// Step 1: Collect reviews from sources
export const collectReviewsStep = compose(
  createStepWithValidation(
    'collect-reviews',
    async (input: z.infer<typeof ReviewAggregationInput>) => {
      const { scope, sources } = input;

      const reviews: any[] = [];

      // Collect from different sources
      for (const source of sources) {
        const sourceReviews = await collectFromSource(source, scope);
        reviews.push(...sourceReviews);
      }

      // Remove duplicates if any
      const uniqueReviews = Array.from(new Map(reviews.map((r) => [r.reviewId, r])).values());

      return {
        ...input,
        collectedReviews: uniqueReviews,
        collectionStarted: new Date().toISOString(),
        sourceBreakdown: sources.map((source) => ({
          count: reviews.filter((r) => r.source === source).length,
          source,
        })),
        totalReviews: uniqueReviews.length,
      };
    },
    (input) =>
      input.scope.all ||
      input.scope.products?.length > 0 ||
      input.scope.merchants?.length > 0 ||
      input.scope.categories?.length > 0,
    (output) => output.collectedReviews.length > 0,
  ),
  (step) => withStepTimeout(step, { execution: 300000 }), // 5 minutes
  (step) =>
    withStepMonitoring(step, {
, 'sourceCount'],
      enableDetailedLogging: true,
    }),
);

// Mock review collection
async function collectFromSource(source: string, scope: any): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const count = Math.floor(Math.random() * 500) + 100;
  const reviews = [];

  for (let i = 0; i < count; i++) {
    reviews.push({
      author: {
        id: `user_${i}`,
        name: `User ${i}`,
        location: ['USA', 'UK', 'Canada', 'Australia'][Math.floor(Math.random() * 4)],
        verified: Math.random() > 0.3,
      },
      content: generateMockReviewContent(i),
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      helpfulVotes: Math.floor(Math.random() * 100),
      images: Math.random() > 0.7 ? [`https://example.com/review_${i}_1.jpg`] : undefined,
      merchantId: `merchant_${Math.floor(Math.random() * 10)}`,
      merchantResponse:
        Math.random() > 0.8
          ? {
              content: 'Thank you for your feedback!',
              date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            }
          : undefined,
      metadata: {
        deviceType: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
        language: 'en',
        platform: source,
        purchaseVerified: Math.random() > 0.4,
      },
      productId: `prod_${Math.floor(Math.random() * 100)}`,
      rating: Math.floor(Math.random() * 5) + 1,
      reviewId: `${source}_review_${i}`,
      source,
      title: `Review Title ${i}`,
      totalVotes: Math.floor(Math.random() * 150),
    });
  }

  return reviews;
}

function generateMockReviewContent(index: number): string {
  const templates = [
    'Great product! Exactly what I was looking for. The quality is excellent and shipping was fast.',
    'Disappointed with this purchase. The product quality is poor and it broke after a week.',
    'Good value for money. Works as described but could be better quality.',
    'Amazing! Best purchase I have made. Highly recommend to everyone.',
    'Terrible experience. Product arrived damaged and customer service was unhelpful.',
    'Decent product but overpriced. You can find better alternatives for less money.',
    'Love it! Using it every day and very satisfied with the quality and features.',
    'Not worth the money. Many issues and does not match the description.',
  ];

  return templates[index % templates.length];
}

// Step 2: Filter and validate reviews
export const filterValidateReviewsStep = createStep('filter-validate', async (data: any) => {
  const { aggregationConfig, collectedReviews } = data;

  const validatedReviews = [];
  const invalidReviews = [];
  const duplicates = [];

  // Group reviews by product for deduplication
  const reviewsByProduct = new Map();

  for (const review of collectedReviews) {
    // Quality checks
    const qualityScore = calculateReviewQuality(review);

    if (qualityScore < aggregationConfig.qualityThreshold) {
      invalidReviews.push({
        reason: 'Low quality score',
        review,
        score: qualityScore,
      });
      continue;
    }

    // Verified check
    if (!aggregationConfig.includeUnverified && !review.metadata.purchaseVerified) {
      invalidReviews.push({
        reason: 'Unverified purchase',
        review,
      });
      continue;
    }

    // Language check
    if (!aggregationConfig.languages.includes(review.metadata.language)) {
      invalidReviews.push({
        language: review.metadata.language,
        reason: 'Unsupported language',
        review,
      });
      continue;
    }

    // Deduplication
    if (aggregationConfig.deduplication) {
      const productReviews = reviewsByProduct.get(review.productId) || [];
      const isDuplicate = productReviews.some((r: any) => areSimilarReviews(r, review));

      if (isDuplicate) {
        duplicates.push(review);
        continue;
      }

      productReviews.push(review);
      reviewsByProduct.set(review.productId, productReviews);
    }

    validatedReviews.push(review);
  }

  return {
    ...data,
    invalidReviews,
    validatedReviews,
    validationStats: {
      invalid: invalidReviews.length,
      valid: validatedReviews.length,
      validationRate: validatedReviews.length / collectedReviews.length,
      duplicates: duplicates.length,
      total: collectedReviews.length,
    },
    duplicates,
  };
});

function calculateReviewQuality(review: any): number {
  let score = 0;
  let factors = 0;

  // Content length
  if (review.content.length > 50) score += 0.3;
  factors += 0.3;

  // Has title
  if (review.title) score += 0.1;
  factors += 0.1;

  // Verified purchase
  if (review.metadata.purchaseVerified) score += 0.2;
  factors += 0.2;

  // Helpful votes ratio
  if (review.totalVotes > 0) {
    const helpfulRatio = review.helpfulVotes / review.totalVotes;
    score += helpfulRatio * 0.2;
  }
  factors += 0.2;

  // Author verified
  if (review.author.verified) score += 0.1;
  factors += 0.1;

  // Has images
  if (review.images && review.images.length > 0) score += 0.1;
  factors += 0.1;

  return score / factors;
}

function areSimilarReviews(review1: any, review2: any): boolean {
  // Check if reviews are similar (potential duplicates)
  if (review1.author.id === review2.author.id) {
    // Same author, check content similarity
    const similarity = calculateTextSimilarity(review1.content, review2.content);
    return similarity > 0.8;
  }

  // Different authors but very similar content and same rating
  if (review1.rating === review2.rating) {
    const similarity = calculateTextSimilarity(review1.content, review2.content);
    return similarity > 0.9;
  }

  return false;
}

function calculateTextSimilarity(text1: string, text2: string): number {
  // Simple Jaccard similarity
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

// Step 3: Analyze sentiment
export const analyzeSentimentStep = compose(
  createStep('analyze-sentiment', async (data: any) => {
    const { validatedReviews, sentimentConfig } = data;

    // Process reviews in batches
    const batchSize = 100;
    const sentimentResults = [];

    for (let i = 0; i < validatedReviews.length; i += batchSize) {
      const batch = validatedReviews.slice(i, i + batchSize);

      const batchResults = await sentimentAnalyzerFactory.handler({
        input: {
          config: sentimentConfig,
          reviews: batch,
        },
      });

      sentimentResults.push(...batchResults);

      console.log(
        `Analyzed sentiment for ${Math.min(i + batchSize, validatedReviews.length)}/${validatedReviews.length} reviews`,
      );
    }

    // Calculate aggregate sentiment metrics
    const aggregateSentiment = calculateAggregateSentiment(sentimentResults);

    return {
      ...data,
      aggregateSentiment,
      sentimentAnalysisComplete: true,
      sentimentResults,
    };
  }),
  (step) =>
    withStepBulkhead(step, {
      maxConcurrent: 10,
      maxQueued: 50,
    }),
);

function calculateAggregateSentiment(sentimentResults: any[]): any {
  const totalReviews = sentimentResults.length;

  // Overall sentiment distribution
  const sentimentCounts = { negative: 0, neutral: 0, positive: 0 };
  let totalScore = 0;

  sentimentResults.forEach((result) => {
    sentimentCounts[(result.overall.sentiment as any)]++;
    totalScore += result.overall.score;
  });

  // Aspect aggregation
  const aspectAggregates = {};
  const aspectCounts = {};

  sentimentResults.forEach((result) => {
    Object.entries(result.aspects || {}).forEach(([aspect, data]: [string, any]) => {
      if (!data) return;

      if (!aspectAggregates[(aspect as any)]) {
        aspectAggregates[(aspect as any)] = { negative: 0, neutral: 0, positive: 0, totalScore: 0 };
        aspectCounts[(aspect as any)] = 0;
      }

      aspectAggregates[(aspect as any)][data.sentiment]++;
      aspectAggregates[(aspect as any)].totalScore += data.score;
      aspectCounts[(aspect as any)]++;
    });
  });

  // Calculate aspect averages
  const aspectSummary = {};
  Object.entries(aspectAggregates).forEach(([aspect, data]: [string, any]) => {
    aspectSummary[(aspect as any)] = {
      averageScore: data.totalScore / aspectCounts[(aspect as any)],
      distribution: {
        negative: data.negative / aspectCounts[(aspect as any)],
        neutral: data.neutral / aspectCounts[(aspect as any)],
        positive: data.positive / aspectCounts[(aspect as any)],
      },
      mentionCount: aspectCounts[(aspect as any)],
    };
  });

  // Emotion aggregation
  const emotionAverages = {};
  let emotionCount = 0;

  sentimentResults.forEach((result) => {
    if (result.emotions) {
      emotionCount++;
      Object.entries(result.emotions).forEach(([emotion, value]) => {
        emotionAverages[((emotion as any) as any)] = (emotionAverages[emotion] || 0) + value;
      });
    }
  });

  if (emotionCount > 0) {
    Object.keys(emotionAverages).forEach((emotion) => {
      emotionAverages[(emotion as any)] /= emotionCount;
    });
  }

  return {
    confidence: sentimentResults.reduce((sum, r) => sum + r.overall.confidence, 0) / totalReviews,
    aspects: aspectSummary,
    emotions: emotionAverages,
    overall: {
      averageScore: totalScore / totalReviews,
      distribution: {
        negative: sentimentCounts.negative / totalReviews,
        neutral: sentimentCounts.neutral / totalReviews,
        positive: sentimentCounts.positive / totalReviews,
      },
      dominantSentiment: Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0][0],
    },
  };
}

// Step 4: Extract topics and themes
export const extractTopicsThemesStep = createStep('extract-topics', async (data: any) => {
  const { validatedReviews, sentimentResults } = data;

  // Extract topics from all reviews
  const allTopics = new Map();
  const themePatterns = new Map();

  sentimentResults.forEach((resul: anyt: any: any, inde: anyx: any: any) => {
    const review = validatedReviews[index];

    // Aggregate topics
    if (result.topics) {
      result.topics.forEach((topic: any) => {
        const key = topic.topic;
        if (!allTopics.has(key)) {
          allTopics.set(key, {
            examples: [],
            mentions: 0,
            products: new Set(),
            sentimentCounts: { negative: 0, neutral: 0, positive: 0 },
            topic: key,
          });
        }

        const topicData = allTopics.get(key);
        topicData.mentions++;
        topicData.sentimentCounts[topic.sentiment]++;
        topicData.products.add(review.productId);

        if (topicData.examples.length < 5) {
          topicData.examples.push({
            excerpt: review.content.substring(0, 200),
            reviewId: review.reviewId,
            sentiment: topic.sentiment,
          });
        }
      });
    }

    // Extract themes and patterns
    const themes = extractThemes(review.content);
    themes.forEach((theme) => {
      if (!themePatterns.has(theme)) {
        themePatterns.set(theme, {
          associatedTopics: new Set(),
          frequency: 0,
          sentiment: { negative: 0, neutral: 0, positive: 0 },
          theme,
        });
      }

      const themeData = themePatterns.get(theme);
      themeData.frequency++;
      themeData.sentiment[result.overall.sentiment]++;

      if (result.topics) {
        result.topics.forEach((topic: any) => {
          themeData.associatedTopics.add(topic.topic);
        });
      }
    });
  });

  // Convert to arrays and sort by frequency
  const topTopics = Array.from(allTopics.values())
    .map((topic) => ({
      ...topic,
      dominantSentiment: (Object as any).entries((topic as any).sentimentCounts).sort((a, b) => b[1] - a[1])[0][0],
      products: Array.from(topic.products),
    }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 20);

  const topThemes = Array.from(themePatterns.values())
    .map((theme) => ({
      ...theme,
      associatedTopics: Array.from(theme.associatedTopics),
      sentimentDistribution: {
        negative: theme.sentiment.negative / theme.frequency,
        neutral: theme.sentiment.neutral / theme.frequency,
        positive: theme.sentiment.positive / theme.frequency,
      },
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 15);

  return {
    ...data,
    topicAnalysis: {
      topThemes,
      topTopics,
      totalUniqueThemes: themePatterns.size,
      totalUniqueTopics: allTopics.size,
    },
    topicsExtracted: true,
  };
});

function extractThemes(text: string): string[] {
  // Simulate theme extraction
  const themes: any[] = [];

  const themePatterns = {
    customer_support: /support|service|help|response/i,
    durability: /durable|lasting|sturdy|solid|reliable/i,
    packaging: /packaging|box|wrapped|presentation/i,
    product_features: /feature|function|design|easy to use/i,
    quality_issues: /quality|defect|broken|faulty|poor/i,
    shipping_experience: /shipping|delivery|package|arrived/i,
    sizing: /size|fit|too small|too large|perfect fit/i,
    value_proposition: /value|price|worth|expensive|cheap/i,
  };

  Object.entries(themePatterns).forEach(([theme, pattern]) => {
    if (pattern.test(text)) {
      themes.push(theme);
    }
  });

  return themes;
}

// Step 5: Generate summaries and insights
export const generateSummariesInsightsStep = createStep('generate-summaries', async (data: any) => {
  const { validatedReviews, aggregateSentiment, analysisConfig, sentimentResults, topicAnalysis } =
    data;

  const summaries = {};
  const insights = [];

  if (analysisConfig.generateSummaries) {
    // Group reviews by product
    const reviewsByProduct = new Map();
    validatedReviews.forEach((review: any, index: number) => {
      if (!reviewsByProduct.has(review.productId)) {
        reviewsByProduct.set(review.productId, []);
      }
      reviewsByProduct.get(review.productId).push({
        review,
        sentiment: sentimentResults[index],
      });
    });

    // Generate product summaries
    for (const [productId, productReviews] of reviewsByProduct) {
      if (productReviews.length >= data.aggregationConfig.minimumReviews) {
        summaries[(productId as any)] = generateProductSummary(productId, productReviews);
      }
    }
  }

  if (analysisConfig.extractInsights) {
    insights.push(...extractKeyInsights(data));
  }

  return {
    ...data,
    keyInsights: insights,
    productSummaries: summaries,
    summariesGenerated: true,
  };
});

function generateProductSummary(productId: string, reviews: any[]): any {
  // Calculate product-specific metrics
  const totalReviews = reviews.length;
  const ratings = reviews.map((r) => r.review.rating);
  const avgRating = ratings.reduce((sum, r) => sum + r, 0) / totalReviews;

  // Sentiment breakdown
  const sentiments = { negative: 0, neutral: 0, positive: 0 };
  reviews.forEach((r) => {
    sentiments[(r.sentiment.overall.sentiment as any)]++;
  });

  // Common positive and negative points
  const positivePoints: any[] = [];
  const negativePoints: any[] = [];

  reviews.forEach((r) => {
    if (r.sentiment.overall.sentiment === 'positive') {
      r.sentiment.keywords.slice(0, 3).forEach((kw: any) => {
        if (kw.sentiment === 'positive') positivePoints.push(kw.word);
      });
    } else if (r.sentiment.overall.sentiment === 'negative') {
      r.sentiment.keywords.slice(0, 3).forEach((kw: any) => {
        if (kw.sentiment === 'negative') negativePoints.push(kw.word);
      });
    }
  });

  // Count frequencies
  const positiveCounts = countFrequencies(positivePoints);
  const negativeCounts = countFrequencies(negativePoints);

  return {
    averageRating,
    highlights: {
      negative: Object.entries(negativeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([point, count]) => ({ frequency: count, point })),
      positive: Object.entries(positiveCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([point, count]) => ({ frequency: count, point })),
    },
    productId,
    recommendationRate: reviews.filter((r) => r.review.rating >= 4).length / totalReviews,
    reviewCount: totalReviews,
    sentimentDistribution: {
      negative: sentiments.negative / totalReviews,
      neutral: sentiments.neutral / totalReviews,
      positive: sentiments.positive / totalReviews,
    },
    verifiedPurchaseRate:
      reviews.filter((r) => r.review.metadata.purchaseVerified).length / totalReviews,
  };
}

function countFrequencies(items: string[]): Record<string, number> {
  return items.reduce(
    (acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

function extractKeyInsights(data: any): any[] {
  const insights = [];

  // Overall sentiment insight
  const sentiment = data.aggregateSentiment.overall;
  if (sentiment.distribution.negative > 0.3) {
    insights.push({
      type: 'sentiment_alert',
      description: `${(sentiment.distribution.negative * 100).toFixed(1)}% of reviews are negative`,
      recommendation: 'Investigate common complaints and address product/service issues',
      severity: 'high',
      title: 'High Negative Sentiment',
    });
  }

  // Topic insights
  const negativeTopics = data.topicAnalysis.topTopics.filter(
    (t: any) => t.dominantSentiment === 'negative' && t.mentions > 20,
  );

  if (negativeTopics.length > 0) {
    insights.push({
      type: 'topic_issue',
      description: `Topics with negative sentiment: ${negativeTopics.map((t: any) => t.topic).join(', ')}`,
      recommendation: 'Address these specific issues in product improvements',
      severity: 'medium',
      title: 'Recurring Negative Topics',
    });
  }

  // Trend insights
  const recentReviews = data.validatedReviews.filter(
    (r: any) => new Date(r.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  );

  if (recentReviews.length > 50) {
    const recentSentiment = calculateRecentSentimentTrend(recentReviews, data.sentimentResults);
    if (recentSentiment.trend === 'declining') {
      insights.push({
        type: 'trend_alert',
        description: 'Recent reviews show declining customer satisfaction',
        recommendation: 'Immediate attention required to reverse negative trend',
        severity: 'high',
        title: 'Declining Sentiment Trend',
      });
    }
  }

  // Quality insights
  const lowQualityProducts = Object.entries(data.productSummaries)
    .filter(([_, summary]: [string, any]) => summary.averageRating < 3)
    .map(([productId]) => productId);

  if (lowQualityProducts.length > 0) {
    insights.push({
      type: 'product_quality',
      affectedProducts: lowQualityProducts,
      description: `${lowQualityProducts.length} products have average rating below 3.0`,
      recommendation: 'Consider removing or improving these products',
      severity: 'high',
      title: 'Low-Rated Products',
    });
  }

  return insights;
}

function calculateRecentSentimentTrend(recentReviews: any[], allSentiments: any[]): any {
  // Simplified trend calculation
  const trend = Math.random() > 0.7 ? 'declining' : Math.random() > 0.5 ? 'improving' : 'stable';

  return {
    confidence: 0.7 + Math.random() * 0.3,
    trend,
  };
}

// Step 6: Identify patterns and trends
export const identifyPatternsTrendsStep = createStep('identify-patterns', async (data: any) => {
  const { validatedReviews, analysisConfig, sentimentResults, topicAnalysis } = data;

  if (!analysisConfig.identifyTrends) {
    return {
      ...data,
      trendsSkipped: true,
    };
  }

  // Time-based analysis
  const timeSeriesData = generateTimeSeriesData(validatedReviews, sentimentResults);

  // Seasonal patterns
  const seasonalPatterns = analyzeSeasonalPatterns(timeSeriesData);

  // Rating distribution trends
  const ratingTrends = analyzeRatingTrends(validatedReviews);

  // Topic evolution
  const topicEvolution = analyzeTopicEvolution(validatedReviews, sentimentResults);

  // Merchant patterns
  const merchantPatterns = analyzeMerchantPatterns(validatedReviews, sentimentResults);

  return {
    ...data,
    trendAnalysis: {
      merchants: merchantPatterns,
      ratings: ratingTrends,
      seasonal: seasonalPatterns,
      timeSeries: timeSeriesData,
      topics: topicEvolution,
    },
    trendsIdentified: true,
  };
});

function generateTimeSeriesData(reviews: any[], sentiments: any[]): any {
  // Group by week
  const weeklyData = new Map();

  reviews.forEach((review, index) => {
    const weekStart = getWeekStart(new Date(review.date));
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, {
        avgRating: 0,
        ratings: [],
        reviews: 0,
        sentiment: { negative: 0, neutral: 0, positive: 0 },
        week: weekKey,
      });
    }

    const weekData = weeklyData.get(weekKey);
    weekData.reviews++;
    weekData.ratings.push(review.rating);
    weekData.sentiment[sentiments[index].overall.sentiment]++;
  });

  // Calculate averages
  const timeSeries = Array.from(weeklyData.values()).map((week) => ({
    ...week,
    avgRating: week.ratings.reduce((sum: number, r: number) => sum + r, 0) / week.ratings.length,
    sentimentDistribution: {
      negative: week.sentiment.negative / week.reviews,
      neutral: week.sentiment.neutral / week.reviews,
      positive: week.sentiment.positive / week.reviews,
    },
  }));

  return timeSeries.sort((a, b) => a.week.localeCompare(b.week));
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function analyzeSeasonalPatterns(timeSeriesData: any[]): any {
  // Simulate seasonal pattern detection
  return {
    hasSeasonality: true,
    patterns: [
      {
        averageRatingLift: 0.3,
        description: 'Holiday shopping season',
        impact: 'Increased review volume and higher ratings',
        period: 'Q4',
      },
      {
        description: 'Summer vacation period',
        impact: 'Lower review volume but more detailed reviews',
        period: 'Summer',
        volumeChange: -0.2,
      },
    ],
  };
}

function analyzeRatingTrends(reviews: any[]): any {
  // Sort reviews by date
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Calculate moving average
  const movingAverage = [];
  const window = 100;

  for (let i = window; i < sortedReviews.length; i++) {
    const windowReviews = sortedReviews.slice(i - window, i);
    const avgRating = windowReviews.reduce((sum, r) => sum + r.rating, 0) / window;
    movingAverage.push({
      date: sortedReviews[i].date,
      index: i,
      movingAverage: avgRating,
    });
  }

  // Determine trend
  const recentAvg = movingAverage.slice(-10).reduce((sum, ma) => sum + ma.movingAverage, 0) / 10;
  const historicalAvg =
    movingAverage.slice(0, 10).reduce((sum, ma) => sum + ma.movingAverage, 0) / 10;

  return {
    historicalAverage: historicalAvg,
    overallTrend:
      recentAvg > historicalAvg ? 'improving' : recentAvg < historicalAvg ? 'declining' : 'stable',
    recentAverage: recentAvg,
    volatility: calculateVolatility(movingAverage.map((ma) => ma.movingAverage)),
  };
}

function calculateVolatility(values: number[]): number {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function analyzeTopicEvolution(reviews: any[], sentiments: any[]): any {
  // Simulate topic evolution analysis
  return {
    decliningTopics: [
      {
        currentFrequency: 0.03,
        declineRate: -0.1,
        peakDate: '2023-11-15',
        topic: 'packaging_waste',
      },
    ],
    emergingTopics: [
      {
        currentFrequency: 0.08,
        firstMention: '2024-01-15',
        growthRate: 0.25,
        topic: 'sustainability',
      },
      {
        currentFrequency: 0.12,
        firstMention: '2024-02-01',
        growthRate: 0.15,
        topic: 'fast_shipping',
      },
    ],
  };
}

function analyzeMerchantPatterns(reviews: any[], sentiments: any[]): any {
  // Group by merchant
  const merchantStats = new Map();

  reviews.forEach((review, index) => {
    if (!merchantStats.has(review.merchantId)) {
      merchantStats.set(review.merchantId, {
        merchantId: review.merchantId,
        ratings: [],
        reviews: 0,
        sentiments: { negative: 0, neutral: 0, positive: 0 },
      });
    }

    const stats = merchantStats.get(review.merchantId);
    stats.reviews++;
    stats.ratings.push(review.rating);
    stats.sentiments[sentiments[index].overall.sentiment]++;
  });

  // Calculate merchant metrics
  const merchantAnalysis = Array.from(merchantStats.values()).map((stats) => ({
    averageRating: stats.ratings.reduce((su: anym: any: any, r: any: any) => sum + r, 0) / stats.ratings.length,
    merchantId: stats.merchantId,
    reviewCount: stats.reviews,
    sentimentScore: (stats.sentiments.positive - stats.sentiments.negative) / stats.reviews,
  }));

  return {
    bottomPerformers: merchantAnalysis
      .sort((a, b) => a.averageRating - b.averageRating)
      .slice(0, 5),
    mostReviewed: merchantAnalysis.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5),
    topPerformers: merchantAnalysis.sort((a, b) => b.averageRating - a.averageRating).slice(0, 5),
  };
}

// Step 7: Compare with competitors
export const compareCompetitorsStep = createStep('compare-competitors', async (data: any) => {
  const { aggregateSentiment, analysisConfig, productSummaries } = data;

  if (!analysisConfig.compareCompetitors) {
    return {
      ...data,
      competitorComparisonSkipped: true,
    };
  }

  // Fetch competitor data (mock)
  const competitorData = await fetchCompetitorReviewData();

  // Compare metrics
  const comparison = {
    byAspect: compareAspects(aggregateSentiment.aspects, competitorData.aspects),
    opportunities: identifyOpportunities(aggregateSentiment, competitorData),
    overall: {
      competitorAverage: competitorData.averageScore,
      difference: aggregateSentiment.overall.averageScore - competitorData.averageScore,
      ourScore: aggregateSentiment.overall.averageScore,
      position:
        aggregateSentiment.overall.averageScore > competitorData.averageScore ? 'above' : 'below',
    },
    strengths: identifyStrengths(aggregateSentiment, competitorData),
    weaknesses: identifyWeaknesses(aggregateSentiment, competitorData),
  };

  return {
    ...data,
    competitorAnalysisComplete: true,
    competitorComparison: comparison,
  };
});

async function fetchCompetitorReviewData(): Promise<any> {
  // Mock competitor data
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    aspects: {
      quality: { averageScore: 0.3 + Math.random() * 0.4 },
      shipping: { averageScore: 0.4 + Math.random() * 0.3 },
      value: { averageScore: 0.2 + Math.random() * 0.4 },
    },
    averageScore: 0.2 + Math.random() * 0.3,
    reviewCount: 5000 + Math.floor(Math.random() * 10000),
  };
}

function compareAspects(ourAspects: any, competitorAspects: any): any {
  const comparison = {};

  Object.keys(ourAspects).forEach((aspect) => {
    if (competitorAspects[aspect]) {
      comparison[(aspect as any)] = {
        advantage: ourAspects[aspect].averageScore - competitorAspects[aspect].averageScore,
        competitorScore: competitorAspects[aspect].averageScore,
        ourScore: ourAspects[aspect].averageScore,
      };
    }
  });

  return comparison;
}

function identifyStrengths(ourData: any, competitorData: any): string[] {
  const strengths = [];

  if (ourData.overall.averageScore > competitorData.averageScore + 0.1) {
    strengths.push('Overall customer satisfaction significantly higher than competitors');
  }

  Object.entries(ourData.aspects).forEach(([aspect, data]: [string, any]) => {
    if (
      competitorData.aspects[aspect] &&
      data.averageScore > competitorData.aspects[aspect].averageScore + 0.15
    ) {
      strengths.push(`Superior performance in ${aspect}`);
    }
  });

  return strengths;
}

function identifyWeaknesses(ourData: any, competitorData: any): string[] {
  const weaknesses = [];

  if (ourData.overall.averageScore < competitorData.averageScore - 0.1) {
    weaknesses.push('Overall customer satisfaction below competitor average');
  }

  Object.entries(ourData.aspects).forEach(([aspect, data]: [string, any]) => {
    if (
      competitorData.aspects[aspect] &&
      data.averageScore < competitorData.aspects[aspect].averageScore - 0.15
    ) {
      weaknesses.push(`Underperforming in ${aspect}`);
    }
  });

  return weaknesses;
}

function identifyOpportunities(ourData: any, competitorData: any): string[] {
  const opportunities = [];

  // Areas where competitors are weak
  Object.entries(competitorData.aspects).forEach(([aspect, data]: [string, any]) => {
    if (data.averageScore < 0.3) {
      opportunities.push(`Market opportunity in ${aspect} - competitors performing poorly`);
    }
  });

  // Untapped aspects
  const ourAspects = new Set(Object.keys(ourData.aspects));
  const competitorAspects = new Set(Object.keys(competitorData.aspects));
  const uniqueAspects = [...ourAspects].filter((a) => !competitorAspects.has(a));

  if (uniqueAspects.length > 0) {
    opportunities.push(`Differentiation opportunity in: ${uniqueAspects.join(', ')}`);
  }

  return opportunities;
}

// Step 8: Generate alerts and notifications
export const generateAlertsStep = createStep('generate-alerts', async (data: any) => {
  const { analysisConfig, competitorComparison, keyInsights, trendAnalysis } = data;

  if (!analysisConfig.alertOnIssues) {
    return {
      ...data,
      alertsSkipped: true,
    };
  }

  const alerts = [];

  // Critical sentiment alerts
  keyInsights.forEach((insight: any) => {
    if (insight.severity === 'high') {
      alerts.push({
        type: 'critical',
        action: insight.recommendation,
        category: insight.type,
        description: insight.description,
        requiresAcknowledgment: true,
        timestamp: new Date().toISOString(),
        title: insight.title,
      });
    }
  });

  // Trend alerts
  if (trendAnalysis?.ratings?.overallTrend === 'declining') {
    alerts.push({
      type: 'warning',
      action: 'Review recent changes and customer feedback',
      category: 'trend',
      description: 'Customer ratings showing consistent decline',
      timestamp: new Date().toISOString(),
      title: 'Declining Rating Trend',
    });
  }

  // Competitor alerts
  if (competitorComparison?.overall?.position === 'below') {
    alerts.push({
      type: 'info',
      action: 'Analyze competitor strengths and improve weak areas',
      category: 'competitive',
      description: `Review scores ${Math.abs(competitorComparison.overall.difference * 100).toFixed(1)}% below competitors`,
      timestamp: new Date().toISOString(),
      title: 'Below Competitor Average',
    });
  }

  // Volume alerts
  const recentVolume = data.validatedReviews.filter(
    (r: any) => new Date(r.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  ).length;

  if (recentVolume < 10) {
    alerts.push({
      type: 'warning',
      action: 'Consider review solicitation campaigns',
      category: 'volume',
      description: 'Review volume significantly decreased in past week',
      timestamp: new Date().toISOString(),
      title: 'Low Review Volume',
    });
  }

  return {
    ...data,
    alerts,
    alertsGenerated: alerts.length,
  };
});

// Step 9: Store analysis results
export const storeAnalysisResultsStep = compose(
  StepTemplates.database('store-results', 'Store review analysis results and insights'),
  (step) =>
    withStepBulkhead(step, {
      maxConcurrent: 5,
      maxQueued: 20,
    }),
);

// Step 10: Generate comprehensive report
export const generateReviewReportStep = createStep('generate-report', async (data: any) => {
  const {
    validationStats,
    aggregateSentiment,
    alerts,
    competitorComparison,
    keyInsights,
    productSummaries,
    topicAnalysis,
    totalReviews,
    trendAnalysis,
  } = data;

  const report = {
    competitive: competitorComparison || {},
    insights: {
      alerts: alerts,
      key: keyInsights,
      topNegativeTopics: topicAnalysis.topTopics
        .filter((t: any) => t.dominantSentiment === 'negative')
        .slice(0, 5),
      topPositiveTopics: topicAnalysis.topTopics
        .filter((t: any) => t.dominantSentiment === 'positive')
        .slice(0, 5),
    },
    recommendations: generateActionableRecommendations(data),
    reportId: `review_analysis_${Date.now()}`,
    sentiment: {
      confidence: aggregateSentiment.confidence,
      byAspect: aggregateSentiment.aspects,
      distribution: aggregateSentiment.overall.distribution,
      emotions: aggregateSentiment.emotions,
    },
    summary: {
      validReviews: validationStats.valid,
      averageSentimentScore: aggregateSentiment.overall.averageScore,
      overallSentiment: aggregateSentiment.overall.dominantSentiment,
      productsCovered: Object.keys(productSummaries).length,
      timeRange: {
        end: data.scope.timeRange?.end || 'current',
        start: data.scope.timeRange?.start || 'all-time',
      },
      totalReviewsAnalyzed: totalReviews,
    },
    timestamp: new Date().toISOString(),
    topProducts: Object.entries(productSummaries)
      .sort((a, b) => b[1].averageRating - a[1].averageRating)
      .slice(0, 10)
      .map(([productId, summary]) => ({
        productId,
        rating: summary.averageRating,
        reviews: summary.reviewCount,
        sentiment: summary.sentimentDistribution,
      })),
    trends: trendAnalysis || {},
  };

  return {
    ...data,
    analysisComplete: true,
    report,
  };
});

function generateActionableRecommendations(data: any): any[] {
  const recommendations = [];

  // Based on sentiment
  if (data.aggregateSentiment.overall.distribution.negative > 0.25) {
    recommendations.push({
      action: 'Conduct quality audit on products with high negative sentiment',
      area: 'product_quality',
      expectedImpact: 'Reduce negative reviews by 30%',
      priority: 'high',
    });
  }

  // Based on topics
  const qualityIssues = data.topicAnalysis.topTopics.find(
    (t: any) => t.topic.includes('quality') && t.dominantSentiment === 'negative',
  );

  if (qualityIssues) {
    recommendations.push({
      action: 'Implement stricter quality control measures',
      area: 'quality_control',
      expectedImpact: 'Improve product quality scores',
      priority: 'high',
    });
  }

  // Based on competitor comparison
  if (data.competitorComparison?.weaknesses?.length > 0) {
    recommendations.push({
      action: `Focus on improving: ${data.competitorComparison.weaknesses.join(', ')}`,
      area: 'competitive_positioning',
      expectedImpact: 'Match or exceed competitor performance',
      priority: 'medium',
    });
  }

  // Based on trends
  if (data.trendAnalysis?.ratings?.volatility > 0.5) {
    recommendations.push({
      action: 'Standardize product quality and service delivery',
      area: 'consistency',
      expectedImpact: 'Reduce rating volatility by 40%',
      priority: 'medium',
    });
  }

  return recommendations;
}

// Main workflow definition
export const reviewAggregationSentimentWorkflow = {
  id: 'review-aggregation-sentiment',
  name: 'Review Aggregation & Sentiment Analysis',
  config: {
    concurrency: {
      max: 5, // Limit concurrent analysis jobs
    },
    maxDuration: 3600000, // 1 hour
    schedule: {
      cron: '0 2 * * *', // Daily at 2 AM
      timezone: 'UTC',
    },
  },
  description: 'Collect and analyze product reviews across merchants to derive insights',
  features: {
    alerting: true,
    competitorBenchmarking: true,
    sentimentAnalysis: true,
    topicModeling: true,
    trendDetection: true,
  },
  steps: [
    collectReviewsStep,
    filterValidateReviewsStep,
    analyzeSentimentStep,
    extractTopicsThemesStep,
    generateSummariesInsightsStep,
    identifyPatternsTrendsStep,
    compareCompetitorsStep,
    generateAlertsStep,
    storeAnalysisResultsStep,
    generateReviewReportStep,
  ],
  version: '1.0.0',
};
