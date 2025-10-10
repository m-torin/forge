/**
 * AI SDK v5 Telemetry Testing Utilities
 * Helpers for testing experimental_telemetry functionality
 */

import type { TelemetrySettings } from "ai";
import { expect } from "vitest";
import { createReasoningModel, createTelemetryModel } from "./models";

/**
 * Standard telemetry configuration for testing
 */
export const createTelemetryConfig = (
  overrides?: Partial<TelemetrySettings>,
): TelemetrySettings => ({
  isEnabled: true,
  recordInputs: true,
  recordOutputs: true,
  functionId: "test-function",
  metadata: {
    testId: "telemetry-test",
    environment: "test",
    version: "1.0.0",
  },
  ...overrides,
});

/**
 * Disabled telemetry configuration for comparison tests
 */
export const createDisabledTelemetryConfig = (): TelemetrySettings => ({
  isEnabled: false,
  recordInputs: false,
  recordOutputs: false,
});

/**
 * Telemetry configuration with custom metadata
 */
export const createCustomTelemetryConfig = (
  customMetadata: Record<string, string | number | boolean>,
): TelemetrySettings => ({
  isEnabled: true,
  recordInputs: true,
  recordOutputs: true,
  functionId: "custom-test-function",
  metadata: customMetadata,
});

/**
 * Assert that telemetry is properly propagated to the model
 */
export function assertTelemetryPropagation(
  result: any,
  expectedTelemetry: TelemetrySettings,
): void {
  // Check if telemetry was recorded (this would be implementation-specific)
  expect(result).toBeDefined();

  if (expectedTelemetry.isEnabled) {
    expect(result.usage).toBeDefined();
    expect(result.usage.inputTokens).toBeGreaterThan(0);
    expect(result.usage.outputTokens).toBeGreaterThan(0);
  }
}

/**
 * Assert telemetry metadata is correctly structured
 */
export function assertTelemetryMetadata(
  telemetryConfig: TelemetrySettings,
  expectedKeys: string[],
): void {
  expect(telemetryConfig.metadata).toBeDefined();

  if (telemetryConfig.metadata) {
    expectedKeys.forEach((key) => {
      expect(telemetryConfig.metadata).toHaveProperty(key);
    });
  }
}

/**
 * Create telemetry test scenarios
 */
export const telemetryScenarios = {
  /**
   * Basic enabled telemetry
   */
  basic: () => ({
    config: createTelemetryConfig(),
    model: createTelemetryModel(),
    expected: {
      isEnabled: true,
      recordInputs: true,
      recordOutputs: true,
    },
  }),

  /**
   * Disabled telemetry
   */
  disabled: () => ({
    config: createDisabledTelemetryConfig(),
    model: createTelemetryModel(),
    expected: {
      isEnabled: false,
      recordInputs: false,
      recordOutputs: false,
    },
  }),

  /**
   * Input-only recording
   */
  inputOnly: () => ({
    config: createTelemetryConfig({ recordOutputs: false }),
    model: createTelemetryModel(),
    expected: {
      isEnabled: true,
      recordInputs: true,
      recordOutputs: false,
    },
  }),

  /**
   * Output-only recording
   */
  outputOnly: () => ({
    config: createTelemetryConfig({ recordInputs: false }),
    model: createTelemetryModel(),
    expected: {
      isEnabled: true,
      recordInputs: false,
      recordOutputs: true,
    },
  }),

  /**
   * Custom function ID and metadata
   */
  customMetadata: () => ({
    config: createCustomTelemetryConfig({
      testType: "integration",
      batchId: "batch-123",
      priority: 1,
      features: "tool-calling,streaming",
    }),
    model: createTelemetryModel(),
    expected: {
      functionId: "custom-test-function",
      metadata: {
        testType: "integration",
        batchId: "batch-123",
        priority: 1,
        features: "tool-calling,streaming",
      },
    },
  }),

  /**
   * Reasoning with telemetry
   */
  withReasoning: () => ({
    config: createTelemetryConfig(),
    model: createReasoningModel(
      "Analyzing the problem step by step...",
      "The solution is X",
    ),
    expected: {
      hasReasoning: true,
      reasoningTokens: 5,
    },
  }),
};

/**
 * Test telemetry across different AI SDK functions
 */
export const telemetryFunctionTests = {
  generateText: {
    functionId: "ai.generateText",
    spanName: "ai.generateText.doGenerate",
  },
  streamText: {
    functionId: "ai.streamText",
    spanName: "ai.streamText.doStream",
  },
  generateObject: {
    functionId: "ai.generateObject",
    spanName: "ai.generateObject.doGenerate",
  },
  streamObject: {
    functionId: "ai.streamObject",
    spanName: "ai.streamObject.doStream",
  },
  embed: {
    functionId: "ai.embed",
    spanName: "ai.embed.doEmbed",
  },
  embedMany: {
    functionId: "ai.embedMany",
    spanName: "ai.embedMany.doEmbed",
  },
};

/**
 * Mock telemetry collector for testing
 */
export class MockTelemetryCollector {
  private spans: any[] = [];
  private events: any[] = [];
  private attributes: Record<string, any> = {};

  recordSpan(spanName: string, attributes: Record<string, any>): void {
    this.spans.push({ spanName, attributes, timestamp: new Date() });
  }

  recordEvent(eventName: string, data: any): void {
    this.events.push({ eventName, data, timestamp: new Date() });
  }

  setAttributes(attributes: Record<string, any>): void {
    this.attributes = { ...this.attributes, ...attributes };
  }

  getSpans(): any[] {
    return [...this.spans];
  }

  getEvents(): any[] {
    return [...this.events];
  }

  getAttributes(): Record<string, any> {
    return { ...this.attributes };
  }

  clear(): void {
    this.spans = [];
    this.events = [];
    this.attributes = {};
  }

  // Test helpers
  findSpanByName(spanName: string): any | undefined {
    return this.spans.find((span) => span.spanName === spanName);
  }

  getSpanCount(): number {
    return this.spans.length;
  }

  hasSpanWithAttributes(
    spanName: string,
    expectedAttributes: Record<string, any>,
  ): boolean {
    const span = this.findSpanByName(spanName);
    if (!span) return false;

    return Object.entries(expectedAttributes).every(
      ([key, value]) => span.attributes[key] === value,
    );
  }
}

/**
 * Assert telemetry spans are recorded correctly
 */
export function assertTelemetrySpans(
  collector: MockTelemetryCollector,
  expectedSpans: Array<{ name: string; attributes?: Record<string, any> }>,
): void {
  expect(collector.getSpanCount()).toBe(expectedSpans.length);

  expectedSpans.forEach((expected) => {
    const span = collector.findSpanByName(expected.name);
    expect(span).toBeDefined();

    if (expected.attributes) {
      Object.entries(expected.attributes).forEach(([key, value]) => {
        expect(span.attributes[key]).toBe(value);
      });
    }
  });
}

/**
 * Performance telemetry assertions
 */
export function assertTelemetryPerformance(
  result: any,
  maxDurationMs?: number,
  minTokensPerSecond?: number,
): void {
  expect(result.usage).toBeDefined();
  expect(result.usage.totalTokens).toBeGreaterThan(0);

  if (maxDurationMs && result.duration) {
    expect(result.duration).toBeLessThan(maxDurationMs);
  }

  if (minTokensPerSecond && result.duration) {
    const tokensPerSecond = result.usage.totalTokens / (result.duration / 1000);
    expect(tokensPerSecond).toBeGreaterThan(minTokensPerSecond);
  }
}

/**
 * Error telemetry testing
 */
export function createTelemetryErrorScenario(
  errorType: "rate-limit" | "auth" | "model-error" | "network",
) {
  const config = createTelemetryConfig();

  switch (errorType) {
    case "rate-limit":
      return {
        config,
        expectedError: new Error("Rate limit exceeded"),
        expectedAttributes: {
          "error.type": "rate-limit",
          "error.recoverable": true,
        },
      };
    case "auth":
      return {
        config,
        expectedError: new Error("Authentication failed"),
        expectedAttributes: {
          "error.type": "auth",
          "error.recoverable": false,
        },
      };
    case "model-error":
      return {
        config,
        expectedError: new Error("Model processing error"),
        expectedAttributes: {
          "error.type": "model-error",
          "error.recoverable": true,
        },
      };
    case "network":
      return {
        config,
        expectedError: new Error("Network timeout"),
        expectedAttributes: {
          "error.type": "network",
          "error.recoverable": true,
        },
      };
    default:
      throw new Error(`Unknown error type: ${errorType}`);
  }
}

/**
 * Validate telemetry configuration
 */
export function validateTelemetryConfig(config: TelemetrySettings): void {
  expect(typeof config.isEnabled).toBe("boolean");

  if (config.isEnabled) {
    expect(typeof config.recordInputs).toBe("boolean");
    expect(typeof config.recordOutputs).toBe("boolean");
  }

  if (config.functionId) {
    expect(typeof config.functionId).toBe("string");
    expect(config.functionId.length).toBeGreaterThan(0);
  }

  if (config.metadata) {
    expect(typeof config.metadata).toBe("object");
    // Validate metadata value types
    Object.values(config.metadata).forEach((value) => {
      const valueType = typeof value;
      expect(["string", "number", "boolean", "object"]).toContain(valueType);

      if (Array.isArray(value)) {
        value.forEach((item) => {
          expect(
            item === null ||
              item === undefined ||
              typeof item === "string" ||
              typeof item === "number" ||
              typeof item === "boolean",
          ).toBeTruthy();
        });
      }
    });
  }
}
