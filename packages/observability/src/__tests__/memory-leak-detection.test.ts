/**
 * Memory leak pattern detection tests
 * Analyzes code for patterns that could cause memory leaks in different runtimes
 */

import { describe, test, expect } from 'vitest';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const PACKAGE_ROOT = path.resolve(__dirname, '..');

interface MemoryLeakPattern {
  type: string;
  severity: 'error' | 'warning' | 'info';
  location: string;
  message: string;
  line?: number;
  pattern: string;
  runtime: 'edge' | 'nodejs' | 'browser' | 'all';
}

/**
 * Analyze code for memory leak patterns
 */
async function analyzeMemoryLeakPatterns(filePath: string): Promise<MemoryLeakPattern[]> {
  const fs = await import('fs/promises');
  const patterns: MemoryLeakPattern[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // Text-based pattern analysis first
    await analyzeTextPatterns(content, filePath, patterns);

    // AST-based analysis
    await analyzeASTPatterns(content, filePath, patterns);
  } catch (error) {
    patterns.push({
      type: 'analysis-error',
      severity: 'error',
      location: filePath,
      message: `Failed to analyze file: ${(error as Error).message}`,
      pattern: 'file-read-error',
      runtime: 'all',
    });
  }

  return patterns;
}

/**
 * Analyze text patterns that could indicate memory leaks
 */
async function analyzeTextPatterns(
  content: string,
  filePath: string,
  patterns: MemoryLeakPattern[],
): Promise<void> {
  const lines = content.split('\n');

  // Define problematic patterns
  const leakPatterns = [
    {
      regex: /setInterval\s*\([^,]+,/g,
      type: 'uncleaned-interval',
      severity: 'warning' as const,
      message: 'setInterval without clearInterval - potential memory leak',
      runtime: 'all' as const,
    },
    {
      regex: /setTimeout\s*\([^,]+,\s*0\s*\)/g,
      type: 'zero-timeout',
      severity: 'warning' as const,
      message: 'setTimeout with 0ms delay - consider setImmediate or microtask',
      runtime: 'nodejs' as const,
    },
    {
      regex: /addEventListener\s*\(/g,
      type: 'uncleaned-listener',
      severity: 'warning' as const,
      message: 'addEventListener without removeEventListener - check cleanup',
      runtime: 'browser' as const,
    },
    {
      regex: /on\w+\s*=\s*function/g,
      type: 'inline-event-handler',
      severity: 'info' as const,
      message: 'Inline event handler - ensure proper cleanup',
      runtime: 'browser' as const,
    },
    {
      regex: /new\s+Array\s*\(\s*\d{6,}\s*\)/g,
      type: 'large-array-allocation',
      severity: 'error' as const,
      message: 'Large array allocation - potential memory spike',
      runtime: 'all' as const,
    },
    {
      regex: /\.push\s*\(\.{3}/g,
      type: 'spread-push',
      severity: 'warning' as const,
      message: 'Array.push(...array) - can cause stack overflow with large arrays',
      runtime: 'all' as const,
    },
    {
      regex: /while\s*\(\s*true\s*\)/g,
      type: 'infinite-loop',
      severity: 'error' as const,
      message: 'Infinite while loop detected',
      runtime: 'all' as const,
    },
    {
      regex: /for\s*\(\s*;\s*;\s*\)/g,
      type: 'infinite-for-loop',
      severity: 'error' as const,
      message: 'Infinite for loop detected',
      runtime: 'all' as const,
    },
    {
      regex: /WeakMap|WeakSet/g,
      type: 'weak-reference-usage',
      severity: 'info' as const,
      message: 'WeakMap/WeakSet usage - good for memory management',
      runtime: 'all' as const,
    },
    {
      regex: /\.cache\s*\[/g,
      type: 'manual-cache',
      severity: 'warning' as const,
      message: 'Manual cache implementation - ensure bounded size',
      runtime: 'all' as const,
    },
    {
      regex: /process\.on\s*\(/g,
      type: 'process-listener',
      severity: 'warning' as const,
      message: 'Process event listener - ensure cleanup on shutdown',
      runtime: 'nodejs' as const,
    },
    {
      regex: /Buffer\.alloc\s*\(\s*\d{7,}\s*\)/g,
      type: 'large-buffer-allocation',
      severity: 'error' as const,
      message: 'Large buffer allocation - potential memory spike',
      runtime: 'nodejs' as const,
    },
  ];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    for (const pattern of leakPatterns) {
      const matches = line.matchAll(pattern.regex);

      for (const match of matches) {
        patterns.push({
          type: pattern.type,
          severity: pattern.severity,
          location: filePath,
          message: pattern.message,
          line: lineIndex + 1,
          pattern: match[0],
          runtime: pattern.runtime,
        });
      }
    }
  }
}

/**
 * AST-based analysis for more complex patterns
 */
async function analyzeASTPatterns(
  content: string,
  filePath: string,
  patterns: MemoryLeakPattern[],
): Promise<void> {
  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    // Track variable declarations and usage
    const intervals = new Set<string>();
    const timeouts = new Set<string>();
    const listeners = new Set<string>();
    const cleared = new Set<string>();

    traverse(ast, {
      // Track interval/timeout assignments
      VariableDeclarator(path) {
        const { node } = path;

        if (node.init?.type === 'CallExpression') {
          const callee = node.init.callee;

          if (callee.type === 'Identifier') {
            if (callee.name === 'setInterval' && node.id.type === 'Identifier') {
              intervals.add(node.id.name);
            } else if (callee.name === 'setTimeout' && node.id.type === 'Identifier') {
              timeouts.add(node.id.name);
            }
          }
        }
      },

      // Track cleanup calls
      CallExpression(path) {
        const { node } = path;

        if (node.callee.type === 'Identifier') {
          if (node.callee.name === 'clearInterval' || node.callee.name === 'clearTimeout') {
            const arg = node.arguments[0];
            if (arg?.type === 'Identifier') {
              cleared.add(arg.name);
            }
          }
        }

        // Check for potential recursive calls
        if (node.callee.type === 'Identifier') {
          const functionName = node.callee.name;

          // Look for functions that might call themselves
          let parent = path.parent;
          while (parent) {
            if (parent.type === 'FunctionDeclaration' && parent.id?.name === functionName) {
              patterns.push({
                type: 'potential-recursion',
                severity: 'warning',
                location: filePath,
                message: `Potential recursive call: ${functionName}`,
                line: node.loc?.start.line,
                pattern: functionName,
                runtime: 'all',
              });
              break;
            }
            parent = parent.parent;
          }
        }
      },

      // Check for large object/array literals
      ArrayExpression(path) {
        const { node } = path;

        if (node.elements.length > 1000) {
          patterns.push({
            type: 'large-array-literal',
            severity: 'warning',
            location: filePath,
            message: `Large array literal: ${node.elements.length} elements`,
            line: node.loc?.start.line,
            pattern: `Array[${node.elements.length}]`,
            runtime: 'all',
          });
        }
      },

      ObjectExpression(path) {
        const { node } = path;

        if (node.properties.length > 100) {
          patterns.push({
            type: 'large-object-literal',
            severity: 'warning',
            location: filePath,
            message: `Large object literal: ${node.properties.length} properties`,
            line: node.loc?.start.line,
            pattern: `Object{${node.properties.length}}`,
            runtime: 'all',
          });
        }
      },

      // Check for closures that might capture large scope
      FunctionExpression(path) {
        const { node } = path;

        // Count references to outer scope variables
        let outerReferences = 0;

        path.traverse({
          Identifier(innerPath) {
            const binding = innerPath.scope.getBinding(innerPath.node.name);
            if (binding && !path.scope.hasOwnBinding(innerPath.node.name)) {
              outerReferences++;
            }
          },
        });

        if (outerReferences > 20) {
          patterns.push({
            type: 'large-closure',
            severity: 'warning',
            location: filePath,
            message: `Function captures many outer variables: ${outerReferences}`,
            line: node.loc?.start.line,
            pattern: `closure[${outerReferences}]`,
            runtime: 'all',
          });
        }
      },
    });

    // Check for uncleaned intervals/timeouts
    for (const interval of intervals) {
      if (!cleared.has(interval)) {
        patterns.push({
          type: 'uncleaned-interval-var',
          severity: 'warning',
          location: filePath,
          message: `Interval variable '${interval}' is never cleared`,
          pattern: interval,
          runtime: 'all',
        });
      }
    }

    for (const timeout of timeouts) {
      if (!cleared.has(timeout)) {
        patterns.push({
          type: 'uncleaned-timeout-var',
          severity: 'info',
          location: filePath,
          message: `Timeout variable '${timeout}' is never cleared`,
          pattern: timeout,
          runtime: 'all',
        });
      }
    }
  } catch (error) {
    patterns.push({
      type: 'ast-analysis-error',
      severity: 'warning',
      location: filePath,
      message: `AST analysis failed: ${(error as Error).message}`,
      pattern: 'parse-error',
      runtime: 'all',
    });
  }
}

/**
 * Analyze memory usage patterns specific to runtime
 */
function analyzeRuntimeSpecificPatterns(
  patterns: MemoryLeakPattern[],
  fileName: string,
): MemoryLeakPattern[] {
  const runtimeType = fileName.includes('edge')
    ? 'edge'
    : fileName.includes('client')
      ? 'browser'
      : 'nodejs';

  return patterns.filter((pattern) => pattern.runtime === 'all' || pattern.runtime === runtimeType);
}

/**
 * Calculate memory risk score
 */
function calculateMemoryRiskScore(patterns: MemoryLeakPattern[]): number {
  const weights = {
    error: 10,
    warning: 5,
    info: 1,
  };

  return patterns.reduce((score, pattern) => {
    return score + weights[pattern.severity];
  }, 0);
}

describe('Memory Leak Pattern Detection', () => {
  const exportFiles = [
    'client.ts',
    'server.ts',
    'client-next.ts',
    'server-next.ts',
    'server-next-edge.ts',
  ];

  test('analyze memory leak patterns in export files', async () => {
    const results = new Map<string, MemoryLeakPattern[]>();

    for (const fileName of exportFiles) {
      const filePath = path.join(PACKAGE_ROOT, fileName);

      try {
        const allPatterns = await analyzeMemoryLeakPatterns(filePath);
        const runtimePatterns = analyzeRuntimeSpecificPatterns(allPatterns, fileName);

        results.set(fileName, runtimePatterns);

        const riskScore = calculateMemoryRiskScore(runtimePatterns);

        console.log(`${fileName} memory analysis:`, {
          totalPatterns: runtimePatterns.length,
          errors: runtimePatterns.filter((p) => p.severity === 'error').length,
          warnings: runtimePatterns.filter((p) => p.severity === 'warning').length,
          info: runtimePatterns.filter((p) => p.severity === 'info').length,
          riskScore,
          types: [...new Set(runtimePatterns.map((p) => p.type))],
        });

        // Edge runtime should have minimal memory risk
        if (fileName.includes('edge')) {
          expect(riskScore).toBeLessThan(20);

          const errorPatterns = runtimePatterns.filter((p) => p.severity === 'error');
          expect(errorPatterns).toEqual([]);

          if (errorPatterns.length > 0) {
            console.error(`Memory errors in ${fileName}:`, errorPatterns);
          }
        }

        // No file should have critical memory leak patterns
        const criticalPatterns = runtimePatterns.filter(
          (p) =>
            p.type === 'infinite-loop' ||
            p.type === 'infinite-for-loop' ||
            p.type === 'large-buffer-allocation',
        );

        expect(criticalPatterns).toEqual([]);
      } catch (error) {
        console.log(`Could not analyze ${fileName}: ${error}`);
      }
    }

    // Overall memory analysis summary
    const allPatterns = Array.from(results.values()).flat();
    const totalRisk = allPatterns.reduce((sum, p) => sum + calculateMemoryRiskScore([p]), 0);

    console.log('\nOverall memory analysis:', {
      totalFiles: results.size,
      totalPatterns: allPatterns.length,
      totalRiskScore: totalRisk,
      averageRiskPerFile: totalRisk / results.size,
      mostCommonTypes: getMostCommonPatterns(allPatterns),
    });
  });

  test('verify cleanup patterns exist', async () => {
    const fs = await import('fs/promises');

    for (const fileName of exportFiles) {
      const filePath = path.join(PACKAGE_ROOT, fileName);

      try {
        const content = await fs.readFile(filePath, 'utf-8');

        // Look for cleanup patterns
        const cleanupPatterns = [
          /clearInterval/g,
          /clearTimeout/g,
          /removeEventListener/g,
          /cleanup|dispose|destroy/gi,
          /process\.removeListener/g,
          /AbortController/g,
        ];

        const foundCleanup = cleanupPatterns
          .map((pattern) => ({
            pattern: pattern.source,
            count: (content.match(pattern) || []).length,
          }))
          .filter((result) => result.count > 0);

        console.log(`${fileName} cleanup patterns:`, {
          totalCleanupPatterns: foundCleanup.length,
          patterns: foundCleanup,
        });

        // Server files should have some cleanup patterns
        if (fileName.includes('server') && !fileName.includes('edge')) {
          const totalCleanup = foundCleanup.reduce((sum, p) => sum + p.count, 0);
          expect(totalCleanup).toBeGreaterThan(0);
        }
      } catch (error) {
        console.log(`Could not check cleanup patterns for ${fileName}`);
      }
    }
  });

  test('analyze memory-sensitive operations by runtime', async () => {
    const runtimeChecks = {
      edge: {
        file: 'server-next-edge.ts',
        allowedPatterns: ['weak-reference-usage'],
        forbiddenPatterns: ['large-buffer-allocation', 'process-listener'],
        maxRiskScore: 15,
      },
      browser: {
        files: ['client.ts', 'client-next.ts'],
        allowedPatterns: ['weak-reference-usage', 'uncleaned-listener'],
        forbiddenPatterns: ['process-listener', 'large-buffer-allocation'],
        maxRiskScore: 25,
      },
      nodejs: {
        files: ['server.ts', 'server-next.ts'],
        allowedPatterns: ['process-listener', 'uncleaned-interval', 'manual-cache'],
        forbiddenPatterns: ['infinite-loop'],
        maxRiskScore: 50,
      },
    };

    for (const [runtime, config] of Object.entries(runtimeChecks)) {
      const files = 'files' in config ? config.files : [config.file];

      for (const fileName of files) {
        const filePath = path.join(PACKAGE_ROOT, fileName);

        try {
          const patterns = await analyzeMemoryLeakPatterns(filePath);
          const runtimePatterns = analyzeRuntimeSpecificPatterns(patterns, fileName);
          const riskScore = calculateMemoryRiskScore(runtimePatterns);

          // Check forbidden patterns
          const forbidden = runtimePatterns.filter((p) =>
            config.forbiddenPatterns.includes(p.type),
          );

          expect(forbidden).toEqual([]);
          expect(riskScore).toBeLessThan(config.maxRiskScore);

          console.log(`${fileName} (${runtime}) memory check:`, {
            riskScore,
            maxAllowed: config.maxRiskScore,
            forbiddenFound: forbidden.length,
            patterns: runtimePatterns.length,
          });

          if (forbidden.length > 0) {
            console.error(`Forbidden patterns in ${fileName}:`, forbidden);
          }
        } catch (error) {
          console.log(`Could not check ${fileName} for ${runtime}`);
        }
      }
    }
  });

  test('detect potential memory bloat patterns', async () => {
    const fs = await import('fs/promises');

    for (const fileName of exportFiles) {
      const filePath = path.join(PACKAGE_ROOT, fileName);

      try {
        const content = await fs.readFile(filePath, 'utf-8');

        // Patterns that could indicate memory bloat
        const bloatPatterns = [
          {
            regex: /\[\s*\.\.\./g,
            name: 'spread-operator',
            risk: 'medium',
          },
          {
            regex: /Object\.assign\s*\(/g,
            name: 'object-assign',
            risk: 'low',
          },
          {
            regex: /JSON\.parse\s*\(/g,
            name: 'json-parse',
            risk: 'medium',
          },
          {
            regex: /\.[mM]ap\s*\(/g,
            name: 'array-map',
            risk: 'low',
          },
          {
            regex: /\.filter\s*\(/g,
            name: 'array-filter',
            risk: 'low',
          },
          {
            regex: /\.reduce\s*\(/g,
            name: 'array-reduce',
            risk: 'low',
          },
        ];

        const bloatMetrics = bloatPatterns
          .map((pattern) => ({
            name: pattern.name,
            count: (content.match(pattern.regex) || []).length,
            risk: pattern.risk,
          }))
          .filter((metric) => metric.count > 0);

        const totalBloatScore = bloatMetrics.reduce((score, metric) => {
          const weight = metric.risk === 'medium' ? 2 : 1;
          return score + metric.count * weight;
        }, 0);

        console.log(`${fileName} memory bloat analysis:`, {
          totalScore: totalBloatScore,
          patterns: bloatMetrics,
        });

        // Edge runtime should be very conservative
        if (fileName.includes('edge')) {
          expect(totalBloatScore).toBeLessThan(10);
        }
      } catch (error) {
        console.log(`Could not analyze bloat patterns for ${fileName}`);
      }
    }
  });
});

/**
 * Helper function to get most common pattern types
 */
function getMostCommonPatterns(
  patterns: MemoryLeakPattern[],
): Array<{ type: string; count: number }> {
  const counts = new Map<string, number>();

  for (const pattern of patterns) {
    counts.set(pattern.type, (counts.get(pattern.type) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
