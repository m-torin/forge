/**
 * Console provider - works in both client and server environments
 * Useful for development and debugging
 */

import type { AnalyticsProvider, ProviderConfig } from '../types';
import type { ConsoleConfig } from './types';

export class ConsoleProvider implements AnalyticsProvider {
  readonly name = 'console';
  private config: ConsoleConfig;
  private isInitialized = false;

  constructor(config: ProviderConfig) {
    this.config = {
      options: {
        prefix: '[Analytics]',
        enableColors: typeof window === 'undefined', // Enable colors in Node.js by default
        logLevel: 'info',
        pretty: true,
        ...config.options
      }
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.log('Console Analytics Provider initialized', {
      environment: typeof window === 'undefined' ? 'server' : 'client',
      config: this.config.options
    });

    this.isInitialized = true;
  }

  async track(event: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Console provider not initialized');
      return;
    }

    this.log('TRACK', {
      event,
      properties,
      timestamp: new Date().toISOString()
    });
  }

  async identify(userId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Console provider not initialized');
      return;
    }

    this.log('IDENTIFY', {
      userId,
      traits,
      timestamp: new Date().toISOString()
    });
  }

  async page(name?: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Console provider not initialized');
      return;
    }

    this.log('PAGE', {
      name,
      properties,
      timestamp: new Date().toISOString()
    });
  }

  async group(groupId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Console provider not initialized');
      return;
    }

    this.log('GROUP', {
      groupId,
      traits,
      timestamp: new Date().toISOString()
    });
  }

  async alias(userId: string, previousId: string): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Console provider not initialized');
      return;
    }

    this.log('ALIAS', {
      userId,
      previousId,
      timestamp: new Date().toISOString()
    });
  }

  private log(action: string, data: any): void {
    const { prefix, enableColors, logLevel, pretty } = this.config.options!;
    
    if (logLevel === 'error') return; // Don't log analytics in error-only mode

    const message = `${prefix} ${action}`;

    if (pretty) {
      if (enableColors && typeof window === 'undefined') {
        // Node.js with colors
        console.log(`\x1b[36m${message}\x1b[0m`, JSON.stringify(data, null, 2));
      } else {
        // Browser or Node.js without colors
        console.group(message);
        console.log(data);
        console.groupEnd();
      }
    } else {
      // Simple one-line format
      console.log(message, data);
    }
  }
}