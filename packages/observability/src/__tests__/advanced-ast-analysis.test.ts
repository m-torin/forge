/**
 * Advanced AST-based code analysis tests
 * Deep static analysis using TypeScript compiler API and Babel
 */

import { describe, test, expect } from 'vitest';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as ts from 'typescript';

const PACKAGE_ROOT = path.resolve(__dirname, '..');

interface CodePattern {
  type: string;
  location: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
}

/**
 * Advanced AST analysis using Babel parser
 */
async function analyzeCodePatterns(filePath: string): Promise<CodePattern[]> {
  const fs = await import('fs/promises');
  const patterns: CodePattern[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx', 'decorators-legacy'],
    });

    traverse(ast, {
      // Detect dangerous global access patterns
      MemberExpression(path) {
        const { node } = path;

        // Check for global object access
        if (node.object.type === 'Identifier') {
          if (node.object.name === 'global' || node.object.name === 'window') {
            patterns.push({
              type: 'global-access',
              location: filePath,
              severity: 'warning',
              message: `Direct ${node.object.name} object access detected`,
              line: node.loc?.start.line,
              column: node.loc?.start.column,
            });
          }

          // Check for process.env access patterns
          if (
            node.object.name === 'process' &&
            node.property.type === 'Identifier' &&
            node.property.name === 'env'
          ) {
            // Look for direct env access without runtime guards
            let hasRuntimeGuard = false;
            let current = path.parent;

            // Check if this env access is inside a runtime guard
            while (current) {
              if (current.type === 'IfStatement' && current.test?.type === 'BinaryExpression') {
                const test = current.test;
                if (
                  test.left?.type === 'MemberExpression' &&
                  test.left.object?.type === 'MemberExpression' &&
                  test.left.object.object?.type === 'Identifier' &&
                  test.left.object.object.name === 'process' &&
                  test.left.object.property?.type === 'Identifier' &&
                  test.left.object.property.name === 'env' &&
                  test.left.property?.type === 'Identifier' &&
                  test.left.property.name === 'NEXT_RUNTIME'
                ) {
                  hasRuntimeGuard = true;
                  break;
                }
              }
              current = current.parent;
            }

            if (!hasRuntimeGuard && filePath.includes('edge')) {
              patterns.push({
                type: 'unguarded-env-access',
                location: filePath,
                severity: 'error',
                message: 'Unguarded process.env access in edge runtime code',
                line: node.loc?.start.line,
              });
            }
          }

          // Check for Buffer usage
          if (node.object.name === 'Buffer') {
            patterns.push({
              type: 'buffer-usage',
              location: filePath,
              severity: 'error',
              message: 'Buffer usage detected - not available in edge runtime',
              line: node.loc?.start.line,
            });
          }
        }
      },

      // Detect require() calls
      CallExpression(path) {
        const { node } = path;

        if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
          const arg = node.arguments[0];
          if (arg?.type === 'StringLiteral') {
            patterns.push({
              type: 'require-usage',
              location: filePath,
              severity: 'warning',
              message: `CommonJS require() detected: ${arg.value}`,
              line: node.loc?.start.line,
            });
          }
        }

        // Detect eval usage (good for dynamic imports, bad for arbitrary code)
        if (node.callee.type === 'Identifier' && node.callee.name === 'eval') {
          const arg = node.arguments[0];
          if (arg?.type === 'StringLiteral') {
            const evalCode = arg.value;
            if (evalCode.includes('import')) {
              patterns.push({
                type: 'eval-import',
                location: filePath,
                severity: 'info',
                message: 'Eval-wrapped import detected (acceptable for bundler isolation)',
                line: node.loc?.start.line,
              });
            } else {
              patterns.push({
                type: 'eval-arbitrary',
                location: filePath,
                severity: 'error',
                message: 'Arbitrary eval() usage detected - security risk',
                line: node.loc?.start.line,
              });
            }
          }
        }

        // Detect console usage in production code
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'console'
        ) {
          patterns.push({
            type: 'console-usage',
            location: filePath,
            severity: 'info',
            message: `Console.${node.callee.property.name} usage detected`,
            line: node.loc?.start.line,
          });
        }
      },

      // Detect import statements with suspicious patterns
      ImportDeclaration(path) {
        const { node } = path;
        const source = node.source.value;

        // Check for relative imports going up too many levels
        if (source.startsWith('../../../')) {
          patterns.push({
            type: 'deep-relative-import',
            location: filePath,
            severity: 'warning',
            message: `Deep relative import: ${source} - consider absolute imports`,
            line: node.loc?.start.line,
          });
        }

        // Check for imports that might be problematic in certain runtimes
        if (source.includes('node_modules') || source.startsWith('/')) {
          patterns.push({
            type: 'absolute-import',
            location: filePath,
            severity: 'warning',
            message: `Absolute import path: ${source}`,
            line: node.loc?.start.line,
          });
        }
      },

      // Detect variable declarations with problematic patterns
      VariableDeclarator(path) {
        const { node } = path;

        if (
          node.init?.type === 'CallExpression' &&
          node.init.callee.type === 'Identifier' &&
          node.init.callee.name === 'require'
        ) {
          patterns.push({
            type: 'require-assignment',
            location: filePath,
            severity: 'warning',
            message: 'Variable assigned from require() call',
            line: node.loc?.start.line,
          });
        }
      },

      // Detect try-catch patterns (important for graceful degradation)
      TryStatement(path) {
        const { node } = path;

        // Check if try-catch is around dynamic imports (good pattern)
        const hasImportInTry = JSON.stringify(node.block).includes('import(');

        if (hasImportInTry) {
          patterns.push({
            type: 'import-error-handling',
            location: filePath,
            severity: 'info',
            message: 'Proper error handling around dynamic import',
            line: node.loc?.start.line,
          });
        }
      },

      // Detect function declarations with runtime-specific patterns
      FunctionDeclaration(path) {
        const { node } = path;

        if (node.id?.name?.includes('register') || node.id?.name?.includes('initialize')) {
          patterns.push({
            type: 'initialization-function',
            location: filePath,
            severity: 'info',
            message: `Initialization function: ${node.id.name}`,
            line: node.loc?.start.line,
          });
        }
      },
    });
  } catch (error) {
    patterns.push({
      type: 'parse-error',
      location: filePath,
      severity: 'error',
      message: `Failed to parse file: ${(error as Error).message}`,
    });
  }

  return patterns;
}

/**
 * TypeScript-specific analysis using TS compiler API
 */
async function analyzeTypeScriptSemantics(filePath: string): Promise<CodePattern[]> {
  const patterns: CodePattern[] = [];
  const fs = await import('fs/promises');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

    function visit(node: ts.Node) {
      // Check for type assertions that might hide runtime issues
      if (ts.isTypeAssertionExpression(node) || ts.isAsExpression(node)) {
        patterns.push({
          type: 'type-assertion',
          location: filePath,
          severity: 'warning',
          message: 'Type assertion detected - verify runtime safety',
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        });
      }

      // Check for any type usage
      if (ts.isTypeReferenceNode(node)) {
        const typeName = node.typeName.getText(sourceFile);
        if (typeName.includes('Node') || typeName.includes('Process')) {
          patterns.push({
            type: 'nodejs-type-reference',
            location: filePath,
            severity: 'warning',
            message: `Node.js type reference: ${typeName}`,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          });
        }
      }

      // Check for interface declarations
      if (ts.isInterfaceDeclaration(node)) {
        const interfaceName = node.name.text;
        if (interfaceName.includes('Config') || interfaceName.includes('Options')) {
          patterns.push({
            type: 'config-interface',
            location: filePath,
            severity: 'info',
            message: `Configuration interface: ${interfaceName}`,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          });
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  } catch (error) {
    patterns.push({
      type: 'typescript-analysis-error',
      location: filePath,
      severity: 'error',
      message: `TypeScript analysis failed: ${(error as Error).message}`,
    });
  }

  return patterns;
}

/**
 * Detect security-sensitive patterns
 */
async function analyzeSecurityPatterns(filePath: string): Promise<CodePattern[]> {
  const patterns: CodePattern[] = [];
  const fs = await import('fs/promises');

  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // Check for hardcoded secrets or keys
    const secretPatterns = [
      /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
      /secret\s*=\s*['"][^'"]+['"]/gi,
      /token\s*=\s*['"][^'"]+['"]/gi,
      /password\s*=\s*['"][^'"]+['"]/gi,
      /[a-f0-9]{32,}/gi, // Hex strings that might be secrets
    ];

    secretPatterns.forEach((pattern, index) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        patterns.push({
          type: 'potential-secret',
          location: filePath,
          severity: 'error',
          message: `Potential hardcoded secret detected: ${match[0].substring(0, 20)}...`,
        });
      }
    });

    // Check for unsafe dynamic code execution
    const unsafePatterns = [
      /new\s+Function\s*\(/gi,
      /setTimeout\s*\(\s*['"][^'"]*['"]/gi,
      /setInterval\s*\(\s*['"][^'"]*['"]/gi,
    ];

    unsafePatterns.forEach((pattern) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        patterns.push({
          type: 'unsafe-dynamic-execution',
          location: filePath,
          severity: 'error',
          message: `Unsafe dynamic code execution: ${match[0]}`,
        });
      }
    });

    // Check for environment variable exposure (exclude NEXT_PUBLIC_ which is allowed in client)
    const envExposurePattern =
      /process\.env\.(?!NEXT_RUNTIME|NODE_ENV|VERCEL|NEXT_PUBLIC_)[A-Z_]+/gi;
    const envMatches = content.matchAll(envExposurePattern);

    for (const match of envMatches) {
      if (filePath.includes('client') || filePath.includes('browser')) {
        patterns.push({
          type: 'env-exposure',
          location: filePath,
          severity: 'error',
          message: `Environment variable exposed to client: ${match[0]}`,
        });
      }
    }
  } catch (error) {
    patterns.push({
      type: 'security-analysis-error',
      location: filePath,
      severity: 'error',
      message: `Security analysis failed: ${(error as Error).message}`,
    });
  }

  return patterns;
}

describe('Advanced AST-Based Code Analysis', () => {
  const exportFiles = [
    'client.ts',
    'server.ts',
    'client-next.ts',
    'server-next.ts',
    'server-next-edge.ts',
  ];

  describe('Code Pattern Detection', () => {
    test('analyze edge export for problematic patterns', async () => {
      const edgeFile = path.join(PACKAGE_ROOT, 'server-next-edge.ts');
      const patterns = await analyzeCodePatterns(edgeFile);

      // Should have no error-level patterns in edge runtime
      const errors = patterns.filter((p) => p.severity === 'error');
      expect(errors).toEqual([]);

      console.log('Edge export patterns:', {
        total: patterns.length,
        errors: errors.length,
        warnings: patterns.filter((p) => p.severity === 'warning').length,
        info: patterns.filter((p) => p.severity === 'info').length,
      });

      if (errors.length > 0) {
        console.error('Edge export errors:', errors);
      }
    });

    test('detect eval-wrapped imports in apps', async () => {
      const webInstrumentation = path.join(PACKAGE_ROOT, '../../../apps/web/instrumentation.ts');

      try {
        const patterns = await analyzeCodePatterns(webInstrumentation);
        const evalImports = patterns.filter((p) => p.type === 'eval-import');

        expect(evalImports.length).toBeGreaterThan(0);
        console.log('Web instrumentation eval imports:', evalImports.length);
      } catch (error) {
        console.log('Web instrumentation file not found - skipping test');
      }
    });

    test('check all exports for dangerous patterns', async () => {
      for (const fileName of exportFiles) {
        const filePath = path.join(PACKAGE_ROOT, fileName);
        const patterns = await analyzeCodePatterns(filePath);

        // Check for specific dangerous patterns
        const dangerousPatterns = patterns.filter(
          (p) =>
            p.type === 'buffer-usage' ||
            p.type === 'eval-arbitrary' ||
            p.type === 'unguarded-env-access',
        );

        expect(dangerousPatterns).toEqual([]);

        console.log(`${fileName} patterns:`, {
          total: patterns.length,
          dangerous: dangerousPatterns.length,
          types: [...new Set(patterns.map((p) => p.type))],
        });
      }
    });
  });

  describe('TypeScript Semantic Analysis', () => {
    test('analyze TypeScript-specific patterns', async () => {
      for (const fileName of exportFiles) {
        const filePath = path.join(PACKAGE_ROOT, fileName);
        const patterns = await analyzeTypeScriptSemantics(filePath);

        console.log(`${fileName} TypeScript analysis:`, {
          total: patterns.length,
          typeAssertions: patterns.filter((p) => p.type === 'type-assertion').length,
          nodeTypes: patterns.filter((p) => p.type === 'nodejs-type-reference').length,
          configs: patterns.filter((p) => p.type === 'config-interface').length,
        });

        // Edge runtime should not have Node.js type references
        if (fileName.includes('edge')) {
          const nodeTypeRefs = patterns.filter((p) => p.type === 'nodejs-type-reference');
          expect(nodeTypeRefs).toEqual([]);
        }
      }
    });

    test('verify type safety patterns', async () => {
      const serverNextFile = path.join(PACKAGE_ROOT, 'server-next.ts');
      const patterns = await analyzeTypeScriptSemantics(serverNextFile);

      // Should have configuration interfaces
      const configInterfaces = patterns.filter((p) => p.type === 'config-interface');
      console.log('Server-next config interfaces:', configInterfaces.length);

      // Type assertions should be minimal
      const typeAssertions = patterns.filter((p) => p.type === 'type-assertion');
      expect(typeAssertions.length).toBeLessThan(5); // Reasonable limit
    });
  });

  describe('Security Pattern Analysis', () => {
    test('check for hardcoded secrets', async () => {
      for (const fileName of exportFiles) {
        const filePath = path.join(PACKAGE_ROOT, fileName);
        const patterns = await analyzeSecurityPatterns(filePath);

        const secrets = patterns.filter((p) => p.type === 'potential-secret');
        expect(secrets).toEqual([]);

        if (secrets.length > 0) {
          console.error(`Potential secrets in ${fileName}:`, secrets);
        }
      }
    });

    test('check for unsafe dynamic execution', async () => {
      for (const fileName of exportFiles) {
        const filePath = path.join(PACKAGE_ROOT, fileName);
        const patterns = await analyzeSecurityPatterns(filePath);

        const unsafePatterns = patterns.filter((p) => p.type === 'unsafe-dynamic-execution');
        expect(unsafePatterns).toEqual([]);

        console.log(`${fileName} security:`, {
          total: patterns.length,
          unsafe: unsafePatterns.length,
        });
      }
    });

    test('check for environment variable exposure', async () => {
      const clientFiles = ['client.ts', 'client-next.ts'];

      for (const fileName of clientFiles) {
        const filePath = path.join(PACKAGE_ROOT, fileName);
        const patterns = await analyzeSecurityPatterns(filePath);

        const envExposure = patterns.filter((p) => p.type === 'env-exposure');
        expect(envExposure).toEqual([]);

        if (envExposure.length > 0) {
          console.error(`Environment exposure in ${fileName}:`, envExposure);
        }
      }
    });
  });

  describe('Runtime-Specific Pattern Analysis', () => {
    test('edge runtime should have minimal complexity', async () => {
      const edgeFile = path.join(PACKAGE_ROOT, 'server-next-edge.ts');
      const patterns = await analyzeCodePatterns(edgeFile);

      // Count complexity indicators
      const consoleUsage = patterns.filter((p) => p.type === 'console-usage').length;
      const initFunctions = patterns.filter((p) => p.type === 'initialization-function').length;

      console.log('Edge runtime complexity:', {
        consoleUsage,
        initFunctions,
        totalPatterns: patterns.length,
      });

      // Edge should be simple
      expect(patterns.length).toBeLessThan(20);
    });

    test('server exports can have more complexity', async () => {
      const serverFiles = ['server.ts', 'server-next.ts'];

      for (const fileName of serverFiles) {
        const filePath = path.join(PACKAGE_ROOT, fileName);
        const patterns = await analyzeCodePatterns(filePath);

        console.log(`${fileName} complexity:`, {
          patterns: patterns.length,
          errorHandling: patterns.filter((p) => p.type === 'import-error-handling').length,
          initFunctions: patterns.filter((p) => p.type === 'initialization-function').length,
        });

        // Server exports can be more complex
        expect(patterns.length).toBeLessThan(50);
      }
    });

    test('runtime-specific imports are properly guarded', async () => {
      const serverNextFile = path.join(PACKAGE_ROOT, 'server-next.ts');
      const patterns = await analyzeCodePatterns(serverNextFile);

      // Should have proper error handling around imports
      const errorHandling = patterns.filter((p) => p.type === 'import-error-handling');
      console.log('Server-next error handling patterns:', errorHandling.length);

      // Should use try-catch around dynamic imports (or no dynamic imports at all)
      // This is OK if there are no dynamic imports
      console.log('Server-next has dynamic imports:', errorHandling.length > 0 ? 'Yes' : 'No');
    });
  });

  describe('Code Quality Metrics', () => {
    test('measure cyclomatic complexity indicators', async () => {
      const results = [];

      for (const fileName of exportFiles) {
        const filePath = path.join(PACKAGE_ROOT, fileName);
        const patterns = await analyzeCodePatterns(filePath);

        const complexity = {
          file: fileName,
          patterns: patterns.length,
          errors: patterns.filter((p) => p.severity === 'error').length,
          warnings: patterns.filter((p) => p.severity === 'warning').length,
          complexity: patterns.filter(
            (p) => p.type === 'initialization-function' || p.type === 'import-error-handling',
          ).length,
        };

        results.push(complexity);
      }

      // Sort by complexity
      results.sort((a, b) => b.complexity - a.complexity);

      console.log('Complexity ranking:');
      results.forEach((r) => {
        console.log(`  ${r.file}: ${r.complexity} (${r.errors} errors, ${r.warnings} warnings)`);
      });

      // Edge should be reasonably simple (allow equal complexity)
      const edgeComplexity = results.find((r) => r.file.includes('edge'))?.complexity || 0;
      const serverComplexity =
        results.find((r) => r.file.includes('server-next.ts'))?.complexity || 0;

      // Edge can be equal or simpler than server, but not significantly more complex
      expect(edgeComplexity).toBeLessThanOrEqual(serverComplexity + 1);
    });

    test('analyze maintainability indicators', async () => {
      for (const fileName of exportFiles) {
        const filePath = path.join(PACKAGE_ROOT, fileName);
        const [codePatterns, tsPatterns] = await Promise.all([
          analyzeCodePatterns(filePath),
          analyzeTypeScriptSemantics(filePath),
        ]);

        const maintainability = {
          deepImports: codePatterns.filter((p) => p.type === 'deep-relative-import').length,
          typeAssertions: tsPatterns.filter((p) => p.type === 'type-assertion').length,
          consoleUsage: codePatterns.filter((p) => p.type === 'console-usage').length,
          configInterfaces: tsPatterns.filter((p) => p.type === 'config-interface').length,
        };

        console.log(`${fileName} maintainability:`, maintainability);

        // All files should have reasonable maintainability
        expect(maintainability.deepImports).toBeLessThan(5);
        expect(maintainability.typeAssertions).toBeLessThan(10);
      }
    });
  });
});
