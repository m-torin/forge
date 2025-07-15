import { defineConfig } from 'tsup';

export default defineConfig([
  // Main library bundle (ESM + CJS)
  {
    entry: {
      index: 'src/external.ts', // External users get clean Editor API
      client: 'src/client.ts',
      'client-next': 'src/client-next.ts',
      server: 'src/server.ts',
      'server-next': 'src/server-next.ts',
      'server-edge': 'src/server-edge.ts',
      hooks: 'src/hooks/index.ts',
      providers: 'src/providers/index.ts',
      utils: 'src/utils/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    // Use .mjs for ESM since we require Node 20+
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.mjs' : '.cjs',
      };
    },
    external: [
      'react',
      'react-dom',
      'next',
      '@mantine/core',
      '@mantine/form',
      '@mantine/hooks',
      '@mantine/modals',
      '@mantine/notifications',
      '@repo/auth',
      '@repo/database',
      '@repo/observability',
    ],
    target: 'node20',
    minify: false,
    splitting: true,
  },

  // Components bundle (optimized for tree-shaking)
  {
    entry: {
      components: 'src/components/index.ts',
      'notion-editor': 'src/components/NotionEditor/index.ts',
      'embeddable-editor': 'src/components/EmbeddableNotionEditor/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    // Use .mjs for ESM since we require Node 20+
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.mjs' : '.cjs',
      };
    },
    external: [
      'react',
      'react-dom',
      'next',
      '@mantine/core',
      '@mantine/form',
      '@mantine/hooks',
      '@mantine/modals',
      '@mantine/notifications',
      '@repo/auth',
      '@repo/database',
      '@repo/observability',
    ],
    target: 'node20',
    minify: false,
    splitting: true,
    outDir: 'dist/components',
  },

  // Embeddable standalone bundle (IIFE for HTML)
  {
    entry: {
      'embeddable-standalone': 'src/components/EmbeddableNotionEditor/EmbeddableNotionEditor.tsx',
    },
    format: ['iife'],
    globalName: 'NotionEditor',
    dts: true,
    sourcemap: true,
    // Bundle everything for standalone usage
    external: [],
    target: 'es2020',
    minify: true,
    outDir: 'dist/standalone',
    platform: 'browser',
    // Inline styles and assets
    injectStyle: true,
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  },

  // React-optimized bundle (with embeddable editor)
  {
    entry: {
      'react-bundle': 'src/components/EmbeddableNotionEditor/EmbeddableNotionEditor.tsx',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    // Use .mjs for ESM since we require Node 20+
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.mjs' : '.cjs',
      };
    },
    external: [
      'react',
      'react-dom',
      '@mantine/core',
      '@mantine/form',
      '@mantine/hooks',
      '@mantine/modals',
      '@mantine/notifications',
    ],
    target: 'es2020',
    minify: false,
    splitting: false,
    outDir: 'dist/react',
    platform: 'browser',
    injectStyle: true,
  },

  // Next.js SSR bundle (with embeddable editor)
  {
    entry: {
      'nextjs-bundle': 'src/components/EmbeddableNotionEditor/EmbeddableNotionEditor.tsx',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    // Use .mjs for ESM since we require Node 20+
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.mjs' : '.cjs',
      };
    },
    external: [
      'react',
      'react-dom',
      'next',
      '@mantine/core',
      '@mantine/form',
      '@mantine/hooks',
      '@mantine/modals',
      '@mantine/notifications',
    ],
    target: 'node20',
    minify: false,
    splitting: false,
    outDir: 'dist/nextjs',
    platform: 'node',
    // Don't inject styles for SSR (handled by Next.js)
    injectStyle: false,
  },

  // Types-only bundle for external consumption
  {
    entry: {
      types: 'src/types/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: {
      only: true,
    },
    // Use .mjs for ESM since we require Node 20+
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.mjs' : '.cjs',
      };
    },
    outDir: 'dist/types',
  },
]);
