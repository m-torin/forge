import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      include: ['stories/**/*.{ts,tsx}'],
      exclude: ['**/node_modules/**', '**/*.stories.{ts,tsx}']
    },
    deps: {
      optimizer: {
        web: {
          include: ['@storybook/testing-react', '@testing-library/react']
        }
      }
    },
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 2
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './stories')
    }
  }
})