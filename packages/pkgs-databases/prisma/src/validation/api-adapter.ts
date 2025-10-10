/**
 * API Validation Adapter
 *
 * Provides type-safe validation for API endpoints using generated Prisma Zod schemas.
 * Ensures tree-shakeable imports and runtime validation for server actions.
 */

import type { ZodObject, ZodRawShape, ZodType } from 'zod';
import { z } from 'zod';

// Re-export for convenience
export { z } from 'zod';

/**
 * API validation result
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]>; message: string };

/**
 * Validates data against a Zod schema with formatted error messages
 */
export function validateApiData<T extends ZodType>(
  schema: T,
  data: unknown,
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format errors for API consumption
  const formattedErrors: Record<string, string[]> = {};
  const errorMessages: string[] = [];

  for (const error of result.error.issues) {
    const path = error.path.join('.');
    const field = path || 'root';

    if (!formattedErrors[field]) {
      formattedErrors[field] = [];
    }

    formattedErrors[field].push(error.message);
    errorMessages.push(`${field}: ${error.message}`);
  }

  return {
    success: false,
    errors: formattedErrors,
    message: `Validation failed: ${errorMessages.join(', ')}`,
  };
}

/**
 * Configuration for API schema adaptation
 */
export interface ApiAdapterConfig {
  /** Fields to exclude from API validation */
  excludeFields?: string[];
  /** Fields to make optional for updates */
  makeOptional?: string[];
  /** Custom field transformations */
  transformFields?: Record<string, ZodType>;
  /** Whether to strip unknown fields */
  strict?: boolean;
}

/**
 * Adapts a Prisma Zod schema for API validation
 */
export function adaptSchemaForApi<T extends ZodRawShape>(
  schema: ZodObject<T>,
  config: ApiAdapterConfig = {},
): ZodObject<any> {
  const { excludeFields = [], makeOptional = [], transformFields = {}, strict = true } = config;

  // Start with the base schema shape - cast to mutable for modifications
  let adaptedShape = { ...schema.shape } as any;

  // Remove excluded fields
  for (const field of excludeFields) {
    if (field in adaptedShape) {
      delete adaptedShape[field];
    }
  }

  // Apply custom field transformations
  for (const [field, transformation] of Object.entries(transformFields)) {
    if (field in adaptedShape) {
      adaptedShape[field] = transformation;
    }
  }

  // Make specified fields optional
  for (const field of makeOptional) {
    if (field in adaptedShape) {
      adaptedShape[field] = adaptedShape[field].optional();
    }
  }

  // Create the adapted schema
  const adaptedSchema = z.object(adaptedShape);

  return strict ? adaptedSchema.strict() : adaptedSchema.passthrough();
}

/**
 * Common API field exclusions for create operations
 */
export const API_CREATE_EXCLUSIONS = ['id', 'createdAt', 'updatedAt'] as const;

/**
 * Common API field exclusions for update operations
 */
export const API_UPDATE_EXCLUSIONS = ['id', 'createdAt', 'updatedAt'] as const;

/**
 * Creates an API validation schema for create operations
 */
export function createApiSchema<T extends ZodRawShape>(
  baseSchema: ZodObject<T>,
  config: ApiAdapterConfig = {},
): ZodObject<any> {
  return adaptSchemaForApi(baseSchema, {
    excludeFields: [...API_CREATE_EXCLUSIONS, ...(config.excludeFields || [])],
    ...config,
  });
}

/**
 * Creates an API validation schema for update operations
 */
export function updateApiSchema<T extends ZodRawShape>(
  baseSchema: ZodObject<T>,
  config: ApiAdapterConfig = {},
): ZodObject<any> {
  const allOptionalFields = Object.keys(baseSchema.shape);

  return adaptSchemaForApi(baseSchema, {
    excludeFields: [...API_UPDATE_EXCLUSIONS, ...(config.excludeFields || [])],
    makeOptional: [...allOptionalFields, ...(config.makeOptional || [])],
    ...config,
  });
}

/**
 * Tree-shakeable API schema factory
 *
 * Usage:
 * ```typescript
 * import { createApiSchemaFactory } from '@repo/db-prisma/validation/api-adapter';
 * import { UserSchema } from '@repo/db-pris../../generated/zod/models/User.schema';
 *
 * const userApiFactory = createApiSchemaFactory(UserSchema);
 * export const UserCreateApiSchema = userApiFactory.create();
 * export const UserUpdateApiSchema = userApiFactory.update();
 * ```
 */
export function createApiSchemaFactory<T extends ZodRawShape>(baseSchema: ZodObject<T>) {
  return {
    /**
     * Generate create API schema
     */
    create: (config: ApiAdapterConfig = {}) => createApiSchema(baseSchema, config),

    /**
     * Generate update API schema
     */
    update: (config: ApiAdapterConfig = {}) => updateApiSchema(baseSchema, config),

    /**
     * Generate custom API schema
     */
    custom: (config: ApiAdapterConfig) => adaptSchemaForApi(baseSchema, config),
  };
}

/**
 * Server action validation wrapper
 */
export function createValidatedServerAction<TInput extends ZodType, TOutput>(
  inputSchema: TInput,
  handler: (data: z.infer<TInput>) => Promise<TOutput>,
) {
  return async (rawData: unknown): Promise<ValidationResult<TOutput>> => {
    // Validate input
    const validation = validateApiData(inputSchema, rawData);

    if (!validation.success) {
      return validation;
    }

    try {
      // Execute handler with validated data
      const result = await handler(validation.data);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        errors: { server: ['Internal server error'] },
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  };
}

/**
 * JSON field validation for APIs
 * More strict than form validation
 */
export const apiJsonFieldValidation = z
  .unknown()
  .refine(val => {
    try {
      if (typeof val === 'string') {
        JSON.parse(val);
      }
      return true;
    } catch {
      return false;
    }
  }, 'Must be valid JSON')
  .transform(val => {
    if (typeof val === 'string') {
      return JSON.parse(val);
    }
    return val;
  });

/**
 * Pagination schema for API endpoints
 */
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
  search: z.string().optional(),
  orderBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Standard API response wrapper
 */
export const apiResponseSchema = <T extends ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    pagination: z
      .object({
        page: z.number(),
        pageSize: z.number(),
        total: z.number(),
        totalPages: z.number(),
      })
      .optional(),
  });

/**
 * Utility to create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationParams & { total: number },
) {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrevious: pagination.page > 1,
    },
  };
}
