export * from './types.js';
export * from './client.js';
export * from './docker.js';

// Re-export main functions for convenience
export { createFirecrawlClient } from './client.js';
export { createFirecrawlDockerManager } from './docker.js';

// Default export for easy importing
export default {
  createFirecrawlClient: () => import('./client.js').then((m) => m.createFirecrawlClient),
  createFirecrawlDockerManager: () =>
    import('./docker.js').then((m) => m.createFirecrawlDockerManager),
};
