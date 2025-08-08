/**
 * Edge Case Handler for Code Quality Analysis
 *
 * Provides comprehensive handling for edge cases, file size limits,
 * memory monitoring, timeout management, and error recovery.
 */

import { logInfo, logWarn } from '@repo/observability';
import { readFile, stat } from 'fs/promises';
import { basename, extname, resolve } from 'path';

export interface EdgeCaseConfig {
  maxFileSizeMB?: number;
  warnFileSizeMB?: number;
  maxMemoryMB?: number;
  defaultTimeoutMs?: number;
  maxRetries?: number;
  skipBinaryFiles?: boolean;
  skipMinifiedFiles?: boolean;
  skipGeneratedFiles?: boolean;
}

export interface FileValidationResult {
  isValid: boolean;
  reason?: string;
  warning?: string;
  size?: number;
  shouldSkip: boolean;
  suggestedAction?: string;
}

export interface MemoryStatus {
  heapUsedMB: number;
  heapTotalMB: number;
  externalMB: number;
  rssMB: number;
  utilization: number;
  pressure: 'low' | 'medium' | 'high' | 'critical';
  recommendation?: string;
}

export class EdgeCaseHandler {
  private config: Required<EdgeCaseConfig>;
  private memoryWarnings: Set<string> = new Set();
  private fileCache: Map<string, FileValidationResult> = new Map();

  constructor(config: EdgeCaseConfig = {}) {
    this.config = {
      maxFileSizeMB: config.maxFileSizeMB ?? 10,
      warnFileSizeMB: config.warnFileSizeMB ?? 2,
      maxMemoryMB: config.maxMemoryMB ?? 2048,
      defaultTimeoutMs: config.defaultTimeoutMs ?? 30000,
      maxRetries: config.maxRetries ?? 3,
      skipBinaryFiles: config.skipBinaryFiles ?? true,
      skipMinifiedFiles: config.skipMinifiedFiles ?? true,
      skipGeneratedFiles: config.skipGeneratedFiles ?? true,
    };
  }

  /**
   * Validate a file before processing
   */
  async validateFile(filePath: string): Promise<FileValidationResult> {
    const absolutePath = resolve(filePath);

    // Check cache first
    if (this.fileCache.has(absolutePath)) {
      const cached = this.fileCache.get(absolutePath);
      if (cached !== undefined) {
        return cached;
      }
    }

    try {
      const result = await this.performFileValidation(absolutePath);
      this.fileCache.set(absolutePath, result);
      return result;
    } catch (error) {
      const result: FileValidationResult = {
        isValid: false,
        shouldSkip: true,
        reason: `File validation failed: ${error instanceof Error ? error.message : String(error)}`,
        suggestedAction: 'Check file permissions and accessibility',
      };
      this.fileCache.set(absolutePath, result);
      return result;
    }
  }

  private async performFileValidation(filePath: string): Promise<FileValidationResult> {
    // Validate file path for security (development tool - paths are user-controlled by design)
    const path = await import('path');
    const resolvedPath = path.resolve(filePath);

    // Check if file exists and get stats
    let stats;
    try {
      stats = await stat(resolvedPath); // eslint-disable-line security/detect-non-literal-fs-filename
    } catch (error) {
      return {
        isValid: false,
        shouldSkip: true,
        reason: 'File not accessible or does not exist',
        suggestedAction: 'Verify file path and permissions',
      };
    }

    // Skip directories
    if (stats.isDirectory()) {
      return {
        isValid: false,
        shouldSkip: true,
        reason: 'Path is a directory, not a file',
      };
    }

    const sizeBytes = stats.size;
    const sizeMB = sizeBytes / (1024 * 1024);

    // Check file size limits
    if (sizeMB > this.config.maxFileSizeMB) {
      return {
        isValid: false,
        shouldSkip: true,
        size: sizeMB,
        reason: `File too large (${sizeMB.toFixed(1)}MB > ${this.config.maxFileSizeMB}MB limit)`,
        suggestedAction: 'Increase maxFileSizeMB or exclude this file from analysis',
      };
    }

    const fileName = basename(filePath);
    const ext = extname(filePath).toLowerCase();

    // Check for binary files
    if (this.config.skipBinaryFiles && this.isBinaryFile(fileName, ext)) {
      return {
        isValid: false,
        shouldSkip: true,
        reason: 'Binary file detected',
        suggestedAction: 'Binary files are automatically skipped',
      };
    }

    // Check for minified files
    if (this.config.skipMinifiedFiles && this.isMinifiedFile(fileName)) {
      return {
        isValid: false,
        shouldSkip: true,
        reason: 'Minified file detected',
        suggestedAction: 'Minified files are automatically skipped',
      };
    }

    // Check for generated files
    if (this.config.skipGeneratedFiles && this.isGeneratedFile(fileName, filePath)) {
      return {
        isValid: false,
        shouldSkip: true,
        reason: 'Generated file detected',
        suggestedAction: 'Generated files are automatically skipped',
      };
    }

    // Check for unsupported file types
    if (!this.isSupportedFileType(ext)) {
      return {
        isValid: false,
        shouldSkip: true,
        reason: `Unsupported file type: ${ext}`,
        suggestedAction: 'Only TypeScript, JavaScript, and related files are supported',
      };
    }

    // File is valid but check for warnings
    let warning: string | undefined;
    if (sizeMB > this.config.warnFileSizeMB) {
      warning = `Large file warning (${sizeMB.toFixed(1)}MB > ${this.config.warnFileSizeMB}MB threshold)`;
    }

    return {
      isValid: true,
      shouldSkip: false,
      size: sizeMB,
      warning,
    };
  }

  private isBinaryFile(fileName: string, ext: string): boolean {
    const binaryExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.bmp',
      '.svg',
      '.ico',
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.ppt',
      '.pptx',
      '.zip',
      '.tar',
      '.gz',
      '.7z',
      '.rar',
      '.exe',
      '.dll',
      '.so',
      '.dylib',
      '.mp3',
      '.mp4',
      '.avi',
      '.mov',
      '.wav',
      '.ttf',
      '.otf',
      '.woff',
      '.woff2',
      '.bin',
      '.dat',
      '.db',
      '.sqlite',
    ];

    return binaryExtensions.includes(ext);
  }

  private isMinifiedFile(fileName: string): boolean {
    return (
      fileName.includes('.min.') ||
      fileName.endsWith('.min.js') ||
      fileName.endsWith('.min.css') ||
      fileName.includes('-min.') ||
      fileName.includes('.bundle.') ||
      // Detect very long lines characteristic of minified files
      fileName.includes('vendor')
    );
  }

  private isGeneratedFile(fileName: string, filePath: string): boolean {
    // Common generated file patterns
    const generatedPatterns = [
      /\.generated\./,
      /\.g\.(ts|js)$/,
      /\.d\.ts$/,
      /_generated/,
      /\.proto\.(ts|js)$/,
      /\.graphql\.(ts|js)$/,
    ];

    // Check filename patterns
    if (generatedPatterns.some(pattern => pattern.test(fileName))) {
      return true;
    }

    // Check path patterns (common generated directories)
    const generatedPaths = [
      'node_modules',
      'dist',
      'build',
      'coverage',
      '.next',
      '.nuxt',
      '.output',
      'generated',
      '__generated__',
      '.generated',
    ];

    return generatedPaths.some(
      path => filePath.includes(`/${path}/`) || filePath.includes(`\\${path}\\`),
    );
  }

  private isSupportedFileType(ext: string): boolean {
    const supportedExtensions = [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.mjs',
      '.cjs',
      '.vue',
      '.svelte',
      '.json',
      '.jsonc',
      '.md',
      '.mdx',
    ];

    return supportedExtensions.includes(ext);
  }

  /**
   * Check current memory status
   */
  getMemoryStatus(): MemoryStatus {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const externalMB = Math.round(usage.external / 1024 / 1024);
    const rssMB = Math.round(usage.rss / 1024 / 1024);
    const utilization = Math.round((usage.heapUsed / usage.heapTotal) * 100);

    let pressure: MemoryStatus['pressure'];
    let recommendation: string | undefined;

    if (heapUsedMB > this.config.maxMemoryMB * 0.9 || utilization > 90) {
      pressure = 'critical';
      recommendation = 'Immediate cleanup required - analysis may fail';
    } else if (heapUsedMB > this.config.maxMemoryMB * 0.7 || utilization > 75) {
      pressure = 'high';
      recommendation = 'Consider reducing batch size or performing cleanup';
    } else if (heapUsedMB > this.config.maxMemoryMB * 0.5 || utilization > 60) {
      pressure = 'medium';
      recommendation = 'Monitor memory usage closely';
    } else {
      pressure = 'low';
    }

    return {
      heapUsedMB,
      heapTotalMB,
      externalMB,
      rssMB,
      utilization,
      pressure,
      recommendation,
    };
  }

  /**
   * Check if memory cleanup is needed
   */
  isMemoryCleanupNeeded(): boolean {
    const status = this.getMemoryStatus();
    return status.pressure === 'high' || status.pressure === 'critical';
  }

  /**
   * Suggest optimal batch size based on current memory status
   */
  suggestBatchSize(baseSize: number = 50): number {
    const status = this.getMemoryStatus();

    switch (status.pressure) {
      case 'critical':
        return Math.max(5, Math.floor(baseSize * 0.2));
      case 'high':
        return Math.max(10, Math.floor(baseSize * 0.5));
      case 'medium':
        return Math.max(20, Math.floor(baseSize * 0.75));
      case 'low':
      default:
        return baseSize;
    }
  }

  /**
   * Create timeout-aware promise wrapper
   */
  withTimeout<T>(promise: Promise<T>, timeoutMs?: number, operation?: string): Promise<T> {
    const timeout = timeoutMs ?? this.config.defaultTimeoutMs;

    return Promise.race([
      promise,
      new Promise<never>((resolve, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `Operation timed out after ${timeout}ms${operation ? ` (${operation})` : ''}`,
            ),
          );
        }, timeout);
      }),
    ]);
  }

  /**
   * Retry wrapper with exponential backoff
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelayMs?: number;
      operationName?: string;
      shouldRetry?: (error: any) => boolean;
    } = {},
  ): Promise<T> {
    const maxRetries = options.maxRetries ?? this.config.maxRetries;
    const baseDelayMs = options.baseDelayMs ?? 1000;
    const shouldRetry =
      options.shouldRetry ??
      ((error: any) => error instanceof Error && !error.message.includes('ENOENT'));

    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !shouldRetry(error)) {
          break;
        }

        const delay = baseDelayMs * Math.pow(2, attempt);
        logWarn(
          `${options.operationName ?? 'Operation'} failed (attempt ${attempt + 1}/${maxRetries + 1}): ${error}`,
        );
        logInfo(`Retrying in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Safe file reading with size and encoding checks
   */
  async safeReadFile(filePath: string): Promise<{ content: string; warning?: string }> {
    // Resolve path for security
    const path = await import('path');
    const resolvedPath = path.resolve(filePath);
    const validation = await this.validateFile(resolvedPath);

    if (!validation.isValid || validation.shouldSkip) {
      throw new Error(`File cannot be read: ${validation.reason}`);
    }

    const content = await this.withTimeout(
      readFile(resolvedPath, 'utf8'), // eslint-disable-line security/detect-non-literal-fs-filename
      10000, // 10 second timeout for file reading
      `reading file ${path.basename(resolvedPath)}`,
    );

    // Check for potential encoding issues
    if (content.includes('\uFFFD')) {
      return {
        content,
        warning: 'File contains replacement characters - possible encoding issues',
      };
    }

    // Check for very long lines (potential minified content)
    const lines = content.split('\n');
    const maxLineLength = Math.max(...lines.map(line => line.length));
    if (maxLineLength > 1000) {
      return {
        content,
        warning: `File contains very long lines (max: ${maxLineLength} chars) - might be minified`,
      };
    }

    return { content, warning: validation.warning };
  }

  /**
   * Monitor and warn about memory usage
   */
  monitorMemory(operation: string): void {
    const status = this.getMemoryStatus();
    const warningKey = `${operation}-${status.pressure}`;

    if (
      (status.pressure === 'high' || status.pressure === 'critical') &&
      !this.memoryWarnings.has(warningKey)
    ) {
      logWarn(`⚠️  Memory pressure ${status.pressure} during ${operation}`);
      logWarn(`   Heap: ${status.heapUsedMB}MB used (${status.utilization}% utilization)`);

      if (status.recommendation) {
        logWarn(`   Recommendation: ${status.recommendation}`);
      }

      this.memoryWarnings.add(warningKey);
    }
  }

  /**
   * Clean up caches and reset warnings
   */
  cleanup(): void {
    this.fileCache.clear();
    this.memoryWarnings.clear();
  }

  /**
   * Get comprehensive edge case statistics
   */
  getStatistics(): {
    validatedFiles: number;
    skippedFiles: number;
    largeFiles: number;
    binaryFiles: number;
    minifiedFiles: number;
    generatedFiles: number;
    memoryWarnings: number;
    cacheHitRate: number;
  } {
    const validations = Array.from(this.fileCache.values());

    return {
      validatedFiles: validations.length,
      skippedFiles: validations.filter(v => v.shouldSkip).length,
      largeFiles: validations.filter(v => v.size && v.size > this.config.warnFileSizeMB).length,
      binaryFiles: validations.filter(v => v.reason?.includes('Binary')).length,
      minifiedFiles: validations.filter(v => v.reason?.includes('Minified')).length,
      generatedFiles: validations.filter(v => v.reason?.includes('Generated')).length,
      memoryWarnings: this.memoryWarnings.size,
      cacheHitRate:
        this.fileCache.size > 0
          ? (validations.filter(v => v.isValid).length / this.fileCache.size) * 100
          : 0,
    };
  }
}

// Singleton instance for global usage
export const edgeCaseHandler = new EdgeCaseHandler();

// Utility functions
export function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

export function isRetryableError(error: any): boolean {
  if (!(error instanceof Error)) return false;

  const retryablePatterns = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'temporarily unavailable',
    'rate limit',
    'timeout',
  ];

  return retryablePatterns.some(pattern =>
    error.message.toLowerCase().includes(pattern.toLowerCase()),
  );
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function estimateProcessingTime(fileSizeMB: number): number {
  // Rough estimate: 1MB = 2-5 seconds processing time
  const baseTimePerMB = 3; // seconds
  const overhead = 2; // seconds base overhead

  return Math.round(fileSizeMB * baseTimePerMB + overhead);
}
