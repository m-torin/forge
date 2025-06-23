/**
 * Runtime compatibility testing utilities
 * Test export files under different runtime conditions
 */

import { beforeEach, afterEach } from 'vitest';

export type RuntimeEnvironment = 'edge' | 'nodejs' | 'browser';

export interface RuntimeTestOptions {
  runtime: RuntimeEnvironment;
  mockGlobals?: Record<string, any>;
  mockProcess?: Partial<NodeJS.Process>;
  mockEnvironment?: Record<string, string>;
}

/**
 * Mock edge runtime environment
 */
export function mockEdgeRuntime(): void {
  // Mock process.env for edge runtime
  process.env.NEXT_RUNTIME = 'edge';

  // Mock missing Node.js globals that would be unavailable in edge runtime
  const originalGlobals = {
    Buffer: (global as any).Buffer,
    process: global.process,
  };

  // Store original globals for restoration
  (global as any).__originalGlobals = originalGlobals;

  // Remove Node.js-specific globals to simulate edge runtime
  delete (global as any).Buffer;

  // Mock minimal process object for edge runtime
  global.process = {
    ...global.process,
    env: { ...process.env, NEXT_RUNTIME: 'edge' },
    version: process.version,
    versions: process.versions,
    nextTick: process.nextTick,
    listeners: () => [], // Mock listeners function for Vitest compatibility
    // Remove Node.js-specific process methods but keep core ones
  } as any;
}

/**
 * Mock Node.js runtime environment
 */
export function mockNodejsRuntime(): void {
  process.env.NEXT_RUNTIME = 'nodejs';

  // Ensure all Node.js globals are available
  if (!(global as any).Buffer) {
    (global as any).Buffer = Buffer;
  }
}

/**
 * Mock browser runtime environment
 */
export function mockBrowserRuntime(): void {
  delete process.env.NEXT_RUNTIME;

  // Mock browser-like environment
  const originalGlobals = {
    Buffer: (global as any).Buffer,
    process: global.process,
  };

  // Store original globals for restoration
  (global as any).__originalGlobals = originalGlobals;

  // Remove Node.js-specific globals
  delete (global as any).Buffer;

  // Mock minimal process object for browser
  global.process = {
    ...global.process,
    env: {},
    version: '',
    versions: {},
    nextTick: (callback: Function) => setTimeout(callback, 0),
    listeners: () => [], // Mock listeners function for Vitest compatibility
  } as any;
}

/**
 * Restore original runtime environment
 */
export function restoreRuntime(): void {
  const originalGlobals = (global as any).__originalGlobals;

  if (originalGlobals) {
    // Restore original globals
    if (originalGlobals.Buffer) {
      (global as any).Buffer = originalGlobals.Buffer;
    }
    if (originalGlobals.process) {
      global.process = originalGlobals.process;
    }

    // Clean up
    delete (global as any).__originalGlobals;
  }
}

/**
 * Test function that runs in a specific runtime environment
 */
export async function testInRuntime<T>(
  runtime: RuntimeEnvironment,
  testFn: () => Promise<T> | T,
): Promise<T> {
  // Setup runtime environment
  switch (runtime) {
    case 'edge':
      mockEdgeRuntime();
      break;
    case 'nodejs':
      mockNodejsRuntime();
      break;
    case 'browser':
      mockBrowserRuntime();
      break;
  }

  try {
    // Run test function
    return await testFn();
  } finally {
    // Always restore original environment
    restoreRuntime();
  }
}

/**
 * Check if a module can be loaded in a specific runtime without errors
 */
export async function canLoadModule(
  modulePath: string,
  runtime: RuntimeEnvironment,
): Promise<{ success: boolean; error?: Error }> {
  return testInRuntime(runtime, async () => {
    try {
      // Use dynamic import to test module loading
      await import(modulePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  });
}

/**
 * Test if a module exports the expected functions/properties
 */
export async function testModuleExports(
  modulePath: string,
  expectedExports: string[],
  runtime: RuntimeEnvironment = 'nodejs',
): Promise<{ success: boolean; missingExports: string[]; error?: Error }> {
  return testInRuntime(runtime, async () => {
    try {
      const module = await import(modulePath);
      const actualExports = Object.keys(module);
      const missingExports = expectedExports.filter((exp) => !(exp in module));

      return {
        success: missingExports.length === 0,
        missingExports,
      };
    } catch (error) {
      return {
        success: false,
        missingExports: expectedExports,
        error: error as Error,
      };
    }
  });
}

/**
 * Test if a module function can be called without errors
 */
export async function testModuleFunction(
  modulePath: string,
  functionName: string,
  args: any[] = [],
  runtime: RuntimeEnvironment = 'nodejs',
): Promise<{ success: boolean; result?: any; error?: Error }> {
  return testInRuntime(runtime, async () => {
    try {
      const module = await import(modulePath);
      const fn = module[functionName];

      if (typeof fn !== 'function') {
        throw new Error(`${functionName} is not a function`);
      }

      const result = await fn(...args);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  });
}

/**
 * Check if a file contains Node.js API usage
 */
export async function containsNodejsApis(filePath: string): Promise<boolean> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePath, 'utf-8');

  // Common Node.js APIs that would break in edge/browser runtime
  const nodejsApiPatterns = [
    /require\s*\(\s*['"]fs['"]/, // fs module
    /require\s*\(\s*['"]path['"]/, // path module
    /require\s*\(\s*['"]crypto['"]/, // crypto module
    /require\s*\(\s*['"]stream['"]/, // stream module
    /require\s*\(\s*['"]http['"]/, // http module
    /require\s*\(\s*['"]https['"]/, // https module
    /require\s*\(\s*['"]net['"]/, // net module
    /require\s*\(\s*['"]tls['"]/, // tls module
    /require\s*\(\s*['"]dns['"]/, // dns module
    /import.*from\s*['"]node:/, // Node.js built-in module imports
    /process\.env\.(?!NEXT_RUNTIME)/, // Process env access (except NEXT_RUNTIME)
    /process\.cwd\(\)/, // Process cwd
    /process\.exit\(\)/, // Process exit
    /__dirname/, // __dirname global
    /__filename/, // __filename global
    /Buffer\./, // Buffer usage
  ];

  return nodejsApiPatterns.some((pattern) => pattern.test(content));
}

/**
 * Check if a file contains browser-only APIs
 */
export async function containsBrowserApis(filePath: string): Promise<boolean> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePath, 'utf-8');

  // Browser-specific APIs that would break in Node.js
  const browserApiPatterns = [
    /window\./, // Window object
    /document\./, // Document object
    /localStorage\./, // Local storage
    /sessionStorage\./, // Session storage
    /navigator\./, // Navigator object
    /location\./, // Location object
    /XMLHttpRequest/, // XMLHttpRequest
    /fetch\(/, // Fetch API (though Node.js 18+ has it)
  ];

  return browserApiPatterns.some((pattern) => pattern.test(content));
}

/**
 * Create runtime-specific test setup and teardown
 */
export function createRuntimeTestSetup(runtime: RuntimeEnvironment) {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Setup runtime-specific environment
    switch (runtime) {
      case 'edge':
        mockEdgeRuntime();
        break;
      case 'nodejs':
        mockNodejsRuntime();
        break;
      case 'browser':
        mockBrowserRuntime();
        break;
    }
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    restoreRuntime();
  });
}

/**
 * Runtime compatibility test results
 */
export interface CompatibilityTestResult {
  runtime: RuntimeEnvironment;
  canLoad: boolean;
  exportsAvailable: boolean;
  functionsWork: boolean;
  errors: Error[];
  warnings: string[];
}

/**
 * Comprehensive runtime compatibility test for a module
 */
export async function testRuntimeCompatibility(
  modulePath: string,
  expectedExports: string[] = [],
  runtime: RuntimeEnvironment = 'nodejs',
): Promise<CompatibilityTestResult> {
  const result: CompatibilityTestResult = {
    runtime,
    canLoad: false,
    exportsAvailable: false,
    functionsWork: false,
    errors: [],
    warnings: [],
  };

  // Test if module can be loaded
  const loadTest = await canLoadModule(modulePath, runtime);
  result.canLoad = loadTest.success;
  if (loadTest.error) {
    result.errors.push(loadTest.error);
  }

  if (result.canLoad && expectedExports.length > 0) {
    // Test if expected exports are available
    const exportTest = await testModuleExports(modulePath, expectedExports, runtime);
    result.exportsAvailable = exportTest.success;
    if (exportTest.error) {
      result.errors.push(exportTest.error);
    }
    if (exportTest.missingExports.length > 0) {
      result.warnings.push(`Missing exports: ${exportTest.missingExports.join(', ')}`);
    }
  }

  return result;
}
