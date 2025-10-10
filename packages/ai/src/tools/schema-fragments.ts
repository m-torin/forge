import { z } from 'zod/v3';

/**
 * Reusable schema fragments - Maximum DRY for common patterns
 * These eliminate repetition across tool schemas
 */

// Single fields used everywhere
const timestamp = z.string().optional().describe('ISO timestamp');
const userId = z.string().optional().describe('User ID');
const limit = z.number().optional().default(10).describe('Maximum results');
const offset = z.number().optional().default(0).describe('Result offset');
const filters = z.record(z.string(), z.any()).optional().describe('Query filters');

// Common enums
const priority = z.enum(['low', 'normal', 'high']).optional().default('normal');
const sortOrder = z.enum(['asc', 'desc']).optional().default('asc');
const httpMethod = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET');
const timeRange = z.enum(['day', 'week', 'month', 'year', 'all']).optional().default('all');

// Geographic and location schemas
const latitude = z.number().min(-90).max(90).describe('Latitude coordinate');
const longitude = z.number().min(-180).max(180).describe('Longitude coordinate');
const location = z.string().describe('Location or place name');
const coordinates = z.object({
  latitude,
  longitude,
});

// Content and text schemas
const content = z.string().describe('Content to process');
const title = z.string().describe('Title or name');
const query = z.string().describe('Search query');
const id = z.string().describe('Unique identifier');
const metadata = z.record(z.string(), z.any()).optional().describe('Additional metadata');

// Complex reusable patterns
const emailRecipient = z
  .union([z.string().email(), z.array(z.string().email())])
  .describe('Recipient email(s)');

const paginatedQuery = z.object({
  limit,
  offset,
  sortBy: z.string().optional().describe('Field to sort by'),
  sortOrder,
});

const searchQuery = z.object({
  query,
  limit,
  filters,
});

// Schema builders for common patterns
function createIdSchema(resourceName: string) {
  return z.object({
    [`${resourceName}Id`]: z.string().describe(`${resourceName} identifier`),
  });
}

function createCRUDSchema(resource: string) {
  return {
    create: z.object({
      data: z.record(z.string(), z.any()).describe(`${resource} data to create`),
    }),
    read: z.object({
      id: z.string().describe(`${resource} ID`),
      include: z.array(z.string()).optional().describe('Related data to include'),
    }),
    update: z.object({
      id: z.string().describe(`${resource} ID`),
      data: z.record(z.string(), z.any()).describe('Data to update'),
    }),
    delete: z.object({
      id: z.string().describe(`${resource} ID to delete`),
    }),
    list: paginatedQuery.extend({
      filters: z.record(z.string(), z.any()).optional().describe(`${resource} filters`),
    }),
  };
}

// Tool-specific schema combinations
const webSearchSchema = z.object({
  query,
  maxResults: limit.default(5),
  timeRange,
  region: z.string().optional().describe('Geographic region'),
});

const databaseQuerySchema = z.object({
  table: z.string().describe('Table to query'),
  operation: z.enum(['find', 'count', 'search']).describe('Operation type'),
  filters,
  limit,
});

const emailSchema = z.object({
  to: emailRecipient,
  subject: title,
  body: content,
  template: z.string().optional().describe('Email template'),
  priority,
});

const fileOperationSchema = z.object({
  operation: z.enum(['read', 'write', 'list', 'exists', 'delete']),
  path: z.string().describe('File or directory path'),
  content: content.optional(),
  encoding: z.string().optional().default('utf8'),
});

const httpRequestSchema = z.object({
  url: z.string().url().describe('Request URL'),
  method: httpMethod,
  headers: z.record(z.string(), z.string()).optional().describe('Request headers'),
  body: content.optional().describe('Request body (JSON string)'),
  timeout: z.number().optional().default(10000).describe('Request timeout in ms'),
});

const analyticsEventSchema = z.object({
  event: z.string().describe('Event name'),
  userId,
  properties: z.record(z.string(), z.any()).optional().describe('Event properties'),
  timestamp,
});

const authCheckSchema = z.object({
  userId: z.string().describe('User ID to check'),
  permission: z.string().optional().describe('Permission to check'),
  resource: z.string().optional().describe('Resource to check permission for'),
});

/**
 * Schema utilities for AI SDK best practices
 * Light standardization for common compatibility and validation issues
 */
export const schemaPromptEngineering = {
  // Date field helper for common pattern from prompt engineering docs
  dateField: (description?: string) =>
    z
      .string()
      .date()
      .describe(description || 'Date in YYYY-MM-DD format')
      .transform(value => new Date(value)),

  // Semantic naming validator for tool names
  validateToolName: (name: string) => {
    // Simple check for descriptive names
    const isDescriptive = name.length >= 4 && /^[a-z]+[A-Z]/.test(name);
    return {
      isValid: isDescriptive,
      suggestion: isDescriptive
        ? null
        : 'Use descriptive camelCase names (e.g. "searchDatabase", "sendEmail")',
    };
  },
};

/**
 * Export all schemas as a single object for easy access
 */
export const schemas = {
  // Single fields
  timestamp,
  userId,
  limit,
  offset,
  filters,
  priority,
  sortOrder,
  httpMethod,
  timeRange,
  emailRecipient,

  // Geographic and location fields
  latitude,
  longitude,
  location,
  coordinates,

  // Content and text fields
  content,
  title,
  query,
  id,
  metadata,

  // Composite schemas
  paginatedQuery,
  searchQuery,
  webSearch: webSearchSchema,
  databaseQuery: databaseQuerySchema,
  email: emailSchema,
  fileOperation: fileOperationSchema,
  httpRequest: httpRequestSchema,
  analyticsEvent: analyticsEventSchema,
  authCheck: authCheckSchema,

  // Builders
  createIdSchema,
  createCRUDSchema,

  // Schema utilities
  schemaPromptEngineering,
};
