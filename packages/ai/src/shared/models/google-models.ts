/**
 * Google Gemini model configurations with safety and caching
 * These configurations are used with the Google provider
 */

export interface GoogleConfigWithSafety {
  safetySettings?: Array<{
    category:
      | 'HARM_CATEGORY_UNSPECIFIED'
      | 'HARM_CATEGORY_HATE_SPEECH'
      | 'HARM_CATEGORY_DANGEROUS_CONTENT'
      | 'HARM_CATEGORY_HARASSMENT'
      | 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
      | 'HARM_CATEGORY_CIVIC_INTEGRITY';
    threshold:
      | 'BLOCK_NONE'
      | 'BLOCK_LOW_AND_ABOVE'
      | 'BLOCK_MEDIUM_AND_ABOVE'
      | 'BLOCK_ONLY_HIGH'
      | 'OFF'
      | 'HARM_BLOCK_THRESHOLD_UNSPECIFIED';
  }>;
  searchGroundingEnabled?: boolean;
  cacheConfig?: {
    ttlSeconds?: number;
  };
}

// Default safety settings for Google models
export const DEFAULT_SAFETY_SETTINGS = [
  {
    category: 'HARM_CATEGORY_HATE_SPEECH' as const,
    threshold: 'BLOCK_MEDIUM_AND_ABOVE' as const,
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as const,
    threshold: 'BLOCK_MEDIUM_AND_ABOVE' as const,
  },
  {
    category: 'HARM_CATEGORY_HARASSMENT' as const,
    threshold: 'BLOCK_MEDIUM_AND_ABOVE' as const,
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as const,
    threshold: 'BLOCK_MEDIUM_AND_ABOVE' as const,
  },
];

// Google model configurations with safety and features
export const GOOGLE_ENHANCED_CONFIGS = {
  // Standard models with safety settings
  'gemini-1.5-pro-latest': {
    modelName: 'gemini-1.5-pro-latest',
    safetySettings: DEFAULT_SAFETY_SETTINGS,
  },
  'gemini-1.5-flash': {
    modelName: 'gemini-1.5-flash',
    safetySettings: DEFAULT_SAFETY_SETTINGS,
  },
  'gemini-2.0-flash-exp': {
    modelName: 'gemini-2.0-flash-exp',
    safetySettings: DEFAULT_SAFETY_SETTINGS,
  },

  // Models with search grounding enabled
  'gemini-1.5-pro-latest-grounded': {
    modelName: 'gemini-1.5-pro-latest',
    safetySettings: DEFAULT_SAFETY_SETTINGS,
    searchGroundingEnabled: true,
  },
  'gemini-1.5-flash-grounded': {
    modelName: 'gemini-1.5-flash',
    safetySettings: DEFAULT_SAFETY_SETTINGS,
    searchGroundingEnabled: true,
  },

  // Models with caching enabled (useful for long contexts)
  'gemini-1.5-pro-latest-cached': {
    modelName: 'gemini-1.5-pro-latest',
    safetySettings: DEFAULT_SAFETY_SETTINGS,
    cacheConfig: { ttlSeconds: 3600 }, // 1 hour cache
  },
} as const;
