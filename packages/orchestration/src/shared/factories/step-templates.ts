/**
 * Modern Workflow Step Templates (ES2022+)
 *
 * Pre-built step templates using functional composition, pipeline utilities,
 * and modern JavaScript features for common operations like HTTP requests,
 * database operations, file processing, notifications, and data transformations.
 */

import { z } from 'zod';

import { OrchestrationError } from '../utils/errors';

import {
  createWorkflowStep,
  type StepExecutionConfig,
  type StepExecutionContext,
  type StepExecutionResult,
  type StepValidationConfig,
  type WorkflowStepDefinition,
} from './step-factory';

// Modern utility types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type ContentType = 'application/json' | 'text/plain' | 'application/octet-stream';
type NotificationType = 'email' | 'sms' | 'push' | 'webhook' | 'slack';
type Priority = 'low' | 'normal' | 'high' | 'urgent';

// ===== HTTP REQUEST STEP TEMPLATES =====

/**
 * Input schema for HTTP request steps (enhanced with modern validation)
 */
export const HttpRequestInputSchema = z
  .object({
    url: z.string().url('Must be a valid URL'),
    body: z.any().optional(),
    cache: z.enum(['default', 'no-store', 'reload', 'no-cache', 'force-cache']).optional(),
    credentials: z.enum(['omit', 'same-origin', 'include']).optional(),
    followRedirects: z.boolean().default(true),
    headers: z.record(z.string()).optional(),
    maxRedirects: z.number().nonnegative().default(5),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']).default('GET'),
    mode: z.enum(['cors', 'no-cors', 'same-origin']).optional(),
    retryStatusCodes: z.array(z.number()).default([408, 429, 500, 502, 503, 504]),
    // Modern additions
    signal: z.custom<AbortSignal>().optional(),
    timeout: z.number().positive().default(30000),
  })
  .refine(
    (data) => {
      // Custom validation using nullish coalescing
      const hasBody = data.body != null;
      const isBodyMethod = ['PATCH', 'POST', 'PUT'].includes(data.method);
      return !hasBody || isBodyMethod;
    },
    { message: 'Body can only be provided with POST, PUT, or PATCH methods' },
  );

/**
 * Output schema for HTTP request steps (enhanced)
 */
export const HttpRequestOutputSchema = z.object({
  type: z.enum(['basic', 'cors', 'error', 'opaque', 'opaqueredirect']).optional(),
  url: z.string(),
  cached: z.boolean().optional(),
  data: z.any(),
  duration: z.number(),
  headers: z.record(z.string()),
  // Modern additions
  redirected: z.boolean().optional(),
  size: z.number().optional(),
  status: z.number(),
  statusText: z.string(),
});

export type HttpRequestInput = z.infer<typeof HttpRequestInputSchema>;
export type HttpRequestOutput = z.infer<typeof HttpRequestOutputSchema>;

// HTTP request utilities using functional programming
const createHeaders =
  (baseHeaders: Record<string, string> = {}) =>
  (additionalHeaders: Record<string, string> = {}) => ({ ...baseHeaders, ...additionalHeaders });

const parseContentType = (contentType: string): ContentType => {
  if (contentType.includes('application/json')) return 'application/json';
  if (contentType.includes('text/')) return 'text/plain';
  return 'application/octet-stream';
};

const parseResponseData = async (response: Response): Promise<any> => {
  const contentType = response.headers.get('content-type') ?? '';
  const type = parseContentType(contentType);

  switch (type) {
    case 'application/json':
      return response.json();
    case 'text/plain':
      return response.text();
    default:
      return response.arrayBuffer();
  }
};

/**
 * Create an HTTP request step using modern functional patterns
 */
export function createHttpRequestStep(
  name: string,
  description?: string,
  customConfig?: {
    executionConfig?: StepExecutionConfig;
    validationConfig?: StepValidationConfig<HttpRequestInput, HttpRequestOutput>;
    baseHeaders?: Record<string, string>;
    interceptors?: {
      request?: (input: HttpRequestInput) => HttpRequestInput | Promise<HttpRequestInput>;
      response?: (output: HttpRequestOutput) => HttpRequestOutput | Promise<HttpRequestOutput>;
    };
  },
): WorkflowStepDefinition<HttpRequestInput, HttpRequestOutput> {
  return createWorkflowStep(
    {
      name,
      category: 'http',
      description: description || `HTTP request step: ${name}`,
      tags: ['http', 'request', 'api'],
      version: '1.0.0',
    },
    async (
      context: StepExecutionContext<HttpRequestInput>,
    ): Promise<StepExecutionResult<HttpRequestOutput>> => {
      const { abortSignal, input } = context;
      const startTime = Date.now();

      try {
        // Apply request interceptor if provided
        const processedInput = customConfig?.interceptors?.request
          ? await customConfig.interceptors.request(input)
          : input;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), processedInput.timeout);

        // Combine abort signals using modern approach
        const signals = [controller.signal, abortSignal, processedInput.signal].filter(Boolean);
        if (signals.length > 1) {
          // Use AbortSignal.any if available (newer browsers), otherwise manual combination
          const combinedSignal = (AbortSignal as any).any?.(signals) ?? controller.signal;
          if (!AbortSignal.any && abortSignal) {
            abortSignal.addEventListener('abort', () => controller.abort());
          }
        }

        // Create headers using functional approach
        const createHeadersFn = createHeaders(customConfig?.baseHeaders);
        const headers = createHeadersFn(processedInput.headers);

        const response = await fetch(processedInput.url, {
          body: processedInput.body ? JSON.stringify(processedInput.body) : undefined,
          cache: processedInput.cache,
          credentials: processedInput.credentials,
          headers,
          method: processedInput.method,
          mode: processedInput.mode,
          redirect: processedInput.followRedirects ? 'follow' : 'manual',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const duration = Date.now() - startTime;

        // Parse response data using functional approach
        const data = await parseResponseData(response);

        // Report progress
        await context.reportProgress?.(80, 100, 'Processing response');

        let output: HttpRequestOutput = {
          type: response.type as any,
          url: response.url,
          data,
          duration,
          headers: Object.fromEntries(response.headers.entries()),
          redirected: response.redirected,
          size: parseInt(response.headers.get('content-length') ?? '0') || undefined,
          status: response.status,
          statusText: response.statusText,
        };

        // Apply response interceptor if provided
        if (customConfig?.interceptors?.response) {
          output = await customConfig.interceptors.response(output);
        }

        await context.reportProgress?.(100, 100, 'Request completed');

        // Check if status code indicates failure (using nullish coalescing)
        if (!response.ok) {
          const shouldRetry = processedInput.retryStatusCodes.includes(response.status);
          return {
            error: {
              code: 'HTTP_REQUEST_ERROR' as const,
              details: { response: output },
              message: `HTTP request failed with status ${response.status}: ${response.statusText}`,
              retryable: shouldRetry,
              timestamp: new Date(),
            },
            output,
            performance: context.performance,
            shouldRetry,
            success: false,
          };
        }

        return {
          metadata: {
            cached: response.headers.get('cache-control') !== null,
            duration,
            requestSize: JSON.stringify(processedInput.body ?? '').length,
            status: response.status,
          },
          output,
          performance: context.performance,
          success: true,
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        const isTimeoutError = error instanceof Error && error.name === 'AbortError';
        const isNetworkError = error instanceof TypeError;

        // Use pattern matching for error handling
        const errorCode = isTimeoutError
          ? ('HTTP_TIMEOUT_ERROR' as const)
          : isNetworkError
            ? ('HTTP_NETWORK_ERROR' as const)
            : ('HTTP_REQUEST_ERROR' as const);

        return {
          error: {
            code: errorCode,
            details: { duration, errorType: error?.constructor.name, originalError: error },
            message: error instanceof Error ? error.message : 'Unknown HTTP error',
            retryable: !isNetworkError, // Network errors typically aren't retryable
            timestamp: new Date(),
          },
          metadata: { duration, errorType: errorCode },
          performance: context.performance,
          shouldRetry: !isNetworkError,
          success: false,
        };
      }
    },
    {
      validationConfig: {
        validateInput: true,
        validateOutput: true,
        input: HttpRequestInputSchema as any,
        output: HttpRequestOutputSchema as any,
        ...customConfig?.validationConfig,
      },
      executionConfig: {
        retryConfig: {
          backoff: 'exponential',
          delay: 1000,
          jitter: true,
          maxAttempts: 3,
          retryIf: (error) =>
            error.code ? ['HTTP_REQUEST_ERROR', 'HTTP_TIMEOUT_ERROR'].includes(error.code) : false,
        },
        timeout: { execution: 60000 },
        ...customConfig?.executionConfig,
      },
    },
  );
}

// ===== DATABASE OPERATION STEP TEMPLATES =====

// Database utilities using functional programming
const sanitizeQuery = (query: string): string => query.trim().replace(/;\s*$/, ''); // Remove trailing semicolon

const validateParameters = (query: string, parameters: any[] = []): boolean => {
  const placeholderCount = (query.match(/\?/g) ?? []).length;
  return placeholderCount === parameters.length;
};

const createQueryContext = (query: string, parameters: any[] = []) => ({
  isValid: validateParameters(query, parameters),
  estimatedComplexity: query.length > 1000 ? 'high' : query.includes('JOIN') ? 'medium' : 'low',
  parameterCount: parameters.length,
  parameters,
  query: sanitizeQuery(query),
});

/**
 * Enhanced input schema for database query steps
 */
export const DatabaseQueryInputSchema = z
  .object({
    connection: z.string().optional(),
    maxRows: z.number().positive().optional(),
    parameters: z.array(z.any()).optional(),
    query: z.string().min(1, 'Query cannot be empty'),
    // Modern additions
    readOnly: z.boolean().default(false),
    streaming: z.boolean().default(false),
    timeout: z.number().positive().default(30000),
    transactionId: z.string().optional(),
  })
  .refine((data) => validateParameters(data.query, data.parameters), {
    message: 'Parameter count must match query placeholders',
  });

/**
 * Enhanced output schema for database query steps
 */
export const DatabaseQueryOutputSchema = z.object({
  // Modern additions
  affectedRows: z.number().optional(),
  duration: z.number(),
  insertId: z.union([z.string(), z.number()]).optional(),
  metadata: z.record(z.any()).optional(),
  queryPlan: z.record(z.any()).optional(),
  rowCount: z.number(),
  rows: z.array(z.record(z.any())),
  warnings: z.array(z.string()).optional(),
});

export type DatabaseQueryInput = z.infer<typeof DatabaseQueryInputSchema>;
export type DatabaseQueryOutput = z.infer<typeof DatabaseQueryOutputSchema>;

/**
 * Create a database query step using modern functional patterns
 */
export function createDatabaseQueryStep(
  name: string,
  description?: string,
  customConfig?: {
    executionConfig?: StepExecutionConfig;
    validationConfig?: StepValidationConfig<DatabaseQueryInput, DatabaseQueryOutput>;
    queryProcessor?: (
      context: ReturnType<typeof createQueryContext>,
    ) => ReturnType<typeof createQueryContext>;
    resultTransformer?: (rows: any[]) => any[];
    connectionProvider?: () => Promise<any>;
  },
): WorkflowStepDefinition<DatabaseQueryInput, DatabaseQueryOutput> {
  return createWorkflowStep(
    {
      name,
      category: 'database',
      description: description || `Database query step: ${name}`,
      tags: ['database', 'query', 'sql'],
      version: '1.0.0',
    },
    async (
      context: StepExecutionContext<DatabaseQueryInput>,
    ): Promise<StepExecutionResult<DatabaseQueryOutput>> => {
      const { input } = context;
      const startTime = Date.now();

      try {
        // Create query context using functional approach
        let queryContext = createQueryContext(input.query, input.parameters);

        // Apply query processor if provided
        if (customConfig?.queryProcessor) {
          queryContext = customConfig.queryProcessor(queryContext);
        }

        if (!queryContext.isValid) {
          throw new OrchestrationError(
            'Invalid query: parameter count mismatch',
            'DATABASE_VALIDATION_ERROR',
            false,
          );
        }

        await context.reportProgress?.(20, 100, 'Validating query');

        // Get database connection
        const connection = customConfig?.connectionProvider
          ? await customConfig.connectionProvider()
          : null; // Mock connection for template

        await context.reportProgress?.(40, 100, 'Executing query');

        // Note: This is a template - actual database execution would be here
        // In real implementation, this would use the actual database client
        let rows: any[] = [];

        // Simulate based on query type
        if (queryContext.query.toLowerCase().startsWith('select')) {
          rows = []; // Mock SELECT result
        }

        await context.reportProgress?.(80, 100, 'Processing results');

        // Apply result transformer if provided
        if (customConfig?.resultTransformer) {
          rows = customConfig.resultTransformer(rows);
        }

        const duration = Date.now() - startTime;
        const mockResult: DatabaseQueryOutput = {
          affectedRows: input.readOnly ? undefined : 0,
          duration,
          metadata: {
            complexity: queryContext.estimatedComplexity,
            parameters: queryContext.parameters,
            query: queryContext.query,
          },
          rowCount: rows.length,
          rows,
          warnings: [],
        };

        await context.reportProgress?.(100, 100, 'Query completed');

        return {
          metadata: {
            complexity: queryContext.estimatedComplexity,
            parameterCount: queryContext.parameterCount,
            queryDuration: duration,
          },
          output: mockResult,
          performance: context.performance,
          success: true,
        };
      } catch (error) {
        const duration = Date.now() - startTime;

        // Determine error type and retryability
        const isConnectionError =
          error instanceof Error &&
          ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'].some((code) => error.message.includes(code));
        const isSyntaxError =
          error instanceof Error && error.message.toLowerCase().includes('syntax');
        const isValidationError =
          error instanceof OrchestrationError && error.code === 'DATABASE_VALIDATION_ERROR';

        const errorCode = isValidationError
          ? ('DATABASE_VALIDATION_ERROR' as const)
          : isConnectionError
            ? ('DATABASE_CONNECTION_ERROR' as const)
            : isSyntaxError
              ? ('DATABASE_SYNTAX_ERROR' as const)
              : ('DATABASE_QUERY_ERROR' as const);

        return {
          error: {
            code: errorCode,
            details: {
              duration,
              errorType: error?.constructor.name,
              originalError: error,
              query: input.query,
            },
            message: error instanceof Error ? error.message : 'Database query failed',
            retryable: isConnectionError, // Only retry connection errors
            timestamp: new Date(),
          },
          metadata: { duration, errorType: errorCode },
          performance: context.performance,
          shouldRetry: isConnectionError,
          success: false,
        };
      }
    },
    {
      validationConfig: {
        validateInput: true,
        validateOutput: true,
        input: DatabaseQueryInputSchema as any,
        output: DatabaseQueryOutputSchema,
        ...customConfig?.validationConfig,
      },
      executionConfig: {
        retryConfig: {
          backoff: 'exponential',
          delay: 500,
          maxAttempts: 3,
          retryIf: (error) => error.code === 'DATABASE_CONNECTION_ERROR',
        },
        timeout: { execution: 30000 },
        ...customConfig?.executionConfig,
      },
    },
  );
}

// ===== FILE PROCESSING STEP TEMPLATES =====

/**
 * Input schema for file processing steps
 */
export const FileProcessingInputSchema = z.object({
  encoding: z.string().default('utf-8'),
  filePath: z.string().min(1, 'File path is required'),
  operation: z.enum(['read', 'write', 'delete', 'copy', 'move', 'compress', 'decompress']),
  options: z.record(z.any()).optional(),
  outputPath: z.string().optional(),
});

/**
 * Output schema for file processing steps
 */
export const FileProcessingOutputSchema = z.object({
  content: z.any().optional(),
  filePath: z.string(),
  metadata: z.record(z.any()).optional(),
  size: z.number().optional(),
  success: z.boolean(),
});

export type FileProcessingInput = z.infer<typeof FileProcessingInputSchema>;
export type FileProcessingOutput = z.infer<typeof FileProcessingOutputSchema>;

/**
 * Create a file processing step
 */
export function createFileProcessingStep(
  name: string,
  description?: string,
  customConfig?: {
    executionConfig?: StepExecutionConfig;
    validationConfig?: StepValidationConfig<FileProcessingInput, FileProcessingOutput>;
  },
): WorkflowStepDefinition<FileProcessingInput, FileProcessingOutput> {
  return createWorkflowStep(
    {
      name,
      category: 'file',
      description: description || `File processing step: ${name}`,
      tags: ['file', 'processing', 'io'],
      version: '1.0.0',
    },
    async (
      context: StepExecutionContext<FileProcessingInput>,
    ): Promise<StepExecutionResult<FileProcessingOutput>> => {
      const { input } = context;

      try {
        // Note: This is a template - actual file processing logic would be implemented
        // In real implementation, this would use fs/promises or similar

        const mockResult: FileProcessingOutput = {
          filePath: input.filePath,
          metadata: {
            encoding: input.encoding,
            operation: input.operation,
          },
          size: 1024,
          success: true,
        };

        return {
          output: mockResult,
          performance: context.performance,
          success: true,
        };
      } catch (error) {
        return {
          error: {
            code: 'FILE_PROCESSING_ERROR',
            details: { filePath: input.filePath, originalError: error },
            message: error instanceof Error ? error.message : 'File processing failed',
            retryable: false, // File errors are typically not retryable
            timestamp: new Date(),
          },
          performance: context.performance,
          shouldRetry: false,
          success: false,
        };
      }
    },
    {
      validationConfig: {
        validateInput: true,
        validateOutput: true,
        input: FileProcessingInputSchema as any,
        output: FileProcessingOutputSchema,
        ...customConfig?.validationConfig,
      },
      executionConfig: {
        timeout: { execution: 60000 },
        ...customConfig?.executionConfig,
      },
    },
  );
}

// ===== NOTIFICATION STEP TEMPLATES =====

/**
 * Input schema for notification steps
 */
export const NotificationInputSchema = z.object({
  type: z.enum(['email', 'sms', 'push', 'webhook', 'slack']),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        content: z.string(),
      }),
    )
    .optional(),
  message: z.string().min(1, 'Message is required'),
  metadata: z.record(z.any()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  recipients: z.array(z.string()).min(1, 'At least one recipient is required'),
  subject: z.string().optional(),
});

/**
 * Output schema for notification steps
 */
export const NotificationOutputSchema = z.object({
  cost: z.number().optional(),
  deliveryStatus: z.record(z.string()),
  messageId: z.string().optional(),
  recipients: z.array(z.string()),
  sent: z.boolean(),
});

export type NotificationInput = z.infer<typeof NotificationInputSchema>;
export type NotificationOutput = z.infer<typeof NotificationOutputSchema>;

/**
 * Create a notification step
 */
export function createNotificationStep(
  name: string,
  description?: string,
  customConfig?: {
    executionConfig?: StepExecutionConfig;
    validationConfig?: StepValidationConfig<NotificationInput, NotificationOutput>;
  },
): WorkflowStepDefinition<NotificationInput, NotificationOutput> {
  return createWorkflowStep(
    {
      name,
      category: 'notification',
      description: description || `Notification step: ${name}`,
      tags: ['notification', 'communication', 'alert'],
      version: '1.0.0',
    },
    async (
      context: StepExecutionContext<NotificationInput>,
    ): Promise<StepExecutionResult<NotificationOutput>> => {
      const { input } = context;

      try {
        // Note: This is a template - actual notification logic would be implemented
        // In real implementation, this would integrate with notification providers

        const mockResult: NotificationOutput = {
          deliveryStatus: Object.fromEntries(
            input.recipients.map((recipient) => [recipient, 'delivered']),
          ),
          messageId: `msg_${Date.now()}`,
          recipients: input.recipients,
          sent: true,
        };

        return {
          metadata: {
            notificationType: input.type,
            recipientCount: input.recipients.length,
          },
          output: mockResult,
          performance: context.performance,
          success: true,
        };
      } catch (error) {
        return {
          error: {
            code: 'NOTIFICATION_ERROR',
            details: { notificationType: input.type, originalError: error },
            message: error instanceof Error ? error.message : 'Notification failed',
            retryable: true,
            timestamp: new Date(),
          },
          performance: context.performance,
          shouldRetry: true,
          success: false,
        };
      }
    },
    {
      validationConfig: {
        validateInput: true,
        validateOutput: true,
        input: NotificationInputSchema as any,
        output: NotificationOutputSchema,
        ...customConfig?.validationConfig,
      },
      executionConfig: {
        retryConfig: {
          backoff: 'exponential',
          delay: 2000,
          maxAttempts: 3,
        },
        timeout: { execution: 30000 },
        ...customConfig?.executionConfig,
      },
    },
  );
}

// ===== DATA TRANSFORMATION STEP TEMPLATES =====

/**
 * Input schema for data transformation steps
 */
export const DataTransformationInputSchema = z.object({
  data: z.any(),
  options: z
    .object({
      continueOnError: z.boolean().default(true),
      maxItems: z.number().positive().optional(),
      strict: z.boolean().default(false),
    })
    .optional(),
  transformations: z.array(
    z.object({
      type: z.enum(['map', 'filter', 'reduce', 'sort', 'group', 'validate', 'convert']),
      config: z.record(z.any()),
    }),
  ),
});

/**
 * Output schema for data transformation steps
 */
export const DataTransformationOutputSchema = z.object({
  data: z.any(),
  errors: z
    .array(
      z.object({
        error: z.string(),
        item: z.any().optional(),
        transformation: z.string(),
      }),
    )
    .optional(),
  metadata: z.record(z.any()).optional(),
  transformedCount: z.number(),
});

export type DataTransformationInput = z.infer<typeof DataTransformationInputSchema>;
export type DataTransformationOutput = z.infer<typeof DataTransformationOutputSchema>;

/**
 * Create a data transformation step
 */
export function createDataTransformationStep(
  name: string,
  description?: string,
  customConfig?: {
    executionConfig?: StepExecutionConfig;
    validationConfig?: StepValidationConfig<DataTransformationInput, DataTransformationOutput>;
  },
): WorkflowStepDefinition<DataTransformationInput, DataTransformationOutput> {
  return createWorkflowStep(
    {
      name,
      category: 'transformation',
      description: description || `Data transformation step: ${name}`,
      tags: ['data', 'transformation', 'processing'],
      version: '1.0.0',
    },
    async (
      context: StepExecutionContext<DataTransformationInput>,
    ): Promise<StepExecutionResult<DataTransformationOutput>> => {
      const { input } = context;

      try {
        let data = input.data;
        let transformedCount = 0;
        const errors: any[] = [];

        for (const transformation of input.transformations) {
          try {
            // Apply transformation based on type
            // Note: This is a template - actual transformation logic would be implemented
            switch (transformation.type) {
              case 'map':
                if (Array.isArray(data)) {
                  data = data.map((item, index) => ({
                    ...item,
                    _index: index,
                    _transformed: true,
                  }));
                  transformedCount += data.length;
                }
                break;
              case 'filter':
                if (Array.isArray(data)) {
                  const originalLength = data.length;
                  data = data.filter((item) => item !== null && item !== undefined);
                  transformedCount += originalLength - data.length;
                }
                break;
              case 'validate':
                // Validation logic would be implemented here
                transformedCount += 1;
                break;
              default:
                throw new Error(`Unsupported transformation type: ${transformation.type}`);
            }
          } catch (error) {
            const errorDetails = {
              error: error instanceof Error ? error.message : 'Unknown error',
              item: null, // Would include the specific item that failed
              transformation: transformation.type,
            };

            errors.push(errorDetails);

            if (!input.options?.continueOnError) {
              throw new OrchestrationError(
                `Transformation failed: ${errorDetails.error}`,
                'DATA_TRANSFORMATION_ERROR',
                false,
                { transformation: errorDetails },
              );
            }
          }
        }

        const result: DataTransformationOutput = {
          data,
          errors: errors.length > 0 ? errors : undefined,
          metadata: {
            originalDataType: typeof input.data,
            transformationCount: input.transformations.length,
          },
          transformedCount,
        };

        return {
          metadata: {
            errorCount: errors.length,
            transformedItems: transformedCount,
          },
          output: result,
          performance: context.performance,
          success: true,
        };
      } catch (error) {
        return {
          error: {
            code: 'DATA_TRANSFORMATION_ERROR',
            details: { originalError: error },
            message: error instanceof Error ? error.message : 'Data transformation failed',
            retryable: false, // Data transformation errors are typically not retryable
            timestamp: new Date(),
          },
          performance: context.performance,
          shouldRetry: false,
          success: false,
        };
      }
    },
    {
      validationConfig: {
        validateInput: true,
        validateOutput: true,
        input: DataTransformationInputSchema as any,
        output: DataTransformationOutputSchema,
        ...customConfig?.validationConfig,
      },
      executionConfig: {
        timeout: { execution: 120000 }, // 2 minutes for data processing
        ...customConfig?.executionConfig,
      },
    },
  );
}

// ===== CONDITIONAL STEP TEMPLATES =====

/**
 * Input schema for conditional steps
 */
export const ConditionalInputSchema = z.object({
  condition: z.object({
    type: z.enum([
      'equals',
      'not_equals',
      'greater_than',
      'less_than',
      'contains',
      'exists',
      'custom',
    ]),
    customFunction: z.string().optional(), // For custom conditions
    left: z.any(),
    right: z.any().optional(),
  }),
  falseSteps: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  trueSteps: z.array(z.string()).optional(),
});

/**
 * Output schema for conditional steps
 */
export const ConditionalOutputSchema = z.object({
  conditionMet: z.boolean(),
  evaluationDetails: z.record(z.any()).optional(),
  nextSteps: z.array(z.string()).optional(),
});

export type ConditionalInput = z.infer<typeof ConditionalInputSchema>;
export type ConditionalOutput = z.infer<typeof ConditionalOutputSchema>;

/**
 * Create a conditional step
 */
export function createConditionalStep(
  name: string,
  description?: string,
  customConfig?: {
    executionConfig?: StepExecutionConfig;
    validationConfig?: StepValidationConfig<ConditionalInput, ConditionalOutput>;
  },
): WorkflowStepDefinition<ConditionalInput, ConditionalOutput> {
  return createWorkflowStep(
    {
      name,
      category: 'control',
      description: description || `Conditional step: ${name}`,
      tags: ['conditional', 'control-flow', 'logic'],
      version: '1.0.0',
    },
    async (
      context: StepExecutionContext<ConditionalInput>,
    ): Promise<StepExecutionResult<ConditionalOutput>> => {
      const { input } = context;

      try {
        let conditionMet = false;
        const evaluationDetails: Record<string, any> = {
          conditionType: input.condition.type,
          leftValue: input.condition.left,
          rightValue: input.condition.right,
        };

        // Evaluate condition based on type
        switch (input.condition.type) {
          case 'equals':
            conditionMet = input.condition.left === input.condition.right;
            break;
          case 'not_equals':
            conditionMet = input.condition.left !== input.condition.right;
            break;
          case 'greater_than':
            conditionMet = Number(input.condition.left) > Number(input.condition.right);
            break;
          case 'less_than':
            conditionMet = Number(input.condition.left) < Number(input.condition.right);
            break;
          case 'contains':
            if (
              typeof input.condition.left === 'string' &&
              typeof input.condition.right === 'string'
            ) {
              conditionMet = input.condition.left.includes(input.condition.right);
            } else if (Array.isArray(input.condition.left)) {
              conditionMet = input.condition.left.includes(input.condition.right);
            }
            break;
          case 'exists':
            conditionMet = input.condition.left !== null && input.condition.left !== undefined;
            break;
          case 'custom':
            // Note: In real implementation, this would evaluate custom functions safely
            throw new Error('Custom conditions not implemented in template');
          default:
            throw new Error(`Unsupported condition type: ${input.condition.type}`);
        }

        evaluationDetails.result = conditionMet;

        const nextSteps = conditionMet ? input.trueSteps : input.falseSteps;

        const result: ConditionalOutput = {
          conditionMet,
          evaluationDetails,
          nextSteps,
        };

        return {
          context: {
            conditionResult: conditionMet,
            nextSteps: nextSteps || [],
          },
          metadata: {
            conditionMet,
            nextStepCount: nextSteps?.length || 0,
          },
          output: result,
          performance: context.performance,
          success: true,
        };
      } catch (error) {
        return {
          error: {
            code: 'CONDITIONAL_EVALUATION_ERROR',
            details: { condition: input.condition, originalError: error },
            message: error instanceof Error ? error.message : 'Condition evaluation failed',
            retryable: false,
            timestamp: new Date(),
          },
          performance: context.performance,
          shouldRetry: false,
          success: false,
        };
      }
    },
    {
      validationConfig: {
        validateInput: true,
        validateOutput: true,
        input: ConditionalInputSchema,
        output: ConditionalOutputSchema,
        ...customConfig?.validationConfig,
      },
      executionConfig: {
        timeout: { execution: 5000 }, // Quick evaluation
        ...customConfig?.executionConfig,
      },
    },
  );
}

// ===== UTILITY FUNCTIONS =====

/**
 * Create a delay/sleep step
 */
export function createDelayStep(
  name: string,
  delayMs: number,
  description?: string,
): WorkflowStepDefinition<{ delayMs?: number }, { delayMs: number; actualDelay: number }> {
  return createWorkflowStep(
    {
      name,
      category: 'utility',
      description: description || `Delay step: ${name} (${delayMs}ms)`,
      tags: ['delay', 'sleep', 'wait'],
      version: '1.0.0',
    },
    async (context): Promise<StepExecutionResult<{ delayMs: number; actualDelay: number }>> => {
      const delay = context.input.delayMs || delayMs;
      const startTime = Date.now();

      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(resolve, delay);

          if (context.abortSignal) {
            context.abortSignal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('Delay aborted'));
            });
          }
        });

        const actualDelay = Date.now() - startTime;

        return {
          metadata: { actualDelay, plannedDelay: delay },
          output: { actualDelay, delayMs: delay },
          performance: context.performance,
          success: true,
        };
      } catch (error) {
        return {
          error: {
            code: 'DELAY_ERROR',
            details: { originalError: error, plannedDelay: delay },
            message: error instanceof Error ? error.message : 'Delay failed',
            retryable: false,
            timestamp: new Date(),
          },
          performance: context.performance,
          shouldRetry: false,
          success: false,
        };
      }
    },
    {
      validationConfig: {
        validateInput: true,
        validateOutput: true,
        input: z.object({ delayMs: z.number().positive().optional() }),
        output: z.object({ actualDelay: z.number(), delayMs: z.number() }),
      },
    },
  );
}

// ===== MODERN PIPELINE UTILITIES =====

/**
 * Create a batch processing step using async generators
 */
export function createBatchProcessingStep<TInput, TOutput>(
  name: string,
  batchProcessor: (batch: TInput[]) => Promise<TOutput[]>,
  options: {
    batchSize?: number;
    concurrency?: number;
    description?: string;
  } = {},
): WorkflowStepDefinition<TInput[], TOutput[]> {
  const { batchSize = 10, concurrency = 3, description } = options;

  return createWorkflowStep(
    {
      name,
      category: 'batch',
      description: description ?? `Batch processing step: ${name}`,
      tags: ['batch', 'processing', 'async'],
      version: '1.0.0',
    },
    async (context: StepExecutionContext<TInput[]>): Promise<StepExecutionResult<TOutput[]>> => {
      const { input } = context;

      try {
        const batches: TInput[][] = [];
        for (let i = 0; i < input.length; i += batchSize) {
          batches.push(input.slice(i, i + batchSize));
        }

        const results: TOutput[] = [];
        let processed = 0;

        // Process batches with concurrency control
        for (let i = 0; i < batches.length; i += concurrency) {
          const batchPromises = batches.slice(i, i + concurrency).map(async (batch, idx) => {
            const batchResults = await batchProcessor(batch);
            results.push(...batchResults);
            processed += batch.length;

            await context.reportProgress?.(
              processed,
              input.length,
              `Processed batch ${i + idx + 1}/${batches.length}`,
            );

            return batchResults;
          });

          await Promise.all(batchPromises);
        }

        return {
          metadata: {
            batchSize,
            concurrency,
            processedItems: results.length,
            totalBatches: batches.length,
          },
          output: results,
          performance: context.performance,
          success: true,
        };
      } catch (error) {
        return {
          error: {
            code: 'BATCH_PROCESSING_ERROR' as const,
            details: { originalError: error },
            message: error instanceof Error ? error.message : 'Batch processing failed',
            retryable: true,
            timestamp: new Date(),
          },
          performance: context.performance,
          shouldRetry: true,
          success: false,
        };
      }
    },
  );
}

/**
 * Create a map-reduce step using functional programming
 */
export function createMapReduceStep<TInput, TMapped, TOutput>(
  name: string,
  mapper: (item: TInput) => TMapped | Promise<TMapped>,
  reducer: (accumulator: TOutput, current: TMapped) => TOutput,
  initialValue: TOutput,
  options: {
    description?: string;
    concurrency?: number;
  } = {},
): WorkflowStepDefinition<TInput[], TOutput> {
  return createWorkflowStep(
    {
      name,
      category: 'functional',
      description: options.description ?? `Map-reduce step: ${name}`,
      tags: ['map-reduce', 'functional', 'processing'],
      version: '1.0.0',
    },
    async (context: StepExecutionContext<TInput[]>): Promise<StepExecutionResult<TOutput>> => {
      const { input } = context;

      try {
        await context.reportProgress?.(10, 100, 'Starting map phase');

        // Map phase with optional concurrency
        const mappedResults: TMapped[] = [];
        const concurrency = options.concurrency ?? input.length;

        for (let i = 0; i < input.length; i += concurrency) {
          const batch = input.slice(i, i + concurrency);
          const batchResults = await Promise.all(batch.map((item) => mapper(item)));
          mappedResults.push(...batchResults);

          await context.reportProgress?.(
            10 + (i / input.length) * 70,
            100,
            `Mapped ${i + batch.length}/${input.length} items`,
          );
        }

        await context.reportProgress?.(80, 100, 'Starting reduce phase');

        // Reduce phase
        const result = mappedResults.reduce(reducer, initialValue);

        await context.reportProgress?.(100, 100, 'Map-reduce completed');

        return {
          metadata: {
            concurrency,
            inputCount: input.length,
            mappedCount: mappedResults.length,
          },
          output: result,
          performance: context.performance,
          success: true,
        };
      } catch (error) {
        return {
          error: {
            code: 'MAP_REDUCE_ERROR' as const,
            details: { originalError: error },
            message: error instanceof Error ? error.message : 'Map-reduce operation failed',
            retryable: false,
            timestamp: new Date(),
          },
          performance: context.performance,
          shouldRetry: false,
          success: false,
        };
      }
    },
  );
}

/**
 * Step template registry with modern functional utilities
 */
export const StepTemplates = {
  conditional: createConditionalStep,
  database: createDatabaseQueryStep,
  delay: createDelayStep,
  file: createFileProcessingStep,
  // Core templates
  http: createHttpRequestStep,
  notification: createNotificationStep,
  transformation: createDataTransformationStep,

  // Modern functional templates
  batch: createBatchProcessingStep,
  mapReduce: createMapReduceStep,
} as const;

export type StepTemplateType = keyof typeof StepTemplates;
