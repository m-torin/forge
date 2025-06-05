/**
 * Common Workflow Step Templates
 * 
 * Pre-built step templates for common operations like HTTP requests,
 * database operations, file processing, notifications, and data transformations.
 */

import { z } from 'zod';
import { 
  createWorkflowStep, 
  type WorkflowStepDefinition, 
  type StepExecutionContext, 
  type StepExecutionResult,
  type StepExecutionConfig,
  type StepValidationConfig
} from './step-factory.js';
import { OrchestrationError } from '../utils/errors.js';

// ===== HTTP REQUEST STEP TEMPLATES =====

/**
 * Input schema for HTTP request steps
 */
export const HttpRequestInputSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']).default('GET'),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
  timeout: z.number().positive().default(30000),
  retryStatusCodes: z.array(z.number()).default([408, 429, 500, 502, 503, 504]),
  followRedirects: z.boolean().default(true),
  maxRedirects: z.number().nonnegative().default(5),
});

/**
 * Output schema for HTTP request steps
 */
export const HttpRequestOutputSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  headers: z.record(z.string()),
  data: z.any(),
  url: z.string(),
  duration: z.number(),
});

export type HttpRequestInput = z.infer<typeof HttpRequestInputSchema>;
export type HttpRequestOutput = z.infer<typeof HttpRequestOutputSchema>;

/**
 * Create an HTTP request step
 */
export function createHttpRequestStep(
  name: string,
  description?: string,
  customConfig?: {
    executionConfig?: StepExecutionConfig;
    validationConfig?: StepValidationConfig<HttpRequestInput, HttpRequestOutput>;
  }
): WorkflowStepDefinition<HttpRequestInput, HttpRequestOutput> {
  return createWorkflowStep(
    {
      name,
      description: description || `HTTP request step: ${name}`,
      version: '1.0.0',
      category: 'http',
      tags: ['http', 'request', 'api'],
    },
    async (context: StepExecutionContext<HttpRequestInput>): Promise<StepExecutionResult<HttpRequestOutput>> => {
      const { input, abortSignal } = context;
      const startTime = Date.now();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), input.timeout);

        // Combine abort signals
        if (abortSignal) {
          abortSignal.addEventListener('abort', () => controller.abort());
        }

        const response = await fetch(input.url, {
          method: input.method,
          headers: input.headers,
          body: input.body ? JSON.stringify(input.body) : undefined,
          signal: controller.signal,
          redirect: input.followRedirects ? 'follow' : 'manual',
        });

        clearTimeout(timeoutId);

        const duration = Date.now() - startTime;
        
        // Parse response data
        let data: any;
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else if (contentType.includes('text/')) {
          data = await response.text();
        } else {
          data = await response.arrayBuffer();
        }

        const output: HttpRequestOutput = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data,
          url: response.url,
          duration,
        };

        // Check if status code indicates failure
        if (!response.ok) {
          const shouldRetry = input.retryStatusCodes.includes(response.status);
          return {
            success: false,
            error: {
              code: 'HTTP_REQUEST_ERROR',
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
          metadata: { duration, status: response.status },
        };

      } catch (error) {
        const duration = Date.now() - startTime;
        const isTimeoutError = error instanceof Error && error.name === 'AbortError';

        return {
          success: false,
          error: {
            code: isTimeoutError ? 'HTTP_TIMEOUT_ERROR' : 'HTTP_REQUEST_ERROR',
            message: error instanceof Error ? error.message : 'Unknown HTTP error',
            retryable: true,
            timestamp: new Date(),
            details: { originalError: error, duration },
          },
          performance: context.performance,
          shouldRetry: true,
          metadata: { duration },
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
          retryIf: (error) => error.code === 'HTTP_REQUEST_ERROR' || error.code === 'HTTP_TIMEOUT_ERROR',
        },
        timeout: { execution: 60000 },
        ...customConfig?.executionConfig,
      },
      validationConfig: {
        input: HttpRequestInputSchema,
        output: HttpRequestOutputSchema,
        validateInput: true,
        validateOutput: true,
        ...customConfig?.validationConfig,
      },
    }
  );
}

// ===== DATABASE OPERATION STEP TEMPLATES =====

/**
 * Input schema for database query steps
 */
export const DatabaseQueryInputSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
  parameters: z.array(z.any()).optional(),
  timeout: z.number().positive().default(30000),
  connection: z.string().optional(),
  transactionId: z.string().optional(),
});

/**
 * Output schema for database query steps
 */
export const DatabaseQueryOutputSchema = z.object({
  rows: z.array(z.record(z.any())),
  rowCount: z.number(),
  duration: z.number(),
  metadata: z.record(z.any()).optional(),
});

export type DatabaseQueryInput = z.infer<typeof DatabaseQueryInputSchema>;
export type DatabaseQueryOutput = z.infer<typeof DatabaseQueryOutputSchema>;

/**
 * Create a database query step
 */
export function createDatabaseQueryStep(
  name: string,
  description?: string,
  customConfig?: {
    executionConfig?: StepExecutionConfig;
    validationConfig?: StepValidationConfig<DatabaseQueryInput, DatabaseQueryOutput>;
  }
): WorkflowStepDefinition<DatabaseQueryInput, DatabaseQueryOutput> {
  return createWorkflowStep(
    {
      name,
      description: description || `Database query step: ${name}`,
      version: '1.0.0',
      category: 'database',
      tags: ['database', 'query', 'sql'],
    },
    async (context: StepExecutionContext<DatabaseQueryInput>): Promise<StepExecutionResult<DatabaseQueryOutput>> => {
      const { input } = context;
      const startTime = Date.now();

      try {
        // Note: This is a template - actual database connection logic would be injected
        // In real implementation, this would use the actual database client
        
        // Simulate database operation for template
        const mockResult = {
          rows: [],
          rowCount: 0,
          duration: Date.now() - startTime,
          metadata: {
            query: input.query,
            parameters: input.parameters,
          },
        };

        return {
          success: true,
          output: mockResult,
          performance: context.performance,
          metadata: { queryDuration: mockResult.duration },
        };

      } catch (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_QUERY_ERROR',
            message: error instanceof Error ? error.message : 'Database query failed',
            retryable: true,
            timestamp: new Date(),
            details: { originalError: error, query: input.query },
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
          delay: 500,
          backoff: 'exponential',
        },
        timeout: { execution: 30000 },
        ...customConfig?.executionConfig,
      },
      validationConfig: {
        input: DatabaseQueryInputSchema,
        output: DatabaseQueryOutputSchema,
        validateInput: true,
        validateOutput: true,
        ...customConfig?.validationConfig,
      },
    }
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
  }
): WorkflowStepDefinition<FileProcessingInput, FileProcessingOutput> {
  return createWorkflowStep(
    {
      name,
      description: description || `File processing step: ${name}`,
      version: '1.0.0',
      category: 'file',
      tags: ['file', 'processing', 'io'],
    },
    async (context: StepExecutionContext<FileProcessingInput>): Promise<StepExecutionResult<FileProcessingOutput>> => {
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
        input: FileProcessingInputSchema,
        output: FileProcessingOutputSchema,
        validateInput: true,
        validateOutput: true,
        ...customConfig?.validationConfig,
      },
    }
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
  attachments: z.array(z.object({
    name: z.string(),
    content: z.string(),
    type: z.string(),
  })).optional(),
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
  }
): WorkflowStepDefinition<NotificationInput, NotificationOutput> {
  return createWorkflowStep(
    {
      name,
      description: description || `Notification step: ${name}`,
      version: '1.0.0',
      category: 'notification',
      tags: ['notification', 'communication', 'alert'],
    },
    async (context: StepExecutionContext<NotificationInput>): Promise<StepExecutionResult<NotificationOutput>> => {
      const { input } = context;

      try {
        // Note: This is a template - actual notification logic would be implemented
        // In real implementation, this would integrate with notification providers
        
        const mockResult: NotificationOutput = {
          sent: true,
          messageId: `msg_${Date.now()}`,
          recipients: input.recipients,
          deliveryStatus: Object.fromEntries(
            input.recipients.map(recipient => [recipient, 'delivered'])
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
        input: NotificationInputSchema,
        output: NotificationOutputSchema,
        validateInput: true,
        validateOutput: true,
        ...customConfig?.validationConfig,
      },
    }
  );
}

// ===== DATA TRANSFORMATION STEP TEMPLATES =====

/**
 * Input schema for data transformation steps
 */
export const DataTransformationInputSchema = z.object({
  data: z.any(),
  transformations: z.array(z.object({
    type: z.enum(['map', 'filter', 'reduce', 'sort', 'group', 'validate', 'convert']),
    config: z.record(z.any()),
  })),
  options: z.object({
    strict: z.boolean().default(false),
    continueOnError: z.boolean().default(true),
    maxItems: z.number().positive().optional(),
  }).optional(),
});

/**
 * Output schema for data transformation steps
 */
export const DataTransformationOutputSchema = z.object({
  data: z.any(),
  transformedCount: z.number(),
  errors: z.array(z.object({
    transformation: z.string(),
    error: z.string(),
    item: z.any().optional(),
  })).optional(),
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
  }
): WorkflowStepDefinition<DataTransformationInput, DataTransformationOutput> {
  return createWorkflowStep(
    {
      name,
      description: description || `Data transformation step: ${name}`,
      version: '1.0.0',
      category: 'transformation',
      tags: ['data', 'transformation', 'processing'],
    },
    async (context: StepExecutionContext<DataTransformationInput>): Promise<StepExecutionResult<DataTransformationOutput>> => {
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
                  data = data.map((item, index) => ({ ...item, _transformed: true, _index: index }));
                  transformedCount += data.length;
                }
                break;
              case 'filter':
                if (Array.isArray(data)) {
                  const originalLength = data.length;
                  data = data.filter(item => item !== null && item !== undefined);
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
                { transformation: errorDetails }
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
        input: DataTransformationInputSchema,
        output: DataTransformationOutputSchema,
        validateInput: true,
        validateOutput: true,
        ...customConfig?.validationConfig,
      },
    }
  );
}

// ===== CONDITIONAL STEP TEMPLATES =====

/**
 * Input schema for conditional steps
 */
export const ConditionalInputSchema = z.object({
  condition: z.object({
    type: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'exists', 'custom']),
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
  }
): WorkflowStepDefinition<ConditionalInput, ConditionalOutput> {
  return createWorkflowStep(
    {
      name,
      description: description || `Conditional step: ${name}`,
      version: '1.0.0',
      category: 'control',
      tags: ['conditional', 'control-flow', 'logic'],
    },
    async (context: StepExecutionContext<ConditionalInput>): Promise<StepExecutionResult<ConditionalOutput>> => {
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
            if (typeof input.condition.left === 'string' && typeof input.condition.right === 'string') {
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
    }
  );
}

// ===== UTILITY FUNCTIONS =====

/**
 * Create a delay/sleep step
 */
export function createDelayStep(
  name: string,
  delayMs: number,
  description?: string
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
    }
  );
}

/**
 * Step template registry for easy access to common templates
 */
export const StepTemplates = {
  http: createHttpRequestStep,
  database: createDatabaseQueryStep,
  file: createFileProcessingStep,
  notification: createNotificationStep,
  transformation: createDataTransformationStep,
  conditional: createConditionalStep,
  delay: createDelayStep,
} as const;

export type StepTemplateType = keyof typeof StepTemplates;