/**
 * PostHog Feature Flag Provider
 * Implements standardized feature flag interface for PostHog
 */

import { FeatureFlagError } from '../feature-flags/types';

import type {
  FeatureFlagProvider,
  FlagConfig,
  FlagContext,
  FlagEvaluationResult,
  FlagValue,
} from '../feature-flags/types';

export class PostHogFlagProvider implements FeatureFlagProvider {
  readonly name = 'posthog';

  private config: FlagConfig;
  private client: any = null;
  private context: FlagContext = {};
  private isInitialized = false;
  private isClientSide: boolean;

  constructor(config: FlagConfig) {
    this.config = config;
    this.isClientSide = typeof window !== 'undefined';
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  async initialize(context?: FlagContext): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (this.isClientSide) {
        await this.initializeClient();
      } else {
        await this.initializeServer();
      }

      if (context) {
        this.setContext(context);
      }

      this.isInitialized = true;
    } catch (error) {
      throw new FeatureFlagError(
        'Failed to initialize PostHog feature flags',
        'PROVIDER_NOT_INITIALIZED',
        'posthog',
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  async close(): Promise<void> {
    if (this.client && this.client.shutdown) {
      await this.client.shutdown();
    }
    this.isInitialized = false;
  }

  // ============================================================================
  // FLAG EVALUATION
  // ============================================================================

  async getFlag<T = FlagValue>(
    key: string,
    defaultValue: T,
    context?: FlagContext,
  ): Promise<FlagEvaluationResult<T>> {
    if (!this.isInitialized) {
      throw new FeatureFlagError(
        'PostHog provider not initialized',
        'PROVIDER_NOT_INITIALIZED',
        'posthog',
        key,
      );
    }

    const evaluationContext = { ...this.context, ...context };
    const startTime = Date.now();

    try {
      let value: any;
      let reason: any = 'unknown';

      if (this.isClientSide) {
        // Client-side evaluation
        if (this.client && this.client.getFeatureFlag) {
          value = this.client.getFeatureFlag(key);
          reason = 'targeting_match';
        } else {
          value = defaultValue;
          reason = 'error';
        }
      } else {
        // Server-side evaluation
        const distinctId = this.getDistinctId(evaluationContext);
        if (this.client && distinctId) {
          value = await this.client.getFeatureFlag(key, distinctId);
          reason = 'targeting_match';
        } else {
          value = defaultValue;
          reason = 'error';
        }
      }

      // PostHog returns undefined/false for disabled flags
      if (value === undefined || value === false) {
        value = defaultValue;
        reason = 'off';
      }

      return {
        key,
        payload: await this.getPayload(key, evaluationContext),
        reason,
        source: 'network',
        timestamp: Date.now(),
        value: value as T,
        variant: typeof value === 'string' ? value : undefined,
      };
    } catch (error) {
      return {
        key,
        reason: 'error',
        source: 'fallback',
        timestamp: Date.now(),
        value: defaultValue,
      };
    }
  }

  async getAllFlags(context?: FlagContext): Promise<Record<string, FlagEvaluationResult>> {
    if (!this.isInitialized) {
      throw new FeatureFlagError(
        'PostHog provider not initialized',
        'PROVIDER_NOT_INITIALIZED',
        'posthog',
      );
    }

    const evaluationContext = { ...this.context, ...context };
    const results: Record<string, FlagEvaluationResult> = {};

    try {
      let flags: Record<string, any> = {};

      if (this.isClientSide) {
        // Client-side: get all flags
        if (this.client && this.client.getAllFlags) {
          flags = this.client.getAllFlags() || {};
        }
      } else {
        // Server-side: get all flags
        const distinctId = this.getDistinctId(evaluationContext);
        if (this.client && distinctId) {
          flags = (await this.client.getAllFlags(distinctId)) || {};
        }
      }

      // Convert to standardized format
      for (const [key, value] of Object.entries(flags)) {
        results[key] = {
          key,
          payload: await this.getPayload(key, evaluationContext),
          reason: 'targeting_match',
          source: 'network',
          timestamp: Date.now(),
          value,
          variant: typeof value === 'string' ? value : undefined,
        };
      }

      return results;
    } catch (error) {
      throw new FeatureFlagError(
        'Failed to get all flags from PostHog',
        'EVALUATION_ERROR',
        'posthog',
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  async isEnabled(key: string, context?: FlagContext): Promise<boolean> {
    try {
      const result = await this.getFlag(key, false, context);
      return Boolean(result.value);
    } catch (error) {
      return false;
    }
  }

  async getVariant(
    key: string,
    context?: FlagContext,
  ): Promise<{ variant: string; payload?: any } | null> {
    try {
      const result = await this.getFlag(key, null, context);

      if (result.value && typeof result.value === 'string') {
        return {
          payload: result.payload,
          variant: result.value,
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // ============================================================================
  // CONTEXT MANAGEMENT
  // ============================================================================

  setContext(context: FlagContext): void {
    this.context = { ...context };

    if (this.isClientSide && this.client) {
      // Update PostHog client context
      if (context.userId && this.client.identify) {
        this.client.identify(context.userId, context.attributes || {});
      }

      if (context.groups && this.client.group) {
        Object.entries(context.groups).forEach(([groupType, groupId]) => {
          this.client.group(groupType, groupId);
        });
      }
    }
  }

  updateContext(updates: Partial<FlagContext>): void {
    this.context = { ...this.context, ...updates };

    if (this.isClientSide && this.client) {
      // Update PostHog client context
      if (updates.userId && this.client.identify) {
        this.client.identify(updates.userId, updates.attributes || {});
      }

      if (updates.groups && this.client.group) {
        Object.entries(updates.groups).forEach(([groupType, groupId]) => {
          this.client.group(groupType, groupId);
        });
      }
    }
  }

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================

  onFlagChange?(key: string, callback: (result: FlagEvaluationResult) => void): () => void {
    if (!this.isClientSide || !this.client || !this.client.onFeatureFlags) {
      return () => {}; // No-op for server-side or unsupported
    }

    // PostHog feature flag change listener
    const unsubscribe = this.client.onFeatureFlags(() => {
      this.getFlag(key, null)
        .then(callback)
        .catch(() => {});
    });

    return unsubscribe || (() => {});
  }

  // ============================================================================
  // ANALYTICS INTEGRATION
  // ============================================================================

  trackExposure?(key: string, result: FlagEvaluationResult, context?: FlagContext): void {
    try {
      if (this.client && this.client.capture) {
        this.client.capture('$feature_flag_called', {
          $feature_flag: key,
          $feature_flag_reason: result.reason,
          $feature_flag_response: result.value,
          $feature_flag_variant: result.variant,
          ...context?.attributes,
        });
      }
    } catch (error) {
      // Silently fail exposure tracking
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async initializeClient(): Promise<void> {
    try {
      const posthog = await import('posthog-js');
      this.client = posthog.default;

      // Initialize if not already done
      if (!this.client.has_opted_out_capturing && !this.client._isInitialized) {
        this.client.init(this.config.options?.apiKey, {
          api_host: this.config.options?.apiHost || 'https://app.posthog.com',
          ...this.config.options,
        });
      }
    } catch (error) {
      throw new Error('PostHog client SDK not available. Install with: npm install posthog-js');
    }
  }

  private async initializeServer(): Promise<void> {
    try {
      const { PostHog } = await import('posthog-node');
      this.client = new PostHog(this.config.options?.apiKey || '', {
        flushAt: 1,
        flushInterval: 0,
        host: this.config.options?.apiHost || 'https://app.posthog.com',
        ...this.config.options,
      });
    } catch (error) {
      throw new Error('PostHog server SDK not available. Install with: npm install posthog-node');
    }
  }

  private getDistinctId(context: FlagContext): string | null {
    return (
      context.distinctId ||
      context.userId ||
      context.anonymousId ||
      this.context.distinctId ||
      this.context.userId ||
      this.context.anonymousId ||
      null
    );
  }

  private async getPayload(key: string, context: FlagContext): Promise<any> {
    try {
      if (this.isClientSide) {
        if (this.client && this.client.getFeatureFlagPayload) {
          return this.client.getFeatureFlagPayload(key);
        }
      } else {
        const distinctId = this.getDistinctId(context);
        if (this.client && this.client.getFeatureFlagPayload && distinctId) {
          return await this.client.getFeatureFlagPayload(key, distinctId);
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
