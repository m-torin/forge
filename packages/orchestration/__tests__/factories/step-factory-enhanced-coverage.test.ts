/**
 * Comprehensive test coverage for step-factory.ts
 * Tests the core step factory functionality, patterns, and error handling
 */

import { afterEach, beforeEach, describe, expect, vi } from "vitest";

// Import after mocking
import {
  StandardWorkflowStep,
  compose,
  createStep,
  createStepWithValidation,
  toSimpleStep,
  withStepCircuitBreaker,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from "../../src/shared/factories/step-factory";

// Mock dependencies
vi.mock("@repo/observability/server/next", () => ({
  createServerObservability: vi.fn().mockResolvedValue({
    log: vi.fn(),
  }),
}));

vi.mock("nanoid", () => ({
  nanoid: vi.fn().mockReturnValue("test-id-123"),
}));

vi.mock("../../src/shared/patterns/index", () => ({
  withRetry: vi.fn().mockImplementation((fn) => fn),
  withCircuitBreaker: vi.fn().mockImplementation((fn) => fn),
}));

vi.mock("../../src/shared/utils/errors", () => ({
  createOrchestrationError: vi
    .fn()
    .mockImplementation((message) => new Error(message)),
  createValidationError: vi
    .fn()
    .mockImplementation((message) => new Error(message)),
  OrchestrationError: vi.fn(),
  OrchestrationErrorCodes: {
    STEP_EXECUTION_ERROR: "STEP_EXECUTION_ERROR",
    STEP_INPUT_VALIDATION_ERROR: "STEP_INPUT_VALIDATION_ERROR",
    STEP_OUTPUT_VALIDATION_ERROR: "STEP_OUTPUT_VALIDATION_ERROR",
  },
}));

// Mock performance modules
vi.mock("../../src/shared/factories/step-factory/step-performance", () => ({
  createProgressReporter: vi.fn().mockReturnValue(vi.fn()),
  initializePerformanceData: vi.fn().mockReturnValue({
    startTime: Date.now(),
    endTime: null,
    duration: null,
    memoryUsage: { heapUsed: 1024 },
    errors: [],
    warnings: [],
  }),
  updatePerformanceData: vi.fn(),
}));

// Mock validation modules
vi.mock("../../src/shared/factories/step-factory/step-validation", async () => {
  const actual = await vi.importActual(
    "../../src/shared/factories/step-factory/step-validation",
  );
  return {
    ...actual,
    validateStepInput: vi.fn().mockResolvedValue(undefined),
    validateStepOutput: vi.fn().mockResolvedValue(undefined),
  };
});

describe("standardWorkflowStep", () => {
  let mockDefinition: any;
  let mockConfig: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockDefinition = {
      id: "test-step",
      metadata: {
        name: "Test Step",
        version: "1.0.0",
      },
      execute: vi.fn().mockImplementation((context) => ({
        success: true,
        output: "test-output",
        performance: context?.performance || {
          startTime: Date.now(),
          endTime: null,
          duration: null,
          memoryUsage: { heapUsed: 1024 },
          errors: [],
          warnings: [],
        },
      })),
    };

    mockConfig = {
      enablePerformanceMonitoring: true,
      enableDetailedLogging: false,
      onStepComplete: vi.fn(),
    };

    // Reset global mock
    vi.spyOn(global, "structuredClone").mockImplementation((obj) =>
      JSON.parse(JSON.stringify(obj)),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    test("should create a StandardWorkflowStep instance", () => {
      const step = new StandardWorkflowStep(mockDefinition, mockConfig);

      expect(step).toBeInstanceOf(StandardWorkflowStep);
    });

    test("should create a StandardWorkflowStep with default config", () => {
      const step = new StandardWorkflowStep(mockDefinition);

      expect(step).toBeInstanceOf(StandardWorkflowStep);
    });

    test("should handle missing structuredClone gracefully", () => {
      // Temporarily remove structuredClone to test fallback
      const originalStructuredClone = global.structuredClone;
      delete (global as any).structuredClone;

      // This should not throw an error
      expect(() => new StandardWorkflowStep(mockDefinition)).not.toThrow();

      // Restore
      global.structuredClone = originalStructuredClone;
    });
  });

  describe("validateDefinition", () => {
    test("should validate step definition", () => {
      const result = StandardWorkflowStep.validateDefinition(mockDefinition);

      expect(result).toStrictEqual({ valid: true, errors: [] });
    });
  });

  describe("execute", () => {
    let step: StandardWorkflowStep;

    beforeEach(() => {
      step = new StandardWorkflowStep(mockDefinition, mockConfig);
    });

    test("should execute step successfully", async () => {
      const input = { test: "data" };
      const workflowExecutionId = "workflow-123";

      const result = await step.execute(input, workflowExecutionId);

      expect(result.success).toBeTruthy();
      expect(result.performance).toBeDefined();
    });

    test("should execute step with previous steps context", async () => {
      const input = { test: "data" };
      const workflowExecutionId = "workflow-123";
      const previousStepsContext = { previousStep: "result" };

      const result = await step.execute(
        input,
        workflowExecutionId,
        previousStepsContext,
      );

      expect(result.success).toBeTruthy();
    });

    test("should execute step with metadata", async () => {
      const input = { test: "data" };
      const workflowExecutionId = "workflow-123";
      const previousStepsContext = {};
      const metadata = { source: "test" };

      const result = await step.execute(
        input,
        workflowExecutionId,
        previousStepsContext,
        metadata,
      );

      expect(result.success).toBeTruthy();
    });

    test("should execute step with abort signal", async () => {
      const input = { test: "data" };
      const workflowExecutionId = "workflow-123";
      const abortController = new AbortController();

      const result = await step.execute(
        input,
        workflowExecutionId,
        {},
        {},
        abortController.signal,
      );

      expect(result.success).toBeTruthy();
    });

    test("should skip execution when condition is not met", async () => {
      const stepWithCondition = new StandardWorkflowStep(
        {
          ...mockDefinition,
          condition: vi.fn().mockResolvedValue(false),
        },
        mockConfig,
      );

      const input = { test: "data" };
      const workflowExecutionId = "workflow-123";

      const result = await stepWithCondition.execute(
        input,
        workflowExecutionId,
      );

      expect(result.success).toBeTruthy();
      expect(result.skipped).toBeTruthy();
    });

    test("should execute when condition is met", async () => {
      const stepWithCondition = new StandardWorkflowStep(
        {
          ...mockDefinition,
          condition: vi.fn().mockResolvedValue(true),
        },
        mockConfig,
      );

      const input = { test: "data" };
      const workflowExecutionId = "workflow-123";

      const result = await stepWithCondition.execute(
        input,
        workflowExecutionId,
      );

      expect(result.success).toBeTruthy();
      expect(result.skipped).toBeUndefined();
    });

    test("should handle validation errors", async () => {
      const { validateStepInput } = await import(
        "../../src/shared/factories/step-factory/step-validation"
      );
      vi.mocked(validateStepInput).mockRejectedValueOnce(
        new Error("Validation failed"),
      );

      const stepWithValidation = new StandardWorkflowStep(
        {
          ...mockDefinition,
          validationConfig: {
            validateInput: true,
          },
        },
        mockConfig,
      );

      const input = { test: "data" };
      const workflowExecutionId = "workflow-123";

      const result = await stepWithValidation.execute(
        input,
        workflowExecutionId,
      );

      expect(result.success).toBeFalsy();
      expect(result.error).toBeDefined();
    });

    test("should handle execution errors", async () => {
      const errorDefinition = {
        ...mockDefinition,
        execute: vi.fn().mockRejectedValue(new Error("Execution failed")),
      };

      const step = new StandardWorkflowStep(errorDefinition, mockConfig);

      const input = { test: "data" };
      const workflowExecutionId = "workflow-123";

      const result = await step.execute(input, workflowExecutionId);

      expect(result.success).toBeFalsy();
      expect(result.error).toBeDefined();
    });

    test("should run cleanup function", async () => {
      const cleanup = vi.fn().mockResolvedValue(undefined);
      const stepWithCleanup = new StandardWorkflowStep(
        {
          ...mockDefinition,
          cleanup,
        },
        mockConfig,
      );

      const input = { test: "data" };
      const workflowExecutionId = "workflow-123";

      await stepWithCleanup.execute(input, workflowExecutionId);

      expect(cleanup).toHaveBeenCalledWith();
    });

    test("should handle cleanup errors gracefully", async () => {
      const cleanup = vi.fn().mockRejectedValue(new Error("Cleanup failed"));
      const stepWithCleanup = new StandardWorkflowStep(
        {
          ...mockDefinition,
          cleanup,
        },
        mockConfig,
      );

      const input = { test: "data" };
      const workflowExecutionId = "workflow-123";

      const result = await stepWithCleanup.execute(input, workflowExecutionId);

      expect(result.success).toBeTruthy();
      expect(cleanup).toHaveBeenCalledWith();
    });

    test("should validate output when configured", async () => {
      const { validateStepOutput } = await import(
        "../../src/shared/factories/step-factory/step-validation"
      );

      const stepWithOutputValidation = new StandardWorkflowStep(
        {
          ...mockDefinition,
          validationConfig: {
            validateOutput: true,
            output: { schema: "test" },
          },
        },
        mockConfig,
      );

      const input = { test: "data" };
      const workflowExecutionId = "workflow-123";

      await stepWithOutputValidation.execute(input, workflowExecutionId);

      expect(validateStepOutput).toHaveBeenCalledWith("test-output", {
        schema: "test",
      });
    });
  });

  describe("getMetadata", () => {
    test("should return step metadata", () => {
      const step = new StandardWorkflowStep(mockDefinition, mockConfig);

      const metadata = step.getMetadata();

      expect(metadata).toStrictEqual({
        id: "test-step",
        name: "Test Step",
        version: "1.0.0",
        executionCount: 0,
        lastExecutionTime: undefined,
      });
    });

    test("should track execution count and time", async () => {
      const step = new StandardWorkflowStep(mockDefinition, mockConfig);

      await step.execute({ test: "data" }, "workflow-123");

      const metadata = step.getMetadata();

      expect(metadata.executionCount).toBe(1);
      expect(metadata.lastExecutionTime).toBeTypeOf("number");
    });
  });
});

describe("factory Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createStep", () => {
    test("should create a simple step", () => {
      const stepFunction = vi.fn().mockResolvedValue("result");
      const step = createStep("test-step", stepFunction);

      expect(step).toBeDefined();
      expect(step.id).toBe("test-step");
      expect(step.execute).toBe(stepFunction);
    });

    test("should create a step with config", () => {
      const stepFunction = vi.fn().mockResolvedValue("result");
      const config = { timeout: 5000 };
      const step = createStep("test-step", stepFunction, config);

      expect(step).toBeDefined();
      expect(step.id).toBe("test-step");
      expect(step.execute).toBe(stepFunction);
    });
  });

  describe("createStepWithValidation", () => {
    test("should create a step with validation schema", () => {
      const stepFunction = vi.fn().mockResolvedValue("result");
      const inputSchema = { type: "object" };
      const outputSchema = { type: "string" };

      const step = createStepWithValidation(
        "validated-step",
        stepFunction,
        inputSchema,
        outputSchema,
      );

      expect(step).toBeDefined();
      expect(step.id).toBe("validated-step");
      expect(step.validationConfig).toBeDefined();
      expect(step.validationConfig.input).toBe(inputSchema);
      expect(step.validationConfig.output).toBe(outputSchema);
    });

    test("should create a step with validation options", () => {
      const stepFunction = vi.fn().mockResolvedValue("result");
      const inputSchema = { type: "object" };
      const outputSchema = { type: "string" };
      const options = { validateInput: false };

      const step = createStepWithValidation(
        "validated-step",
        stepFunction,
        inputSchema,
        outputSchema,
        options,
      );

      expect(step.validationConfig.validateInput).toBeFalsy();
    });
  });

  describe("toSimpleStep", () => {
    test("should convert function to simple step", () => {
      const stepFunction = vi.fn().mockResolvedValue("result");
      const simpleStep = toSimpleStep(stepFunction);

      expect(simpleStep).toBeDefined();
      expect(typeof simpleStep).toBe("function");
    });

    test("should execute simple step function", async () => {
      const stepFunction = vi.fn().mockResolvedValue("result");
      const simpleStep = toSimpleStep(stepFunction);

      const result = await simpleStep({ input: "test" });

      expect(result).toBe("result");
      expect(stepFunction).toHaveBeenCalledWith({ input: "test" });
    });
  });

  describe("compose", () => {
    test("should compose multiple steps", () => {
      const step1 = vi.fn().mockResolvedValue("result1");
      const step2 = vi.fn().mockResolvedValue("result2");

      const composedStep = compose(step1, step2);

      expect(composedStep).toBeDefined();
      expect(typeof composedStep).toBe("function");
    });

    test("should execute composed steps in sequence", async () => {
      const step1 = vi.fn().mockResolvedValue("result1");
      const step2 = vi.fn().mockImplementation((input) => `${input}-result2`);

      const composedStep = compose(step1, step2);

      const result = await composedStep("input");

      expect(step1).toHaveBeenCalledWith("input");
      expect(step2).toHaveBeenCalledWith("result1");
      expect(result).toBe("result1-result2");
    });

    test("should handle composition errors", async () => {
      const step1 = vi.fn().mockRejectedValue(new Error("Step 1 failed"));
      const step2 = vi.fn().mockResolvedValue("result2");

      const composedStep = compose(step1, step2);

      await expect(composedStep("input")).rejects.toThrow("Step 1 failed");
      expect(step1).toHaveBeenCalledWith("input");
      expect(step2).not.toHaveBeenCalled();
    });
  });
});

describe("step Enhancement Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("withStepRetry", () => {
    test("should create step with retry configuration", () => {
      const stepFunction = vi.fn().mockResolvedValue("result");
      const retryOptions = { maxAttempts: 3, delay: 1000 };

      const enhancedStep = withStepRetry(stepFunction, retryOptions);

      expect(enhancedStep).toBeDefined();
      expect(typeof enhancedStep).toBe("function");
    });

    test("should apply retry pattern to step execution", async () => {
      const stepFunction = vi
        .fn()
        .mockRejectedValueOnce(new Error("Attempt 1"))
        .mockRejectedValueOnce(new Error("Attempt 2"))
        .mockResolvedValueOnce("success");

      const enhancedStep = withStepRetry(stepFunction, {
        maxAttempts: 3,
        delay: 0,
      });

      const result = await enhancedStep("input");

      expect(result).toBe("success");
      expect(stepFunction).toHaveBeenCalledTimes(3);
    });
  });

  describe("withStepCircuitBreaker", () => {
    test("should create step with circuit breaker configuration", () => {
      const stepFunction = vi.fn().mockResolvedValue("result");
      const circuitOptions = { failureThreshold: 5, resetTimeout: 60000 };

      const enhancedStep = withStepCircuitBreaker(stepFunction, circuitOptions);

      expect(enhancedStep).toBeDefined();
      expect(typeof enhancedStep).toBe("function");
    });

    test("should apply circuit breaker pattern to step execution", async () => {
      const stepFunction = vi.fn().mockResolvedValue("result");
      const enhancedStep = withStepCircuitBreaker(stepFunction, {
        failureThreshold: 3,
      });

      const result = await enhancedStep("input");

      expect(result).toBe("result");
      expect(stepFunction).toHaveBeenCalledWith("input");
    });
  });

  describe("withStepTimeout", () => {
    test("should create step with timeout configuration", () => {
      const stepFunction = vi.fn().mockResolvedValue("result");
      const timeout = 5000;

      const enhancedStep = withStepTimeout(stepFunction, timeout);

      expect(enhancedStep).toBeDefined();
      expect(typeof enhancedStep).toBe("function");
    });

    test("should apply timeout to step execution", async () => {
      const stepFunction = vi.fn().mockResolvedValue("result");
      const enhancedStep = withStepTimeout(stepFunction, 1000);

      const result = await enhancedStep("input");

      expect(result).toBe("result");
      expect(stepFunction).toHaveBeenCalledWith("input");
    });

    test("should handle timeout errors", async () => {
      const stepFunction = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 2000)),
        );
      const enhancedStep = withStepTimeout(stepFunction, 100);

      await expect(enhancedStep("input")).rejects.toThrow();
    });
  });

  describe("withStepMonitoring", () => {
    test("should create step with monitoring configuration", () => {
      const stepFunction = vi.fn().mockResolvedValue("result");
      const monitoringConfig = { enableMetrics: true, enableLogging: true };

      const enhancedStep = withStepMonitoring(stepFunction, monitoringConfig);

      expect(enhancedStep).toBeDefined();
      expect(typeof enhancedStep).toBe("function");
    });

    test("should apply monitoring to step execution", async () => {
      const stepFunction = vi.fn().mockResolvedValue("result");
      const enhancedStep = withStepMonitoring(stepFunction, {
        enableMetrics: true,
      });

      const result = await enhancedStep("input");

      expect(result).toBe("result");
      expect(stepFunction).toHaveBeenCalledWith("input");
    });
  });
});

describe("integration Tests", () => {
  test("should create and execute complex step with all patterns", async () => {
    const stepFunction = vi.fn().mockImplementation(async (context) => ({
      success: true,
      output: "complex-result",
      performance: context?.performance || {
        startTime: Date.now(),
        endTime: null,
        duration: null,
        memoryUsage: { heapUsed: 1024 },
        errors: [],
        warnings: [],
      },
    }));

    // Create full step definition with proper execution function
    const stepDefinition = createWorkflowStep(
      { name: "Complex Step", version: "1.0.0" },
      stepFunction,
      {
        executionConfig: {
          timeout: { execution: 5000 },
          retryConfig: { maxAttempts: 2 },
          circuitBreakerConfig: { failureThreshold: 3 },
        },
        validationConfig: {
          validateInput: true,
          validateOutput: true,
        },
      },
    );

    // Create workflow step instance
    const workflowStep = new StandardWorkflowStep(stepDefinition);

    // Execute
    const result = await workflowStep.execute(
      { test: "input" },
      "workflow-123",
      { previousStep: "data" },
      { source: "integration-test" },
    );

    expect(result.success).toBeTruthy();
    expect(result.performance).toBeDefined();
    expect(stepFunction).toHaveBeenCalledWith();
  });

  test("should handle step failure with all error handling patterns", async () => {
    const stepFunction = vi.fn().mockRejectedValue(new Error("Step failed"));

    // Create full step definition with proper error handling
    const stepDefinition = createWorkflowStep(
      { name: "Failing Step", version: "1.0.0" },
      stepFunction,
      {
        executionConfig: {
          retryConfig: { maxAttempts: 2 },
        },
      },
    );

    const workflowStep = new StandardWorkflowStep(stepDefinition);

    const result = await workflowStep.execute(
      { test: "input" },
      "workflow-123",
    );

    expect(result.success).toBeFalsy();
    expect(result.error).toBeDefined();
    expect(result.performance).toBeDefined();
  });

  test("should compose multiple enhanced steps", async () => {
    const step1 = vi.fn().mockResolvedValue("step1-result");
    const step2 = vi.fn().mockImplementation((input) => `${input}-step2`);
    const step3 = vi.fn().mockImplementation((input) => `${input}-step3`);

    const enhancedStep1 = withStepMonitoring(step1, { enableMetrics: true });
    const enhancedStep2 = withStepRetry(step2, { maxAttempts: 2 });
    const enhancedStep3 = withStepTimeout(step3, 1000);

    const composedStep = compose(
      compose(enhancedStep1, enhancedStep2),
      enhancedStep3,
    );

    const result = await composedStep("input");

    expect(result).toBe("step1-result-step2-step3");
    expect(step1).toHaveBeenCalledWith("input");
    expect(step2).toHaveBeenCalledWith("step1-result");
    expect(step3).toHaveBeenCalledWith("step1-result-step2");
  });
});
