import { env } from '../env';

export interface QStashConfig {
  url: string;
  token: string;
  currentSigningKey: string;
  nextSigningKey: string;
  mode: 'local' | 'production';
}

/**
 * Determine if we should use local QStash based on environment
 */
function shouldUseLocalQStash(): boolean {
  // Check environment variable first
  if (process.env.NEXT_PUBLIC_USE_LOCAL_QSTASH === 'true') {
    return true;
  }
  
  // Check for development mode
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Production default
  return false;
}

/**
 * Get QStash configuration based on environment
 */
export async function getQStashConfig(): Promise<QStashConfig> {
  const useLocalQStash = shouldUseLocalQStash();
  
  if (useLocalQStash) {
    // Local QStash CLI configuration
    return {
      url: env.QSTASH_URL || 'http://localhost:8080',
      token: env.QSTASH_TOKEN || 'eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=',
      currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY || 'sig_7RvLjqfZBvP5KEUimQCE1pvpLuou',
      nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY || 'sig_7W3ZNbfKWk5NWwEs3U4ixuQ7fxwE',
      mode: 'local',
    };
  } else {
    // Production QStash configuration
    if (!env.QSTASH_TOKEN || !env.QSTASH_CURRENT_SIGNING_KEY || !env.QSTASH_NEXT_SIGNING_KEY) {
      throw new Error('Production QStash environment variables are required when not using local mode');
    }
    
    return {
      url: 'https://qstash.upstash.io',
      token: env.QSTASH_TOKEN,
      currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
      mode: 'production',
    };
  }
}

/**
 * Get QStash configuration for client-side display
 */
export async function getQStashConfigForDisplay() {
  const config = await getQStashConfig();
  
  return {
    mode: config.mode,
    url: config.url,
    // Don't expose sensitive tokens on client
    hasToken: !!config.token,
    hasSigningKeys: !!(config.currentSigningKey && config.nextSigningKey),
  };
}