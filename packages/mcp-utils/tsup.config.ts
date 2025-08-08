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
  // Bundle only essential packages
  noExternal: [],
  // Only mark true external dependencies as external
  external: [
    // Node.js builtins
    /^node:/,
    // NPM packages that should not be bundled
    '@modelcontextprotocol/sdk',
    'lru-cache',
    'perfect-debounce',
    'zod',
    'p-limit',
    'p-queue',
    'p-retry',
    // External packages that use Node.js subpath imports
    'acorn',
    'ts-morph',
    'picomatch',
    'shell-quote',
    // Vue.js and template engines (not used, exclude to prevent bundling errors)
    'velocityjs',
    'dustjs-linkedin',
    'atpl',
    'liquor',
    'twig',
    'ejs',
    'eco',
    'jazz',
    'jqtpl',
    'hamljs',
    'hamlet',
    'whiskers',
    'haml-coffee',
    'hogan.js',
    'templayed',
    'handlebars',
    'underscore',
    'lodash',
    'pug',
    'then-pug',
    'slug',
    'transformers',
    'toffee',
    'walrus',
    'mustache',
    'just',
    'ect',
    'mote',
    'twig',
    'ractive',
    'nunjucks',
    'htmling',
    'babel-core',
    'plates',
    'react-tools',
    'vash',
    'slm',
    'marko',
    'teacup',
    'teacup/lib/express',
    'coffee-script',
    'squirrelly',
    'twing',
    'dot',
    'bracket-template',
    // Exclude entire Vue.js ecosystem
    '@vue/compiler-sfc',
    'vue',
    '@vue/*',
  ],
  outExtension() {
    return { js: '.mjs' };
  },
  // Ensure we don't minify for easier debugging
  minify: false,
  // Enable tree shaking
  treeshake: true,
});
