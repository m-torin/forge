import 'server-only';

import { UpstashVectorAdapter } from './adapter';

// Re-export everything from the @upstash/vector package
export * from '@upstash/vector';

// Export our custom adapter and client
export { UpstashVectorAdapter } from './adapter';
export { upstash, upstashVectorClientSingleton } from './client';

// Export a function to create a new adapter instance
export function createUpstashVectorAdapter(): UpstashVectorAdapter {
  return new UpstashVectorAdapter();
}
