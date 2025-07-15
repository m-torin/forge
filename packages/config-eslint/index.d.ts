import { Linter } from 'eslint';

/**
 * ESLint configurations for the monorepo
 *
 * This package provides several ESLint configurations:
 *
 * - Default export: Base configuration with TypeScript, security, and code organization
 * - react-package: For React libraries with JSX, hooks, and accessibility rules
 * - next: For Next.js applications with App Router, Server Components, and React 19 support
 * - server: For server-side TypeScript with Node.js best practices
 * - remix: For Remix applications combining React and server-side rules
 *
 * All configurations are provided as ESLint v9 flat config arrays.
 */

declare const config: Linter.FlatConfig[];
export default config;
