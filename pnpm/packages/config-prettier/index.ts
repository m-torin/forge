/**
 * Shared Prettier configuration for the monorepo
 * Extends the Vercel Style Guide and adds custom overrides
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Using require for these packages as they don't have proper ESM/TypeScript support
const styleGuide = require('@vercel/style-guide/prettier');
const phpPlugin = require('@prettier/plugin-php');
const shPlugin = require('prettier-plugin-sh');
const packageJsonPlugin = require('prettier-plugin-packagejson');

// Base configuration from Vercel Style Guide
const sharedConfig = styleGuide;
const sharedPlugins = sharedConfig.plugins || [];

// Define the type for Prettier configuration
interface PrettierOverrideOptions {
  arrowParens?: 'always' | 'avoid';
  bracketSameLine?: boolean;
  bracketSpacing?: boolean;
  jsxSingleQuote?: boolean;
  printWidth?: number;
  singleQuote?: boolean;
  trailingComma?: 'all' | 'es5' | 'none';
  braceStyle?: string;
  phpVersion?: string;
  tabWidth?: number;
  embeddedLanguageFormatting?: 'auto' | 'off';
  proseWrap?: 'always' | 'never' | 'preserve';
}

interface PrettierOverride {
  files: string | string[];
  options: PrettierOverrideOptions;
}

interface PrettierConfig {
  plugins: any[];
  bracketSpacing: boolean;
  printWidth: number;
  semi: boolean;
  singleQuote: boolean;
  tabWidth: number;
  overrides: PrettierOverride[];
  [key: string]: any;
}

const config: PrettierConfig = {
  ...sharedConfig,
  // Register all plugins
  plugins: [...sharedPlugins, phpPlugin, shPlugin, packageJsonPlugin],

  // Global defaults
  bracketSpacing: true,
  printWidth: 80,
  semi: true,
  singleQuote: true,
  tabWidth: 2,

  // Configuration overrides by file type
  overrides: [
    {
      // TypeScript/JavaScript configuration
      files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.mjs', '*.cjs'],
      options: {
        arrowParens: 'always',
        bracketSameLine: false,
        bracketSpacing: true,
        jsxSingleQuote: false,
        printWidth: 80,
        singleQuote: true,
        trailingComma: 'all',
      },
    },
    {
      // Package.json configuration - wider line to prevent excessive wrapping
      files: 'package*.json',
      options: {
        printWidth: 1000,
      },
    },
    {
      // YAML configuration
      files: ['*.yaml', '*.yml'],
      options: {
        singleQuote: false,
        trailingComma: 'none',
      },
    },
    {
      // PHP configuration
      files: ['*.php'],
      options: {
        braceStyle: '1tbs',
        phpVersion: '8.2',
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'all',
      },
    },
    {
      // Markdown configuration
      files: ['*.md', '*.mdx'],
      options: {
        embeddedLanguageFormatting: 'auto',
        proseWrap: 'always',
      },
    },
    {
      // GraphQL configuration
      files: ['*.graphql', '*.gql'],
      options: {
        bracketSpacing: false,
      },
    },
    {
      // CSS/SCSS configuration
      files: ['*.css', '*.scss'],
      options: {
        singleQuote: false,
      },
    },
  ],
};

export default config;
