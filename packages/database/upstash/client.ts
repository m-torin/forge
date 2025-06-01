import 'server-only';
import { Index } from '@upstash/vector';

// Environment variables for Upstash Vector
const UPSTASH_VECTOR_REST_URL = process.env.UPSTASH_VECTOR_REST_URL;
const UPSTASH_VECTOR_REST_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;

if (!UPSTASH_VECTOR_REST_URL || !UPSTASH_VECTOR_REST_TOKEN) {
  throw new Error(
    'Missing Upstash Vector environment variables. Please set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN.'
  );
}

// Create a singleton Upstash Vector client
function createUpstashVectorClient() {
  return new Index({
    url: UPSTASH_VECTOR_REST_URL,
    token: UPSTASH_VECTOR_REST_TOKEN,
  });
}

// Singleton instance
let upstashVector: Index | null = null;

export function upstashVectorClientSingleton(): Index {
  if (!upstashVector) {
    upstashVector = createUpstashVectorClient();
  }
  return upstashVector;
}

// Export the singleton instance
export const upstash = upstashVectorClientSingleton();