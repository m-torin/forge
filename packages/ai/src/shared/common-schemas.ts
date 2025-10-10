/**
 * Common Zod schemas used across the package
 * Centralized location for reusable validation patterns
 */
import { z } from 'zod/v3';

/**
 * Basic reusable schemas for common data types
 */
export const commonSchemas = {
  // Identifiers
  id: z.string().uuid().describe('Unique identifier'),
  slug: z.string().min(1).max(100).describe('URL-friendly identifier'),

  // Text content
  title: z.string().min(1).max(200).describe('Title or name'),
  description: z.string().min(1).max(1000).describe('Description or details'),
  content: z.string().min(1).describe('Main content'),

  // Search and pagination
  query: z.string().min(1).max(500).describe('Search query'),
  limit: z.number().int().min(1).max(100).default(10).describe('Maximum results'),
  offset: z.number().int().min(0).default(0).describe('Results offset'),
  page: z.number().int().min(1).default(1).describe('Page number'),

  // Coordinates and location
  latitude: z.number().min(-90).max(90).describe('Latitude coordinate'),
  longitude: z.number().min(-180).max(180).describe('Longitude coordinate'),
  location: z.string().min(1).max(100).describe('Location name or address'),

  // Time and dates
  timestamp: z.string().datetime().describe('ISO 8601 timestamp'),
  dateString: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe('Date in YYYY-MM-DD format'),

  // URLs and files
  url: z.string().url().describe('Valid HTTP/HTTPS URL'),
  email: z.string().email().describe('Valid email address'),
  filename: z.string().min(1).max(255).describe('File name'),
  mimeType: z
    .string()
    .regex(/^[a-z-]+\/[a-z0-9\-\+\.]+$/i)
    .describe('MIME type'),

  // Common enums
  sortOrder: z.enum(['asc', 'desc']).default('asc').describe('Sort order'),
  status: z.enum(['active', 'inactive', 'pending']).describe('Status'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).describe('Priority level'),

  // AI-specific
  temperature: z.number().min(0).max(2).default(0.7).describe('AI temperature setting'),
  maxOutputTokens: z.number().int().min(1).max(100000).describe('Maximum tokens to generate'),
  model: z.string().min(1).describe('AI model identifier'),

  // Language and locale
  language: z.string().min(2).max(5).describe('Language code (e.g., en, en-US)'),
  currency: z.string().length(3).describe('Currency code (ISO 4217)'),

  // Common validation patterns
  hexColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
    .describe('Hex color code'),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/)
    .describe('Phone number'),
  zipCode: z
    .string()
    .regex(/^[\d\-\s]+$/)
    .describe('Postal/ZIP code'),

  // Array helpers
  stringArray: z.array(z.string()).describe('Array of strings'),
  numberArray: z.array(z.number()).describe('Array of numbers'),
  tagArray: z.array(z.string().min(1).max(50)).describe('Array of tags'),
} as const;

/**
 * Composite schemas built from common patterns
 */
export const compositeSchemas = {
  // Pagination
  pagination: z.object({
    limit: commonSchemas.limit,
    offset: commonSchemas.offset,
    page: commonSchemas.page,
  }),

  // Search with pagination
  searchQuery: z.object({
    query: commonSchemas.query,
    limit: commonSchemas.limit,
    offset: commonSchemas.offset,
  }),

  // Location coordinates
  coordinates: z.object({
    latitude: commonSchemas.latitude,
    longitude: commonSchemas.longitude,
  }),

  // Basic metadata
  metadata: z.object({
    id: commonSchemas.id,
    title: commonSchemas.title,
    description: commonSchemas.description.optional(),
    createdAt: commonSchemas.timestamp,
    updatedAt: commonSchemas.timestamp,
  }),

  // File information
  fileInfo: z.object({
    filename: commonSchemas.filename,
    mimeType: commonSchemas.mimeType,
    size: z.number().int().min(0).describe('File size in bytes'),
    url: commonSchemas.url.optional(),
  }),

  // AI generation parameters
  aiParameters: z.object({
    temperature: commonSchemas.temperature,
    maxOutputTokens: commonSchemas.maxOutputTokens,
    model: commonSchemas.model,
  }),
} as const;

/**
 * Utility function to create optional versions of schemas using ES2023 arrow function
 */
export const makeOptional = <T extends z.ZodTypeAny>(schema: T): z.ZodOptional<T> =>
  schema.optional();

/**
 * Utility function to create array versions of schemas using ES2023 arrow function
 */
export const makeArray = <T extends z.ZodTypeAny>(schema: T): z.ZodArray<T> => z.array(schema);

/**
 * Utility to extend schemas with additional properties using ES2023 arrow function
 */
export const extendSchema = <T extends z.ZodRawShape, U extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>,
  extensions: U,
) => baseSchema.extend(extensions);

/**
 * Type helpers for extracting schema types
 */
type CommonSchemaTypes = {
  [K in keyof typeof commonSchemas]: z.infer<(typeof commonSchemas)[K]>;
};

type CompositeSchemaTypes = {
  [K in keyof typeof compositeSchemas]: z.infer<(typeof compositeSchemas)[K]>;
};
