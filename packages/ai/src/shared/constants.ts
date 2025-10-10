/**
 * Shared constants and model capabilities
 * Centralized location for provider-agnostic constants
 */

/**
 * Common AI parameter ranges and defaults
 */
export const AI_PARAMETERS = {
  TEMPERATURE: {
    MIN: 0,
    MAX: 2,
    DEFAULT: 0.7,
    CREATIVE: 1.2,
    BALANCED: 0.7,
    FOCUSED: 0.3,
  },

  TOP_P: {
    MIN: 0,
    MAX: 1,
    DEFAULT: 0.9,
    FOCUSED: 0.1,
    BALANCED: 0.9,
    DIVERSE: 1.0,
  },

  MAX_TOKENS: {
    MIN: 1,
    SMALL: 256,
    MEDIUM: 1024,
    LARGE: 4096,
    EXTRA_LARGE: 16384,
    MAX: 100000,
  },

  TOP_K: {
    MIN: 1,
    DEFAULT: 40,
    MAX: 100,
  },
} as const;

/**
 * Common model context limits (in tokens)
 */
export const CONTEXT_LIMITS = {
  SMALL: 4096, // 4K context
  MEDIUM: 8192, // 8K context
  LARGE: 32768, // 32K context
  EXTRA_LARGE: 128000, // 128K context
  MEGA: 1000000, // 1M context
  ULTRA: 2000000, // 2M context
} as const;

/**
 * Standard model capability flags
 */
export const MODEL_CAPABILITIES = {
  // Basic capabilities
  TEXT_GENERATION: 'text-generation',
  TEXT_COMPLETION: 'text-completion',
  CHAT: 'chat',

  // Multimodal capabilities
  IMAGE_INPUT: 'image-input',
  IMAGE_GENERATION: 'image-generation',
  AUDIO_INPUT: 'audio-input',
  AUDIO_GENERATION: 'audio-generation',
  VIDEO_INPUT: 'video-input',
  PDF_INPUT: 'pdf-input',

  // Advanced features
  TOOL_CALLING: 'tool-calling',
  FUNCTION_CALLING: 'function-calling',
  STRUCTURED_OUTPUT: 'structured-output',
  STREAMING: 'streaming',

  // Provider-specific features
  REASONING: 'reasoning',
  THINKING: 'thinking',
  WEB_SEARCH: 'web-search',
  COMPUTER_USE: 'computer-use',
  CODE_EXECUTION: 'code-execution',
  CACHING: 'caching',

  // Safety and filtering
  CONTENT_FILTERING: 'content-filtering',
  SAFETY_SETTINGS: 'safety-settings',
} as const;

/**
 * Standard error codes
 */
export const ERROR_CODES = {
  // Authentication errors
  INVALID_API_KEY: 'INVALID_API_KEY',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Request errors
  INVALID_REQUEST: 'INVALID_REQUEST',
  MALFORMED_INPUT: 'MALFORMED_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_PARAMETER: 'INVALID_PARAMETER',

  // Limit errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  TOKEN_LIMIT_EXCEEDED: 'TOKEN_LIMIT_EXCEEDED',
  CONTEXT_LIMIT_EXCEEDED: 'CONTEXT_LIMIT_EXCEEDED',

  // Model errors
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  MODEL_UNAVAILABLE: 'MODEL_UNAVAILABLE',
  MODEL_OVERLOADED: 'MODEL_OVERLOADED',

  // Content errors
  CONTENT_FILTERED: 'CONTENT_FILTERED',
  UNSAFE_CONTENT: 'UNSAFE_CONTENT',

  // Tool errors
  TOOL_NOT_FOUND: 'TOOL_NOT_FOUND',
  TOOL_EXECUTION_FAILED: 'TOOL_EXECUTION_FAILED',
  TOOL_TIMEOUT: 'TOOL_TIMEOUT',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // Internal errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * HTTP status codes commonly used by AI providers
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Common MIME types for multimodal inputs
 */
export const MIME_TYPES = {
  // Images
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  WEBP: 'image/webp',
  GIF: 'image/gif',

  // Audio
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  FLAC: 'audio/flac',
  OGG: 'audio/ogg',

  // Video
  MP4: 'video/mp4',
  WEBM: 'video/webm',

  // Documents
  PDF: 'application/pdf',
  TXT: 'text/plain',
  MD: 'text/markdown',
  HTML: 'text/html',

  // Data
  JSON: 'application/json',
  XML: 'application/xml',
  CSV: 'text/csv',
} as const;

/**
 * Standard language codes (ISO 639-1)
 */
export const LANGUAGE_CODES = {
  ENGLISH: 'en',
  SPANISH: 'es',
  FRENCH: 'fr',
  GERMAN: 'de',
  ITALIAN: 'it',
  PORTUGUESE: 'pt',
  RUSSIAN: 'ru',
  JAPANESE: 'ja',
  KOREAN: 'ko',
  CHINESE: 'zh',
  ARABIC: 'ar',
  HINDI: 'hi',
  DUTCH: 'nl',
  SWEDISH: 'sv',
  POLISH: 'pl',
  TURKISH: 'tr',
} as const;

/**
 * Common response formats
 */
export const RESPONSE_FORMATS = {
  TEXT: 'text',
  JSON: 'json',
  MARKDOWN: 'markdown',
  HTML: 'html',
  XML: 'xml',
  YAML: 'yaml',
} as const;

/**
 * Tool execution timeouts (in milliseconds)
 */
export const TIMEOUTS = {
  QUICK: 5000, // 5 seconds
  STANDARD: 30000, // 30 seconds
  LONG: 120000, // 2 minutes
  EXTENDED: 300000, // 5 minutes
  MAX: 900000, // 15 minutes
} as const;

/**
 * Retry configuration defaults
 */
export const RETRY_DEFAULTS = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY: 1000, // 1 second
  MAX_DELAY: 30000, // 30 seconds
  BACKOFF_FACTOR: 2,
  JITTER: 0.1,
} as const;

/**
 * Cache TTL values (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
  MONTH: 2592000, // 30 days
} as const;

/**
 * Common file size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  IMAGE_SMALL: 4 * 1024 * 1024, // 4MB
  IMAGE_LARGE: 20 * 1024 * 1024, // 20MB
  AUDIO_SMALL: 25 * 1024 * 1024, // 25MB
  AUDIO_LARGE: 100 * 1024 * 1024, // 100MB
  VIDEO_SMALL: 50 * 1024 * 1024, // 50MB
  VIDEO_LARGE: 500 * 1024 * 1024, // 500MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  MAX: 1024 * 1024 * 1024, // 1GB
} as const;

/**
 * Provider-specific constants that are commonly referenced
 */
export const PROVIDER_CONSTANTS = {
  ANTHROPIC: {
    NAME: 'anthropic',
    API_VERSION: '2023-06-01',
    MAX_CONTEXT: CONTEXT_LIMITS.ULTRA,
    SUPPORTS_REASONING: true,
    SUPPORTS_COMPUTER_USE: true,
  },

  OPENAI: {
    NAME: 'openai',
    API_VERSION: 'v1',
    MAX_CONTEXT: CONTEXT_LIMITS.EXTRA_LARGE,
    SUPPORTS_REASONING: true,
    SUPPORTS_STRUCTURED_OUTPUT: true,
  },

  GOOGLE: {
    NAME: 'google',
    API_VERSION: 'v1',
    MAX_CONTEXT: CONTEXT_LIMITS.MEGA,
    SUPPORTS_THINKING: true,
    SUPPORTS_WEB_SEARCH: true,
  },

  PERPLEXITY: {
    NAME: 'perplexity',
    API_VERSION: 'v1',
    MAX_CONTEXT: CONTEXT_LIMITS.EXTRA_LARGE,
    SUPPORTS_WEB_SEARCH: true,
    SUPPORTS_CITATIONS: true,
  },

  GROK: {
    NAME: 'grok',
    API_VERSION: 'v1',
    MAX_CONTEXT: CONTEXT_LIMITS.EXTRA_LARGE,
    SUPPORTS_LIVE_SEARCH: true,
    SUPPORTS_REASONING_EFFORT: true,
  },
} as const;

/**
 * Type helpers for constants
 */
export type AIParameterKey = keyof typeof AI_PARAMETERS;
export type ContextLimit = (typeof CONTEXT_LIMITS)[keyof typeof CONTEXT_LIMITS];
export type ModelCapability = (typeof MODEL_CAPABILITIES)[keyof typeof MODEL_CAPABILITIES];
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export type MimeType = (typeof MIME_TYPES)[keyof typeof MIME_TYPES];
export type LanguageCode = (typeof LANGUAGE_CODES)[keyof typeof LANGUAGE_CODES];
export type ResponseFormat = (typeof RESPONSE_FORMATS)[keyof typeof RESPONSE_FORMATS];

/**
 * Utility functions for working with constants
 */
export const constants = {
  /**
   * Check if a temperature is within valid range
   */
  isValidTemperature: (temp: number): boolean =>
    temp >= AI_PARAMETERS.TEMPERATURE.MIN && temp <= AI_PARAMETERS.TEMPERATURE.MAX,

  /**
   * Check if a context size is supported
   */
  isValidContextSize: (tokens: number): boolean => tokens > 0 && tokens <= CONTEXT_LIMITS.ULTRA,

  /**
   * Get timeout based on operation complexity
   */
  getTimeout: (complexity: 'quick' | 'standard' | 'long' | 'extended' | 'max') =>
    TIMEOUTS[complexity.toUpperCase() as keyof typeof TIMEOUTS],

  /**
   * Check if a file size is within limits for type
   */
  isValidFileSize: (bytes: number, type: keyof typeof FILE_SIZE_LIMITS): boolean =>
    bytes <= FILE_SIZE_LIMITS[type],
} as const;
