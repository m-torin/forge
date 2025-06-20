/**
 * Logger utility for the web application
 * This wraps console methods and can be replaced with observability package later
 *
 * Usage:
 * import { logger } from '@/lib/logger';
 *
 * logger.error('Something went wrong', error);
 * logger.info('User logged in', { userId });
 * logger.warn('Deprecated method used');
 * logger.debug('Debug information');
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  error: (message: string, error?: any, context?: Record<string, any>) => {
    if (typeof window === 'undefined') {
      // Server-side logging
      console.error(`[ERROR] ${message}`, error, context);
    } else {
      // Client-side logging
      console.error(`[ERROR] ${message}`, error, context);
    }
  },

  warn: (message: string, context?: Record<string, any>) => {
    if (typeof window === 'undefined') {
      console.warn(`[WARN] ${message}`, context);
    } else {
      console.warn(`[WARN] ${message}`, context);
    }
  },

  info: (message: string, context?: Record<string, any>) => {
    if (typeof window === 'undefined') {
      console.log(`[INFO] ${message}`, context);
    } else {
      console.log(`[INFO] ${message}`, context);
    }
  },

  debug: (message: string, context?: Record<string, any>) => {
    if (isDevelopment) {
      if (typeof window === 'undefined') {
        console.log(`[DEBUG] ${message}`, context);
      } else {
        console.log(`[DEBUG] ${message}`, context);
      }
    }
  },

  // For analytics events that should not be logged in console
  track: (event: string, properties?: Record<string, any>) => {
    if (isDevelopment) {
      console.log(`[TRACK] ${event}`, properties);
    }
    // In production, this would send to analytics service
  },
};

// TODO: Once @repo/observability is properly configured:
// import { createServerObservability } from '@repo/observability/server/next';
// import { createClientObservability } from '@repo/observability/client/next';
// Replace the logger implementation with proper observability
