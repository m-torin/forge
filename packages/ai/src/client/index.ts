/**
 * Client-side AI exports (browser-safe)
 *
 * This file provides client-side AI functionality for browser environments.
 * All exports are browser-safe and do not use Node.js APIs.
 */

// Re-export browser-safe UI components and hooks
export * from '../ui/react';

// Re-export client-safe types
export type { VectorEnrichedMessage, VectorSearchResult } from './next';

// Browser-safe utilities
export { messageUtils } from '../core/utils';

// Re-export browser-safe shared utilities
export * from '../shared/client-safe-utils';

// Browser-safe tool schemas (no execution, just schemas)
export { schemas } from '../tools/schema-fragments';

// Type exports for client-side usage
export type { AIOperationConfig, AIOperationResult } from '../core/types';

// Browser-safe constants
export const CLIENT_CONSTANTS = {
  DEFAULT_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  DEFAULT_MODEL: 'gpt-4',
} as const;

/**
 * Client-safe error class
 */
export class ClientAIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'ClientAIError';
  }
}

/**
 * Browser-safe utility functions
 */
export const clientUtils = {
  /**
   * Generate a simple UUID (browser-safe)
   */
  generateId: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  /**
   * Simple delay utility
   */
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Format bytes for display
   */
  formatBytes: (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },
};
