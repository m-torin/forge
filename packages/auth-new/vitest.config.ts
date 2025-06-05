import { defineConfig } from 'vitest/config';
import { createReactConfig } from '@repo/testing/config/react';

export default defineConfig(createReactConfig({
  setupFiles: ['./src/__tests__/setup.ts'],
}));