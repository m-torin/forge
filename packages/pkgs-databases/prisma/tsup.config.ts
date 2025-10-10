import { glob } from 'glob';
import { existsSync } from 'node:fs';
import { defineConfig } from 'tsup';

export default defineConfig(() => {
  // Auto-discover all schema files (only if generated directory exists)
  const inputSchemas = existsSync('generated/zod/schemas/objects')
    ? glob.sync('generated/zod/schemas/objects/*CreateInput.schema.ts')
    : [];
  const modelSchemas = existsSync('generated/zod/schemas/variants/pure')
    ? glob.sync('generated/zod/schemas/variants/pure/*.pure.ts')
    : [];

  const entryPairs = [
    ...inputSchemas.map(file => {
      const match = file.match(/([A-Z][a-z]+(?:[A-Z][a-z]+)*?)CreateInput/);
      if (!match) return null;
      const name = match[1].toLowerCase();
      return [`inputs/${name}`, file];
    }),
    ...modelSchemas.map(file => {
      const match = file.match(/([A-Z][a-z]+(?:[A-Z][a-z]+)*?)\.pure/);
      if (!match) return null;
      const name = match[1].toLowerCase();
      return [`models/${name}`, file];
    }),
  ].filter((pair): pair is [string, string] => pair !== null);

  const schemaEntry = Object.fromEntries(entryPairs);
  const hasSchemas = Object.keys(schemaEntry).length > 0;

  if (!hasSchemas) {
    console.warn(
      '[tsup] No generated Zod schemas detected. Skipping bundle build – run `pnpm --filter @repo/db-prisma generate` after Prisma generation to produce schema outputs.',
    );
  }

  const entry = hasSchemas ? schemaEntry : { 'build-stub': 'src/build-stub.ts' };

  return {
    entry,
    format: ['esm'],
    outDir: 'dist/zod',
    target: 'es2022',
    platform: 'browser',
    treeshake: hasSchemas,
    splitting: hasSchemas,
    banner: {
      js: '/* ESM MODULE */',
    },
    clean: hasSchemas,
    dts: false,
    external: [
      'zod',
      '@prisma/client',
      '@prisma/client/runtime',
      '@prisma/client/runtime/library',
      /.*\/generated\/client\/.*/,
    ],
    minify: false,
    keepNames: false,
    sourcemap: hasSchemas,
    shims: false,
    outExtension() {
      return { js: '.mjs' };
    },
    esbuildOptions(options) {
      options.format = 'esm';
      options.platform = hasSchemas ? 'neutral' : 'browser';
      options.target = 'es2022';

      options.minify = false;
      options.minifyIdentifiers = false;
      options.minifySyntax = false;
      options.minifyWhitespace = false;
      options.keepNames = false;
      options.treeShaking = hasSchemas;

      options.banner = {};
      options.footer = {};

      options.supported = {
        arrow: true,
        class: true,
        'const-and-let': true,
        destructuring: true,
        'for-of': true,
        generator: true,
        'object-extensions': true,
        'template-literal': true,
        'async-await': true,
        'dynamic-import': true,
        'import-meta': true,
        'object-rest-spread': true,
        'optional-chain': true,
        'nullish-coalescing': true,
        bigint: true,
        'top-level-await': true,
        'arbitrary-module-namespace-names': true,
      };

      options.mainFields = ['module', 'main'];
      options.resolveExtensions = ['.ts', '.tsx', '.mts'];
    },
    onSuccess: hasSchemas
      ? 'echo "✅ Built Zod schemas with pure ESM"'
      : 'echo "⚠️ Skipped Zod schema build – generated files not found"',
  };
});
