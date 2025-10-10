/**
 * Validation Adapters - Tree-shakeable exports
 *
 * Import only what you need to keep bundle sizes minimal:
 *
 * For forms:
 * ```typescript
 * import { createFormSchemaFactory } from '@repo/db-prisma/validation/form-adapter';
 * ```
 *
 * For model registry:
 * ```typescript
 * import { createStandardModelConfig } from '@repo/db-prisma/validation/model-registry-adapter';
 * ```
 *
 * For APIs:
 * ```typescript
 * import { createApiSchemaFactory, validateApiData } from '@repo/db-prisma/validation/api-adapter';
 * ```
 */

// Form validation exports
export type { FormAdapterConfig, FormTypeFromSchema } from './form-adapter';

export {
  CREATE_FORM_EXCLUSIONS,
  UPDATE_FORM_EXCLUSIONS,
  adaptSchemaForForm,
  createFormSchema,
  createFormSchemaFactory,
  jsonFieldTransform,
  slugFieldTransform,
  updateFormSchema,
  validateFormData,
} from './form-adapter';

// Model registry exports
export type {
  FieldConfig,
  FieldType,
  ModelAdapterConfig,
  ModelConfig,
} from './model-registry-adapter';

export {
  COMMON_FIELD_OVERRIDES,
  createModelConfig,
  createModelConfigFactory,
  createStandardModelConfig,
} from './model-registry-adapter';

// API validation exports
export type { ApiAdapterConfig, PaginationParams, ValidationResult } from './api-adapter';

export {
  API_CREATE_EXCLUSIONS,
  API_UPDATE_EXCLUSIONS,
  adaptSchemaForApi,
  apiJsonFieldValidation,
  apiResponseSchema,
  createApiSchema,
  createApiSchemaFactory,
  createPaginatedResponse,
  createValidatedServerAction,
  paginationSchema,
  updateApiSchema,
  validateApiData,
} from './api-adapter';

// Re-export zod for convenience
export { z } from 'zod';
