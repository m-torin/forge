/**
 * Input validation and sanitization utilities for API requests
 */

import { z } from 'zod/v4';

import { WorkflowValidationError, type ValidationError } from './errors';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  /** Valid workflow ID pattern */
  workflowId: z
    .string()
    .min(1, 'Workflow ID is required')
    .max(255, 'Workflow ID too long')
    .regex(/^[a-zA-Z0-9\-_.]+$/, 'Workflow ID contains invalid characters'),

  /** Valid execution ID pattern */
  executionId: z
    .string()
    .min(1, 'Execution ID is required')
    .max(255, 'Execution ID too long')
    .regex(/^[a-zA-Z0-9\-_.]+$/, 'Execution ID contains invalid characters'),

  /** Valid schedule ID pattern */
  scheduleId: z
    .string()
    .min(1, 'Schedule ID is required')
    .max(255, 'Schedule ID too long')
    .regex(/^[a-zA-Z0-9\-_.]+$/, 'Schedule ID contains invalid characters'),

  /** Valid alert ID pattern */
  alertId: z
    .string()
    .min(1, 'Alert ID is required')
    .max(255, 'Alert ID too long')
    .regex(/^[a-zA-Z0-9\-_.]+$/, 'Alert ID contains invalid characters'),

  /** Pagination limit */
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),

  /** Pagination offset */
  offset: z.coerce
    .number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .default(0),

  /** ISO date string */
  dateString: z.string().datetime('Invalid date format'),

  /** Tags array */
  tags: z.array(z.string().max(50, 'Tag too long')).max(20, 'Too many tags'),

  /** Generic metadata object */
  metadata: z.record(z.string(), z.unknown()).refine((obj: any) => {
    try {
      const str = JSON.stringify(obj);
      return str.length <= 10000; // 10KB limit
    } catch {
      return false; // Invalid JSON structure
    }
  }, 'Metadata too large or contains circular references'),
};

/**
 * API request validation schemas
 */
export const apiSchemas = {
  /** Execute workflow request */
  executeWorkflow: z.object({
    input: z.record(z.string(), z.unknown()).optional(),
    options: z
      .object({
        priority: z.enum(['low', 'normal', 'high']).optional(),
        delay: z.number().min(0).max(86400000).optional(), // max 24 hours
        timeout: z.number().min(1000).max(3600000).optional(), // 1s to 1h
      })
      .optional(),
  }),

  /** Create schedule request */
  createSchedule: z.object({
    config: z.object({
      cron: z.string().optional(),
      timezone: z.string().optional(),
      enabled: z.boolean().optional(),
      maxExecutions: z.number().int().positive().optional(),
      input: z.record(z.string(), z.unknown()).optional(),
      metadata: commonSchemas.metadata.optional(),
    }),
  }),

  /** Create alert rule request */
  createAlertRule: z.object({
    rule: z.object({
      name: z.string().min(1).max(255),
      condition: z.object({
        type: z.enum(['failure_rate', 'duration', 'error', 'custom']),
        threshold: z.number(),
        window: z.number().min(60000), // min 1 minute
      }),
      actions: z.array(
        z.object({
          type: z.enum(['email', 'webhook', 'slack']),
          config: z.record(z.string(), z.unknown()),
        }),
      ),
      enabled: z.boolean().optional(),
    }),
  }),

  /** Acknowledge alert request */
  acknowledgeAlert: z.object({
    note: z.string().max(1000).optional(),
  }),
};

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
function sanitizeInput<T>(input: T): T {
  if (typeof input === 'string') {
    // Remove potentially dangerous characters and sequences
    return input
      .replace(/[<>"']/g, '') // Remove HTML tags and quotes
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .trim() as T;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput) as T;
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      // Sanitize the key as well
      const sanitizedKey = sanitizeInput(key);
      sanitized[sanitizedKey] = sanitizeInput(value);
    }
    return sanitized as T;
  }

  return input;
}

/**
 * Validate and sanitize API request body
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  try {
    // First sanitize the input
    const sanitized = sanitizeInput(body);

    // Then validate with Zod
    return schema.parse(sanitized);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationError[] = error.issues.map((err: any) => ({
        message: err.message,
        path: err.path.join('.'),
        rule: err.code,
        value: (err as { received?: unknown }).received,
      }));

      throw new WorkflowValidationError('Request validation failed', validationErrors);
    }

    throw error;
  }
}

/**
 * Validate query parameters
 */
function validateQueryParams<T>(schema: z.ZodSchema<T>, params: URLSearchParams): T {
  const obj: Record<string, unknown> = {};

  // Convert URLSearchParams to object
  for (const [key, value] of Array.from(params.entries())) {
    // Handle arrays (multiple values with same key)
    if (obj[key]) {
      if (Array.isArray(obj[key])) {
        obj[key].push(value);
      } else {
        obj[key] = [obj[key], value];
      }
    } else {
      obj[key] = value;
    }
  }

  return validateRequestBody(schema, obj);
}

/**
 * Validate path parameters
 */
export function validatePathParams<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, string | string[]>,
): T {
  // Ensure all params are strings (not arrays)
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }

  return validateRequestBody(schema, normalized);
}

/**
 * Create a validated API handler
 */
function createValidatedHandler<TBody = unknown, TQuery = unknown, TParams = unknown>(config: {
  bodySchema?: z.ZodSchema<TBody>;
  querySchema?: z.ZodSchema<TQuery>;
  paramsSchema?: z.ZodSchema<TParams>;
  handler: (context: {
    body?: TBody;
    query?: TQuery;
    params?: TParams;
    request: any;
  }) => Promise<Response>;
}) {
  return async (request: any, context?: { params?: Record<string, string | string[]> }) => {
    try {
      let body: TBody | undefined;
      let query: TQuery | undefined;
      let params: TParams | undefined;

      // Validate body if schema provided
      if (config.bodySchema && request.method !== 'GET' && request.method !== 'HEAD') {
        const rawBody = await request.json();
        body = validateRequestBody(config.bodySchema, rawBody);
      }

      // Validate query params if schema provided
      if (config.querySchema) {
        const url = new URL(request.url);
        query = validateQueryParams(config.querySchema, url.searchParams);
      }

      // Validate path params if schema provided
      if (config.paramsSchema && context?.params) {
        params = validatePathParams(config.paramsSchema, context.params);
      }

      return config.handler({ body, query, params, request });
    } catch (error: any) {
      if (error instanceof WorkflowValidationError) {
        return new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: error.validationErrors,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      throw error;
    }
  };
}
