/**
 * Vercel provider types
 */

export interface VercelConfig {
  // Vercel Analytics doesn't require configuration in most cases
  // It auto-detects the environment and deployment context
  options?: VercelOptions;
}

export interface VercelOptions {
  // Vercel Web Analytics options
  debug?: boolean;
  disabled?: boolean;

  // Custom event tracking options
  beforeSend?: (event: any) => any | null;

  // Advanced options
  mode?: 'auto' | 'development' | 'production';
  framework?: string;
  dsn?: string;
}
