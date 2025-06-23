/**
 * Import analysis utilities for testing export isolation
 * Programmatically analyze import chains and detect contamination
 */

import fs from 'fs/promises';
import path from 'path';

export interface ImportAnalysis {
  staticImports: string[];
  dynamicImports: string[];
  evalWrappedImports: string[];
  allDependencies: Set<string>;
  importChain: string[];
}

export interface ForbiddenModule {
  pattern: RegExp;
  reason: string;
  runtime: 'edge' | 'browser' | 'nodejs';
}

/**
 * Common forbidden modules for different runtimes
 */
export const FORBIDDEN_MODULES = {
  edge: [
    {
      pattern: /@opentelemetry/,
      reason: 'OpenTelemetry uses native modules incompatible with edge runtime',
      runtime: 'edge' as const,
    },
    {
      pattern: /@vercel\/otel/,
      reason: 'Vercel OTEL depends on OpenTelemetry native modules',
      runtime: 'edge' as const,
    },
    {
      pattern: /^node:/,
      reason: 'Node.js built-in modules not available in edge runtime',
      runtime: 'edge' as const,
    },
    {
      pattern: /^fs$|^path$|^crypto$|^stream$/,
      reason: 'Node.js built-in modules not available in edge runtime',
      runtime: 'edge' as const,
    },
    {
      pattern: /pino|winston/,
      reason: 'Node.js-specific logging libraries not compatible with edge runtime',
      runtime: 'edge' as const,
    },
  ],
  browser: [
    {
      pattern: /@opentelemetry/,
      reason: 'OpenTelemetry is server-side only',
      runtime: 'browser' as const,
    },
    {
      pattern: /^node:/,
      reason: 'Node.js modules not available in browser',
      runtime: 'browser' as const,
    },
    {
      pattern: /^fs$|^path$|^crypto$|^stream$/,
      reason: 'Node.js built-in modules not available in browser',
      runtime: 'browser' as const,
    },
    {
      pattern: /@sentry\/node/,
      reason: 'Sentry Node.js package not compatible with browser',
      runtime: 'browser' as const,
    },
  ],
  nodejs: [
    // Node.js can generally import anything, but we might add specific restrictions
  ],
} as const;

/**
 * Extract static import statements from TypeScript/JavaScript file content
 */
export function extractStaticImports(content: string): string[] {
  const staticImportRegex =
    /^import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"];?$/gm;
  const imports: string[] = [];
  let match;

  while ((match = staticImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * Extract dynamic import statements from file content
 */
export function extractDynamicImports(content: string): string[] {
  const dynamicImportRegex = /(?:await\s+)?import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  const imports: string[] = [];
  let match;

  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * Extract eval-wrapped dynamic imports from file content
 */
export function extractEvalWrappedImports(content: string): string[] {
  const evalImportRegex =
    /eval\s*\(\s*['"`]\(\s*specifier\s*\)\s*=>\s*import\s*\(\s*specifier\s*\)['"`]\s*\)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  const imports: string[] = [];
  let match;

  while ((match = evalImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * Check if a module path is relative (starts with ./ or ../)
 */
export function isRelativeImport(modulePath: string): boolean {
  return modulePath.startsWith('./') || modulePath.startsWith('../');
}

/**
 * Resolve relative import path to absolute path
 */
export async function resolveImportPath(currentFile: string, importPath: string): Promise<string> {
  if (!isRelativeImport(importPath)) {
    return importPath; // External module, return as-is
  }

  const currentDir = path.dirname(currentFile);
  const resolved = path.resolve(currentDir, importPath);

  // Try common TypeScript extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  for (const ext of extensions) {
    const withExt = resolved + ext;
    try {
      await fs.access(withExt);
      return withExt;
    } catch {
      // Continue to next extension
    }
  }

  // Try as directory with index file
  try {
    const indexPath = path.join(resolved, 'index.ts');
    await fs.access(indexPath);
    return indexPath;
  } catch {
    // Fall through
  }

  return resolved + '.ts'; // Default assumption
}

/**
 * Analyze import chain recursively from a starting file
 */
export async function analyzeImportChain(
  startFile: string,
  visited: Set<string> = new Set(),
  baseDir: string = process.cwd(),
): Promise<ImportAnalysis> {
  const analysis: ImportAnalysis = {
    staticImports: [],
    dynamicImports: [],
    evalWrappedImports: [],
    allDependencies: new Set(),
    importChain: [],
  };

  const absolutePath = path.resolve(baseDir, startFile);

  // Prevent infinite recursion
  if (visited.has(absolutePath)) {
    return analysis;
  }
  visited.add(absolutePath);
  analysis.importChain.push(absolutePath);

  try {
    const content = await fs.readFile(absolutePath, 'utf-8');

    // Extract different types of imports
    const staticImports = extractStaticImports(content);
    const dynamicImports = extractDynamicImports(content);
    const evalImports = extractEvalWrappedImports(content);

    analysis.staticImports.push(...staticImports);
    analysis.dynamicImports.push(...dynamicImports);
    analysis.evalWrappedImports.push(...evalImports);

    // Add all imports to dependencies
    [...staticImports, ...dynamicImports, ...evalImports].forEach((imp) => {
      analysis.allDependencies.add(imp);
    });

    // Recursively analyze local imports (but not external modules)
    // Limit depth to prevent excessive recursion
    const maxDepth = 10;
    const currentDepth = analysis.importChain.length;

    if (currentDepth < maxDepth) {
      for (const importPath of staticImports) {
        if (isRelativeImport(importPath)) {
          try {
            const resolvedPath = await resolveImportPath(absolutePath, importPath);

            // Skip if already visited
            if (!visited.has(resolvedPath)) {
              const childAnalysis = await analyzeImportChain(resolvedPath, visited, baseDir);

              // Merge child analysis
              analysis.staticImports.push(...childAnalysis.staticImports);
              analysis.dynamicImports.push(...childAnalysis.dynamicImports);
              analysis.evalWrappedImports.push(...childAnalysis.evalWrappedImports);
              childAnalysis.allDependencies.forEach((dep) => analysis.allDependencies.add(dep));
              analysis.importChain.push(...childAnalysis.importChain);
            }
          } catch (error) {
            // Skip unresolvable imports
            console.warn(`Could not resolve import ${importPath} from ${absolutePath}`);
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Could not analyze file ${absolutePath}:`, error);
  }

  return analysis;
}

/**
 * Check if import analysis contains forbidden modules for specific runtime
 */
export function checkForbiddenModules(
  analysis: ImportAnalysis,
  runtime: 'edge' | 'browser' | 'nodejs',
): {
  violations: Array<{ module: string; reason: string; type: 'static' | 'dynamic' | 'eval' }>;
  isValid: boolean;
} {
  const violations: Array<{ module: string; reason: string; type: 'static' | 'dynamic' | 'eval' }> =
    [];
  const forbiddenList = FORBIDDEN_MODULES[runtime];

  // Check static imports (most critical for bundling)
  for (const module of analysis.staticImports) {
    for (const forbidden of forbiddenList) {
      if (forbidden.pattern.test(module)) {
        violations.push({
          module,
          reason: forbidden.reason,
          type: 'static',
        });
      }
    }
  }

  // Check dynamic imports (less critical but still problematic)
  for (const module of analysis.dynamicImports) {
    for (const forbidden of forbiddenList) {
      if (forbidden.pattern.test(module)) {
        violations.push({
          module,
          reason: forbidden.reason,
          type: 'dynamic',
        });
      }
    }
  }

  // Eval-wrapped imports should be safe, but check anyway
  for (const module of analysis.evalWrappedImports) {
    for (const forbidden of forbiddenList) {
      if (forbidden.pattern.test(module)) {
        violations.push({
          module,
          reason: forbidden.reason,
          type: 'eval',
        });
      }
    }
  }

  return {
    violations,
    isValid: violations.length === 0,
  };
}

/**
 * Generate human-readable report of import analysis
 */
export function generateImportReport(
  analysis: ImportAnalysis,
  runtime?: 'edge' | 'browser' | 'nodejs',
): string {
  const lines: string[] = [];

  lines.push('=== Import Analysis Report ===');
  lines.push(`Total dependencies: ${analysis.allDependencies.size}`);
  lines.push(`Static imports: ${analysis.staticImports.length}`);
  lines.push(`Dynamic imports: ${analysis.dynamicImports.length}`);
  lines.push(`Eval-wrapped imports: ${analysis.evalWrappedImports.length}`);
  lines.push('');

  if (analysis.staticImports.length > 0) {
    lines.push('Static Imports:');
    analysis.staticImports.forEach((imp) => lines.push(`  - ${imp}`));
    lines.push('');
  }

  if (analysis.dynamicImports.length > 0) {
    lines.push('Dynamic Imports:');
    analysis.dynamicImports.forEach((imp) => lines.push(`  - ${imp}`));
    lines.push('');
  }

  if (analysis.evalWrappedImports.length > 0) {
    lines.push('Eval-wrapped Imports:');
    analysis.evalWrappedImports.forEach((imp) => lines.push(`  - ${imp}`));
    lines.push('');
  }

  if (runtime) {
    const check = checkForbiddenModules(analysis, runtime);
    lines.push(`Runtime Compatibility (${runtime}): ${check.isValid ? 'PASS' : 'FAIL'}`);

    if (check.violations.length > 0) {
      lines.push('Violations:');
      check.violations.forEach((violation) => {
        lines.push(`  - ${violation.module} (${violation.type}): ${violation.reason}`);
      });
    }
  }

  return lines.join('\n');
}
