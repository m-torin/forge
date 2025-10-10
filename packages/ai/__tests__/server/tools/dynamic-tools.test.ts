/**
 * AI SDK v5 Dynamic Tools Tests
 * Tests dynamicTool functionality and type-safe narrowing patterns
 */

import { dynamicTool, streamText } from "ai";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import {
  createMultiStepToolModel,
  createToolCallingModel,
} from "../../test-utils/models";
import { collectFullStreamChunks } from "../../test-utils/streams";

describe("dynamic Tools", () => {
  describe("dynamic Tool Creation", () => {
    test("should create dynamic tools with runtime schema", async () => {
      const dynamicSearchTool = dynamicTool({
        description: "Dynamic search tool that adapts based on query type",
        inputSchema: z.object({
          query: z.string().describe("Search query"),
          type: z.enum(["web", "database", "file"]).describe("Search type"),
          filters: z
            .object({
              dateRange: z.string().optional(),
              category: z.string().optional(),
            })
            .optional(),
        }),
        execute: async ({ query, type, filters }) => {
          return `Dynamic search executed: ${type} search for "${query}" with filters: ${JSON.stringify(filters)}`;
        },
      });

      expect(dynamicSearchTool.dynamic).toBeTruthy();
      expect(dynamicSearchTool.description).toBe(
        "Dynamic search tool that adapts based on query type",
      );
      expect(dynamicSearchTool.inputSchema).toBeDefined();

      // Test execution
      const result = await dynamicSearchTool.execute({
        query: "AI SDK v5",
        type: "web",
        filters: { category: "documentation" },
      });

      expect(result).toContain('web search for "AI SDK v5"');
      expect(result).toContain("documentation");
    });

    test("should handle dynamic tool generation based on context", async () => {
      const createContextualTool = (context: string) => {
        return dynamicTool({
          description: `Contextual tool for ${context}`,
          inputSchema: z.object({
            action: z
              .string()
              .describe(`Action to perform in ${context} context`),
            params: z.record(z.any()).optional(),
          }),
          execute: async ({ action, params }) => {
            return `Executed ${action} in ${context} context with params: ${JSON.stringify(params)}`;
          },
        });
      };

      const userTool = createContextualTool("user-management");
      const dataTool = createContextualTool("data-processing");

      expect(userTool.description).toContain("user-management");
      expect(dataTool.description).toContain("data-processing");

      const userResult = await userTool.execute({
        action: "create",
        params: { name: "John", role: "admin" },
      });

      expect(userResult).toContain("create in user-management context");
    });

    test("should validate dynamic tool input schemas at runtime", async () => {
      const strictDynamicTool = dynamicTool({
        description: "Strict validation dynamic tool",
        inputSchema: z.object({
          requiredField: z.string().min(1, "Required field cannot be empty"),
          numericField: z.number().positive("Must be positive"),
          optionalEnum: z.enum(["a", "b", "c"]).optional(),
        }),
        execute: async (input) => {
          // Input is fully typed based on schema
          return `Valid input: ${input.requiredField}, ${input.numericField}, ${input.optionalEnum}`;
        },
      });

      // Valid input
      const validResult = await strictDynamicTool.execute({
        requiredField: "test",
        numericField: 42,
        optionalEnum: "b",
      });

      expect(validResult).toBe("Valid input: test, 42, b");

      // Invalid input should be caught by Zod at runtime
      await expect(
        strictDynamicTool.execute({
          requiredField: "",
          numericField: -1,
        } as any),
      ).rejects.toThrow();
    });
  });

  describe("type-Safe Narrowing with Dynamic Tools", () => {
    test("should narrow tool types based on tool call results", async () => {
      const toolCall = {
        toolCallId: "dynamic-call-1",
        toolName: "dynamicAnalyzer",
        input: {
          dataType: "text",
          content: "Sample text for analysis",
          options: { includeMetadata: true },
        },
      };

      const model = createToolCallingModel(["Analyzing data..."], [toolCall]);

      const result = streamText({
        model,
        prompt: "Analyze this data dynamically",
        tools: {
          dynamicAnalyzer: dynamicTool({
            description: "Dynamic analyzer that adapts to data type",
            inputSchema: z.object({
              dataType: z.enum(["text", "image", "audio", "video"]),
              content: z.string(),
              options: z
                .object({
                  includeMetadata: z.boolean().optional(),
                  outputFormat: z.enum(["json", "xml", "plain"]).optional(),
                })
                .optional(),
            }),
            execute: async ({ dataType, content, options }) => {
              // Type-safe narrowing based on dataType
              switch (dataType) {
                case "text":
                  return {
                    type: "text-analysis",
                    wordCount: content.split(" ").length,
                    sentiment: "neutral",
                    metadata: options?.includeMetadata
                      ? { encoding: "utf-8" }
                      : undefined,
                  };
                case "image":
                  return {
                    type: "image-analysis",
                    dimensions: "1920x1080",
                    format: "jpeg",
                    metadata: options?.includeMetadata
                      ? { colorSpace: "RGB" }
                      : undefined,
                  };
                case "audio":
                  return {
                    type: "audio-analysis",
                    duration: "3:45",
                    format: "mp3",
                    metadata: options?.includeMetadata
                      ? { bitrate: "320kbps" }
                      : undefined,
                  };
                case "video":
                  return {
                    type: "video-analysis",
                    duration: "10:30",
                    resolution: "4K",
                    metadata: options?.includeMetadata
                      ? { codec: "H.264" }
                      : undefined,
                  };
              }
            },
          }),
        },
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      expect(toolCallChunks).toHaveLength(1);
      expect(toolCallChunks[0].toolName).toBe("dynamicAnalyzer");
      expect(toolCallChunks[0].input.dataType).toBe("text");
    });

    test("should handle conditional tool behavior with type guards", async () => {
      const conditionalTool = dynamicTool({
        description: "Tool with conditional behavior based on input",
        inputSchema: z.object({
          operation: z.enum(["read", "write", "delete"]),
          target: z.string(),
          data: z.any().optional(),
          permissions: z.array(z.string()).optional(),
        }),
        execute: async ({ operation, target, data, permissions }) => {
          // Type-safe conditional logic
          if (operation === "write" && !data) {
            throw new Error("Data required for write operations");
          }

          if (
            operation === "delete" &&
            (!permissions || !permissions.includes("admin"))
          ) {
            throw new Error("Admin permissions required for delete operations");
          }

          switch (operation) {
            case "read":
              return {
                operation: "read",
                target,
                result: `Read data from ${target}`,
              };
            case "write":
              return {
                operation: "write",
                target,
                result: `Wrote ${JSON.stringify(data)} to ${target}`,
              };
            case "delete":
              return {
                operation: "delete",
                target,
                result: `Deleted ${target}`,
                confirmed: true,
              };
          }
        },
      });

      // Test valid read operation
      const readResult = await conditionalTool.execute({
        operation: "read",
        target: "user.json",
      });
      expect(readResult.operation).toBe("read");

      // Test valid write operation
      const writeResult = await conditionalTool.execute({
        operation: "write",
        target: "data.json",
        data: { key: "value" },
      });
      expect(writeResult.operation).toBe("write");

      // Test invalid write operation (missing data)
      await expect(
        conditionalTool.execute({
          operation: "write",
          target: "test.json",
        }),
      ).rejects.toThrow("Data required for write operations");

      // Test invalid delete operation (missing permissions)
      await expect(
        conditionalTool.execute({
          operation: "delete",
          target: "important.json",
        }),
      ).rejects.toThrow("Admin permissions required for delete operations");
    });

    test("should support polymorphic tool responses with discriminated unions", async () => {
      const polymorphicTool = dynamicTool({
        description: "Tool that returns different response types",
        inputSchema: z.object({
          responseType: z.enum(["success", "error", "warning", "info"]),
          message: z.string(),
          details: z.any().optional(),
        }),
        execute: async ({ responseType, message, details }) => {
          const baseResponse = {
            timestamp: new Date().toISOString(),
            message,
          };

          switch (responseType) {
            case "success":
              return {
                ...baseResponse,
                type: "success" as const,
                statusCode: 200,
                data: details,
              };
            case "error":
              return {
                ...baseResponse,
                type: "error" as const,
                statusCode: 500,
                errorCode: details?.code || "UNKNOWN_ERROR",
                stackTrace: details?.stack,
              };
            case "warning":
              return {
                ...baseResponse,
                type: "warning" as const,
                statusCode: 400,
                warningLevel: details?.level || "medium",
                suggestions: details?.suggestions || [],
              };
            case "info":
              return {
                ...baseResponse,
                type: "info" as const,
                statusCode: 200,
                category: details?.category || "general",
                metadata: details?.metadata || {},
              };
          }
        },
      });

      const successResult = await polymorphicTool.execute({
        responseType: "success",
        message: "Operation completed",
        details: { recordsProcessed: 42 },
      });

      expect(successResult.type).toBe("success");
      expect(successResult.statusCode).toBe(200);
      expect(successResult.data.recordsProcessed).toBe(42);

      const errorResult = await polymorphicTool.execute({
        responseType: "error",
        message: "Operation failed",
        details: { code: "VALIDATION_ERROR", stack: "Error stack..." },
      });

      expect(errorResult.type).toBe("error");
      expect(errorResult.statusCode).toBe(500);
      expect(errorResult.errorCode).toBe("VALIDATION_ERROR");
    });
  });

  describe("dynamic Tool Registration and Discovery", () => {
    test("should register dynamic tools at runtime", async () => {
      const toolRegistry = new Map<string, any>();

      const registerDynamicTool = (name: string, config: any) => {
        const tool = dynamicTool(config);
        toolRegistry.set(name, tool);
        return tool;
      };

      // Register tools dynamically
      registerDynamicTool("calculator", {
        description: "Dynamic calculator tool",
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
              return b !== 0 ? a / b : null;
          }
        },
      });

      registerDynamicTool("formatter", {
        description: "Dynamic text formatter",
        inputSchema: z.object({
          text: z.string(),
          format: z.enum(["uppercase", "lowercase", "capitalize", "reverse"]),
        }),
        execute: async ({ text, format }) => {
          switch (format) {
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
      });

      expect(toolRegistry.size).toBe(2);
      expect(toolRegistry.has("calculator")).toBeTruthy();
      expect(toolRegistry.has("formatter")).toBeTruthy();

      // Test registered tools
      const calculator = toolRegistry.get("calculator");
      const calcResult = await calculator.execute({
        operation: "multiply",
        a: 6,
        b: 7,
      });
      expect(calcResult).toBe(42);

      const formatter = toolRegistry.get("formatter");
      const formatResult = await formatter.execute({
        text: "hello world",
        format: "capitalize",
      });
      expect(formatResult).toBe("Hello world");
    });

    test("should handle tool discovery and introspection", async () => {
      const dynamicWebTool = dynamicTool({
        description: "Dynamic web scraping tool",
        inputSchema: z.object({
          url: z.string().url("Must be a valid URL"),
          selector: z.string().optional(),
          attribute: z.string().optional(),
          timeout: z.number().positive().optional().default(5000),
        }),
        execute: async ({ url, selector, attribute, timeout }) => {
          // Mock web scraping
          return {
            url,
            selector: selector || "body",
            attribute: attribute || "textContent",
            timeout,
            result: `Scraped content from ${url}`,
            success: true,
          };
        },
      });

      // Test tool introspection
      expect(dynamicWebTool.dynamic).toBeTruthy();
      expect(dynamicWebTool.description).toContain("web scraping");
      expect(dynamicWebTool.inputSchema).toBeDefined();

      // Validate schema structure
      const schemaShape = dynamicWebTool.inputSchema.shape;
      expect(schemaShape.url).toBeDefined();
      expect(schemaShape.selector).toBeDefined();
      expect(schemaShape.attribute).toBeDefined();
      expect(schemaShape.timeout).toBeDefined();

      // Test execution with defaults
      const result = await dynamicWebTool.execute({
        url: "https://example.com",
      });

      expect(result.url).toBe("https://example.com");
      expect(result.selector).toBe("body");
      expect(result.timeout).toBe(5000);
      expect(result.success).toBeTruthy();
    });
  });

  describe("dynamic Tools in Streaming Context", () => {
    test("should work with dynamic tools in streaming workflows", async () => {
      const toolCalls = [
        {
          toolCallId: "dynamic-stream-1",
          toolName: "streamProcessor",
          input: {
            processingType: "realtime",
            data: "stream data",
            batchSize: 10,
          },
        },
      ];

      const model = createMultiStepToolModel(
        ["Processing stream..."],
        toolCalls,
        1,
      );

      const result = streamText({
        model,
        prompt: "Process this data stream",
        tools: {
          streamProcessor: dynamicTool({
            description: "Dynamic stream processing tool",
            inputSchema: z.object({
              processingType: z.enum(["realtime", "batch", "delayed"]),
              data: z.string(),
              batchSize: z.number().positive().optional(),
              filters: z.array(z.string()).optional(),
            }),
            execute: async ({ processingType, data, batchSize, filters }) => {
              return {
                type: "stream-processed",
                processingType,
                dataLength: data.length,
                batchSize: batchSize || 1,
                filtersApplied: filters?.length || 0,
                processed: true,
              };
            },
          }),
        },
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      expect(toolCallChunks).toHaveLength(1);
      expect(toolCallChunks[0].toolName).toBe("streamProcessor");
      expect(toolCallChunks[0].input.processingType).toBe("realtime");
      expect(toolCallChunks[0].input.batchSize).toBe(10);
    });

    test("should handle dynamic tool errors in streaming context", async () => {
      const errorToolCall = {
        toolCallId: "error-dynamic-1",
        toolName: "errorProneProcessor",
        input: { shouldFail: true, data: "test" },
      };

      const model = createToolCallingModel(
        ["Attempting processing..."],
        [errorToolCall],
      );

      const result = streamText({
        model,
        prompt: "Process with error handling",
        tools: {
          errorProneProcessor: dynamicTool({
            description: "Dynamic tool that can fail",
            inputSchema: z.object({
              shouldFail: z.boolean(),
              data: z.string(),
              retryCount: z.number().optional().default(0),
            }),
            execute: async ({ shouldFail, data, retryCount }) => {
              if (shouldFail && retryCount < 3) {
                throw new Error(
                  `Dynamic tool processing failed for: ${data} (retry: ${retryCount})`,
                );
              }
              return {
                success: true,
                data,
                retryCount,
                recovered: retryCount > 0,
              };
            },
          }),
        },
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      expect(toolCallChunks).toHaveLength(1);
      expect(toolCallChunks[0].input.shouldFail).toBeTruthy();
    });
  });

  describe("advanced Dynamic Tool Patterns", () => {
    test("should support dynamic tool chaining and composition", async () => {
      const createProcessingPipeline = (stages: string[]) => {
        return stages.map((stage, index) =>
          dynamicTool({
            description: `Pipeline stage ${index + 1}: ${stage}`,
            inputSchema: z.object({
              input: z.any(),
              stageConfig: z.object({
                name: z.string(),
                params: z.record(z.any()).optional(),
              }),
              previousStageResult: z.any().optional(),
            }),
            execute: async ({ input, stageConfig, previousStageResult }) => {
              const data = previousStageResult?.output || input;
              return {
                stage: stageConfig.name,
                input: data,
                output: `Processed ${data} through ${stageConfig.name}`,
                stageIndex: index,
                success: true,
              };
            },
          }),
        );
      };

      const pipeline = createProcessingPipeline([
        "validate",
        "transform",
        "analyze",
      ]);

      // Test pipeline stage 1
      const stage1Result = await pipeline[0].execute({
        input: "raw data",
        stageConfig: { name: "validate", params: { strict: true } },
      });

      expect(stage1Result.stage).toBe("validate");
      expect(stage1Result.stageIndex).toBe(0);

      // Test pipeline stage 2 with previous result
      const stage2Result = await pipeline[1].execute({
        input: "original input",
        stageConfig: { name: "transform" },
        previousStageResult: stage1Result,
      });

      expect(stage2Result.stage).toBe("transform");
      expect(stage2Result.input).toContain(
        "Processed raw data through validate",
      );
    });

    test("should handle dynamic tool metadata and versioning", async () => {
      const createVersionedTool = (version: string, features: string[]) => {
        return dynamicTool({
          description: `Versioned tool v${version} with features: ${features.join(", ")}`,
          inputSchema: z.object({
            command: z.string(),
            version: z.string().optional().default(version),
            enabledFeatures: z.array(z.string()).optional().default(features),
            config: z.record(z.any()).optional(),
          }),
          execute: async ({
            command,
            version: requestedVersion,
            enabledFeatures,
            config,
          }) => {
            const supportedFeatures = features.filter((f) =>
              enabledFeatures?.includes(f),
            );

            return {
              tool: "versioned-processor",
              version: requestedVersion || version,
              command,
              supportedFeatures,
              config: config || {},
              executed: true,
              compatibility:
                requestedVersion === version ? "exact" : "compatible",
            };
          },
        });
      };

      const v1Tool = createVersionedTool("1.0.0", ["basic", "validation"]);
      const v2Tool = createVersionedTool("2.0.0", [
        "basic",
        "validation",
        "advanced",
        "streaming",
      ]);

      // Test v1 tool
      const v1Result = await v1Tool.execute({
        command: "process",
        enabledFeatures: ["basic", "validation"],
      });

      expect(v1Result.version).toBe("1.0.0");
      expect(v1Result.supportedFeatures).toEqual(["basic", "validation"]);
      expect(v1Result.compatibility).toBe("exact");

      // Test v2 tool
      const v2Result = await v2Tool.execute({
        command: "process-advanced",
        enabledFeatures: ["basic", "advanced", "streaming"],
      });

      expect(v2Result.version).toBe("2.0.0");
      expect(v2Result.supportedFeatures).toEqual([
        "basic",
        "advanced",
        "streaming",
      ]);
      expect(v2Result.compatibility).toBe("exact");
    });
  });
});
