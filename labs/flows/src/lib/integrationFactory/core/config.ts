// config.ts
import { LogLevel, OPERATION_DEFAULTS } from './constants-types';

export interface FactoryConfig {
  // Core settings
  environment: string;
  debug: boolean;
  logLevel: LogLevel;

  // Operation defaults
  operationDefaults: {
    timeout: typeof OPERATION_DEFAULTS.TIMEOUT;
    retries: typeof OPERATION_DEFAULTS.RETRIES;
    cacheTtl: typeof OPERATION_DEFAULTS.CACHE_TTL;
  };

  // Middleware configuration
  middleware: {
    timeout?: {
      enabled: boolean;
      default: number;
    };
    retry?: {
      enabled: boolean;
      maxAttempts: number;
      backoff: 'linear' | 'exponential';
    };
    cache?: {
      enabled: boolean;
      ttl: number;
    };
    rateLimit?: {
      enabled: boolean;
      limit: number;
      window: number;
    };
  };

  // Telemetry settings
  telemetry?: {
    enabled: boolean;
    serviceName: string;
    serviceVersion: string;
  };
}

export const loadConfig = (): FactoryConfig => {
  return {
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG === 'true',
    logLevel: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,

    operationDefaults: {
      timeout: OPERATION_DEFAULTS.TIMEOUT,
      retries: OPERATION_DEFAULTS.RETRIES,
      cacheTtl: OPERATION_DEFAULTS.CACHE_TTL,
    },

    middleware: {
      timeout: {
        enabled: true,
        default: parseInt(process.env.TIMEOUT_MS || '30000', 10),
      },
      retry: {
        enabled: true,
        maxAttempts: parseInt(process.env.MAX_RETRIES || '3', 10),
        backoff: (process.env.RETRY_BACKOFF || 'exponential') as
          | 'linear'
          | 'exponential',
      },
      cache: {
        enabled: process.env.CACHE_ENABLED === 'true',
        ttl: parseInt(process.env.CACHE_TTL || '300', 10),
      },
      rateLimit: {
        enabled: process.env.RATE_LIMIT_ENABLED === 'true',
        limit: parseInt(process.env.RATE_LIMIT || '100', 10),
        window: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
      },
    },

    telemetry: {
      enabled: process.env.TELEMETRY_ENABLED === 'true',
      serviceName: process.env.SERVICE_NAME || 'unknown-service',
      serviceVersion: process.env.SERVICE_VERSION || '0.0.0',
    },
  };
};
