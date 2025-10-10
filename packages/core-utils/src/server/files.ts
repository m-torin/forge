/**
 * File System Streaming Utilities for Node.js 22+
 * Provides efficient file streaming with createReadStream/createWriteStream
 */

import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { access, mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import picomatch from 'picomatch';
import { safeThrowIfAborted } from './abort-support';
import { ioQueue } from './concurrency';
import { addContextMetadata, addPerformanceMark } from './context';
import { withRetry } from './retryable';
import { yieldToEventLoop } from './scheduler';
import { validateFilePathZod } from './validation';

export interface FileStreamOptions {
  encoding?: BufferEncoding;
  chunkSize?: number;
  signal?: AbortSignal;
  highWaterMark?: number;
  allowedBasePaths?: string[];
}

// Security: Ensure safe file paths
function ensureSafePath(filePath: string, allowedBasePaths: string[]): string {
  if (!allowedBasePaths || allowedBasePaths.length === 0) {
    throw new Error('No allowed base paths provided - explicit allow-list required for security');
  }
  const validation = validateFilePathZod(filePath, allowedBasePaths);
  if (!validation.success) {
    throw new Error(`Invalid file path: ${validation.error}`);
  }
  return validation.data!;
}

// Helper function to safely extract and validate allowedBasePaths
function safeGetAllowedPaths(allowedBasePaths?: string[]): string[] {
  const paths = allowedBasePaths || [];
  if (paths.length === 0) {
    throw new Error('No allowed base paths provided - explicit allow-list required for security');
  }
  return paths;
}

// Security: Safe glob matching using picomatch to prevent ReDoS attacks
export function createGlobMatcher(pattern: string): (path: string) => boolean {
  // Detect if pattern is a glob or plain string
  const isGlob =
    pattern.includes('*') ||
    pattern.includes('?') ||
    pattern.includes('[') ||
    pattern.includes('{');

  if (!isGlob) {
    // Plain string matching - much faster for simple cases
    return (path: string) => path.includes(pattern);
  }

  try {
    // Use picomatch for proper glob handling with security options
    const matcher = picomatch(pattern, {
      dot: true, // Match dotfiles
      noglobstar: false, // Allow ** globstar
      noext: false, // Allow extended globs
      nocase: false, // Case sensitive by default
      nonegate: true, // Disable negation to prevent complexity
      maxLength: 1024, // Limit pattern length to prevent attacks
    });

    return (path: string) => {
      // Additional safety: limit input length
      if (path.length > 2048) return false;
      return matcher(path);
    };
  } catch (error) {
    console.warn(`[Files] Invalid glob pattern '${pattern}', using string match:`, error);
    return (path: string) => path.includes(pattern);
  }
}

// Security: Match file path against pattern safely
export function matchesPattern(filePath: string, fileName: string, pattern: string): boolean {
  const matcher = createGlobMatcher(pattern);
  return matcher(filePath) || matcher(fileName);
}

export interface FileProcessingOptions extends FileStreamOptions {
  processFunction?: (chunk: Buffer | string) => Buffer | string | Promise<Buffer | string>;
  filterFunction?: (chunk: Buffer | string) => boolean | Promise<boolean>;
  batchSize?: number;
  skipEmpty?: boolean;
}

export interface FileAnalysisResult {
  filePath: string;
  size: number;
  lines: number;
  words: number;
  characters: number;
  hash: string;
  processedChunks: number;
  processingTime: number;
  averageChunkSize: number;
}

export interface DirectoryStreamOptions extends FileStreamOptions {
  recursive?: boolean;
  fileFilter?: (filePath: string) => boolean | Promise<boolean>;
  excludePatterns?: string[];
  includePatterns?: string[];
  maxFiles?: number;
}

/**
 * Create a readable stream from a file with error handling and abort support
 */
export function createFileReadStream(
  filePath: string,
  options: FileStreamOptions = {},
): NodeJS.ReadableStream {
  const { encoding = 'utf8', chunkSize, signal, highWaterMark, allowedBasePaths } = options;

  // Security: Validate file path before access
  const validatedPaths = safeGetAllowedPaths(allowedBasePaths);
  const safePath = ensureSafePath(filePath, validatedPaths);

  const stream = createReadStream(safePath, {
    encoding,
    highWaterMark: highWaterMark || (chunkSize ? chunkSize * 1024 : 16 * 1024), // Default 16KB
  });

  if (signal) {
    const onAbort = () => {
      stream.destroy(new Error('File read aborted'));
    };

    if (signal.aborted) {
      onAbort();
    } else {
      signal.addEventListener('abort', onAbort, { once: true });

      stream.on('close', () => {
        signal.removeEventListener('abort', onAbort);
      });
    }
  }

  return stream;
}

/**
 * Create a writable stream to a file with directory creation and abort support
 */
export async function createFileWriteStream(
  filePath: string,
  options: FileStreamOptions = {},
): Promise<NodeJS.WritableStream> {
  const { encoding = 'utf8', signal, highWaterMark, allowedBasePaths } = options;

  safeThrowIfAborted(signal);

  // Security: Validate file path before access
  const validatedPaths = safeGetAllowedPaths(allowedBasePaths);
  const safePath = ensureSafePath(filePath, validatedPaths);

  // Use retry wrapper for directory creation and file operations
  return withRetry(async () => {
    // Ensure directory exists
    const path = await import('node:path');
    const dirPath = path.dirname(safePath);
    await mkdir(dirPath, { recursive: true });

    const stream = createWriteStream(safePath, {
      encoding,
      highWaterMark: highWaterMark || 16 * 1024,
    });

    if (signal) {
      const onAbort = () => {
        stream.destroy(new Error('File write aborted'));
      };

      if (signal.aborted) {
        onAbort();
      } else {
        signal.addEventListener('abort', onAbort, { once: true });

        stream.on('close', () => {
          signal.removeEventListener('abort', onAbort);
        });
      }
    }

    return stream;
  });
}

/**
 * Stream file processing with transformation
 */
export async function processFileStream(
  inputPath: string,
  outputPath: string,
  options: FileProcessingOptions = {},
): Promise<FileAnalysisResult> {
  const {
    processFunction,
    filterFunction,
    encoding = 'utf8',
    signal,
    batchSize = 1,
    skipEmpty = true,
    allowedBasePaths,
  } = options;

  safeThrowIfAborted(signal);

  // Security: Validate file paths before access
  const validatedPaths = safeGetAllowedPaths(allowedBasePaths);
  const safeInputPath = ensureSafePath(inputPath, validatedPaths);
  const safeOutputPath = ensureSafePath(outputPath, validatedPaths);

  const startTime = performance.now();
  addPerformanceMark?.('file_process_start');

  let processedChunks = 0;
  let totalSize = 0;
  let lines = 0;
  let words = 0;
  let characters = 0;
  const hash = createHash('sha256');

  // Create transform stream
  const transformStream = new Transform({
    objectMode: false,
    highWaterMark: 16 * 1024,

    async transform(chunk: Buffer, _encoding, callback) {
      try {
        safeThrowIfAborted(signal);

        const chunkStr = chunk.toString(encoding);

        // Skip empty chunks if requested
        if (skipEmpty && !chunkStr.trim()) {
          callback();
          return;
        }

        // Apply filter if provided
        if (filterFunction) {
          const shouldProcess = await filterFunction(chunkStr);
          if (!shouldProcess) {
            callback();
            return;
          }
        }

        // Update hash
        hash.update(chunk);

        // Count metrics
        totalSize += chunk.length;
        lines += (chunkStr.match(/\n/g) || []).length;
        words += chunkStr.split(/\s+/).filter(w => w.length > 0).length;
        characters += chunkStr.length;

        // Apply transformation if provided
        let transformedData: Buffer | string = chunkStr;
        if (processFunction) {
          transformedData = await processFunction(chunkStr);
        }

        processedChunks++;

        // Convert to Buffer if string
        const outputBuffer = Buffer.isBuffer(transformedData)
          ? transformedData
          : Buffer.from(transformedData, encoding);

        callback(null, outputBuffer);
      } catch (error) {
        callback(error as Error);
      }
    },
  });

  const readStream = createFileReadStream(safeInputPath, {
    encoding: undefined,
    signal,
    allowedBasePaths,
  });
  const writeStream = await createFileWriteStream(safeOutputPath, {
    encoding: undefined,
    signal,
    allowedBasePaths,
  });

  try {
    await pipeline(readStream, transformStream, writeStream, { signal });

    const processingTime = performance.now() - startTime;
    addPerformanceMark?.('file_process_end');

    // Get file stats
    const stats = await ioQueue.add(() => withRetry(() => stat(safeInputPath)));
    if (!stats) {
      throw new Error('Failed to get file stats');
    }

    const result: FileAnalysisResult = {
      filePath: safeInputPath,
      size: stats.size,
      lines,
      words,
      characters,
      hash: hash.digest('hex'),
      processedChunks,
      processingTime,
      averageChunkSize: processedChunks > 0 ? totalSize / processedChunks : 0,
    };

    addContextMetadata?.('fileProcessingResult', result);

    return result;
  } catch (error) {
    addContextMetadata?.(
      'fileProcessingError',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
}

/**
 * Analyze a file by streaming through it
 */
export async function analyzeFileStream(
  filePath: string,
  options: FileStreamOptions = {},
): Promise<FileAnalysisResult> {
  const { encoding = 'utf8', signal, allowedBasePaths } = options;

  safeThrowIfAborted(signal);

  // Security: Validate file path before access
  const validatedPaths = safeGetAllowedPaths(allowedBasePaths);
  const safePath = ensureSafePath(filePath, validatedPaths);

  const startTime = performance.now();
  addPerformanceMark?.('file_analyze_start');

  let processedChunks = 0;
  let totalSize = 0;
  let lines = 0;
  let words = 0;
  let characters = 0;
  const hash = createHash('sha256');

  const readStream = createFileReadStream(safePath, { encoding, signal, allowedBasePaths });

  return new Promise((resolve, reject) => {
    readStream.on('data', (chunk: Buffer | string) => {
      try {
        safeThrowIfAborted(signal);

        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);
        const str = buffer.toString(encoding);

        hash.update(buffer);

        totalSize += buffer.length;
        lines += (str.match(/\n/g) || []).length;
        words += str.split(/\s+/).filter(w => w.length > 0).length;
        characters += str.length;

        processedChunks++;
      } catch (error) {
        (readStream as any).destroy?.();
        reject(error);
      }
    });

    readStream.on('end', async () => {
      try {
        const processingTime = performance.now() - startTime;
        addPerformanceMark?.('file_analyze_end');

        const stats = await ioQueue.add(() => withRetry(() => stat(safePath)));
        if (!stats) {
          throw new Error('Failed to get file stats');
        }

        const result: FileAnalysisResult = {
          filePath: safePath,
          size: stats.size,
          lines,
          words,
          characters,
          hash: hash.digest('hex'),
          processedChunks,
          processingTime,
          averageChunkSize: processedChunks > 0 ? totalSize / processedChunks : 0,
        };

        addContextMetadata?.('fileAnalysisResult', result);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    readStream.on('error', error => {
      addContextMetadata?.('fileAnalysisError', error.message);
      reject(error);
    });
  });
}

/**
 * Stream directory contents with filtering
 */
export async function* streamDirectoryFiles(
  directoryPath: string,
  options: DirectoryStreamOptions = {},
): AsyncGenerator<string, void, unknown> {
  const {
    recursive = false,
    fileFilter,
    excludePatterns = [],
    includePatterns = [],
    maxFiles,
    signal,
    allowedBasePaths,
  } = options;

  safeThrowIfAborted(signal);

  // Security: Validate directory path before access
  const validatedPaths = safeGetAllowedPaths(allowedBasePaths);
  const safeDirectoryPath = ensureSafePath(directoryPath, validatedPaths);

  let fileCount = 0;
  const path = await import('node:path');

  async function* processDirectory(dirPath: string): AsyncGenerator<string, void, unknown> {
    try {
      safeThrowIfAborted(signal);

      const entries = await ioQueue.add(() =>
        withRetry(() => readdir(dirPath, { withFileTypes: true })),
      );
      if (!entries) {
        return;
      }

      for (const entry of entries) {
        safeThrowIfAborted(signal);

        if (maxFiles && fileCount >= maxFiles) {
          return;
        }

        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          if (recursive) {
            yield* processDirectory(fullPath);
          }
          continue;
        }

        if (entry.isFile()) {
          // Apply exclude patterns with safe glob matching
          const shouldExclude = excludePatterns.some(pattern => {
            return matchesPattern(fullPath, entry.name, pattern);
          });

          if (shouldExclude) continue;

          // Apply include patterns (if any)
          if (includePatterns.length > 0) {
            const shouldInclude = includePatterns.some(pattern => {
              return matchesPattern(fullPath, entry.name, pattern);
            });

            if (!shouldInclude) continue;
          }

          // Apply file filter
          if (fileFilter) {
            const shouldInclude = await fileFilter(fullPath);
            if (!shouldInclude) continue;
          }

          fileCount++;
          yield fullPath;

          // Yield to event loop with Node.js 22+ scheduler
          await yieldToEventLoop();
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('ENOENT')) {
        // Directory doesn't exist, skip silently
        return;
      }
      throw error;
    }
  }

  yield* processDirectory(safeDirectoryPath);
}

/**
 * Copy file with streaming for large files
 */
export async function copyFileStream(
  sourcePath: string,
  destinationPath: string,
  options: FileStreamOptions = {},
): Promise<FileAnalysisResult> {
  const { signal, allowedBasePaths } = options;

  safeThrowIfAborted(signal);

  // Security: Validate file paths before access
  const validatedPaths = safeGetAllowedPaths(allowedBasePaths);
  const safeSourcePath = ensureSafePath(sourcePath, validatedPaths);
  const safeDestinationPath = ensureSafePath(destinationPath, validatedPaths);

  const startTime = performance.now();
  addPerformanceMark?.('file_copy_start');

  let processedChunks = 0;
  let totalSize = 0;
  const hash = createHash('sha256');

  // Create transform stream for monitoring
  const monitorStream = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      try {
        safeThrowIfAborted(signal);

        hash.update(chunk);
        totalSize += chunk.length;
        processedChunks++;

        callback(null, chunk);
      } catch (error) {
        callback(error as Error);
      }
    },
  });

  // Create streams
  const readStream = createFileReadStream(safeSourcePath, {
    encoding: undefined,
    signal,
    allowedBasePaths,
  });
  const writeStream = await createFileWriteStream(safeDestinationPath, {
    encoding: undefined,
    signal,
    allowedBasePaths,
  });

  try {
    // Pipeline the streams
    await pipeline(readStream, monitorStream, writeStream, { signal });

    const processingTime = performance.now() - startTime;
    addPerformanceMark?.('file_copy_end');

    // Get file stats
    const stats = await ioQueue.add(() => withRetry(() => stat(safeSourcePath)));
    if (!stats) {
      throw new Error('Failed to get file stats');
    }

    const result: FileAnalysisResult = {
      filePath: safeSourcePath,
      size: stats.size,
      lines: 0, // Not counted during copy
      words: 0, // Not counted during copy
      characters: 0, // Not counted during copy
      hash: hash.digest('hex'),
      processedChunks,
      processingTime,
      averageChunkSize: processedChunks > 0 ? totalSize / processedChunks : 0,
    };

    addContextMetadata?.('fileCopyResult', result);

    return result;
  } catch (error) {
    addContextMetadata?.('fileCopyError', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Read file in chunks using AsyncGenerator
 */
export async function* readFileInChunks(
  filePath: string,
  options: FileStreamOptions = {},
): AsyncGenerator<{ chunk: Buffer | string; index: number; isLast: boolean }, void, unknown> {
  const { encoding = 'utf8', chunkSize = 16 * 1024, signal } = options;

  safeThrowIfAborted(signal);

  const readStream = createFileReadStream(filePath, { encoding, chunkSize, signal });

  let index = 0;
  let isLast = false;

  try {
    for await (const chunk of readStream) {
      safeThrowIfAborted(signal);

      yield {
        chunk,
        index: index++,
        isLast,
      };

      // Yield to event loop with Node.js 22+ scheduler
      await yieldToEventLoop();
    }

    // Mark the last chunk
    isLast = true;
  } catch (error) {
    addContextMetadata?.('fileReadError', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Write data to file in chunks using AsyncGenerator
 */
export async function writeFileFromChunks(
  filePath: string,
  chunks: AsyncGenerator<Buffer | string, void, unknown>,
  options: FileStreamOptions = {},
): Promise<{ bytesWritten: number; chunksProcessed: number; processingTime: number }> {
  const { signal } = options;

  safeThrowIfAborted(signal);

  const startTime = performance.now();
  addPerformanceMark?.('file_write_start');

  let bytesWritten = 0;
  let chunksProcessed = 0;

  const writeStream = await createFileWriteStream(filePath, { encoding: undefined, signal });

  try {
    for await (const chunk of chunks) {
      safeThrowIfAborted(signal);

      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

      await new Promise<void>((resolve, reject) => {
        writeStream.write(buffer, error => {
          if (error) {
            reject(error);
          } else {
            bytesWritten += buffer.length;
            chunksProcessed++;
            resolve();
          }
        });
      });
    }

    // Close the stream
    await new Promise<void>((resolve, reject) => {
      writeStream.end();
      writeStream.once('finish', () => resolve());
      writeStream.once('error', (error: Error) => reject(error));
    });

    const processingTime = performance.now() - startTime;
    addPerformanceMark?.('file_write_end');

    const result = {
      bytesWritten,
      chunksProcessed,
      processingTime,
    };

    addContextMetadata?.('fileWriteResult', result);

    return result;
  } catch (error) {
    (writeStream as any).destroy?.();
    addContextMetadata?.(
      'fileWriteError',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
}

/**
 * Check if file exists and is accessible
 * Supports both legacy and modern signatures for compatibility
 */
export async function checkFileAccess(
  filePath: string,
  mode?: number | { allowedBasePaths?: string[] },
  allowedBasePaths?: string[] | { allowedBasePaths?: string[] },
): Promise<boolean> {
  // Handle different signatures for backward compatibility
  let resolvedMode: number | undefined;
  let resolvedBasePaths: string[] | undefined;

  if (typeof mode === 'object' && mode !== null) {
    // Modern signature: checkFileAccess(path, { allowedBasePaths })
    resolvedMode = undefined;
    resolvedBasePaths = mode.allowedBasePaths;
  } else if (typeof allowedBasePaths === 'object' && !Array.isArray(allowedBasePaths)) {
    // Mixed signature: checkFileAccess(path, mode, { allowedBasePaths })
    resolvedMode = mode as number | undefined;
    resolvedBasePaths = allowedBasePaths.allowedBasePaths;
  } else {
    // Legacy signature: checkFileAccess(path, mode, allowedBasePaths)
    resolvedMode = mode as number | undefined;
    resolvedBasePaths = allowedBasePaths as string[] | undefined;
  }

  try {
    // Security: Validate file path before access
    const safePath = ensureSafePath(filePath, resolvedBasePaths || []);
    await withRetry(() => access(safePath, resolvedMode));
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file statistics
 * Supports both legacy and modern signatures for compatibility
 */
export async function getFileStats(
  filePath: string,
  allowedBasePathsOrOptions?: string[] | { allowedBasePaths?: string[] },
): Promise<{
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  created: Date;
  modified: Date;
  accessed: Date;
}> {
  // Handle different signatures for backward compatibility
  let resolvedBasePaths: string[] | undefined;

  if (Array.isArray(allowedBasePathsOrOptions)) {
    // Legacy signature: getFileStats(path, allowedBasePaths)
    resolvedBasePaths = allowedBasePathsOrOptions;
  } else if (typeof allowedBasePathsOrOptions === 'object' && allowedBasePathsOrOptions !== null) {
    // Modern signature: getFileStats(path, { allowedBasePaths })
    resolvedBasePaths = allowedBasePathsOrOptions.allowedBasePaths;
  }

  // Security: Validate file path before access
  const safePath = ensureSafePath(filePath, resolvedBasePaths || []);

  // Use retry wrapper and queue for stat operation
  const stats = await ioQueue.add(() => withRetry(() => stat(safePath)));
  if (!stats) {
    throw new Error('Failed to get file stats');
  }

  return {
    size: stats.size,
    isFile: stats.isFile(),
    isDirectory: stats.isDirectory(),
    created: stats.birthtime,
    modified: stats.mtime,
    accessed: stats.atime,
  };
}

/**
 * Process multiple files concurrently using ioQueue for throttled I/O
 */
export async function processFilesConcurrently<T>(
  filePaths: string[],
  processor: (filePath: string, signal?: AbortSignal) => Promise<T>,
  options: {
    signal?: AbortSignal;
    allowedBasePaths?: string[];
  } = {},
): Promise<T[]> {
  const { signal, allowedBasePaths } = options;
  safeThrowIfAborted(signal);

  // Validate all file paths first
  const validatedPaths = safeGetAllowedPaths(allowedBasePaths);
  const validFilePaths = filePaths.map(filePath => ensureSafePath(filePath, validatedPaths));

  // Queue all file processing operations with ioQueue for bounded concurrency
  return ioQueue.addAll(
    validFilePaths.map(filePath => () => withRetry(() => processor(filePath, signal))),
  );
}

/**
 * Analyze multiple files concurrently using ioQueue
 */
export async function analyzeFilesConcurrently(
  filePaths: string[],
  options: FileStreamOptions & {
    batchSize?: number;
  } = {},
): Promise<FileAnalysisResult[]> {
  const { batchSize = 10, ...streamOptions } = options;
  const { signal } = streamOptions;
  safeThrowIfAborted(signal);

  // Process in batches to prevent overwhelming the system
  const results: FileAnalysisResult[] = [];

  for (let i = 0; i < filePaths.length; i += batchSize) {
    safeThrowIfAborted(signal);

    const batch = filePaths.slice(i, i + batchSize);
    const batchResults = await processFilesConcurrently(
      batch,
      (filePath, signal) => analyzeFileStream(filePath, { ...streamOptions, signal }),
      { signal: streamOptions.signal, allowedBasePaths: streamOptions.allowedBasePaths },
    );

    results.push(...batchResults);

    // Yield to event loop between batches
    if (i + batchSize < filePaths.length) {
      await yieldToEventLoop();
    }
  }

  return results;
}

/**
 * Copy multiple files concurrently using ioQueue
 */
export async function copyFilesConcurrently(
  fileOperations: Array<{ source: string; destination: string }>,
  options: FileStreamOptions = {},
): Promise<FileAnalysisResult[]> {
  const { signal } = options;
  safeThrowIfAborted(signal);

  // Queue all copy operations with ioQueue for bounded concurrency
  return ioQueue.addAll(
    fileOperations.map(
      ({ source, destination }) =>
        () =>
          withRetry(() => copyFileStream(source, destination, options)),
    ),
  );
}

/**
 * @deprecated Use checkFileAccess with options object instead
 * This function is deprecated and will be removed in a future version.
 */
export async function checkFileAccessLegacy(
  filePath: string,
  mode?: number,
  options: { allowedBasePaths?: string[] } = {},
): Promise<boolean> {
  console.warn(
    'checkFileAccessLegacy is deprecated. Use checkFileAccess with options object instead.',
  );
  const { allowedBasePaths = [] } = options;
  if (!allowedBasePaths || allowedBasePaths.length === 0) {
    throw new Error('No allowed base paths provided - explicit allow-list required for security');
  }

  try {
    const validatedPaths = safeGetAllowedPaths(allowedBasePaths);
    const safePath = ensureSafePath(filePath, validatedPaths);
    await access(safePath, mode);
    return true;
  } catch {
    return false;
  }
}

/**
 * @deprecated Use getFileStats with options object instead
 * This function is deprecated and will be removed in a future version.
 */
export async function getFileStatsLegacy(
  filePath: string,
  options: { allowedBasePaths?: string[] } = {},
) {
  console.warn('getFileStatsLegacy is deprecated. Use getFileStats with options object instead.');
  const { allowedBasePaths = [] } = options;
  if (!allowedBasePaths || allowedBasePaths.length === 0) {
    throw new Error('No allowed base paths provided - explicit allow-list required for security');
  }

  const validatedPaths = safeGetAllowedPaths(allowedBasePaths);
  const safePath = ensureSafePath(filePath, validatedPaths);
  return await stat(safePath);
}

/**
 * Safe wrapper for readFile with path validation
 */
export async function safeReadFile(
  filePath: string,
  options: { allowedBasePaths?: string[]; encoding?: BufferEncoding } = {},
): Promise<string | Buffer> {
  const { allowedBasePaths = [], encoding = 'utf8' } = options;
  const validatedPaths = safeGetAllowedPaths(allowedBasePaths);
  const safePath = ensureSafePath(filePath, validatedPaths);
  return (await ioQueue.add(() => withRetry(() => readFile(safePath, encoding)))) as
    | string
    | Buffer;
}

/**
 * Safe wrapper for writeFile with path validation
 */
export async function safeWriteFile(
  filePath: string,
  data: string | Buffer,
  options: { allowedBasePaths?: string[]; encoding?: BufferEncoding } = {},
): Promise<void> {
  const { allowedBasePaths = [], encoding = 'utf8' } = options;
  const validatedPaths = safeGetAllowedPaths(allowedBasePaths);
  const safePath = ensureSafePath(filePath, validatedPaths);

  // Ensure directory exists
  const path = await import('node:path');
  const dirPath = path.dirname(safePath);
  await mkdir(dirPath, { recursive: true });

  return await ioQueue.add(() => withRetry(() => writeFile(safePath, data, encoding)));
}

/**
 * Safe wrapper for readdir with path validation
 */
export async function safeReaddir(
  dirPath: string,
  options: { allowedBasePaths?: string[] } = {},
): Promise<string[]> {
  const { allowedBasePaths = [] } = options;
  const validatedPaths = safeGetAllowedPaths(allowedBasePaths);
  const safePath = ensureSafePath(dirPath, validatedPaths);
  return (await ioQueue.add(() => withRetry(() => readdir(safePath)))) as string[];
}

/**
 * Safe wrapper for unlink with path validation
 */
export async function safeUnlink(
  filePath: string,
  options: { allowedBasePaths?: string[] } = {},
): Promise<void> {
  const { allowedBasePaths = [] } = options;
  const validatedPaths = safeGetAllowedPaths(allowedBasePaths);
  const safePath = ensureSafePath(filePath, validatedPaths);
  return await ioQueue.add(() => withRetry(() => unlink(safePath)));
}

/**
 * Safe wrapper for mkdir with path validation
 */
export async function safeMkdir(
  dirPath: string,
  options: { allowedBasePaths?: string[]; recursive?: boolean } = {},
): Promise<string | undefined> {
  const { allowedBasePaths = [], recursive = true } = options;
  const validatedPaths = safeGetAllowedPaths(allowedBasePaths);
  const safePath = ensureSafePath(dirPath, validatedPaths);
  return (await ioQueue.add(() => withRetry(() => mkdir(safePath, { recursive })))) as
    | string
    | undefined;
}
