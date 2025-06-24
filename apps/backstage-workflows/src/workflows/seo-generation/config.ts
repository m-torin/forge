// SEO Generation Workflow Configuration
// Strategy-specific rules and processing settings

import { ProcessingRules } from './types';

/**
 * Parse SEO configuration from environment with fallbacks
 */
const parseSeoConfig = () => {
  try {
    const configString = process.env.SEO_CONFIG;
    if (!configString) {
      throw new Error('SEO_CONFIG environment variable is required');
    }
    return JSON.parse(configString);
  } catch (error) {
    console.error('Failed to parse SEO_CONFIG:', error);
    // Fallback configuration for development
    return {
      defaultBatchSize: 25,
      maxConcurrentProducts: 3,
      maxChildWorkflows: 5,
      compression: {
        variations: 3,
        timeout: 30000,
      },
      processingRules: {
        luxury: {
          strategy: 'conversion',
          variations: 3,
          keywordDensity: 3,
          titleStyle: 'Brand-focused with premium qualifiers',
          descriptionStyle: 'Emphasis on exclusivity and quality',
          timeout: 60000,
        },
        technology: {
          strategy: 'discovery',
          variations: 3,
          keywordDensity: 5,
          titleStyle: 'Feature-rich with technical specs',
          descriptionStyle: 'Technical benefits with use cases',
          timeout: 45000,
        },
        fashion: {
          strategy: 'awareness',
          variations: 3,
          keywordDensity: 4,
          titleStyle: 'Trend-focused with style descriptors',
          descriptionStyle: 'Lifestyle and aesthetic appeal',
          timeout: 30000,
        },
        default: {
          strategy: 'conversion',
          variations: 3,
          keywordDensity: 4,
          titleStyle: 'Benefit-focused with brand inclusion',
          descriptionStyle: 'Clear value proposition with CTA',
          timeout: 30000,
        },
      },
      redis: {
        seoTTL: 2592000, // 30 days
        metaTTL: 604800, // 7 days
        statsTTL: 86400, // 1 day
      },
      delays: {
        productDelay: 2000,
        batchDelay: '10s',
        priorityBatchDelay: '5s',
      },
      maxRetries: 2,
      retryDelay: 5000,
      workflowTimeout: '45m',
      childWorkflowTimeout: '20m',
      progressReportInterval: 5,
      maxTokensPerWorkflow: 50000,
      tokenCostTracking: true,
    };
  }
};

export const SEO_CONFIG = parseSeoConfig();

/**
 * Redis key prefixes for SEO workflow data
 */
export const SEO_REDIS_KEYS = {
  seoMeta: process.env.REDIS_PREFIX ? `${process.env.REDIS_PREFIX}:seo:meta` : 'seo:meta',
  seoProgress: process.env.REDIS_PREFIX
    ? `${process.env.REDIS_PREFIX}:seo:progress`
    : 'seo:progress',
  workflowProgress: process.env.REDIS_PREFIX
    ? `${process.env.REDIS_PREFIX}:seo:workflow`
    : 'seo:workflow',
  stats: process.env.REDIS_PREFIX ? `${process.env.REDIS_PREFIX}:seo:stats` : 'seo:stats',
  tokenUsage: process.env.REDIS_PREFIX ? `${process.env.REDIS_PREFIX}:seo:tokens` : 'seo:tokens',
} as const;

/**
 * Strategy-specific configuration for AI processing (commented for development)
 */
export const STRATEGY_CONFIG = {
  conversion: {
    focus: 'Purchase intent, urgency, value propositions, social proof',
    keywords: 'Transactional keywords, brand + product, buy/shop/purchase terms',
    tone: 'Persuasive, confident, benefit-focused',
    cta: 'Strong action verbs, urgency indicators, value reinforcement',
    // systemPrompt: 'You are an expert e-commerce SEO specialist focused on driving conversions...' // Commented for development
  },
  awareness: {
    focus: 'Brand building, education, problem identification, trust signals',
    keywords: 'Informational keywords, brand awareness, category terms',
    tone: 'Authoritative, educational, trustworthy',
    cta: 'Learn more, discover, explore, find out',
    // systemPrompt: 'You are a brand awareness SEO expert...' // Commented for development
  },
  discovery: {
    focus: 'Problem solving, feature explanations, use cases, comparisons',
    keywords: 'Long-tail informational, how-to, what-is, best-for queries',
    tone: 'Helpful, detailed, solution-oriented',
    cta: 'Compare, learn, understand, choose',
    // systemPrompt: 'You are a discovery-focused SEO strategist...' // Commented for development
  },
} as const;

/**
 * Gets processing rules based on product category and brand
 */
export function getSeoProcessingRules(product: {
  category?: { name?: string } | null;
  brand?: { name?: string } | null;
  price: number;
}): ProcessingRules {
  const category = product.category?.name?.toLowerCase() || '';
  const brand = product.brand?.name?.toLowerCase() || '';
  const price = Number(product.price);

  // High-end products get conversion-focused strategy
  if (price > 500 || brand.includes('premium') || brand.includes('luxury')) {
    return SEO_CONFIG.processingRules.luxury;
  }

  // Tech products get discovery-focused strategy
  if (category.includes('tech') || category.includes('electronic')) {
    return SEO_CONFIG.processingRules.technology;
  }

  // Fashion gets awareness-focused strategy
  if (category.includes('fashion') || category.includes('clothing')) {
    return SEO_CONFIG.processingRules.fashion;
  }

  return SEO_CONFIG.processingRules.default;
}

/**
 * Generates SEO-friendly URL slug from product data
 */
export function generateSeoSlug(product: {
  title: string;
  brand?: { name?: string } | null;
  category?: { name?: string } | null;
}): string {
  const parts = [];

  if (product.brand?.name) {
    parts.push(product.brand.name.toLowerCase());
  }

  // Clean and add product title
  const cleanTitle = product.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .substring(0, 50) // Limit length
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  parts.push(cleanTitle);

  return parts.join('-');
}

/**
 * Determines priority level based on product characteristics
 */
export function determineProductPriority(product: {
  price: number;
  rating?: number | null;
  reviewCount?: number | null;
  brand?: { name?: string } | null;
  category?: { name?: string } | null;
}): 'high' | 'medium' | 'low' {
  const price = Number(product.price);
  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;
  const brandName = product.brand?.name?.toLowerCase() || '';
  const categoryName = product.category?.name?.toLowerCase() || '';

  // High priority conditions
  if (
    price > 1000 || // High-value products
    reviewCount > 100 || // Popular products
    rating > 4.5 || // Highly rated
    brandName.includes('premium') || // Premium brands
    brandName.includes('luxury') ||
    categoryName.includes('featured')
  ) {
    return 'high';
  }

  // Medium priority conditions
  if (price > 100 || reviewCount > 10 || rating > 4.0) {
    return 'medium';
  }

  return 'low';
}

/**
 * Strategy configuration for mock SEO generation (commented AI features)
 */
export const MOCK_SEO_TEMPLATES = {
  conversion: {
    titlePrefix: 'Buy',
    titleSuffix: '- Best Price & Fast Shipping',
    descriptionTemplate:
      'Shop {product} from {brand}. {benefits}. Buy now with free shipping and easy returns.',
    keywordTypes: ['buy', 'shop', 'purchase', 'best', 'discount'],
  },
  awareness: {
    titlePrefix: 'Discover',
    titleSuffix: '- Premium Quality',
    descriptionTemplate:
      'Explore {product} from {brand}. {features}. Learn more about our premium collection.',
    keywordTypes: ['discover', 'explore', 'premium', 'quality', 'collection'],
  },
  discovery: {
    titlePrefix: 'Compare',
    titleSuffix: '- Complete Guide',
    descriptionTemplate:
      'Find the perfect {product} from {brand}. {comparisons}. Complete buying guide and reviews.',
    keywordTypes: ['compare', 'guide', 'review', 'find', 'choose'],
  },
} as const;
