/**
 * Transport utilities exports
 * Centralized exports for transport configuration and presets
 */

// Main transport exports
export {
  autoConfigureTransport,
  createAuthenticatedTransport,
  createDevelopmentTransport,
  createProductionTransport,
  defaultTransport,
  transportFactory,
  transportPresets,
  type TransportConfig,
} from './default';

// Convenience aliases
export { createTransport, devTransport, prodTransport, smartTransport } from './default';
