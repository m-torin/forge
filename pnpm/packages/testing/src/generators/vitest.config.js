/**
 * Vitest Configuration Generator
 *
 * This module provides functions to dynamically generate vitest configurations
 * for different types of packages in the monorepo without relying on .js imports.
 */

import { defineConfig, mergeConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// Constants for common values
const COMMON_TEST_TIMEOUTS = {
  hookTimeout: 10000,
  testTimeout: 10000,
};

const COMMON_COVERAGE_EXCLUDES = [
  'coverage/**',
  'dist/**',
  '**/node_modules/**',
  '**/*.d.ts',
  'test/**',
  'tests/**',
  '**/__tests__/**',
  '**/*.test.{ts,tsx}',
  '**/vitest.config.*',
];

const COMMON_COVERAGE_THRESHOLDS = {
  statements: 90,
  branches: 90,
  functions: 90,
  lines: 90,
};

// Base configuration for any package
export function generateBaseConfig(customConfig = {}, packageDir = process.cwd()) {
  const baseConfig = defineConfig({
    test: {
      globals: true,
      environment: 'node',
      include: ['**/*.test.{ts,tsx}'],
      exclude: ['**/node_modules/**'],
      ...COMMON_TEST_TIMEOUTS,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: COMMON_COVERAGE_EXCLUDES,
        thresholds: COMMON_COVERAGE_THRESHOLDS,
      },
      // Improved watch mode configuration
      watch: {
        // Optimize ignored patterns for faster watching
        ignored: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**'],
        // Optimize polling settings based on filesystem type
        usePolling: false,
        // Ensure fast feedback loop
        killOnStale: true
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(packageDir),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      // Improve ESM interoperability
      conditions: ['import', 'module', 'node', 'default'],
    },
  });

  return mergeConfig(baseConfig, customConfig);
}

// React-specific configuration
export function generateReactConfig(customConfig = {}, packageDir = process.cwd()) {
  const reactConfig = defineConfig({
    plugins: [react()],
    test: {
      environment: 'jsdom',
    },
  });

  // First apply react config, then merge with custom config
  return generateBaseConfig(mergeConfig(reactConfig, customConfig), packageDir);
}

// Next.js configuration
export function generateNextConfig(customConfig = {}, packageDir = process.cwd()) {
  const nextConfig = defineConfig({
    plugins: [react()],
    test: {
      environment: 'jsdom',
    },
  });

  // First apply next config, then merge with custom config
  return generateBaseConfig(mergeConfig(nextConfig, customConfig), packageDir);
}

// Node.js configuration
export function generateNodeConfig(customConfig = {}, packageDir = process.cwd()) {
  const nodeConfig = defineConfig({
    test: {
      environment: 'node',
    },
  });

  return generateBaseConfig(mergeConfig(nodeConfig, customConfig), packageDir);
}

// Function to get the appropriate config based on type
export function getConfig(type = 'react', customConfig = {}, packageDir = process.cwd()) {
  switch (type) {
    case 'react':
      return generateReactConfig(customConfig, packageDir);
    case 'next':
      return generateNextConfig(customConfig, packageDir);
    case 'node':
      return generateNodeConfig(customConfig, packageDir);
    default:
      return generateBaseConfig(customConfig, packageDir);
  }
}
