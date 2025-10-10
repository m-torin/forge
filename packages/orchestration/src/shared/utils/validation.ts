/**
 * Configuration validation utilities
 */

import { z } from 'zod/v4';

import {
  AnyProviderConfig,
  JsonValue,
  RetryConfig,
  ScheduleConfig,
  WorkflowDefinition,
  WorkflowStep,
} from '../types/index';

import { ConfigurationError, type ValidationError, WorkflowValidationError } from './errors';

// Base schemas
const retryConfigSchema = z.object({
  backoff: z.enum(['fixed', 'exponential', 'linear']),
  delay: z.number().min(0),
  jitter: z.boolean().optional(),
  maxAttempts: z.number().int().min(1).max(10),
  maxDelay: z.number().min(0).optional(),
});

const scheduleConfigSchema = z.object({
  cron: z.string().optional(),
  enabled: z.boolean().optional(),
  endDate: z.date().optional(),
  input: z.record(z.string(), z.unknown()).optional(),
  maxRetries: z.number().int().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  retryDelay: z.number().int().optional(),
  runAt: z.date().optional(),
  startDate: z.date().optional(),
  timezone: z.string().optional(),
  workflowId: z.string().min(1),
});

// Create a schema that matches JsonValue
const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

const workflowStepSchema: z.ZodType<WorkflowStep> = z.object({
  action: z.string().min(1),
  condition: z.string().optional(),
  dependsOn: z.array(z.string()).optional(),
  id: z.string().min(1),
  input: z.record(z.string(), jsonValueSchema).optional(),
  name: z.string().min(1),
  optional: z.boolean().optional(),
  retryConfig: retryConfigSchema.optional(),
  timeout: z.number().int().min(1000).optional(), // minimum 1 second
});

const workflowDefinitionSchema = z.object({
  allowManualTrigger: z.boolean().optional(),
  description: z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
  id: z.string().min(1),
  name: z.string().min(1),
  retryConfig: retryConfigSchema.optional(),
  schedule: scheduleConfigSchema.optional(),
  steps: z.array(workflowStepSchema).min(1),
  tags: z.array(z.string()).optional(),
  timeout: z.number().int().min(1000).optional(),
  version: z.string().min(1),
});

// Provider configuration schemas
const upstashWorkflowConfigSchema = z.object({
  config: z.object({
    baseUrl: z.string().url(),
    debug: z.boolean().optional(),
    env: z.string().optional(),
    qstashToken: z.string().min(1),
    redisToken: z.string().optional(),
    redisUrl: z.string().url().optional(),
  }),
  enabled: z.boolean(),
  environment: z.enum(['development', 'staging', 'production', 'all']).optional(),
  features: z
    .array(
      z.enum([
        'workflow-execution',
        'scheduling',
        'rate-limiting',
        'retries',
        'webhooks',
        'batch-processing',
        'state-management',
        'monitoring',
        'dead-letter-queue',
      ]),
    )
    .optional(),
  name: z.string().min(1),
  priority: z.number().optional(),
  type: z.literal('upstash-workflow'),
});

const upstashQStashConfigSchema = z.object({
  config: z.object({
    baseUrl: z.string().url(),
    currentSigningKey: z.string().optional(),
    delay: z.number().min(0).optional(),
    nextSigningKey: z.string().optional(),
    retries: z.number().int().min(0).max(10).optional(),
    token: z.string().min(1),
  }),
  enabled: z.boolean(),
  environment: z.enum(['development', 'staging', 'production', 'all']).optional(),
  features: z
    .array(
      z.enum([
        'workflow-execution',
        'scheduling',
        'rate-limiting',
        'retries',
        'webhooks',
        'batch-processing',
        'state-management',
        'monitoring',
        'dead-letter-queue',
      ]),
    )
    .optional(),
  name: z.string().min(1),
  priority: z.number().optional(),
  type: z.literal('upstash-qstash'),
});

const rateLimitConfigSchema = z.object({
  config: z.object({
    algorithm: z.enum(['sliding-window', 'fixed-window', 'token-bucket']).optional(),
    defaultLimit: z
      .object({
        requests: z.number().int().min(1),
        window: z.number().int().min(1),
      })
      .optional(),
    redisToken: z.string().optional(),
    redisUrl: z.string().url(),
  }),
  enabled: z.boolean(),
  environment: z.enum(['development', 'staging', 'production', 'all']).optional(),
  features: z
    .array(
      z.enum([
        'workflow-execution',
        'scheduling',
        'rate-limiting',
        'retries',
        'webhooks',
        'batch-processing',
        'state-management',
        'monitoring',
        'dead-letter-queue',
      ]),
    )
    .optional(),
  name: z.string().min(1),
  priority: z.number().optional(),
  type: z.literal('rate-limit'),
});

const providerConfigSchema = z.discriminatedUnion('type', [
  upstashWorkflowConfigSchema,
  upstashQStashConfigSchema,
  rateLimitConfigSchema,
  z.object({
    config: z.record(z.string(), z.unknown()),
    enabled: z.boolean(),
    environment: z.enum(['development', 'staging', 'production', 'all']).optional(),
    features: z
      .array(
        z.enum([
          'workflow-execution',
          'scheduling',
          'rate-limiting',
          'retries',
          'webhooks',
          'batch-processing',
          'state-management',
          'monitoring',
          'dead-letter-queue',
        ]),
      )
      .optional(),
    name: z.string().min(1),
    priority: z.number().optional(),
    type: z.literal('custom'),
  }),
]);

/**
 * Sanitize configuration by removing sensitive data for logging
 */
export function sanitizeConfig(config: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['token', 'key', 'secret', 'password', 'apikey', 'auth'];

  function sanitizeValue(value: any): any {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map(sanitizeValue);
      }

      const sanitized: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some((sensitive: any) => lowerKey.includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitizeValue(val);
        }
      }
      return sanitized;
    }

    return value;
  }

  return sanitizeValue(config);
}

/**
 * Validate environment variables required by configuration
 */
function validateEnvironmentVariables(requiredVars: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push({
        message: `Required environment variable ${varName} is not set`,
        path: `env.${varName}`,
        rule: 'required-env-var',
      });
    }
  }

  return errors;
}

/**
 * Validate a provider configuration
 */
export function validateProviderConfig(config: unknown): AnyProviderConfig {
  try {
    return providerConfigSchema.parse(config) as AnyProviderConfig;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationError[] = error.issues.map((err: any) => ({
        message: err.message,
        path: err.path.join('.'),
        rule: err.code,
        value: (err as any).received,
      }));

      throw new ConfigurationError('Provider configuration validation failed', undefined, {
        validationErrors,
      });
    }

    throw error;
  }
}

/**
 * Validate retry configuration
 */
function validateRetryConfig(config: unknown): RetryConfig {
  try {
    return retryConfigSchema.parse(config);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new ConfigurationError(
        `Invalid retry configuration: ${error.issues.map((e: any) => e.message).join(', ')}`,
        'retryConfig',
      );
    }

    throw error;
  }
}

/**
 * Validate schedule configuration
 */
function validateScheduleConfig(config: unknown): ScheduleConfig {
  try {
    const validated = scheduleConfigSchema.parse(config);

    // Additional cron validation
    if (validated.cron && !isValidCronExpression(validated.cron)) {
      throw new ConfigurationError(`Invalid cron expression: ${validated.cron}`, 'schedule.cron');
    }

    return validated;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new ConfigurationError(
        `Invalid schedule configuration: ${error.issues.map((e: any) => e.message).join(', ')}`,
        'schedule',
      );
    }

    throw error;
  }
}

/**
 * Validate a workflow definition
 */
export function validateWorkflowDefinition(definition: unknown): WorkflowDefinition {
  try {
    const validated = workflowDefinitionSchema.parse(definition);

    // Additional validation
    const validationErrors: ValidationError[] = [];

    // Check for circular dependencies
    const circularDeps = findCircularDependencies(validated.steps);
    if (circularDeps.length > 0) {
      validationErrors.push({
        message: `Circular dependencies detected: ${circularDeps.join(', ')}`,
        path: 'steps',
        rule: 'no-circular-dependencies',
        value: circularDeps,
      });
    }

    // Check that dependencies reference valid steps
    const stepIds = new Set(validated.steps.map((s: any) => s.id));
    for (const step of validated.steps) {
      if (step.dependsOn) {
        for (const dep of step.dependsOn) {
          if (!stepIds.has(dep)) {
            validationErrors.push({
              message: `Dependency "${dep}" does not reference a valid step`,
              path: `steps.${step.id}.dependsOn`,
              rule: 'valid-dependency',
              value: dep,
            });
          }
        }
      }
    }

    // Check for duplicate step IDs
    const duplicateIds = findDuplicateIds(validated.steps);
    if (duplicateIds.length > 0) {
      validationErrors.push({
        message: `Duplicate step IDs found: ${duplicateIds.join(', ')}`,
        path: 'steps',
        rule: 'unique-step-ids',
        value: duplicateIds,
      });
    }

    if (validationErrors.length > 0) {
      throw new WorkflowValidationError('Workflow definition validation failed', validationErrors);
    }

    return validated as WorkflowDefinition;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationError[] = error.issues.map((err: any) => ({
        message: err.message,
        path: err.path.join('.'),
        rule: err.code,
        value: (err as any).received,
      }));

      throw new WorkflowValidationError('Workflow definition validation failed', validationErrors);
    }

    throw error;
  }
}

/**
 * Find circular dependencies in workflow steps
 */
function findCircularDependencies(steps: WorkflowStep[]): string[] {
  const graph = new Map<string, string[]>();

  // Build dependency graph
  for (const step of steps) {
    graph.set(step.id, step.dependsOn || []);
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const circularDeps: string[] = [];

  function hasCycle(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) {
      circularDeps.push(nodeId);
      return true;
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const dependencies = graph.get(nodeId) || [];
    for (const dep of dependencies) {
      if (hasCycle(dep)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  // Check each node for cycles
  for (const step of steps) {
    if (!visited.has(step.id)) {
      hasCycle(step.id);
    }
  }

  return [...new Set(circularDeps)];
}

/**
 * Find duplicate step IDs
 */
function findDuplicateIds(steps: WorkflowStep[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const step of steps) {
    if (seen.has(step.id)) {
      duplicates.add(step.id);
    } else {
      seen.add(step.id);
    }
  }

  return Array.from(duplicates);
}

/**
 * Basic cron expression validation
 */
function isValidCronExpression(cron: string): boolean {
  // Basic validation for cron format (not comprehensive)
  const parts = cron.trim().split(/\s+/);

  // Should have 5 or 6 parts (with optional seconds)
  if (parts.length < 5 || parts.length > 6) {
    return false;
  }

  // Each part should be valid (basic check)
  const validPart = /^(\*|[0-9\-,\/]+)$/;
  return parts.every((part: any) => validPart.test(part));
}

/**
 * Validate workflow step definition
 */
export function validateWorkflowStep(step: unknown): WorkflowStep {
  try {
    return workflowStepSchema.parse(step);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationError[] = error.issues.map((err: any) => ({
        message: err.message,
        path: err.path.join('.'),
        rule: err.code,
        value: (err as any).received,
      }));

      throw new WorkflowValidationError('Workflow step validation failed', validationErrors);
    }

    throw error;
  }
}
