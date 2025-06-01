/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  plugins: [],
  test: {
    // Test files location
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/ios/**',
      '**/android/**',
      '**/generated/**',
    ],
    // Environment configuration
    environment: 'jsdom',
    // Setup files
    setupFiles: ['./vitest.setup.ts'],
    // Global test configuration
    globals: true,
    // Coverage configuration
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '.next/',
        'ios/',
        'android/',
        'generated/',
        '**/*.config.*',
        '**/*.setup.*',
        '**/__tests__/**',
      ],
    },
  },
  resolve: {
    alias: {
      // Add React Native Web alias for testing
      'react-native': 'react-native-web',
      // App-specific aliases - must match tsconfig.json
      '@': path.resolve(__dirname, './src'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/config': path.resolve(__dirname, './config'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
});