/**
 * Step Factory Validation Module
 *
 * Handles all validation logic for workflow steps including input/output
 * validation and step definition validation.
 */

import { type z } from 'zod';

import { createValidationError, OrchestrationErrorCodes } from '../../utils/errors';

import { StepValidationConfig, ValidationResult, WorkflowStepDefinition } from './step-types';

/**
 * Validate a workflow step definition to ensure all required fields are present
 * and configuration values are valid
 */
export function validateStepDefinition<TInput, TOutput>(
  definition: WorkflowStepDefinition<TInput, TOutput>,
): ValidationResult {
  const errors: string[] = [];

  // Validate required fields
  if (!definition.id) {
    errors.push('Step ID is required');
  }

  if (!definition.metadata.name) {
    errors.push('Step name is required');
  }

  if (!definition.metadata.version) {
    errors.push('Step version is required');
  }

  if (!definition.execute || typeof definition.execute !== 'function') {
    errors.push('Step execute function is required');
  }

  // Validate retry configuration
  if (definition.executionConfig?.retryConfig) {
    const retry = definition.executionConfig.retryConfig;
    if (retry.maxAttempts < 1) {
      errors.push('Retry maxAttempts must be at least 1');
    }
    if (retry.delay < 0) {
      errors.push('Retry delay must be non-negative');
    }
  }

  // Validate timeout configuration
  if (
    definition.executionConfig?.timeout?.execution &&
    definition.executionConfig.timeout.execution <= 0
  ) {
    errors.push('Execution timeout must be positive');
  }

  // Validate rate limit configuration
  if (definition.executionConfig?.rateLimitConfig) {
    const rateLimit = definition.executionConfig.rateLimitConfig;
    if (rateLimit.maxRequests < 1) {
      errors.push('Rate limit maxRequests must be at least 1');
    }
    if (rateLimit.windowMs <= 0) {
      errors.push('Rate limit window must be positive');
    }
  }

  // Validate concurrency configuration
  if (definition.executionConfig?.concurrency) {
    const concurrency = definition.executionConfig.concurrency;
    if (concurrency.max < 1) {
      errors.push('Concurrency max must be at least 1');
    }
    if (concurrency.queueLimit !== undefined && concurrency.queueLimit < 0) {
      errors.push('Concurrency queue limit must be non-negative');
    }
  }

  return {
    errors: errors.length > 0 ? errors : undefined,
    valid: errors.length === 0,
  };
}

/**
 * Validate step input using the configured validation schema and custom validators
 */
export async function validateStepInput<TInput>(
  input: TInput,
  config?: StepValidationConfig<TInput>,
): Promise<void> {
  if (!config) return;

  // Schema validation
  if (config.input) {
    const result = config.input.safeParse(input);
    if (!result.success) {
      throw createValidationError(
        `Input validation failed: ${result.error.issues.map((i: any) => i.message).join(', ')}`,
        {
          code: OrchestrationErrorCodes.STEP_INPUT_VALIDATION_ERROR,
          validationErrors: result.error.issues,
        },
      );
    }
  }

  // Custom validation
  if (config.customValidation) {
    const result = await config.customValidation(input);
    if (!result.valid) {
      throw createValidationError(
        `Custom input validation failed: ${result.errors?.join(', ') || 'Unknown validation error'}`,
        {
          code: OrchestrationErrorCodes.STEP_CUSTOM_VALIDATION_ERROR,
          validationResult: result,
        },
      );
    }
  }
}

/**
 * Validate step output using the configured validation schema
 */
export async function validateStepOutput<TOutput>(
  output: TOutput,
  schema?: z.ZodSchema<TOutput>,
): Promise<void> {
  if (!schema) return;

  const result = schema.safeParse(output);
  if (!result.success) {
    throw createValidationError(
      `Output validation failed: ${result.error.issues.map((i: any) => i.message).join(', ')}`,
      {
        code: OrchestrationErrorCodes.STEP_OUTPUT_VALIDATION_ERROR,
        validationErrors: result.error.issues,
      },
    );
  }
}

/**
 * Validate step execution result including both input and output validation
 */
export async function validateStepExecution<TInput, TOutput>(
  input: TInput,
  output: TOutput,
  config?: StepValidationConfig<TInput>,
  outputSchema?: z.ZodSchema<TOutput>,
): Promise<ValidationResult> {
  const errors: string[] = [];

  try {
    // Validate input
    await validateStepInput(input, config);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Input validation failed');
  }

  try {
    // Validate output
    await validateStepOutput(output, outputSchema);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Output validation failed');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Create a step validator with custom rules
 */
export function createStepValidator<TInput, TOutput>(
  config: StepValidationConfig<TInput>,
  outputSchema?: z.ZodSchema<TOutput>,
) {
  return {
    async validateInput(input: TInput): Promise<ValidationResult> {
      try {
        await validateStepInput(input, config);
        return { valid: true };
      } catch (error) {
        return {
          valid: false,
          errors: [error instanceof Error ? error.message : 'Input validation failed'],
        };
      }
    },

    async validateOutput(output: TOutput): Promise<ValidationResult> {
      try {
        await validateStepOutput(output, outputSchema);
        return { valid: true };
      } catch (error) {
        return {
          valid: false,
          errors: [error instanceof Error ? error.message : 'Output validation failed'],
        };
      }
    },

    async validateExecution(input: TInput, output: TOutput): Promise<ValidationResult> {
      return validateStepExecution(input, output, config, outputSchema);
    },

    getConfig() {
      return config;
    },

    getOutputSchema() {
      return outputSchema;
    },
  };
}
