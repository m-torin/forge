import { defineConfig, type Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  banner: {
    js: "'use client'",
  },
  minify: true,
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
  },
  clean: true,
  splitting: false,
  sourcemap: true,
  external: ['react', 'react-dom'],
  esbuildOptions(options) {
    options.conditions = ['module'];
  },
  ...options,
}));
