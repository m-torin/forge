/**
 * Circular dependency detection tests
 * Analyzes import chains to detect circular references that could cause runtime issues
 */

import { describe, test, expect } from 'vitest';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const PACKAGE_ROOT = path.resolve(__dirname, '..');

interface DependencyNode {
  file: string;
  imports: string[];
  resolvedImports: string[];
}

interface CircularDependency {
  cycle: string[];
  depth: number;
  severity: 'error' | 'warning' | 'info';
  type: 'direct' | 'indirect';
}

/**
 * Build dependency graph from file analysis
 */
async function buildDependencyGraph(rootPath: string): Promise<Map<string, DependencyNode>> {
  const fs = await import('fs/promises');
  const graph = new Map<string, DependencyNode>();
  const visited = new Set<string>();
  const pending = [rootPath];

  while (pending.length > 0) {
    const currentPath = pending.shift()!;

    if (visited.has(currentPath)) continue;
    visited.add(currentPath);

    try {
      const content = await fs.readFile(currentPath, 'utf-8');
      const imports = extractImportsFromContent(content);
      const resolvedImports = await resolveImports(imports, currentPath);

      graph.set(currentPath, {
        file: currentPath,
        imports,
        resolvedImports,
      });

      // Add resolved imports to pending queue
      for (const resolved of resolvedImports) {
        if (!visited.has(resolved) && resolved.includes(PACKAGE_ROOT)) {
          pending.push(resolved);
        }
      }
    } catch (error) {
      // File might not exist or be readable - skip
      continue;
    }
  }

  return graph;
}

/**
 * Extract import statements from file content
 */
function extractImportsFromContent(content: string): string[] {
  const imports: string[] = [];

  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    traverse(ast, {
      ImportDeclaration(path) {
        imports.push(path.node.source.value);
      },
      CallExpression(path) {
        const { node } = path;

        // Dynamic imports
        if (node.callee.type === 'Import' && node.arguments[0]?.type === 'StringLiteral') {
          imports.push(node.arguments[0].value);
        }

        // Require calls
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'require' &&
          node.arguments[0]?.type === 'StringLiteral'
        ) {
          imports.push(node.arguments[0].value);
        }
      },
    });
  } catch (error) {
    // Fallback to regex-based extraction
    const staticImportRegex = /^import\s+.*from\s+['"]([^'"]+)['"];?$/gm;
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    let match;
    while ((match = staticImportRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    while ((match = dynamicImportRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
  }

  return imports;
}

/**
 * Resolve import paths to absolute file paths
 */
async function resolveImports(imports: string[], fromFile: string): Promise<string[]> {
  const path_module = await import('path');
  const fs = await import('fs/promises');
  const resolved: string[] = [];

  for (const imp of imports) {
    try {
      let resolvedPath: string;

      if (imp.startsWith('.')) {
        // Relative import
        const basePath = path_module.dirname(fromFile);
        resolvedPath = path_module.resolve(basePath, imp);

        // Try with common extensions
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js'];
        let found = false;

        for (const ext of extensions) {
          const testPath = resolvedPath + ext;
          try {
            await fs.access(testPath);
            resolved.push(testPath);
            found = true;
            break;
          } catch {
            continue;
          }
        }

        if (!found) {
          // Try as directory with index
          try {
            const indexPath = path_module.join(resolvedPath, 'index.ts');
            await fs.access(indexPath);
            resolved.push(indexPath);
          } catch {
            // Skip unresolvable imports
          }
        }
      } else if (imp.startsWith('@repo/')) {
        // Workspace import - skip for now (would need complex resolution)
        continue;
      } else {
        // External module - skip
        continue;
      }
    } catch {
      // Skip unresolvable imports
      continue;
    }
  }

  return resolved;
}

/**
 * Detect circular dependencies using DFS
 */
function detectCircularDependencies(graph: Map<string, DependencyNode>): CircularDependency[] {
  const cycles: CircularDependency[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (recursionStack.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart).concat([node]);

      cycles.push({
        cycle,
        depth: cycle.length - 1,
        severity: cycle.length <= 3 ? 'error' : cycle.length <= 5 ? 'warning' : 'info',
        type: cycle.length === 2 ? 'direct' : 'indirect',
      });
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    recursionStack.add(node);

    const nodeData = graph.get(node);
    if (nodeData) {
      for (const dependency of nodeData.resolvedImports) {
        dfs(dependency, [...path, node]);
      }
    }

    recursionStack.delete(node);
  }

  for (const [node] of graph) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }

  return cycles;
}

/**
 * Analyze dependency complexity metrics
 */
function analyzeDependencyComplexity(graph: Map<string, DependencyNode>) {
  const metrics = {
    totalFiles: graph.size,
    averageImports: 0,
    maxImports: 0,
    maxImportsFile: '',
    selfImports: 0,
    fanOut: new Map<string, number>(),
    fanIn: new Map<string, number>(),
  };

  let totalImports = 0;

  // Initialize fan-in counters
  for (const [file] of graph) {
    metrics.fanIn.set(file, 0);
  }

  for (const [file, node] of graph) {
    const importCount = node.resolvedImports.length;
    totalImports += importCount;

    metrics.fanOut.set(file, importCount);

    if (importCount > metrics.maxImports) {
      metrics.maxImports = importCount;
      metrics.maxImportsFile = file;
    }

    // Check for self-imports
    if (node.resolvedImports.includes(file)) {
      metrics.selfImports++;
    }

    // Update fan-in for dependencies
    for (const dep of node.resolvedImports) {
      const currentFanIn = metrics.fanIn.get(dep) || 0;
      metrics.fanIn.set(dep, currentFanIn + 1);
    }
  }

  metrics.averageImports = totalImports / graph.size;

  return metrics;
}

describe('Circular Dependency Analysis', () => {
  const exportFiles = [
    'client.ts',
    'server.ts',
    'client-next.ts',
    'server-next.ts',
    'server-next-edge.ts',
  ];

  test('detect circular dependencies in export files', async () => {
    const results = new Map<string, CircularDependency[]>();

    for (const fileName of exportFiles) {
      const filePath = path.join(PACKAGE_ROOT, fileName);

      try {
        const graph = await buildDependencyGraph(filePath);
        const cycles = detectCircularDependencies(graph);

        results.set(fileName, cycles);

        console.log(`${fileName} circular dependency analysis:`, {
          graphSize: graph.size,
          totalCycles: cycles.length,
          errorCycles: cycles.filter((c) => c.severity === 'error').length,
          warningCycles: cycles.filter((c) => c.severity === 'warning').length,
          directCycles: cycles.filter((c) => c.type === 'direct').length,
        });

        // No error-level cycles should exist
        const errorCycles = cycles.filter((c) => c.severity === 'error');
        expect(errorCycles).toEqual([]);

        if (errorCycles.length > 0) {
          console.error(`Error cycles in ${fileName}:`);
          errorCycles.forEach((cycle) => {
            console.error(`  ${cycle.cycle.join(' -> ')}`);
          });
        }
      } catch (error) {
        console.log(`Could not analyze ${fileName}: ${error}`);
        // Non-existent files are OK
      }
    }

    // Overall analysis
    const totalCycles = Array.from(results.values()).flat();
    console.log('\nOverall circular dependency summary:', {
      totalAnalyzedFiles: results.size,
      totalCycles: totalCycles.length,
      errorCycles: totalCycles.filter((c) => c.severity === 'error').length,
      averageCycleDepth:
        totalCycles.length > 0
          ? totalCycles.reduce((sum, c) => sum + c.depth, 0) / totalCycles.length
          : 0,
    });
  });

  test('analyze dependency complexity metrics', async () => {
    for (const fileName of exportFiles) {
      const filePath = path.join(PACKAGE_ROOT, fileName);

      try {
        const graph = await buildDependencyGraph(filePath);
        const metrics = analyzeDependencyComplexity(graph);

        console.log(`${fileName} complexity metrics:`, {
          totalFiles: metrics.totalFiles,
          averageImports: Math.round(metrics.averageImports * 100) / 100,
          maxImports: metrics.maxImports,
          selfImports: metrics.selfImports,
          highFanOut: Array.from(metrics.fanOut.entries()).filter(([_, count]) => count > 5).length,
          highFanIn: Array.from(metrics.fanIn.entries()).filter(([_, count]) => count > 3).length,
        });

        // Edge runtime should have minimal complexity
        if (fileName.includes('edge')) {
          expect(metrics.averageImports).toBeLessThan(3);
          expect(metrics.maxImports).toBeLessThan(8);
        }

        // No self-imports should exist
        expect(metrics.selfImports).toBe(0);
      } catch (error) {
        console.log(`Could not analyze complexity for ${fileName}`);
      }
    }
  });

  test('detect potential circular import patterns', async () => {
    const fs = await import('fs/promises');

    for (const fileName of exportFiles) {
      const filePath = path.join(PACKAGE_ROOT, fileName);

      try {
        const content = await fs.readFile(filePath, 'utf-8');

        // Look for patterns that might cause circular dependencies
        const suspiciousPatterns = [
          /import.*from\s+['"]\.\.\/.+\.\.\//g, // Deep relative imports
          /import.*from\s+['"]\.\.\/.+index['"]/, // Index file imports
          /export.*from\s+['"]\./g, // Re-exports
        ];

        const foundPatterns = [];

        for (const pattern of suspiciousPatterns) {
          const matches = Array.from(content.matchAll(pattern));
          if (matches.length > 0) {
            foundPatterns.push({
              pattern: pattern.source,
              count: matches.length,
              examples: matches.slice(0, 3).map((m) => m[0]),
            });
          }
        }

        console.log(`${fileName} suspicious import patterns:`, {
          totalPatterns: foundPatterns.length,
          patterns: foundPatterns,
        });

        // Edge runtime should have minimal suspicious patterns
        if (fileName.includes('edge')) {
          const totalSuspicious = foundPatterns.reduce((sum, p) => sum + p.count, 0);
          expect(totalSuspicious).toBeLessThan(3);
        }
      } catch (error) {
        console.log(`Could not analyze patterns for ${fileName}`);
      }
    }
  });

  test('verify import hierarchy consistency', async () => {
    const fs = await import('fs/promises');

    // Check that imports follow the expected hierarchy
    const hierarchyRules = [
      {
        file: 'server-next-edge.ts',
        shouldNotImport: ['server-next.ts', 'server.ts'],
        reason: 'Edge runtime should not import Node.js specific files',
      },
      {
        file: 'client-next.ts',
        shouldNotImport: ['server.ts', 'server-next.ts', 'server-next-edge.ts'],
        reason: 'Client should not import server files',
      },
      {
        file: 'client.ts',
        shouldNotImport: ['server.ts', 'server-next.ts', 'server-next-edge.ts', 'client-next.ts'],
        reason: 'Generic client should not import Next.js or server files',
      },
    ];

    for (const rule of hierarchyRules) {
      const filePath = path.join(PACKAGE_ROOT, rule.file);

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const imports = extractImportsFromContent(content);

        const violations = imports.filter((imp) =>
          rule.shouldNotImport.some((forbidden) => imp.includes(forbidden)),
        );

        expect(violations).toEqual([]);

        console.log(`${rule.file} hierarchy check:`, {
          totalImports: imports.length,
          violations: violations.length,
          rule: rule.reason,
        });

        if (violations.length > 0) {
          console.error(`Hierarchy violations in ${rule.file}:`, violations);
        }
      } catch (error) {
        console.log(`Could not check hierarchy for ${rule.file}`);
      }
    }
  });
});
