import type { Options as ReactOptions } from '@vitejs/plugin-react';
import react from '@vitejs/plugin-react';
import type { Plugin, PluginOption, UserConfig as ViteConfig } from 'vite';

/**
 * Common Vite plugin configurations
 */
export interface PluginConfig {
  react?: boolean | ReactOptions;
  custom?: Plugin[];
}

/**
 * Create standardized React plugin configuration
 */
export function createReactPlugin(options: ReactOptions = {}): PluginOption {
  const { babel, ...restOptions } = options;
  return react({
    // Standard React plugin options
    babel: {
      // Ensure proper JSX runtime
      ...(babel || {}),
    },
    ...restOptions,
  });
}

/**
 * Get standard Vite plugins based on configuration
 */
export function getVitePlugins(config: PluginConfig = {}): PluginOption[] {
  const plugins: PluginOption[] = [];

  // Add React plugin if requested
  if (config.react) {
    const reactOptions = typeof config.react === 'boolean' ? {} : config.react;
    plugins.push(createReactPlugin(reactOptions));
  }

  // Note: tsconfig paths plugin support removed due to CommonJS require
  // Use resolve.alias configuration instead

  // Add custom plugins
  if (config.custom) {
    plugins.push(...config.custom);
  }

  return plugins;
}

/**
 * Common CSS configuration for Vite
 */
export const commonCssConfig: ViteConfig['css'] = {
  modules: {
    // Consistent CSS module naming
    generateScopedName: '[name]__[local]___[hash:base64:5]',
  },
};

/**
 * Common build configuration for Vite
 */
export const commonBuildConfig: ViteConfig['build'] = {
  // Ensure source maps for debugging
  sourcemap: true,
  // Target modern browsers in test
  target: 'esnext',
};

/**
 * Common optimizeDeps configuration
 */
export const commonOptimizeDeps: ViteConfig['optimizeDeps'] = {
  // Include common dependencies that need pre-bundling
  include: ['react', 'react-dom', '@testing-library/react', '@testing-library/user-event'],
  // Exclude test files from optimization
  exclude: ['@repo/qa'],
};

/**
 * Common esbuild configuration
 */
export const commonEsbuildConfig: ViteConfig['esbuild'] = {
  // Ensure JSX is handled properly
  jsx: 'automatic',
  // Target modern syntax
  target: 'esnext',
  // Keep names for better debugging
  keepNames: true,
};

/**
 * Create browser-compatible define configuration
 */
export function createBrowserDefines(
  additionalDefines: Record<string, any> = {},
): Record<string, any> {
  return {
    // Common browser globals
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'test'),
    'process.env': JSON.stringify({}),
    global: 'globalThis',
    // Add any additional defines
    ...Object.fromEntries(
      Object.entries(additionalDefines).map(([key, value]) => [
        key,
        typeof value === 'string' ? JSON.stringify(value) : value,
      ]),
    ),
  };
}

/**
 * Create Node.js polyfills configuration for browser environment
 */
export function createNodePolyfills(): ViteConfig['resolve'] {
  return {
    alias: {
      // Node.js polyfills for browser
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      assert: 'assert',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify',
      url: 'url',
      util: 'util',
      buffer: 'buffer',
      process: 'process/browser',
      events: 'events',
      path: 'path-browserify',
      querystring: 'querystring-es3',
      punycode: 'punycode',
      zlib: 'browserify-zlib',
      fs: 'browserify-fs',
      net: 'net-browserify',
      tls: 'tls-browserify',
      child_process: 'child_process-browserify',
    },
  };
}

/**
 * Merge Vite configurations with proper type safety
 */
export function mergeViteConfig(...configs: Partial<ViteConfig>[]): ViteConfig {
  const result: ViteConfig = {};

  for (const config of configs) {
    // Merge plugins arrays
    if (config.plugins) {
      result.plugins = [...(result.plugins || []), ...config.plugins];
    }

    // Merge resolve aliases
    if (config.resolve) {
      result.resolve = {
        ...result.resolve,
        ...config.resolve,
        alias: {
          ...((result.resolve?.alias as Record<string, string>) || {}),
          ...((config.resolve.alias as Record<string, string>) || {}),
        },
      };
    }

    // Merge define objects
    if (config.define) {
      result.define = {
        ...result.define,
        ...config.define,
      };
    }

    // Merge css config
    if (config.css) {
      result.css = {
        ...result.css,
        ...config.css,
        modules: {
          ...(result.css?.modules || {}),
          ...(config.css.modules || {}),
        },
      };
    }

    // Merge optimizeDeps
    if (config.optimizeDeps) {
      result.optimizeDeps = {
        ...result.optimizeDeps,
        ...config.optimizeDeps,
        include: [...(result.optimizeDeps?.include || []), ...(config.optimizeDeps.include || [])],
        exclude: [...(result.optimizeDeps?.exclude || []), ...(config.optimizeDeps.exclude || [])],
      };
    }

    // Copy other properties
    const handledKeys = new Set(['plugins', 'resolve', 'define', 'css', 'optimizeDeps']);
    for (const [key, value] of Object.entries(config)) {
      if (!handledKeys.has(key)) {
        (result as any)[key] = value;
      }
    }
  }

  return result;
}
