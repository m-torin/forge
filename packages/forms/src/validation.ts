'use client';

import { z } from 'zod';
import { Registry } from './types';
import { getNestedValue } from './registry';

/**
 * Creates a validator that incorporates registry relationships
 * This combines the base validator with registry-based validation
 */
export function createRegistryValidator<T>(
  baseValidator: ((values: T) => Record<string, string> | null) | undefined,
  registry: Registry<T>
) {
  return (values: T) => {
    // Run base validation if provided
    const baseErrors = baseValidator ? baseValidator(values) : null;

    // Get relationships and field visibility
    const relationships = registry.evaluateRelationships(values);
    const visibleFields = registry.getVisibleFields(values);

    // Create validation errors from relationships
    const relationshipErrors = Object.entries(relationships).reduce(
      (errors, [fieldName, result]) => {
        // Skip validation for hidden fields
        if (!visibleFields.includes(fieldName)) return errors;

        // Skip if the field isn't for validation or condition is met
        if (!result.validation || result.validation === true) return errors;

        // Get field config
        const field = registry.getField(fieldName);
        if (!field) return errors;

        // Check for required fields that are empty
        if (field.required) {
          const value = getNestedValue(values, fieldName);
          if (value === undefined || value === null || value === '') {
            errors[fieldName] = field.validation?.message || 'This field is required';
          }
        }

        return errors;
      },
      {} as Record<string, string>
    );

    // Return merged errors
    if (!baseErrors && Object.keys(relationshipErrors).length === 0) {
      return null;
    }

    return { ...baseErrors, ...relationshipErrors };
  };
}

/**
 * Creates a Zod schema from registry field configurations
 * This allows for automatic schema generation based on the registry
 */
export function createSchemaFromRegistry<T>(registry: Registry<T>): z.ZodType<T> {
  const shape = Object.entries(registry.fields).reduce(
    (schema, [fieldName, field]) => {
      // Basic validation from field config
      let fieldSchema = field.validation || z.any();

      // Apply required validation if specified
      if (field.required) {
        if (fieldSchema instanceof z.ZodString) {
          fieldSchema = fieldSchema.min(1, 'This field is required');
        } else {
          fieldSchema = z.preprocess(
            val => val === null || val === undefined ? '' : val,
            z.string().min(1, 'This field is required')
          );
        }
      }

      // Handle nested fields
      if (field.nestedFields) {
        const nestedShape = Object.entries(field.nestedFields).reduce(
          (nestedSchema, [nestedFieldName, nestedField]) => {
            let nestedFieldSchema = nestedField.validation || z.any();

            if (nestedField.required) {
              if (nestedFieldSchema instanceof z.ZodString) {
                nestedFieldSchema = nestedFieldSchema.min(1, 'This field is required');
              } else {
                nestedFieldSchema = z.preprocess(
                  val => val === null || val === undefined ? '' : val,
                  z.string().min(1, 'This field is required')
                );
              }
            }

            nestedSchema[nestedFieldName] = nestedFieldSchema;
            return nestedSchema;
          },
          {} as Record<string, z.ZodTypeAny>
        );

        fieldSchema = z.object(nestedShape);
      }

      // Handle array fields
      if (field.isArray) {
        fieldSchema = z.array(fieldSchema);
      }

      schema[fieldName] = fieldSchema;
      return schema;
    },
    {} as Record<string, z.ZodTypeAny>
  );

  return z.object(shape) as z.ZodType<T>;
}

/**
 * Creates a Zod resolver that's aware of the registry
 * This combines schema validation with registry-based validation
 */
export function createRegistryAwareZodResolver<T>(
  schema: z.ZodSchema<T>,
  registry: Registry<T>
) {
  const baseResolver = createZodResolver(schema);
  return createRegistryValidator(baseResolver, registry);
}

/**
 * Helper function to create a Zod resolver for Mantine forms
 */
export function createZodResolver<T>(schema: z.ZodSchema<T>) {
  return (values: T) => {
    try {
      schema.parse(values);
      return null;
    } catch (error: any) {
      if (error.errors) {
        return error.errors.reduce((acc: Record<string, string>, curr: any) => {
          const path = curr.path.join('.');
          acc[path] = curr.message;
          return acc;
        }, {});
      }
      return null;
    }
  };
}

/**
 * Creates a wildcard validator for array fields
 * This allows validating all items in an array with a single validator
 */
export function createWildcardValidator<T>(
  arrayPath: string,
  validator: (item: any, index: number, array: any[]) => Record<string, string> | null
) {
  return (values: T) => {
    const array = getNestedValue<any[]>(values, arrayPath);
    if (!Array.isArray(array) || array.length === 0) return null;

    const errors: Record<string, string> = {};

    array.forEach((item, index) => {
      const itemErrors = validator(item, index, array);
      if (itemErrors) {
        Object.entries(itemErrors).forEach(([field, error]) => {
          errors[`${arrayPath}.${index}.${field}`] = error;
        });
      }
    });

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

/**
 * Process a wildcard path to get the actual path
 * For example, "users.*.name" with index 2 becomes "users.2.name"
 */
export function processWildcardPath(path: string, index: number): string {
  return path.replace('*', index.toString());
}

/**
 * Validates a specific field in the form
 * This is useful for validating a single field without validating the entire form
 */
export function validateField<T>(
  values: T,
  fieldName: string,
  registry: Registry<T>,
  baseValidator?: ((values: T) => Record<string, string> | null)
): string | null {
  // Get field config
  const field = registry.getField(fieldName);
  if (!field) return null;

  // Check if field is visible
  if (!registry.isFieldVisible(fieldName, values)) return null;

  // Check if field is required and empty
  if (field.required) {
    const value = getNestedValue(values, fieldName);
    if (value === undefined || value === null || value === '') {
      return field.validation?.message || 'This field is required';
    }
  }

  // Run base validator if provided
  if (baseValidator) {
    const errors = baseValidator(values);
    if (errors && errors[fieldName]) {
      return errors[fieldName];
    }
  }

  return null;
}
