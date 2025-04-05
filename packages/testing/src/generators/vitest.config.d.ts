/**
 * Vitest Configuration Type Declarations
 */

/**
 * Base configuration generator for Vitest
 * @param options Optional configuration options
 * @returns Vitest configuration object
 */
export function generateBaseConfig(options?: Record<string, any>): any;

/**
 * React configuration generator for Vitest
 * @param options Optional configuration options
 * @returns Vitest configuration for React projects
 */
export function generateReactConfig(options?: Record<string, any>): any;

/**
 * Mantine configuration generator for Vitest
 * @param options Optional configuration options
 * @returns Vitest configuration for Mantine projects
 */
export function generateMantineConfig(options?: Record<string, any>): any;

/**
 * Server configuration generator for Vitest
 * @param options Optional configuration options
 * @returns Vitest configuration for server-side projects
 */
export function generateServerConfig(options?: Record<string, any>): any;

/**
 * Node configuration generator for Vitest
 * @param options Optional configuration options
 * @returns Vitest configuration for Node.js projects
 */
export function generateNodeConfig(options?: Record<string, any>): any;

/**
 * Configuration getter (alias for generateBaseConfig)
 * @param options Optional configuration options
 * @returns Vitest configuration object
 */
export function getConfig(options?: Record<string, any>): any;
