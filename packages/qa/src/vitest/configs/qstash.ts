import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import { nodePreset } from './presets';

/**
 * QStash testing configuration with local development server
 * This preset includes QStash development server setup for integration tests
 */
export const qstashPreset = defineConfig({
  ...nodePreset,
  test: {
    ...nodePreset.test,
    setupFiles: [
      resolve(import.meta.dirname, '../setup/qstash'),
      ...(nodePreset.test?.setupFiles || []),
    ],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  define: {
    // Ensure QStash environment variables are available
    'process.env.QSTASH_URL': '"http://localhost:8081"',
    'process.env.QSTASH_TOKEN':
      '"eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0="',
    'process.env.QSTASH_CURRENT_SIGNING_KEY': '"sig_7kYjw48mhY7kAjqNGcy6cr29RJ6r"',
    'process.env.QSTASH_NEXT_SIGNING_KEY': '"sig_5ZB6DVzB1wjE8S6rZ7eenA8Pdnhs"',
  },
});
