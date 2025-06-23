/**
 * Vite plugin for build-time five-file export pattern validation
 * Catches violations during the build process
 */

import type { Plugin, ResolvedConfig } from 'vite';
import path from 'path';
import { analyzeChunkCode } from './vite-bundle-analyzer';

export interface FiveFileValidationOptions {
  /** Enable strict mode for edge runtime (fails build on violations) */
  strict?: boolean;
  /** Runtime being built for */
  runtime?: 'edge' | 'browser' | 'nodejs';
  /** Custom forbidden patterns */
  forbiddenPatterns?: Array<{
    pattern: RegExp;
    message: string;
    severity: 'error' | 'warning';
  }>;
  /** Files to exclude from validation */
  exclude?: string[];
}

/**
 * Default forbidden patterns for different runtimes
 */
const DEFAULT_PATTERNS = {
  edge: [
    {
      pattern: /@opentelemetry/,
      message: 'OpenTelemetry packages not supported in edge runtime',
      severity: 'error' as const,
    },
    {
      pattern: /@vercel\/otel/,
      message: 'Vercel OTEL not supported in edge runtime',
      severity: 'error' as const,
    },
    {
      pattern: /^node:/,
      message: 'Node.js built-in modules not available in edge runtime',
      severity: 'error' as const,
    },
    {
      pattern: /^(fs|path|crypto|stream|http|https|net|tls|dns)$/,
      message: 'Node.js built-in modules not available in edge runtime',
      severity: 'error' as const,
    },
    {
      pattern: /pino|winston/,
      message: 'Node.js logging libraries not compatible with edge runtime',
      severity: 'error' as const,
    },
  ],
  browser: [
    {
      pattern: /@opentelemetry/,
      message: 'OpenTelemetry is server-side only',
      severity: 'error' as const,
    },
    {
      pattern: /^node:/,
      message: 'Node.js modules not available in browser',
      severity: 'error' as const,
    },
    {
      pattern: /@sentry\/node/,
      message: 'Sentry Node.js package not compatible with browser',
      severity: 'error' as const,
    },
  ],
  nodejs: [
    // Node.js can generally import anything, but add specific restrictions if needed
  ],
};

/**
 * Service-specific patterns that should be caught
 */
const SERVICE_PATTERNS = [
  {
    pattern: /@prisma\/client/,
    message: 'Prisma client contains native bindings incompatible with edge runtime',
    runtimes: ['edge', 'browser'],
    severity: 'error' as const,
  },
  {
    pattern: /jsonwebtoken|bcrypt|argon2/,
    message: 'Crypto libraries require Node.js APIs',
    runtimes: ['edge', 'browser'],
    severity: 'error' as const,
  },
  {
    pattern: /nodemailer|smtp/,
    message: 'Email libraries require Node.js networking APIs',
    runtimes: ['edge', 'browser'],
    severity: 'warning' as const,
  },
  {
    pattern: /aws-sdk|@aws-sdk/,
    message: 'AWS SDK requires Node.js APIs',
    runtimes: ['edge', 'browser'],
    severity: 'warning' as const,
  },
];

/**
 * Create Vite plugin for five-file export validation
 */
export function createFiveFileValidator(options: FiveFileValidationOptions = {}): Plugin {
  const { strict = false, runtime = 'nodejs', forbiddenPatterns = [], exclude = [] } = options;

  let config: ResolvedConfig;
  const violations: Array<{ file: string; message: string; severity: string }> = [];

  // Combine default and custom patterns
  const allPatterns = [
    ...DEFAULT_PATTERNS[runtime],
    ...SERVICE_PATTERNS.filter((p) => p.runtimes.includes(runtime)),
    ...forbiddenPatterns,
  ];

  return {
    name: 'five-file-export-validator',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    buildStart() {
      violations.length = 0; // Clear previous violations

      if (config.command === 'build') {
        this.info(
          `🔍 Five-file export validation enabled (runtime: ${runtime}, strict: ${strict})`,
        );
      }
    },

    resolveId(id, importer) {
      // Skip validation for excluded files
      if (exclude.some((pattern) => importer?.includes(pattern))) {
        return null;
      }

      // Check for forbidden imports during resolution
      if (importer) {
        for (const pattern of allPatterns) {
          if (pattern.pattern.test(id)) {
            const violation = {
              file: path.relative(config.root, importer),
              message: `Import violation: ${id} - ${pattern.message}`,
              severity: pattern.severity,
            };

            violations.push(violation);

            if (pattern.severity === 'error' && strict) {
              this.error(`❌ ${violation.message} in ${violation.file}`);
            } else {
              this.warn(`⚠️  ${violation.message} in ${violation.file}`);
            }
          }
        }
      }

      return null; // Let normal resolution continue
    },

    transform(code, id) {
      // Skip validation for excluded files
      if (exclude.some((pattern) => id.includes(pattern))) {
        return null;
      }

      // Analyze code for runtime-specific violations
      const analysis = analyzeChunkCode(code);

      for (const violation of analysis.violations) {
        const file = path.relative(config.root, id);
        const fullViolation = {
          file,
          message: violation,
          severity: 'warning',
        };

        violations.push(fullViolation);

        if (strict) {
          this.warn(`⚠️  Code analysis: ${violation} in ${file}`);
        }
      }

      return null; // Don't transform the code
    },

    generateBundle(options, bundle) {
      // Final validation of generated bundle
      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type === 'chunk') {
          // Check imports in the final bundle
          const problematicImports =
            output.imports?.filter((imp) =>
              allPatterns.some((pattern) => pattern.pattern.test(imp)),
            ) || [];

          if (problematicImports.length > 0) {
            const violation = {
              file: fileName,
              message: `Bundle contains forbidden imports: ${problematicImports.join(', ')}`,
              severity: 'error',
            };

            violations.push(violation);

            if (strict) {
              this.error(`❌ ${violation.message}`);
            } else {
              this.warn(`⚠️  ${violation.message}`);
            }
          }

          // Check for specific patterns in bundle code
          const codeViolations = analyzeChunkCode(output.code);

          if (runtime === 'edge' && codeViolations.hasOpenTelemetry) {
            const violation = {
              file: fileName,
              message: 'Bundle contains OpenTelemetry code in edge runtime',
              severity: 'error',
            };

            violations.push(violation);

            if (strict) {
              this.error(`❌ ${violation.message}`);
            } else {
              this.warn(`⚠️  ${violation.message}`);
            }
          }

          if ((runtime === 'edge' || runtime === 'browser') && codeViolations.hasNodejsModules) {
            const violation = {
              file: fileName,
              message: `Bundle contains Node.js modules in ${runtime} runtime`,
              severity: 'error',
            };

            violations.push(violation);

            if (strict) {
              this.error(`❌ ${violation.message}`);
            } else {
              this.warn(`⚠️  ${violation.message}`);
            }
          }
        }
      }
    },

    closeBundle() {
      // Generate final report
      if (violations.length > 0) {
        const errors = violations.filter((v) => v.severity === 'error');
        const warnings = violations.filter((v) => v.severity === 'warning');

        this.info('📊 Five-file export validation summary:');
        this.info(`  Errors: ${errors.length}`);
        this.info(`  Warnings: ${warnings.length}`);

        if (errors.length > 0 && strict) {
          this.error('❌ Build failed due to five-file export violations');
        } else if (violations.length > 0) {
          this.warn('⚠️  Five-file export violations detected but build continuing');
        } else {
          this.info('✅ No five-file export violations detected');
        }
      }
    },
  };
}

/**
 * Preset configurations for common scenarios
 */
export const presets = {
  /**
   * Strict edge runtime validation
   */
  edgeStrict: (): Plugin =>
    createFiveFileValidator({
      runtime: 'edge',
      strict: true,
      forbiddenPatterns: [
        {
          pattern: /eval\(/,
          message: "eval() usage detected - ensure it's for dynamic imports only",
          severity: 'warning',
        },
      ],
    }),

  /**
   * Browser export validation
   */
  browser: (): Plugin =>
    createFiveFileValidator({
      runtime: 'browser',
      strict: false,
      exclude: ['node_modules'],
    }),

  /**
   * Development mode validation (warnings only)
   */
  development: (): Plugin =>
    createFiveFileValidator({
      runtime: 'nodejs',
      strict: false,
      forbiddenPatterns: [
        {
          pattern: /console\.log/,
          message: 'console.log usage in production code',
          severity: 'warning',
        },
      ],
    }),

  /**
   * CI/CD validation (strict mode)
   */
  ci: (runtime: 'edge' | 'browser' | 'nodejs' = 'edge'): Plugin =>
    createFiveFileValidator({
      runtime,
      strict: true,
      exclude: ['node_modules', '__tests__', '*.test.ts', '*.spec.ts'],
    }),
};

/**
 * Helper to create validation config for specific export files
 */
export function createExportValidation(exportFile: string): Plugin {
  const runtime = exportFile.includes('edge')
    ? 'edge'
    : exportFile.includes('client')
      ? 'browser'
      : 'nodejs';

  return createFiveFileValidator({
    runtime,
    strict: process.env.NODE_ENV === 'production',
    exclude: ['node_modules', '__tests__'],
  });
}

/**
 * Validation results interface for programmatic usage
 */
export interface ValidationResults {
  violations: Array<{
    file: string;
    message: string;
    severity: 'error' | 'warning';
    pattern?: string;
  }>;
  summary: {
    total: number;
    errors: number;
    warnings: number;
    passed: boolean;
  };
}

/**
 * Run validation programmatically (for testing)
 */
export async function validateExportFile(
  filePath: string,
  options: FiveFileValidationOptions = {},
): Promise<ValidationResults> {
  const violations: ValidationResults['violations'] = [];

  // This would need to be implemented to run validation outside of Vite build
  // For now, it's a placeholder for the interface

  const errors = violations.filter((v) => v.severity === 'error').length;
  const warnings = violations.filter((v) => v.severity === 'warning').length;

  return {
    violations,
    summary: {
      total: violations.length,
      errors,
      warnings,
      passed: errors === 0,
    },
  };
}
