/**
 * Validation utilities for working with Prisma-generated Zod schemas
 * These utilities provide helpers for form validation and data processing
 */

import { z } from 'zod/v4';

/**
 * Create a form-specific schema by extending a base schema with overrides
 * Useful for adding custom validation rules or making fields optional for forms
 *
 * @example
 * ```typescript
 * const formSchema = createFormSchema(ProductCreateInputSchema, {
 *   slug: z.string().regex(/^[a-z0-9-]+$/),
 *   description: z.string().optional()
 * });
 * ```
 */
export function createFormSchema<T extends z.ZodType>(
  schema: T,
  overrides?: Record<string, z.ZodType>,
): z.ZodType {
  if (!overrides) return schema;

  // If schema has an extend method, use it
  if ('extend' in schema && typeof schema.extend === 'function') {
    return (schema as any).extend(overrides);
  }

  // Otherwise create a new object schema
  return z.object({
    ...(schema as any).shape,
    ...overrides,
  });
}

/**
 * Validate form data against a schema and return a typed result
 *
 * @example
 * ```typescript
 * const result = validateFormData(ProductCreateInputSchema, formData);
 * if (result.success) {
 *   await createProduct(result.data);
 * } else {
 *   showErrors(result.errors);
 * }
 * ```
 */
export function validateFormData<T extends z.ZodType>(
  schema: T,
  data: unknown,
): {
  success: boolean;
  data?: z.infer<T>;
  errors?: z.ZodError;
  formattedErrors?: Record<string, string[]>;
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  // Format errors for easy display in forms
  const formattedErrors: Record<string, string[]> = {};
  result.error.issues.forEach((error: any) => {
    const path = error.path.join('.');
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(error.message);
  });

  return {
    success: false,
    errors: result.error,
    formattedErrors,
  };
}

/**
 * Pick specific fields from a schema (useful for partial forms)
 *
 * @example
 * ```typescript
 * const basicInfoSchema = pickSchemaFields(ProductCreateInputSchema, [
 *   'name', 'slug', 'description'
 * ]);
 * ```
 */
export function pickSchemaFields<T extends z.ZodObject<any>>(
  schema: T,
  fields: Array<keyof z.infer<T>>,
): z.ZodObject<Pick<T['shape'], (typeof fields)[number]>> {
  const pickedShape: any = {};
  fields.forEach(field => {
    if (schema.shape[field]) {
      pickedShape[field] = schema.shape[field];
    }
  });
  return z.object(pickedShape) as z.ZodObject<Pick<T['shape'], (typeof fields)[number]>>;
}

/**
 * Make all fields in a schema optional (useful for update operations)
 *
 * @example
 * ```typescript
 * const updateSchema = makeSchemaOptional(ProductCreateInputSchema);
 * ```
 */
export function makeSchemaOptional<T extends z.ZodObject<any>>(
  schema: T,
): z.ZodObject<{ [K in keyof T['shape']]: z.ZodOptional<T['shape'][K]> }> {
  const optionalShape: any = {};
  Object.keys(schema.shape).forEach(key => {
    optionalShape[key] = schema.shape[key].optional();
  });
  return z.object(optionalShape) as z.ZodObject<{
    [K in keyof T['shape']]: z.ZodOptional<T['shape'][K]>;
  }>;
}

/**
 * Transform form data to match database schema expectations
 * Handles common transformations like empty strings to null
 *
 * @example
 * ```typescript
 * const dbData = transformFormToDatabase(formData, {
 *   emptyStringsToNull: true,
 *   trimStrings: true
 * });
 * ```
 */
export function transformFormToDatabase(
  data: Record<string, any>,
  options: {
    emptyStringsToNull?: boolean;
    trimStrings?: boolean;
    removeUndefined?: boolean;
  } = {},
): Record<string, any> {
  const transformed: Record<string, any> = {};

  Object.entries(data).forEach(([key, value]) => {
    // Skip undefined values if requested
    if (options.removeUndefined && value === undefined) {
      return;
    }

    // Handle string transformations
    if (typeof value === 'string') {
      let processedValue = value;

      if (options.trimStrings) {
        processedValue = processedValue.trim();
      }

      if (options.emptyStringsToNull && processedValue === '') {
        transformed[key] = null;
      } else {
        transformed[key] = processedValue;
      }
    } else {
      transformed[key] = value;
    }
  });

  return transformed;
}

/**
 * Create a validation function that can be used with Mantine's useForm
 *
 * @example
 * ```typescript
 * const form = useForm({
 *   validate: createMantineValidator(ProductCreateInputSchema)
 * });
 * ```
 */
export function createMantineValidator<T extends z.ZodType>(
  schema: T,
): (values: unknown) => Record<string, string> {
  return (values: unknown) => {
    const result = validateFormData(schema, values);
    if (result.success) return {};

    // Convert to Mantine's expected format (single error per field)
    const errors: Record<string, string> = {};
    if (result.formattedErrors) {
      Object.entries(result.formattedErrors).forEach(([path, messages]) => {
        errors[path] = messages[0]; // Mantine expects a single string per field
      });
    }

    return errors;
  };
}
