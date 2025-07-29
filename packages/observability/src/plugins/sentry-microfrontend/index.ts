/**
 * Sentry Micro Frontend Plugin
 *
 * Provides specialized Sentry integration for micro frontend architectures.
 * Supports both host and child modes with automatic parent detection.
 */

export { createMultiplexedTransport } from './multiplexed-transport';
export { SentryMicroFrontendPlugin, createSentryMicroFrontendPlugin } from './plugin';
export type { MicroFrontendMode, SentryMicroFrontendConfig, ZoneConfig } from './types';
export { createZoneScope, detectCurrentZone, isHostEnvironment } from './utils';
