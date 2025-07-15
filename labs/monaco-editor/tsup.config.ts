// tsup.config.ts

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  external: ['react', '@mantine/core', '@mantine/hooks'],
  banner: { js: "'use client';" },
  sourcemap: true,
  clean: true,
  target: 'es2020',
});
