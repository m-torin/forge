import { promises as fs } from 'fs';
import path from 'path';
import type { OpenGrepClient, Rule, ScanResponse, SearchQuery, SearchResponse } from './types.js';
import { createOpenGrepLocalClient } from './server.js';
import { getOpenGrepConfig, defaultRuleSets, repoScanConfig, type RuleSet } from './config.js';

export interface RepoScanOptions {
  rootPath?: string;
  ruleSets?: RuleSet[];
  customRules?: Rule[];
  outputFile?: string;
  verbose?: boolean,
}

export interface RepoScanResult {
  summary: {
    filesScanned: number,
    totalIssues: number,
    errorCount: number,
    warningCount: number,
    infoCount: number,
    scanTime: number,
  };
  results: ScanResponse[],
  searchResults?: SearchResponse[],
}

export class RepoScanner {
  private client: OpenGrepClient;
  private config: ReturnType<typeof getOpenGrepConfig>;

  constructor() {
    this.config = getOpenGrepConfig();
    this.client = createOpenGrepLocalClient(
      {
        timeout: repoScanConfig.timeout,
      },
      this.config.SEMGREP_PATH,
    );
  }

  async scanRepository(options: RepoScanOptions = {}): Promise<RepoScanResult> {
    const {
      rootPath = process.cwd(),
      ruleSets = ['security', 'javascript', 'typescript'],
      customRules = [],
      outputFile,
      verbose = false,
    } = options;

    if (verbose) {
      console.log(`🔍 Starting repository scan at: ${rootPath}`);
      console.log(`📋 Rule sets: ${ruleSets.join(', ')}`);
    }

    const startTime = Date.now();
    const scanResults: ScanResponse[] = [];

    // Get paths to scan
    const pathsToScan = await this.getPathsToScan(rootPath);

    if (verbose) {
      console.log(`📁 Found ${pathsToScan.length} directories to scan`);
    }

    // Run scans for each rule set
    for (const ruleSet of ruleSets) {
      if (verbose) {
        console.log(`🚀 Running ${ruleSet} scan...`);
      }

      try {
        const rules = await this.getRulesForSet(ruleSet);
        const result = await this.client.scan([...rules, ...customRules], pathsToScan);
        scanResults.push(result);

        if (verbose) {
          console.log(`✅ ${ruleSet}: ${result.results.length} issues found`);
        }
      } catch (error) {
        console.error(`❌ Error scanning with ${ruleSet}: `, error),
      }
    }

    const scanTime = Date.now() - startTime;
    const summary = this.generateSummary(scanResults, scanTime);

    const result: RepoScanResult = {
      summary,
      results: scanResults,
    };

    if (outputFile) {
      await this.saveResults(result, outputFile);
      if (verbose) {
        console.log(`💾 Results saved to: ${outputFile}`);
      }
    }

    if (verbose) {
      this.printSummary(summary);
    }

    return result;
  }

  async searchInRepository(
    patterns: string[],
    options: Partial<SearchQuery> & { rootPath?: string; verbose?: boolean } = {},
  ): Promise<SearchResponse[]> {
    const { rootPath = process.cwd(), verbose = false, ...searchOptions } = options;

    if (verbose) {
      console.log(`🔍 Searching for patterns: ${patterns.join(', ')}`);
    }

    const results: SearchResponse[] = [];
    const pathsToScan = await this.getPathsToScan(rootPath);

    for (const pattern of patterns) {
      try {
        const query: SearchQuery = {
          pattern,
          paths: pathsToScan,
          excludePaths: [...repoScanConfig.excludePaths],
          maxResults: 100,
          ...searchOptions,
        };

        const result = await this.client.search(query);
        results.push(result);

        if (verbose) {
          console.log(`🎯 Pattern "${pattern}": ${result.results.length} matches found`);
        }
      } catch (error) {
        console.error(`❌ Error searching pattern "${pattern}": `, error),
      }
    }

    return results;
  }

  private async getPathsToScan(rootPath: string): Promise<string[]> {
    const paths: string[] = [];

    for (const includePath of repoScanConfig.includePaths) {
      const fullPath = path.join(rootPath, includePath.replace('/**', ''));

      try {
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
          paths.push(fullPath);
        }
      } catch {
        // Path doesn't exist, skip
      }
    }

    // If no specific paths found, scan the root
    if (paths.length === 0) {
      paths.push(rootPath);
    }

    return paths;
  }

  private async getRulesForSet(ruleSet: RuleSet): Promise<Rule[]> {
    // Check for custom rule files first
    const ruleFilePath = path.join(__dirname, 'rules', `${ruleSet}-advanced.yml`);
    try {
      await fs.access(ruleFilePath);
      // If custom rule file exists, use semgrep registry rules + custom rules
      return this.getBuiltInRules(ruleSet);
    } catch {
      // Fall back to built-in rules
      return this.getBuiltInRules(ruleSet);
    }
  }

  private getBuiltInRules(ruleSet: RuleSet): Rule[] {
    const commonRules: Record<RuleSet, Rule[]> = {
      security: [
        {
          id: 'hardcoded-api-key',
          message: 'Hardcoded API key detected',
          pattern: 'const $VAR = "sk_..." || const $VAR = "pk_..."',
          language: 'javascript',
          severity: 'error',
        },
        {
          id: 'eval-usage',
          message: 'Dangerous eval() usage',
          pattern: 'eval(...)',
          language: 'javascript',
          severity: 'error',
        },
      ],
      javascript: [
        {
          id: 'console-log',
          message: 'Console.log statement found in production code',
          pattern: 'console.log(...)',
          language: 'javascript',
          severity: 'warning',
        },
        {
          id: 'var-usage',
          message: 'Use const/let instead of var',
          pattern: 'var $VAR = ...',
          language: 'javascript',
          severity: 'info',
        },
      ],
      typescript: [
        {
          id: 'any-type',
          message: 'Avoid using any type',
          pattern: ': any',
          language: 'typescript',
          severity: 'warning',
        },
        {
          id: 'non-null-assertion',
          message: 'Non-null assertion operator should be used carefully',
          pattern: '$VAR!',
          language: 'typescript',
          severity: 'info',
        },
      ],
      python: [
        {
          id: 'print-statement',
          message: 'Print statement found',
          pattern: 'print(...)',
          language: 'python',
          severity: 'info',
        },
      ],
      general: [
        {
          id: 'todo-comment',
          message: 'TODO comment found',
          pattern: '// TODO: ...',
          language: 'generic',
          severity: 'info',
        },
      ],
    };

    return commonRules[ruleSet] || [];
  }

  private generateSummary(results: ScanResponse[], scanTime: number) {
    const allResults = results.flatMap((r) => r.results);

    return {
      filesScanned: Math.max(...results.map((r) => r.stats.filesScanned), 0),
      totalIssues: allResults.length,
      errorCount: allResults.filter((r) => r.severity === 'error').length,
      warningCount: allResults.filter((r) => r.severity === 'warning').length,
      infoCount: allResults.filter((r) => r.severity === 'info').length,
      scanTime,
    });
  }

  private async saveResults(result: RepoScanResult, outputFile: string): Promise<void> {
    const output = {
      timestamp: new Date().toISOString(),
      ...result,
    });

    await fs.writeFile(outputFile, JSON.stringify(output, null, 2));
  }

  private printSummary(
    summary: typeof this.generateSummary extends (...args: any[]) => infer R ? R : never,
  ): void {
    console.log('\n📊 Scan Summary:');
    console.log(`   Files scanned: ${summary.filesScanned}`);
    console.log(`   Total issues: ${summary.totalIssues}`);
    console.log(`   ❌ Errors: ${summary.errorCount}`);
    console.log(`   ⚠️  Warnings: ${summary.warningCount}`);
    console.log(`   ℹ️  Info: ${summary.infoCount}`);
    console.log(`   ⏱️  Scan time: ${(summary.scanTime / 1000).toFixed(2)}s`);
  }
}

export function createRepoScanner(): RepoScanner {
  return new RepoScanner();
}
