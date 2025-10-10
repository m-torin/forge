import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: false, // Disable CSS processing to avoid katex.css import errors
    server: {
      deps: {
        inline: ['streamdown'], // Force streamdown to be transformed
      },
    },
    coverage: {
      provider: 'v8',
      enabled: true,
      reportOnFailure: true,
      all: true,
      // Focus coverage on core utilities and provider helpers where tests exist
      include: [
        'src/providers/google.ts',
        'src/providers/perplexity.ts',
        'src/providers/openai.ts',
        'src/providers/anthropic.ts',
        'src/core/utils.ts',
        'src/index.ts',
      ],
      exclude: [
        '**/*.d.ts',
        'env.ts',
        'src/examples/**',
        'src/ui/**',
        'src/server/**',
        'src/generation/**',
        'src/mcp/**',
        'src/vector/**',
      ],
      thresholds: {
        lines: 100,
        statements: 100,
        functions: 100,
        branches: 100,
      },
    },
  },
});
