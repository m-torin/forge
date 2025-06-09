/**
 * Product Recommendation Engine Workflow
 * Generate personalized product recommendations using multiple algorithms and ML models
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  createWorkflowStep,
  withStepBulkhead,
  withStepMonitoring,
  withStepTimeout,
} from '@repo/orchestration';

// Input schemas
const RecommendationEngineInput = z.object({
  algorithmConfig: z.object({
    hybridApproach: z.boolean().default(true),
    diversityFactor: z.number().min(0).max(1).default(0.3),
    fallbackStrategy: z.enum(['popularity', 'trending', 'category']).default('popularity'),
    noveltyFactor: z.number().min(0).max(1).default(0.2),
    weights: z.record(z.number()).optional(), // algorithm -> weight
  }),
  contextConfig: z.object({
    contextWeight: z.number().min(0).max(1).default(0.2),
    useDeviceContext: z.boolean().default(true),
    useLocationContext: z.boolean().default(true),
    useSeasonality: z.boolean().default(true),
    useTimeContext: z.boolean().default(true),
  }),
  mlConfig: z.object({
    enableDeepLearning: z.boolean().default(true),
    ensembleMethod: z.enum(['voting', 'stacking', 'blending']).default('blending'),
    modelTypes: z
      .array(z.enum(['matrix_factorization', 'neural_cf', 'autoencoders', 'wide_deep']))
      .default(['matrix_factorization']),
    retrainThreshold: z.number().default(0.1), // Retrain when accuracy drops below this
  }),
  outputConfig: z.object({
    groupByCategory: z.boolean().default(false),
    includeExplanations: z.boolean().default(true),
    maxRecommendations: z.number().default(20),
    minScore: z.number().min(0).max(1).default(0.1),
    realTimeUpdates: z.boolean().default(false),
  }),
  recommendationTypes: z
    .array(
      z.enum([
        'collaborative_filtering',
        'content_based',
        'popularity_based',
        'session_based',
        'cross_sell',
        'up_sell',
        'trending',
        'personalized_ranking',
      ]),
    )
    .default(['collaborative_filtering', 'content_based']),
  targetScope: z.object({
    all: z.boolean().default(false),
    categories: z.array(z.string()).optional(),
    productIds: z.array(z.string()).optional(),
    sessionIds: z.array(z.string()).optional(),
    userIds: z.array(z.string()).optional(),
  }),
});

// User profile schema
const UserProfile = z.object({
  behavior: z.object({
    purchaseHistory: z.array(z.string()),
    ratings: z.record(z.number()),
    searchHistory: z.array(z.string()),
    viewHistory: z.array(z.string()),
  }),
  context: z
    .object({
      currentSession: z.string().optional(),
      device: z.string().optional(),
      location: z.string().optional(),
      timeOfDay: z.string().optional(),
    })
    .optional(),
  demographics: z
    .object({
      age: z.number().optional(),
      gender: z.string().optional(),
      location: z.string().optional(),
    })
    .optional(),
  preferences: z.object({
    brands: z.array(z.string()),
    categories: z.array(z.string()),
    priceRange: z
      .object({
        max: z.number(),
        min: z.number(),
      })
      .optional(),
  }),
  userId: z.string(),
});

// Recommendation result schema
const RecommendationResult = z.object({
  confidence: z.number(),
  algorithm: z.string(),
  explanation: z
    .object({
      factors: z.array(
        z.object({
          factor: z.string(),
          value: z.any(),
          weight: z.number(),
        }),
      ),
      reason: z.string(),
    })
    .optional(),
  metadata: z.object({
    brand: z.string().optional(),
    category: z.string(),
    freshness: z.number().optional(),
    popularity: z.number().optional(),
    price: z.number().optional(),
  }),
  productId: z.string(),
  rank: z.number(),
  score: z.number(),
  userId: z.string(),
});

// Step factory for ML recommendation models
const mlRecommendationFactory = createWorkflowStep(
  {
    name: 'ML Recommendation Engine',
    category: 'ml',
    tags: ['recommendation', 'machine-learning', 'personalization'],
    version: '1.0.0',
  },
  async (context) => {
    const { config, modelType, products, userProfiles } = context.input;
    const recommendations = [];

    for (const profile of userProfiles) {
      const userRecs = await generateMLRecommendations(profile, products, modelType, config);
      recommendations.push(...userRecs);
    }

    return recommendations;
  },
);

// Mock ML recommendation generation
async function generateMLRecommendations(
  profile: any,
  products: any[],
  modelType: string,
  config: any,
): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const recommendations = [];

  switch (modelType) {
    case 'matrix_factorization':
      recommendations.push(...generateMatrixFactorizationRecs(profile, products));
      break;
    case 'neural_cf':
      recommendations.push(...generateNeuralCFRecs(profile, products));
      break;
    case 'autoencoders':
      recommendations.push(...generateAutoencoderRecs(profile, products));
      break;
    case 'wide_deep':
      recommendations.push(...generateWideDeepRecs(profile, products));
      break;
  }

  return recommendations.map((rec) => ({
    ...rec,
    confidence: 0.7 + Math.random() * 0.3,
    algorithm: modelType,
  }));
}

function generateMatrixFactorizationRecs(profile: any, products: any[]): any[] {
  // Simulate matrix factorization recommendations
  return products.slice(0, 10).map((product, index) => ({
    metadata: {
      brand: product.brand,
      category: product.category,
      popularity: product.popularity || 0.5,
      price: product.price,
    },
    productId: product.id,
    rank: index + 1,
    score: 0.8 - index * 0.05,
    userId: profile.userId,
  }));
}

function generateNeuralCFRecs(profile: any, products: any[]): any[] {
  // Simulate neural collaborative filtering
  return products.slice(0, 15).map((product, index) => ({
    metadata: {
      brand: product.brand,
      category: product.category,
      popularity: product.popularity || 0.5,
      price: product.price,
    },
    productId: product.id,
    rank: index + 1,
    score: 0.85 - index * 0.04,
    userId: profile.userId,
  }));
}

function generateAutoencoderRecs(profile: any, products: any[]): any[] {
  // Simulate autoencoder-based recommendations
  return products.slice(0, 12).map((product, index) => ({
    metadata: {
      brand: product.brand,
      category: product.category,
      popularity: product.popularity || 0.5,
      price: product.price,
    },
    productId: product.id,
    rank: index + 1,
    score: 0.82 - index * 0.045,
    userId: profile.userId,
  }));
}

function generateWideDeepRecs(profile: any, products: any[]): any[] {
  // Simulate Wide & Deep model recommendations
  return products.slice(0, 18).map((product, index) => ({
    metadata: {
      brand: product.brand,
      category: product.category,
      popularity: product.popularity || 0.5,
      price: product.price,
    },
    productId: product.id,
    rank: index + 1,
    score: 0.87 - index * 0.035,
    userId: profile.userId,
  }));
}

// Step 1: Collect user profiles and context
export const collectUserProfilesStep = compose(
  createStepWithValidation(
    'collect-profiles',
    async (input: z.infer<typeof RecommendationEngineInput>) => {
      const { targetScope } = input;

      let userProfiles = [];

      // Collect user profiles based on scope
      if (targetScope.all) {
        userProfiles = await fetchAllActiveUserProfiles();
      } else {
        if (targetScope.userIds) {
          const profiles = await fetchUserProfilesByIds(targetScope.userIds);
          userProfiles.push(...profiles);
        }
        if (targetScope.sessionIds) {
          const sessionProfiles = await fetchUserProfilesBySessionIds(targetScope.sessionIds);
          userProfiles.push(...sessionProfiles);
        }
      }

      // Remove duplicates
      const uniqueProfiles = Array.from(new Map(userProfiles.map((p) => [p.userId, p])).values());

      // Enrich with real-time context
      const enrichedProfiles = await enrichProfilesWithContext(uniqueProfiles);

      return {
        ...input,
        profileCollectionStarted: new Date().toISOString(),
        totalUsers: enrichedProfiles.length,
        userProfiles: enrichedProfiles,
      };
    },
    (input) =>
      input.targetScope.all ||
      input.targetScope.userIds?.length > 0 ||
      input.targetScope.sessionIds?.length > 0,
    (output) => output.userProfiles.length > 0,
  ),
  (step) => withStepTimeout(step, { execution: 120000 }), // 2 minutes
  (step) =>
    withStepMonitoring(step, {
      enableDetailedLogging: true,
      metricsToTrack: ['profileEnrichmentRate'],
    }),
);

// Mock profile fetching functions
async function fetchAllActiveUserProfiles(): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const count = 1000 + Math.floor(Math.random() * 4000);
  return generateMockUserProfiles(count);
}

async function fetchUserProfilesByIds(userIds: string[]): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return userIds.map((id) => generateMockUserProfile(id));
}

async function fetchUserProfilesBySessionIds(sessionIds: string[]): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return sessionIds.map((sessionId) => generateMockUserProfile(`user_${sessionId}`));
}

function generateMockUserProfiles(count: number): any[] {
  return Array.from({ length: count }, (_, i) => generateMockUserProfile(`user_${i}`));
}

function generateMockUserProfile(userId: string): any {
  const categories = ['Electronics', 'Clothing', 'Home', 'Sports', 'Books', 'Beauty', 'Automotive'];
  const brands = ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E'];

  return {
    behavior: {
      purchaseHistory: Array.from(
        { length: 10 },
        (_, i) => `prod_${Math.floor(Math.random() * 1000)}`,
      ),
      ratings: Object.fromEntries(
        Array.from({ length: 20 }, () => [
          `prod_${Math.floor(Math.random() * 1000)}`,
          1 + Math.floor(Math.random() * 5),
        ]),
      ),
      searchHistory: ['laptop', 'smartphone', 'shoes', 'shirt'].slice(
        0,
        Math.floor(Math.random() * 4) + 1,
      ),
      viewHistory: Array.from({ length: 50 }, (_, i) => `prod_${Math.floor(Math.random() * 1000)}`),
    },
    context: {
      currentSession: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
      location: ['home', 'work', 'mobile'][Math.floor(Math.random() * 3)],
      timeOfDay: getCurrentTimeOfDay(),
    },
    demographics: {
      age: 18 + Math.floor(Math.random() * 60),
      gender: Math.random() > 0.5 ? 'M' : 'F',
      location: ['US', 'UK', 'DE', 'FR', 'CA'][Math.floor(Math.random() * 5)],
    },
    preferences: {
      brands: brands.slice(0, Math.floor(Math.random() * 3) + 1),
      categories: categories.slice(0, Math.floor(Math.random() * 4) + 1),
      priceRange: {
        max: 100 + Math.floor(Math.random() * 900),
        min: Math.floor(Math.random() * 50),
      },
    },
    userId,
  };
}

function getCurrentTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

async function enrichProfilesWithContext(profiles: any[]): Promise<any[]> {
  // Simulate context enrichment
  return profiles.map((profile) => ({
    ...profile,
    enrichedContext: {
      ...profile.context,
      deviceCapabilities: getDeviceCapabilities(profile.context?.device),
      locationInsights: getLocationInsights(profile.demographics?.location),
      recentActivity: generateRecentActivity(),
      seasonality: getCurrentSeason(),
    },
  }));
}

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

function generateRecentActivity(): any {
  return {
    itemsAddedToCart: Math.floor(Math.random() * 5),
    lastActiveMinutes: Math.floor(Math.random() * 60),
    pagesViewed: Math.floor(Math.random() * 20) + 1,
    sessionDuration: Math.floor(Math.random() * 1800), // seconds
  };
}

function getDeviceCapabilities(device: string): any {
  const capabilities = {
    desktop: { hasKeyboard: true, screenSize: 'large', touchCapable: false },
    mobile: { hasKeyboard: false, screenSize: 'small', touchCapable: true },
    tablet: { hasKeyboard: false, screenSize: 'medium', touchCapable: true },
  };
  return capabilities[device as any] || capabilities.desktop;
}

function getLocationInsights(location: string): any {
  const insights = {
    CA: { currency: 'CAD', shippingRegion: 'North America', timezone: 'America/Toronto' },
    DE: { currency: 'EUR', shippingRegion: 'Europe', timezone: 'Europe/Berlin' },
    FR: { currency: 'EUR', shippingRegion: 'Europe', timezone: 'Europe/Paris' },
    UK: { currency: 'GBP', shippingRegion: 'Europe', timezone: 'Europe/London' },
    US: { currency: 'USD', shippingRegion: 'North America', timezone: 'America/New_York' },
  };
  return insights[location as any] || insights.US;
}

// Step 2: Fetch product catalog
export const fetchProductCatalogStep = createStep('fetch-products', async (data: any) => {
  const { targetScope } = data;

  let products = [];

  // Fetch products based on scope
  if (targetScope.productIds) {
    products = await fetchProductsByIds(targetScope.productIds);
  } else if (targetScope.categories) {
    products = await fetchProductsByCategories(targetScope.categories);
  } else {
    products = await fetchActiveProducts();
  }

  // Enrich products with recommendation features
  const enrichedProducts = await enrichProductsForRecommendation(products);

  return {
    ...data,
    productCatalogLoaded: true,
    products: enrichedProducts,
    totalProducts: enrichedProducts.length,
  };
});

async function fetchProductsByIds(productIds: string[]): Promise<any[]> {
  return productIds.map((id) => generateMockProduct(id));
}

async function fetchProductsByCategories(categories: string[]): Promise<any[]> {
  const allProducts = await fetchActiveProducts();
  return allProducts.filter((p) => categories.includes(p.category));
}

async function fetchActiveProducts(): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const count = 5000 + Math.floor(Math.random() * 15000);
  return Array.from({ length: count }, (_, i) => generateMockProduct(`prod_${i}`));
}

function generateMockProduct(productId: string): any {
  const categories = ['Electronics', 'Clothing', 'Home', 'Sports', 'Books', 'Beauty', 'Automotive'];
  const brands = ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E'];

  return {
    id: productId,
    availability: Math.random() > 0.1,
    brand: brands[Math.floor(Math.random() * brands.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    description: `High-quality product with advanced features`,
    images: [`https://example.com/images/${productId}.jpg`],
    popularity: Math.random(),
    price: 10 + Math.random() * 990,
    rating: 3 + Math.random() * 2,
    reviewCount: Math.floor(Math.random() * 1000),
    tags: ['feature1', 'feature2', 'quality'].slice(0, Math.floor(Math.random() * 3) + 1),
    title: `Product ${productId}`,
  };
}

async function enrichProductsForRecommendation(products: any[]): Promise<any[]> {
  return products.map((product) => ({
    ...product,
    features: {
      ...product,
      popularityScore: calculatePopularityScore(product),
      qualityScore: calculateQualityScore(product),
      recencyScore: calculateRecencyScore(product),
      semanticVector: generateSemanticVector(product),
      trendingScore: calculateTrendingScore(product),
    },
  }));
}

function calculatePopularityScore(product: any): number {
  return (product.reviewCount || 0) / 1000 + (product.rating || 0) / 5;
}

function calculateTrendingScore(product: any): number {
  const daysSinceCreated =
    (Date.now() - new Date(product.createdAt).getTime()) / (24 * 60 * 60 * 1000);
  return Math.max(0, 1 - daysSinceCreated / 30); // Higher for newer products
}

function calculateQualityScore(product: any): number {
  return ((product.rating || 0) / 5) * 0.7 + ((product.reviewCount || 0) / 100) * 0.3;
}

function calculateRecencyScore(product: any): number {
  const daysSinceCreated =
    (Date.now() - new Date(product.createdAt).getTime()) / (24 * 60 * 60 * 1000);
  return Math.exp(-daysSinceCreated / 90); // Exponential decay over 90 days
}

function generateSemanticVector(product: any): number[] {
  // Generate mock 100-dimensional semantic vector
  const vector = [];
  const seed = product.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = 0; i < 100; i++) {
    vector.push(Math.sin(seed + i) * Math.cos(seed - i));
  }

  return vector;
}

// Step 3: Generate collaborative filtering recommendations
export const generateCollaborativeFilteringStep = createStep(
  'collaborative-filtering',
  async (data: any) => {
    const { products, recommendationTypes, userProfiles } = data;

    if (!recommendationTypes.includes('collaborative_filtering')) {
      return {
        ...data,
        collaborativeFilteringSkipped: true,
      };
    }

    const recommendations = [];

    // User-based collaborative filtering
    for (const profile of userProfiles) {
      const userRecs = await generateUserBasedCF(profile, userProfiles, products);
      recommendations.push(...userRecs);
    }

    // Item-based collaborative filtering
    for (const profile of userProfiles) {
      const itemRecs = await generateItemBasedCF(profile, products);
      recommendations.push(...itemRecs);
    }

    return {
      ...data,
      cfComplete: true,
      collaborativeRecommendations: recommendations,
    };
  },
);

async function generateUserBasedCF(
  targetProfile: any,
  allProfiles: any[],
  products: any[],
): Promise<any[]> {
  // Find similar users
  const similarities = allProfiles
    .filter((p) => p.userId !== targetProfile.userId)
    .map((profile) => ({
      profile,
      similarity: calculateUserSimilarity(targetProfile, profile),
      userId: profile.userId,
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 50); // Top 50 similar users

  // Generate recommendations based on similar users' preferences
  const recommendations: any[] = [];
  const candidateProducts = new Map();

  similarities.forEach(({ profile, similarity }) => {
    profile.behavior.purchaseHistory.forEach((productId: string) => {
      if (!targetProfile.behavior.purchaseHistory.includes(productId)) {
        const weight = candidateProducts.get(productId) || 0;
        candidateProducts.set(productId, weight + similarity);
      }
    });
  });

  // Convert to recommendation format
  const sortedCandidates = Array.from(candidateProducts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sortedCandidates.forEach(([productId, score], index) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      recommendations.push({
        algorithm: 'user_based_cf',
        metadata: {
          brand: product.brand,
          category: product.category,
          popularity: product.popularity,
          price: product.price,
        },
        productId,
        rank: index + 1,
        score: score / similarities.length,
        userId: targetProfile.userId,
      });
    }
  });

  return recommendations;
}

async function generateItemBasedCF(profile: any, products: any[]): Promise<any[]> {
  const recommendations: any[] = [];
  const userItems = profile.behavior.purchaseHistory;

  if (userItems.length === 0) return recommendations;

  // For each item the user has purchased, find similar items
  const candidateProducts = new Map();

  userItems.forEach((itemId: string) => {
    const similarItems = findSimilarItems(itemId, products);
    similarItems.forEach(({ productId, similarity }) => {
      if (!userItems.includes(productId)) {
        const weight = candidateProducts.get(productId) || 0;
        candidateProducts.set(productId, weight + similarity);
      }
    });
  });

  // Convert to recommendations
  const sortedCandidates = Array.from(candidateProducts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sortedCandidates.forEach(([productId, score], index) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      recommendations.push({
        algorithm: 'item_based_cf',
        metadata: {
          brand: product.brand,
          category: product.category,
          popularity: product.popularity,
          price: product.price,
        },
        productId,
        rank: index + 1,
        score: score / userItems.length,
        userId: profile.userId,
      });
    }
  });

  return recommendations;
}

function calculateUserSimilarity(user1: any, user2: any): number {
  // Simplified cosine similarity based on purchase history
  const items1 = new Set(user1.behavior.purchaseHistory);
  const items2 = new Set(user2.behavior.purchaseHistory);

  const intersection = new Set([...items1].filter((x) => items2.has(x)));
  const union = new Set([...items1, ...items2]);

  return union.size > 0 ? intersection.size / Math.sqrt(items1.size * items2.size) : 0;
}

function findSimilarItems(itemId: string, products: any[]): any[] {
  const targetProduct = products.find((p) => p.id === itemId);
  if (!targetProduct) return [];

  return products
    .filter((p) => p.id !== itemId)
    .map((product) => ({
      productId: product.id,
      similarity: calculateProductSimilarity(targetProduct, product),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 20);
}

function calculateProductSimilarity(product1: any, product2: any): number {
  let similarity = 0;

  // Category similarity
  if (product1.category === product2.category) similarity += 0.4;

  // Brand similarity
  if (product1.brand === product2.brand) similarity += 0.3;

  // Price similarity
  const priceDiff =
    Math.abs(product1.price - product2.price) / Math.max(product1.price, product2.price);
  similarity += (1 - priceDiff) * 0.2;

  // Rating similarity
  const ratingDiff = Math.abs(product1.rating - product2.rating) / 5;
  similarity += (1 - ratingDiff) * 0.1;

  return similarity;
}

// Step 4: Generate content-based recommendations
export const generateContentBasedStep = createStep('content-based', async (data: any) => {
  const { products, recommendationTypes, userProfiles } = data;

  if (!recommendationTypes.includes('content_based')) {
    return {
      ...data,
      contentBasedSkipped: true,
    };
  }

  const recommendations = [];

  for (const profile of userProfiles) {
    const userRecs = await generateContentBasedRecommendations(profile, products);
    recommendations.push(...userRecs);
  }

  return {
    ...data,
    contentBasedComplete: true,
    contentBasedRecommendations: recommendations,
  };
});

async function generateContentBasedRecommendations(profile: any, products: any[]): Promise<any[]> {
  const recommendations: any[] = [];

  // Build user preference profile
  const userPreferences = buildUserPreferenceProfile(profile);

  // Score products based on content similarity
  const productScores = products.map((product) => ({
    product,
    score: calculateContentScore(product, userPreferences),
  }));

  // Sort and filter
  const topProducts = productScores
    .filter(({ score }) => score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  topProducts.forEach(({ product, score }, index) => {
    recommendations.push({
      algorithm: 'content_based',
      metadata: {
        brand: product.brand,
        category: product.category,
        popularity: product.popularity,
        price: product.price,
      },
      productId: product.id,
      rank: index + 1,
      score,
      userId: profile.userId,
    });
  });

  return recommendations;
}

function buildUserPreferenceProfile(profile: any): any {
  const preferences = {
    brands: new Map(),
    categories: new Map(),
    features: new Map(),
    priceRange: profile.preferences.priceRange,
  };

  // Weight explicit preferences highly
  profile.preferences.categories.forEach((category: string) => {
    preferences.categories.set(category, 1.0);
  });

  profile.preferences.brands.forEach((brand: string) => {
    preferences.brands.set(brand, 1.0);
  });

  // Infer preferences from behavior (lower weight)
  profile.behavior.viewHistory.forEach((productId: string) => {
    // In a real system, we'd look up product details
    // Here we'll simulate with random categories/brands
    const category = ['Electronics', 'Clothing', 'Home'][Math.floor(Math.random() * 3)];
    const brand = ['Brand A', 'Brand B', 'Brand C'][Math.floor(Math.random() * 3)];

    preferences.categories.set(category, (preferences.categories.get(category) || 0) + 0.3);
    preferences.brands.set(brand, (preferences.brands.get(brand) || 0) + 0.3);
  });

  return preferences;
}

function calculateContentScore(product: any, preferences: any): number {
  let score = 0;

  // Category match
  const categoryScore = preferences.categories.get(product.category) || 0;
  score += categoryScore * 0.4;

  // Brand match
  const brandScore = preferences.brands.get(product.brand) || 0;
  score += brandScore * 0.3;

  // Price range match
  if (preferences.priceRange) {
    const priceInRange =
      product.price >= preferences.priceRange.min && product.price <= preferences.priceRange.max;
    if (priceInRange) score += 0.2;
  }

  // Quality score
  score += (product.rating / 5) * 0.1;

  return Math.min(score, 1.0);
}

// Step 5: Run ML models
export const runMLModelsStep = compose(
  createStep('ml-models', async (data: any) => {
    const { mlConfig, products, userProfiles } = data;

    if (!mlConfig.enableDeepLearning) {
      return {
        ...data,
        mlModelsSkipped: true,
      };
    }

    const allMLRecommendations = [];

    // Run each ML model type
    for (const modelType of mlConfig.modelTypes) {
      const modelRecs = await mlRecommendationFactory.handler({
        input: {
          config: mlConfig,
          modelType,
          products,
          userProfiles,
        },
      });

      allMLRecommendations.push(...modelRecs);
    }

    // Ensemble if multiple models
    let finalMLRecommendations = allMLRecommendations;
    if (mlConfig.modelTypes.length > 1) {
      finalMLRecommendations = ensembleMLRecommendations(
        allMLRecommendations,
        mlConfig.ensembleMethod,
      );
    }

    return {
      ...data,
      mlModelsComplete: true,
      mlRecommendations: finalMLRecommendations,
    };
  }),
  (step) =>
    withStepBulkhead(step, {
      maxConcurrent: 5,
      maxQueued: 20,
    }),
);

function ensembleMLRecommendations(recommendations: any[], method: string): any[] {
  if (method === 'voting') {
    return ensembleByVoting(recommendations);
  } else if (method === 'stacking') {
    return ensembleByStacking(recommendations);
  } else {
    return ensembleByBlending(recommendations);
  }
}

function ensembleByVoting(recommendations: any[]): any[] {
  // Group by user and product
  const grouped = new Map();

  recommendations.forEach((rec) => {
    const key = `${rec.userId}_${rec.productId}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(rec);
  });

  // Average scores across models
  const ensembled: any[] = [];
  grouped.forEach((recs, key) => {
    const avgScore = recs.reduce((sum: number, rec: any) => sum + rec.score, 0) / recs.length;
    const avgConfidence =
      recs.reduce((sum: number, rec: any) => sum + rec.confidence, 0) / recs.length;

    ensembled.push({
      ...recs[0],
      confidence: avgConfidence,
      algorithm: 'ensemble_voting',
      score: avgScore,
    });
  });

  return ensembled;
}

function ensembleByStacking(recommendations: any[]): any[] {
  // Simplified stacking - weight models based on historical performance
  const modelWeights = {
    wide_deep: 0.1,
    autoencoders: 0.2,
    matrix_factorization: 0.3,
    neural_cf: 0.4,
  };

  const grouped = new Map();

  recommendations.forEach((rec) => {
    const key = `${rec.userId}_${rec.productId}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(rec);
  });

  const ensembled: any[] = [];
  grouped.forEach((recs, key) => {
    const weightedScore = recs.reduce((sum: number, rec: any) => {
      const weight = modelWeights[rec.algorithm as any] || 0.25;
      return sum + rec.score * weight;
    }, 0);

    ensembled.push({
      ...recs[0],
      algorithm: 'ensemble_stacking',
      score: weightedScore,
    });
  });

  return ensembled;
}

function ensembleByBlending(recommendations: any[]): any[] {
  // Simple linear blending
  return ensembleByVoting(recommendations).map((rec) => ({
    ...rec,
    algorithm: 'ensemble_blending',
  }));
}

// Step 6: Apply contextual filters
export const applyContextualFiltersStep = createStep('contextual-filters', async (data: any) => {
  const { contextConfig } = data;

  const allRecommendations = [
    ...(data.collaborativeRecommendations || []),
    ...(data.contentBasedRecommendations || []),
    ...(data.mlRecommendations || []),
  ];

  const contextualRecommendations = [];

  for (const rec of allRecommendations) {
    const profile = data.userProfiles.find((p: any) => p.userId === rec.userId);
    if (!profile) continue;

    const contextScore = calculateContextScore(rec, profile, contextConfig);
    const adjustedScore = rec.score * (1 + contextScore * contextConfig.contextWeight);

    contextualRecommendations.push({
      ...rec,
      contextFactors: getContextFactors(profile, contextConfig),
      contextScore,
      score: Math.min(adjustedScore, 1.0),
    });
  }

  return {
    ...data,
    contextFiltersApplied: true,
    contextualRecommendations,
  };
});

function calculateContextScore(recommendation: any, profile: any, config: any): number {
  let contextScore = 0;
  let factors = 0;

  if (config.useTimeContext) {
    contextScore += getTimeContextScore(recommendation, profile);
    factors++;
  }

  if (config.useLocationContext) {
    contextScore += getLocationContextScore(recommendation, profile);
    factors++;
  }

  if (config.useDeviceContext) {
    contextScore += getDeviceContextScore(recommendation, profile);
    factors++;
  }

  if (config.useSeasonality) {
    contextScore += getSeasonalityScore(recommendation, profile);
    factors++;
  }

  return factors > 0 ? contextScore / factors : 0;
}

function getTimeContextScore(recommendation: any, profile: any): number {
  const timeOfDay = profile.enrichedContext?.timeOfDay;
  const category = recommendation.metadata.category;

  // Mock time-based preferences
  const timePreferences = {
    afternoon: ['Electronics', 'Clothing', 'Home'],
    evening: ['Entertainment', 'Food', 'Sports'],
    morning: ['Books', 'Beauty', 'Health'],
    night: ['Books', 'Electronics', 'Entertainment'],
  };

  return timePreferences[timeOfDay as any]?.includes(category) ? 0.2 : -0.1;
}

function getLocationContextScore(recommendation: any, profile: any): number {
  const location = profile.enrichedContext?.location;
  const category = recommendation.metadata.category;

  // Mock location-based preferences
  if (location === 'work' && ['Books', 'Electronics'].includes(category)) return 0.1;
  if (location === 'home' && ['Entertainment', 'Home'].includes(category)) return 0.1;
  if (location === 'mobile' && ['Mobile', 'Travel'].includes(category)) return 0.1;

  return 0;
}

function getDeviceContextScore(recommendation: any, profile: any): number {
  const device = profile.enrichedContext?.device;
  const price = recommendation.metadata.price;

  // Mobile users might prefer lower-priced items
  if (device === 'mobile' && price < 100) return 0.1;
  if (device === 'desktop' && price > 100) return 0.1;

  return 0;
}

function getSeasonalityScore(recommendation: any, profile: any): number {
  const season = profile.enrichedContext?.seasonality;
  const category = recommendation.metadata.category;

  // Mock seasonal preferences
  const seasonalCategories = {
    fall: ['Clothing', 'Electronics', 'Books'],
    spring: ['Clothing', 'Sports', 'Home'],
    summer: ['Sports', 'Travel', 'Outdoor'],
    winter: ['Electronics', 'Home', 'Books'],
  };

  return seasonalCategories[season as any]?.includes(category) ? 0.15 : 0;
}

function getContextFactors(profile: any, config: any): any[] {
  const factors = [];

  if (config.useTimeContext) {
    factors.push({
      factor: 'time_of_day',
      value: profile.enrichedContext?.timeOfDay,
      weight: 0.25,
    });
  }

  if (config.useLocationContext) {
    factors.push({
      factor: 'location',
      value: profile.enrichedContext?.location,
      weight: 0.25,
    });
  }

  if (config.useDeviceContext) {
    factors.push({
      factor: 'device',
      value: profile.enrichedContext?.device,
      weight: 0.25,
    });
  }

  if (config.useSeasonality) {
    factors.push({
      factor: 'seasonality',
      value: profile.enrichedContext?.seasonality,
      weight: 0.25,
    });
  }

  return factors;
}

// Step 7: Combine and rank recommendations
export const combineAndRankStep = createStep('combine-rank', async (data: any) => {
  const { algorithmConfig, contextualRecommendations, outputConfig } = data;

  // Group by user
  const userRecommendations = new Map();

  contextualRecommendations.forEach((rec: any) => {
    if (!userRecommendations.has(rec.userId)) {
      userRecommendations.set(rec.userId, []);
    }
    userRecommendations.get(rec.userId).push(rec);
  });

  const finalRecommendations: any[] = [];

  // Process each user's recommendations
  userRecommendations.forEach((recs, userId) => {
    // Apply hybrid approach if enabled
    let processedRecs = recs;
    if (algorithmConfig.hybridApproach) {
      processedRecs = applyHybridScoring(recs, algorithmConfig.weights);
    }

    // Apply diversity and novelty
    processedRecs = applyDiversityAndNovelty(processedRecs, algorithmConfig);

    // Sort by final score
    processedRecs.sort((a: any, b: any) => b.finalScore - a.finalScore);

    // Filter by minimum score and limit count
    const filteredRecs = processedRecs
      .filter((rec: any) => rec.finalScore >= outputConfig.minScore)
      .slice(0, outputConfig.maxRecommendations);

    // Add final ranking
    filteredRecs.forEach((rec: any, index: number) => {
      rec.finalRank = index + 1;
    });

    finalRecommendations.push(...filteredRecs);
  });

  return {
    ...data,
    finalRecommendations,
    recommendationsGenerated: true,
  };
});

function applyHybridScoring(recommendations: any[], weights: Record<string, number> = {}): any[] {
  const defaultWeights = {
    collaborative_filtering: 0.3,
    content_based: 0.3,
    matrix_factorization: 0.2,
    neural_cf: 0.2,
  };

  const finalWeights = { ...defaultWeights, ...weights };

  return recommendations.map((rec) => ({
    ...rec,
    finalScore: rec.score * (finalWeights[rec.algorithm as any] || 0.1),
  }));
}

function applyDiversityAndNovelty(recommendations: any[], config: any): any[] {
  const diversityFactor = config.diversityFactor;
  const noveltyFactor = config.noveltyFactor;

  return recommendations.map((rec) => {
    // Calculate diversity score (based on category distribution)
    const categoryCount = recommendations.filter(
      (r) => r.metadata.category === rec.metadata.category,
    ).length;
    const diversityScore = 1 / Math.sqrt(categoryCount);

    // Calculate novelty score (based on popularity)
    const noveltyScore = 1 - (rec.metadata.popularity || 0.5);

    // Combine scores
    const adjustedScore =
      rec.finalScore * (1 - diversityFactor - noveltyFactor) +
      diversityScore * diversityFactor +
      noveltyScore * noveltyFactor;

    return {
      ...rec,
      diversityScore,
      finalScore: adjustedScore,
      noveltyScore,
    };
  });
}

// Step 8: Generate explanations
export const generateExplanationsStep = createStep('generate-explanations', async (data: any) => {
  const { finalRecommendations, outputConfig } = data;

  if (!outputConfig.includeExplanations) {
    return {
      ...data,
      explanationsSkipped: true,
    };
  }

  const recommendationsWithExplanations = [];

  for (const rec of finalRecommendations) {
    const explanation = generateRecommendationExplanation(rec, data);
    recommendationsWithExplanations.push({
      ...rec,
      explanation,
    });
  }

  return {
    ...data,
    explanationsGenerated: true,
    recommendationsWithExplanations,
  };
});

function generateRecommendationExplanation(recommendation: any, data: any): any {
  const profile = data.userProfiles.find((p: any) => p.userId === recommendation.userId);

  let reason = '';
  const factors = [];

  switch (recommendation.algorithm) {
    case 'collaborative_filtering':
      reason = 'Recommended because users with similar preferences also liked this product';
      factors.push({
        factor: 'user_similarity',
        value: 'Similar users',
        weight: 0.8,
      });
      break;

    case 'content_based':
      reason = `Recommended based on your interest in ${recommendation.metadata.category}`;
      factors.push({
        factor: 'category_preference',
        value: recommendation.metadata.category,
        weight: 0.6,
      });
      break;

    case 'matrix_factorization':
    case 'neural_cf':
      reason = 'Recommended by our AI model based on your purchase patterns';
      factors.push({
        factor: 'ai_prediction',
        value: 'Machine learning model',
        weight: 0.7,
      });
      break;
  }

  // Add context factors
  if (recommendation.contextFactors) {
    factors.push(...recommendation.contextFactors);
  }

  // Add product factors
  if (recommendation.metadata.popularity > 0.8) {
    factors.push({
      factor: 'popularity',
      value: 'Highly popular product',
      weight: 0.3,
    });
  }

  if (recommendation.metadata.rating > 4.5) {
    factors.push({
      factor: 'rating',
      value: `Highly rated (${recommendation.metadata.rating}/5)`,
      weight: 0.4,
    });
  }

  return {
    factors,
    reason,
  };
}

// Step 9: Store recommendations
export const storeRecommendationsStep = compose(
  createStep('store-recommendations', async (data: any) => {
    const { recommendationsWithExplanations } = data;

    // Store in batches
    const batchSize = 1000;
    const stored = [];
    const errors = [];

    for (let i = 0; i < recommendationsWithExplanations.length; i += batchSize) {
      const batch = recommendationsWithExplanations.slice(i, i + batchSize);

      try {
        const storedBatch = await storeRecommendationBatch(batch);
        stored.push(...storedBatch);
      } catch (error) {
        errors.push({
          batch: i / batchSize,
          count: batch.length,
          error: (error as Error).message,
        });
      }
    }

    return {
      ...data,
      storageErrors: errors,
      storageStats: {
        failed: errors.length * batchSize,
        stored: stored.length,
        successRate: stored.length / recommendationsWithExplanations.length,
        total: recommendationsWithExplanations.length,
      },
      storedRecommendations: stored,
    };
  }),
  (step) =>
    withStepBulkhead(step, {
      maxConcurrent: 5,
      maxQueued: 20,
    }),
);

async function storeRecommendationBatch(recommendations: any[]): Promise<any[]> {
  // Simulate storage
  await new Promise((resolve) => setTimeout(resolve, 100));

  return recommendations.map((rec) => ({
    ...rec,
    id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    storedAt: new Date().toISOString(),
  }));
}

// Step 10: Generate recommendation report
export const generateRecommendationReportStep = createStep('generate-report', async (data: any) => {
  const { algorithmConfig, finalRecommendations, storageStats, totalProducts, totalUsers } = data;

  const report = {
    algorithms: {
      hybridApproach: algorithmConfig.hybridApproach,
      mlModelsUsed: data.mlConfig?.modelTypes || [],
      used: data.recommendationTypes,
      weights: algorithmConfig.weights,
    },
    diversity: {
      brandDistribution: analyzeBrandDistribution(finalRecommendations || []),
      categoryDistribution: analyzeCategoryDistribution(finalRecommendations || []),
      priceDistribution: analyzePriceDistribution(finalRecommendations || []),
    },
    performance: {
      collaborativeFiltering: analyzeAlgorithmPerformance(data.collaborativeRecommendations || []),
      contentBased: analyzeAlgorithmPerformance(data.contentBasedRecommendations || []),
      mlModels: analyzeAlgorithmPerformance(data.mlRecommendations || []),
    },
    quality: {
      averageConfidence: calculateAverageConfidence(finalRecommendations || []),
      averageScore: calculateAverageScore(finalRecommendations || []),
      scoreDistribution: analyzeScoreDistribution(finalRecommendations || []),
    },
    recommendations: generateRecommendationInsights(data),
    reportId: `recommendations_${Date.now()}`,
    summary: {
      averageRecommendationsPerUser: (finalRecommendations?.length || 0) / totalUsers,
      productsAnalyzed: totalProducts,
      recommendationsGenerated: finalRecommendations?.length || 0,
      storageSuccessRate: storageStats?.successRate || 0,
      usersProcessed: totalUsers,
    },
    timestamp: new Date().toISOString(),
  };

  return {
    ...data,
    recommendationEngineComplete: true,
    report,
  };
});

function analyzeAlgorithmPerformance(recommendations: any[]): any {
  if (recommendations.length === 0) return null;

  return {
    averageConfidence:
      recommendations.reduce((sum, rec) => sum + (rec.confidence || 0), 0) / recommendations.length,
    averageScore: recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length,
    count: recommendations.length,
  };
}

function analyzeCategoryDistribution(recommendations: any[]): any {
  const distribution = new Map();

  recommendations.forEach((rec) => {
    const category = rec.metadata?.category || 'Unknown';
    distribution.set(category, (distribution.get(category) || 0) + 1);
  });

  return Array.from(distribution.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([category, count]) => ({ category, count }));
}

function analyzeBrandDistribution(recommendations: any[]): any {
  const distribution = new Map();

  recommendations.forEach((rec) => {
    const brand = rec.metadata?.brand || 'Unknown';
    distribution.set(brand, (distribution.get(brand) || 0) + 1);
  });

  return Array.from(distribution.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([brand, count]) => ({ brand, count }));
}

function analyzePriceDistribution(recommendations: any[]): any {
  const prices = recommendations
    .map((rec) => rec.metadata?.price)
    .filter((price) => price !== undefined)
    .sort((a, b) => a - b);

  if (prices.length === 0) return null;

  return {
    average: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    max: prices[prices.length - 1],
    median: prices[Math.floor(prices.length / 2)],
    min: prices[0],
    ranges: [
      { count: prices.filter((p) => p < 50).length, range: '$0-50' },
      { count: prices.filter((p) => p >= 50 && p < 100).length, range: '$50-100' },
      { count: prices.filter((p) => p >= 100 && p < 500).length, range: '$100-500' },
      { count: prices.filter((p) => p >= 500).length, range: '$500+' },
    ],
  };
}

function calculateAverageScore(recommendations: any[]): number {
  if (recommendations.length === 0) return 0;
  return (
    recommendations.reduce((sum, rec) => sum + (rec.finalScore || rec.score), 0) /
    recommendations.length
  );
}

function calculateAverageConfidence(recommendations: any[]): number {
  if (recommendations.length === 0) return 0;
  return (
    recommendations.reduce((sum, rec) => sum + (rec.confidence || 0), 0) / recommendations.length
  );
}

function analyzeScoreDistribution(recommendations: any[]): any {
  const scores = recommendations.map((rec) => rec.finalScore || rec.score);

  return {
    high: scores.filter((s) => s >= 0.8).length,
    low: scores.filter((s) => s < 0.5).length,
    medium: scores.filter((s) => s >= 0.5 && s < 0.8).length,
  };
}

function generateRecommendationInsights(data: any): any[] {
  const insights = [];

  // Coverage analysis
  const coverage = data.totalUsers > 0 ? data.finalRecommendations?.length / data.totalUsers : 0;
  if (coverage < 10) {
    insights.push({
      type: 'low_coverage',
      action: 'adjust_recommendation_thresholds',
      message: `Average of ${coverage.toFixed(1)} recommendations per user is below target`,
      priority: 'medium',
    });
  }

  // Diversity analysis
  const categoryDistribution = analyzeCategoryDistribution(data.finalRecommendations || []);
  const topCategory = categoryDistribution[0];
  if (topCategory && topCategory.count > (data.finalRecommendations?.length || 0) * 0.4) {
    insights.push({
      type: 'low_diversity',
      action: 'increase_diversity_factor',
      message: `${topCategory.category} represents ${((topCategory.count / (data.finalRecommendations?.length || 1)) * 100).toFixed(1)}% of recommendations`,
      priority: 'low',
    });
  }

  // Quality analysis
  const avgScore = calculateAverageScore(data.finalRecommendations || []);
  if (avgScore < 0.6) {
    insights.push({
      type: 'low_quality',
      action: 'retrain_models_or_adjust_weights',
      message: `Average recommendation score of ${avgScore.toFixed(2)} is below target`,
      priority: 'high',
    });
  }

  return insights;
}

// Main workflow definition
export const productRecommendationEngineWorkflow = {
  id: 'product-recommendation-engine',
  name: 'Product Recommendation Engine',
  config: {
    concurrency: {
      max: 8, // Multiple recommendation streams
    },
    maxDuration: 2700000, // 45 minutes
    schedule: {
      cron: '0 */3 * * *', // Every 3 hours
      timezone: 'UTC',
    },
  },
  description: 'Generate personalized product recommendations using multiple algorithms',
  features: {
    hybridRecommendations: true,
    contextualFiltering: true,
    explainableAI: true,
    mlEnsemble: true,
    realTimePersonalization: true,
  },
  steps: [
    collectUserProfilesStep,
    fetchProductCatalogStep,
    generateCollaborativeFilteringStep,
    generateContentBasedStep,
    runMLModelsStep,
    applyContextualFiltersStep,
    combineAndRankStep,
    generateExplanationsStep,
    storeRecommendationsStep,
    generateRecommendationReportStep,
  ],
  version: '1.0.0',
};
