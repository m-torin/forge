'use client';

import { logError, logWarn } from '@repo/observability';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import type { CollaborationServerConfig, ProviderFactory } from '../types/index';

/**
 * Factory for creating Y.js providers with consistent configuration
 */
export class YjsProviderFactory implements ProviderFactory {
  private config: CollaborationServerConfig;

  constructor(config: CollaborationServerConfig) {
    this.config = config;
  }

  /**
   * Create a WebSocket provider for real-time collaboration
   */
  createWebsocketProvider(
    websocketUrl: string,
    documentId: string,
    ydoc: Y.Doc,
    options: {
      connect?: boolean;
      authToken?: string;
      roomPrefix?: string;
      params?: Record<string, string>;
    } = {},
  ): WebsocketProvider {
    const {
      connect = true,
      authToken = this.config.authToken,
      roomPrefix = this.config.roomPrefix || '',
      params = {},
    } = options;

    // Construct room name with optional prefix
    const roomName = roomPrefix ? `${roomPrefix}:${documentId}` : documentId;

    // Add auth token to connection params if provided
    const connectionParams: Record<string, string> = { ...params };
    if (authToken) {
      connectionParams.auth = authToken;
    }

    const provider = new WebsocketProvider(websocketUrl, roomName, ydoc, {
      connect,
      params: connectionParams,
    });

    // Add error handling
    (provider as any).on('connection-error', (error: Error, _provider: WebsocketProvider) => {
      logError('WebSocket connection error:', error);
    });

    (provider as any).on(
      'connection-close',
      (event: CloseEvent | null, _provider: WebsocketProvider) => {
        if (event && event.code !== 1000) {
          logWarn('WebSocket connection closed unexpectedly:', {
            code: event.code,
            reason: event.reason,
          });
        }
      },
    );

    return provider;
  }

  /**
   * Create IndexedDB persistence for offline storage
   */
  createPersistence(documentId: string, ydoc: Y.Doc): IndexeddbPersistence {
    const persistence = new IndexeddbPersistence(documentId, ydoc);

    // Add error handling
    persistence.on('error', (error: Error) => {
      logError('IndexedDB persistence error:', error);
    });

    return persistence;
  }

  /**
   * Update factory configuration
   */
  updateConfig(config: Partial<CollaborationServerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): CollaborationServerConfig {
    return { ...this.config };
  }
}

/**
 * Default provider factory instance
 */
export const defaultProviderFactory = new YjsProviderFactory({
  websocketUrl: 'ws://localhost:1234',
  apiUrl: 'http://localhost:1234/api',
  roomPrefix: 'collab',
});

/**
 * Utility function to create a provider factory with custom configuration
 */
export function createProviderFactory(config: CollaborationServerConfig): YjsProviderFactory {
  return new YjsProviderFactory(config);
}

/**
 * Utility function to validate WebSocket URL
 */
export function validateWebsocketUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'ws:' || parsedUrl.protocol === 'wss:';
  } catch {
    return false;
  }
}

/**
 * Utility function to generate a secure document ID
 */
export function generateDocumentId(prefix = 'doc'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Utility function to clean up providers
 */
export function cleanupProviders(
  provider?: WebsocketProvider | null,
  persistence?: IndexeddbPersistence | null,
): void {
  if (provider) {
    provider.disconnect();
    provider.destroy();
  }

  if (persistence) {
    persistence.destroy();
  }
}
