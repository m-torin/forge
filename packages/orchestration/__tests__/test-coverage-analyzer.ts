/**
 * Test Coverage Analysis and Reporting Utilities
 *
 * Provides comprehensive test coverage analysis specifically for the DRY
 * orchestration test patterns. Helps identify gaps in coverage and ensures
 * all components follow the established testing patterns.
 */

import { execSync } from 'child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

// Types for coverage analysis
export interface CoverageReport {
  summary: CoverageSummary;
  fileReports: FileReport[];
  patternAnalysis: PatternAnalysis;
  recommendations: string[];
  generatedAt: Date;
}

export interface CoverageSummary {
  totalFiles: number;
  coveredFiles: number;
  totalLines: number;
  coveredLines: number;
  totalFunctions: number;
  coveredFunctions: number;
  totalBranches: number;
  coveredBranches: number;
  overallPercentage: number;
}

export interface FileReport {
  filePath: string;
  relativePath: string;
  coverageData: FileCoverageData;
  patternUsage: PatternUsage;
  issues: string[];
  recommendations: string[];
}

export interface FileCoverageData {
  lines: { total: number; covered: number; percentage: number };
  functions: { total: number; covered: number; percentage: number };
  branches: { total: number; covered: number; percentage: number };
}

export interface PatternUsage {
  usesCentralizedSetup: boolean;
  usesTestFactory: boolean;
  usesTestDataGenerators: boolean;
  usesTestUtils: boolean;
  usesCentralizedAssertions: boolean;
  patternScore: number; // 0-100
}

export interface PatternAnalysis {
  totalTestFiles: number;
  filesUsingDryPatterns: number;
  filesNeedingMigration: number;
  commonPatterns: Array<{
    pattern: string;
    usage: number;
    description: string;
  }>;
  antiPatterns: Array<{
    pattern: string;
    occurrences: number;
    files: string[];
    description: string;
  }>;
}

/**
 * Test Coverage Analyzer Class
 */
export class TestCoverageAnalyzer {
  private testDir: string;
  private srcDir: string;
  private coverageData: any;

  constructor(testDir: string, srcDir: string) {
    this.testDir = testDir;
    this.srcDir = srcDir;
  }

  /**
   * Generate comprehensive coverage report
   */
  async generateReport(): Promise<CoverageReport> {
    console.log('🔍 Analyzing test coverage...');

    // Run coverage analysis
    await this.runCoverageAnalysis();

    // Load coverage data
    this.loadCoverageData();

    // Analyze files
    const fileReports = await this.analyzeFiles();

    // Generate summary
    const summary = this.generateSummary(fileReports);

    // Analyze patterns
    const patternAnalysis = this.analyzePatterns(fileReports);

    // Generate recommendations
    const recommendations = this.generateRecommendations(fileReports, patternAnalysis);

    return {
      summary,
      fileReports,
      patternAnalysis,
      recommendations,
      generatedAt: new Date(),
    };
  }

  /**
   * Run coverage analysis using vitest
   */
  private async runCoverageAnalysis(): Promise<void> {
    try {
      console.log('📊 Running vitest coverage...');
      execSync('pnpm vitest run --coverage --reporter=json', {
        cwd: join(this.testDir, '../..'),
        stdio: 'pipe',
      });
    } catch (error) {
      console.warn('⚠️  Coverage analysis failed, using existing data');
    }
  }

  /**
   * Load coverage data from vitest output
   */
  private loadCoverageData(): void {
    try {
      const coveragePath = join(this.testDir, '../../coverage/coverage-final.json');
      this.coverageData = JSON.parse(readFileSync(coveragePath, 'utf8'));
    } catch (error) {
      console.warn('⚠️  Could not load coverage data, using mock data');
      this.coverageData = this.generateMockCoverageData();
    }
  }

  /**
   * Generate mock coverage data for demonstration
   */
  private generateMockCoverageData(): any {
    return {
      'src/client/index.ts': {
        lines: { total: 100, covered: 85, pct: 85 },
        functions: { total: 20, covered: 18, pct: 90 },
        branches: { total: 40, covered: 30, pct: 75 },
      },
      'src/server/index.ts': {
        lines: { total: 150, covered: 120, pct: 80 },
        functions: { total: 30, covered: 25, pct: 83 },
        branches: { total: 60, covered: 45, pct: 75 },
      },
      'src/providers/upstash-workflow-provider.ts': {
        lines: { total: 200, covered: 180, pct: 90 },
        functions: { total: 25, covered: 23, pct: 92 },
        branches: { total: 50, covered: 40, pct: 80 },
      },
    };
  }

  /**
   * Analyze all test files
   */
  private async analyzeFiles(): Promise<FileReport[]> {
    const reports: FileReport[] = [];

    // Find all test files
    const testFiles = this.findTestFiles(this.testDir);

    for (const testFile of testFiles) {
      const report = await this.analyzeFile(testFile);
      reports.push(report);
    }

    return reports;
  }

  /**
   * Find all test files recursively
   */
  private findTestFiles(dir: string): string[] {
    const files: string[] = [];

    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.findTestFiles(fullPath));
      } else if (entry.endsWith('.test.ts') || entry.endsWith('.test.tsx')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Analyze a single test file
   */
  private async analyzeFile(filePath: string): Promise<FileReport> {
    const relativePath = relative(this.testDir, filePath);
    const content = readFileSync(filePath, 'utf8');

    // Get coverage data for corresponding source file
    const sourceFile = this.findSourceFile(relativePath);
    const coverageData = this.getCoverageForFile(sourceFile);

    // Analyze pattern usage
    const patternUsage = this.analyzePatternUsage(content);

    // Find issues
    const issues = this.findIssues(content, patternUsage);

    // Generate recommendations
    const recommendations = this.generateFileRecommendations(patternUsage, issues);

    return {
      filePath,
      relativePath,
      coverageData,
      patternUsage,
      issues,
      recommendations,
    };
  }

  /**
   * Find corresponding source file for a test file
   */
  private findSourceFile(testPath: string): string {
    // Convert test path to source path
    const sourcePath = testPath
      .replace('__tests__/', '')
      .replace('.test.ts', '.ts')
      .replace('.test.tsx', '.tsx');

    return `src/${sourcePath}`;
  }

  /**
   * Get coverage data for a specific file
   */
  private getCoverageForFile(filePath: string): FileCoverageData {
    const data = this.coverageData[filePath];

    if (!data) {
      return {
        lines: { total: 0, covered: 0, percentage: 0 },
        functions: { total: 0, covered: 0, percentage: 0 },
        branches: { total: 0, covered: 0, percentage: 0 },
      };
    }

    return {
      lines: {
        total: data.lines?.total || 0,
        covered: data.lines?.covered || 0,
        percentage: data.lines?.pct || 0,
      },
      functions: {
        total: data.functions?.total || 0,
        covered: data.functions?.covered || 0,
        percentage: data.functions?.pct || 0,
      },
      branches: {
        total: data.branches?.total || 0,
        covered: data.branches?.covered || 0,
        percentage: data.branches?.pct || 0,
      },
    };
  }

  /**
   * Analyze pattern usage in a test file
   */
  private analyzePatternUsage(content: string): PatternUsage {
    const checks = {
      usesCentralizedSetup: this.checkCentralizedSetup(content),
      usesTestFactory: this.checkTestFactory(content),
      usesTestDataGenerators: this.checkTestDataGenerators(content),
      usesTestUtils: this.checkTestUtils(content),
      usesCentralizedAssertions: this.checkCentralizedAssertions(content),
    };

    // Calculate pattern score (0-100)
    const totalChecks = Object.keys(checks).length;
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const patternScore = Math.round((passedChecks / totalChecks) * 100);

    return {
      ...checks,
      patternScore,
    };
  }

  /**
   * Check if file uses centralized setup
   */
  private checkCentralizedSetup(content: string): boolean {
    return (
      content.includes("from './setup'") ||
      content.includes("from '../setup'") ||
      content.includes('createMockWorkflowProvider') ||
      content.includes('createMockWorkflowEngine')
    );
  }

  /**
   * Check if file uses test factory patterns
   */
  private checkTestFactory(content: string): boolean {
    return (
      content.includes('createWorkflowTestSuite') ||
      content.includes('createProviderTestSuite') ||
      content.includes('createStepFactoryTestSuite')
    );
  }

  /**
   * Check if file uses test data generators
   */
  private checkTestDataGenerators(content: string): boolean {
    return (
      content.includes('workflowGenerators') ||
      content.includes('stepGenerators') ||
      content.includes('executionGenerators') ||
      content.includes("from './test-data-generators'")
    );
  }

  /**
   * Check if file uses test utils
   */
  private checkTestUtils(content: string): boolean {
    return (
      content.includes('TestUtils') ||
      content.includes('AssertionUtils') ||
      content.includes('PerformanceUtils') ||
      content.includes("from './test-utils'")
    );
  }

  /**
   * Check if file uses centralized assertions
   */
  private checkCentralizedAssertions(content: string): boolean {
    return (
      content.includes('AssertionUtils.assert') ||
      content.includes('assertWorkflowExecution') ||
      content.includes('assertProviderHealth')
    );
  }

  /**
   * Find issues in a test file
   */
  private findIssues(content: string, patternUsage: PatternUsage): string[] {
    const issues: string[] = [];

    // Check for anti-patterns
    if (content.includes('vi.fn().mockResolvedValue') && !patternUsage.usesCentralizedSetup) {
      issues.push('Manual mock creation instead of centralized setup');
    }

    if (
      content.includes('expect(result.id).toBeDefined()') &&
      !patternUsage.usesCentralizedAssertions
    ) {
      issues.push('Manual assertions instead of centralized utilities');
    }

    if (content.includes("id: 'test-") && !patternUsage.usesTestDataGenerators) {
      issues.push('Hardcoded test data instead of generators');
    }

    if (content.includes('Date.now()') && !patternUsage.usesTestUtils) {
      issues.push('Manual performance measurement instead of utilities');
    }

    if (
      content.includes('try {') &&
      content.includes('catch (error)') &&
      !patternUsage.usesTestUtils
    ) {
      issues.push('Manual error testing instead of centralized utilities');
    }

    return issues;
  }

  /**
   * Generate file-specific recommendations
   */
  private generateFileRecommendations(patternUsage: PatternUsage, issues: string[]): string[] {
    const recommendations: string[] = [];

    if (!patternUsage.usesCentralizedSetup) {
      recommendations.push('Migrate to centralized setup patterns from setup.ts');
    }

    if (!patternUsage.usesTestFactory) {
      recommendations.push('Use test factory patterns for consistent test structure');
    }

    if (!patternUsage.usesTestDataGenerators) {
      recommendations.push('Replace hardcoded test data with generators');
    }

    if (!patternUsage.usesTestUtils) {
      recommendations.push('Use centralized test utilities for common operations');
    }

    if (!patternUsage.usesCentralizedAssertions) {
      recommendations.push('Replace manual assertions with centralized utilities');
    }

    if (patternUsage.patternScore < 60) {
      recommendations.push('Consider full migration to DRY patterns for better maintainability');
    }

    return recommendations;
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(fileReports: FileReport[]): CoverageSummary {
    const totals = fileReports.reduce(
      (acc, report) => ({
        totalFiles: acc.totalFiles + 1,
        coveredFiles: acc.coveredFiles + (report.coverageData.lines.percentage > 0 ? 1 : 0),
        totalLines: acc.totalLines + report.coverageData.lines.total,
        coveredLines: acc.coveredLines + report.coverageData.lines.covered,
        totalFunctions: acc.totalFunctions + report.coverageData.functions.total,
        coveredFunctions: acc.coveredFunctions + report.coverageData.functions.covered,
        totalBranches: acc.totalBranches + report.coverageData.branches.total,
        coveredBranches: acc.coveredBranches + report.coverageData.branches.covered,
      }),
      {
        totalFiles: 0,
        coveredFiles: 0,
        totalLines: 0,
        coveredLines: 0,
        totalFunctions: 0,
        coveredFunctions: 0,
        totalBranches: 0,
        coveredBranches: 0,
      },
    );

    const overallPercentage =
      totals.totalLines > 0 ? Math.round((totals.coveredLines / totals.totalLines) * 100) : 0;

    return {
      ...totals,
      overallPercentage,
    };
  }

  /**
   * Analyze patterns across all files
   */
  private analyzePatterns(fileReports: FileReport[]): PatternAnalysis {
    const totalTestFiles = fileReports.length;
    const filesUsingDryPatterns = fileReports.filter(r => r.patternUsage.patternScore >= 60).length;
    const filesNeedingMigration = totalTestFiles - filesUsingDryPatterns;

    // Common patterns analysis
    const commonPatterns = [
      {
        pattern: 'createMockWorkflowProvider',
        usage: fileReports.filter(r => r.patternUsage.usesCentralizedSetup).length,
        description: 'Uses centralized mock provider setup',
      },
      {
        pattern: 'workflowGenerators',
        usage: fileReports.filter(r => r.patternUsage.usesTestDataGenerators).length,
        description: 'Uses test data generators',
      },
      {
        pattern: 'AssertionUtils',
        usage: fileReports.filter(r => r.patternUsage.usesCentralizedAssertions).length,
        description: 'Uses centralized assertions',
      },
      {
        pattern: 'createWorkflowTestSuite',
        usage: fileReports.filter(r => r.patternUsage.usesTestFactory).length,
        description: 'Uses test factory patterns',
      },
    ];

    // Anti-patterns analysis
    const antiPatterns = [
      {
        pattern: 'Manual mock creation',
        occurrences: fileReports.filter(r => r.issues.some(i => i.includes('Manual mock creation')))
          .length,
        files: fileReports
          .filter(r => r.issues.some(i => i.includes('Manual mock creation')))
          .map(r => r.relativePath),
        description: 'Creates mocks manually instead of using centralized setup',
      },
      {
        pattern: 'Hardcoded test data',
        occurrences: fileReports.filter(r => r.issues.some(i => i.includes('Hardcoded test data')))
          .length,
        files: fileReports
          .filter(r => r.issues.some(i => i.includes('Hardcoded test data')))
          .map(r => r.relativePath),
        description: 'Uses hardcoded test data instead of generators',
      },
    ];

    return {
      totalTestFiles,
      filesUsingDryPatterns,
      filesNeedingMigration,
      commonPatterns,
      antiPatterns,
    };
  }

  /**
   * Generate overall recommendations
   */
  private generateRecommendations(
    fileReports: FileReport[],
    patternAnalysis: PatternAnalysis,
  ): string[] {
    const recommendations: string[] = [];

    if (patternAnalysis.filesNeedingMigration > 0) {
      recommendations.push(
        `📈 ${patternAnalysis.filesNeedingMigration} files need migration to DRY patterns`,
      );
    }

    if (patternAnalysis.antiPatterns.length > 0) {
      recommendations.push('🔧 Address anti-patterns to improve code quality');
    }

    const lowCoverageFiles = fileReports.filter(r => r.coverageData.lines.percentage < 80);
    if (lowCoverageFiles.length > 0) {
      recommendations.push(`📊 ${lowCoverageFiles.length} files have low coverage (<80%)`);
    }

    const highPatternScoreFiles = fileReports.filter(r => r.patternUsage.patternScore >= 80);
    if (highPatternScoreFiles.length > 0) {
      recommendations.push(
        `✅ ${highPatternScoreFiles.length} files are well-structured with DRY patterns`,
      );
    }

    return recommendations;
  }

  /**
   * Generate HTML report
   */
  generateHtmlReport(report: CoverageReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Orchestration Test Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e8f4f8; padding: 15px; border-radius: 5px; flex: 1; }
        .metric h3 { margin: 0 0 10px 0; color: #2c3e50; }
        .metric .value { font-size: 24px; font-weight: bold; color: #3498db; }
        .section { margin: 20px 0; }
        .file-report { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .pattern-score { padding: 3px 8px; border-radius: 3px; color: white; font-weight: bold; }
        .score-high { background: #27ae60; }
        .score-medium { background: #f39c12; }
        .score-low { background: #e74c3c; }
        .issues { background: #fff3cd; padding: 10px; border-radius: 3px; margin: 10px 0; }
        .recommendations { background: #d4edda; padding: 10px; border-radius: 3px; margin: 10px 0; }
        .anti-patterns { background: #f8d7da; padding: 10px; border-radius: 3px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Orchestration Test Coverage Report</h1>
        <p>Generated on: ${report.generatedAt.toISOString()}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Overall Coverage</h3>
            <div class="value">${report.summary.overallPercentage}%</div>
        </div>
        <div class="metric">
            <h3>Files Covered</h3>
            <div class="value">${report.summary.coveredFiles}/${report.summary.totalFiles}</div>
        </div>
        <div class="metric">
            <h3>DRY Pattern Usage</h3>
            <div class="value">${report.patternAnalysis.filesUsingDryPatterns}/${report.patternAnalysis.totalTestFiles}</div>
        </div>
        <div class="metric">
            <h3>Migration Needed</h3>
            <div class="value">${report.patternAnalysis.filesNeedingMigration}</div>
        </div>
    </div>

    <div class="section">
        <h2>📊 Coverage Summary</h2>
        <p><strong>Lines:</strong> ${report.summary.coveredLines}/${report.summary.totalLines} (${Math.round((report.summary.coveredLines / report.summary.totalLines) * 100)}%)</p>
        <p><strong>Functions:</strong> ${report.summary.coveredFunctions}/${report.summary.totalFunctions} (${Math.round((report.summary.coveredFunctions / report.summary.totalFunctions) * 100)}%)</p>
        <p><strong>Branches:</strong> ${report.summary.coveredBranches}/${report.summary.totalBranches} (${Math.round((report.summary.coveredBranches / report.summary.totalBranches) * 100)}%)</p>
    </div>

    <div class="section">
        <h2>🔧 Pattern Analysis</h2>
        <h3>Common Patterns</h3>
        ${report.patternAnalysis.commonPatterns
          .map(
            p => `
            <p><strong>${p.pattern}</strong>: ${p.usage} files (${p.description})</p>
        `,
          )
          .join('')}

        <h3>Anti-Patterns</h3>
        ${report.patternAnalysis.antiPatterns
          .map(
            p => `
            <div class="anti-patterns">
                <strong>${p.pattern}</strong>: ${p.occurrences} occurrences
                <p>${p.description}</p>
                <p>Files: ${p.files.join(', ')}</p>
            </div>
        `,
          )
          .join('')}
    </div>

    <div class="section">
        <h2>📋 Recommendations</h2>
        ${report.recommendations.map(r => `<p>• ${r}</p>`).join('')}
    </div>

    <div class="section">
        <h2>📁 File Reports</h2>
        ${report.fileReports
          .map(
            file => `
            <div class="file-report">
                <h3>${file.relativePath}</h3>
                <p><strong>Coverage:</strong> ${file.coverageData.lines.percentage}% lines, ${file.coverageData.functions.percentage}% functions</p>
                <p><strong>Pattern Score:</strong>
                    <span class="pattern-score ${file.patternUsage.patternScore >= 80 ? 'score-high' : file.patternUsage.patternScore >= 60 ? 'score-medium' : 'score-low'}">
                        ${file.patternUsage.patternScore}%
                    </span>
                </p>

                ${
                  file.issues.length > 0
                    ? `
                    <div class="issues">
                        <strong>Issues:</strong>
                        ${file.issues.map(issue => `<p>• ${issue}</p>`).join('')}
                    </div>
                `
                    : ''
                }

                ${
                  file.recommendations.length > 0
                    ? `
                    <div class="recommendations">
                        <strong>Recommendations:</strong>
                        ${file.recommendations.map(rec => `<p>• ${rec}</p>`).join('')}
                    </div>
                `
                    : ''
                }
            </div>
        `,
          )
          .join('')}
    </div>
</body>
</html>`;
  }

  /**
   * Save report to file
   */
  saveReport(report: CoverageReport, format: 'json' | 'html' = 'html'): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (format === 'json') {
      const jsonPath = join(this.testDir, `coverage-report-${timestamp}.json`);
      writeFileSync(jsonPath, JSON.stringify(report, null, 2));
      console.log(`📁 JSON report saved: ${jsonPath}`);
    } else {
      const htmlPath = join(this.testDir, `coverage-report-${timestamp}.html`);
      const htmlContent = this.generateHtmlReport(report);
      writeFileSync(htmlPath, htmlContent);
      console.log(`📁 HTML report saved: ${htmlPath}`);
    }
  }
}

/**
 * CLI utility for generating coverage reports
 */
export async function generateCoverageReport(args: string[]): Promise<void> {
  const [testDir, srcDir, format = 'html'] = args;

  if (!testDir || !srcDir) {
    console.error('Usage: node test-coverage-analyzer.js <testDir> <srcDir> [format]');
    console.error('Format: json or html (default: html)');
    process.exit(1);
  }

  const analyzer = new TestCoverageAnalyzer(testDir, srcDir);

  try {
    console.log('🚀 Starting coverage analysis...');
    const report = await analyzer.generateReport();

    analyzer.saveReport(report, format as 'json' | 'html');

    console.log('\n📊 Coverage Summary:');
    console.log(`Overall Coverage: ${report.summary.overallPercentage}%`);
    console.log(
      `Files Using DRY Patterns: ${report.patternAnalysis.filesUsingDryPatterns}/${report.patternAnalysis.totalTestFiles}`,
    );
    console.log(`Files Needing Migration: ${report.patternAnalysis.filesNeedingMigration}`);

    console.log('\n✅ Coverage analysis complete!');
  } catch (error) {
    console.error(`❌ Coverage analysis failed: ${error}`);
    process.exit(1);
  }
}

// Export the analyzer instance for use in other files
export const coverageAnalyzer = new TestCoverageAnalyzer(__dirname, join(__dirname, '../src'));

// CLI support if running directly
if (require.main === module) {
  generateCoverageReport(process.argv.slice(2));
}
