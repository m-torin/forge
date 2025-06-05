/**
 * Modern Workflow Step Templates (ES2022+)
 *
 * Pre-built step templates using functional composition, pipeline utilities,
 * and modern JavaScript features for common operations like HTTP requests,
 * database operations, file processing, notifications, and data transformations.
 */

import { z } from 'zod';
import {
  createWorkflowStep,
  matchError,
  StandardWorkflowStep,
  type WorkflowStepDefinition,
  type StepExecutionContext,
  type StepExecutionResult,
  type StepExecutionConfig,
  type StepValidationConfig,
} from './step-factory';
import { OrchestrationError } from '../utils/errors';

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
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']).default('GET'),
    headers: z.record(z.string()).optional(),
    body: z.any().optional(),
    timeout: z.number().positive().default(30000),
    retryStatusCodes: z.array(z.number()).default([408, 429, 500, 502, 503, 504]),
    followRedirects: z.boolean().default(true),
    maxRedirects: z.number().nonnegative().default(5),
    // Modern additions
    signal: z.custom<AbortSignal>().optional(),
    cache: z.enum(['default', 'no-store', 'reload', 'no-cache', 'force-cache']).optional(),
    credentials: z.enum(['omit', 'same-origin', 'include']).optional(),
    mode: z.enum(['cors', 'no-cors', 'same-origin']).optional(),
  })
  .refine(
    (data) => {
      // Custom validation using nullish coalescing
      const hasBody = data.body != null;
      const isBodyMethod = ['POST', 'PUT', 'PATCH'].includes(data.method);
      return !hasBody || isBodyMethod;
    },
    { message: 'Body can only be provided with POST, PUT, or PATCH methods' },
  );

/**
 * Output schema for HTTP request steps (enhanced)
 */
export const HttpRequestOutputSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  headers: z.record(z.string()),
  data: z.any(),
  url: z.string(),
  duration: z.number(),
  // Modern additions
  redirected: z.boolean().optional(),
  type: z.enum(['basic', 'cors', 'error', 'opaque', 'opaqueredirect']).optional(),
  size: z.number().optional(),
  cached: z.boolean().optional(),
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
      description: description || `HTTP request step: ${name}`,
      version: '1.0.0',
      category: 'http',
      tags: ['http', 'request', 'api'],
    },
    async (
      context: StepExecutionContext<HttpRequestInput>,
    ): Promise<StepExecutionResult<HttpRequestOutput>> => {
      const { input, abortSignal } = context;
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
          method: processedInput.method,
          headers,
          body: processedInput.body ? JSON.stringify(processedInput.body) : undefined,
          signal: controller.signal,
          redirect: processedInput.followRedirects ? 'follow' : 'manual',
          cache: processedInput.cache,
          credentials: processedInput.credentials,
          mode: processedInput.mode,
        });

        clearTimeout(timeoutId);

        const duration = Date.now() - startTime;

        // Parse response data using functional approach
        const data = await parseResponseData(response);

        // Report progress
        await context.reportProgress?.(80, 100, 'Processing response');

        let output: HttpRequestOutput = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data,
          url: response.url,
          duration,
          redirected: response.redirected,
          type: response.type as any,
          size: parseInt(response.headers.get('content-length') ?? '0') || undefined,
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
            success: false,
            error: {
              code: 'HTTP_REQUEST_ERROR' as const,
              message: `HTTP request failed with status ${response.status}: ${response.statusText}`,
              retryable: shouldRetry,
              timestamp: new Date(),
              details: { response: output },
            },
            output,
            performance: context.performance,
            shouldRetry,
          };
        }

        return {
          success: true,
          output,
          performance: context.performance,
          metadata: {
            duration,
            status: response.status,
            cached: response.headers.get('cache-control') !== null,
            requestSize: JSON.stringify(processedInput.body ?? '').length,
          },
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
          success: false,
          error: {
            code: errorCode,
            message: error instanceof Error ? error.message : 'Unknown HTTP error',
            retryable: !isNetworkError, // Network errors typically aren't retryable
            timestamp: new Date(),
            details: { originalError: error, duration, errorType: error?.constructor.name },
          },
          performance: context.performance,
          shouldRetry: !isNetworkError,
          metadata: { duration, errorType: errorCode },
        };
      }
    },
    {
      executionConfig: {
        retryConfig: {
          maxAttempts: 3,
          delay: 1000,
          backoff: 'exponential',
          jitter: true,
          retryIf: (error) =>
            error.code ? ['HTTP_REQUEST_ERROR', 'HTTP_TIMEOUT_ERROR'].includes(error.code) : false,
        },
        timeout: { execution: 60000 },
        ...customConfig?.executionConfig,
      },
      validationConfig: {
        input: HttpRequestInputSchema as any,
        output: HttpRequestOutputSchema as any,
        validateInput: true,
        validateOutput: true,
        ...customConfig?.validationConfig,
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
  query: sanitizeQuery(query),
  parameters,
  isValid: validateParameters(query, parameters),
  parameterCount: parameters.length,
  estimatedComplexity: query.length > 1000 ? 'high' : query.includes('JOIN') ? 'medium' : 'low',
});

/**
 * Enhanced input schema for database query steps
 */
export const DatabaseQueryInputSchema = z
  .object({
    query: z.string().min(1, 'Query cannot be empty'),
    parameters: z.array(z.any()).optional(),
    timeout: z.number().positive().default(30000),
    connection: z.string().optional(),
    transactionId: z.string().optional(),
    // Modern additions
    readOnly: z.boolean().default(false),
    maxRows: z.number().positive().optional(),
    streaming: z.boolean().default(false),
  })
  .refine((data) => validateParameters(data.query, data.parameters), {
    message: 'Parameter count must match query placeholders',
  });

/**
 * Enhanced output schema for database query steps
 */
export const DatabaseQueryOutputSchema = z.object({
  rows: z.array(z.record(z.any())),
  rowCount: z.number(),
  duration: z.number(),
  metadata: z.record(z.any()).optional(),
  // Modern additions
  affectedRows: z.number().optional(),
  insertId: z.union([z.string(), z.number()]).optional(),
  queryPlan: z.record(z.any()).optional(),
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
      description: description || `Database query step: ${name}`,
      version: '1.0.0',
      category: 'database',
      tags: ['database', 'query', 'sql'],
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
          rows,
          rowCount: rows.length,
          duration,
          metadata: {
            query: queryContext.query,
            parameters: queryContext.parameters,
            complexity: queryContext.estimatedComplexity,
          },
          affectedRows: input.readOnly ? undefined : 0,
          warnings: [],
        };

        await context.reportProgress?.(100, 100, 'Query completed');

        return {
          success: true,
          output: mockResult,
          performance: context.performance,
          metadata: {
            queryDuration: duration,
            complexity: queryContext.estimatedComplexity,
            parameterCount: queryContext.parameterCount,
          },
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
          success: false,
          error: {
            code: errorCode,
            message: error instanceof Error ? error.message : 'Database query failed',
            retryable: isConnectionError, // Only retry connection errors
            timestamp: new Date(),
            details: {
              originalError: error,
              query: input.query,
              duration,
              errorType: error?.constructor.name,
            },
          },
          performance: context.performance,
          shouldRetry: isConnectionError,
          metadata: { duration, errorType: errorCode },
        };
      }
    },
    {
      executionConfig: {
        retryConfig: {
          maxAttempts: 3,
          delay: 500,
          backoff: 'exponential',
          retryIf: (error) => error.code === 'DATABASE_CONNECTION_ERROR',
        },
        timeout: { execution: 30000 },
        ...customConfig?.executionConfig,
      },
      validationConfig: {
        input: DatabaseQueryInputSchema as any,
        output: DatabaseQueryOutputSchema,
        validateInput: true,
        validateOutput: true,
        ...customConfig?.validationConfig,
      },
    },
  );
}

// ===== FILE PROCESSING STEP TEMPLATES =====

/**
 * Input schema for file processing steps
 */
export const FileProcessingInputSchema = z.object({
  filePath: z.string().min(1, 'File path is required'),
  operation: z.enum(['read', 'write', 'delete', 'copy', 'move', 'compress', 'decompress']),
  options: z.record(z.any()).optional(),
  outputPath: z.string().optional(),
  encoding: z.string().default('utf-8'),
});

/**
 * Output schema for file processing steps
 */
export const FileProcessingOutputSchema = z.object({
  success: z.boolean(),
  filePath: z.string(),
  size: z.number().optional(),
  content: z.any().optional(),
  metadata: z.record(z.any()).optional(),
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
      description: description || `File processing step: ${name}`,
      version: '1.0.0',
      category: 'file',
      tags: ['file', 'processing', 'io'],
    },
    async (
      context: StepExecutionContext<FileProcessingInput>,
    ): Promise<StepExecutionResult<FileProcessingOutput>> => {
      const { input } = context;

      try {
        // Note: This is a template - actual file processing logic would be implemented
        // In real implementation, this would use fs/promises or similar

        const mockResult: FileProcessingOutput = {
          success: true,
          filePath: input.filePath,
          size: 1024,
          metadata: {
            operation: input.operation,
            encoding: input.encoding,
          },
        };

        return {
          success: true,
          output: mockResult,
          performance: context.performance,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'FILE_PROCESSING_ERROR',
            message: error instanceof Error ? error.message : 'File processing failed',
            retryable: false, // File errors are typically not retryable
            timestamp: new Date(),
            details: { originalError: error, filePath: input.filePath },
          },
          performance: context.performance,
          shouldRetry: false,
        };
      }
    },
    {
      executionConfig: {
        timeout: { execution: 60000 },
        ...customConfig?.executionConfig,
      },
      validationConfig: {
        input: FileProcessingInputSchema as any,
        output: FileProcessingOutputSchema,
        validateInput: true,
        validateOutput: true,
        ...customConfig?.validationConfig,
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
  recipients: z.array(z.string()).min(1, 'At least one recipient is required'),
  subject: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  metadata: z.record(z.any()).optional(),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        content: z.string(),
        type: z.string(),
      }),
    )
    .optional(),
});

/**
 * Output schema for notification steps
 */
export const NotificationOutputSchema = z.object({
  sent: z.boolean(),
  messageId: z.string().optional(),
  recipients: z.array(z.string()),
  deliveryStatus: z.record(z.string()),
  cost: z.number().optional(),
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
      description: description || `Notification step: ${name}`,
      version: '1.0.0',
      category: 'notification',
      tags: ['notification', 'communication', 'alert'],
    },
    async (
      context: StepExecutionContext<NotificationInput>,
    ): Promise<StepExecutionResult<NotificationOutput>> => {
      const { input } = context;

      try {
        // Note: This is a template - actual notification logic would be implemented
        // In real implementation, this would integrate with notification providers

        const mockResult: NotificationOutput = {
          sent: true,
          messageId: `msg_${Date.now()}`,
          recipients: input.recipients,
          deliveryStatus: Object.fromEntries(
            input.recipients.map((recipient) => [recipient, 'delivered']),
          ),
        };

        return {
          success: true,
          output: mockResult,
          performance: context.performance,
          metadata: {
            notificationType: input.type,
            recipientCount: input.recipients.length,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'NOTIFICATION_ERROR',
            message: error instanceof Error ? error.message : 'Notification failed',
            retryable: true,
            timestamp: new Date(),
            details: { originalError: error, notificationType: input.type },
          },
          performance: context.performance,
          shouldRetry: true,
        };
      }
    },
    {
      executionConfig: {
        retryConfig: {
          maxAttempts: 3,
          delay: 2000,
          backoff: 'exponential',
        },
        timeout: { execution: 30000 },
        ...customConfig?.executionConfig,
      },
      validationConfig: {
        input: NotificationInputSchema as any,
        output: NotificationOutputSchema,
        validateInput: true,
        validateOutput: true,
        ...customConfig?.validationConfig,
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
  transformations: z.array(
    z.object({
      type: z.enum(['map', 'filter', 'reduce', 'sort', 'group', 'validate', 'convert']),
      config: z.record(z.any()),
    }),
  ),
  options: z
    .object({
      strict: z.boolean().default(false),
      continueOnError: z.boolean().default(true),
      maxItems: z.number().positive().optional(),
    })
    .optional(),
});

/**
 * Output schema for data transformation steps
 */
export const DataTransformationOutputSchema = z.object({
  data: z.any(),
  transformedCount: z.number(),
  errors: z
    .array(
      z.object({
        transformation: z.string(),
        error: z.string(),
        item: z.any().optional(),
      }),
    )
    .optional(),
  metadata: z.record(z.any()).optional(),
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
      description: description || `Data transformation step: ${name}`,
      version: '1.0.0',
      category: 'transformation',
      tags: ['data', 'transformation', 'processing'],
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
                    _transformed: true,
                    _index: index,
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
              transformation: transformation.type,
              error: error instanceof Error ? error.message : 'Unknown error',
              item: null, // Would include the specific item that failed
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
          transformedCount,
          errors: errors.length > 0 ? errors : undefined,
          metadata: {
            originalDataType: typeof input.data,
            transformationCount: input.transformations.length,
          },
        };

        return {
          success: true,
          output: result,
          performance: context.performance,
          metadata: {
            transformedItems: transformedCount,
            errorCount: errors.length,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'DATA_TRANSFORMATION_ERROR',
            message: error instanceof Error ? error.message : 'Data transformation failed',
            retryable: false, // Data transformation errors are typically not retryable
            timestamp: new Date(),
            details: { originalError: error },
          },
          performance: context.performance,
          shouldRetry: false,
        };
      }
    },
    {
      executionConfig: {
        timeout: { execution: 120000 }, // 2 minutes for data processing
        ...customConfig?.executionConfig,
      },
      validationConfig: {
        input: DataTransformationInputSchema as any,
        output: DataTransformationOutputSchema,
        validateInput: true,
        validateOutput: true,
        ...customConfig?.validationConfig,
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
    left: z.any(),
    right: z.any().optional(),
    customFunction: z.string().optional(), // For custom conditions
  }),
  trueSteps: z.array(z.string()).optional(),
  falseSteps: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Output schema for conditional steps
 */
export const ConditionalOutputSchema = z.object({
  conditionMet: z.boolean(),
  nextSteps: z.array(z.string()).optional(),
  evaluationDetails: z.record(z.any()).optional(),
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
      description: description || `Conditional step: ${name}`,
      version: '1.0.0',
      category: 'control',
      tags: ['conditional', 'control-flow', 'logic'],
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
          nextSteps,
          evaluationDetails,
        };

        return {
          success: true,
          output: result,
          performance: context.performance,
          metadata: {
            conditionMet,
            nextStepCount: nextSteps?.length || 0,
          },
          context: {
            conditionResult: conditionMet,
            nextSteps: nextSteps || [],
          },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'CONDITIONAL_EVALUATION_ERROR',
            message: error instanceof Error ? error.message : 'Condition evaluation failed',
            retryable: false,
            timestamp: new Date(),
            details: { originalError: error, condition: input.condition },
          },
          performance: context.performance,
          shouldRetry: false,
        };
      }
    },
    {
      executionConfig: {
        timeout: { execution: 5000 }, // Quick evaluation
        ...customConfig?.executionConfig,
      },
      validationConfig: {
        input: ConditionalInputSchema,
        output: ConditionalOutputSchema,
        validateInput: true,
        validateOutput: true,
        ...customConfig?.validationConfig,
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
      description: description || `Delay step: ${name} (${delayMs}ms)`,
      version: '1.0.0',
      category: 'utility',
      tags: ['delay', 'sleep', 'wait'],
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
          success: true,
          output: { delayMs: delay, actualDelay },
          performance: context.performance,
          metadata: { plannedDelay: delay, actualDelay },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'DELAY_ERROR',
            message: error instanceof Error ? error.message : 'Delay failed',
            retryable: false,
            timestamp: new Date(),
            details: { originalError: error, plannedDelay: delay },
          },
          performance: context.performance,
          shouldRetry: false,
        };
      }
    },
    {
      validationConfig: {
        input: z.object({ delayMs: z.number().positive().optional() }),
        output: z.object({ delayMs: z.number(), actualDelay: z.number() }),
        validateInput: true,
        validateOutput: true,
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
      description: description ?? `Batch processing step: ${name}`,
      version: '1.0.0',
      category: 'batch',
      tags: ['batch', 'processing', 'async'],
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
          success: true,
          output: results,
          performance: context.performance,
          metadata: {
            totalBatches: batches.length,
            batchSize,
            concurrency,
            processedItems: results.length,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'BATCH_PROCESSING_ERROR' as const,
            message: error instanceof Error ? error.message : 'Batch processing failed',
            retryable: true,
            timestamp: new Date(),
            details: { originalError: error },
          },
          performance: context.performance,
          shouldRetry: true,
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
      description: options.description ?? `Map-reduce step: ${name}`,
      version: '1.0.0',
      category: 'functional',
      tags: ['map-reduce', 'functional', 'processing'],
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
          success: true,
          output: result,
          performance: context.performance,
          metadata: {
            inputCount: input.length,
            mappedCount: mappedResults.length,
            concurrency,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'MAP_REDUCE_ERROR' as const,
            message: error instanceof Error ? error.message : 'Map-reduce operation failed',
            retryable: false,
            timestamp: new Date(),
            details: { originalError: error },
          },
          performance: context.performance,
          shouldRetry: false,
        };
      }
    },
  );
}

/**
 * Step template registry with modern functional utilities
 */
export const StepTemplates = {
  // Core templates
  http: createHttpRequestStep,
  database: createDatabaseQueryStep,
  file: createFileProcessingStep,
  notification: createNotificationStep,
  transformation: createDataTransformationStep,
  conditional: createConditionalStep,
  delay: createDelayStep,

  // Modern functional templates
  batch: createBatchProcessingStep,
  mapReduce: createMapReduceStep,
} as const;

export type StepTemplateType = keyof typeof StepTemplates;
