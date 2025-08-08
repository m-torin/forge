/**
 * Shared transport configuration for AI SDK v5 hooks
 * Provides consistent transport interface across all hooks
 */

// AI SDK v5 Transport Configuration
export interface V5TransportConfig {
  url?: string;
  headers?: Record<string, string> | Headers;
  body?: Record<string, unknown>;
  credentials?: 'omit' | 'same-origin' | 'include';
  fetch?: typeof globalThis.fetch;
}

/**
 * Base options for AI hooks with transport support
 */
export interface BaseAIHookOptions {
  api?: string;

  // V5 Transport-based configuration
  transport?: V5TransportConfig;

  // Legacy options for backward compatibility
  headers?: Record<string, string> | Headers;
  body?: Record<string, unknown>;
  credentials?: 'omit' | 'same-origin' | 'include';
  fetch?: typeof globalThis.fetch;

  // Common callback options
  onError?: (error: Error) => void;
  onRateLimit?: (retryAfter: number) => void;
}

/**
 * Helper to merge transport configuration with legacy options
 */
export function mergeTransportConfig(
  options: BaseAIHookOptions,
  defaultApi: string,
): {
  api: string;
  headers?: Record<string, string> | Headers;
  body?: Record<string, unknown>;
  credentials?: 'omit' | 'same-origin' | 'include';
  fetch?: typeof globalThis.fetch;
} {
  const { transport, api = defaultApi } = options;

  return transport
    ? {
        api: transport.url || api,
        headers: transport.headers || options.headers,
        body: transport.body || options.body,
        credentials: transport.credentials || options.credentials,
        fetch: transport.fetch || options.fetch,
      }
    : {
        api,
        headers: options.headers,
        body: options.body,
        credentials: options.credentials,
        fetch: options.fetch,
      };
}
