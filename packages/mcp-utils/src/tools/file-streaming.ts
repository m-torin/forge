/**
 * MCP Tool: File Streaming
 * Provides efficient file streaming operations using fs.createReadStream and Pipeline API
 */

import { pipeline } from 'node:stream/promises';
import type { MCPToolResponse } from '../types/mcp';
import { AbortableToolArgs, throwIfAborted } from '../utils/abort-support';
import { runWithContext } from '../utils/context';
import { createMCPErrorResponse } from '../utils/error-handling';
import {
  analyzeFileStream,
  checkFileAccess,
  copyFileStream,
  getFileStats,
  processFileStream,
  readFileInChunks,
  streamDirectoryFiles,
  writeFileFromChunks,
} from '../utils/files';
import { createSafeFunction } from '../utils/security';
import { err, ok } from '../utils/tool-helpers';

export interface FileStreamingArgs extends AbortableToolArgs {
  action:
    | 'analyzeFile'
    | 'processFile'
    | 'copyFile'
    | 'readChunks'
    | 'writeChunks'
    | 'streamDirectory'
    | 'checkAccess'
    | 'getStats'
    | 'demoLargeFile'
    | 'demoTransform'
    | 'demoAnalysis'
    | 'pipelineDemo';

  // File paths
  filePath?: string;
  inputPath?: string;
  outputPath?: string;
  directoryPath?: string;

  // Processing options
  encoding?: BufferEncoding;
  chunkSize?: number;
  processFunction?: string;
  filterFunction?: string;
  batchSize?: number;
  skipEmpty?: boolean;

  // Directory options
  recursive?: boolean;
  excludePatterns?: string[];
  includePatterns?: string[];
  maxFiles?: number;

  // Demo options
  simulateSize?: number;
  transformType?: string;
  analysisDepth?: 'basic' | 'detailed';

  // Access check options
  accessMode?: number;

  // Chunk options
  chunks?: string[];

  // Security options
  allowedBasePaths?: string[];
}

export const fileStreamingTool = {
  name: 'file_streaming',
  description: 'Node.js 22+ File System streaming with fs.createReadStream/createWriteStream',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'analyzeFile',
          'processFile',
          'copyFile',
          'readChunks',
          'writeChunks',
          'streamDirectory',
          'checkAccess',
          'getStats',
          'demoLargeFile',
          'demoTransform',
          'demoAnalysis',
          'pipelineDemo',
        ],
        description: 'File streaming action to perform',
      },
      filePath: {
        type: 'string',
        description: 'Path to the file to process',
      },
      inputPath: {
        type: 'string',
        description: 'Input file path for processing operations',
      },
      outputPath: {
        type: 'string',
        description: 'Output file path for processing operations',
      },
      directoryPath: {
        type: 'string',
        description: 'Directory path for streaming operations',
      },
      encoding: {
        type: 'string',
        description: 'File encoding (utf8, ascii, etc.)',
        default: 'utf8',
      },
      chunkSize: {
        type: 'number',
        description: 'Chunk size for streaming in bytes',
        default: 16384,
      },
      processFunction: {
        type: 'string',
        description: 'JavaScript function to process chunks (e.g., "chunk => chunk.toUpperCase()")',
      },
      filterFunction: {
        type: 'string',
        description:
          'JavaScript function to filter chunks (e.g., "chunk => chunk.includes(\\"test\\")")',
      },
      batchSize: {
        type: 'number',
        description: 'Batch size for processing',
        default: 1,
      },
      skipEmpty: {
        type: 'boolean',
        description: 'Skip empty chunks',
        default: true,
      },
      recursive: {
        type: 'boolean',
        description: 'Recursively stream directory contents',
        default: false,
      },
      excludePatterns: {
        type: 'array',
        items: { type: 'string' },
        description: 'Patterns to exclude from directory streaming',
      },
      includePatterns: {
        type: 'array',
        items: { type: 'string' },
        description: 'Patterns to include in directory streaming',
      },
      maxFiles: {
        type: 'number',
        description: 'Maximum number of files to process',
      },
      simulateSize: {
        type: 'number',
        description: 'Simulated file size in KB for demos',
        default: 100,
      },
      transformType: {
        type: 'string',
        description: 'Type of transformation for demo',
        enum: ['uppercase', 'lowercase', 'reverse', 'base64', 'hash'],
        default: 'uppercase',
      },
      analysisDepth: {
        type: 'string',
        description: 'Depth of file analysis',
        enum: ['basic', 'detailed'],
        default: 'basic',
      },
      accessMode: {
        type: 'number',
        description: 'File access mode to check',
      },
      chunks: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of chunk data for writing',
      },
      allowedBasePaths: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Array of allowed base paths for file operations (defaults to current working directory)',
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['action'],
  },

  async execute(args: FileStreamingArgs): Promise<MCPToolResponse> {
    try {
      const {
        action,
        filePath,
        inputPath,
        outputPath,
        directoryPath,
        encoding = 'utf8',
        chunkSize = 16384,
        processFunction,
        filterFunction,
        batchSize = 1,
        skipEmpty = true,
        recursive = false,
        excludePatterns = [],
        includePatterns = [],
        maxFiles,
        simulateSize = 100,
        transformType = 'uppercase',
        analysisDepth = 'basic',
        accessMode,
        chunks = [],
        allowedBasePaths,
        signal,
      } = args;

      throwIfAborted(signal);

      // Security: Require explicit allowed paths
      if (!allowedBasePaths || allowedBasePaths.length === 0) {
        return err(
          'No allowed base paths provided - explicit allow-list required for security',
          'file_streaming',
          'Security check',
        );
      }

      return runWithContext(
        {
          toolName: 'file_streaming',
          metadata: { action, filePath, inputPath, outputPath },
        },
        async () => {
          switch (action) {
            case 'analyzeFile': {
              if (!filePath) {
                throw new Error('filePath required for analyzeFile');
              }

              const result = await analyzeFileStream(filePath, {
                encoding,
                chunkSize,
                signal,
                allowedBasePaths,
              });

              return ok({
                success: true,
                action: 'analyzeFile',
                analysis: result,
                efficiency: {
                  avgChunkSize: result.averageChunkSize,
                  chunksPerSecond: result.processedChunks / (result.processingTime / 1000),
                  bytesPerSecond: result.size / (result.processingTime / 1000),
                },
              });
            }

            case 'processFile': {
              if (!inputPath || !outputPath) {
                throw new Error('inputPath and outputPath required for processFile');
              }

              let processFn:
                | ((chunk: Buffer | string) => Buffer | string | Promise<Buffer | string>)
                | undefined;
              let filterFn: ((chunk: Buffer | string) => boolean | Promise<boolean>) | undefined;

              if (processFunction) {
                // Security: Use safe VM context instead of new Function
                processFn = createSafeFunction(processFunction, 'chunk') as (
                  chunk: Buffer | string,
                ) => Buffer | string | Promise<Buffer | string>;
              }

              if (filterFunction) {
                // Security: Use safe VM context instead of new Function
                filterFn = createSafeFunction(filterFunction, 'chunk') as (
                  chunk: Buffer | string,
                ) => boolean | Promise<boolean>;
              }

              const result = await processFileStream(inputPath, outputPath, {
                processFunction: processFn,
                filterFunction: filterFn,
                encoding,
                chunkSize,
                batchSize,
                skipEmpty,
                signal,
                allowedBasePaths,
              });

              return ok({
                success: true,
                action: 'processFile',
                result,
                processing: {
                  hadProcessFunction: !!processFn,
                  hadFilterFunction: !!filterFn,
                  throughput: result.size / (result.processingTime / 1000),
                },
              });
            }

            case 'copyFile': {
              if (!inputPath || !outputPath) {
                throw new Error('inputPath and outputPath required for copyFile');
              }

              const result = await copyFileStream(inputPath, outputPath, {
                chunkSize,
                signal,
                allowedBasePaths,
              });

              return ok({
                success: true,
                action: 'copyFile',
                result,
                performance: {
                  copySpeed: result.size / (result.processingTime / 1000),
                  efficiency: result.processedChunks > 0 ? result.size / result.processedChunks : 0,
                },
              });
            }

            case 'readChunks': {
              if (!filePath) {
                throw new Error('filePath required for readChunks');
              }

              const chunks: any[] = [];
              let index = 0;

              for await (const chunkInfo of readFileInChunks(filePath, {
                encoding,
                chunkSize,
                signal,
                allowedBasePaths,
              })) {
                chunks.push({
                  index: chunkInfo.index,
                  size: Buffer.isBuffer(chunkInfo.chunk)
                    ? chunkInfo.chunk.length
                    : chunkInfo.chunk.length,
                  preview: chunkInfo.chunk.toString().substring(0, 100), // First 100 chars
                  isLast: chunkInfo.isLast,
                });

                index++;

                // Limit chunks for demo
                if (index >= 10) break;

                await new Promise(resolve => setImmediate(resolve));
              }

              return ok({
                success: true,
                action: 'readChunks',
                chunksRead: chunks.length,
                chunks,
                truncated: chunks.length >= 10,
              });
            }

            case 'writeChunks': {
              if (!outputPath || chunks.length === 0) {
                throw new Error('outputPath and chunks required for writeChunks');
              }

              async function* chunkGenerator() {
                for (const chunk of chunks) {
                  throwIfAborted(signal);
                  yield chunk;
                }
              }

              const result = await writeFileFromChunks(outputPath, chunkGenerator(), {
                signal,
                allowedBasePaths,
              });

              return ok({
                success: true,
                action: 'writeChunks',
                result,
                inputChunks: chunks.length,
                averageChunkSize: result.bytesWritten / result.chunksProcessed,
              });
            }

            case 'streamDirectory': {
              if (!directoryPath) {
                throw new Error('directoryPath required for streamDirectory');
              }

              const files: string[] = [];
              let fileCount = 0;

              for await (const file of streamDirectoryFiles(directoryPath, {
                recursive,
                excludePatterns,
                includePatterns,
                maxFiles,
                allowedBasePaths,
                signal,
              })) {
                throwIfAborted(signal);
                files.push(file);
                fileCount++;

                if (fileCount % 10 === 0) {
                  await new Promise(resolve => setImmediate(resolve));
                }
              }

              return ok({
                success: true,
                action: 'streamDirectory',
                directory: directoryPath,
                filesFound: files.length,
                files: files.slice(0, 20), // Show first 20 files
                truncated: files.length > 20,
                options: {
                  recursive,
                  excludePatterns,
                  includePatterns,
                  maxFiles,
                },
              });
            }

            case 'checkAccess': {
              if (!filePath) {
                throw new Error('filePath required for checkAccess');
              }

              const canAccess = await checkFileAccess(filePath, accessMode, { allowedBasePaths });

              return ok({
                success: true,
                action: 'checkAccess',
                filePath,
                canAccess,
                accessMode,
              });
            }

            case 'getStats': {
              if (!filePath) {
                throw new Error('filePath required for getStats');
              }

              const stats = await getFileStats(filePath, { allowedBasePaths });

              return ok({
                success: true,
                action: 'getStats',
                filePath,
                stats,
              });
            }

            case 'demoLargeFile': {
              // Create a simulated large file demo with automatic cleanup
              const fs = await import('node:fs/promises');
              const path = await import('node:path');
              const os = await import('node:os');

              // Resource management class for automatic cleanup
              class TempFileResource implements AsyncDisposable {
                public readonly tempDir: string;
                public readonly demoFile: string;

                constructor(tempDir: string, fileName: string) {
                  this.tempDir = tempDir;
                  this.demoFile = path.join(tempDir, fileName);
                }

                async [Symbol.asyncDispose]() {
                  try {
                    await fs.unlink(this.demoFile);
                    await fs.rmdir(this.tempDir);
                  } catch (error) {
                    // Ignore cleanup errors in demo
                  }
                }
              }

              const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-streaming-'));
              await using tempResource = new TempFileResource(tempDir, 'large-demo.txt');

              const lineCount = simulateSize * 10;
              const lines = Array.from(
                { length: lineCount },
                (_, i) =>
                  `Line ${i + 1}: This is a demo line with some content to simulate a large file. Timestamp: ${Date.now()}`,
              );

              await fs.writeFile(tempResource.demoFile, lines.join('\n'));

              const analysis = await analyzeFileStream(tempResource.demoFile, {
                encoding,
                chunkSize,
                allowedBasePaths,
                signal,
              });

              return ok({
                success: true,
                action: 'demoLargeFile',
                demo: {
                  simulatedSizeKB: simulateSize,
                  actualSizeBytes: analysis.size,
                  linesGenerated: lineCount,
                },
                analysis,
                performance: {
                  processingSpeedMBps:
                    analysis.size / 1024 / 1024 / (analysis.processingTime / 1000),
                  chunksPerSecond: analysis.processedChunks / (analysis.processingTime / 1000),
                },
              });
            }

            case 'demoTransform': {
              const fs = await import('node:fs/promises');
              const path = await import('node:path');
              const os = await import('node:os');

              const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'transform-demo-'));
              const inputFile = path.join(tempDir, 'input.txt');
              const outputFile = path.join(tempDir, 'output.txt');

              const inputContent = `Hello World!\nThis is a streaming transformation demo.\nNode.js 22+ file streaming is powerful!`;
              await fs.writeFile(inputFile, inputContent);

              let transformFn: (chunk: Buffer | string) => Buffer | string;
              switch (transformType) {
                case 'uppercase':
                  transformFn = (chunk: Buffer | string) => {
                    const str = Buffer.isBuffer(chunk) ? chunk.toString() : chunk;
                    return str.toUpperCase();
                  };
                  break;
                case 'lowercase':
                  transformFn = (chunk: Buffer | string) => {
                    const str = Buffer.isBuffer(chunk) ? chunk.toString() : chunk;
                    return str.toLowerCase();
                  };
                  break;
                case 'reverse':
                  transformFn = (chunk: Buffer | string) => {
                    const str = Buffer.isBuffer(chunk) ? chunk.toString() : chunk;
                    return str.split('').reverse().join('');
                  };
                  break;
                case 'base64':
                  transformFn = (chunk: Buffer | string) => {
                    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                    return buffer.toString('base64');
                  };
                  break;
                case 'hash':
                  transformFn = (chunk: Buffer | string) => {
                    const crypto = require('node:crypto');
                    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                    return crypto.createHash('md5').update(buffer).digest('hex');
                  };
                  break;
                default:
                  transformFn = (chunk: Buffer | string) => chunk;
              }

              const result = await processFileStream(inputFile, outputFile, {
                processFunction: transformFn,
                encoding,
                chunkSize,
                signal,
                allowedBasePaths,
              });

              const outputContent = await fs.readFile(outputFile, 'utf8');

              await fs.unlink(inputFile);
              await fs.unlink(outputFile);
              await fs.rmdir(tempDir);

              return ok({
                success: true,
                action: 'demoTransform',
                transformType,
                demo: {
                  inputContent,
                  outputContent: outputContent.substring(0, 500), // Limit output
                  inputSize: inputContent.length,
                  outputSize: outputContent.length,
                },
                processing: result,
              });
            }

            case 'demoAnalysis': {
              const fs = await import('node:fs/promises');
              const path = await import('node:path');
              const os = await import('node:os');

              const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'analysis-demo-'));
              const analysisFile = path.join(tempDir, 'analysis.txt');

              let content: string;
              if (analysisDepth === 'detailed') {
                content = Array.from({ length: 100 }, (_, i) => {
                  const words = [
                    'Hello',
                    'world',
                    'streaming',
                    'analysis',
                    'Node',
                    'file',
                    'processing',
                    'demo',
                  ];
                  const line = Array.from(
                    { length: 10 },
                    () => words[Math.floor(Math.random() * words.length)],
                  ).join(' ');
                  return `${i + 1}: ${line}`;
                }).join('\n');
              } else {
                content =
                  'Simple analysis demo.\nThis file has multiple lines.\nEach line contains words to count.';
              }

              await fs.writeFile(analysisFile, content);

              const analysis = await analyzeFileStream(analysisFile, {
                encoding,
                chunkSize,
                signal,
              });

              await fs.unlink(analysisFile);
              await fs.rmdir(tempDir);

              return ok({
                success: true,
                action: 'demoAnalysis',
                analysisDepth,
                analysis,
                insights: {
                  averageLineLength: analysis.lines > 0 ? analysis.characters / analysis.lines : 0,
                  averageWordsPerLine: analysis.lines > 0 ? analysis.words / analysis.lines : 0,
                  processingEfficiency: analysis.size / analysis.processingTime, // bytes per ms
                },
              });
            }

            case 'pipelineDemo': {
              const fs = await import('node:fs');
              const { Transform } = await import('node:stream');
              const { validateFilePathZod } = await import('../utils/validation');
              const filePath = args.filePath;

              if (!filePath) {
                throw new Error('File path required for pipeline demo');
              }

              // Security: Validate file path to prevent path traversal
              const validation = validateFilePathZod(filePath, allowedBasePaths || []);
              if (!validation.success) {
                throw new Error(`Invalid file path: ${validation.error}`);
              }
              const safeFilePath = validation.data!;

              // Create transform streams for the pipeline
              const upperCaseTransform = new Transform({
                transform(chunk, encoding, callback) {
                  callback(null, chunk.toString().toUpperCase());
                },
              });

              const lineCountTransform = new Transform({
                objectMode: false,
                transform(chunk, encoding, callback) {
                  const lines = chunk.toString().split('\n').length - 1;
                  callback(null, `[${lines} lines] ${chunk}`);
                },
              });

              // Use pipeline API for robust error handling and cleanup
              const chunks: Buffer[] = [];
              const collectTransform = new Transform({
                transform(chunk, encoding, callback) {
                  chunks.push(chunk);
                  callback(null, chunk);
                },
              });

              await pipeline(
                fs.createReadStream(safeFilePath),
                upperCaseTransform,
                lineCountTransform,
                collectTransform,
                { signal },
              );

              const totalContent = Buffer.concat(chunks).toString();

              return ok({
                success: true,
                action: 'pipelineDemo',
                pipeline: {
                  stages: ['readFile', 'upperCase', 'lineCount', 'collect'],
                  totalChunks: chunks.length,
                  contentPreview:
                    totalContent.slice(0, 200) + (totalContent.length > 200 ? '...' : ''),
                  totalSize: totalContent.length,
                },
                advantages: [
                  'Automatic error propagation',
                  'Guaranteed stream cleanup',
                  'Backpressure handling',
                  'AbortSignal integration',
                ],
              });
            }

            default:
              throw new Error(`Unknown file streaming action: ${action}`);
          }
        },
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('aborted')) {
        return err('Operation aborted', 'file_streaming', 'Abort handler');
      }

      return createMCPErrorResponse(error, 'file_streaming', {
        contextInfo: 'File Streaming',
      });
    }
  },
};
