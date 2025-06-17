import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import type {
  OpenGrepClient,
  OpenGrepConfig,
  SearchQuery,
  SearchResponse,
  Rule,
  ScanResponse,
  ScanResult,
} from './types.js';
import { SearchQuerySchema, SearchResponseSchema, ScanResponseSchema } from './types.js';

export class OpenGrepLocalClient implements OpenGrepClient {
  private config: OpenGrepConfig;
  private semgrepPath: string;

  constructor(config: Partial<OpenGrepConfig> = {}, semgrepPath = 'semgrep') {
    this.config = {
      baseUrl: 'https://semgrep.dev/api',
      timeout: 30000,
      maxRetries: 3,
      ...config,
    });
    this.semgrepPath = semgrepPath;
  }

  private async execSemgrep(args: string[], cwd?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.semgrepPath, args, {
        cwd: cwd || process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Semgrep timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      child.on('close', (code) => {
        clearTimeout(timeout);

        if (code === 0) {
          resolve(stdout);
        } else if (code === 2 && stdout) {
          // Semgrep returns code 2 for warnings but may still have valid output
          resolve(stdout);
        } else {
          reject(new Error(`Semgrep exited with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  async search(query: SearchQuery): Promise<SearchResponse> {
    const validatedQuery = SearchQuerySchema.parse(query);
    const startTime = Date.now();

    const args = ['--json', '--no-git-ignore', '--pattern', validatedQuery.pattern];

    if (validatedQuery.language) {
      args.push('--lang', validatedQuery.language);
    } else {
      // Use generic language for text patterns
      args.push('--lang', 'generic');
    }

    if (validatedQuery.caseSensitive) {
      args.push('--case-sensitive');
    }

    if (validatedQuery.paths && validatedQuery.paths.length > 0) {
      args.push(...validatedQuery.paths);
    } else {
      args.push('.');
    }

    if (validatedQuery.excludePaths && validatedQuery.excludePaths.length > 0) {
      for (const excludePath of validatedQuery.excludePaths) {
        args.push('--exclude', excludePath);
      }
    }

    try {
      const output = await this.execSemgrep(args);
      const rawResults = JSON.parse(output);

      const results = rawResults.results?.slice(0, validatedQuery.maxResults) || [];
      const searchTime = Date.now() - startTime;

      const response: SearchResponse = {
        results: results.map((result: any) => ({
          file: result.path || result.file,
          line: result.start?.line || result.line || 1,
          column: result.start?.col || result.column || 1,
          match: result.extra?.lines || result.match || '',
          context: result.extra?.context_lines
            ? {
                before: result.extra.context_lines.before || [],
                after: result.extra.context_lines.after || [],
              }
            : undefined,
          metadata: result.extra || {},
        })),
        totalCount: rawResults.results?.length || 0,
        hasMore: (rawResults.results?.length || 0) > validatedQuery.maxResults,
        searchTime,
        query: validatedQuery,
      };

      return SearchResponseSchema.parse(response);
    } catch (error) {
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async scan(rules: Rule[], paths: string[]): Promise<ScanResponse> {
    const startTime = Date.now();

    // Create temporary rules file
    const tempRulesFile = path.join(process.cwd(), '.semgrep-rules.yml');
    const rulesContent = this.generateRulesYaml(rules);

    try {
      await fs.writeFile(tempRulesFile, rulesContent);

      const args = ['--json', '--config', tempRulesFile, '--no-git-ignore', ...paths];

      const output = await this.execSemgrep(args);
      const rawResults = JSON.parse(output);

      const scanTime = Date.now() - startTime;

      const response: ScanResponse = {
        results: (rawResults.results || []).map((result: any) => ({
          file: result.path,
          line: result.start?.line || 1,
          column: result.start?.col || 1,
          ruleId: result.check_id,
          message: result.extra?.message || result.message || '',
          severity: this.mapSeverity(result.extra?.severity || 'info'),
          fix: result.extra?.fix,
          metadata: result.extra || {},
        })),
        errors: rawResults.errors || [],
        warnings: rawResults.warnings || [],
        stats: {
          filesScanned: rawResults.paths?.scanned?.length || 0,
          rulesRun: rules.length,
          scanTime,
        },
      };

      return ScanResponseSchema.parse(response);
    } finally {
      // Clean up temporary rules file
      try {
        await fs.unlink(tempRulesFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  async getRules(filters?: { language?: string; severity?: string }): Promise<Rule[]> {
    // This would typically fetch from Semgrep registry
    // For now, return common security rules
    const commonRules: Rule[] = [
      {
        id: 'hardcoded-secrets',
        message: 'Hardcoded secret detected',
        pattern: 'password = "..."',
        language: 'generic',
        severity: 'error',
      },
      {
        id: 'sql-injection',
        message: 'Potential SQL injection',
        pattern: 'query = f"SELECT * FROM ... WHERE id = {$VAR}"',
        language: 'python',
        severity: 'error',
      },
      {
        id: 'console-log',
        message: 'Console.log statement found',
        pattern: 'console.log(...)',
        language: 'javascript',
        severity: 'warning',
      },
    ];

    let filteredRules = commonRules;

    if (filters?.language) {
      filteredRules = filteredRules.filter(
        (rule) => rule.language === filters.language || rule.language === 'generic',
      );
    }

    if (filters?.severity) {
      filteredRules = filteredRules.filter((rule) => rule.severity === filters.severity);
    }

    return filteredRules;
  }

  async validateRule(rule: Rule): Promise<boolean> {
    try {
      const tempRulesFile = path.join(process.cwd(), '.semgrep-validate.yml');
      const rulesContent = this.generateRulesYaml([rule]);

      await fs.writeFile(tempRulesFile, rulesContent);

      const args = ['--validate', '--config', tempRulesFile];
      await this.execSemgrep(args);

      await fs.unlink(tempRulesFile);
      return true;
    } catch {
      return false;
    }
  }

  private generateRulesYaml(rules: Rule[]): string {
    const yamlRules = rules
      .map(
        (rule) => `
  - id: ${rule.id}
    message: ${rule.message}
    languages: [${rule.language}]
    severity: ${rule.severity.toUpperCase()}
    pattern: ${rule.pattern}
    ${rule.metadata ? `metadata: ${JSON.stringify(rule.metadata)}` : ''}
`,
      )
      .join('');

    return `rules:${yamlRules}`;
  }

  private mapSeverity(severity: string): 'error' | 'warning' | 'info' {
    const lowerSeverity = severity.toLowerCase();
    if (lowerSeverity === 'error' || lowerSeverity === 'high') return 'error';
    if (lowerSeverity === 'warning' || lowerSeverity === 'medium') return 'warning';
    return 'info';
  }
}

export function createOpenGrepLocalClient(
  config?: Partial<OpenGrepConfig>,
  semgrepPath?: string,
): OpenGrepClient {
  return new OpenGrepLocalClient(config, semgrepPath);
}
