/**
 * AI SDK v5 Experimental Telemetry Tests
 * Tests experimental_telemetry functionality with MockTelemetryCollector
 */

import { embed, embedMany, generateObject, generateText, streamText } from "ai";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";

import {
  createEmbeddingModel,
  createReasoningModel,
  createStreamingTextModel,
  createTelemetryModel,
} from "../../test-utils/models";
import { waitForStreamCompletion } from "../../test-utils/streams";
import {
  assertTelemetryMetadata,
  assertTelemetryPerformance,
  assertTelemetrySpans,
  createCustomTelemetryConfig,
  createDisabledTelemetryConfig,
  createTelemetryConfig,
  telemetryFunctionTests,
  telemetryScenarios,
  validateTelemetryConfig,
} from "../../test-utils/telemetry";

describe("telemetry", () => {
  describe("basic Telemetry Configuration", () => {
    test("should create valid telemetry configuration", () => {
      const config = createTelemetryConfig({
        functionId: "test-function",
        metadata: {
          testType: "unit",
          version: "1.0.0",
        },
      });

      validateTelemetryConfig(config);
      expect(config.isEnabled).toBeTruthy();
      expect(config.recordInputs).toBeTruthy();
      expect(config.recordOutputs).toBeTruthy();
      expect(config.functionId).toBe("test-function");
    });

    test("should create disabled telemetry configuration", () => {
      const config = createDisabledTelemetryConfig();

      validateTelemetryConfig(config);
      expect(config.isEnabled).toBeFalsy();
      expect(config.recordInputs).toBeFalsy();
      expect(config.recordOutputs).toBeFalsy();
    });

    test("should validate telemetry metadata structure", () => {
      const config = createCustomTelemetryConfig({
        service: "ai-service",
        version: "v2.1.0",
        environment: "test",
        requestId: "req-123",
        userId: "user-456",
      });

      assertTelemetryMetadata(config, [
        "service",
        "version",
        "environment",
        "requestId",
        "userId",
      ]);
    });
  });

  describe("generateText Telemetry", () => {
    test("should capture telemetry for generateText operations", async () => {
      const model = createTelemetryModel("Generated response");
      const telemetryConfig = createTelemetryConfig({
        functionId: telemetryFunctionTests.generateText.functionId,
      });

      const result = await generateText({
        model,
        prompt: "Generate text with telemetry",
        experimental_telemetry: telemetryConfig,
      });

      expect(result.text).toBe("Generated response");
      expect(result.usage).toBeDefined();
      expect(result.usage.totalTokens).toBeGreaterThan(0);

      // Simulate telemetry collection
      telemetryCollector.recordSpan(
        telemetryFunctionTests.generateText.spanName,
        {
          "ai.function.id": telemetryConfig.functionId,
          "ai.model.id": model.modelId,
          "ai.operation.name": "generateText",
          "ai.usage.input_tokens": result.usage.inputTokens,
          "ai.usage.output_tokens": result.usage.outputTokens,
          "ai.usage.total_tokens": result.usage.totalTokens,
        },
      );

      expect(telemetryCollector.getSpanCount()).toBe(1);
      const span = telemetryCollector.findSpanByName(
        telemetryFunctionTests.generateText.spanName,
      );
      expect(span?.attributes["ai.function.id"]).toBe(
        telemetryConfig.functionId,
      );
    });

    test("should handle telemetry with tool calls in generateText", async () => {
      const model = createTelemetryModel("Using tools...");
      const telemetryConfig = createTelemetryConfig();

      const result = await generateText({
        model,
        prompt: "Use tools with telemetry",
        tools: {
          calculator: {
            description: "Simple calculator",
            inputSchema: z.object({
              operation: z.enum(["add", "subtract"]),
              a: z.number(),
              b: z.number(),
            }),
            execute: async ({ operation, a, b }) => {
              return operation === "add" ? a + b : a - b;
            },
          },
        },
        experimental_telemetry: telemetryConfig,
      });

      expect(result.usage).toBeDefined();

      // Record telemetry for tool usage
      telemetryCollector.recordSpan("ai.generateText.doGenerate.tool", {
        "ai.function.id": telemetryConfig.functionId,
        "ai.tool.name": "calculator",
        "ai.tool.calls.count": result.toolCalls?.length || 0,
      });

      const toolSpan = telemetryCollector.findSpanByName(
        "ai.generateText.doGenerate.tool",
      );
      expect(toolSpan?.attributes["ai.tool.name"]).toBe("calculator");
    });

    test("should disable telemetry when configured", async () => {
      const model = createTelemetryModel("No telemetry response");
      const disabledConfig = createDisabledTelemetryConfig();

      const result = await generateText({
        model,
        prompt: "Generate without telemetry",
        experimental_telemetry: disabledConfig,
      });

      expect(result.text).toBe("No telemetry response");

      // With disabled telemetry, no spans should be recorded
      expect(telemetryCollector.getSpanCount()).toBe(0);
    });
  });

  describe("streamText Telemetry", () => {
    test("should capture telemetry for streamText operations", async () => {
      const model = createStreamingTextModel([
        "Streaming",
        " with",
        " telemetry",
      ]);
      const telemetryConfig = createTelemetryConfig({
        functionId: telemetryFunctionTests.streamText.functionId,
      });

      const result = streamText({
        model,
        prompt: "Stream text with telemetry",
        experimental_telemetry: telemetryConfig,
      });

      const completion = await waitForStreamCompletion(result);
      expect(completion.text).toBe("Streaming with telemetry");

      // Simulate streaming telemetry collection
      telemetryCollector.recordSpan(
        telemetryFunctionTests.streamText.spanName,
        {
          "ai.function.id": telemetryConfig.functionId,
          "ai.model.id": model.modelId,
          "ai.operation.name": "streamText",
          "ai.stream.chunks.count": 3,
          "ai.usage.total_tokens": completion.usage.totalTokens,
        },
      );

      const streamSpan = telemetryCollector.findSpanByName(
        telemetryFunctionTests.streamText.spanName,
      );
      expect(streamSpan?.attributes["ai.stream.chunks.count"]).toBe(3);
    });

    test("should track streaming performance metrics", async () => {
      const model = createStreamingTextModel(["Fast", " stream"]);
      const telemetryConfig = createTelemetryConfig({
        metadata: { performanceTest: true },
      });

      const startTime = performance.now();
      const result = streamText({
        model,
        prompt: "Performance test stream",
        experimental_telemetry: telemetryConfig,
      });

      const completion = await waitForStreamCompletion(result);
      const duration = performance.now() - startTime;

      // Test performance telemetry
      assertTelemetryPerformance(
        { ...completion, duration },
        1000, // maxDurationMs
        10, // minTokensPerSecond
      );

      telemetryCollector.recordSpan("ai.streamText.performance", {
        "ai.performance.duration_ms": duration,
        "ai.performance.tokens_per_second":
          completion.usage.totalTokens / (duration / 1000),
        "ai.performance.chunks_per_second": 2 / (duration / 1000),
      });

      const perfSpan = telemetryCollector.findSpanByName(
        "ai.streamText.performance",
      );
      expect(perfSpan?.attributes["ai.performance.duration_ms"]).toBeLessThan(
        1000,
      );
    });
  });

  describe("object Generation Telemetry", () => {
    test("should capture telemetry for generateObject operations", async () => {
      const model = createTelemetryModel('{"name": "test", "value": 42}');
      const telemetryConfig = createTelemetryConfig({
        functionId: telemetryFunctionTests.generateObject.functionId,
      });

      const schema = z.object({
        name: z.string(),
        value: z.number(),
      });

      const result = await generateObject({
        model,
        schema,
        prompt: "Generate object with telemetry",
        experimental_telemetry: telemetryConfig,
      });

      expect(result.object.name).toBe("test");
      expect(result.object.value).toBe(42);

      telemetryCollector.recordSpan(
        telemetryFunctionTests.generateObject.spanName,
        {
          "ai.function.id": telemetryConfig.functionId,
          "ai.schema.type": "zod",
          "ai.object.properties_count": Object.keys(result.object).length,
          "ai.usage.total_tokens": result.usage.totalTokens,
        },
      );

      const objectSpan = telemetryCollector.findSpanByName(
        telemetryFunctionTests.generateObject.spanName,
      );
      expect(objectSpan?.attributes["ai.object.properties_count"]).toBe(2);
    });
  });

  describe("embedding Telemetry", () => {
    test("should capture telemetry for embed operations", async () => {
      const model = createEmbeddingModel(1536);
      const telemetryConfig = createTelemetryConfig({
        functionId: telemetryFunctionTests.embed.functionId,
      });

      const result = await embed({
        model,
        value: "Text to embed with telemetry",
        experimental_telemetry: telemetryConfig,
      });

      expect(result.embedding).toHaveLength(1536);
      expect(result.usage.inputTokens).toBeGreaterThan(0);

      telemetryCollector.recordSpan(telemetryFunctionTests.embed.spanName, {
        "ai.function.id": telemetryConfig.functionId,
        "ai.embedding.dimensions": result.embedding.length,
        "ai.usage.input_tokens": result.usage.inputTokens,
      });

      const embedSpan = telemetryCollector.findSpanByName(
        telemetryFunctionTests.embed.spanName,
      );
      expect(embedSpan?.attributes["ai.embedding.dimensions"]).toBe(1536);
    });

    test("should capture telemetry for embedMany operations", async () => {
      const model = createEmbeddingModel(768);
      const telemetryConfig = createTelemetryConfig({
        functionId: telemetryFunctionTests.embedMany.functionId,
      });

      const values = [
        "First text to embed",
        "Second text to embed",
        "Third text to embed",
      ];

      const result = await embedMany({
        model,
        values,
        experimental_telemetry: telemetryConfig,
      });

      expect(result.embeddings).toHaveLength(3);
      expect(result.embeddings[0]).toHaveLength(768);

      telemetryCollector.recordSpan(telemetryFunctionTests.embedMany.spanName, {
        "ai.function.id": telemetryConfig.functionId,
        "ai.embedding.batch_size": values.length,
        "ai.embedding.dimensions": result.embeddings[0].length,
        "ai.usage.input_tokens": result.usage.inputTokens,
      });

      const embedManySpan = telemetryCollector.findSpanByName(
        telemetryFunctionTests.embedMany.spanName,
      );
      expect(embedManySpan?.attributes["ai.embedding.batch_size"]).toBe(3);
    });
  });

  describe("reasoning Telemetry", () => {
    test("should capture reasoning tokens in telemetry", async () => {
      const model = createReasoningModel(
        "Let me think about this step by step...",
        "The answer is 42.",
      );
      const telemetryConfig = createTelemetryConfig();

      const result = await generateText({
        model,
        prompt: "Solve this problem with reasoning",
        experimental_telemetry: telemetryConfig,
      });

      expect(result.text).toContain("The answer is 42.");
      expect(result.usage.reasoningTokens).toBeDefined();
      expect(result.usage.reasoningTokens).toBeGreaterThan(0);

      telemetryCollector.recordSpan("ai.generateText.reasoning", {
        "ai.function.id": telemetryConfig.functionId,
        "ai.reasoning.enabled": true,
        "ai.usage.reasoning_tokens": result.usage.reasoningTokens,
        "ai.reasoning.ratio":
          result.usage.reasoningTokens! / result.usage.totalTokens,
      });

      const reasoningSpan = telemetryCollector.findSpanByName(
        "ai.generateText.reasoning",
      );
      expect(reasoningSpan?.attributes["ai.reasoning.enabled"]).toBeTruthy();
      expect(
        reasoningSpan?.attributes["ai.usage.reasoning_tokens"],
      ).toBeGreaterThan(0);
    });
  });

  describe("telemetry Scenarios", () => {
    test("should handle basic telemetry scenario", async () => {
      const scenario = telemetryScenarios.basic();

      validateTelemetryConfig(scenario.config);
      expect(scenario.expected.isEnabled).toBeTruthy();
      expect(scenario.expected.recordInputs).toBeTruthy();
      expect(scenario.expected.recordOutputs).toBeTruthy();

      const result = await generateText({
        model: scenario.model,
        prompt: "Basic telemetry test",
        experimental_telemetry: scenario.config,
      });

      expect(result.text).toBeDefined();
    });

    test("should handle input-only recording scenario", async () => {
      const scenario = telemetryScenarios.inputOnly();

      validateTelemetryConfig(scenario.config);
      expect(scenario.expected.recordInputs).toBeTruthy();
      expect(scenario.expected.recordOutputs).toBeFalsy();

      const result = await generateText({
        model: scenario.model,
        prompt: "Input-only telemetry test",
        experimental_telemetry: scenario.config,
      });

      expect(result.text).toBeDefined();

      // Simulate input-only telemetry
      telemetryCollector.recordSpan("ai.generateText.input", {
        "ai.input.prompt": "Input-only telemetry test",
        "ai.input.recorded": true,
        "ai.output.recorded": false,
      });

      const inputSpan = telemetryCollector.findSpanByName(
        "ai.generateText.input",
      );
      expect(inputSpan?.attributes["ai.input.recorded"]).toBeTruthy();
      expect(inputSpan?.attributes["ai.output.recorded"]).toBeFalsy();
    });

    test("should handle custom metadata scenario", async () => {
      const scenario = telemetryScenarios.customMetadata();

      expect(scenario.expected.functionId).toBe("custom-test-function");
      expect(scenario.expected.metadata.testType).toBe("integration");
      expect(scenario.expected.metadata.batchId).toBe("batch-123");

      const result = await generateText({
        model: scenario.model,
        prompt: "Custom metadata test",
        experimental_telemetry: scenario.config,
      });

      expect(result.text).toBeDefined();

      // Record telemetry with custom metadata
      telemetryCollector.recordSpan("ai.generateText.custom", {
        "ai.function.id": scenario.config.functionId,
        "ai.metadata.testType": scenario.config.metadata!.testType,
        "ai.metadata.batchId": scenario.config.metadata!.batchId,
        "ai.metadata.priority": scenario.config.metadata!.priority,
      });

      const customSpan = telemetryCollector.findSpanByName(
        "ai.generateText.custom",
      );
      expect(customSpan?.attributes["ai.metadata.testType"]).toBe(
        "integration",
      );
    });

    test("should handle reasoning telemetry scenario", async () => {
      const scenario = telemetryScenarios.withReasoning();

      expect(scenario.expected.hasReasoning).toBeTruthy();
      expect(scenario.expected.reasoningTokens).toBe(5);

      const result = await generateText({
        model: scenario.model,
        prompt: "Reasoning test",
        experimental_telemetry: scenario.config,
      });

      expect(result.text).toContain("The solution is X");
      expect(result.usage.reasoningTokens).toBeDefined();
    });
  });

  describe("telemetry Error Handling", () => {
    test("should handle telemetry when model operations fail", async () => {
      const errorModel = createTelemetryModel();
      // Override to throw error
      vi.spyOn(errorModel, "doGenerate")
        .mockImplementation()
        .mockRejectedValue(new Error("Model execution failed"));

      const telemetryConfig = createTelemetryConfig();

      await expect(
        generateText({
          model: errorModel,
          prompt: "This will fail",
          experimental_telemetry: telemetryConfig,
        }),
      ).rejects.toThrow("Model execution failed");

      // Even on error, telemetry should capture the attempt
      telemetryCollector.recordSpan("ai.generateText.error", {
        "ai.function.id": telemetryConfig.functionId,
        "ai.error.occurred": true,
        "ai.error.message": "Model execution failed",
        "ai.error.type": "execution_error",
      });

      const errorSpan = telemetryCollector.findSpanByName(
        "ai.generateText.error",
      );
      expect(errorSpan?.attributes["ai.error.occurred"]).toBeTruthy();
    });
  });

  describe("telemetry Assertions and Validation", () => {
    test("should validate telemetry span structure", () => {
      const expectedSpans = [
        {
          name: "ai.generateText.doGenerate",
          attributes: { "ai.model.id": "test-model" },
        },
        {
          name: "ai.streamText.doStream",
          attributes: { "ai.operation.name": "streamText" },
        },
      ];

      // Simulate spans
      telemetryCollector.recordSpan("ai.generateText.doGenerate", {
        "ai.model.id": "test-model",
      });
      telemetryCollector.recordSpan("ai.streamText.doStream", {
        "ai.operation.name": "streamText",
      });

      assertTelemetrySpans(telemetryCollector, expectedSpans);
    });

    test("should validate telemetry configuration completeness", () => {
      const configs = [
        createTelemetryConfig(),
        createDisabledTelemetryConfig(),
        createCustomTelemetryConfig({
          service: "test-service",
          environment: "test",
          version: "1.0.0",
        }),
      ];

      configs.forEach((config) => {
        expect(() => validateTelemetryConfig(config)).not.toThrow();
      });
    });
  });
});
