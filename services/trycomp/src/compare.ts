import { diffLines, diffWords, diffChars, type Change } from 'diff';
import { createTryCompClient } from './client.js';
import type { CodeSnippet, ComparisonRequest, ComparisonResult, TryCompConfig } from './types.js';

export interface CodeComparisonOptions {
  diffType?: 'lines' | 'words' | 'chars' | 'semantic';
  includeAIAnalysis?: boolean;
  context?: string;
  model?: 'gpt-4' | 'claude-3-sonnet' | 'claude-3-haiku',
}

export class CodeComparator {
  private client: ReturnType<typeof createTryCompClient>;

  constructor(config?: Partial<TryCompConfig>) {
    this.client = createTryCompClient(config);
  }

  async compareFiles(
    filePathA: string,
    filePathB: string,
    options: CodeComparisonOptions = {},
  ): Promise<ComparisonResult> {
    const fs = await import('fs/promises');

    const [contentA, contentB] = await Promise.all([
      fs.readFile(filePathA, 'utf-8'),
      fs.readFile(filePathB, 'utf-8'),
    ]);

    const codeA: CodeSnippet = {
      content: contentA,
      filename: filePathA,
      language: this.detectLanguage(filePathA),
    });

    const codeB: CodeSnippet = {
      content: contentB,
      filename: filePathB,
      language: this.detectLanguage(filePathB),
    };

    return this.compareCode(codeA, codeB, options);
  }

  async compareCode(
    codeA: CodeSnippet,
    codeB: CodeSnippet,
    options: CodeComparisonOptions = {},
  ): Promise<ComparisonResult> {
    const request: ComparisonRequest = {
      codeA,
      codeB,
      comparisonType: 'all',
      includeScore: true,
      includeRecommendations: true,
      context: options.context,
    });

    if (options.includeAIAnalysis !== false) {
      return this.client.compare(request);
    } else {
      // Return basic diff without AI analysis
      return this.basicComparison(request, options.diffType || 'lines');
    }
  }

  async compareDirectories(
    dirA: string,
    dirB: string,
    options: CodeComparisonOptions & { filePattern?: RegExp } = {},
  ): Promise<ComparisonResult[]> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const filesA = await this.getFilesRecursive(dirA, options.filePattern);
    const filesB = await this.getFilesRecursive(dirB, options.filePattern);

    const results: ComparisonResult[] = [];

    // Compare common files
    for (const fileA of filesA) {
      const relativePath = path.relative(dirA, fileA);
      const fileB = path.join(dirB, relativePath);

      if (filesB.includes(fileB)) {
        try {
          const result = await this.compareFiles(fileA, fileB, options);
          results.push(result);
        } catch (error) {
          console.warn(`Failed to compare ${fileA} and ${fileB}: `, error),
        }
      }
    }

    return results;
  }

  private async getFilesRecursive(dir: string, pattern?: RegExp): Promise<string[]> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...(await this.getFilesRecursive(fullPath, pattern)));
        }
      } else if (entry.isFile()) {
        if (!pattern || pattern.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  private basicComparison(request: ComparisonRequest, diffType: string): ComparisonResult {
    const { codeA, codeB } = request;
    let diff;

    switch (diffType) {
      case 'words':
        diff = diffWords(codeA.content, codeB.content);
        break;
      case 'chars':
        diff = diffChars(codeA.content, codeB.content);
        break;
      default: diff = diffLines(codeA.content, codeB.content),
    }

    const additions = diff.filter((part: Change) => part.added).length;
    const deletions = diff.filter((part: Change) => part.removed).length;
    const unchanged = diff.filter((part: Change) => !part.added && !part.removed).length;

    const similarity = unchanged / (unchanged + additions + deletions);
    const score = Math.round(similarity * 100);

    return {
      id: `basic_${Date.now()}`,
      timestamp: new Date().toISOString(),
      request,
      score: {
        overall: score,
        semantic: score,
        performance: score,
        security: score,
        maintainability: score,
        style: score,
        functionality: score,
      },
      analysis: {
        summary: `Basic ${diffType} comparison completed`,
        differences: diff
          .filter((part: Change) => part.added || part.removed)
          .map((part: Change) => `${part.added ? 'Added' : 'Removed'}: ${part.value.trim()}`),
        similarities: diff
          .filter((part: Change) => !part.added && !part.removed)
          .map((part: Change) => `Unchanged: ${part.value.trim()}`),
        reasoning: `Similarity score: ${score}% based on ${diffType} comparison`,
      },
      metadata: {
        model: 'basic-diff',
        processingTime: 0,
      },
    };
  }

  private detectLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();

    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      swift: 'swift',
      kt: 'kotlin',
      dart: 'dart',
      scala: 'scala',
      sh: 'bash',
      json: 'json',
      xml: 'xml',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sql: 'sql',
      yaml: 'yaml',
      yml: 'yaml',
      toml: 'toml',
      md: 'markdown',
    });

    return languageMap[ext || ''] || 'text';
  }
}

export function createCodeComparator(config?: Partial<TryCompConfig>): CodeComparator {
  return new CodeComparator(config);
}
