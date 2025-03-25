/**
 * Vitest Presets for Next-Forge
 *
 * This file provides standardized vitest configurations for different types of packages
 * that can be imported directly in vitest.config.ts files.
 */

import path from 'path';
import { defineConfig, mergeConfig, UserConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { timeouts, filePatterns, environments } from '../constants/config.ts';

// Base configuration for any package
export function basePreset(
  customConfig: UserConfig = {},
  packageDir: string = process.cwd(),
): UserConfig {
  const baseConfig = defineConfig({
    test: {
      globals: true,
      environment: environments.test.node,
      include: filePatterns.testFiles.vitest,
      exclude: filePatterns.ignoredFiles,
      testTimeout: timeouts.test,
      hookTimeout: timeouts.hook,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'coverage/**',
          'dist/**',
          '**/node_modules/**',
          '**/*.d.ts',
          'test/**',
          'tests/**',
          '**/__tests__/**',
          '**/*.test.{ts,tsx}',
          '**/vitest.config.*',
        ],
        thresholds: {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(packageDir),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
  });

  return mergeConfig(baseConfig, customConfig);
}

// React-specific preset
export function reactPreset(
  customConfig: UserConfig = {},
  packageDir: string = process.cwd(),
): UserConfig {
  const reactConfig = defineConfig({
    plugins: [react()],
    test: {
      environment: environments.test.jsdom,
    },
  });

  // First apply react config, then merge with custom config
  return basePreset(mergeConfig(reactConfig, customConfig), packageDir);
}

// Next.js preset
export function nextPreset(
  customConfig: UserConfig = {},
  packageDir: string = process.cwd(),
): UserConfig {
  const nextConfig = defineConfig({
    plugins: [react()],
    test: {
      environment: environments.test.jsdom,
    },
  });

  // First apply next config, then merge with custom config
  return basePreset(mergeConfig(nextConfig, customConfig), packageDir);
}

// Node.js preset for server packages
export function nodePreset(
  customConfig: UserConfig = {},
  packageDir: string = process.cwd(),
): UserConfig {
  const nodeConfig = defineConfig({
    test: {
      environment: environments.test.node,
    },
  });

  return basePreset(mergeConfig(nodeConfig, customConfig), packageDir);
}

// Export all presets
export default {
  basePreset,
  reactPreset,
  nextPreset,
  nodePreset,
};
