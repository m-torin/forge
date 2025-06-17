/**
 * Analytics Vectorization Workflow
 * Vectorize production analytics events for user preference prediction
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from '@repo/orchestration/server/next';

// Type definitions (replace with actual imports when available)
type EmitterPagePayload = any;
type EmitterTrackPayload = any;

// Input schemas
const AnalyticsVectorizationInput = z.object({
  eventTypes: z
    .array(
      z.enum([
        'page_viewed',
        'product_viewed',
        'product_added',
        'product_removed',
        'cart_viewed',
        'checkout_started',
        'order_completed',
        'search_performed',
        'filter_applied',
        'wishlist_updated',
      ]),
    )
    .optional(),
  timeRange: z.object({
    end: z.string().datetime(),
    start: z.string().datetime(),
  }),
  userIds: z.array(z.string()).optional(), // Process specific users or all
  vectorizationConfig: z.object({
    aggregationWindow: z.enum(['session', 'daily', 'weekly']).default('session'),
    dimensions: z.number().default(768), // Vector dimensions
    includeMetadata: z.boolean().default(true),
    model: z.enum(['bert', 'sentence-transformer', 'custom']).default('sentence-transformer'),
  }),
});

// Step 1: Fetch analytics events from storage
export const fetchAnalyticsEventsStep = compose(
  createStepWithValidation(
    'fetch-analytics-events',
    async (input: z.infer<typeof AnalyticsVectorizationInput>) => {
      const { eventTypes, timeRange, userIds } = input;

      // Simulate fetching events from analytics storage
      const events: (EmitterTrackPayload | EmitterPagePayload)[] = [];
      const userCount = userIds?.length || 100;

      for (let i = 0; i < userCount; i++) {
        const userId = userIds?.[i] || `user_${i}`;
        const sessionEvents = Math.floor(Math.random() * 20) + 5;

        for (let j = 0; j < sessionEvents; j++) {
          const eventType =
            eventTypes?.[Math.floor(Math.random() * eventTypes.length)] ||
            ['product_viewed', 'page_viewed', 'search_performed'][Math.floor(Math.random() * 3)];

          if (eventType === 'page_viewed') {
            events.push({
              name: `/category/${Math.floor(Math.random() * 10)}`,
              type: 'page',
              category: 'browse',
              properties: {
                duration: Math.floor(Math.random() * 300),
                referrer: Math.random() > 0.5 ? '/home' : 'google.com',
              },
              timestamp: new Date(
                new Date(timeRange.start).getTime() +
                  Math.random() *
                    (new Date(timeRange.end).getTime() - new Date(timeRange.start).getTime()),
              ).toISOString(),
              userId,
            });
          } else {
            events.push({
              type: 'track',
              event: eventType,
              properties: {
                brand: ['Nike', 'Apple', 'Samsung', 'Adidas'][Math.floor(Math.random() * 4)],
                category: ['Electronics', 'Clothing', 'Home', 'Sports'][
                  Math.floor(Math.random() * 4)
                ],
                price: Math.floor(Math.random() * 1000) + 10,
                productId: `prod_${Math.floor(Math.random() * 1000)}`,
                productName: `Product ${Math.floor(Math.random() * 1000)}`,
                searchQuery:
                  eventType === 'search_performed'
                    ? `query ${Math.floor(Math.random() * 100)}`
                    : undefined,
              },
              timestamp: new Date(
                new Date(timeRange.start).getTime() +
                  Math.random() *
                    (new Date(timeRange.end).getTime() - new Date(timeRange.start).getTime()),
              ).toISOString(),
              userId,
            });
          }
        }
      }

      return {
        ...input,
        eventCount: events.length,
        events,
        fetchedAt: new Date().toISOString(),
        uniqueUsers: new Set(events.map((e) => e.userId)).size,
      };
    },
    (input) => new Date(input.timeRange.start) < new Date(input.timeRange.end),
    (output) => output.events.length > 0,
  ),
  (step: any) => withStepTimeout(step, 60000),
  (step: any) => withStepMonitoring(step),
);

// Step 2: Preprocess events for vectorization
export const preprocessEventsStep = createStep('preprocess-events', async (data: any) => {
  const { events, vectorizationConfig } = data;
  const { aggregationWindow } = vectorizationConfig;

  // Group events by user and session/time window
  const userSessions = new Map<string, any[]>();

  events.forEach((event: any) => {
    const userId = event.userId || event.anonymousId;
    if (!userId) return;

    if (!userSessions.has(userId)) {
      userSessions.set(userId, []);
    }

    // Extract relevant features from each event
    const features = {
      context: {
        name: event.name,
        category: event.category,
      },
      eventType: event.type === 'track' ? event.event : 'page_view',
      properties: event.properties || {},
      timestamp: event.timestamp,
    };

    userSessions.get(userId)!.push(features);
  });

  // Aggregate features based on window
  const aggregatedSessions = Array.from(userSessions.entries()).map(([userId, events]) => {
    // Sort events by timestamp
    events.sort(
      (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    // Create session-based aggregations
    const sessions = [];
    let currentSession: any[] = [];
    let lastTimestamp = 0;

    events.forEach((event) => {
      const timestamp = new Date(event.timestamp).getTime();

      // New session if gap > 30 minutes
      if (lastTimestamp && timestamp - lastTimestamp > 30 * 60 * 1000) {
        if (currentSession.length > 0) {
          sessions.push(currentSession);
          currentSession = [];
        }
      }

      currentSession.push(event);
      lastTimestamp = timestamp;
    });

    if (currentSession.length > 0) {
      sessions.push(currentSession);
    }

    return {
      sessions,
      totalEvents: events.length,
      uniqueEventTypes: new Set(events.map((e: any) => e.eventType)).size,
      userId,
    };
  });

  return {
    ...data,
    preprocessedAt: new Date().toISOString(),
    preprocessedData: aggregatedSessions,
    totalSessions: aggregatedSessions.reduce((sum, user) => sum + user.sessions.length, 0),
  };
});

// Step 3: Extract features for vectorization
export const extractFeaturesStep = createStep('extract-features', async (data: any) => {
  const { preprocessedData } = data;

  const featureVectors = preprocessedData
    .map((userData: any) => {
      return userData.sessions.map((session: any) => {
        // Extract behavioral features
        const behavioralFeatures = {
          cartActions: session.filter((e: any) =>
            ['cart_viewed', 'product_added'].includes(e.eventType),
          ).length,
          productViews: session.filter((e: any) => e.eventType === 'product_viewed').length,
          purchases: session.filter((e: any) => e.eventType === 'order_completed').length,
          searches: session.filter((e: any) => e.eventType === 'search_performed').length,
          sessionDuration:
            session.length > 1
              ? new Date(session[session.length - 1].timestamp).getTime() -
                new Date(session[0].timestamp).getTime()
              : 0,
          sessionLength: session.length,
        };

        // Extract content features
        const viewedCategories = new Set<string>();
        const viewedBrands = new Set<string>();
        const priceRanges: any[] = [];
        const searchTerms: any[] = [];

        session.forEach((event: any) => {
          if (event.properties.category) viewedCategories.add(event.properties.category);
          if (event.properties.brand) viewedBrands.add(event.properties.brand);
          if (event.properties.price) priceRanges.push(event.properties.price);
          if (event.properties.searchQuery) searchTerms.push(event.properties.searchQuery);
        });

        const contentFeatures = {
          avgPrice:
            priceRanges.length > 0
              ? priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length
              : 0,
          brands: Array.from(viewedBrands),
          categories: Array.from(viewedCategories),
          priceRange:
            priceRanges.length > 0
              ? { max: Math.max(...priceRanges), min: Math.min(...priceRanges) }
              : { max: 0, min: 0 },
          searchTerms,
          uniqueBrands: viewedBrands.size,
          uniqueCategories: viewedCategories.size,
        };

        // Extract sequence features (for RNN-like processing)
        const eventSequence = session.map((e: any) => e.eventType);
        const timeDeltas = session
          .slice(1)
          .map(
            (e: any, i: number) =>
              new Date(e.timestamp).getTime() - new Date(session[i].timestamp).getTime(),
          );

        return {
          behavioralFeatures,
          contentFeatures,
          rawSession: session,
          sequenceFeatures: {
            avgTimeBetweenEvents:
              timeDeltas.length > 0
                ? timeDeltas.reduce((a: any, b: any) => a + b, 0) / timeDeltas.length
                : 0,
            eventSequence,
            timeDeltas,
          },
          sessionId: `${userData.userId}_${new Date(session[0].timestamp).getTime()}`,
          timestamp: session[0].timestamp,
          userId: userData.userId,
        };
      });
    })
    .flat();

  return {
    ...data,
    extractedAt: new Date().toISOString(),
    featureVectors,
    totalFeatureVectors: featureVectors.length,
  };
});

// Step 4: Vectorize features using embeddings
export const vectorizeFeaturesStep = compose(
  createStep('vectorize-features', async (data: any) => {
    const { featureVectors, vectorizationConfig } = data;
    const { dimensions, model } = vectorizationConfig;

    const vectorizedSessions = await Promise.all(
      featureVectors.map(async (session: any) => {
        // Simulate embedding generation based on model type
        let embedding: number[];

        switch (model) {
          case 'bert':
            // Simulate BERT-like embeddings
            embedding = Array.from(
              { length: dimensions },
              () => Math.random() * 2 - 1, // Random values between -1 and 1
            );
            break;

          case 'sentence-transformer':
            // Simulate sentence transformer embeddings
            // Combine textual features
            const textFeatures = [
              ...session.contentFeatures.categories,
              ...session.contentFeatures.brands,
              ...session.contentFeatures.searchTerms,
              ...session.sequenceFeatures.eventSequence,
            ].join(' ');

            // Generate embedding based on text length and content
            embedding = Array.from({ length: dimensions }, (_, i) => {
              const seed = textFeatures.charCodeAt(i % textFeatures.length) || 0;
              return Math.sin(seed * (i + 1)) * Math.cos(seed / (i + 1));
            });
            break;

          case 'custom':
            // Custom feature engineering
            const features = [
              session.behavioralFeatures.sessionLength / 100,
              session.behavioralFeatures.productViews / 50,
              session.behavioralFeatures.searches / 20,
              session.behavioralFeatures.cartActions / 10,
              session.behavioralFeatures.purchases,
              session.contentFeatures.uniqueCategories / 10,
              session.contentFeatures.uniqueBrands / 10,
              session.contentFeatures.avgPrice / 1000,
              session.sequenceFeatures.avgTimeBetweenEvents / 60000, // Convert to minutes
            ];

            // Pad or truncate to match dimensions
            embedding = Array.from(
              { length: dimensions },
              (_, i) => features[i % features.length] || 0,
            );
            break;

          default:
            // Default to random embeddings
            embedding = Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
            break;
        }

        // Normalize embedding
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        const normalizedEmbedding = embedding.map((val) => val / (magnitude || 1));

        return {
          ...session,
          embedding: normalizedEmbedding,
          embeddingMagnitude: magnitude,
          vectorizedAt: new Date().toISOString(),
        };
      }),
    );

    return {
      ...data,
      totalVectorized: vectorizedSessions.length,
      vectorizationComplete: true,
      vectorizedSessions,
    };
  }),
  (step: any) => withStepRetry(step, { maxRetries: 3 }),
  (step: any) => withStepTimeout(step, 120000), // 2 minutes
);

// Step 5: Store vectors in database
export const storeVectorsStep = compose(
  StepTemplates.database('store-vectors', 'Store vectorized analytics in PostgreSQL with pgvector'),
  (step: any) => withStepRetry(step, { maxRetries: 3 }),
);

// Step 6: Generate similarity index
export const generateSimilarityIndexStep = createStep(
  'generate-similarity-index',
  async (data: any) => {
    const { vectorizedSessions } = data;

    // Build user preference profiles by averaging session vectors
    const userProfiles = new Map<string, any>();

    vectorizedSessions.forEach((session: any) => {
      if (!userProfiles.has(session.userId)) {
        userProfiles.set(session.userId, {
          aggregateVector: new Array(session.embedding.length).fill(0),
          avgSessionLength: 0,
          brands: new Set(),
          categories: new Set(),
          sessionCount: 0,
          userId: session.userId,
        });
      }

      const profile = userProfiles.get(session.userId)!;
      profile.sessionCount++;

      // Update aggregate vector
      session.embedding.forEach((val: number, i: number) => {
        profile.aggregateVector[i] += val;
      });

      // Update preferences
      session.contentFeatures.categories.forEach((cat: string) => profile.categories.add(cat));
      session.contentFeatures.brands.forEach((brand: string) => profile.brands.add(brand));
      profile.avgSessionLength += session.behavioralFeatures.sessionLength;
    });

    // Normalize user profiles
    const userPreferenceVectors = Array.from(userProfiles.entries()).map(([userId, profile]) => {
      const avgVector = profile.aggregateVector.map((val: number) => val / profile.sessionCount);
      const magnitude = Math.sqrt(
        avgVector.reduce((sum: number, val: number) => sum + val * val, 0),
      );

      return {
        preferenceVector: avgVector.map((val: any) => val / (magnitude || 1)),
        profile: {
          avgSessionLength: profile.avgSessionLength / profile.sessionCount,
          favoriteBrands: Array.from(profile.brands),
          favoriteCategories: Array.from(profile.categories),
          sessionCount: profile.sessionCount,
        },
        userId,
      };
    });

    return {
      ...data,
      indexGeneratedAt: new Date().toISOString(),
      totalUserProfiles: userPreferenceVectors.length,
      userPreferenceVectors,
    };
  },
);

// Step 7: Create recommendation model
export const createRecommendationModelStep = createStep(
  'create-recommendation-model',
  async (data: any) => {
    const { userPreferenceVectors, vectorizedSessions } = data;

    // Create a simple collaborative filtering model
    const model: any = {
      type: 'collaborative_filtering',
      metadata: {
        createdAt: new Date().toISOString(),
        totalSessions: vectorizedSessions.length,
        totalUsers: userPreferenceVectors.length,
        vectorDimensions: userPreferenceVectors[0]?.preferenceVector.length || 0,
      },
      parameters: {
        minSessions: 3,
        similarityThreshold: 0.7,
        topK: 10,
      },
      sessionVectors: vectorizedSessions.slice(-1000), // Keep last 1000 sessions for comparison
      userVectors: userPreferenceVectors,
      version: '1.0.0',
      similarityMatrix: [] as any[],
    };

    // Calculate user similarity matrix (simplified)
    const similarityMatrix: any[] = [];
    for (let i = 0; i < Math.min(userPreferenceVectors.length, 100); i++) {
      for (let j = i + 1; j < Math.min(userPreferenceVectors.length, 100); j++) {
        const similarity = cosineSimilarity(
          userPreferenceVectors[i].preferenceVector,
          userPreferenceVectors[j].preferenceVector,
        );

        if (similarity > model.parameters.similarityThreshold) {
          similarityMatrix.push({
            similarity,
            user1: userPreferenceVectors[i].userId,
            user2: userPreferenceVectors[j].userId,
          });
        }
      }
    }

    model.similarityMatrix = similarityMatrix;

    return {
      ...data,
      modelCreated: true,
      recommendationModel: model,
    };
  },
);

// Helper function for cosine similarity
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2) || 1);
}

// Step 8: Send completion notification
export const sendVectorizationNotificationStep = StepTemplates.notification(
  'vectorization-complete',
  'success',
);

// Main workflow definition
export const analyticsVectorizationWorkflow = {
  id: 'analytics-vectorization',
  name: 'Analytics Vectorization',
  config: {
    concurrency: {
      max: 3, // Process 3 vectorization jobs in parallel
    },
    maxDuration: 1800000, // 30 minutes
    schedule: {
      cron: '0 2 * * *', // Run daily at 2 AM
      timezone: 'UTC',
    },
  },
  description: 'Vectorize production analytics events for user preference prediction',
  features: {
    mlPipeline: true,
    recommendationEngine: true,
    vectorEmbeddings: true,
  },
  steps: [
    fetchAnalyticsEventsStep,
    preprocessEventsStep,
    extractFeaturesStep,
    vectorizeFeaturesStep,
    storeVectorsStep,
    generateSimilarityIndexStep,
    createRecommendationModelStep,
    sendVectorizationNotificationStep,
  ],
  version: '1.0.0',
};
