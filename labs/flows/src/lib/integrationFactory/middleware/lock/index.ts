// lock/index.ts
import { createLockMiddleware, DEFAULT_OPTIONS } from './middleware';
import { LockClient } from './types';

export type { Lock, LockClient, LockOptions } from './types';
export {
  LockMiddleware,
  createLockMiddleware,
  isResourceLocked,
  DEFAULT_OPTIONS,
} from './middleware';

// Export a factory with default configuration
export const createDefaultLockMiddleware = (client: LockClient) =>
  createLockMiddleware(client, DEFAULT_OPTIONS);
