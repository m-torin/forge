// Centralized mock exports for all tests in the monorepo
// Import this file in your test setup to get all mocks

// Import all mock modules to ensure they're registered
// Note: Importing in a specific order to avoid dependency issues
import './ai';
import './analytics-monitoring';
import './auth';
import './browser';
import './cloud-services';
import './communication';
import './enhanced-forms';
import './environment';
import './firestore';
import './icons';
import './mantine-zod';
import './next';
import './node-modules';
import './payments';
import './prisma-consolidated';
import './third-party';
import './upstash-redis';
import './upstash-vector';
import './utilities';

// Import vi at the top level since we're in ESM
import { vi } from 'vitest';

// Re-export specific utilities from each mock module
export * from './ai';
export * from './analytics-monitoring';
export * from './cloud-services';
export * from './communication';
export * from './enhanced-forms';
export * from './environment';
export * from './firestore';
export * from './icons';
export * from './mantine-zod';
export * from './next';
export * from './payments';
export * from './prisma-consolidated';
export * from './third-party';
export * from './upstash-redis';
export * from './upstash-vector';
export * from './utilities';

// Master reset function
export const resetAllMocks = () => {
  vi.clearAllMocks();
};
