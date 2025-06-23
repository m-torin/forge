/**
 * Vite bundle analysis utilities for export validation
 * Uses Vite's build API to analyze actual bundle contents
 */

import { build, type InlineConfig, type Rollup } from 'vite';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

export interface BundleAnalysis {
  totalSize: number;
  chunks: Array<{
    fileName: string;
    size: number;
    imports: string[];
    exports: string[];
    code: string;
  }>;
  dependencies: Set<string>;
  hasOpenTelemetry: boolean;
  hasNodejsModules: boolean;
  violations: string[];
}

export interface ViteBuildResult {
  bundle: Rollup.OutputBundle;
  analysis: BundleAnalysis;
}

/**
 * Build a single export file using Vite and analyze the result
 */
export async function buildAndAnalyzeExport(
  entryPath: string,
  buildOptions: Partial<InlineConfig> = {},
): Promise<ViteBuildResult> {
  const config: InlineConfig = {
    configFile: false,
    logLevel: 'silent',
    build: {
      lib: {
        entry: entryPath,
        formats: ['es'],
        fileName: 'bundle',
      },
      write: false,
      minify: buildOptions.build?.minify ?? false,
      target: buildOptions.build?.target ?? 'esnext',
      rollupOptions: {
        external: (id) => {
          const customExternal = buildOptions.build?.rollupOptions?.external;
          if (typeof customExternal === 'function') {
            return customExternal(id);
          }
          // Default external modules
          return (
            id.includes('@opentelemetry') ||
            id.includes('@vercel/otel') ||
            id.startsWith('node:') ||
            ['fs', 'path', 'crypto', 'stream', 'http', 'https', 'net', 'tls', 'dns'].includes(id)
          );
        },
        ...buildOptions.build?.rollupOptions,
      },
      ...buildOptions.build,
    },
    ...buildOptions,
  };

  try {
    const result = await build(config);

    // Vite returns an array of outputs when building in lib mode
    if (Array.isArray(result)) {
      // Take the first output (should be our bundle)
      const output = result[0];
      if (!output || !('output' in output)) {
        throw new Error('No output found in build result');
      }

      // output.output is an array of chunks
      const bundle = output.output;
      const analysis = await analyzeBundleContents(bundle);
      return { bundle: bundle as any, analysis };
    } else if (result && typeof result === 'object' && 'output' in result) {
      const bundle = (result as any).output;
      const analysis = await analyzeBundleContents(bundle);
      return { bundle: bundle as any, analysis };
    } else {
      throw new Error('Unexpected build result format');
    }
  } catch (error) {
    throw new Error(`Failed to build ${entryPath}: ${(error as Error).message}`);
  }
}

/**
 * Analyze the contents of a Vite bundle
 */
export async function analyzeBundleContents(
  bundle: Rollup.OutputBundle | any,
): Promise<BundleAnalysis> {
  const analysis: BundleAnalysis = {
    totalSize: 0,
    chunks: [],
    dependencies: new Set(),
    hasOpenTelemetry: false,
    hasNodejsModules: false,
    violations: [],
  };

  // Handle different bundle formats
  let chunks: any[] = [];
  if (Array.isArray(bundle)) {
    chunks = bundle;
  } else if (bundle && typeof bundle === 'object' && bundle.type === 'chunk') {
    chunks = [bundle];
  } else if (bundle && typeof bundle === 'object') {
    chunks = Object.values(bundle);
  }

  for (const output of chunks) {
    if (output && output.type === 'chunk') {
      const chunkSize = output.code.length;
      analysis.totalSize += chunkSize;

      // Extract imports and exports from chunk
      const imports = output.imports || [];
      const exports = Object.keys(output.exports || {});

      // Analyze code content
      const codeAnalysis = analyzeChunkCode(output.code);

      analysis.chunks.push({
        fileName: output.fileName || 'bundle.js',
        size: chunkSize,
        imports,
        exports,
        code: output.code,
      });

      // Collect all dependencies
      imports.forEach((imp) => analysis.dependencies.add(imp));
      codeAnalysis.dependencies.forEach((dep) => analysis.dependencies.add(dep));

      // Check for violations
      if (codeAnalysis.hasOpenTelemetry) {
        analysis.hasOpenTelemetry = true;
        analysis.violations.push(`OpenTelemetry code found in ${fileName}`);
      }

      if (codeAnalysis.hasNodejsModules) {
        analysis.hasNodejsModules = true;
        analysis.violations.push(`Node.js modules found in ${fileName}`);
      }

      // Add specific violations
      analysis.violations.push(...codeAnalysis.violations.map((v) => `${fileName}: ${v}`));
    }
  }

  return analysis;
}

/**
 * Analyze JavaScript code for problematic patterns
 */
export function analyzeChunkCode(code: string): {
  dependencies: Set<string>;
  hasOpenTelemetry: boolean;
  hasNodejsModules: boolean;
  violations: string[];
} {
  const dependencies = new Set<string>();
  const violations: string[] = [];
  let hasOpenTelemetry = false;
  let hasNodejsModules = false;

  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        dependencies.add(source);

        if (source.includes('@opentelemetry')) {
          hasOpenTelemetry = true;
          violations.push(`Import of OpenTelemetry module: ${source}`);
        }

        if (
          source.startsWith('node:') ||
          ['fs', 'path', 'crypto', 'stream', 'http', 'https', 'net', 'tls', 'dns'].includes(source)
        ) {
          hasNodejsModules = true;
          violations.push(`Import of Node.js module: ${source}`);
        }
      },

      CallExpression(path) {
        // Check for dynamic imports
        if (
          path.node.callee.type === 'Import' &&
          path.node.arguments[0]?.type === 'StringLiteral'
        ) {
          const source = path.node.arguments[0].value;
          dependencies.add(source);

          if (source.includes('@opentelemetry')) {
            hasOpenTelemetry = true;
            violations.push(`Dynamic import of OpenTelemetry: ${source}`);
          }
        }

        // Check for eval-wrapped imports (these should be OK)
        if (
          path.node.callee.type === 'Identifier' &&
          path.node.callee.name === 'eval' &&
          path.node.arguments[0]?.type === 'StringLiteral'
        ) {
          const evalCode = path.node.arguments[0].value;
          if (evalCode.includes('import')) {
            // This is an eval-wrapped import, which is acceptable
            violations.push(`Eval-wrapped import detected (acceptable): ${evalCode}`);
          }
        }
      },

      MemberExpression(path) {
        // Check for process.env usage
        if (
          path.node.object.type === 'Identifier' &&
          path.node.object.name === 'process' &&
          path.node.property.type === 'Identifier' &&
          path.node.property.name === 'env'
        ) {
          // This is generally OK, but flag for review
        }

        // Check for Buffer usage
        if (path.node.object.type === 'Identifier' && path.node.object.name === 'Buffer') {
          hasNodejsModules = true;
          violations.push('Usage of Node.js Buffer object');
        }
      },

      Identifier(path) {
        // Check for __dirname, __filename usage
        if (['__dirname', '__filename'].includes(path.node.name)) {
          hasNodejsModules = true;
          violations.push(`Usage of Node.js global: ${path.node.name}`);
        }
      },
    });
  } catch (error) {
    violations.push(`Failed to parse code: ${(error as Error).message}`);
  }

  // String-based checks for patterns that might be missed by AST
  if (code.includes('@opentelemetry')) {
    hasOpenTelemetry = true;
  }

  if (
    code.includes('require(') &&
    (code.includes('require("fs")') || code.includes("require('fs')"))
  ) {
    hasNodejsModules = true;
    violations.push('CommonJS require() of Node.js modules detected');
  }

  return {
    dependencies,
    hasOpenTelemetry,
    hasNodejsModules,
    violations,
  };
}

/**
 * Test if an export can be built for a specific runtime
 */
export async function testExportBuildability(
  entryPath: string,
  runtime: 'edge' | 'browser' | 'nodejs',
): Promise<{ success: boolean; errors: string[]; analysis?: BundleAnalysis }> {
  const errors: string[] = [];

  try {
    const buildOptions: Partial<InlineConfig> = {
      build: {
        target: runtime === 'edge' ? 'esnext' : runtime === 'browser' ? 'es2020' : 'node18',
        rollupOptions: {
          external: (id) => {
            if (runtime === 'edge' || runtime === 'browser') {
              // Mark Node.js modules as external for edge/browser
              return (
                id.includes('@opentelemetry') ||
                id.includes('@vercel/otel') ||
                id.startsWith('node:') ||
                ['fs', 'path', 'crypto', 'stream', 'http', 'https', 'net', 'tls', 'dns'].includes(
                  id,
                )
              );
            }
            return false; // Node.js can import anything
          },
        },
      },
    };

    const result = await buildAndAnalyzeExport(entryPath, buildOptions);

    // Check for runtime-specific violations
    if (runtime === 'edge') {
      if (result.analysis.hasOpenTelemetry) {
        errors.push('Edge runtime export contains OpenTelemetry code');
      }
      if (result.analysis.hasNodejsModules) {
        errors.push('Edge runtime export contains Node.js modules');
      }
    }

    if (runtime === 'browser') {
      if (result.analysis.hasNodejsModules) {
        errors.push('Browser export contains Node.js modules');
      }
    }

    errors.push(...result.analysis.violations);

    return {
      success: errors.length === 0,
      errors,
      analysis: result.analysis,
    };
  } catch (error) {
    errors.push((error as Error).message);
    return { success: false, errors };
  }
}

/**
 * Compare bundle analyses to detect cross-contamination
 */
export function detectCrossContamination(
  edgeAnalysis: BundleAnalysis,
  nodeAnalysis: BundleAnalysis,
  browserAnalysis: BundleAnalysis,
): {
  violations: string[];
  sharedDependencies: string[];
  recommendations: string[];
} {
  const violations: string[] = [];
  const recommendations: string[] = [];

  // Find shared dependencies that shouldn't be shared
  const edgeDeps = edgeAnalysis.dependencies;
  const nodeDeps = nodeAnalysis.dependencies;
  const browserDeps = browserAnalysis.dependencies;

  const problematicShared = Array.from(edgeDeps).filter(
    (dep) => dep.includes('@opentelemetry') || dep.includes('@vercel/otel'),
  );

  if (problematicShared.length > 0) {
    violations.push(`Edge export shares problematic dependencies: ${problematicShared.join(', ')}`);
    recommendations.push('Move OpenTelemetry dependencies to Node.js-only exports');
  }

  const sharedDependencies = Array.from(edgeDeps).filter(
    (dep) => nodeDeps.has(dep) || browserDeps.has(dep),
  );

  // Check bundle sizes
  if (edgeAnalysis.totalSize > 50_000) {
    // 50KB limit for edge
    violations.push(`Edge bundle too large: ${edgeAnalysis.totalSize} bytes`);
    recommendations.push('Reduce edge runtime bundle size by removing unnecessary dependencies');
  }

  return {
    violations,
    sharedDependencies,
    recommendations,
  };
}

/**
 * Generate comprehensive bundle report
 */
export function generateBundleReport(
  exportName: string,
  analysis: BundleAnalysis,
  runtime: string,
): string {
  const lines: string[] = [];

  lines.push(`=== Bundle Analysis Report: ${exportName} (${runtime}) ===`);
  lines.push(`Total Size: ${analysis.totalSize.toLocaleString()} bytes`);
  lines.push(`Chunks: ${analysis.chunks.length}`);
  lines.push(`Dependencies: ${analysis.dependencies.size}`);
  lines.push(`OpenTelemetry: ${analysis.hasOpenTelemetry ? '❌ PRESENT' : '✅ CLEAN'}`);
  lines.push(`Node.js Modules: ${analysis.hasNodejsModules ? '❌ PRESENT' : '✅ CLEAN'}`);
  lines.push('');

  if (analysis.violations.length > 0) {
    lines.push('🚨 Violations:');
    analysis.violations.forEach((violation) => lines.push(`  - ${violation}`));
    lines.push('');
  }

  if (analysis.dependencies.size > 0) {
    lines.push('📦 Dependencies:');
    Array.from(analysis.dependencies)
      .sort()
      .forEach((dep) => lines.push(`  - ${dep}`));
    lines.push('');
  }

  analysis.chunks.forEach((chunk) => {
    lines.push(`📄 Chunk: ${chunk.fileName} (${chunk.size.toLocaleString()} bytes)`);
    if (chunk.imports.length > 0) {
      lines.push(`  Imports: ${chunk.imports.join(', ')}`);
    }
    if (chunk.exports.length > 0) {
      lines.push(`  Exports: ${chunk.exports.join(', ')}`);
    }
  });

  return lines.join('\n');
}
