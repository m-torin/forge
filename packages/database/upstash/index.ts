import 'server-only';

import { UpstashVectorAdapter } from './adapter';

// Export our custom adapter and client
export { UpstashVectorAdapter } from './adapter';

export { upstash, upstashVectorClientSingleton } from './client';
// Re-export everything from the @upstash/vector package
export * from '@upstash/vector';

// Export a function to create a new adapter instance
export function createUpstashVectorAdapter(): UpstashVectorAdapter {
  return new UpstashVectorAdapter();
}
