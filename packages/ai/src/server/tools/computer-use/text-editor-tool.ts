/**
 * AI SDK v5 Text Editor Tool - textEditor_20241022
 * Implements Anthropic's text editor capabilities
 */

import { logError, logInfo } from '@repo/observability/server/next';
import { tool } from 'ai';
import { access, readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod/v4';

/**
 * Text editor command types
 */
export const TextEditorCommandSchema = z.enum([
  'view',
  'create',
  'str_replace_editor',
  'str_replace_based_edit',
  'search',
  'move_cursor',
  'jump_to_line',
]);

/**
 * Text editor input schema
 */
export const TextEditorInputSchema = z.object({
  command: TextEditorCommandSchema,
  path: z.string().describe('File path to edit'),
  content: z.string().optional().describe('Content for create or replace operations'),
  oldStr: z.string().optional().describe('String to search for in replace operations'),
  newStr: z.string().optional().describe('String to replace with'),
  lineNumber: z.number().optional().describe('Line number for navigation'),
  viewStart: z.number().optional().describe('Start line for viewing'),
  viewEnd: z.number().optional().describe('End line for viewing'),
  searchTerm: z.string().optional().describe('Term to search for'),
  caseInsensitive: z.boolean().optional().default(false).describe('Case insensitive search'),
});

export type TextEditorInput = z.infer<typeof TextEditorInputSchema>;

/**
 * Text editor configuration
 */
export interface TextEditorConfig {
  /** Base directory for file operations */
  baseDirectory?: string;
  /** Allow file creation */
  allowCreate?: boolean;
  /** Allow file editing */
  allowEdit?: boolean;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Allowed file extensions */
  allowedExtensions?: string[];
  /** Denied file patterns */
  deniedPatterns?: RegExp[];
  /** Sandbox mode - simulates operations without file system access */
  sandbox?: boolean;
  /** Custom file reader */
  fileReader?: (path: string) => Promise<string>;
  /** Custom file writer */
  fileWriter?: (path: string, content: string) => Promise<void>;
}

/**
 * File cache for sandbox mode
 */
const sandboxFileCache = new Map<string, string[]>();

/**
 * Create the textEditor_20241022 tool
 */
export function createTextEditorTool(config: TextEditorConfig = {}) {
  const {
    baseDirectory = process.cwd(),
    allowCreate = true,
    allowEdit = true,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    allowedExtensions = [],
    deniedPatterns = [/node_modules/, /\.git/, /\.env/],
    sandbox = false,
    fileReader,
    fileWriter,
  } = config;

  return tool({
    description: 'Text editor for viewing and editing files',
    parameters: TextEditorInputSchema,
    execute: async (input, _options) => {
      logInfo('Text Editor Tool: Executing command', {
        operation: 'text_editor_execute',
        metadata: {
          command: input.command,
          path: input.path,
          sandbox,
        },
      });

      // Validate file path
      const filePath = resolveFilePath(input.path, baseDirectory);
      validateFilePath(filePath, baseDirectory, deniedPatterns, allowedExtensions);

      try {
        switch (input.command) {
          case 'view': {
            const content = sandbox
              ? await sandboxReadFile(filePath)
              : fileReader
                ? await fileReader(filePath)
                : await readFileWithLimit(filePath, maxFileSize);

            const lines = content.split('\n');
            const start = input.viewStart || 1;
            const end = input.viewEnd || lines.length;

            const viewedLines = lines.slice(start - 1, end);

            return {
              command: 'view',
              path: filePath,
              content: viewedLines.join('\n'),
              lineCount: lines.length,
              viewedLines: {
                start,
                end: Math.min(end, lines.length),
              },
              timestamp: new Date().toISOString(),
            };
          }

          case 'create': {
            if (!allowCreate) {
              throw new Error('File creation is disabled');
            }

            if (!input.content) {
              throw new Error('Content required for create command');
            }

            if (sandbox) {
              await sandboxWriteFile(filePath, input.content);
            } else if (fileWriter) {
              await fileWriter(filePath, input.content);
            } else {
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              await writeFile(filePath, input.content, 'utf-8');
            }

            return {
              command: 'create',
              path: filePath,
              success: true,
              size: input.content.length,
              lineCount: input.content.split('\n').length,
              timestamp: new Date().toISOString(),
            };
          }

          case 'str_replace_editor':
          case 'str_replace_based_edit': {
            if (!allowEdit) {
              throw new Error('File editing is disabled');
            }

            if (!input.oldStr || input.newStr === undefined) {
              throw new Error('oldStr and newStr required for replace operations');
            }

            const content = sandbox
              ? await sandboxReadFile(filePath)
              : fileReader
                ? await fileReader(filePath)
                : await readFileWithLimit(filePath, maxFileSize);

            const occurrences = countOccurrences(content, input.oldStr);

            if (occurrences === 0) {
              throw new Error(`String not found: "${input.oldStr}"`);
            }

            if (occurrences > 1 && input.command === 'str_replace_editor') {
              throw new Error(
                `Multiple occurrences found (${occurrences}). Use str_replace_based_edit for multiple replacements.`,
              );
            }

            const newContent = content.replace(
              input.command === 'str_replace_editor'
                ? input.oldStr
                : // eslint-disable-next-line security/detect-non-literal-regexp
                  new RegExp(escapeRegExp(input.oldStr), 'g'),
              input.newStr,
            );

            if (sandbox) {
              await sandboxWriteFile(filePath, newContent);
            } else if (fileWriter) {
              await fileWriter(filePath, newContent);
            } else {
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              await writeFile(filePath, newContent, 'utf-8');
            }

            return {
              command: input.command,
              path: filePath,
              success: true,
              replacements: occurrences,
              oldLength: content.length,
              newLength: newContent.length,
              timestamp: new Date().toISOString(),
            };
          }

          case 'search': {
            if (!input.searchTerm) {
              throw new Error('searchTerm required for search command');
            }

            const content = sandbox
              ? await sandboxReadFile(filePath)
              : fileReader
                ? await fileReader(filePath)
                : await readFileWithLimit(filePath, maxFileSize);

            const lines = content.split('\n');
            const matches: Array<{ line: number; content: string; column: number }> = [];

            if (input.caseInsensitive) {
              // Use regex for case-insensitive search (escaped for safety)
              // eslint-disable-next-line security/detect-non-literal-regexp
              const searchRegex = new RegExp(escapeRegExp(input.searchTerm), 'gi');
              lines.forEach((line, index) => {
                const lineMatches = [...line.matchAll(searchRegex)];
                lineMatches.forEach(match => {
                  matches.push({
                    line: index + 1,
                    content: line,
                    column: (match.index ?? 0) + 1,
                  });
                });
              });
            } else {
              // Use safer string indexOf for case-sensitive search
              lines.forEach((line, index) => {
                if (!input.searchTerm) return;
                let searchIndex = 0;
                let foundIndex = line.indexOf(input.searchTerm, searchIndex);
                while (foundIndex !== -1) {
                  matches.push({
                    line: index + 1,
                    content: line,
                    column: foundIndex + 1,
                  });
                  searchIndex = foundIndex + 1;
                  foundIndex = line.indexOf(input.searchTerm, searchIndex);
                }
              });
            }

            return {
              command: 'search',
              path: filePath,
              searchTerm: input.searchTerm,
              matches: matches.slice(0, 100), // Limit results
              totalMatches: matches.length,
              timestamp: new Date().toISOString(),
            };
          }

          case 'move_cursor':
          case 'jump_to_line': {
            if (!input.lineNumber) {
              throw new Error('lineNumber required for navigation commands');
            }

            const content = sandbox
              ? await sandboxReadFile(filePath)
              : fileReader
                ? await fileReader(filePath)
                : await readFileWithLimit(filePath, maxFileSize);

            const lines = content.split('\n');

            if (input.lineNumber < 1 || input.lineNumber > lines.length) {
              throw new Error(
                `Line number out of range: ${input.lineNumber} (file has ${lines.length} lines)`,
              );
            }

            const contextStart = Math.max(1, input.lineNumber - 5);
            const contextEnd = Math.min(lines.length, input.lineNumber + 5);
            const contextLines = lines.slice(contextStart - 1, contextEnd);

            return {
              command: input.command,
              path: filePath,
              lineNumber: input.lineNumber,
              lineContent: lines[input.lineNumber - 1],
              context: contextLines.join('\n'),
              contextRange: {
                start: contextStart,
                end: contextEnd,
              },
              totalLines: lines.length,
              timestamp: new Date().toISOString(),
            };
          }

          default:
            throw new Error(`Unknown command: ${input.command}`);
        }
      } catch (error) {
        logError('Text Editor Tool: Command failed', {
          operation: 'text_editor_error',
          metadata: {
            command: input.command,
            path: filePath,
          },
          error: error instanceof Error ? error : new Error(String(error)),
        });

        return {
          command: input.command,
          path: filePath,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
      }
    },
  });
}

/**
 * Resolve file path relative to base directory
 */
function resolveFilePath(path: string, baseDirectory: string): string {
  if (isAbsolute(path)) {
    return path;
  }
  return resolve(baseDirectory, path);
}

/**
 * Validate file path against security rules
 */
function validateFilePath(
  filePath: string,
  baseDirectory: string,
  deniedPatterns: RegExp[],
  allowedExtensions: string[],
) {
  // Ensure path is within base directory
  const relativePath = relative(baseDirectory, filePath);
  if (relativePath.startsWith('..')) {
    throw new Error('File path outside base directory');
  }

  // Check denied patterns
  for (const pattern of deniedPatterns) {
    if (pattern.test(filePath)) {
      throw new Error('File path matches denied pattern');
    }
  }

  // Check allowed extensions if specified
  if (allowedExtensions.length > 0) {
    const hasAllowedExtension = allowedExtensions.some(ext => filePath.endsWith(ext));
    if (!hasAllowedExtension) {
      throw new Error('File extension not allowed');
    }
  }
}

/**
 * Read file with size limit
 */
async function readFileWithLimit(filePath: string, maxSize: number): Promise<string> {
  try {
    await access(filePath);
  } catch {
    throw new Error('File not found');
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const content = await readFile(filePath, 'utf-8');

  if (content.length > maxSize) {
    throw new Error(`File too large: ${content.length} bytes (max: ${maxSize})`);
  }

  return content;
}

/**
 * Count occurrences of a string
 */
function countOccurrences(content: string, searchStr: string): number {
  // Use safer string.split approach instead of regex
  if (searchStr.length === 0) return 0;
  return content.split(searchStr).length - 1;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sandbox file operations
 */
async function sandboxReadFile(path: string): Promise<string> {
  const lines = sandboxFileCache.get(path);
  if (!lines) {
    throw new Error('File not found in sandbox');
  }
  return lines.join('\n');
}

async function sandboxWriteFile(path: string, content: string): Promise<void> {
  sandboxFileCache.set(path, content.split('\n'));
}

/**
 * Common text editor patterns
 */
export const textEditorPatterns = {
  /**
   * Find and replace across multiple files
   */
  findAndReplaceMultiple: async (
    files: string[],
    oldStr: string,
    newStr: string,
    tool: ReturnType<typeof createTextEditorTool>,
  ) => {
    const results = [];

    for (const file of files) {
      try {
        const result = await tool.execute(
          {
            command: 'str_replace_based_edit',
            path: file,
            oldStr,
            newStr,
            caseInsensitive: false,
          },
          { toolCallId: 'text-editor', messages: [] },
        );
        results.push({ file, ...result });
      } catch (error) {
        results.push({
          file,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  },

  /**
   * Extract content between markers
   */
  extractBetweenMarkers: async (
    path: string,
    startMarker: string,
    endMarker: string,
    tool: ReturnType<typeof createTextEditorTool>,
  ) => {
    const viewResult = await tool.execute(
      {
        command: 'view',
        path,
        caseInsensitive: false,
      },
      { toolCallId: 'text-editor', messages: [] },
    );

    if (!viewResult.content) {
      throw new Error('Failed to read file');
    }

    const lines = viewResult.content.split('\n');
    const extracted: string[] = [];
    let inMarker = false;

    for (const line of lines) {
      if (line.includes(startMarker)) {
        inMarker = true;
        continue;
      }
      if (line.includes(endMarker)) {
        inMarker = false;
        continue;
      }
      if (inMarker) {
        extracted.push(line);
      }
    }

    return {
      path,
      content: extracted.join('\n'),
      lineCount: extracted.length,
    };
  },

  /**
   * Insert content at specific line
   */
  insertAtLine: async (
    path: string,
    lineNumber: number,
    content: string,
    tool: ReturnType<typeof createTextEditorTool>,
  ) => {
    // First, read the file
    const viewResult = await tool.execute(
      {
        command: 'view',
        path,
        caseInsensitive: false,
      },
      { toolCallId: 'text-editor', messages: [] },
    );

    if (!viewResult.content) {
      throw new Error('Failed to read file');
    }

    const lines = viewResult.content.split('\n');

    if (lineNumber < 1 || lineNumber > lines.length + 1) {
      throw new Error(`Line number out of range: ${lineNumber}`);
    }

    // Insert content
    lines.splice(lineNumber - 1, 0, ...content.split('\n'));

    // Write back
    return await tool.execute(
      {
        command: 'create',
        path,
        content: lines.join('\n'),
        caseInsensitive: false,
      },
      { toolCallId: 'text-editor', messages: [] },
    );
  },

  /**
   * Comment/uncomment lines
   */
  toggleComments: async (
    path: string,
    startLine: number,
    endLine: number,
    commentPrefix: string,
    tool: ReturnType<typeof createTextEditorTool>,
  ) => {
    const viewResult = await tool.execute(
      {
        command: 'view',
        path,
        caseInsensitive: false,
      },
      { toolCallId: 'text-editor', messages: [] },
    );

    if (!viewResult.content) {
      throw new Error('Failed to read file');
    }

    const lines = viewResult.content.split('\n');

    for (let i = startLine - 1; i < Math.min(endLine, lines.length); i++) {
      if (lines[i].trim().startsWith(commentPrefix)) {
        // Uncomment - use safer string manipulation
        const trimmedLine = lines[i].trimStart();
        if (trimmedLine.startsWith(commentPrefix)) {
          const afterComment = trimmedLine.slice(commentPrefix.length);
          const leadingWhitespace = lines[i].match(/^\s*/)?.[0] || '';
          lines[i] =
            leadingWhitespace +
            (afterComment.startsWith(' ') ? afterComment.slice(1) : afterComment);
        }
      } else {
        // Comment
        lines[i] = `${commentPrefix} ${lines[i]}`;
      }
    }

    return await tool.execute(
      {
        command: 'create',
        path,
        content: lines.join('\n'),
        caseInsensitive: false,
      },
      { toolCallId: 'text-editor', messages: [] },
    );
  },
} as const;

/**
 * Create a secure text editor tool with strict limitations
 */
export function createSecureTextEditorTool(customConfig?: Partial<TextEditorConfig>) {
  return createTextEditorTool({
    allowCreate: false,
    allowEdit: true,
    maxFileSize: 1024 * 1024, // 1MB
    allowedExtensions: ['.txt', '.md', '.json', '.yml', '.yaml', '.xml', '.csv'],
    deniedPatterns: [
      /node_modules/,
      /\.git/,
      /\.env/,
      /\.ssh/,
      /\.aws/,
      /\.config/,
      /password/i,
      /secret/i,
      /token/i,
      /key/i,
    ],
    ...customConfig,
  });
}
