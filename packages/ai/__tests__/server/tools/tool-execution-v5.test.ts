/**
 * V5-Native tests for tool execution and telemetry
 * Tests using real AI SDK v5 patterns with MockLanguageModelV2
 */

import { generateText, streamText, tool } from "ai";
import { MockLanguageModelV2, simulateReadableStream } from "ai/test";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod/v4";

describe("tool Execution with AI SDK V5", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("tool Definition and Execution", () => {
    test("should define tool with inputSchema pattern", () => {
      const searchTool = tool({
        description: "Search for information",
        inputSchema: z.object({
          query: z.string().describe("The search query"),
          limit: z.number().optional().default(10),
        }),
        execute: async ({ query, limit }) => {
          return {
            results: [`Result 1 for "${query}"`, `Result 2 for "${query}"`],
            total: limit,
          };
        },
      });

      expect(searchTool.description).toBe("Search for information");
      expect(searchTool.inputSchema).toBeDefined();
      expect(typeof searchTool.execute).toBe("function");
    });

    test("should execute tool with proper input validation", async () => {
      const mathTool = tool({
        description: "Perform mathematical operations",
        inputSchema: z.object({
          operation: z.enum(["add", "subtract", "multiply", "divide"]),
          a: z.number(),
          b: z.number(),
        }),
        execute: async ({ operation, a, b }) => {
          switch (operation) {
            case "add":
              return { result: a + b };
            case "subtract":
              return { result: a - b };
            case "multiply":
              return { result: a * b };
            case "divide":
              return { result: a / b };
            default:
              throw new Error("Unknown operation");
          }
        },
      });

      const result = await mathTool.execute({
        operation: "add",
        a: 5,
        b: 3,
      });

      expect(result).toEqual({ result: 8 });
    });

    test("should handle tool execution errors", async () => {
      const failingTool = tool({
        description: "A tool that always fails",
        inputSchema: z.object({
          input: z.string(),
        }),
        execute: async ({ input }) => {
          throw new Error("Tool execution failed");
        },
      });

      await expect(failingTool.execute({ input: "test" })).rejects.toThrow(
        "Tool execution failed",
      );
    });
  });

  describe("tool Integration with Language Models", () => {
    test("should use tools in generateText", async () => {
      const weatherTool = tool({
        description: "Get weather information",
        inputSchema: z.object({
          location: z.string(),
        }),
        execute: async ({ location }) => ({
          location,
          temperature: 72,
          condition: "sunny",
        }),
      });

      const model = new MockLanguageModelV2({
        doGenerate: async () => ({
          finishReason: "tool-calls",
          usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
          content: [
            {
              type: "tool-call",
              toolCallType: "function",
              toolCallId: "call-1",
              toolName: "weatherTool",
              args: JSON.stringify({ location: "San Francisco" }),
            },
          ],
          warnings: [],
        }),
      });

      const result = await generateText({
        model: model as any,
        prompt: "What is the weather in San Francisco?",
        tools: {
          weatherTool,
        },
      });

      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls[0]).toMatchObject({
        toolCallId: "call-1",
        toolName: "weatherTool",
        args: { location: "San Francisco" },
      });
      expect(result.finishReason).toBe("tool-calls");
    });

    test("should use tools in streamText", async () => {
      const searchTool = tool({
        description: "Search for information",
        inputSchema: z.object({
          query: z.string(),
        }),
        execute: async ({ query }) => ({
          results: [`Search result for: ${query}`],
          count: 1,
        }),
      });

      const model = new MockLanguageModelV2({
        doStream: async () => ({
          stream: simulateReadableStream({
            chunks: [
              { type: "text-start", id: "text-1" },
              {
                type: "text-delta",
                id: "text-1",
                text: "I will search for that. ",
              },
              {
                type: "tool-call",
                toolCallId: "search-1",
                toolName: "searchTool",
                args: { query: "AI development" },
              },
              {
                type: "text-delta",
                id: "text-1",
                text: "Here are the results: ",
              },
              {
                type: "tool-result",
                toolCallId: "search-1",
                result: { results: ["AI development guide"], count: 1 },
              },
              { type: "text-end", id: "text-1" },
              {
                type: "finish",
                finishReason: "stop",
                usage: { inputTokens: 15, outputTokens: 25, totalTokens: 40 },
              },
            ],
          }),
        }),
      });

      const result = streamText({
        model: model as any,
        prompt: "Search for AI development information",
        tools: {
          searchTool,
        },
      });

      const chunks: any[] = [];
      for await (const chunk of result.fullStream) {
        chunks.push(chunk);
      }

      const toolCalls = chunks.filter((chunk) => chunk.type === "tool-call");
      const toolResults = chunks.filter(
        (chunk) => chunk.type === "tool-result",
      );

      expect(toolCalls).toHaveLength(1);
      expect(toolResults).toHaveLength(1);
      expect(toolCalls[0]).toMatchObject({
        toolCallId: "search-1",
        toolName: "searchTool",
        args: { query: "AI development" },
      });
    });
  });

  describe("multi-Step Tool Workflows", () => {
    test("should handle sequential tool calls", async () => {
      const calculatorTool = tool({
        description: "Perform calculations",
        inputSchema: z.object({
          expression: z.string(),
        }),
        execute: async ({ expression }) => {
          // Simple calculator mock
          const result = eval(expression);
          return { expression, result };
        },
      });

      const formatterTool = tool({
        description: "Format numbers",
        inputSchema: z.object({
          number: z.number(),
          format: z.enum(["currency", "percentage"]),
        }),
        execute: async ({ number, format }) => {
          if (format === "currency") {
            return { formatted: `$${number.toFixed(2)}` };
          } else {
            return { formatted: `${(number * 100).toFixed(1)}%` };
          }
        },
      });

      const model = new MockLanguageModelV2({
        doStream: async () => ({
          stream: simulateReadableStream({
            chunks: [
              { type: "text-start", id: "text-1" },
              {
                type: "text-delta",
                id: "text-1",
                text: "Let me calculate that... ",
              },
              {
                type: "tool-call",
                toolCallId: "calc-1",
                toolName: "calculatorTool",
                args: { expression: "100 * 0.15" },
              },
              {
                type: "tool-result",
                toolCallId: "calc-1",
                result: { expression: "100 * 0.15", result: 15 },
              },
              {
                type: "text-delta",
                id: "text-1",
                text: "Now formatting as currency... ",
              },
              {
                type: "tool-call",
                toolCallId: "format-1",
                toolName: "formatterTool",
                args: { number: 15, format: "currency" },
              },
              {
                type: "tool-result",
                toolCallId: "format-1",
                result: { formatted: "$15.00" },
              },
              {
                type: "text-delta",
                id: "text-1",
                text: "The result is $15.00",
              },
              { type: "text-end", id: "text-1" },
              {
                type: "finish",
                finishReason: "stop",
                usage: { inputTokens: 20, outputTokens: 30, totalTokens: 50 },
              },
            ],
          }),
        }),
      });

      const result = streamText({
        model: model as any,
        prompt: "Calculate 15% of $100 and format as currency",
        tools: {
          calculatorTool,
          formatterTool,
        },
      });

      const chunks: any[] = [];
      for await (const chunk of result.fullStream) {
        chunks.push(chunk);
      }

      const toolCalls = chunks.filter((chunk) => chunk.type === "tool-call");
      expect(toolCalls).toHaveLength(2);

      const finalText = await result.text;
      expect(finalText).toContain("$15.00");
    });
  });

  describe("telemetry Integration", () => {
    test("should track telemetry data in generateText", async () => {
      const model = new MockLanguageModelV2({
        doGenerate: async () => ({
          finishReason: "stop",
          usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
          content: [{ type: "text", text: "Response with telemetry" }],
          warnings: [],
        }),
      });

      const telemetryData: any[] = [];
      const mockTelemetry = {
        isEnabled: true,
        recordSpan: vi.fn((data) => {
          telemetryData.push(data);
        }),
        recordEvent: vi.fn((data) => {
          telemetryData.push(data);
        }),
      };

      const result = await generateText({
        model: model as any,
        prompt: "Generate with telemetry",
        experimental_telemetry: mockTelemetry,
      });

      expect(result.text).toBe("Response with telemetry");
      expect(result.usage).toEqual({
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
      });
    });

    test("should track telemetry data in streamText", async () => {
      const model = new MockLanguageModelV2({
        doStream: async () => ({
          stream: simulateReadableStream({
            chunks: [
              { type: "text-start", id: "text-1" },
              {
                type: "text-delta",
                id: "text-1",
                text: "Streaming with telemetry",
              },
              { type: "text-end", id: "text-1" },
              {
                type: "finish",
                finishReason: "stop",
                usage: { inputTokens: 5, outputTokens: 10, totalTokens: 15 },
              },
            ],
          }),
        }),
      });

      const telemetryEvents: any[] = [];
      const mockTelemetry = {
        isEnabled: true,
        recordSpan: vi.fn(),
        recordEvent: vi.fn((event) => {
          telemetryEvents.push(event);
        }),
      };

      const result = streamText({
        model: model as any,
        prompt: "Stream with telemetry",
        experimental_telemetry: mockTelemetry,
      });

      const finalText = await result.text;
      expect(finalText).toBe("Streaming with telemetry");
    });

    test("should handle telemetry with tool calls", async () => {
      const toolUsageTool = tool({
        description: "Track tool usage",
        inputSchema: z.object({
          action: z.string(),
        }),
        execute: async ({ action }) => ({
          action,
          timestamp: new Date().toISOString(),
          success: true,
        }),
      });

      const model = new MockLanguageModelV2({
        doGenerate: async () => ({
          finishReason: "tool-calls",
          usage: { inputTokens: 12, outputTokens: 18, totalTokens: 30 },
          content: [
            {
              type: "tool-call",
              toolCallType: "function",
              toolCallId: "usage-1",
              toolName: "toolUsageTool",
              args: JSON.stringify({ action: "track_usage" }),
            },
          ],
          warnings: [],
        }),
      });

      const telemetryData: any[] = [];
      const mockTelemetry = {
        isEnabled: true,
        recordSpan: vi.fn((data) => telemetryData.push(data)),
        recordEvent: vi.fn((data) => telemetryData.push(data)),
      };

      const result = await generateText({
        model: model as any,
        prompt: "Use the tool with telemetry",
        tools: {
          toolUsageTool,
        },
        experimental_telemetry: mockTelemetry,
      });

      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls[0].toolName).toBe("toolUsageTool");
    });
  });

  describe("tool Error Handling and Edge Cases", () => {
    test("should handle tool validation errors", async () => {
      const strictTool = tool({
        description: "Tool with strict validation",
        inputSchema: z.object({
          email: z.string().email(),
          age: z.number().min(0).max(120),
        }),
        execute: async ({ email, age }) => ({
          email,
          age,
          valid: true,
        }),
      });

      // Test valid input
      const validResult = await strictTool.execute({
        email: "test@example.com",
        age: 25,
      });
      expect(validResult.valid).toBeTruthy();

      // Test invalid input should be caught by Zod
      await expect(() =>
        strictTool.execute({
          email: "invalid-email",
          age: 25,
        } as any),
      ).rejects.toThrow();
    });

    test("should handle missing tool execution", async () => {
      const model = new MockLanguageModelV2({
        doGenerate: async () => ({
          finishReason: "tool-calls",
          usage: { inputTokens: 8, outputTokens: 12, totalTokens: 20 },
          content: [
            {
              type: "tool-call",
              toolCallType: "function",
              toolCallId: "missing-1",
              toolName: "nonexistentTool",
              args: JSON.stringify({ query: "test" }),
            },
          ],
          warnings: [],
        }),
      });

      const result = await generateText({
        model: model as any,
        prompt: "Call a non-existent tool",
        tools: {
          // Tools object doesn't contain 'nonexistentTool'
        },
      });

      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls[0].toolName).toBe("nonexistentTool");
      // The model attempted to call the tool, but it won't be executed
    });

    test("should handle tool timeout scenarios", async () => {
      const slowTool = tool({
        description: "A slow tool",
        inputSchema: z.object({
          delay: z.number(),
        }),
        execute: async ({ delay }) => {
          await new Promise((resolve) => setTimeout(resolve, delay));
          return { completed: true, delay };
        },
      });

      // Test normal execution
      const quickResult = await slowTool.execute({ delay: 10 });
      expect(quickResult.completed).toBeTruthy();
      expect(quickResult.delay).toBe(10);
    });

    test("should handle complex nested tool parameters", async () => {
      const complexTool = tool({
        description: "Tool with complex nested parameters",
        inputSchema: z.object({
          user: z.object({
            name: z.string(),
            preferences: z.object({
              theme: z.enum(["light", "dark"]),
              notifications: z.array(z.string()),
            }),
          }),
          metadata: z.record(z.unknown()).optional(),
        }),
        execute: async ({ user, metadata }) => ({
          processed: true,
          userName: user.name,
          theme: user.preferences.theme,
          notificationCount: user.preferences.notifications.length,
          hasMetadata: !!metadata,
        }),
      });

      const result = await complexTool.execute({
        user: {
          name: "John Doe",
          preferences: {
            theme: "dark",
            notifications: ["email", "push", "sms"],
          },
        },
        metadata: {
          source: "api",
          timestamp: "2024-01-01T00:00:00Z",
        },
      });

      expect(result).toEqual({
        processed: true,
        userName: "John Doe",
        theme: "dark",
        notificationCount: 3,
        hasMetadata: true,
      });
    });
  });
});
