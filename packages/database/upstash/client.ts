import 'server-only';
import { Index } from '@upstash/vector';

// Create a singleton Upstash Vector client
function createUpstashVectorClient() {
  const UPSTASH_VECTOR_REST_URL = process.env.UPSTASH_VECTOR_REST_URL;
  const UPSTASH_VECTOR_REST_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!UPSTASH_VECTOR_REST_URL || !UPSTASH_VECTOR_REST_TOKEN) {
    throw new Error(
      'Missing Upstash Vector environment variables. Please set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN.',
    );
  }

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

// Export the singleton instance (lazy initialization)
let _upstashInstance: Index | null = null;
export const upstash: Index = new Proxy({} as Index, {
  get(_, prop) {
    if (!_upstashInstance) {
      _upstashInstance = upstashVectorClientSingleton();
    }
    return _upstashInstance[prop as keyof Index];
  },
});
