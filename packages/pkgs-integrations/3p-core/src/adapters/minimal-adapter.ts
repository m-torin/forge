/**
 * Minimal Base Adapter - Tree-shaking optimized
 * Only includes essential functionality, compose features as needed
 */

import type {
  AnalyticsEvent,
  BaseProviderConfig,
  GroupPayload,
  IdentifyPayload,
  PagePayload,
  ProviderType,
} from '../types';

export interface MinimalAdapter {
  readonly provider: ProviderType;
  readonly config: BaseProviderConfig;

  initialize(): Promise<void>;
  track(event: AnalyticsEvent): Promise<boolean>;
  identify(payload: IdentifyPayload): Promise<boolean>;
  group(payload: GroupPayload): Promise<boolean>;
  page(payload: PagePayload): Promise<boolean>;
  flush?(): Promise<boolean>;
  destroy(): Promise<void>;
}

export abstract class BaseMinimalAdapter implements MinimalAdapter {
  protected isInitialized = false;

  constructor(public readonly config: BaseProviderConfig) {}

  abstract get provider(): ProviderType;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.doInitialize();
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize ${this.provider} adapter: ${(error as Error).message}`);
    }
  }

  async track(event: AnalyticsEvent): Promise<boolean> {
    if (!this.isInitialized) await this.initialize();
    if (this.config.disabled) return true;

    try {
      return await this.doTrack(event);
    } catch (error) {
      this.log('error', 'Failed to track event', error);
      return false;
    }
  }

  async identify(payload: IdentifyPayload): Promise<boolean> {
    if (!this.isInitialized) await this.initialize();
    if (this.config.disabled) return true;

    try {
      return await this.doIdentify(payload);
    } catch (error) {
      this.log('error', 'Failed to identify user', error);
      return false;
    }
  }

  async group(payload: GroupPayload): Promise<boolean> {
    if (!this.isInitialized) await this.initialize();
    if (this.config.disabled) return true;

    try {
      return await this.doGroup(payload);
    } catch (error) {
      this.log('error', 'Failed to group', error);
      return false;
    }
  }

  async page(payload: PagePayload): Promise<boolean> {
    if (!this.isInitialized) await this.initialize();
    if (this.config.disabled) return true;

    try {
      return await this.doPage(payload);
    } catch (error) {
      this.log('error', 'Failed to track page', error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    return true; // Default no-op
  }

  async destroy(): Promise<void> {
    try {
      await this.doDestroy();
    } catch (error) {
      this.log('error', 'Failed to destroy adapter', error);
    }
    this.isInitialized = false;
  }

  // Abstract methods for providers to implement
  protected abstract doInitialize(): Promise<void>;
  protected abstract doTrack(event: AnalyticsEvent): Promise<boolean>;
  protected abstract doIdentify(payload: IdentifyPayload): Promise<boolean>;
  protected abstract doGroup(payload: GroupPayload): Promise<boolean>;
  protected abstract doPage(payload: PagePayload): Promise<boolean>;
  protected abstract doDestroy(): Promise<void>;

  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.config.debug && level === 'debug') return;

    const prefix = `[3p-${this.provider}]`;
    switch (level) {
      case 'debug':
        console.debug(prefix, message, data);
        break;
      case 'info':
        console.info(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'error':
        console.error(prefix, message, data);
        break;
    }
  }
}
