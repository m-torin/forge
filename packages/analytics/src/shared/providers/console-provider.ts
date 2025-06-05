/**
 * Console provider - works in both client and server environments
 * Useful for development and debugging
 */

import type { AnalyticsProvider, ProviderConfig } from '../types/types';
import type { ConsoleConfig } from '../types/console-types';

export class ConsoleProvider implements AnalyticsProvider {
  readonly name = 'console';
  private config: ConsoleConfig;
  private isInitialized = false;

  constructor(config: ProviderConfig) {
    this.config = {
      options: {
        prefix: '[Analytics]',
        enableColors: config.options?.enableColors ?? false, // Explicit configuration
        logLevel: 'info',
        pretty: true,
        ...config.options
      }
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.log('Console Analytics Provider initialized', {
      config: this.config.options
    });

    this.isInitialized = true;
  }

  async track(event: string, properties: any = {}, context?: any): Promise<void> {
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

  async identify(userId: string, traits: any = {}, context?: any): Promise<void> {
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

  async page(name?: string, properties: any = {}, context?: any): Promise<void> {
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

  async group(groupId: string, traits: any = {}, context?: any): Promise<void> {
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

  async alias(userId: string, previousId: string, context?: any): Promise<void> {
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
      if (enableColors) {
        // With colors (typically Node.js environments)
        console.log(`\x1b[36m${message}\x1b[0m`, JSON.stringify(data, null, 2));
      } else {
        // Without colors - use grouping if available
        if (console.group) {
          console.group(message);
          console.log(data);
          console.groupEnd();
        } else {
          // Fallback for environments without console.group
          console.log(message, JSON.stringify(data, null, 2));
        }
      }
    } else {
      // Simple one-line format
      console.log(message, data);
    }
  }
}