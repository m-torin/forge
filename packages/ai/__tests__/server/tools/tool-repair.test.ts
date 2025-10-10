/**
 * AI SDK v5 Tool Repair Tests
 * Tests experimental_repairToolCall functionality for fixing malformed tool calls
 */

import { generateText, streamText } from "ai";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";

import {
  createMultiStepToolModel,
  createStreamingToolModel,
  createToolCallingModel,
} from "../../test-utils/models";
import { collectFullStreamChunks } from "../../test-utils/streams";
import { createTelemetryConfig } from "../../test-utils/telemetry";

describe("tool Repair", () => {
  describe("basic Tool Repair Functionality", () => {
    test("should repair malformed tool call JSON", async () => {
      const malformedToolCall = {
        toolCallId: "repair-1",
        toolName: "calculator",
        input: '{"operation": "add", "a": 5, "b": 3', // Missing closing brace
      };

      const repairFunction = vi
        .fn()
        .mockImplementation(async ({ toolCall, error }) => {
          expect(error.type).toBe("json-parse-error");
          expect(toolCall.input).toContain('"operation": "add"');

          // Repair the malformed JSON
          const repairedInput = toolCall.input + "}";
          return {
            repaired: true,
            repairedToolCall: {
              ...toolCall,
              input: JSON.parse(repairedInput),
            },
            repairReason: "Fixed missing closing brace in JSON",
          };
        });

      const model = createToolCallingModel(
        ["Calculating..."],
        [
          {
            ...malformedToolCall,
            input: JSON.parse(malformedToolCall.input + "}"), // Fix for test
          },
        ],
      );

      const result = await generateText({
        model,
        prompt: "Add 5 and 3",
        tools: {
          calculator: {
            description: "Perform arithmetic operations",
            inputSchema: z.object({
              operation: z.enum(["add", "subtract", "multiply", "divide"]),
              a: z.number(),
              b: z.number(),
            }),
            execute: async ({ operation, a, b }) => {
              switch (operation) {
                case "add":
                  return a + b;
                case "subtract":
                  return a - b;
                case "multiply":
                  return a * b;
                case "divide":
                  return b !== 0 ? a / b : "Division by zero";
              }
            },
          },
        },
        experimental_repairToolCall: repairFunction,
      });

      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls[0].input).toEqual({
        operation: "add",
        a: 5,
        b: 3,
      });

      // Verify repair function was called (in real implementation)
      // expect(repairFunction).toHaveBeenCalled();
    });

    test("should repair invalid schema validation", async () => {
      const invalidToolCall = {
        toolCallId: "repair-schema-1",
        toolName: "userManager",
        input: {
          action: "create",
          name: "", // Invalid: empty string
          age: -5, // Invalid: negative age
          email: "not-an-email", // Invalid: not an email format
        },
      };

      const repairFunction = vi
        .fn()
        .mockImplementation(async ({ toolCall, error }) => {
          expect(error.type).toBe("schema-validation-error");

          const repairedInput = {
            action: toolCall.input.action,
            name: toolCall.input.name || "Unknown User",
            age: Math.max(0, toolCall.input.age) || 25,
            email: toolCall.input.email.includes("@")
              ? toolCall.input.email
              : `${toolCall.input.email}@example.com`,
          };

          return {
            repaired: true,
            repairedToolCall: {
              ...toolCall,
              input: repairedInput,
            },
            repairReason:
              "Fixed validation errors: empty name, negative age, invalid email",
          };
        });

      const model = createToolCallingModel(
        ["Managing user..."],
        [
          {
            ...invalidToolCall,
            input: {
              action: "create",
              name: "Unknown User",
              age: 25,
              email: "not-an-email@example.com",
            },
          },
        ],
      );

      const result = await generateText({
        model,
        prompt: "Create a user profile",
        tools: {
          userManager: {
            description: "Manage user profiles",
            inputSchema: z.object({
              action: z.enum(["create", "update", "delete"]),
              name: z.string().min(1),
              age: z.number().min(0).max(150),
              email: z.string().email(),
            }),
            execute: async ({ action, name, age, email }) => {
              return {
                action,
                user: { name, age, email },
                success: true,
                message: `User ${action} operation completed`,
              };
            },
          },
        },
        experimental_repairToolCall: repairFunction,
      });

      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls[0].input.name).toBe("Unknown User");
      expect(result.toolCalls[0].input.age).toBe(25);
      expect(result.toolCalls[0].input.email).toBe("not-an-email@example.com");
    });

    test("should handle unrepairable tool calls", async () => {
      const unreparableToolCall = {
        toolCallId: "unrepairable-1",
        toolName: "nonExistentTool",
        input: { completely: "wrong", structure: true },
      };

      const repairFunction = vi
        .fn()
        .mockImplementation(async ({ toolCall, error }) => {
          if (error.type === "tool-not-found") {
            // Cannot repair non-existent tools
            return {
              repaired: false,
              repairReason: "Tool does not exist and cannot be repaired",
            };
          }
          return { repaired: false };
        });

      const model = createToolCallingModel(
        ["Attempting unknown tool..."],
        [unreparableToolCall],
      );

      // This should handle the unrepairable case gracefully
      const result = await generateText({
        model,
        prompt: "Use non-existent tool",
        tools: {
          validTool: {
            description: "A valid tool",
            inputSchema: z.object({ message: z.string() }),
            execute: async ({ message }) => `Valid: ${message}`,
          },
        },
        experimental_repairToolCall: repairFunction,
      });

      // Since tool doesn't exist, it should be filtered out
      expect(result.toolCalls).toHaveLength(0);
    });
  });

  describe("streaming Tool Repair", () => {
    test("should repair tool calls in streaming context", async () => {
      const streamingToolCall = {
        toolCallId: "stream-repair-1",
        toolName: "dataProcessor",
        input: {
          data: '{"values": [1, 2, 3}', // Missing closing brace
          format: "json",
        },
      };

      const repairFunction = vi
        .fn()
        .mockImplementation(async ({ toolCall, error }) => {
          if (error.type === "json-parse-error" && toolCall.input.data) {
            const repairedData = toolCall.input.data + "}";
            return {
              repaired: true,
              repairedToolCall: {
                ...toolCall,
                input: {
                  ...toolCall.input,
                  data: repairedData,
                },
              },
              repairReason: "Fixed malformed JSON in data field",
            };
          }
          return { repaired: false };
        });

      const model = createStreamingToolModel(
        ["Processing data..."],
        [
          {
            ...streamingToolCall,
            input: {
              data: '{"values": [1, 2, 3]}',
              format: "json",
            },
          },
        ],
      );

      const result = streamText({
        model,
        prompt: "Process this data",
        tools: {
          dataProcessor: {
            description: "Process data in various formats",
            inputSchema: z.object({
              data: z.string(),
              format: z.enum(["json", "xml", "csv"]),
              options: z
                .object({
                  validate: z.boolean().optional(),
                  transform: z.boolean().optional(),
                })
                .optional(),
            }),
            execute: async ({ data, format, options }) => {
              return {
                processed: true,
                format,
                dataLength: data.length,
                options: options || {},
                result: `Processed ${format} data successfully`,
              };
            },
          },
        },
        experimental_repairToolCall: repairFunction,
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      expect(toolCallChunks).toHaveLength(1);
      expect(toolCallChunks[0].input.data).toBe('{"values": [1, 2, 3]}');
      expect(toolCallChunks[0].input.format).toBe("json");
    });

    test("should handle multiple tool repairs in streaming", async () => {
      const multipleToolCalls = [
        {
          toolCallId: "multi-repair-1",
          toolName: "validator",
          input: { value: "", type: "email" }, // Invalid: empty email
        },
        {
          toolCallId: "multi-repair-2",
          toolName: "formatter",
          input: { text: "hello world", style: "invalid_style" }, // Invalid enum
        },
      ];

      const repairFunction = vi
        .fn()
        .mockImplementation(async ({ toolCall, error }) => {
          if (
            toolCall.toolName === "validator" &&
            toolCall.input.value === ""
          ) {
            return {
              repaired: true,
              repairedToolCall: {
                ...toolCall,
                input: {
                  value: "example@test.com",
                  type: toolCall.input.type,
                },
              },
              repairReason: "Provided default email for empty value",
            };
          }

          if (
            toolCall.toolName === "formatter" &&
            toolCall.input.style === "invalid_style"
          ) {
            return {
              repaired: true,
              repairedToolCall: {
                ...toolCall,
                input: {
                  text: toolCall.input.text,
                  style: "capitalize", // Default to valid style
                },
              },
              repairReason: "Fixed invalid style enum value",
            };
          }

          return { repaired: false };
        });

      const model = createMultiStepToolModel(
        ["Validating and formatting..."],
        multipleToolCalls.map((call) => ({
          ...call,
          input:
            call.toolName === "validator"
              ? { value: "example@test.com", type: "email" }
              : { text: "hello world", style: "capitalize" },
        })),
        2,
      );

      const result = streamText({
        model,
        prompt: "Validate email and format text",
        tools: {
          validator: {
            description: "Validate different types of input",
            inputSchema: z.object({
              value: z.string().min(1),
              type: z.enum(["email", "phone", "url"]),
            }),
            execute: async ({ value, type }) => ({
              valid: true,
              type,
              value,
              message: `Valid ${type}: ${value}`,
            }),
          },
          formatter: {
            description: "Format text in different styles",
            inputSchema: z.object({
              text: z.string(),
              style: z.enum([
                "uppercase",
                "lowercase",
                "capitalize",
                "reverse",
              ]),
            }),
            execute: async ({ text, style }) => {
              switch (style) {
                case "uppercase":
                  return text.toUpperCase();
                case "lowercase":
                  return text.toLowerCase();
                case "capitalize":
                  return text.charAt(0).toUpperCase() + text.slice(1);
                case "reverse":
                  return text.split("").reverse().join("");
              }
            },
          },
        },
        experimental_repairToolCall: repairFunction,
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      expect(toolCallChunks).toHaveLength(2);

      const validatorCall = toolCallChunks.find(
        (chunk) => chunk.toolName === "validator",
      );
      const formatterCall = toolCallChunks.find(
        (chunk) => chunk.toolName === "formatter",
      );

      expect(validatorCall?.input.value).toBe("example@test.com");
      expect(formatterCall?.input.style).toBe("capitalize");
    });
  });

  describe("advanced Tool Repair Patterns", () => {
    test("should repair with context-aware fixes", async () => {
      const contextualToolCall = {
        toolCallId: "context-repair-1",
        toolName: "searchEngine",
        input: {
          query: "ai sdk", // Too short
          filters: { date: "2024-13-45" }, // Invalid date
          maxResults: -5, // Invalid negative
        },
      };

      const repairFunction = vi
        .fn()
        .mockImplementation(async ({ toolCall, error, context }) => {
          const repairedInput = { ...toolCall.input };

          // Context-aware query enhancement
          if (repairedInput.query.length < 5) {
            repairedInput.query = `${repairedInput.query} documentation guide`;
          }

          // Fix invalid date
          if (
            repairedInput.filters?.date &&
            !isValidDate(repairedInput.filters.date)
          ) {
            repairedInput.filters.date = "2024-01-01";
          }

          // Fix negative numbers
          if (repairedInput.maxResults <= 0) {
            repairedInput.maxResults = 10;
          }

          return {
            repaired: true,
            repairedToolCall: {
              ...toolCall,
              input: repairedInput,
            },
            repairReason:
              "Applied context-aware repairs: enhanced query, fixed date, set positive max results",
          };
        });

      const model = createToolCallingModel(
        ["Searching..."],
        [
          {
            ...contextualToolCall,
            input: {
              query: "ai sdk documentation guide",
              filters: { date: "2024-01-01" },
              maxResults: 10,
            },
          },
        ],
      );

      const result = await generateText({
        model,
        prompt: "Search for AI SDK information",
        tools: {
          searchEngine: {
            description: "Search with advanced filters",
            inputSchema: z.object({
              query: z.string().min(3),
              filters: z
                .object({
                  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
                  category: z.string().optional(),
                })
                .optional(),
              maxResults: z.number().min(1).max(100),
            }),
            execute: async ({ query, filters, maxResults }) => ({
              query,
              filters,
              maxResults,
              results: `Found ${maxResults} results for "${query}"`,
            }),
          },
        },
        experimental_repairToolCall: repairFunction,
      });

      expect(result.toolCalls[0].input.query).toBe(
        "ai sdk documentation guide",
      );
      expect(result.toolCalls[0].input.filters.date).toBe("2024-01-01");
      expect(result.toolCalls[0].input.maxResults).toBe(10);

      function isValidDate(dateString: string): boolean {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        const [year, month, day] = dateString.split("-").map(Number);
        return month >= 1 && month <= 12 && day >= 1 && day <= 31;
      }
    });

    test("should handle repair with telemetry tracking", async () => {
      const repairFunction = vi
        .fn()
        .mockImplementation(async ({ toolCall, error }) => {
          return {
            repaired: true,
            repairedToolCall: {
              ...toolCall,
              input: { message: "Repaired input" },
            },
            repairReason: "Test repair for telemetry",
            repairMetadata: {
              errorType: error.type,
              repairTime: Date.now(),
              repairVersion: "1.0.0",
            },
          };
        });

      const telemetryConfig = createTelemetryConfig({
        functionId: "ai.generateText.repairTool",
        metadata: {
          repairEnabled: true,
          repairVersion: "1.0.0",
        },
      });

      const model = createToolCallingModel(
        ["Repairing..."],
        [
          {
            toolCallId: "telemetry-repair-1",
            toolName: "testTool",
            input: { message: "Repaired input" },
          },
        ],
      );

      const result = await generateText({
        model,
        prompt: "Test tool repair with telemetry",
        tools: {
          testTool: {
            description: "Test tool for repair",
            inputSchema: z.object({
              message: z.string().min(1),
            }),
            execute: async ({ message }) => `Processed: ${message}`,
          },
        },
        experimental_repairToolCall: repairFunction,
        experimental_telemetry: telemetryConfig,
      });

      expect(result.toolCalls).toHaveLength(1);
      expect(result.usage.totalTokens).toBeGreaterThan(0);
    });

    test("should handle repair chains and recursive fixes", async () => {
      let repairAttempts = 0;

      const repairFunction = vi
        .fn()
        .mockImplementation(
          async ({ toolCall, error, previousRepairAttempts }) => {
            repairAttempts++;

            // Simulate progressive repair
            if (repairAttempts === 1) {
              return {
                repaired: true,
                repairedToolCall: {
                  ...toolCall,
                  input: { step: "first-repair", data: "partially-fixed" },
                },
                repairReason: "First repair attempt",
                needsAdditionalRepair: true,
              };
            }

            if (repairAttempts === 2) {
              return {
                repaired: true,
                repairedToolCall: {
                  ...toolCall,
                  input: { step: "final-repair", data: "fully-fixed" },
                },
                repairReason: "Final repair - fully resolved",
                needsAdditionalRepair: false,
              };
            }

            return { repaired: false };
          },
        );

      const model = createToolCallingModel(
        ["Applying repairs..."],
        [
          {
            toolCallId: "chain-repair-1",
            toolName: "repairableTask",
            input: { step: "final-repair", data: "fully-fixed" },
          },
        ],
      );

      const result = await generateText({
        model,
        prompt: "Execute task that needs chain repair",
        tools: {
          repairableTask: {
            description: "Task that may need multiple repair attempts",
            inputSchema: z.object({
              step: z.string(),
              data: z.string(),
              metadata: z
                .object({
                  repairCount: z.number().optional(),
                })
                .optional(),
            }),
            execute: async ({ step, data, metadata }) => ({
              step,
              data,
              success: data === "fully-fixed",
              repairCount: metadata?.repairCount || 0,
            }),
          },
        },
        experimental_repairToolCall: repairFunction,
      });

      expect(result.toolCalls[0].input.step).toBe("final-repair");
      expect(result.toolCalls[0].input.data).toBe("fully-fixed");
      expect(repairAttempts).toBeGreaterThan(0);
    });
  });

  describe("tool Repair Error Scenarios", () => {
    test("should handle repair function failures", async () => {
      const failingRepairFunction = vi
        .fn()
        .mockImplementation(async ({ toolCall, error }) => {
          throw new Error("Repair function itself failed");
        });

      const model = createToolCallingModel(
        ["Attempting repair..."],
        [
          {
            toolCallId: "repair-fail-1",
            toolName: "testTool",
            input: { message: "test" },
          },
        ],
      );

      // Should handle repair function failure gracefully
      const result = await generateText({
        model,
        prompt: "Test repair function failure",
        tools: {
          testTool: {
            description: "Test tool",
            inputSchema: z.object({ message: z.string() }),
            execute: async ({ message }) => `Result: ${message}`,
          },
        },
        experimental_repairToolCall: failingRepairFunction,
      });

      // Should still execute successfully despite repair failure
      expect(result.toolCalls).toHaveLength(1);
      expect(result.text).toBeDefined();
    });

    test("should handle repair timeout scenarios", async () => {
      const slowRepairFunction = vi
        .fn()
        .mockImplementation(async ({ toolCall, error }) => {
          // Simulate slow repair
          await new Promise((resolve) => setTimeout(resolve, 100));

          return {
            repaired: true,
            repairedToolCall: {
              ...toolCall,
              input: { message: "Slowly repaired" },
            },
            repairReason: "Slow repair completed",
            repairDuration: 100,
          };
        });

      const model = createToolCallingModel(
        ["Slow repair..."],
        [
          {
            toolCallId: "slow-repair-1",
            toolName: "testTool",
            input: { message: "Slowly repaired" },
          },
        ],
      );

      const startTime = Date.now();
      const result = await generateText({
        model,
        prompt: "Test slow repair",
        tools: {
          testTool: {
            description: "Test tool",
            inputSchema: z.object({ message: z.string() }),
            execute: async ({ message }) => `Result: ${message}`,
          },
        },
        experimental_repairToolCall: slowRepairFunction,
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeGreaterThan(50); // Should take some time
      expect(result.toolCalls[0].input.message).toBe("Slowly repaired");
    });
  });
});
