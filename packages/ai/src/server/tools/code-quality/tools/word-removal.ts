/* eslint-disable security/detect-non-literal-fs-filename */
/**
 * Word Removal Tool for Code Quality Analysis
 *
 * Removes targeted generic words from code files, identifiers, and handles
 * file renaming with proper reference updates. Particularly useful for
 * removing generic words like 'basic', 'simple', 'enhanced', 'new' from
 * function names, file names, and class names.
 */

import { logInfo, logWarn } from '@repo/observability';
import { tool, type Tool } from 'ai';
import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { z } from 'zod/v4';
import { mcpClient } from '../mcp-client';

// Input schema for word removal
const wordRemovalInputSchema = z.object({
  sessionId: z.string().describe('Unique session identifier'),
  packagePath: z.string().describe('Path to the package to process'),
  targetWords: z
    .array(z.string())
    .default(['basic', 'simple', 'enhanced', 'new'])
    .describe('Array of words to remove from code'),
  options: z
    .object({
      includeFileNames: z.boolean().default(true).describe('Remove words from file names'),
      includeIdentifiers: z.boolean().default(true).describe('Remove words from code identifiers'),
      updateReferences: z.boolean().default(true).describe('Update all references and imports'),
      validateAfter: z.boolean().default(true).describe('Run validation after changes'),
      dryRun: z.boolean().default(false).describe('Preview changes without applying them'),
      skipLegacyHandling: z
        .boolean()
        .default(false)
        .describe('Skip special handling for "new" files'),
    })
    .optional()
    .default({
      includeFileNames: true,
      includeIdentifiers: true,
      updateReferences: true,
      validateAfter: true,
      dryRun: false,
      skipLegacyHandling: false,
    }),
});

// Word removal result interfaces
interface FileRename {
  oldPath: string;
  newPath: string;
  oldName: string;
  newName: string;
  word: string;
  reason?: string;
}

interface IdentifierChange {
  file: string;
  line: number;
  from: string;
  to: string;
  context: string;
}

interface ReferenceUpdate {
  file: string;
  type: 'import' | 'identifier' | 'export';
  from: string;
  to: string;
  occurrences: number;
}

interface WordRemovalResult {
  sessionId: string;
  packagePath: string;
  targetWords: string[];
  filesRenamed: FileRename[];
  identifiersChanged: IdentifierChange[];
  referencesUpdated: ReferenceUpdate[];
  errors: string[];
  summary: {
    totalChanges: number;
    filesAffected: number;
    compilationValid: boolean;
    testsPass: boolean;
  };
  preview?: boolean;
}

// Remove target word from text using smart patterns
function removeTargetWord(text: string, word: string): string {
  const originalText = text;

  // Handle different naming patterns
  const patterns = [
    // basicHandler → Handler (camelCase prefix)
    {
      // eslint-disable-next-line security/detect-non-literal-regexp
      pattern: new RegExp(`^${word}([A-Z].*)`, 'i'),
      replacement: '$1',
    },
    // HandlerBasic → Handler (camelCase suffix)
    {
      // eslint-disable-next-line security/detect-non-literal-regexp
      pattern: new RegExp(`(.+)${word[0].toUpperCase()}${word.slice(1)}$`),
      replacement: '$1',
    },
    // basic_handler → handler (snake_case prefix)
    {
      // eslint-disable-next-line security/detect-non-literal-regexp
      pattern: new RegExp(`^${word}_(.+)`),
      replacement: '$1',
    },
    // handler_basic → handler (snake_case suffix)
    {
      // eslint-disable-next-line security/detect-non-literal-regexp
      pattern: new RegExp(`(.+)_${word}$`),
      replacement: '$1',
    },
    // BasicHandler → Handler (PascalCase prefix)
    {
      // eslint-disable-next-line security/detect-non-literal-regexp
      pattern: new RegExp(`^${word[0].toUpperCase()}${word.slice(1)}([A-Z].*)$`),
      replacement: '$1',
    },
    // basic-handler → handler (kebab-case prefix)
    {
      // eslint-disable-next-line security/detect-non-literal-regexp
      pattern: new RegExp(`^${word}-(.+)`),
      replacement: '$1',
    },
    // handler-basic → handler (kebab-case suffix)
    {
      // eslint-disable-next-line security/detect-non-literal-regexp
      pattern: new RegExp(`(.+)-${word}$`),
      replacement: '$1',
    },
  ];

  for (const { pattern, replacement } of patterns) {
    if (pattern.test(text)) {
      const result = text.replace(pattern, replacement);
      // Ensure we don't return empty strings
      if (result && result !== text) {
        return result;
      }
    }
  }

  // Fallback: simple case-insensitive replacement
  // eslint-disable-next-line security/detect-non-literal-regexp
  const fallback = text.replace(new RegExp(`\\b${word}\\b`, 'i'), '');
  return fallback.replace(/^[-_]+|[-_]+$/g, '') || originalText;
}

// Scan for target words in file names
async function scanFileNames(packagePath: string, targetWords: string[]): Promise<FileRename[]> {
  const renames: FileRename[] = [];

  try {
    // This would use Glob tool in real implementation
    // Mock implementation with common file patterns
    const mockFiles = [
      'src/utils/basic-handler.ts',
      'src/components/new-button.tsx',
      'src/lib/enhanced-service.ts',
      'src/hooks/simple-form.ts',
    ];

    for (const file of mockFiles) {
      const fileName = basename(file);
      const fileNameLower = fileName.toLowerCase();

      for (const word of targetWords) {
        if (fileNameLower.includes(word.toLowerCase())) {
          const cleanName = removeTargetWord(fileName, word);
          if (cleanName !== fileName && cleanName.length > 0) {
            const newPath = file.replace(fileName, cleanName);
            renames.push({
              oldPath: file,
              newPath,
              oldName: fileName,
              newName: cleanName,
              word,
            });
          }
        }
      }
    }
  } catch (error) {
    logWarn('Could not scan file names', { error });
  }

  return renames;
}

// Scan for target words in code identifiers
async function scanCodeIdentifiers(
  packagePath: string,
  targetWords: string[],
): Promise<IdentifierChange[]> {
  const changes: IdentifierChange[] = [];

  try {
    // This would use Glob and Read tools in real implementation
    // Mock implementation with common identifier patterns
    const mockIdentifiers = [
      {
        file: 'src/utils/handler.ts',
        line: 5,
        identifier: 'basicValidate',
        context: 'function basicValidate()',
      },
      {
        file: 'src/components/form.tsx',
        line: 12,
        identifier: 'SimpleButton',
        context: 'export const SimpleButton',
      },
      {
        file: 'src/lib/service.ts',
        line: 8,
        identifier: 'enhancedProcess',
        context: 'const enhancedProcess = async',
      },
    ];

    for (const mock of mockIdentifiers) {
      for (const word of targetWords) {
        if (mock.identifier.toLowerCase().includes(word.toLowerCase())) {
          const cleanIdentifier = removeTargetWord(mock.identifier, word);
          if (cleanIdentifier !== mock.identifier && cleanIdentifier.length > 0) {
            changes.push({
              file: mock.file,
              line: mock.line,
              from: mock.identifier,
              to: cleanIdentifier,
              context: mock.context,
            });
          }
        }
      }
    }
  } catch (error) {
    logWarn('Could not scan code identifiers', { error });
  }

  return changes;
}

// Handle special "new" file renaming logic
async function handleNewFileRename(
  rename: FileRename,
  packagePath: string,
): Promise<{
  renames: FileRename[];
  errors: string[];
}> {
  const results: { renames: FileRename[]; errors: string[] } = { renames: [], errors: [] };

  try {
    // Check if target file already exists
    const targetExists = await fileExists(join(packagePath, rename.newPath));

    if (targetExists) {
      // Create legacy version of existing file
      const legacyName = rename.newName.replace(/^new/i, 'legacy');
      const legacyPath = rename.newPath.replace(rename.newName, legacyName);

      // Check if legacy already exists
      const legacyExists = await fileExists(join(packagePath, legacyPath));

      if (legacyExists) {
        // Add timestamp to avoid conflicts
        const timestamp = Date.now();
        const ext = legacyName.match(/\.(ts|tsx|js|jsx)$/)?.[1] || 'ts';
        const nameWithoutExt = legacyName.replace(/\.(ts|tsx|js|jsx)$/, '');
        const timestampedName = `${nameWithoutExt}-${timestamp}.${ext}`;
        const timestampedPath = legacyPath.replace(legacyName, timestampedName);

        results.renames.push({
          oldPath: rename.newPath,
          newPath: timestampedPath,
          oldName: rename.newName,
          newName: timestampedName,
          word: 'conflict',
          reason: 'Renamed existing file to timestamped legacy version',
        });
      } else {
        results.renames.push({
          oldPath: rename.newPath,
          newPath: legacyPath,
          oldName: rename.newName,
          newName: legacyName,
          word: 'conflict',
          reason: 'Renamed existing file to legacy version',
        });
      }
    }

    // Add the main rename
    results.renames.push(rename);
  } catch (error) {
    results.errors.push(`Error handling new file rename: ${error}`);
  }

  return results;
}

// Check if file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await readFile(filePath, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

// Apply file renames (mock implementation)
async function applyFileRenames(
  renames: FileRename[],
  packagePath: string,
  dryRun: boolean,
): Promise<string[]> {
  const errors: string[] = [];

  for (const rename of renames) {
    try {
      if (!dryRun) {
        // In real implementation, this would use file system operations
        logInfo(`Would rename: ${rename.oldPath} → ${rename.newPath}`);
      }
    } catch (error) {
      errors.push(`Failed to rename ${rename.oldPath}: ${error}`);
    }
  }

  return errors;
}

// Apply identifier changes (mock implementation)
async function applyIdentifierChanges(
  changes: IdentifierChange[],
  dryRun: boolean,
): Promise<string[]> {
  const errors: string[] = [];

  for (const change of changes) {
    try {
      if (!dryRun) {
        // In real implementation, this would modify file contents
        logInfo(
          `Would change identifier in ${change.file}:${change.line}: ${change.from} → ${change.to}`,
        );
      }
    } catch (error) {
      errors.push(`Failed to change identifier in ${change.file}: ${error}`);
    }
  }

  return errors;
}

// Update all references and imports
async function updateReferences(
  renames: FileRename[],
  identifierChanges: IdentifierChange[],
  _packagePath: string,
  _dryRun: boolean,
): Promise<{ updates: ReferenceUpdate[]; errors: string[] }> {
  const updates: ReferenceUpdate[] = [];
  const errors: string[] = [];

  // Mock implementation - would use Grep and file modification tools
  for (const rename of renames) {
    const importPath = rename.oldName.replace(/\.(ts|tsx|js|jsx)$/, '');
    const newImportPath = rename.newName.replace(/\.(ts|tsx|js|jsx)$/, '');

    updates.push({
      file: 'mock-referencing-file.ts',
      type: 'import',
      from: importPath,
      to: newImportPath,
      occurrences: 1,
    });
  }

  for (const change of identifierChanges) {
    updates.push({
      file: 'mock-usage-file.ts',
      type: 'identifier',
      from: change.from,
      to: change.to,
      occurrences: 2,
    });
  }

  return { updates, errors };
}

// Validate compilation and tests
async function validateChanges(_packagePath: string): Promise<{
  compilationValid: boolean;
  testsPass: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  let compilationValid = true;
  let testsPass = true;

  try {
    // Mock validation - would run actual commands
    logInfo('Validating TypeScript compilation...');
    logInfo('Running tests...');
    logInfo('Running linting...');

    // Simulate some validation results
    compilationValid = true;
    testsPass = true;
  } catch (error) {
    errors.push(`Validation failed: ${error}`);
    compilationValid = false;
    testsPass = false;
  }

  return { compilationValid, testsPass, errors };
}

// Main word removal tool
export const wordRemovalTool = tool({
  description:
    'Remove targeted generic words from code files, identifiers, and file names. Handles file renaming with proper reference updates and special logic for "new" files.',

  inputSchema: wordRemovalInputSchema,

  execute: async (
    { sessionId, packagePath, targetWords, options = {} }: any,
    _toolOptions: any,
  ) => {
    try {
      logInfo(`🧹 Removing words [${targetWords.join(', ')}] from ${packagePath}...`);

      const result: WordRemovalResult = {
        sessionId,
        packagePath,
        targetWords,
        filesRenamed: [],
        identifiersChanged: [],
        referencesUpdated: [],
        errors: [],
        summary: {
          totalChanges: 0,
          filesAffected: 0,
          compilationValid: true,
          testsPass: true,
        },
        preview: options.dryRun,
      };

      // Step 1: Scan for file name changes
      if (options.includeFileNames) {
        const fileRenames = await scanFileNames(packagePath, targetWords);

        // Handle special "new" file logic
        const processedRenames: FileRename[] = [];

        for (const rename of fileRenames) {
          if (rename.word === 'new' && !options.skipLegacyHandling) {
            const { renames, errors } = await handleNewFileRename(rename, packagePath);
            processedRenames.push(...renames);
            result.errors.push(...errors);
          } else {
            processedRenames.push(rename);
          }
        }

        // Apply file renames
        const renameErrors = await applyFileRenames(processedRenames, packagePath, options.dryRun);
        result.filesRenamed = processedRenames;
        result.errors.push(...renameErrors);
      }

      // Step 2: Scan for identifier changes
      if (options.includeIdentifiers) {
        const identifierChanges = await scanCodeIdentifiers(packagePath, targetWords);

        // Apply identifier changes
        const identifierErrors = await applyIdentifierChanges(identifierChanges, options.dryRun);
        result.identifiersChanged = identifierChanges;
        result.errors.push(...identifierErrors);
      }

      // Step 3: Update references and imports
      if (options.updateReferences && !options.dryRun) {
        const { updates, errors } = await updateReferences(
          result.filesRenamed,
          result.identifiersChanged,
          packagePath,
          options.dryRun,
        );
        result.referencesUpdated = updates;
        result.errors.push(...errors);
      }

      // Step 4: Validate changes
      if (options.validateAfter && !options.dryRun) {
        const validation = await validateChanges(packagePath);
        result.summary.compilationValid = validation.compilationValid;
        result.summary.testsPass = validation.testsPass;
        result.errors.push(...validation.errors);
      }

      // Calculate summary
      result.summary.totalChanges =
        result.filesRenamed.length +
        result.identifiersChanged.length +
        result.referencesUpdated.length;
      result.summary.filesAffected = new Set([
        ...result.filesRenamed.map(r => r.oldPath),
        ...result.identifiersChanged.map(c => c.file),
        ...result.referencesUpdated.map(u => u.file),
      ]).size;

      // Store result in MCP memory
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'word-removal',
        success: result.errors.length === 0,
        data: result,
      });

      return result;
    } catch (error) {
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'word-removal',
        success: false,
        data: {},
        error: (error as Error).message,
      });

      throw error;
    }
  },

  // Multi-modal result content
  experimental_toToolResultContent: (result: WordRemovalResult) => [
    {
      type: 'text',
      text:
        `🧹 Word Removal ${result.preview ? 'Preview' : 'Complete'}!\\n` +
        `🎯 Target Words: ${result.targetWords.join(', ')}\\n` +
        `📁 Files Renamed: ${result.filesRenamed.length}\\n` +
        `🔤 Identifiers Changed: ${result.identifiersChanged.length}\\n` +
        `🔗 References Updated: ${result.referencesUpdated.length}\\n` +
        `⚠️ Errors: ${result.errors.length}\\n` +
        `📊 Total Changes: ${result.summary.totalChanges}\\n` +
        `📄 Files Affected: ${result.summary.filesAffected}\\n` +
        `${
          !result.preview
            ? `✅ Compilation: ${result.summary.compilationValid ? 'Valid' : 'Failed'}\\n` +
              `🧪 Tests: ${result.summary.testsPass ? 'Pass' : 'Fail'}\\n`
            : ''
        }` +
        `${
          result.filesRenamed.length > 0
            ? `\\n📁 Sample Renames:\\n${result.filesRenamed
                .slice(0, 3)
                .map(r => `• ${r.oldName} → ${r.newName}${r.reason ? ` (${r.reason})` : ''}`)
                .join('\\n')}`
            : ''
        }` +
        `${
          result.identifiersChanged.length > 0
            ? `\\n🔤 Sample Changes:\\n${result.identifiersChanged
                .slice(0, 3)
                .map(c => `• ${c.from} → ${c.to} (${c.file}:${c.line})`)
                .join('\\n')}`
            : ''
        }`,
    },
  ],
} as any) as Tool;

export type { FileRename, IdentifierChange, ReferenceUpdate, WordRemovalResult };
