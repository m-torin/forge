// This file is kept for backward compatibility
// It re-exports from both client and server modules

export { hasPermission } from './api-key-client';
export { requireAuth, validateApiKey } from './api-key-server';
