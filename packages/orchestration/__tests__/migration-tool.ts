/**
 * Automated Migration Tool
 *
 * Provides automated migration capabilities to convert existing test files
 * to use the new DRY patterns. This tool analyzes existing test files and
 * applies transformations to use centralized utilities.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';

// Types for migration configuration
export interface MigrationConfig {
  sourceFile: string;
  outputFile?: string;
  dryRun?: boolean;
  backup?: boolean;
  verbose?: boolean;
  transformations?: TransformationType[];
}

export type TransformationType =
  | 'imports'
  | 'mocks'
  | 'testData'
  | 'assertions'
  | 'testSuites'
  | 'performance'
  | 'errorHandling';

export interface MigrationResult {
  success: boolean;
  originalLines: number;
  transformedLines: number;
  reductionPercentage: number;
  transformationsApplied: string[];
  issues: string[];
  warnings: string[];
}

/**
 * Test Migration Tool Class
 */
export class TestMigrationTool {
  private transformations = new Map<TransformationType, (source: string) => string>();

  constructor() {
    this.loadTransformations();
  }

  /**
   * Load all transformation functions
   */
  private loadTransformations() {
    this.transformations.set('imports', this.transformImports.bind(this));
    this.transformations.set('mocks', this.transformMocks.bind(this));
    this.transformations.set('testData', this.transformTestData.bind(this));
    this.transformations.set('assertions', this.transformAssertions.bind(this));
    this.transformations.set('testSuites', this.transformTestSuites.bind(this));
    this.transformations.set('performance', this.transformPerformance.bind(this));
    this.transformations.set('errorHandling', this.transformErrorHandling.bind(this));
  }

  /**
   * Migrate a single test file
   */
  async migrateFile(config: MigrationConfig): Promise<MigrationResult> {
    const { sourceFile, outputFile, dryRun = false, backup = true, verbose = false } = config;

    if (!existsSync(sourceFile)) {
      throw new Error(`Source file not found: ${sourceFile}`);
    }

    const originalContent = readFileSync(sourceFile, 'utf8');
    const originalLines = originalContent.split('\n').length;

    if (verbose) {
      console.log(`📁 Migrating: ${sourceFile}`);
    }

    // Create backup if requested
    if (backup && !dryRun) {
      const backupFile = `${sourceFile}.backup`;
      writeFileSync(backupFile, originalContent);
      if (verbose) {
        console.log(`💾 Backup created: ${backupFile}`);
      }
    }

    // Apply transformations
    let transformedContent = originalContent;
    const transformationsApplied: string[] = [];
    const issues: string[] = [];
    const warnings: string[] = [];

    const transformationsToApply = config.transformations || [
      'imports',
      'mocks',
      'testData',
      'assertions',
      'testSuites',
      'performance',
      'errorHandling',
    ];

    for (const transformationType of transformationsToApply) {
      try {
        const transformer = this.transformations.get(transformationType);
        if (transformer) {
          const beforeTransform = transformedContent;
          transformedContent = transformer(transformedContent);

          if (beforeTransform !== transformedContent) {
            transformationsApplied.push(transformationType);
            if (verbose) {
              console.log(`✅ Applied transformation: ${transformationType}`);
            }
          }
        }
      } catch (error) {
        issues.push(`Failed to apply ${transformationType}: ${(error as Error).message}`);
        if (verbose) {
          console.warn(
            `⚠️  ${transformationType} transformation failed: ${(error as Error).message}`,
          );
        }
      }
    }

    // Analyze results
    const transformedLines = transformedContent.split('\n').length;
    const reductionPercentage = Math.round(
      ((originalLines - transformedLines) / originalLines) * 100,
    );

    // Save transformed content
    const finalOutputFile = outputFile || sourceFile;
    if (!dryRun) {
      writeFileSync(finalOutputFile, transformedContent);
      if (verbose) {
        console.log(`💾 Saved: ${finalOutputFile}`);
      }
    }

    return {
      success: issues.length === 0,
      originalLines,
      transformedLines,
      reductionPercentage,
      transformationsApplied,
      issues,
      warnings,
    };
  }

  /**
   * Transform imports to use centralized utilities
   */
  private transformImports(source: string): string {
    let transformed = source;

    // Replace scattered imports with centralized ones
    const importReplacements = [
      {
        pattern:
          /import\s+{\s*createTestSuite\s*}\s+from\s+['"]\.\/utils\/test-patterns['"];?\s*\n/g,
        replacement: '',
      },
      {
        pattern:
          /import\s+{\s*[^}]*testDynamicImport[^}]*\s*}\s+from\s+['"]\.\/utils\/import-testing['"];?\s*\n/g,
        replacement: '',
      },
      {
        pattern:
          /import\s+{\s*[^}]*createTestWorkflow[^}]*\s*}\s+from\s+['"]\.\/fixtures['"];?\s*\n/g,
        replacement: '',
      },
    ];

    importReplacements.forEach(({ pattern, replacement }) => {
      transformed = transformed.replace(pattern, replacement);
    });

    // Add centralized DRY imports if they don't exist
    const dryImports = [
      "import {\n  createWorkflowTestSuite,\n  createProviderTestSuite,\n  testModuleImport,\n  assertWorkflowExecution,\n} from './workflow-test-factory';",
      "import {\n  workflowGenerators,\n  stepGenerators,\n  executionGenerators,\n  testDataUtils,\n} from './test-data-generators';",
      "import {\n  TestUtils,\n  AssertionUtils,\n  PerformanceUtils,\n  ValidationUtils,\n} from './test-utils';",
      "import {\n  createMockWorkflowProvider,\n  createMockWorkflowEngine,\n} from './setup';",
    ];

    // Check if DRY imports are needed and add them
    if (
      !transformed.includes("from './workflow-test-factory'") &&
      (transformed.includes('createWorkflowTestSuite') || transformed.includes('testModuleImport'))
    ) {
      transformed = this.addImportAfterExistingImports(transformed, dryImports[0]);
    }

    if (
      !transformed.includes("from './test-data-generators'") &&
      (transformed.includes('workflowGenerators') || transformed.includes('stepGenerators'))
    ) {
      transformed = this.addImportAfterExistingImports(transformed, dryImports[1]);
    }

    if (
      !transformed.includes("from './test-utils'") &&
      (transformed.includes('TestUtils') || transformed.includes('AssertionUtils'))
    ) {
      transformed = this.addImportAfterExistingImports(transformed, dryImports[2]);
    }

    if (
      !transformed.includes("from './setup'") &&
      (transformed.includes('createMockWorkflowProvider') ||
        transformed.includes('createMockWorkflowEngine'))
    ) {
      transformed = this.addImportAfterExistingImports(transformed, dryImports[3]);
    }

    return transformed;
  }

  /**
   * Transform manual mock creation to use centralized setup
   */
  private transformMocks(source: string): string {
    let transformed = source;

    // Replace manual mock provider creation
    const mockProviderPattern =
      /const\s+(\w*[mM]ock\w*[pP]rovider\w*)\s*=\s*{[^}]*execute:\s*vi\.fn\(\)\.mockResolvedValue\([^)]*\)[^}]*};?/gs;
    transformed = transformed.replace(
      mockProviderPattern,
      'const $1 = createMockWorkflowProvider();',
    );

    // Replace manual workflow engine mocks
    const mockEnginePattern =
      /const\s+(\w*[mM]ock\w*[eE]ngine\w*)\s*=\s*{[^}]*execute:\s*vi\.fn\(\)[^}]*};?/gs;
    transformed = transformed.replace(mockEnginePattern, 'const $1 = createMockWorkflowEngine();');

    // Replace manual step factory mocks
    const mockStepFactoryPattern =
      /const\s+(\w*[mM]ock\w*[sS]tep\w*[fF]actory\w*)\s*=\s*{[^}]*createStep:\s*vi\.fn\(\)[^}]*};?/gs;
    transformed = transformed.replace(
      mockStepFactoryPattern,
      'const $1 = createMockStepFactory();',
    );

    // Replace beforeEach mock setup with centralized pattern
    const beforeEachPattern =
      /beforeEach\(\(\)\s*=>\s*{\s*vi\.clearAllMocks\(\);[^}]*mockProvider\s*=\s*{[^}]*};?\s*}\);?/gs;
    transformed = transformed.replace(
      beforeEachPattern,
      `beforeEach(() => {
    vi.clearAllMocks();
    mockProvider = createMockWorkflowProvider();
  });`,
    );

    return transformed;
  }

  /**
   * Transform hardcoded test data to use generators
   */
  private transformTestData(source: string): string {
    let transformed = source;

    // Replace hardcoded workflow objects
    const workflowPattern =
      /const\s+(\w*[wW]orkflow\w*)\s*=\s*{\s*id:\s*['"][^'"]*['"],\s*name:\s*['"][^'"]*['"],\s*version:\s*['"][^'"]*['"],\s*steps:\s*\[[^\]]*\]\s*};?/gs;
    transformed = transformed.replace(workflowPattern, 'const $1 = workflowGenerators.simple();');

    // Replace hardcoded step objects
    const stepPattern =
      /const\s+(\w*[sS]tep\w*)\s*=\s*{\s*id:\s*['"][^'"]*['"],\s*name:\s*['"][^'"]*['"],\s*action:\s*['"][^'"]*['"][^}]*};?/gs;
    transformed = transformed.replace(stepPattern, 'const $1 = stepGenerators.basic();');

    // Replace hardcoded execution objects
    const executionPattern =
      /const\s+(\w*[eE]xecution\w*)\s*=\s*{\s*id:\s*['"][^'"]*['"],\s*workflowId:\s*['"][^'"]*['"],\s*status:\s*['"][^'"]*['"][^}]*};?/gs;
    transformed = transformed.replace(
      executionPattern,
      'const $1 = executionGenerators.running();',
    );

    // Replace inline test data in function calls
    transformed = transformed.replace(
      /{\s*id:\s*['"]test-workflow['"],\s*name:\s*['"]Test Workflow['"],\s*steps:\s*\[[^\]]*\]\s*}/g,
      'workflowGenerators.simple()',
    );

    return transformed;
  }

  /**
   * Transform manual assertions to use centralized utilities
   */
  private transformAssertions(source: string): string {
    let transformed = source;

    // Replace common workflow assertion patterns
    const workflowAssertionPattern =
      /expect\(([^)]+)\)\.toBeDefined\(\);\s*expect\(\1\.id\)\.toBeDefined\(\);\s*expect\(\1\.status\)\.toBeDefined\(\);?/gs;
    transformed = transformed.replace(
      workflowAssertionPattern,
      'AssertionUtils.assertWorkflowExecution($1);',
    );

    // Replace provider assertion patterns
    const providerAssertionPattern =
      /expect\(([^)]+)\)\.toBeDefined\(\);\s*expect\(\1\.healthCheck\)\.toBeDefined\(\);?/gs;
    transformed = transformed.replace(
      providerAssertionPattern,
      'AssertionUtils.assertProvider($1);',
    );

    // Replace step assertion patterns
    const stepAssertionPattern =
      /expect\(([^)]+)\)\.toBeDefined\(\);\s*expect\(\1\.name\)\.toBeDefined\(\);\s*expect\(\1\.action\)\.toBeDefined\(\);?/gs;
    transformed = transformed.replace(stepAssertionPattern, 'AssertionUtils.assertStep($1);');

    // Replace health check assertion patterns
    const healthAssertionPattern =
      /expect\(([^)]+)\)\.toBeDefined\(\);\s*expect\(\1\.status\)\.toBe\(['"]healthy['"]\);?/gs;
    transformed = transformed.replace(healthAssertionPattern, 'assertProviderHealth($1);');

    return transformed;
  }

  /**
   * Transform repetitive tests to use test suites
   */
  private transformTestSuites(source: string): string {
    let transformed = source;

    // Look for patterns that can be replaced with test suites
    if (this.hasRepeatedTestPatterns(source)) {
      // Add test suite generation
      const testSuitePattern = this.generateTestSuiteReplacement(source);
      if (testSuitePattern) {
        transformed = this.insertTestSuite(transformed, testSuitePattern);
      }
    }

    return transformed;
  }

  /**
   * Transform performance testing to use centralized utilities
   */
  private transformPerformance(source: string): string {
    let transformed = source;

    // Replace manual timing patterns
    const timingPattern =
      /const\s+startTime\s*=\s*Date\.now\(\);[\s\S]*?const\s+duration\s*=\s*Date\.now\(\)\s*-\s*startTime;[\s\S]*?expect\(duration\)\.toBeLessThan\((\d+)\);?/gs;
    transformed = transformed.replace(
      timingPattern,
      `const result = await TestUtils.performance.testPerformance(
      async () => {
        // Performance test implementation
      },
      $1 // Max duration
    );`,
    );

    return transformed;
  }

  /**
   * Transform error handling to use centralized utilities
   */
  private transformErrorHandling(source: string): string {
    let transformed = source;

    // Replace try-catch error testing patterns
    const errorTestingPattern =
      /try\s*{[\s\S]*?throw\s+new\s+Error\(['"]Expected[^'"]*['"][\s\S]*?}\s*catch\s*\(\s*error\s*\)\s*{[\s\S]*?expect\(error\.message\)\.toContain\(['"]([^'"]*)['"]\);?\s*}/gs;
    transformed = transformed.replace(
      errorTestingPattern,
      `await TestUtils.errors.expectError(
      async () => {
        // Error-inducing operation
      },
      '$1'
    );`,
    );

    return transformed;
  }

  /**
   * Helper method to add import after existing imports
   */
  private addImportAfterExistingImports(source: string, importStatement: string): string {
    const lines = source.split('\n');
    let lastImportIndex = -1;

    // Find the last import statement
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, importStatement);
    } else {
      // If no imports found, add at the top after any comments
      let insertIndex = 0;
      while (
        insertIndex < lines.length &&
        (lines[insertIndex].trim().startsWith('//') ||
          lines[insertIndex].trim().startsWith('/*') ||
          lines[insertIndex].trim() === '')
      ) {
        insertIndex++;
      }
      lines.splice(insertIndex, 0, importStatement);
    }

    return lines.join('\n');
  }

  /**
   * Check if source has repeated test patterns
   */
  private hasRepeatedTestPatterns(source: string): boolean {
    const testPatterns = [
      'should create',
      'should execute',
      'should handle errors',
      'should validate',
    ];

    return testPatterns.some(pattern => (source.match(new RegExp(pattern, 'g')) || []).length >= 3);
  }

  /**
   * Generate test suite replacement
   */
  private generateTestSuiteReplacement(source: string): string | null {
    // This is a simplified version - in practice, this would be more sophisticated
    if (source.includes('Provider') && source.includes('should execute')) {
      return `  createProviderTestSuite({
    providerName: 'Test Provider',
    providerType: 'upstash-workflow',
    providerFactory: () => createMockWorkflowProvider(),
    scenarios: createProviderScenarios().upstashWorkflow,
  });`;
    }

    return null;
  }

  /**
   * Insert test suite into source
   */
  private insertTestSuite(source: string, testSuite: string): string {
    // Find a good place to insert the test suite
    const describeMatch = source.match(/describe\(['"][^'"]*['"],\s*\(\)\s*=>\s*{/);
    if (describeMatch) {
      const insertPoint = describeMatch.index! + describeMatch[0].length;
      return source.slice(0, insertPoint) + '\n' + testSuite + '\n' + source.slice(insertPoint);
    }

    return source;
  }

  /**
   * Migrate multiple files in a directory
   */
  async migrateDirectory(
    testDir: string,
    options: Partial<MigrationConfig> = {},
  ): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];
    const { readdirSync, statSync } = await import('fs');
    const { join } = await import('path');

    const files = readdirSync(testDir);
    for (const file of files) {
      const fullPath = join(testDir, file);
      const stat = statSync(fullPath);

      if (stat.isFile() && (file.endsWith('.test.ts') || file.endsWith('.test.tsx'))) {
        try {
          const config: MigrationConfig = {
            sourceFile: fullPath,
            ...options,
          };

          const result = await this.migrateFile(config);
          results.push(result);
        } catch (error) {
          console.error(`Failed to migrate ${fullPath}: ${(error as Error).message}`);
        }
      }
    }

    return results;
  }

  /**
   * Generate migration summary report
   */
  generateMigrationReport(results: MigrationResult[]): string {
    const totalFiles = results.length;
    const successfulMigrations = results.filter(r => r.success).length;
    const totalOriginalLines = results.reduce((sum, r) => sum + r.originalLines, 0);
    const totalTransformedLines = results.reduce((sum, r) => sum + r.transformedLines, 0);
    const overallReduction = Math.round(
      ((totalOriginalLines - totalTransformedLines) / totalOriginalLines) * 100,
    );

    const transformationCounts = results.reduce(
      (acc, r) => {
        r.transformationsApplied.forEach(t => {
          acc[t] = (acc[t] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    return `
# Migration Report

## Summary
- **Total Files**: ${totalFiles}
- **Successful Migrations**: ${successfulMigrations}
- **Original Lines**: ${totalOriginalLines}
- **Transformed Lines**: ${totalTransformedLines}
- **Overall Reduction**: ${overallReduction}%

## Transformations Applied
${Object.entries(transformationCounts)
  .map(([name, count]) => `- **${name}**: ${count} files`)
  .join('\n')}

## Issues
${results
  .flatMap(r => r.issues)
  .map(issue => `- ${issue}`)
  .join('\n')}

Generated on: ${new Date().toISOString()}
`;
  }
}

/**
 * CLI utility for migrating test files
 */
export async function migrateTestFiles(args: string[]): Promise<void> {
  const [sourceFile, transformations, dryRun] = args;

  if (!sourceFile) {
    console.error('Usage: node migration-tool.js <sourceFile> [transformations] [dryRun]');
    console.error(
      'Transformations: comma-separated list of imports,mocks,testData,assertions,testSuites,performance,errorHandling',
    );
    process.exit(1);
  }

  const migrationTool = new TestMigrationTool();
  const config: MigrationConfig = {
    sourceFile,
    dryRun: dryRun === 'true',
    verbose: true,
    transformations: transformations
      ? (transformations.split(',') as TransformationType[])
      : undefined,
  };

  try {
    console.log('🚀 Starting migration...');
    const result = await migrationTool.migrateFile(config);

    console.log('\n📊 Migration Results:');
    console.log(`Success: ${result.success}`);
    console.log(`Original Lines: ${result.originalLines}`);
    console.log(`Transformed Lines: ${result.transformedLines}`);
    console.log(`Reduction: ${result.reductionPercentage}%`);
    console.log(`Transformations Applied: ${result.transformationsApplied.join(', ')}`);

    if (result.issues.length > 0) {
      console.log('\n❌ Issues:');
      result.issues.forEach(issue => console.log(`- ${issue}`));
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`- ${warning}`));
    }

    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error(`❌ Migration failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Export the migration tool instance
export const migrationTool = new TestMigrationTool();

// CLI support if running directly
if (require.main === module) {
  migrateTestFiles(process.argv.slice(2));
}
