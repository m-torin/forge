/**
 * Default transport implementation
 * Monorepo-optimized transport configurations and presets
 */

import { logDebug, logError } from '@repo/observability';
import { DefaultChatTransport } from 'ai';

// Import safeEnv safely - fallback to process.env if not available
let safeEnv: () => any = () => process.env;

/**
 * Transport configuration options that extend the basic AI SDK patterns
 */
export interface TransportConfig {
  api?: string;
  headers?: Record<string, string> | (() => Record<string, string>);
  body?: Record<string, any> | (() => Record<string, any>);
  credentials?: RequestCredentials | (() => RequestCredentials);

  // Monorepo integrations
  userId?: string;
  sessionId?: string;
  conversationId?: string;
  enableTelemetry?: boolean;
  enableAnalytics?: boolean;

  // Auth integration
  enableAuth?: boolean;
  authToken?: string | (() => string | Promise<string>);

  // Error handling
  retries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

/**
 * Create a transport with monorepo authentication
 */
export function createAuthenticatedTransport(config: TransportConfig = {}) {
  safeEnv();

  // Build static headers first
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add telemetry headers
  if (config.enableTelemetry !== false) {
    if (config.userId) {
      baseHeaders['X-User-ID'] = config.userId;
    }
    if (config.sessionId) {
      baseHeaders['X-Session-ID'] = config.sessionId;
    }
    if (config.conversationId) {
      baseHeaders['X-Conversation-ID'] = config.conversationId;
    }
  }

  // Add custom headers
  if (config.headers && typeof config.headers !== 'function') {
    Object.assign(baseHeaders, config.headers);
  }

  // Build static body
  const baseBody: Record<string, any> = {};

  // Add telemetry data
  if (config.enableTelemetry !== false) {
    baseBody.metadata = {
      userId: config.userId,
      sessionId: config.sessionId,
      conversationId: config.conversationId,
      timestamp: new Date().toISOString(),
    };
  }

  // Add custom body data
  if (config.body && typeof config.body !== 'function') {
    Object.assign(baseBody, config.body);
  }

  return new DefaultChatTransport({
    api: config.api || '/api/chat',
    headers: baseHeaders,
    body: baseBody,
    credentials:
      config.credentials && typeof config.credentials !== 'function'
        ? config.credentials
        : 'same-origin',
  });
}

/**
 * Create a transport optimized for development
 */
export function createDevelopmentTransport(config: Omit<TransportConfig, 'enableTelemetry'> = {}) {
  return createAuthenticatedTransport({
    ...config,
    enableTelemetry: true,
    onError: error => {
      logError('[Development Transport] Error', error);
      config.onError?.(error);
    },
  });
}

/**
 * Create a transport optimized for production
 */
export function createProductionTransport(config: TransportConfig = {}) {
  return createAuthenticatedTransport({
    ...config,
    enableTelemetry: config.enableTelemetry ?? true,
    enableAnalytics: config.enableAnalytics ?? true,
    retries: config.retries ?? 3,
    retryDelay: config.retryDelay ?? 1000,
    onError: error => {
      // Production error handling - don't log sensitive details
      logError('[Production Transport] Request failed:', {
        message: error.message,
        userId: config.userId,
        timestamp: new Date().toISOString(),
      });
      config.onError?.(error);
    },
  });
}

/**
 * Transport presets based on common patterns from the documentation
 */
export const transportPresets = {
  /**
   * Basic transport - matches the simple examples from docs
   */
  basic: () =>
    new DefaultChatTransport({
      api: '/api/chat',
    }),

  /**
   * With authentication - for logged-in users
   */
  authenticated: (userId: string, authToken?: string) =>
    createAuthenticatedTransport({
      userId,
      authToken,
      enableAuth: true,
    }),

  /**
   * With telemetry - includes user tracking
   */
  withTelemetry: (userId: string, sessionId?: string) =>
    createAuthenticatedTransport({
      userId,
      sessionId,
      enableTelemetry: true,
    }),

  /**
   * Development preset - verbose logging, telemetry enabled
   */
  development: (userId?: string) =>
    createDevelopmentTransport({
      userId,
    }),

  /**
   * Production preset - optimized for performance and reliability
   */
  production: (userId: string, config: Partial<TransportConfig> = {}) =>
    createProductionTransport({
      userId,
      ...config,
    }),

  /**
   * For file uploads - enables multipart form data
   */
  withFileSupport: (config: TransportConfig = {}) =>
    createAuthenticatedTransport({
      ...config,
      headers: () => {
        const baseHeaders =
          typeof config.headers === 'function' ? config.headers() : config.headers || {};

        // Don't set Content-Type for file uploads - let the browser set it
        const { 'Content-Type': _, ...headersWithoutContentType } = baseHeaders;
        return headersWithoutContentType;
      },
    }),

  /**
   * Custom API endpoint - for non-standard routes
   */
  customEndpoint: (apiPath: string, config: TransportConfig = {}) =>
    createAuthenticatedTransport({
      ...config,
      api: apiPath,
    }),
};

/**
 * Auto-configure transport based on environment and available configuration
 */
export function autoConfigureTransport(config: TransportConfig = {}) {
  const env = safeEnv();

  // Determine environment
  const isDevelopment = env.NODE_ENV === 'development' || env.NODE_ENV === 'test';
  const isProduction = env.NODE_ENV === 'production';

  // Auto-detect user context if available
  let autoUserId = config.userId;

  // Safely try to get userId from localStorage
  if (!autoUserId && typeof window !== 'undefined' && window.localStorage) {
    try {
      autoUserId = localStorage.getItem('userId') || undefined;
    } catch {
      // localStorage access might fail in some environments
    }
  }

  if (isDevelopment) {
    logDebug('[Transport] Auto-configuring for development environment');
    return transportPresets.development(autoUserId);
  }

  if (isProduction && autoUserId) {
    return transportPresets.production(autoUserId, config);
  }

  // Fallback to basic transport
  return transportPresets.basic();
}

/**
 * Main default transport - automatically configured based on environment
 */
export const defaultTransport = autoConfigureTransport();

/**
 * Transport factory for creating customized transports
 */
export const transportFactory = {
  // Presets
  ...transportPresets,

  // Factories
  create: createAuthenticatedTransport,
  createDev: createDevelopmentTransport,
  createProd: createProductionTransport,

  // Auto-configuration
  auto: autoConfigureTransport,

  // Utilities
  isConfigured: (transport: any) => transport && typeof transport.api !== 'undefined',

  // For common monorepo patterns
  forApp: (appName: string, config: TransportConfig = {}) =>
    createAuthenticatedTransport({
      ...config,
      api: config.api || `/api/${appName}/chat`,
      headers: () => ({
        ...((typeof config.headers === 'function' ? config.headers() : config.headers) || {}),
        'X-App-Name': appName,
      }),
    }),
};

// Convenience exports for common use cases
export {
  createAuthenticatedTransport as createTransport,
  createDevelopmentTransport as devTransport,
  createProductionTransport as prodTransport,
  autoConfigureTransport as smartTransport,
};
