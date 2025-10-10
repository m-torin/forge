/**
 * Model Registry Adapter
 *
 * Bridges between generated Prisma Zod schemas and the model registry system.
 * Provides type-safe model configuration with automatic field detection.
 */

import type { ZodObject, ZodRawShape, ZodType } from 'zod';
import { createFormSchemaFactory, type FormAdapterConfig } from './form-adapter';

/**
 * Field type mapping from Zod to form field types
 */
export type FieldType =
  | 'string'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'enum'
  | 'json'
  | 'relation'
  | 'array';

/**
 * Form field configuration
 */
export interface FieldConfig {
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  description?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: ZodType;
}

/**
 * Model configuration for forms
 */
export interface ModelConfig {
  name: string;
  label: string;
  description?: string;
  fields: FieldConfig[];
  validation: {
    create: ZodType;
    update: ZodType;
  };
}

/**
 * Configuration for model adapter
 */
export interface ModelAdapterConfig {
  /** Custom field configurations */
  fieldOverrides?: Record<string, Partial<FieldConfig>>;
  /** Fields to exclude from forms */
  excludeFields?: string[];
  /** Custom form validation configs */
  formConfig?: {
    create?: FormAdapterConfig;
    update?: FormAdapterConfig;
  };
}

/**
 * Infers field type from Zod schema
 */
function inferFieldType(zodType: ZodType): FieldType {
  const typeName = (zodType._def as any).typeName;

  switch (typeName) {
    case 'ZodString':
      return 'string';
    case 'ZodNumber':
      return 'number';
    case 'ZodBoolean':
      return 'boolean';
    case 'ZodDate':
      return 'date';
    case 'ZodEnum':
      return 'enum';
    case 'ZodArray':
      return 'array';
    case 'ZodObject':
      return 'relation';
    case 'ZodUnknown':
    case 'ZodAny':
      // Likely JSON field based on Prisma patterns
      return 'json';
    case 'ZodOptional':
    case 'ZodNullable':
    case 'ZodDefault':
      // Unwrap and recurse
      return inferFieldType((zodType as any)._def.innerType || (zodType as any)._def.type);
    case 'ZodUnion':
      // Check if it's a nullish union (common pattern)
      const unionTypes = (zodType as any)._def.options;
      if (unionTypes.some((t: any) => t._def.typeName === 'ZodNull')) {
        const nonNullType = unionTypes.find((t: any) => t._def.typeName !== 'ZodNull');
        return nonNullType ? inferFieldType(nonNullType) : 'string';
      }
      return 'string';
    default:
      return 'string';
  }
}

/**
 * Checks if a Zod field is required
 */
function isFieldRequired(zodType: ZodType): boolean {
  const typeName = (zodType._def as any).typeName;

  // Optional, nullable, or default values are not required
  if (typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'ZodDefault') {
    return false;
  }

  // Union with null/undefined is not required
  if (typeName === 'ZodUnion') {
    const unionTypes = (zodType as any)._def.options;
    return !unionTypes.some(
      (t: any) => t._def.typeName === 'ZodNull' || t._def.typeName === 'ZodUndefined',
    );
  }

  return true;
}

/**
 * Extracts enum options from Zod enum
 */
function extractEnumOptions(zodType: ZodType): { value: string; label: string }[] | undefined {
  const typeName = (zodType._def as any).typeName;
  if (typeName === 'ZodEnum') {
    const values = (zodType as any)._def.values;
    return values.map((value: string) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replace(/_/g, ' '),
    }));
  }

  // Check wrapped enums
  if (typeName === 'ZodOptional' || typeName === 'ZodNullable') {
    return extractEnumOptions((zodType as any)._def.innerType || (zodType as any)._def.type);
  }

  return undefined;
}

/**
 * Converts field name to human-readable label
 */
function fieldNameToLabel(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/Id$/, ' ID')
    .replace(/Url$/, ' URL')
    .replace(/Api$/, ' API')
    .trim();
}

/**
 * Creates model configuration from Zod schema
 */
export function createModelConfig<T extends ZodRawShape>(
  modelName: string,
  schema: ZodObject<T>,
  config: ModelAdapterConfig = {},
): ModelConfig {
  const { fieldOverrides = {}, excludeFields = [], formConfig = {} } = config;
  const formFactory = createFormSchemaFactory(schema);

  // Extract fields from schema
  const fields: FieldConfig[] = [];

  for (const [fieldName, zodField] of Object.entries(schema.shape)) {
    // Skip excluded fields
    if (excludeFields.includes(fieldName)) {
      continue;
    }

    const fieldType = inferFieldType(zodField as ZodType);
    const isRequired = isFieldRequired(zodField as ZodType);
    const options = extractEnumOptions(zodField as ZodType);

    const baseField: FieldConfig = {
      name: fieldName,
      type: fieldType,
      label: fieldNameToLabel(fieldName),
      required: isRequired,
      validation: zodField as ZodType,
      ...(options && { options }),
    };

    // Apply field overrides
    const override = fieldOverrides[fieldName] || {};
    fields.push({ ...baseField, ...override });
  }

  return {
    name: modelName,
    label: fieldNameToLabel(modelName),
    fields,
    validation: {
      create: formFactory.create(formConfig.create),
      update: formFactory.update(formConfig.update),
    },
  };
}

/**
 * Tree-shakeable model config factory
 *
 * Usage:
 * ```typescript
 * import { createModelConfigFactory } from '@repo/db-prisma/validation/model-registry-adapter';
 * import { UserSchema } from '@repo/db-pris../../generated/zod/models/User.schema';
 *
 * export const UserModelConfig = createModelConfigFactory('User', UserSchema, {
 *   fieldOverrides: {
 *     copy: { type: 'textarea', label: 'Description' },
 *     baseUrl: { placeholder: 'https://example.com' }
 *   }
 * });
 * ```
 */
export function createModelConfigFactory<T extends ZodRawShape>(
  modelName: string,
  schema: ZodObject<T>,
  config: ModelAdapterConfig = {},
): ModelConfig {
  return createModelConfig(modelName, schema, config);
}

/**
 * Predefined common field configurations
 */
export const COMMON_FIELD_OVERRIDES = {
  name: {
    label: 'Name',
    placeholder: 'Enter name...',
    description: 'Unique name for this item',
  },
  slug: {
    label: 'URL Slug',
    placeholder: 'url-friendly-name',
    description: 'URL-friendly identifier (auto-generated from name)',
  },
  description: {
    type: 'textarea' as const,
    label: 'Description',
    placeholder: 'Enter description...',
  },
  copy: {
    type: 'json' as const,
    label: 'Content',
    description: 'Rich content data (JSON format)',
  },
  baseUrl: {
    label: 'Website URL',
    placeholder: 'https://example.com',
    description: 'Primary website URL',
  },
  displayOrder: {
    label: 'Display Order',
    description: 'Order for display in lists (lower numbers first)',
  },
} as const;

/**
 * Helper to create model config with common field patterns
 */
export function createStandardModelConfig<T extends ZodRawShape>(
  modelName: string,
  schema: ZodObject<T>,
  customOverrides: Record<string, Partial<FieldConfig>> = {},
): ModelConfig {
  return createModelConfig(modelName, schema, {
    fieldOverrides: { ...COMMON_FIELD_OVERRIDES, ...customOverrides },
    excludeFields: ['id', 'createdAt', 'updatedAt', 'deletedAt', 'deletedById'],
  });
}
