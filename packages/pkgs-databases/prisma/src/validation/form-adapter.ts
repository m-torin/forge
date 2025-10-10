/**
 * Form Validation Adapter
 *
 * Provides a bridge between generated Prisma Zod schemas and form validation needs.
 * Ensures tree-shakeable imports and type safety for form components.
 */

import type { ZodObject, ZodRawShape, ZodType, ZodTypeAny } from 'zod/v4';
import { z } from 'zod/v4';

// Re-export for convenience
export { z } from 'zod/v4';

/**
 * Configuration for form schema adaptation
 */
export interface FormAdapterConfig {
  /** Fields to exclude from form validation */
  excludeFields?: string[];
  /** Fields to make optional in forms */
  makeOptional?: string[];
  /** Custom field transformations */
  transformFields?: Record<string, ZodType>;
  /** Whether to allow partial updates */
  allowPartial?: boolean;
}

/**
 * Adapts a Prisma Zod schema for form validation
 */
export function adaptSchemaForForm<T extends ZodRawShape>(
  schema: ZodObject<T>,
  config: FormAdapterConfig = {},
): ZodObject<any> {
  const {
    excludeFields = [],
    makeOptional = [],
    transformFields = {},
    allowPartial = false,
  } = config;

  // Start with the base schema shape - cast to mutable for modifications
  let adaptedShape = { ...schema.shape } as any as Record<string, ZodTypeAny>;

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

  // Return partial schema if requested
  return allowPartial ? adaptedSchema.partial() : adaptedSchema;
}

/**
 * Common form field exclusions for create operations
 */
export const CREATE_FORM_EXCLUSIONS = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'deletedById',
] as const;

/**
 * Common form field exclusions for update operations
 */
export const UPDATE_FORM_EXCLUSIONS = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'deletedById',
] as const;

/**
 * Creates a form validation schema for create operations
 */
export function createFormSchema<T extends ZodRawShape>(
  baseSchema: ZodObject<T>,
  config: FormAdapterConfig = {},
): ZodObject<any> {
  return adaptSchemaForForm(baseSchema, {
    excludeFields: [...CREATE_FORM_EXCLUSIONS, ...(config.excludeFields || [])],
    ...config,
  });
}

/**
 * Creates a form validation schema for update operations
 */
export function updateFormSchema<T extends ZodRawShape>(
  baseSchema: ZodObject<T>,
  config: FormAdapterConfig = {},
): ZodObject<any> {
  return adaptSchemaForForm(baseSchema, {
    excludeFields: [...UPDATE_FORM_EXCLUSIONS, ...(config.excludeFields || [])],
    allowPartial: true,
    ...config,
  });
}

/**
 * Tree-shakeable form schema factory
 *
 * Usage:
 * ```typescript
 * import { createFormSchemaFactory } from '@repo/db-prisma/validation/form-adapter';
 * import { UserSchema } from '@repo/db-pris../../generated/zod/models/User.schema';
 *
 * const userFormFactory = createFormSchemaFactory(UserSchema);
 * export const UserCreateFormSchema = userFormFactory.create();
 * export const UserUpdateFormSchema = userFormFactory.update();
 * ```
 */
export function createFormSchemaFactory<T extends ZodRawShape>(baseSchema: ZodObject<T>) {
  return {
    /**
     * Generate create form schema
     */
    create: (config: FormAdapterConfig = {}) => createFormSchema(baseSchema, config),

    /**
     * Generate update form schema
     */
    update: (config: FormAdapterConfig = {}) => updateFormSchema(baseSchema, config),

    /**
     * Generate custom form schema
     */
    custom: (config: FormAdapterConfig) => adaptSchemaForForm(baseSchema, config),
  };
}

/**
 * Utility type to extract form type from schema
 */
export type FormTypeFromSchema<T extends ZodType> = z.infer<T>;

/**
 * Type-safe form data validator
 */
export function validateFormData<T extends ZodType>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

/**
 * JSON field transformation helper for forms
 * Converts JSON objects to strings for form inputs and validates on parse
 */
export const jsonFieldTransform = z
  .string()
  .transform(val => {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  })
  .refine(val => {
    try {
      if (typeof val === 'string') {
        JSON.parse(val);
      }
      return true;
    } catch {
      return false;
    }
  }, 'Invalid JSON format');

/**
 * Slug field transformation for auto-generation
 */
export const slugFieldTransform = z
  .string()
  .min(1, 'Slug is required')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
  .max(100, 'Slug must be less than 100 characters');
