import { tool as aiTool, type CoreTool } from 'ai';
import { z } from 'zod/v4';

/**
 * Standard tool specifications following Vercel AI SDK patterns
 * These can be used across different applications for consistency
 */

// Common parameter schemas
export const ToolSchemas = {
  // File operations
  filePath: z.string().describe('File path (absolute or relative)'),
  fileContent: z.string().describe('File content'),
  encoding: z.enum(['utf8', 'base64', 'hex']).optional().default('utf8'),

  // Search operations
  query: z.string().describe('Search query'),
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),

  // Location
  latitude: z.number().min(-90).max(90).describe('Latitude coordinate'),
  longitude: z.number().min(-180).max(180).describe('Longitude coordinate'),

  // Document operations
  documentId: z.string().describe('Document identifier'),
  title: z.string().describe('Document title'),
  content: z.string().describe('Document content'),
  metadata: z.record(z.string(), z.any()).optional().describe('Additional metadata'),

  // Time operations
  startDate: z.string().datetime().optional().describe('Start date in ISO format'),
  endDate: z.string().datetime().optional().describe('End date in ISO format'),
  timezone: z.string().optional().default('UTC').describe('Timezone'),
} as const;

/**
 * Standard tool specifications
 */
export const ToolSpecifications = {
  // Weather tool specification
  weather: {
    name: 'getWeather',
    description: 'Get current weather information for a location',
    parameters: z.object({
      latitude: ToolSchemas.latitude,
      longitude: ToolSchemas.longitude,
      units: z.enum(['celsius', 'fahrenheit']).optional().default('celsius'),
    }),
    response: z.object({
      temperature: z.number(),
      unit: z.string(),
      description: z.string(),
      humidity: z.number().optional(),
      windSpeed: z.number().optional(),
      precipitation: z.number().optional(),
    }),
  },

  // Document creation specification
  createDocument: {
    name: 'createDocument',
    description: 'Create a new document with title and content',
    parameters: z.object({
      title: ToolSchemas.title,
      content: ToolSchemas.content,
      metadata: ToolSchemas.metadata,
      path: z.string().optional().describe('Optional file path for saving'),
    }),
    response: z.object({
      id: z.string(),
      title: z.string(),
      createdAt: z.string().datetime(),
      path: z.string().optional(),
    }),
  },

  // Document update specification
  updateDocument: {
    name: 'updateDocument',
    description: 'Update an existing document',
    parameters: z.object({
      id: ToolSchemas.documentId,
      title: ToolSchemas.title.optional(),
      content: ToolSchemas.content.optional(),
      metadata: ToolSchemas.metadata,
    }),
    response: z.object({
      id: z.string(),
      title: z.string(),
      updatedAt: z.string().datetime(),
      version: z.number(),
    }),
  },

  // Search specification
  searchKnowledge: {
    name: 'searchKnowledge',
    description: 'Search knowledge base for relevant information',
    parameters: z.object({
      query: ToolSchemas.query,
      limit: ToolSchemas.limit,
      filters: z
        .object({
          category: z.string().optional(),
          tags: z.array(z.string()).optional(),
          dateRange: z
            .object({
              start: ToolSchemas.startDate,
              end: ToolSchemas.endDate,
            })
            .optional(),
        })
        .optional(),
    }),
    response: z.object({
      results: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          content: z.string(),
          score: z.number(),
          metadata: z.record(z.string(), z.any()),
        }),
      ),
      totalCount: z.number(),
      query: z.string(),
    }),
  },

  // File read specification
  readFile: {
    name: 'readFile',
    description: 'Read contents of a file',
    parameters: z.object({
      path: ToolSchemas.filePath,
      encoding: ToolSchemas.encoding,
    }),
    response: z.object({
      content: z.string(),
      path: z.string(),
      size: z.number(),
      encoding: z.string(),
    }),
  },

  // File write specification
  writeFile: {
    name: 'writeFile',
    description: 'Write content to a file',
    parameters: z.object({
      path: ToolSchemas.filePath,
      content: ToolSchemas.fileContent,
      encoding: ToolSchemas.encoding,
      createDirectories: z.boolean().optional().default(true),
    }),
    response: z.object({
      path: z.string(),
      size: z.number(),
      created: z.boolean(),
    }),
  },

  // Web search specification
  webSearch: {
    name: 'webSearch',
    description: 'Search the web for information',
    parameters: z.object({
      query: ToolSchemas.query,
      limit: ToolSchemas.limit,
      safeSearch: z.boolean().optional().default(true),
      language: z.string().optional().default('en'),
    }),
    response: z.object({
      results: z.array(
        z.object({
          title: z.string(),
          url: z.string(),
          snippet: z.string(),
          domain: z.string(),
        }),
      ),
      query: z.string(),
      totalResults: z.number().optional(),
    }),
  },

  // Code execution specification (secure)
  executeCode: {
    name: 'executeCode',
    description: 'Execute code in a sandboxed environment',
    parameters: z.object({
      language: z.enum(['javascript', 'python', 'typescript', 'bash']),
      code: z.string(),
      timeout: z.number().optional().default(5000),
      env: z.record(z.string(), z.string()).optional(),
    }),
    response: z.object({
      output: z.string(),
      error: z.string().optional(),
      exitCode: z.number(),
      duration: z.number(),
    }),
  },
} as const;

/**
 * Create a tool from specification
 */
export function createToolFromSpec<T extends keyof typeof ToolSpecifications>(
  specName: T,
  implementation: {
    execute: (
      params: z.infer<(typeof ToolSpecifications)[T]['parameters']>,
    ) => Promise<z.infer<(typeof ToolSpecifications)[T]['response']>>;
    middleware?: Array<(params: any, next: () => Promise<any>) => Promise<any>>;
  },
): CoreTool<
  (typeof ToolSpecifications)[T]['parameters'],
  z.infer<(typeof ToolSpecifications)[T]['response']>
> {
  const spec = ToolSpecifications[specName];

  return aiTool({
    description: spec.description,
    parameters: spec.parameters,
    execute: async params => {
      // Apply middleware if provided
      if (implementation.middleware && implementation.middleware.length > 0) {
        let index = 0;
        const next = async (): Promise<any> => {
          if (implementation.middleware && index < implementation.middleware.length) {
            const middleware = implementation.middleware[index++];
            return middleware(params, next);
          }
          return implementation.execute(params as any) as any;
        };
        return next();
      }

      return implementation.execute(params as any) as any;
    },
  });
}

/**
 * Validate tool response against specification
 */
export function validateToolResponse<T extends keyof typeof ToolSpecifications>(
  specName: T,
  response: unknown,
): z.infer<(typeof ToolSpecifications)[T]['response']> {
  const spec = ToolSpecifications[specName];
  return spec.response.parse(response) as any;
}

/**
 * Get tool specification
 */
export function getToolSpec<T extends keyof typeof ToolSpecifications>(
  specName: T,
): (typeof ToolSpecifications)[T] {
  return ToolSpecifications[specName];
}
