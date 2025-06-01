import 'server-only';

import { UpstashRedisAdapter } from './adapter';

// Re-export everything from the @upstash/redis package
export * from '@upstash/redis';

// Export our custom adapter and client
export { UpstashRedisAdapter } from './adapter';
export { redis, upstashRedisClientSingleton, createUpstashRedisFromEnv } from './client';

// Export a function to create a new adapter instance
export function createUpstashRedisAdapter(): UpstashRedisAdapter {
  return new UpstashRedisAdapter();
}