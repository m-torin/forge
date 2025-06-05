/**
 * Core types for the multi-provider analytics system
 */

// Import emitter types for the interface
import type {
  EmitterAliasPayload,
  EmitterGroupPayload,
  EmitterIdentifyPayload,
  EmitterPagePayload,
  EmitterPayload,
  EmitterTrackPayload,
} from '../emitters/emitter-types';

export interface ProviderConfig {
  // Provider-specific required fields
  apiKey?: string;
  measurementId?: string;
  token?: string;
  writeKey?: string;

  // Optional configuration
  events?: string[] | 'all';
  options?: Record<string, any>;

  // No 'enabled' field - presence = enabled
}

export interface AnalyticsProvider {
  readonly name: string;

  initialize(config: ProviderConfig): Promise<void>;
  track(event: string, properties: any, context?: AnalyticsContext): Promise<void>;

  alias?(userId: string, previousId: string, context?: AnalyticsContext): Promise<void>;
  group?(groupId: string, traits: any, context?: AnalyticsContext): Promise<void>;
  // Optional methods
  identify?(userId: string, traits: any, context?: AnalyticsContext): Promise<void>;
  page?(name: string, properties: any, context?: AnalyticsContext): Promise<void>;

  // Optional context setter for providers that need global context
  setContext?(context: AnalyticsContext): void;
}

export interface AnalyticsConfig {
  debug?: boolean;
  nextjs?: {
    // Next.js specific configuration
    deferUntilConsent?: boolean;
    bufferEvents?: boolean;
    maxBufferSize?: number;
    checkConsent?: () => boolean | Promise<boolean>;
    posthog?: {
      bootstrap?: any;
      apiKey?: string;
      host?: string;
    };
    [key: string]: any;
  };
  onError?: (
    error: unknown,
    context: { provider: string; method: string; [key: string]: any },
  ) => void;
  onInfo?: (message: string) => void;
  providers: Record<string, ProviderConfig>;
}

export interface TrackingOptions {
  // Override: add providers not in global config
  providers?: Record<string, ProviderConfig>;

  // Use shorthand for configured providers only
  only?: string[];

  // Send to all except these
  exclude?: string[];

  // Context to merge with global context
  context?: AnalyticsContext;
}

export type ProviderFactory = (config: ProviderConfig) => AnalyticsProvider;

export type ProviderRegistry = Record<string, ProviderFactory>;

export interface AnalyticsContext {
  [key: string]: any;
  environment?: string;
  organizationId?: string;
  sessionId?: string;
  userId?: string;
}

// Export AnalyticsManager type with emitter-first methods
export interface AnalyticsManager {
  getContext(): AnalyticsContext;
  initialize(): Promise<void>;
  setContext(context: AnalyticsContext): void;

  createEmitter(): (payload: EmitterPayload) => Promise<void>;
  // Primary emitter-first method
  emit(payload: EmitterPayload): Promise<void>;
  emitBatch(payloads: EmitterPayload[]): Promise<void>;

  // Methods with overloads for both emitter payloads and traditional calls
  track(payload: EmitterTrackPayload): Promise<void>;
  track(event: string, properties?: any, options?: TrackingOptions): Promise<void>;

  identify(payload: EmitterIdentifyPayload): Promise<void>;
  identify(userId: string, traits?: any, options?: TrackingOptions): Promise<void>;

  page(payload: EmitterPagePayload): Promise<void>;
  page(name?: string, properties?: any, options?: TrackingOptions): Promise<void>;

  group(payload: EmitterGroupPayload): Promise<void>;
  group(groupId: string, traits?: any, options?: TrackingOptions): Promise<void>;

  alias(payload: EmitterAliasPayload): Promise<void>;
  alias(userId: string, previousId: string, options?: TrackingOptions): Promise<void>;

  // Utility methods
  getActiveProviders(): string[];
  getProvider(name: string): AnalyticsProvider | undefined;

  // Legacy methods (kept for backward compatibility)
  processEmitterPayload(payload: any): Promise<void>;
  trackEcommerce(eventSpec: { name: string; properties: any }): Promise<void>;
}
