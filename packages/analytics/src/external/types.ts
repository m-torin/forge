/**
 * Core types for the multi-provider analytics system
 */

export interface ProviderConfig {
  // Provider-specific required fields
  apiKey?: string;
  writeKey?: string;
  measurementId?: string;
  token?: string;
  
  // Optional configuration
  events?: string[] | 'all';
  options?: Record<string, any>;
  
  // No 'enabled' field - presence = enabled
}

export interface AnalyticsProvider {
  readonly name: string;
  
  initialize(config: ProviderConfig): Promise<void>;
  track(event: string, properties: any): Promise<void>;
  
  // Optional methods
  identify?(userId: string, traits: any): Promise<void>;
  page?(name: string, properties: any): Promise<void>;
  group?(groupId: string, traits: any): Promise<void>;
  alias?(userId: string, previousId: string): Promise<void>;
}

export interface AnalyticsConfig {
  providers: Record<string, ProviderConfig>;
}

export interface TrackingOptions {
  // Override: add providers not in global config
  providers?: Record<string, ProviderConfig>;
  
  // Use shorthand for configured providers only
  only?: string[];
  
  // Send to all except these
  exclude?: string[];
}

export type ProviderFactory = (config: ProviderConfig) => AnalyticsProvider;

export type ProviderRegistry = Record<string, ProviderFactory>;

export interface AnalyticsContext {
  userId?: string;
  sessionId?: string;
  organizationId?: string;
  environment?: string;
  [key: string]: any;
}