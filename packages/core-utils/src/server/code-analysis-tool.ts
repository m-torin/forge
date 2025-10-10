/**
 * MCP Tools for Code Analysis
 */

import type { MCPToolResponse } from '../types/mcp';
import {
  calculateComplexity,
  extractExports,
  extractFileMetadata,
  extractImports,
} from './code-analysis';
import { ok, runTool } from './tool-helpers';
import { validateFilePath } from './validation';

export interface ExtractImportsArgs {
  content: string;
}

export interface ExtractExportsArgs {
  content: string;
}

export interface CalculateComplexityArgs {
  content: string;
}

export interface ExtractFileMetadataArgs {
  filePath: string;
  content: string;
}

/**
 * Extract imports from code content
 */
export const extractImportsTool = {
  name: 'extract_imports',
  description: 'Extract import statements from code content',
  inputSchema: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'The code content to analyze',
      },
    },
    required: ['content'],
  },

  async execute(args: ExtractImportsArgs): Promise<MCPToolResponse> {
    return runTool('extract_imports', 'extract', async () => {
      const imports = await extractImports(args.content);
      return ok({ imports });
    });
  },
};

/**
 * Extract exports from code content
 */
export const extractExportsTool = {
  name: 'extract_exports',
  description: 'Extract export statements from code content',
  inputSchema: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'The code content to analyze',
      },
    },
    required: ['content'],
  },

  async execute(args: ExtractExportsArgs): Promise<MCPToolResponse> {
    return runTool('extract_exports', 'extract', async () => {
      const exports = await extractExports(args.content);
      return ok({ exports });
    });
  },
};

/**
 * Calculate code complexity
 */
export const calculateComplexityTool = {
  name: 'calculate_complexity',
  description: 'Calculate cyclomatic complexity of code',
  inputSchema: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'The code content to analyze',
      },
    },
    required: ['content'],
  },

  async execute(args: CalculateComplexityArgs): Promise<MCPToolResponse> {
    return runTool('calculate_complexity', 'calculate', async () => {
      const complexity = await calculateComplexity(args.content);
      return ok({ complexity });
    });
  },
};

/**
 * Extract comprehensive file metadata
 */
export const extractFileMetadataTool = {
  name: 'extract_file_metadata',
  description: 'Extract comprehensive metadata from a file',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'The file path',
      },
      content: {
        type: 'string',
        description: 'The file content',
      },
    },
    required: ['filePath', 'content'],
  },

  async execute(args: ExtractFileMetadataArgs): Promise<MCPToolResponse> {
    return runTool('extract_file_metadata', 'extract', async () => {
      // Validate file path if provided
      if (args.filePath) {
        const pathValidation = validateFilePath(args.filePath, [process.cwd()]);
        if (!pathValidation.isValid) {
          throw new Error(`Invalid file path: ${pathValidation.error}`);
        }
      }
      const metadata = await extractFileMetadata(args.filePath, args.content);
      return ok(metadata);
    });
  },
};
