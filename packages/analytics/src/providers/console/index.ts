/**
 * Console provider - works in both client and server environments
 * Useful for development and debugging
 */

import { logDebug, logWarn } from '@repo/observability';
import type { AnalyticsProvider, ProviderConfig } from '../../shared/types/types';
import type { ConsoleConfig } from './types';

export class ConsoleProvider implements AnalyticsProvider {
  readonly name = 'console';
  private config: ConsoleConfig;
  private isInitialized = false;

  constructor(config: ProviderConfig) {
    this.config = {
      prefix: '[Analytics]',
      logLevel: 'info',
      colorize: config.options?.enableColors ?? false,
      ...config.options,
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.log('Console Analytics Provider initialized', {
      config: this.config,
    });

    this.isInitialized = true;
  }

  async track(event: string, properties: any = {}, _context?: any): Promise<void> {
    if (!this.isInitialized) {
      logWarn('Console provider not initialized', {
        provider: 'console',
        operation: 'track',
        event,
      });
      return;
    }

    this.log('TRACK', {
      event,
      properties,
      timestamp: new Date().toISOString(),
    });
  }

  async identify(userId: string, traits: any = {}, _context?: any): Promise<void> {
    if (!this.isInitialized) {
      logWarn('Console provider not initialized', {
        provider: 'console',
        operation: 'identify',
        userId,
      });
      return;
    }

    this.log('IDENTIFY', {
      timestamp: new Date().toISOString(),
      traits,
      userId,
    });
  }

  async page(name?: string, properties: any = {}, _context?: any): Promise<void> {
    if (!this.isInitialized) {
      logWarn('Console provider not initialized', {
        provider: 'console',
        operation: 'page',
        metadata: { name },
      });
      return;
    }

    this.log('PAGE', {
      name,
      properties,
      timestamp: new Date().toISOString(),
    });
  }

  async group(groupId: string, traits: any = {}, _context?: any): Promise<void> {
    if (!this.isInitialized) {
      logWarn('Console provider not initialized', {
        provider: 'console',
        operation: 'group',
        metadata: { groupId },
      });
      return;
    }

    this.log('GROUP', {
      groupId,
      timestamp: new Date().toISOString(),
      traits,
    });
  }

  async alias(userId: string, previousId: string, _context?: any): Promise<void> {
    if (!this.isInitialized) {
      logWarn('Console provider not initialized', {
        provider: 'console',
        operation: 'alias',
        userId,
        metadata: { previousId },
      });
      return;
    }

    this.log('ALIAS', {
      previousId,
      timestamp: new Date().toISOString(),
      userId,
    });
  }

  private log(action: string, data: any): void {
    const { logLevel, prefix } = this.config;

    if (logLevel === 'error') return; // Don't log analytics in error-only mode

    const message = `${prefix} ${action}`;

    // Use analytics logger instead of console directly
    logDebug(message, {
      provider: 'console',
      operation: action.toLowerCase(),
      metadata: data,
    });
  }
}
