import { Prisma } from '../../../../prisma-generated/client';

// Use Prisma types for validation instead of generated Zod schemas

//==============================================================================
// VALIDATION RESULT TYPES
//==============================================================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error; message: string };

export type ValidationOptions = {
  throwOnError?: boolean;
  includeStackTrace?: boolean;
};

//==============================================================================
// CORE VALIDATION FUNCTIONS
//==============================================================================

/**
 * Validates input data using Prisma type guards
 */
export function validatePrismaInput<T>(
  data: unknown,
  typeGuard: (input: any) => input is T,
  typeName: string,
  options: ValidationOptions = {},
): ValidationResult<T> {
  const { throwOnError = false } = options;

  if (typeGuard(data)) {
    return { success: true, data };
  }

  const message = `Input does not match expected Prisma type: ${typeName}`;

  if (throwOnError) {
    throw new Error(`Validation failed: ${message}`);
  }

  return {
    success: false,
    error: new Error(message) as any,
    message,
  };
}

/**
 * Basic type guard for objects
 */
export function isObject(data: unknown): data is Record<string, any> {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
}

/**
 * Type guard for non-null objects with required fields
 */
export function hasRequiredFields(data: unknown, fields: string[]): boolean {
  if (!isObject(data)) return false;
  return fields.every(field => field in data && data[field] !== undefined);
}

//==============================================================================
// MODEL-SPECIFIC VALIDATION FUNCTIONS
//==============================================================================

// Type guards for Prisma input types
export function isProductCreateInput(data: unknown): data is Prisma.ProductCreateInput {
  return isObject(data) && hasRequiredFields(data, ['name', 'slug']);
}

export function isProductUpdateInput(data: unknown): data is Prisma.ProductUpdateInput {
  return isObject(data);
}

export function isProductWhereUniqueInput(data: unknown): data is Prisma.ProductWhereUniqueInput {
  return (
    isObject(data) &&
    ('id' in data ||
      'slug' in data ||
      ('productCategory' in data && 'slug' in (data as any).productCategory))
  );
}

export function isBrandCreateInput(data: unknown): data is Prisma.BrandCreateInput {
  return isObject(data) && hasRequiredFields(data, ['name', 'slug']);
}

export function isBrandUpdateInput(data: unknown): data is Prisma.BrandUpdateInput {
  return isObject(data);
}

export function isBrandWhereUniqueInput(data: unknown): data is Prisma.BrandWhereUniqueInput {
  return isObject(data) && ('id' in data || 'slug' in data);
}

export function isCollectionCreateInput(data: unknown): data is Prisma.CollectionCreateInput {
  return isObject(data) && hasRequiredFields(data, ['name', 'slug']);
}

export function isCollectionUpdateInput(data: unknown): data is Prisma.CollectionUpdateInput {
  return isObject(data);
}

export function isCollectionWhereUniqueInput(
  data: unknown,
): data is Prisma.CollectionWhereUniqueInput {
  return isObject(data) && ('id' in data || 'slug' in data);
}

export function isProductCategoryCreateInput(
  data: unknown,
): data is Prisma.ProductCategoryCreateInput {
  return isObject(data) && hasRequiredFields(data, ['name', 'slug']);
}

export function isProductCategoryUpdateInput(
  data: unknown,
): data is Prisma.ProductCategoryUpdateInput {
  return isObject(data);
}

export function isProductCategoryWhereUniqueInput(
  data: unknown,
): data is Prisma.ProductCategoryWhereUniqueInput {
  return isObject(data) && ('id' in data || 'slug' in data);
}

// Validation functions using Prisma types
export function validateProductCreate(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(data, isProductCreateInput, 'ProductCreateInput', options);
}

export function validateProductUpdate(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(data, isProductUpdateInput, 'ProductUpdateInput', options);
}

export function validateProductWhere(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(data, isProductWhereUniqueInput, 'ProductWhereUniqueInput', options);
}

export function validateBrandCreate(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(data, isBrandCreateInput, 'BrandCreateInput', options);
}

export function validateBrandUpdate(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(data, isBrandUpdateInput, 'BrandUpdateInput', options);
}

export function validateBrandWhere(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(data, isBrandWhereUniqueInput, 'BrandWhereUniqueInput', options);
}

export function validateCollectionCreate(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(data, isCollectionCreateInput, 'CollectionCreateInput', options);
}

export function validateCollectionUpdate(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(data, isCollectionUpdateInput, 'CollectionUpdateInput', options);
}

export function validateCollectionWhere(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(
    data,
    isCollectionWhereUniqueInput,
    'CollectionWhereUniqueInput',
    options,
  );
}

export function validateProductCategoryCreate(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(
    data,
    isProductCategoryCreateInput,
    'ProductCategoryCreateInput',
    options,
  );
}

export function validateProductCategoryUpdate(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(
    data,
    isProductCategoryUpdateInput,
    'ProductCategoryUpdateInput',
    options,
  );
}

export function validateProductCategoryWhere(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(
    data,
    isProductCategoryWhereUniqueInput,
    'ProductCategoryWhereUniqueInput',
    options,
  );
}

//==============================================================================
// VALIDATED ORM WRAPPER FUNCTIONS
//==============================================================================

/**
 * Creates a type-safe wrapper around ORM functions with automatic validation
 */
export function createValidatedOrmFunction<TInput, TResult>(
  typeGuard: (input: unknown) => input is TInput,
  typeName: string,
  ormFunction: (validatedInput: TInput) => Promise<TResult>,
) {
  return async (input: unknown, options?: ValidationOptions): Promise<TResult> => {
    const validation = validatePrismaInput(input, typeGuard, typeName, options);

    if (!validation.success) {
      throw new Error(`ORM Input Validation Failed: ${validation.message}`);
    }

    return ormFunction(validation.data);
  };
}

//==============================================================================
// PRISMA TYPE UTILITIES
//==============================================================================

/**
 * Type-safe wrapper for Prisma model operations
 */
export type PrismaOperation<_TModel, TArgs, TResult> = (args: TArgs) => Promise<TResult>;

/**
 * Type guard for unique constraint errors
 */
export function isUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError & { code: 'P2002' } {
  return isPrismaError(error) && error.code === 'P2002';
}

/**
 * Type guard for foreign key constraint errors
 */
export function isForeignKeyConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError & { code: 'P2003' } {
  return isPrismaError(error) && error.code === 'P2003';
}

/**
 * Type guard for validation errors
 */
export function isValidationError(error: unknown): error is Prisma.PrismaClientValidationError {
  return error instanceof Prisma.PrismaClientValidationError;
}

/**
 * Extract field names from unique constraint error
 */
export function getUniqueConstraintFields(error: Prisma.PrismaClientKnownRequestError): string[] {
  if (error.code === 'P2002' && error.meta?.target) {
    return error.meta.target as string[];
  }
  return [];
}

/**
 * Create a formatted error message based on Prisma error type
 */
export function formatPrismaError(error: unknown): string {
  if (isUniqueConstraintError(error)) {
    const fields = getUniqueConstraintFields(error);
    return `A record with this ${fields.join(' and ')} already exists`;
  }

  if (isNotFoundError(error)) {
    return 'The requested record was not found';
  }

  if (isForeignKeyConstraintError(error)) {
    const field = (error.meta?.field_name as string) || 'reference';
    return `Invalid ${field}: the referenced record does not exist`;
  }

  if (isValidationError(error)) {
    return 'Invalid data provided';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Enhanced return type for ORM functions with proper Prisma typing
 */
export type OrmResult<T> = T extends Prisma.PrismaPromise<infer U> ? U : T;

/**
 * Utility type for basic includes (simplified)
 */
export type WithIncludes<T, I> = T & { include: I };

/**
 * Utility type for basic selects (simplified)
 */
export type WithSelect<T, S> = T & { select: S };

//==============================================================================
// PRISMA ARGS VALIDATION HELPERS
//==============================================================================

/**
 * Type-safe Prisma operation wrapper
 */
export function createTypedOrmFunction<TArgs extends Record<string, unknown>, TResult>(
  operation: (args: TArgs) => Promise<TResult>,
  options?: {
    validateArgs?: (args: unknown) => args is TArgs;
    transformResult?: (result: TResult) => TResult;
  },
) {
  return async (args: TArgs): Promise<TResult> => {
    if (options?.validateArgs && !options.validateArgs(args)) {
      throw new Error('Invalid arguments provided to ORM function');
    }

    const result = await operation(args);
    return options?.transformResult ? options.transformResult(result) : result;
  };
}

/**
 * Validates Prisma query arguments using appropriate schemas
 */
export function validatePrismaArgs<T extends Record<string, unknown>>(
  args: T,
  _modelName: string,
  _operation: 'create' | 'update' | 'where' | 'findMany' | 'aggregate',
): ValidationResult<T> {
  // For now, we'll implement basic validation
  // This can be extended to use specific schemas based on model and operation

  if (!args || typeof args !== 'object') {
    return {
      success: false,
      error: new Error('Arguments must be an object'),
      message: 'Arguments must be an object',
    };
  }

  // Basic validation passed
  return { success: true, data: args };
}

/**
 * Type guard for Prisma error types
 */
export function isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Error && 'code' in error && typeof (error as any).code === 'string';
}

/**
 * Type guard for Prisma not found errors
 */
export function isNotFoundError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError & { code: 'P2025' } {
  return isPrismaError(error) && error.code === 'P2025';
}

/**
 * Handle Prisma errors with type safety
 */
export function handlePrismaError(error: unknown): never {
  if (isPrismaError(error)) {
    switch (error.code) {
      case 'P2025':
        throw new Error(`Record not found: ${error.message}`);
      case 'P2002': {
        // Extract field name from meta if available
        const target = (error.meta?.target as string[])?.join(', ') || 'unknown field';
        throw new Error(`Unique constraint violation on ${target}: ${error.message}`);
      }
      case 'P2003': {
        // Extract field name from meta if available
        const field = (error.meta?.field_name as string) || 'unknown field';
        throw new Error(`Foreign key constraint violation on ${field}: ${error.message}`);
      }
      case 'P2014':
        throw new Error(`Related record required: ${error.message}`);
      case 'P2016':
        throw new Error(`Query interpretation error: ${error.message}`);
      case 'P2021':
        throw new Error(`Table does not exist: ${error.message}`);
      case 'P2022':
        throw new Error(`Column does not exist: ${error.message}`);
      case 'P2024':
        throw new Error(`Timed out fetching connection from pool: ${error.message}`);
      case 'P2034':
        throw new Error(`Transaction conflict, please retry: ${error.message}`);
      default:
        throw new Error(`Database error [${error.code}]: ${error.message}`);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new Error(`Validation error: ${error.message}`);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new Error(`Failed to initialize database connection: ${error.message}`);
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    throw new Error(`Database client error: ${error.message}`);
  }

  throw error;
}

//==============================================================================
// JSON FIELD VALIDATION HELPERS
//==============================================================================

/**
 * Type guards for JSON field structures
 */
export interface CopyContent {
  title?: string;
  description?: string;
  shortDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  alternativeTitles?: string[];
}

export interface ProductAttributes {
  color?: string;
  size?: string;
  material?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit?: 'mm' | 'cm' | 'm' | 'in' | 'ft';
  };
  tags?: string[];
  features?: string[];
  specifications?: Record<string, unknown>;
}

export interface PhysicalProperties {
  weight?: {
    value: number;
    unit?: 'g' | 'kg' | 'lb' | 'oz';
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit?: 'mm' | 'cm' | 'm' | 'in' | 'ft';
  };
  volume?: {
    value: number;
    unit?: 'ml' | 'l' | 'fl_oz' | 'qt' | 'gal';
  };
  fragile?: boolean;
  hazardous?: boolean;
  temperatureRange?: {
    min: number;
    max: number;
    unit?: 'C' | 'F';
  };
}

// Type guards for JSON structures
export function isCopyContent(data: unknown): data is CopyContent {
  if (!isObject(data)) return false;
  // Basic validation - all fields are optional
  return true;
}

export function isProductAttributes(data: unknown): data is ProductAttributes {
  if (!isObject(data)) return false;
  // Basic validation - all fields are optional
  return true;
}

export function isPhysicalProperties(data: unknown): data is PhysicalProperties {
  if (!isObject(data)) return false;
  // Basic validation - all fields are optional
  return true;
}

// JSON field validation functions
export function validateCopyContent(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(data, isCopyContent, 'CopyContent', options);
}

export function validateProductAttributes(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(data, isProductAttributes, 'ProductAttributes', options);
}

export function validatePhysicalProperties(data: unknown, options?: ValidationOptions) {
  return validatePrismaInput(data, isPhysicalProperties, 'PhysicalProperties', options);
}

//==============================================================================
// PRISMA TYPE VALIDATORS USING PRISMA.VALIDATOR
//==============================================================================

/**
 * Create type-safe select validators for any model
 * These ensure compile-time type safety for select objects
 */
export function createSelectValidator<TSelect>() {
  return Prisma.validator<TSelect>();
}

/**
 * Create type-safe include validators for any model
 * These ensure compile-time type safety for include objects
 */
export function createIncludeValidator<TInclude>() {
  return Prisma.validator<TInclude>();
}

/**
 * Create type-safe where validators for any model
 * These ensure compile-time type safety for where conditions
 */
export function createWhereValidator<TWhere>() {
  return Prisma.validator<TWhere>();
}

/**
 * Create type-safe orderBy validators for any model
 * These ensure compile-time type safety for orderBy conditions
 */
export function createOrderByValidator<TOrderBy>() {
  return Prisma.validator<TOrderBy>();
}

/**
 * Type-safe args validator for any Prisma operation
 * Use this to validate complex query arguments
 */
export function createArgsValidator<TArgs>() {
  return Prisma.validator<TArgs>();
}

//==============================================================================
// ENHANCED PRISMA QUERY BUILDERS
//==============================================================================

/**
 * Build a type-safe where condition with validation
 * @example
 * const whereCondition = buildWhereCondition({
 *   email: { contains: '@example.com' },
 *   isActive: true
 * });
 */
export function buildWhereCondition<T extends Record<string, any>>(conditions: T): T {
  // Simple passthrough - Prisma will validate at runtime
  return conditions;
}

/**
 * Build a type-safe select object with validation
 * @example
 * const selectFields = buildSelectObject({
 *   id: true,
 *   email: true,
 *   profile: { select: { bio: true } }
 * });
 */
export function buildSelectObject<T extends Record<string, any>>(fields: T): T {
  // Simple passthrough - Prisma will validate at runtime
  return fields;
}

/**
 * Build a type-safe include object with validation
 * @example
 * const includeRelations = buildIncludeObject({
 *   posts: { where: { published: true } },
 *   profile: true
 * });
 */
export function buildIncludeObject<T extends Record<string, any>>(relations: T): T {
  // Simple passthrough - Prisma will validate at runtime
  return relations;
}

//==============================================================================
// TRANSACTION HELPERS WITH TYPE SAFETY
//==============================================================================

/**
 * Type-safe transaction wrapper with automatic retry logic
 * Handles P2034 (transaction conflict) errors automatically
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 100,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Only retry on transaction conflicts
      if (isPrismaError(error) && error.code === 'P2034' && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

/**
 * Type-safe batch operation with validation
 * Ensures all operations in a batch are properly typed
 */
export function createBatchOperation<T extends Prisma.PrismaPromise<any>[]>(operations: T): T {
  return operations;
}

//==============================================================================
// ADVANCED TYPE UTILITIES
//==============================================================================

/**
 * Extract the payload type from a Prisma operation
 * Useful for deriving types from complex queries
 */
export type ExtractPayload<T> = T extends (...args: any[]) => Promise<infer U> ? U : never;

/**
 * Type-safe result wrapper for ORM operations
 * Provides consistent error handling and typing
 */
export type SafeOrmResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Wrap ORM operations in a safe result type
 * Catches and formats errors consistently
 */
export async function safeOrmOperation<T>(operation: () => Promise<T>): Promise<SafeOrmResult<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const message = formatPrismaError(error);
    const code = isPrismaError(error) ? error.code : undefined;
    return { success: false, error: message, code };
  }
}
