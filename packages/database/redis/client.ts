import 'server-only';
import { Redis } from '@upstash/redis';

// Environment variables for Upstash Redis
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  throw new Error(
    'Missing Upstash Redis environment variables. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.',
  );
}

// Create a singleton Upstash Redis client
function createUpstashRedisClient() {
  return new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });
}

// Alternative: Use environment variables directly
function createUpstashRedisFromEnv() {
  return Redis.fromEnv();
}

// Singleton instance
let upstashRedis: Redis | null = null;

export function upstashRedisClientSingleton(): Redis {
  if (!upstashRedis) {
    upstashRedis = createUpstashRedisClient();
  }
  return upstashRedis;
}

// Export the singleton instance
export const redis = upstashRedisClientSingleton();

// Also export the alternative client creation method
export { createUpstashRedisFromEnv };
