/**
 * Base adapter for 3rd party analytics integrations
 */

import type {
  AnalyticsEvent,
  BaseProviderConfig,
  BatchingConfig,
  GroupPayload,
  IdentifyPayload,
  PagePayload,
  PrivacyConfig,
  ProviderAdapter,
  ProviderType,
  RetryConfig,
} from '../types';

import { EventBatcher, createBatcher } from '../utils/batching';
import { convertEvent, convertIdentify } from '../utils/conversion';
import { PrivacyManager, createPrivacyManager } from '../utils/privacy';
import { CircuitBreaker, RetryManager, createRetryManager } from '../utils/retry';
import { validateEvent, validateGroup, validateIdentify, validatePage } from '../utils/validation';

export abstract class BaseProviderAdapter implements ProviderAdapter {
  protected batcher?: EventBatcher;
  protected privacyManager: PrivacyManager;
  protected retryManager: RetryManager;
  protected circuitBreaker: CircuitBreaker;
  protected isInitialized = false;

  constructor(
    public readonly config: BaseProviderConfig,
    protected batchingConfig?: BatchingConfig,
    protected privacyConfig?: PrivacyConfig,
    protected retryConfig?: RetryConfig,
  ) {
    this.privacyManager = createPrivacyManager(
      privacyConfig || {
        anonymizeIp: true,
        respectDoNotTrack: true,
        gdprCompliant: true,
        ccpaCompliant: true,
        cookieConsent: true,
      },
    );

    this.retryManager = createRetryManager(
      retryConfig || {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2,
        maxRetryDelay: 30000,
      },
    );

    this.circuitBreaker = new CircuitBreaker(5, 60000);

    if (batchingConfig?.enabled) {
      this.batcher = createBatcher(batchingConfig, this.processBatch.bind(this));
    }
  }

  abstract get provider(): ProviderType;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.doInitialize();
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize ${this.provider} adapter: ${(error as Error).message}`);
    }
  }

  async track(event: AnalyticsEvent): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.config.disabled) {
      return true;
    }

    // Privacy check
    if (!this.privacyManager.canTrack('analytics')) {
      return true; // Silently succeed if tracking not allowed
    }

    // Validate event
    const validation = validateEvent(event);
    if (!validation.valid) {
      console.warn(`Invalid event for ${this.provider}:`, validation.errors);
      return false;
    }

    const sanitizedEvent = validation.sanitized!;
    const anonymizedEvent = this.privacyManager.anonymizeData(sanitizedEvent);

    try {
      if (this.batcher) {
        // Add to batch
        return this.batcher.add({
          type: 'track',
          payload: anonymizedEvent,
          timestamp: new Date(),
        });
      } else {
        // Send immediately
        return await this.circuitBreaker.execute(() =>
          this.retryManager.execute(() => this.doTrack(anonymizedEvent)),
        );
      }
    } catch (error) {
      console.error(`Failed to track event in ${this.provider}:`, error);
      return false;
    }
  }

  async identify(payload: IdentifyPayload): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.config.disabled) {
      return true;
    }

    // Privacy check
    if (!this.privacyManager.canTrack('analytics')) {
      return true;
    }

    // Validate payload
    const validation = validateIdentify(payload);
    if (!validation.valid) {
      console.warn(`Invalid identify payload for ${this.provider}:`, validation.errors);
      return false;
    }

    const sanitizedPayload = validation.sanitized!;
    const anonymizedPayload = this.privacyManager.anonymizeData(sanitizedPayload);

    try {
      if (this.batcher) {
        return this.batcher.add({
          type: 'identify',
          payload: anonymizedPayload,
          timestamp: new Date(),
        });
      } else {
        return await this.circuitBreaker.execute(() =>
          this.retryManager.execute(() => this.doIdentify(anonymizedPayload)),
        );
      }
    } catch (error) {
      console.error(`Failed to identify user in ${this.provider}:`, error);
      return false;
    }
  }

  async group(payload: GroupPayload): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.config.disabled) {
      return true;
    }

    // Privacy check
    if (!this.privacyManager.canTrack('analytics')) {
      return true;
    }

    // Validate payload
    const validation = validateGroup(payload);
    if (!validation.valid) {
      console.warn(`Invalid group payload for ${this.provider}:`, validation.errors);
      return false;
    }

    const sanitizedPayload = validation.sanitized!;
    const anonymizedPayload = this.privacyManager.anonymizeData(sanitizedPayload);

    try {
      if (this.batcher) {
        return this.batcher.add({
          type: 'group',
          payload: anonymizedPayload,
          timestamp: new Date(),
        });
      } else {
        return await this.circuitBreaker.execute(() =>
          this.retryManager.execute(() => this.doGroup(anonymizedPayload)),
        );
      }
    } catch (error) {
      console.error(`Failed to group in ${this.provider}:`, error);
      return false;
    }
  }

  async page(payload: PagePayload): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.config.disabled) {
      return true;
    }

    // Privacy check
    if (!this.privacyManager.canTrack('analytics')) {
      return true;
    }

    // Validate payload
    const validation = validatePage(payload);
    if (!validation.valid) {
      console.warn(`Invalid page payload for ${this.provider}:`, validation.errors);
      return false;
    }

    const sanitizedPayload = validation.sanitized!;
    const anonymizedPayload = this.privacyManager.anonymizeData(sanitizedPayload);

    try {
      if (this.batcher) {
        return this.batcher.add({
          type: 'page',
          payload: anonymizedPayload,
          timestamp: new Date(),
        });
      } else {
        return await this.circuitBreaker.execute(() =>
          this.retryManager.execute(() => this.doPage(anonymizedPayload)),
        );
      }
    } catch (error) {
      console.error(`Failed to track page in ${this.provider}:`, error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    if (this.batcher) {
      return await this.batcher.flush();
    }
    return true;
  }

  async destroy(): Promise<void> {
    if (this.batcher) {
      this.batcher.destroy();
    }

    try {
      await this.doDestroy();
    } catch (error) {
      console.error(`Failed to destroy ${this.provider} adapter:`, error);
    }

    this.isInitialized = false;
  }

  // Protected methods for subclasses to implement
  protected abstract doInitialize(): Promise<void>;
  protected abstract doTrack(event: AnalyticsEvent): Promise<boolean>;
  protected abstract doIdentify(payload: IdentifyPayload): Promise<boolean>;
  protected abstract doGroup(payload: GroupPayload): Promise<boolean>;
  protected abstract doPage(payload: PagePayload): Promise<boolean>;
  protected abstract doDestroy(): Promise<void>;

  // Batch processing
  private async processBatch(batch: any[]): Promise<boolean> {
    try {
      const results = await Promise.allSettled(
        batch.map(async item => {
          switch (item.type) {
            case 'track':
              return this.circuitBreaker.execute(() =>
                this.retryManager.execute(() => this.doTrack(item.payload)),
              );
            case 'identify':
              return this.circuitBreaker.execute(() =>
                this.retryManager.execute(() => this.doIdentify(item.payload)),
              );
            case 'group':
              return this.circuitBreaker.execute(() =>
                this.retryManager.execute(() => this.doGroup(item.payload)),
              );
            case 'page':
              return this.circuitBreaker.execute(() =>
                this.retryManager.execute(() => this.doPage(item.payload)),
              );
            default:
              return false;
          }
        }),
      );

      const successCount = results.filter(
        result => result.status === 'fulfilled' && result.value === true,
      ).length;

      return successCount === batch.length;
    } catch (error) {
      console.error(`Batch processing failed for ${this.provider}:`, error);
      return false;
    }
  }

  // Helper methods
  protected convertEventForProvider(event: AnalyticsEvent): any {
    return convertEvent(event, this.provider);
  }

  protected convertIdentifyForProvider(payload: IdentifyPayload): any {
    return convertIdentify(payload, this.provider);
  }

  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.config.debug && level === 'debug') {
      return;
    }

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
