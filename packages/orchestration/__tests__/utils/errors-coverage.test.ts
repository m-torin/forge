/**
 * Comprehensive test coverage for errors.ts
 * Focuses on testing all error classes, functions, and edge cases
 */

import { describe, expect } from "vitest";

import {
  CircuitBreakerError,
  ConfigurationError,
  OrchestrationError,
  OrchestrationErrorCodes,
  ProviderError,
  RateLimitError,
  TimeoutError,
  WorkflowExecutionError,
  WorkflowValidationError,
  createOrchestrationError,
  createProviderError,
  createProviderErrorWithCode,
  createValidationError,
  createWorkflowExecutionError,
  createWorkflowExecutionErrorWithCode,
  extractErrorDetails,
  isRetryableError,
} from "../../src/shared/utils/errors";

describe("error Classes", () => {
  describe("orchestrationError", () => {
    test("should create basic orchestration error", () => {
      const error = new OrchestrationError("Test error");

      expect(error.name).toBe("OrchestrationError");
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("ORCHESTRATION_ERROR");
      expect(error.retryable).toBeFalsy();
      expect(error.context).toBeUndefined();
    });

    test("should create orchestration error with all parameters", () => {
      const context = { key: "value" };
      const error = new OrchestrationError(
        "Custom error",
        "CUSTOM_CODE",
        true,
        context,
      );

      expect(error.name).toBe("OrchestrationError");
      expect(error.message).toBe("Custom error");
      expect(error.code).toBe("CUSTOM_CODE");
      expect(error.retryable).toBeTruthy();
      expect(error.context).toStrictEqual(context);
    });

    test("should serialize to JSON", () => {
      const context = { key: "value" };
      const error = new OrchestrationError(
        "Test error",
        "TEST_CODE",
        true,
        context,
      );

      const json = error.toJSON();

      expect(json.name).toBe("OrchestrationError");
      expect(json.message).toBe("Test error");
      expect(json.code).toBe("TEST_CODE");
      expect(json.retryable).toBeTruthy();
      expect(json.context).toStrictEqual(context);
      expect(json.stack).toBeDefined();
    });
  });

  describe("circuitBreakerError", () => {
    test("should create circuit breaker error", () => {
      const error = new CircuitBreakerError(
        "Circuit breaker open",
        "test-circuit",
        "open",
      );

      expect(error.name).toBe("CircuitBreakerError");
      expect(error.message).toBe("Circuit breaker open");
      expect(error.code).toBe("CIRCUIT_BREAKER_OPEN");
      expect(error.retryable).toBeTruthy();
      expect(error.circuitName).toBe("test-circuit");
      expect(error.state).toBe("open");
    });

    test("should create circuit breaker error with half-open state", () => {
      const context = { attempts: 3 };
      const error = new CircuitBreakerError(
        "Circuit half-open",
        "another-circuit",
        "half-open",
        context,
      );

      expect(error.state).toBe("half-open");
      expect(error.context).toStrictEqual(context);
    });
  });

  describe("configurationError", () => {
    test("should create configuration error", () => {
      const error = new ConfigurationError("Invalid config");

      expect(error.name).toBe("ConfigurationError");
      expect(error.message).toBe("Invalid config");
      expect(error.code).toBe("CONFIGURATION_ERROR");
      expect(error.retryable).toBeFalsy();
      expect(error.configPath).toBeUndefined();
    });

    test("should create configuration error with path and context", () => {
      const context = { field: "timeout" };
      const error = new ConfigurationError(
        "Invalid timeout",
        "app.timeout",
        context,
      );

      expect(error.configPath).toBe("app.timeout");
      expect(error.context).toStrictEqual(context);
    });
  });

  describe("providerError", () => {
    test("should create provider error with defaults", () => {
      const error = new ProviderError(
        "Provider failed",
        "test-provider",
        "upstash",
      );

      expect(error.name).toBe("ProviderError");
      expect(error.message).toBe("Provider failed");
      expect(error.code).toBe("PROVIDER_ERROR");
      expect(error.retryable).toBeTruthy();
      expect(error.providerName).toBe("test-provider");
      expect(error.providerType).toBe("upstash");
    });

    test("should create provider error with custom parameters", () => {
      const context = { attempt: 2 };
      const error = new ProviderError(
        "Custom provider error",
        "custom-provider",
        "custom-type",
        "CUSTOM_PROVIDER_ERROR",
        false,
        context,
      );

      expect(error.code).toBe("CUSTOM_PROVIDER_ERROR");
      expect(error.retryable).toBeFalsy();
      expect(error.context).toStrictEqual(context);
    });
  });

  describe("rateLimitError", () => {
    test("should create rate limit error", () => {
      const error = new RateLimitError("Rate limit exceeded", 100, 3600, 120);

      expect(error.name).toBe("RateLimitError");
      expect(error.message).toBe("Rate limit exceeded");
      expect(error.code).toBe("RATE_LIMIT_EXCEEDED");
      expect(error.retryable).toBeTruthy();
      expect(error.limit).toBe(100);
      expect(error.window).toBe(3600);
      expect(error.retryAfter).toBe(120);
    });

    test("should create rate limit error without retry after", () => {
      const context = { userId: "123" };
      const error = new RateLimitError(
        "Rate limit hit",
        50,
        1800,
        undefined,
        context,
      );

      expect(error.retryAfter).toBeUndefined();
      expect(error.context).toStrictEqual(context);
    });
  });

  describe("timeoutError", () => {
    test("should create timeout error", () => {
      const error = new TimeoutError("Operation timed out", 5000);

      expect(error.name).toBe("TimeoutError");
      expect(error.message).toBe("Operation timed out");
      expect(error.code).toBe("OPERATION_TIMEOUT");
      expect(error.retryable).toBeFalsy();
      expect(error.timeoutMs).toBe(5000);
    });

    test("should create timeout error with context", () => {
      const context = { operation: "database-query" };
      const error = new TimeoutError("DB timeout", 10000, context);

      expect(error.context).toStrictEqual(context);
    });
  });

  describe("workflowExecutionError", () => {
    test("should create workflow execution error with defaults", () => {
      const error = new WorkflowExecutionError(
        "Workflow failed",
        "workflow-123",
      );

      expect(error.name).toBe("WorkflowExecutionError");
      expect(error.message).toBe("Workflow failed");
      expect(error.code).toBe("WORKFLOW_EXECUTION_ERROR");
      expect(error.retryable).toBeTruthy();
      expect(error.workflowId).toBe("workflow-123");
      expect(error.executionId).toBeUndefined();
      expect(error.stepId).toBeUndefined();
    });

    test("should create workflow execution error with full context", () => {
      const context = {
        executionId: "exec-456",
        stepId: "step-789",
        attempt: 2,
      };
      const error = new WorkflowExecutionError(
        "Step failed",
        "workflow-123",
        "STEP_EXECUTION_FAILED",
        false,
        context,
      );

      expect(error.code).toBe("STEP_EXECUTION_FAILED");
      expect(error.retryable).toBeFalsy();
      expect(error.executionId).toBe("exec-456");
      expect(error.stepId).toBe("step-789");
      expect(error.context).toStrictEqual(context);
    });
  });

  describe("workflowValidationError", () => {
    test("should create workflow validation error", () => {
      const validationErrors = [
        { message: "Invalid step", path: "steps[0]" },
        { message: "Missing required field", path: "name", rule: "required" },
      ];
      const error = new WorkflowValidationError(
        "Validation failed",
        validationErrors,
      );

      expect(error.name).toBe("WorkflowValidationError");
      expect(error.message).toBe("Validation failed");
      expect(error.code).toBe("WORKFLOW_VALIDATION_ERROR");
      expect(error.retryable).toBeFalsy();
      expect(error.validationErrors).toStrictEqual(validationErrors);
    });

    test("should create workflow validation error with context", () => {
      const validationErrors = [{ message: "Invalid", path: "field" }];
      const context = { source: "api" };
      const error = new WorkflowValidationError(
        "Validation error",
        validationErrors,
        context,
      );

      expect(error.context).toStrictEqual(context);
    });
  });
});

describe("error Factory Functions", () => {
  describe("createOrchestrationError", () => {
    test("should create error with defaults", () => {
      const error = createOrchestrationError("Test error");

      expect(error.message).toBe("Test error");
      expect(error.code).toBe(OrchestrationErrorCodes.ORCHESTRATION_ERROR);
      expect(error.retryable).toBeFalsy();
      expect(error.context).toStrictEqual({});
    });

    test("should create error with all options", () => {
      const originalError = new Error("Original error");
      const context = { key: "value" };
      const error = createOrchestrationError("Custom error", {
        code: OrchestrationErrorCodes.INITIALIZATION_ERROR,
        retryable: true,
        context,
        originalError,
      });

      expect(error.code).toBe(OrchestrationErrorCodes.INITIALIZATION_ERROR);
      expect(error.retryable).toBeTruthy();
      expect(error.context.key).toBe("value");
      expect(error.context.originalError).toStrictEqual({
        message: "Original error",
        name: "Error",
        stack: originalError.stack,
      });
    });
  });

  describe("createProviderError", () => {
    test("should create provider error with defaults", () => {
      const error = createProviderError(
        "Provider error",
        "test-provider",
        "upstash",
      );

      expect(error.message).toBe("Provider error");
      expect(error.providerName).toBe("test-provider");
      expect(error.providerType).toBe("upstash");
      expect(error.code).toBe("PROVIDER_ERROR");
      expect(error.retryable).toBeTruthy();
    });

    test("should create provider error with options", () => {
      const originalError = new Error("Network error");
      const error = createProviderError(
        "Connection failed",
        "redis-provider",
        "redis",
        {
          code: "CONNECTION_ERROR",
          retryable: false,
          originalError,
        },
      );

      expect(error.code).toBe("CONNECTION_ERROR");
      expect(error.retryable).toBeFalsy();
      expect(error.context.originalError).toStrictEqual({
        message: "Network error",
        name: "Error",
        stack: originalError.stack,
      });
    });
  });

  describe("createProviderErrorWithCode", () => {
    test("should create provider error with orchestration error code", () => {
      const error = createProviderErrorWithCode(
        "Provider unhealthy",
        "test-provider",
        "upstash",
        {
          code: OrchestrationErrorCodes.PROVIDER_UNHEALTHY,
          retryable: false,
        },
      );

      expect(error.code).toBe(OrchestrationErrorCodes.PROVIDER_UNHEALTHY);
      expect(error.retryable).toBeFalsy();
    });
  });

  describe("createValidationError", () => {
    test("should create validation error with defaults", () => {
      const error = createValidationError("Validation failed");

      expect(error.message).toBe("Validation failed");
      expect(error.code).toBe(
        OrchestrationErrorCodes.STEP_INPUT_VALIDATION_ERROR,
      );
      expect(error.retryable).toBeFalsy();
    });

    test("should create validation error with validation details", () => {
      const validationErrors = [{ field: "name", error: "required" }];
      const validationResult = { success: false, errors: validationErrors };
      const error = createValidationError("Schema validation failed", {
        code: OrchestrationErrorCodes.WORKFLOW_VALIDATION_ERROR,
        validationErrors,
        validationResult,
      });

      expect(error.code).toBe(
        OrchestrationErrorCodes.WORKFLOW_VALIDATION_ERROR,
      );
      expect(error.context.validationErrors).toStrictEqual(validationErrors);
      expect(error.context.validationResult).toStrictEqual(validationResult);
    });
  });

  describe("createWorkflowExecutionError", () => {
    test("should create workflow execution error with defaults", () => {
      const error = createWorkflowExecutionError(
        "Execution failed",
        "workflow-123",
      );

      expect(error.message).toBe("Execution failed");
      expect(error.workflowId).toBe("workflow-123");
      expect(error.code).toBe("WORKFLOW_EXECUTION_ERROR");
      expect(error.retryable).toBeTruthy();
    });

    test("should create workflow execution error with full options", () => {
      const originalError = new Error("Step error");
      const error = createWorkflowExecutionError(
        "Step execution failed",
        "workflow-456",
        {
          code: "STEP_EXECUTION_ERROR",
          executionId: "exec-789",
          stepId: "step-123",
          retryable: false,
          originalError,
        },
      );

      expect(error.code).toBe("STEP_EXECUTION_ERROR");
      expect(error.executionId).toBe("exec-789");
      expect(error.stepId).toBe("step-123");
      expect(error.retryable).toBeFalsy();
      expect(error.context.originalError).toStrictEqual({
        message: "Step error",
        name: "Error",
        stack: originalError.stack,
      });
    });
  });

  describe("createWorkflowExecutionErrorWithCode", () => {
    test("should create workflow execution error with orchestration error code", () => {
      const error = createWorkflowExecutionErrorWithCode(
        "Step timeout",
        "workflow-123",
        {
          code: OrchestrationErrorCodes.STEP_TIMEOUT_ERROR,
          stepId: "step-456",
          retryable: true,
        },
      );

      expect(error.code).toBe(OrchestrationErrorCodes.STEP_TIMEOUT_ERROR);
      expect(error.stepId).toBe("step-456");
      expect(error.retryable).toBeTruthy();
    });
  });
});

describe("error Utility Functions", () => {
  describe("extractErrorDetails", () => {
    test("should extract details from basic error", () => {
      const error = new Error("Basic error");
      const details = extractErrorDetails(error);

      expect(details.message).toBe("Basic error");
      expect(details.name).toBe("Error");
      expect(details.stack).toBeDefined();
    });

    test("should extract details from orchestration error", () => {
      const context = { key: "value" };
      const error = new OrchestrationError(
        "Orchestration error",
        "CUSTOM_CODE",
        true,
        context,
      );
      const details = extractErrorDetails(error);

      expect(details.message).toBe("Orchestration error");
      expect(details.name).toBe("OrchestrationError");
      expect(details.code).toBe("CUSTOM_CODE");
      expect(details.retryable).toBeTruthy();
      expect(details.context).toStrictEqual(context);
    });

    test("should extract details from workflow execution error", () => {
      const error = new WorkflowExecutionError(
        "Workflow error",
        "workflow-123",
        "WORKFLOW_ERROR",
        false,
        { executionId: "exec-456", stepId: "step-789" },
      );
      const details = extractErrorDetails(error);

      expect(details.workflowId).toBe("workflow-123");
      expect(details.executionId).toBe("exec-456");
      expect(details.stepId).toBe("step-789");
    });

    test("should extract details from provider error", () => {
      const error = new ProviderError(
        "Provider error",
        "test-provider",
        "upstash",
      );
      const details = extractErrorDetails(error);

      expect(details.providerName).toBe("test-provider");
      expect(details.providerType).toBe("upstash");
    });

    test("should handle error with null message", () => {
      const error = new Error();
      // Force null message for edge case testing
      (error as any).message = null;
      const details = extractErrorDetails(error);

      expect(details.message).toBe("Unknown error");
    });
  });

  describe("isRetryableError", () => {
    test("should return retryable status for orchestration error", () => {
      const retryableError = new OrchestrationError("Error", "CODE", true);
      const nonRetryableError = new OrchestrationError("Error", "CODE", false);

      expect(isRetryableError(retryableError)).toBeTruthy();
      expect(isRetryableError(nonRetryableError)).toBeFalsy();
    });

    test("should detect retryable network errors", () => {
      const networkErrors = [
        new Error("ECONNRESET"),
        new Error("ENOTFOUND error occurred"),
        new Error("Connection ECONNREFUSED"),
        new Error("Request ETIMEDOUT"),
        new Error("EAI_AGAIN lookup failed"),
        new Error("RATE_LIMIT exceeded"),
        new Error("SERVICE_UNAVAILABLE"),
        new Error("INTERNAL_SERVER_ERROR occurred"),
      ];

      networkErrors.forEach((error) => {
        expect(isRetryableError(error)).toBeTruthy();
      });
    });

    test("should not mark non-retryable errors as retryable", () => {
      const nonRetryableErrors = [
        new Error("Invalid input"),
        new Error("Authentication failed"),
        new Error("Permission denied"),
        new Error("Not found"),
      ];

      nonRetryableErrors.forEach((error) => {
        expect(isRetryableError(error)).toBeFalsy();
      });
    });

    test("should handle errors with null/undefined message", () => {
      const error = new Error();
      (error as any).message = null;

      expect(isRetryableError(error)).toBeFalsy();
    });

    test("should handle non-Error objects gracefully", () => {
      const notAnError = { message: "ECONNRESET" } as Error;

      expect(isRetryableError(notAnError)).toBeTruthy();
    });
  });
});

describe("orchestrationErrorCodes", () => {
  test("should have all expected error codes", () => {
    const expectedCodes = [
      "ORCHESTRATION_ERROR",
      "INITIALIZATION_ERROR",
      "CONFIGURATION_ERROR",
      "PROVIDER_ERROR",
      "PROVIDER_NOT_FOUND",
      "PROVIDER_REGISTRATION_ERROR",
      "PROVIDER_UNHEALTHY",
      "NO_PROVIDER_AVAILABLE",
      "WORKFLOW_EXECUTION_ERROR",
      "WORKFLOW_VALIDATION_ERROR",
      "STEP_EXECUTION_ERROR",
      "STEP_EXECUTION_FAILED",
      "STEP_TIMEOUT_ERROR",
      "STEP_NOT_FOUND",
      "STEP_INPUT_VALIDATION_ERROR",
      "STEP_OUTPUT_VALIDATION_ERROR",
      "STEP_CUSTOM_VALIDATION_ERROR",
      "STEP_FACTORY_DISABLED",
      "STEP_COMPOSITION_ERROR",
      "DUPLICATE_STEP",
      "INVALID_STEP_DEFINITION",
      "INVALID_STEP_REGISTRATION",
      "CIRCUIT_BREAKER_OPEN",
      "RATE_LIMIT_EXCEEDED",
      "MAX_RETRIES_EXCEEDED",
      "OPERATION_TIMEOUT",
      "PARTIAL_FAILURE",
      "CRITICAL_ERROR",
      "INVALID_INPUT",
      "SHUTDOWN_ERROR",
      "GET_EXECUTION_ERROR",
      "CANCEL_EXECUTION_ERROR",
      "LIST_EXECUTIONS_ERROR",
      "SCHEDULE_WORKFLOW_ERROR",
      "UNSCHEDULE_WORKFLOW_ERROR",
    ];

    expectedCodes.forEach((code) => {
      expect(
        OrchestrationErrorCodes[code as keyof typeof OrchestrationErrorCodes],
      ).toBe(code);
    });
  });
});
