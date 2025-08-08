/**
 * Security Vulnerability Scanner Tool
 *
 * Scans code for security vulnerabilities, exposed secrets, and unsafe patterns.
 * Integrates with MCP for memory storage and safe string handling.
 */

import { logError, logInfo } from '@repo/observability';
import { tool } from 'ai';
import { readFile } from 'fs/promises';
import { glob } from 'glob';
import { z } from 'zod';
import { edgeCaseHandler } from '../edge-case-handler';
import { createAsyncLogger } from '../mcp-client';
import { BoundedCache, processInBatches } from '../utils';

const inputSchema = z.object({
  path: z.string().describe('Path to scan for security vulnerabilities'),
  includePatterns: z.array(z.string()).optional().describe('Glob patterns to include'),
  excludePatterns: z.array(z.string()).optional().describe('Glob patterns to exclude'),
  scanDepth: z.enum(['quick', 'standard', 'deep']).default('standard'),
  checkDependencies: z.boolean().default(true),
  maxFiles: z.number().optional().default(1000),
});

interface SecurityIssue {
  type: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  file: string;
  line?: number;
  column?: number;
  message: string;
  suggestion?: string;
  codeSnippet?: string;
  confidence: number; // 0-1
}

interface SecurityScanResult {
  issues: SecurityIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    totalFiles: number;
    scannedFiles: number;
    skippedFiles: number;
  };
  dependencies?: {
    vulnerable: Array<{ name: string; version: string; severity: string; cve?: string }>;
    outdated: Array<{ name: string; current: string; latest: string }>;
  };
}

// Common patterns for security vulnerabilities
const SECURITY_PATTERNS = {
  // API Keys and Secrets
  secrets: [
    { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*["']([a-zA-Z0-9_\-]{20,})["']/gi, type: 'api_key' },
    { pattern: /(?:secret|password|passwd|pwd)\s*[:=]\s*["']([^"']{8,})["']/gi, type: 'password' },
    { pattern: /(?:token|auth)\s*[:=]\s*["']([a-zA-Z0-9_\-]{20,})["']/gi, type: 'token' },
    { pattern: /private[_-]?key\s*[:=]\s*["']([^"']+)["']/gi, type: 'private_key' },
    { pattern: /-----BEGIN\s+(?:RSA\s)?PRIVATE\s+KEY-----/g, type: 'private_key_block' },
  ],

  // SQL Injection
  sqlInjection: [
    { pattern: /query\s*\(\s*["'`].*?\$\{[^}]+\}.*?["'`]/g, type: 'sql_template_string' },
    { pattern: /query\s*\(\s*["'`].*?\+.*?["'`]/g, type: 'sql_concatenation' },
    { pattern: /(?:exec|execute)\s*\(\s*["'`].*?\$\{[^}]+\}.*?["'`]/g, type: 'sql_exec' },
  ],

  // XSS Vulnerabilities
  xss: [
    { pattern: /innerHTML\s*=\s*[^"'`\s]+/g, type: 'unsafe_innerHTML' },
    { pattern: /dangerouslySetInnerHTML/g, type: 'react_dangerous_html' },
    { pattern: /document\.write\s*\(/g, type: 'document_write' },
    { pattern: /eval\s*\(/g, type: 'eval_usage' },
  ],

  // Path Traversal
  pathTraversal: [
    { pattern: /readFile\s*\([^)]*\+[^)]*\)/g, type: 'dynamic_file_read' },
    { pattern: /require\s*\([^)]*\+[^)]*\)/g, type: 'dynamic_require' },
    { pattern: /\.\.\/|\.\.\\/, type: 'path_traversal' },
  ],

  // Insecure Random
  insecureRandom: [
    { pattern: /Math\.random\s*\(\s*\).*(?:token|password|secret|key)/gi, type: 'weak_random' },
  ],

  // Command Injection
  commandInjection: [
    { pattern: /exec\s*\([^)]*\$\{[^}]+\}[^)]*\)/g, type: 'command_template' },
    { pattern: /spawn\s*\([^,]+,\s*\[[^\]]*\$\{[^}]+\}[^\]]*\]/g, type: 'spawn_injection' },
  ],
};

// File patterns that often contain sensitive data
const SENSITIVE_FILE_PATTERNS = [
  '.env',
  '.env.*',
  'config/*.json',
  'secrets.*',
  '*.pem',
  '*.key',
  'id_rsa*',
];

class SecurityScanner {
  private cache = new BoundedCache({ maxSize: 100 });
  private logger = createAsyncLogger('security-scanner');

  async scan(options: z.infer<typeof inputSchema>): Promise<SecurityScanResult> {
    await this.logger('Starting security scan', { path: options.path, depth: options.scanDepth });

    const issues: SecurityIssue[] = [];
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      totalFiles: 0,
      scannedFiles: 0,
      skippedFiles: 0,
    };

    // Find files to scan
    const files = await this.findFilesToScan(options);
    summary.totalFiles = files.length;

    // Process files in batches
    await processInBatches(
      files,
      async file => {
        const validation = await edgeCaseHandler.validateFile(file);
        if (!validation.isValid || validation.shouldSkip) {
          summary.skippedFiles++;
          return;
        }

        // Check cache
        const cacheKey = `${file}-${options.scanDepth}`;
        const cached = this.cache.get(cacheKey);
        if (cached) {
          issues.push(...cached);
          summary.scannedFiles++;
          return;
        }

        const fileIssues = await this.scanFile(file, options.scanDepth);
        issues.push(...fileIssues);
        this.cache.set(cacheKey, fileIssues);
        summary.scannedFiles++;

        // Monitor memory
        if (summary.scannedFiles % 100 === 0) {
          edgeCaseHandler.monitorMemory('security-scan');
        }
      },
      { batchSize: 50 },
    );

    // Count issues by severity
    issues.forEach(issue => {
      summary[issue.type]++;
    });

    // Check dependencies if requested
    let dependencies;
    if (options.checkDependencies) {
      dependencies = await this.scanDependencies(options.path);
    }

    await this.logger('Security scan completed', summary);

    return {
      issues: issues.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.type] - severityOrder[b.type];
      }),
      summary,
      dependencies,
    };
  }

  private async findFilesToScan(options: z.infer<typeof inputSchema>): Promise<string[]> {
    const defaultInclude = ['**/*.{js,jsx,ts,tsx,json,env,yml,yaml}'];
    const defaultExclude = ['node_modules/**', 'dist/**', 'build/**', '.git/**', '**/*.min.js'];

    const includePatterns = options.includePatterns || defaultInclude;
    const excludePatterns = [...defaultExclude, ...(options.excludePatterns || [])];

    const files: string[] = [];

    for (const pattern of includePatterns) {
      const matches = await glob(pattern, {
        cwd: options.path,
        absolute: true,
        ignore: excludePatterns,
      });
      files.push(...matches);
    }

    // Add sensitive files explicitly
    for (const pattern of SENSITIVE_FILE_PATTERNS) {
      const matches = await glob(pattern, {
        cwd: options.path,
        absolute: true,
        dot: true, // Include dotfiles
      });
      files.push(...matches);
    }

    // Deduplicate and limit
    const uniqueFiles = Array.from(new Set(files));
    return uniqueFiles.slice(0, options.maxFiles);
  }

  private async scanFile(filePath: string, depth: string): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await readFile(filePath, 'utf8');
      const lines = content.split('\n');

      // Check for secrets and API keys
      if (depth !== 'quick') {
        issues.push(...this.scanForSecrets(content, filePath, lines));
      }

      // Check for injection vulnerabilities
      issues.push(...this.scanForInjection(content, filePath, lines));

      // Check for XSS vulnerabilities
      if (filePath.match(/\.(jsx?|tsx?)$/)) {
        issues.push(...this.scanForXSS(content, filePath, lines));
      }

      // Deep scan includes additional checks
      if (depth === 'deep') {
        issues.push(...this.scanForPathTraversal(content, filePath, lines));
        issues.push(...this.scanForInsecurePatterns(content, filePath, lines));
      }
    } catch (error) {
      await this.logger('Error scanning file', { file: filePath, error });
    }

    return issues;
  }

  private scanForSecrets(content: string, filePath: string, lines: string[]): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    for (const { pattern, type } of SECURITY_PATTERNS.secrets) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = this.getLineNumber(content, match.index);
        const line = lines[lineNum - 1];

        // Skip if it looks like a placeholder or example
        if (this.isPlaceholder(match[0])) continue;

        issues.push({
          type: type.includes('key') || type.includes('password') ? 'critical' : 'high',
          category: 'exposed-secrets',
          file: filePath,
          line: lineNum,
          column: this.getColumnNumber(line, match[0]),
          message: `Potential ${type.replace('_', ' ')} exposed in code`,
          suggestion: 'Move sensitive data to environment variables',
          codeSnippet: this.getCodeSnippet(lines, lineNum),
          confidence: this.calculateConfidence(match[0], type),
        });
      }
    }

    return issues;
  }

  private scanForInjection(content: string, filePath: string, lines: string[]): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // SQL Injection
    for (const { pattern, type } of SECURITY_PATTERNS.sqlInjection) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = this.getLineNumber(content, match.index);

        issues.push({
          type: 'critical',
          category: 'sql-injection',
          file: filePath,
          line: lineNum,
          message: `Potential SQL injection vulnerability: ${type.replace('_', ' ')}`,
          suggestion: 'Use parameterized queries or prepared statements',
          codeSnippet: this.getCodeSnippet(lines, lineNum),
          confidence: 0.8,
        });
      }
    }

    // Command Injection
    for (const { pattern, type } of SECURITY_PATTERNS.commandInjection) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = this.getLineNumber(content, match.index);

        issues.push({
          type: 'critical',
          category: 'command-injection',
          file: filePath,
          line: lineNum,
          message: `Potential command injection vulnerability: ${type.replace('_', ' ')}`,
          suggestion: 'Validate and sanitize all user input before using in commands',
          codeSnippet: this.getCodeSnippet(lines, lineNum),
          confidence: 0.9,
        });
      }
    }

    return issues;
  }

  private scanForXSS(content: string, filePath: string, lines: string[]): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    for (const { pattern, type } of SECURITY_PATTERNS.xss) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = this.getLineNumber(content, match.index);

        // Skip if it's in a comment
        if (this.isInComment(lines[lineNum - 1])) continue;

        issues.push({
          type: type === 'eval_usage' ? 'critical' : 'high',
          category: 'xss',
          file: filePath,
          line: lineNum,
          message: `Potential XSS vulnerability: ${type.replace('_', ' ')}`,
          suggestion: this.getXSSSuggestion(type),
          codeSnippet: this.getCodeSnippet(lines, lineNum),
          confidence: 0.7,
        });
      }
    }

    return issues;
  }

  private scanForPathTraversal(
    content: string,
    filePath: string,
    lines: string[],
  ): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    for (const { pattern, type } of SECURITY_PATTERNS.pathTraversal) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = this.getLineNumber(content, match.index);

        issues.push({
          type: 'high',
          category: 'path-traversal',
          file: filePath,
          line: lineNum,
          message: `Potential path traversal vulnerability: ${type.replace('_', ' ')}`,
          suggestion:
            'Validate and sanitize file paths, use path.resolve() with a safe base directory',
          codeSnippet: this.getCodeSnippet(lines, lineNum),
          confidence: 0.6,
        });
      }
    }

    return issues;
  }

  private scanForInsecurePatterns(
    content: string,
    filePath: string,
    lines: string[],
  ): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Insecure random number generation
    for (const { pattern, type } of SECURITY_PATTERNS.insecureRandom) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = this.getLineNumber(content, match.index);

        issues.push({
          type: 'medium',
          category: 'weak-crypto',
          file: filePath,
          line: lineNum,
          message: 'Using Math.random() for security-sensitive operations',
          suggestion:
            'Use crypto.randomBytes() or crypto.getRandomValues() for cryptographic randomness',
          codeSnippet: this.getCodeSnippet(lines, lineNum),
          confidence: 0.8,
        });
      }
    }

    // Check for HTTP usage (should be HTTPS)
    const httpPattern = /https?:\/\/[^"'\s]+/g;
    let match;
    while ((match = httpPattern.exec(content)) !== null) {
      if (match[0].startsWith('http://') && !match[0].includes('localhost')) {
        const lineNum = this.getLineNumber(content, match.index);

        issues.push({
          type: 'medium',
          category: 'insecure-transport',
          file: filePath,
          line: lineNum,
          message: 'Using HTTP instead of HTTPS',
          suggestion: 'Use HTTPS for all external communications',
          codeSnippet: this.getCodeSnippet(lines, lineNum),
          confidence: 0.9,
        });
      }
    }

    return issues;
  }

  private async scanDependencies(projectPath: string): Promise<any> {
    try {
      // Check for package.json
      const packageJsonPath = `${projectPath}/package.json`;
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

      const vulnerable: any[] = [];
      const outdated: any[] = [];

      // This is a simplified check - in production, you'd use npm audit or similar
      const riskyPackages: Record<string, { below: string; severity: string; cve: string }> = {
        lodash: { below: '4.17.21', severity: 'high', cve: 'CVE-2021-23337' },
        minimist: { below: '1.2.6', severity: 'critical', cve: 'CVE-2021-44906' },
        'node-fetch': { below: '2.6.7', severity: 'high', cve: 'CVE-2022-0235' },
      };

      // Check dependencies
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      for (const [pkg, version] of Object.entries(allDeps)) {
        if (riskyPackages[pkg]) {
          const cleanVersion = (version as string).replace(/[\^~]/, '');
          if (this.isVersionBelow(cleanVersion, riskyPackages[pkg].below)) {
            vulnerable.push({
              name: pkg,
              version: cleanVersion,
              severity: riskyPackages[pkg].severity,
              cve: riskyPackages[pkg].cve,
            });
          }
        }
      }

      return { vulnerable, outdated };
    } catch (error) {
      await this.logger('Error scanning dependencies', { error });
      return undefined;
    }
  }

  // Helper methods
  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private getColumnNumber(line: string, match: string): number {
    return line.indexOf(match) + 1;
  }

  private getCodeSnippet(lines: string[], lineNum: number, context: number = 2): string {
    const start = Math.max(0, lineNum - context - 1);
    const end = Math.min(lines.length, lineNum + context);

    return lines
      .slice(start, end)
      .map((line, i) => {
        const currentLine = start + i + 1;
        const marker = currentLine === lineNum ? '>' : ' ';
        return `${marker} ${currentLine}: ${line}`;
      })
      .join('\n');
  }

  private isPlaceholder(value: string): boolean {
    const placeholders = [
      'your-api-key',
      'your-secret',
      'xxx',
      'todo',
      'fixme',
      'placeholder',
      'example',
      '<api_key>',
      '${API_KEY}',
    ];

    return placeholders.some(p => value.toLowerCase().includes(p));
  }

  private isInComment(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
  }

  private calculateConfidence(match: string, type: string): number {
    // Higher confidence for longer secrets
    if (match.length > 40) return 0.9;
    if (match.length > 30) return 0.8;
    if (match.length > 20) return 0.7;

    // Lower confidence for common patterns
    if (match.includes('test') || match.includes('example')) return 0.3;

    return 0.6;
  }

  private getXSSSuggestion(type: string): string {
    const suggestions: Record<string, string> = {
      unsafe_innerHTML: 'Use textContent or sanitize HTML with DOMPurify',
      react_dangerous_html: 'Sanitize HTML content before rendering',
      document_write: 'Use DOM manipulation methods instead',
      eval_usage: 'Never use eval() - refactor to avoid dynamic code execution',
    };

    return suggestions[type] || 'Sanitize user input and use safe DOM methods';
  }

  private isVersionBelow(current: string, required: string): boolean {
    const currentParts = current.split('.').map(Number);
    const requiredParts = required.split('.').map(Number);

    for (let i = 0; i < requiredParts.length; i++) {
      if (currentParts[i] < requiredParts[i]) return true;
      if (currentParts[i] > requiredParts[i]) return false;
    }

    return false;
  }
}

// Create the tool
export const securityScannerTool = tool({
  description: 'Scan code for security vulnerabilities, exposed secrets, and unsafe patterns',
  inputSchema: inputSchema,
  execute: async input => {
    const scanner = new SecurityScanner();
    const result = await scanner.scan(input);

    // Store results in MCP memory - removed for now to fix types
    // const entityName = createEntityName('security-scan', input.path);

    // Log summary
    logInfo('Security scan completed', {
      critical: result.summary.critical,
      high: result.summary.high,
      medium: result.summary.medium,
      low: result.summary.low,
    });

    if (result.summary.critical > 0) {
      logError('Critical security issues found!', {
        count: result.summary.critical,
        files: result.issues
          .filter(i => i.type === 'critical')
          .map(i => i.file)
          .slice(0, 5),
      });
    }

    return result;
  },
});
