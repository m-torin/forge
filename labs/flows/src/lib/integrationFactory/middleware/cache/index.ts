// middleware/cache/index.ts
import { createCacheMiddleware } from './middleware';
import { MemoryCacheProvider } from './types';

export * from './types';
export { createCacheMiddleware } from './middleware';

// Export default configured middleware
const defaultCacheProvider = new MemoryCacheProvider();
export const cacheMiddleware = createCacheMiddleware(defaultCacheProvider);
export { MemoryCacheProvider };