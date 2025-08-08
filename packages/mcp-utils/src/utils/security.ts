import * as acorn from 'acorn';
import vm from 'node:vm';

/**
 * Shared MCP tool response interface
 */
export interface MCPToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

/**
 * AST validation to detect potentially dangerous patterns using acorn
 */
function validateAST(code: string): void {
  try {
    const ast = acorn.parse(code, {
      ecmaVersion: 'latest' as any,
      sourceType: 'script',
    });

    const dangerousPatterns = [
      'require',
      'import',
      'eval',
      'Function',
      'process',
      'global',
      'globalThis',
      '__dirname',
      '__filename',
    ];

    // Simple AST traversal for acorn
    function walkNode(node: any): void {
      if (!node || typeof node !== 'object') return;

      // Check identifiers for dangerous patterns
      if (node.type === 'Identifier' && dangerousPatterns.includes(node.name)) {
        throw new Error(`Dangerous pattern detected: ${node.name}`);
      }

      // Check function calls
      if (node.type === 'CallExpression' && node.callee?.type === 'Identifier') {
        if (dangerousPatterns.includes(node.callee.name)) {
          throw new Error(`Dangerous function call: ${node.callee.name}`);
        }
      }

      // Recursively walk child nodes
      for (const key in node) {
        if (key === 'parent' || key === 'start' || key === 'end') continue;
        const value = node[key];
        if (Array.isArray(value)) {
          value.forEach(walkNode);
        } else if (value && typeof value === 'object') {
          walkNode(value);
        }
      }
    }

    walkNode(ast);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown AST validation error';
    throw new Error(`AST validation failed: ${errorMessage}`);
  }
}

/**
 * Creates a hardened VM context for safe code execution
 */
function createHardenedContext(): vm.Context {
  const context = vm.createContext({
    // Math operations
    Math: Math,
    // Basic objects (frozen)
    Object: Object.freeze({
      keys: Object.keys,
      values: Object.values,
      entries: Object.entries,
    }),
    Array: Object.freeze({
      from: Array.from,
      isArray: Array.isArray,
    }),
    // String operations
    String: Object.freeze({
      fromCharCode: String.fromCharCode,
    }),
    // JSON operations (safe subset)
    JSON: Object.freeze({
      parse: JSON.parse,
      stringify: JSON.stringify,
    }),
    // Date operations
    Date: Date,
    // RegExp (controlled)
    RegExp: RegExp,
    // Console (limited)
    console: Object.freeze({
      log: (...args: any[]) => console.log('[Safe Context]', ...args),
      warn: (...args: any[]) => console.warn('[Safe Context]', ...args),
      error: (...args: any[]) => console.error('[Safe Context]', ...args),
    }),
    // Utility functions
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    isFinite: isFinite,
  });

  // Freeze the context to prevent modification
  return vm.createContext(Object.freeze(context));
}

/**
 * Unified safe function creator with AST validation and hardened context
 */
export function createSafeFunction<T extends any[], R>(
  code: string,
  paramNames: string | string[] = 'x',
  timeout: number = 5000,
): (...args: T) => R {
  // Normalize paramNames to array
  const normalizedParamNames = typeof paramNames === 'string' ? [paramNames] : paramNames;
  // Validate the AST first
  validateAST(code);

  // Create a hardened context
  const context = createHardenedContext();

  // Wrap code in a function
  const wrappedCode = `
    (function(${normalizedParamNames.join(', ')}) {
      "use strict";
      ${code}
    })
  `;

  try {
    // Compile the function in the secure context
    const compiledFunction = vm.runInContext(wrappedCode, context, {
      timeout: 1000, // Compilation timeout
      displayErrors: true,
    });

    if (typeof compiledFunction !== 'function') {
      throw new Error('Code did not evaluate to a function');
    }

    // Return a wrapper that enforces runtime limits
    return function safeExecutor(...args: T): R {
      try {
        // Create a fresh context for each execution to prevent state pollution
        const execContext = createHardenedContext();

        // Re-compile in fresh context to prevent context pollution attacks
        const freshFunction = vm.runInContext(wrappedCode, execContext, {
          timeout: Math.min(timeout, 5000), // Cap at 5 seconds
          displayErrors: true,
        });

        return freshFunction.apply(null, args);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown execution error';
        throw new Error(`Safe execution failed: ${errorMessage}`);
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown creation error';
    throw new Error(`Safe function creation failed: ${errorMessage}`);
  }
}

/**
 * Enhanced path security utilities
 */
export class PathSecurity {
  /**
   * Validates a path against allowed base paths (no defaults)
   */
  static validatePath(filePath: string, allowedBasePaths: string[]): string {
    if (!allowedBasePaths || allowedBasePaths.length === 0) {
      throw new Error('No allowed base paths provided - explicit allow-list required');
    }

    const path = require('node:path');
    const resolvedPath = path.resolve(filePath);

    for (const basePath of allowedBasePaths) {
      const resolvedBase = path.resolve(basePath);
      if (resolvedPath.startsWith(resolvedBase + path.sep) || resolvedPath === resolvedBase) {
        return resolvedPath;
      }
    }

    throw new Error(`Path ${filePath} is not within allowed base paths`);
  }

  /**
   * Creates a path validator function bound to specific allowed paths
   */
  static createValidator(allowedBasePaths: string[]) {
    return (filePath: string) => PathSecurity.validatePath(filePath, allowedBasePaths);
  }
}

/**
 * Safe regex executor with timeout and rate limiting
 */
export class SafeRegexExecutor {
  private static executions = 0;
  private static resetTime = Date.now();
  private static readonly RATE_LIMIT = 100; // per minute
  private static readonly RESET_INTERVAL = 60000; // 1 minute

  static async executeRegex(
    pattern: RegExp,
    text: string,
    timeout: number = 1000,
  ): Promise<RegExpMatchArray | null> {
    // Rate limiting
    const now = Date.now();
    if (now - this.resetTime > this.RESET_INTERVAL) {
      this.executions = 0;
      this.resetTime = now;
    }

    if (this.executions >= this.RATE_LIMIT) {
      throw new Error('Regex execution rate limit exceeded');
    }
    this.executions++;

    // Timeout wrapper
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Regex execution timeout'));
      }, timeout);

      try {
        // Execute regex with immediate yielding for long operations
        setImmediate(() => {
          try {
            const result = text.match(pattern);
            clearTimeout(timer);
            resolve(result);
          } catch (error) {
            clearTimeout(timer);
            reject(error);
          }
        });
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }
}
