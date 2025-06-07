/**
 * Analytics Vectorization Workflow
 * Vectorize production analytics events for user preference prediction
 */

import {
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepRetry,
  withStepMonitoring,
  withStepTimeout,
  compose,
} from '@repo/orchestration';
import { z } from 'zod';
import type { 
  EmitterTrackPayload, 
  EmitterPagePayload,
  EmitterEventProperties 
} from '@repo/analytics/types';

// Input schemas
const AnalyticsVectorizationInput = z.object({
  timeRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  userIds: z.array(z.string()).optional(), // Process specific users or all
  eventTypes: z.array(z.enum([
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
  ])).optional(),
  vectorizationConfig: z.object({
    dimensions: z.number().default(768), // Vector dimensions
    model: z.enum(['bert', 'sentence-transformer', 'custom']).default('sentence-transformer'),
    includeMetadata: z.boolean().default(true),
    aggregationWindow: z.enum(['session', 'daily', 'weekly']).default('session'),
  }),
});

// Step 1: Fetch analytics events from storage
export const fetchAnalyticsEventsStep = compose(
  createStepWithValidation(
    'fetch-analytics-events',
    async (input: z.infer<typeof AnalyticsVectorizationInput>) => {
      const { timeRange, userIds, eventTypes } = input;
      
      // Simulate fetching events from analytics storage
      const events: (EmitterTrackPayload | EmitterPagePayload)[] = [];
      const userCount = userIds?.length || 100;
      
      for (let i = 0; i < userCount; i++) {
        const userId = userIds?.[i] || `user_${i}`;
        const sessionEvents = Math.floor(Math.random() * 20) + 5;
        
        for (let j = 0; j < sessionEvents; j++) {
          const eventType = eventTypes?.[Math.floor(Math.random() * eventTypes.length)] || 
                           ['product_viewed', 'page_viewed', 'search_performed'][Math.floor(Math.random() * 3)];
          
          if (eventType === 'page_viewed') {
            events.push({
              type: 'page',
              userId,
              name: `/category/${Math.floor(Math.random() * 10)}`,
              category: 'browse',
              properties: {
                referrer: Math.random() > 0.5 ? '/home' : 'google.com',
                duration: Math.floor(Math.random() * 300),
              },
              timestamp: new Date(
                new Date(timeRange.start).getTime() + 
                Math.random() * (new Date(timeRange.end).getTime() - new Date(timeRange.start).getTime())
              ).toISOString(),
            });
          } else {
            events.push({
              type: 'track',
              event: eventType,
              userId,
              properties: {
                productId: `prod_${Math.floor(Math.random() * 1000)}`,
                productName: `Product ${Math.floor(Math.random() * 1000)}`,
                category: ['Electronics', 'Clothing', 'Home', 'Sports'][Math.floor(Math.random() * 4)],
                price: Math.floor(Math.random() * 1000) + 10,
                brand: ['Nike', 'Apple', 'Samsung', 'Adidas'][Math.floor(Math.random() * 4)],
                searchQuery: eventType === 'search_performed' ? `query ${Math.floor(Math.random() * 100)}` : undefined,
              },
              timestamp: new Date(
                new Date(timeRange.start).getTime() + 
                Math.random() * (new Date(timeRange.end).getTime() - new Date(timeRange.start).getTime())
              ).toISOString(),
            });
          }
        }
      }
      
      return {
        ...input,
        events,
        eventCount: events.length,
        uniqueUsers: new Set(events.map(e => e.userId)).size,
        fetchedAt: new Date().toISOString(),
      };
    },
    (input) => new Date(input.timeRange.start) < new Date(input.timeRange.end),
    (output) => output.events.length > 0
  ),
  (step) => withStepTimeout(step, { execution: 60000 }),
  (step) => withStepMonitoring(step, {
    enableDetailedLogging: true,
    customMetrics: ['eventCount', 'uniqueUsers'],
  })
);

// Step 2: Preprocess events for vectorization
export const preprocessEventsStep = createStep(
  'preprocess-events',
  async (data: any) => {
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
        eventType: event.type === 'track' ? event.event : 'page_view',
        timestamp: event.timestamp,
        properties: event.properties || {},
        context: {
          category: event.category,
          name: event.name,
        },
      };
      
      userSessions.get(userId)!.push(features);
    });
    
    // Aggregate features based on window
    const aggregatedSessions = Array.from(userSessions.entries()).map(([userId, events]) => {
      // Sort events by timestamp
      events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
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
        userId,
        sessions,
        totalEvents: events.length,
        uniqueEventTypes: new Set(events.map((e: any) => e.eventType)).size,
      };
    });
    
    return {
      ...data,
      preprocessedData: aggregatedSessions,
      totalSessions: aggregatedSessions.reduce((sum, user) => sum + user.sessions.length, 0),
      preprocessedAt: new Date().toISOString(),
    };
  }
);

// Step 3: Extract features for vectorization
export const extractFeaturesStep = createStep(
  'extract-features',
  async (data: any) => {
    const { preprocessedData } = data;
    
    const featureVectors = preprocessedData.map((userData: any) => {
      return userData.sessions.map((session: any) => {
        // Extract behavioral features
        const behavioralFeatures = {
          sessionLength: session.length,
          sessionDuration: session.length > 1 
            ? new Date(session[session.length - 1].timestamp).getTime() - new Date(session[0].timestamp).getTime()
            : 0,
          productViews: session.filter((e: any) => e.eventType === 'product_viewed').length,
          searches: session.filter((e: any) => e.eventType === 'search_performed').length,
          cartActions: session.filter((e: any) => ['product_added', 'cart_viewed'].includes(e.eventType)).length,
          purchases: session.filter((e: any) => e.eventType === 'order_completed').length,
        };
        
        // Extract content features
        const viewedCategories = new Set<string>();
        const viewedBrands = new Set<string>();
        const priceRanges = [];
        const searchTerms = [];
        
        session.forEach((event: any) => {
          if (event.properties.category) viewedCategories.add(event.properties.category);
          if (event.properties.brand) viewedBrands.add(event.properties.brand);
          if (event.properties.price) priceRanges.push(event.properties.price);
          if (event.properties.searchQuery) searchTerms.push(event.properties.searchQuery);
        });
        
        const contentFeatures = {
          uniqueCategories: viewedCategories.size,
          categories: Array.from(viewedCategories),
          uniqueBrands: viewedBrands.size,
          brands: Array.from(viewedBrands),
          avgPrice: priceRanges.length > 0 
            ? priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length 
            : 0,
          priceRange: priceRanges.length > 0 
            ? { min: Math.min(...priceRanges), max: Math.max(...priceRanges) }
            : { min: 0, max: 0 },
          searchTerms,
        };
        
        // Extract sequence features (for RNN-like processing)
        const eventSequence = session.map((e: any) => e.eventType);
        const timeDeltas = session.slice(1).map((e: any, i: number) => 
          new Date(e.timestamp).getTime() - new Date(session[i].timestamp).getTime()
        );
        
        return {
          userId: userData.userId,
          sessionId: `${userData.userId}_${new Date(session[0].timestamp).getTime()}`,
          timestamp: session[0].timestamp,
          behavioralFeatures,
          contentFeatures,
          sequenceFeatures: {
            eventSequence,
            timeDeltas,
            avgTimeBetweenEvents: timeDeltas.length > 0 
              ? timeDeltas.reduce((a, b) => a + b, 0) / timeDeltas.length 
              : 0,
          },
          rawSession: session,
        };
      });
    }).flat();
    
    return {
      ...data,
      featureVectors,
      totalFeatureVectors: featureVectors.length,
      extractedAt: new Date().toISOString(),
    };
  }
);

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
            embedding = Array.from({ length: dimensions }, () => 
              Math.random() * 2 - 1 // Random values between -1 and 1
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
            embedding = Array.from({ length: dimensions }, (_, i) => 
              features[i % features.length] || 0
            );
            break;
        }
        
        // Normalize embedding
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        const normalizedEmbedding = embedding.map(val => val / (magnitude || 1));
        
        return {
          ...session,
          embedding: normalizedEmbedding,
          embeddingMagnitude: magnitude,
          vectorizedAt: new Date().toISOString(),
        };
      })
    );
    
    return {
      ...data,
      vectorizedSessions,
      totalVectorized: vectorizedSessions.length,
      vectorizationComplete: true,
    };
  }),
  (step) => withStepRetry(step, { maxAttempts: 3 }),
  (step) => withStepTimeout(step, { execution: 120000 }) // 2 minutes
);

// Step 5: Store vectors in database
export const storeVectorsStep = compose(
  StepTemplates.database('store-vectors', 'Store vectorized analytics in PostgreSQL with pgvector'),
  (step) => withStepRetry(step, { maxAttempts: 3 })
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
          userId: session.userId,
          sessionCount: 0,
          aggregateVector: new Array(session.embedding.length).fill(0),
          categories: new Set(),
          brands: new Set(),
          avgSessionLength: 0,
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
      const magnitude = Math.sqrt(avgVector.reduce((sum: number, val: number) => sum + val * val, 0));
      
      return {
        userId,
        preferenceVector: avgVector.map(val => val / (magnitude || 1)),
        profile: {
          sessionCount: profile.sessionCount,
          favoriteCategories: Array.from(profile.categories),
          favoriteBrands: Array.from(profile.brands),
          avgSessionLength: profile.avgSessionLength / profile.sessionCount,
        },
      };
    });
    
    return {
      ...data,
      userPreferenceVectors,
      totalUserProfiles: userPreferenceVectors.length,
      indexGeneratedAt: new Date().toISOString(),
    };
  }
);

// Step 7: Create recommendation model
export const createRecommendationModelStep = createStep(
  'create-recommendation-model',
  async (data: any) => {
    const { userPreferenceVectors, vectorizedSessions } = data;
    
    // Create a simple collaborative filtering model
    const model = {
      type: 'collaborative_filtering',
      version: '1.0.0',
      parameters: {
        similarityThreshold: 0.7,
        minSessions: 3,
        topK: 10,
      },
      userVectors: userPreferenceVectors,
      sessionVectors: vectorizedSessions.slice(-1000), // Keep last 1000 sessions for comparison
      metadata: {
        totalUsers: userPreferenceVectors.length,
        totalSessions: vectorizedSessions.length,
        vectorDimensions: userPreferenceVectors[0]?.preferenceVector.length || 0,
        createdAt: new Date().toISOString(),
      },
    };
    
    // Calculate user similarity matrix (simplified)
    const similarityMatrix: any[] = [];
    for (let i = 0; i < Math.min(userPreferenceVectors.length, 100); i++) {
      for (let j = i + 1; j < Math.min(userPreferenceVectors.length, 100); j++) {
        const similarity = cosineSimilarity(
          userPreferenceVectors[i].preferenceVector,
          userPreferenceVectors[j].preferenceVector
        );
        
        if (similarity > model.parameters.similarityThreshold) {
          similarityMatrix.push({
            user1: userPreferenceVectors[i].userId,
            user2: userPreferenceVectors[j].userId,
            similarity,
          });
        }
      }
    }
    
    model.similarityMatrix = similarityMatrix;
    
    return {
      ...data,
      recommendationModel: model,
      modelCreated: true,
    };
  }
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
  'Notify about analytics vectorization completion',
  {
    channels: ['webhook'],
    template: {
      webhookUrl: 'https://api.example.com/webhooks/ml-pipeline',
    },
  }
);

// Main workflow definition
export const analyticsVectorizationWorkflow = {
  id: 'analytics-vectorization',
  name: 'Analytics Vectorization',
  description: 'Vectorize production analytics events for user preference prediction',
  version: '1.0.0',
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
  config: {
    maxDuration: 1800000, // 30 minutes
    concurrency: {
      max: 3, // Process 3 vectorization jobs in parallel
    },
    schedule: {
      cron: '0 2 * * *', // Run daily at 2 AM
      timezone: 'UTC',
    },
  },
  features: {
    mlPipeline: true,
    vectorEmbeddings: true,
    recommendationEngine: true,
  },
};