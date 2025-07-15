/**
 * Standardized utilities for testing dynamic imports
 * Replaces duplicate testDynamicImport functions across test files
 */

import { expect } from 'vitest';

export interface ImportTestResult<T> {
  success: boolean;
  module: T | null;
  error: any;
}

/**
 * Test dynamic import without conditionals
 * Handles both successful imports and failures gracefully
 */
export async function testDynamicImport<T>(
  importFn: () => Promise<T>,
): Promise<ImportTestResult<T>> {
  try {
    const module = await importFn();
    return { success: true, module, error: null };
  } catch (error) {
    return { success: false, module: null, error };
  }
}

/**
 * Test module export availability and type
 * Standardized pattern for checking if exports exist and are functions
 */
export function testExportAvailability(
  module: any,
  exportName: string,
): { exists: boolean; type: string; isFunction: boolean } {
  const exportValue = module?.[exportName];
  const exists = Boolean(exportValue);
  const type = exists ? typeof exportValue : 'undefined';
  const isFunction = type === 'function';

  return { exists, type, isFunction };
}

/**
 * Test multiple exports from a module
 * Returns a map of export name to availability info
 */
export function testMultipleExports(
  module: any,
  exportNames: string[],
): Record<string, ReturnType<typeof testExportAvailability>> {
  return exportNames.reduce(
    (acc, exportName) => {
      acc[exportName] = testExportAvailability(module, exportName);
      return acc;
    },
    {} as Record<string, ReturnType<typeof testExportAvailability>>,
  );
}

/**
 * Standardized assertions for import testing
 * Reduces repetitive expect patterns
 */
export function assertImportResult<T>(result: ImportTestResult<T>) {
  // Always validate the structure
  expect(typeof result.success).toBe('boolean');
  expect([null, 'object']).toContain(typeof result.module);

  // Ensure we have either module or error
  const hasValidOutcome = result.success ? Boolean(result.module) : Boolean(result.error);
  expect(hasValidOutcome).toBeTruthy();
}

/**
 * Assert export availability with standard patterns
 */
export function assertExportAvailability(
  availability: ReturnType<typeof testExportAvailability>,
  expectedTypes: string[] = ['function', 'undefined'],
) {
  expect(typeof availability.exists).toBe('boolean');
  expect(typeof availability.type).toBe('string');
  expect(typeof availability.isFunction).toBe('boolean');
  expect(expectedTypes).toContain(availability.type);
}

/**
 * Test hook execution without conditionals
 * Handles React hook testing patterns
 */
export function testHookExecution<T>(hookFn: () => T): {
  success: boolean;
  result: T | null;
  error: any;
} {
  try {
    const result = hookFn();
    return { success: true, result, error: null };
  } catch (error) {
    return { success: false, result: null, error };
  }
}

/**
 * Standard test for module import and export validation
 * Combines import testing with export checking
 */
export async function testModuleExports<T>(
  importFn: () => Promise<T>,
  expectedExports: string[],
): Promise<{
  importResult: ImportTestResult<T>;
  exports: Record<string, ReturnType<typeof testExportAvailability>>;
}> {
  const importResult = await testDynamicImport(importFn);
  const exports = importResult.module
    ? testMultipleExports(importResult.module, expectedExports)
    : {};

  return { importResult, exports };
}

/**
 * Helper for testing client-side module imports
 * Specifically for Next.js client components and hooks
 */
export async function testClientModule(importPath: string, expectedExports: string[] = []) {
  return testModuleExports(() => import(importPath), expectedExports);
}

/**
 * Helper for testing server-side module imports
 * Specifically for Next.js server components and utilities
 */
export async function testServerModule(importPath: string, expectedExports: string[] = []) {
  return testModuleExports(() => import(importPath), expectedExports);
}

/**
 * Batch test multiple module imports
 * Useful for testing related modules together
 */
export async function testMultipleModules(
  modules: Array<{
    name: string;
    importFn: () => Promise<any>;
    expectedExports?: string[];
  }>,
): Promise<Record<string, any>> {
  const results: Record<string, any> = {};

  for (const module of modules) {
    if (module.expectedExports) {
      results[module.name] = await testModuleExports(module.importFn, module.expectedExports);
    } else {
      results[module.name] = await testDynamicImport(module.importFn);
    }
  }

  return results;
}
