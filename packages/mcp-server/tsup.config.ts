import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    server: 'src/server.ts',
    index: 'src/index.ts',
    'tools/index': 'src/tools/index.ts',
    'utils/index': 'src/utils/index.ts',
  },
  format: ['esm'],
  dts: {
    // Generate declaration files but resolve @repo packages
    resolve: true,
    // Use a custom tsconfig for declarations to handle module resolution
    compilerOptions: {
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
    },
  },
  sourcemap: true,
  clean: true,
  platform: 'node',
  target: 'node22',
  // Important: Bundle @repo packages to compile TypeScript to JavaScript
  // core-utils uses dynamic imports for ts-morph, avoiding Vue compiler issues
  noExternal: ['@repo/core-utils', '@repo/observability'],
  // Only mark true external dependencies as external
  external: [
    // Node.js builtins
    /^node:/,
    // NPM packages that should not be bundled
    '@modelcontextprotocol/sdk',
    'lru-cache',
    'perfect-debounce',
    'zod',
    // ts-morph and its dependencies (lazy-loaded at runtime via dynamic import)
    'ts-morph',
    'acorn',
    'glob',
    'picomatch',
    'shell-quote',
    'p-limit',
    'p-queue',
    'node-abort-controller',
    // madge and its dependencies (lazy-loaded at runtime via dynamic import)
    'madge',
    '@es-joy/jsdoccomment',
    'comment-parser',
    'are-docs-informative',
    'typescript',
    'escodegen',
    'estraverse',
    'esutils',
    'esprima',
    'source-map',
    // ts-morph's optional template engine dependencies (from @vue/compiler-sfc)
    // These are never used but esbuild tries to resolve them
    'velocityjs',
    'dustjs-linkedin',
    'atpl',
    'liquor',
    'twig',
    'ejs',
    'eco',
    'jazz',
    'jqtpl',
    'haml',
    'hamljs',
    'hamlet',
    'whiskers',
    'haml-coffee',
    'hogan.js',
    'handlebars',
    'underscore',
    'lodash',
    'pug',
    'qejs',
    'walrus',
    'mustache',
    'just',
    'ect',
    'mote',
    'toffee',
    'dot',
    'bracket-template',
    'ractive',
    'nunjucks',
    'htmling',
    'babel-core',
    'plates',
    'react-dom/server',
    'react',
    'vash',
    'slm',
    'marko',
    'teacup/lib/express',
    'coffee-script',
    'squirrelly',
    'twing',
    'templayed',
  ],
  outExtension() {
    return { js: '.mjs' };
  },
  // Ensure we don't minify for easier debugging
  minify: false,
  // Enable tree shaking
  treeshake: true,
});
