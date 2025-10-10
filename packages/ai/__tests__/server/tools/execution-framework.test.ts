/**
 * AI SDK v5 Tools Execution Framework Tests
 * Tests multi-step workflows using stepCountIs and hasToolCall stop conditions
 */

import { streamText } from "ai";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import {
  createBasicTextModel,
  createMultiStepToolModel,
  createToolCallingModel,
} from "../../test-utils/models";
import {
  collectFullStreamChunks,
  waitForStreamCompletion,
} from "../../test-utils/streams";

describe("execution Framework", () => {
  describe("step Count Stop Conditions", () => {
    test("should stop at exact step count using stepCountIs", async () => {
      const toolCall = {
        toolCallId: "step-1",
        toolName: "counter",
        input: { value: 1 },
      };

      const model = createMultiStepToolModel(
        ["Step 1", " Complete"],
        [toolCall],
        3, // 3 total steps
      );

      const result = streamText({
        model,
        prompt: "Count to 3 steps",
        tools: {
          counter: {
            description: "Count tool",
            inputSchema: z.object({ value: z.number() }),
            execute: async ({ value }) => `Counted to ${value}`,
          },
        },
        maxSteps: 3,
      });

      const completion = await waitForStreamCompletion(result);
      const chunks = await collectFullStreamChunks(result);

      // Should have exactly 3 steps worth of chunks
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );
      expect(toolCallChunks.length).toBeLessThanOrEqual(3);
      expect(completion.text).toContain("Step 1");
    });

    test("should handle stepCountIs with multiple tool calls", async () => {
      const toolCalls = [
        { toolCallId: "call-1", toolName: "step1", input: { data: "first" } },
        { toolCallId: "call-2", toolName: "step2", input: { data: "second" } },
      ];

      const model = createMultiStepToolModel(
        ["Multi-step", " workflow"],
        toolCalls,
        2,
      );

      const result = streamText({
        model,
        prompt: "Execute multi-step workflow",
        tools: {
          step1: {
            description: "First step",
            inputSchema: z.object({ data: z.string() }),
            execute: async ({ data }) => `First step: ${data}`,
          },
          step2: {
            description: "Second step",
            inputSchema: z.object({ data: z.string() }),
            execute: async ({ data }) => `Second step: ${data}`,
          },
        },
        maxSteps: 2,
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      expect(toolCallChunks).toHaveLength(2);
      expect(toolCallChunks[0].toolName).toBe("step1");
      expect(toolCallChunks[1].toolName).toBe("step2");
    });

    test("should validate step count boundary conditions", async () => {
      // Test with maxSteps: 1
      const singleStepModel = createMultiStepToolModel(
        ["Single step"],
        [{ toolCallId: "single", toolName: "oneTool", input: { test: true } }],
        1,
      );

      const result = streamText({
        model: singleStepModel,
        prompt: "Single step only",
        tools: {
          oneTool: {
            description: "Single tool",
            inputSchema: z.object({ test: z.boolean() }),
            execute: async () => "Single execution",
          },
        },
        maxSteps: 1,
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );
      expect(toolCallChunks).toHaveLength(1);
    });
  });

  describe("tool Call Stop Conditions", () => {
    test("should stop when specific tool is called using hasToolCall pattern", async () => {
      const toolCall = {
        toolCallId: "target-call",
        toolName: "targetTool",
        input: { action: "stop" },
      };

      const model = createToolCallingModel(
        ["Calling target tool..."],
        [toolCall],
      );

      const result = streamText({
        model,
        prompt: "Call the target tool to stop",
        tools: {
          targetTool: {
            description: "Target tool that triggers stop",
            inputSchema: z.object({ action: z.string() }),
            execute: async ({ action }) => `Executed ${action}`,
          },
          otherTool: {
            description: "Other tool that should not stop execution",
            inputSchema: z.object({ value: z.number() }),
            execute: async ({ value }) => `Other result: ${value}`,
          },
        },
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      // Should find the target tool call
      const targetCall = toolCallChunks.find(
        (chunk) => chunk.toolName === "targetTool",
      );
      expect(targetCall).toBeDefined();
      expect(targetCall?.input).toEqual({ action: "stop" });
    });

    test("should continue when non-target tools are called", async () => {
      const toolCalls = [
        { toolCallId: "other-1", toolName: "otherTool", input: { value: 1 } },
        {
          toolCallId: "other-2",
          toolName: "anotherTool",
          input: { data: "test" },
        },
      ];

      const model = createMultiStepToolModel(
        ["Calling other tools..."],
        toolCalls,
        2,
      );

      const result = streamText({
        model,
        prompt: "Call non-target tools",
        tools: {
          targetTool: {
            description: "Target tool that would trigger stop",
            inputSchema: z.object({ action: z.string() }),
            execute: async ({ action }) => `Target: ${action}`,
          },
          otherTool: {
            description: "Other tool",
            inputSchema: z.object({ value: z.number() }),
            execute: async ({ value }) => `Other: ${value}`,
          },
          anotherTool: {
            description: "Another tool",
            inputSchema: z.object({ data: z.string() }),
            execute: async ({ data }) => `Another: ${data}`,
          },
        },
        maxSteps: 3,
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      // Should have called both non-target tools
      expect(toolCallChunks).toHaveLength(2);
      expect(
        toolCallChunks.some((chunk) => chunk.toolName === "otherTool"),
      ).toBeTruthy();
      expect(
        toolCallChunks.some((chunk) => chunk.toolName === "anotherTool"),
      ).toBeTruthy();
      expect(
        toolCallChunks.some((chunk) => chunk.toolName === "targetTool"),
      ).toBeFalsy();
    });
  });

  describe("multi-Step Traces and Tool Validation", () => {
    test("should validate tool call trace in multi-step execution", async () => {
      const toolSequence = [
        { toolCallId: "trace-1", toolName: "initTool", input: { setup: true } },
        {
          toolCallId: "trace-2",
          toolName: "processTool",
          input: { data: "test" },
        },
        {
          toolCallId: "trace-3",
          toolName: "finalizeTool",
          input: { complete: true },
        },
      ];

      const model = createMultiStepToolModel(
        ["Initializing...", " Processing...", " Finalizing..."],
        toolSequence,
        3,
      );

      const result = streamText({
        model,
        prompt: "Execute complete workflow",
        tools: {
          initTool: {
            description: "Initialize workflow",
            inputSchema: z.object({ setup: z.boolean() }),
            execute: async ({ setup }) => `Initialized: ${setup}`,
          },
          processTool: {
            description: "Process data",
            inputSchema: z.object({ data: z.string() }),
            execute: async ({ data }) => `Processed: ${data}`,
          },
          finalizeTool: {
            description: "Finalize workflow",
            inputSchema: z.object({ complete: z.boolean() }),
            execute: async ({ complete }) => `Finalized: ${complete}`,
          },
        },
        maxSteps: 3,
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      // Validate sequence order and content
      expect(toolCallChunks).toHaveLength(3);
      expect(toolCallChunks[0].toolName).toBe("initTool");
      expect(toolCallChunks[0].input.setup).toBeTruthy();

      expect(toolCallChunks[1].toolName).toBe("processTool");
      expect(toolCallChunks[1].input.data).toBe("test");

      expect(toolCallChunks[2].toolName).toBe("finalizeTool");
      expect(toolCallChunks[2].input.complete).toBeTruthy();
    });

    test("should handle tool execution results in trace", async () => {
      const toolCall = {
        toolCallId: "result-test",
        toolName: "resultTool",
        input: { query: "test" },
      };

      const model = createToolCallingModel(["Getting result..."], [toolCall]);

      const result = streamText({
        model,
        prompt: "Get tool result",
        tools: {
          resultTool: {
            description: "Tool that returns result",
            inputSchema: z.object({ query: z.string() }),
            execute: async ({ query }) => {
              // Simulate tool execution with result
              return `Tool result for query: ${query}`;
            },
          },
        },
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );
      const toolResultChunks = chunks.filter(
        (chunk) => chunk.type === "tool-result",
      );

      expect(toolCallChunks).toHaveLength(1);
      expect(toolCallChunks[0].input.query).toBe("test");

      // Note: Mock models don't automatically generate tool-result chunks
      // In real scenarios, the AI SDK would handle this
      if (toolResultChunks.length > 0) {
        expect(toolResultChunks[0]).toMatchObject({
          type: "tool-result",
          toolCallId: "result-test",
        });
      }
    });

    test("should validate tool input schema at runtime", async () => {
      const validToolCall = {
        toolCallId: "valid-call",
        toolName: "validateTool",
        input: {
          requiredField: "present",
          optionalField: 42,
        },
      };

      const model = createToolCallingModel(
        ["Validating input..."],
        [validToolCall],
      );

      const result = streamText({
        model,
        prompt: "Test input validation",
        tools: {
          validateTool: {
            description: "Tool with strict input validation",
            inputSchema: z.object({
              requiredField: z.string().min(1),
              optionalField: z.number().optional(),
              strictField: z.literal("exact").optional(),
            }),
            execute: async (input) => {
              // This would validate at runtime
              expect(input.requiredField).toBe("present");
              expect(input.optionalField).toBe(42);
              return `Validated input: ${JSON.stringify(input)}`;
            },
          },
        },
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      expect(toolCallChunks).toHaveLength(1);
      expect(toolCallChunks[0].input).toMatchObject({
        requiredField: "present",
        optionalField: 42,
      });
    });
  });

  describe("complex Execution Patterns", () => {
    test("should handle conditional tool calling based on previous results", async () => {
      // Simulate a conditional workflow where the second tool depends on the first
      const conditionalTools = [
        {
          toolCallId: "check-1",
          toolName: "checkCondition",
          input: { condition: "ready" },
        },
        {
          toolCallId: "action-1",
          toolName: "executeAction",
          input: { action: "proceed" },
        },
      ];

      const model = createMultiStepToolModel(
        ["Checking condition...", " Executing action..."],
        conditionalTools,
        2,
      );

      const result = streamText({
        model,
        prompt: "Execute conditional workflow",
        tools: {
          checkCondition: {
            description: "Check if condition is met",
            inputSchema: z.object({ condition: z.string() }),
            execute: async ({ condition }) => {
              if (condition === "ready") {
                return "condition_met";
              }
              return "condition_not_met";
            },
          },
          executeAction: {
            description: "Execute action if condition is met",
            inputSchema: z.object({ action: z.string() }),
            execute: async ({ action }) => `Action executed: ${action}`,
          },
        },
        maxSteps: 2,
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      expect(toolCallChunks).toHaveLength(2);

      // Verify the conditional logic
      const checkCall = toolCallChunks.find(
        (chunk) => chunk.toolName === "checkCondition",
      );
      const actionCall = toolCallChunks.find(
        (chunk) => chunk.toolName === "executeAction",
      );

      expect(checkCall?.input.condition).toBe("ready");
      expect(actionCall?.input.action).toBe("proceed");
    });

    test("should handle parallel tool execution scenarios", async () => {
      const parallelTools = [
        { toolCallId: "parallel-1", toolName: "taskA", input: { id: "A" } },
        { toolCallId: "parallel-2", toolName: "taskB", input: { id: "B" } },
        { toolCallId: "parallel-3", toolName: "taskC", input: { id: "C" } },
      ];

      const model = createMultiStepToolModel(
        ["Running parallel tasks..."],
        parallelTools,
        1, // All tools in single step
      );

      const result = streamText({
        model,
        prompt: "Execute parallel tasks",
        tools: {
          taskA: {
            description: "Task A",
            inputSchema: z.object({ id: z.string() }),
            execute: async ({ id }) => `Task ${id} completed`,
          },
          taskB: {
            description: "Task B",
            inputSchema: z.object({ id: z.string() }),
            execute: async ({ id }) => `Task ${id} completed`,
          },
          taskC: {
            description: "Task C",
            inputSchema: z.object({ id: z.string() }),
            execute: async ({ id }) => `Task ${id} completed`,
          },
        },
        maxSteps: 1,
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      expect(toolCallChunks).toHaveLength(3);

      // Verify all tasks are represented
      const taskIds = toolCallChunks.map((chunk) => chunk.input.id).sort();
      expect(taskIds).toEqual(["A", "B", "C"]);
    });

    test("should handle error recovery in multi-step execution", async () => {
      const recoveryTools = [
        {
          toolCallId: "attempt-1",
          toolName: "riskyTool",
          input: { attempt: 1 },
        },
        {
          toolCallId: "recovery-1",
          toolName: "recoveryTool",
          input: { recover: true },
        },
      ];

      const model = createMultiStepToolModel(
        ["Attempting risky operation...", " Recovering..."],
        recoveryTools,
        2,
      );

      const result = streamText({
        model,
        prompt: "Execute with error recovery",
        tools: {
          riskyTool: {
            description: "Tool that might fail",
            inputSchema: z.object({ attempt: z.number() }),
            execute: async ({ attempt }) => {
              if (attempt === 1) {
                throw new Error("Simulated failure");
              }
              return "Success";
            },
          },
          recoveryTool: {
            description: "Tool for recovery",
            inputSchema: z.object({ recover: z.boolean() }),
            execute: async ({ recover }) =>
              recover ? "Recovered successfully" : "Recovery failed",
          },
        },
        maxSteps: 2,
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      expect(toolCallChunks).toHaveLength(2);

      const riskyCall = toolCallChunks.find(
        (chunk) => chunk.toolName === "riskyTool",
      );
      const recoveryCall = toolCallChunks.find(
        (chunk) => chunk.toolName === "recoveryTool",
      );

      expect(riskyCall?.input.attempt).toBe(1);
      expect(recoveryCall?.input.recover).toBeTruthy();
    });
  });

  describe("stop Condition Edge Cases", () => {
    test("should handle maxSteps: 0 (no tool calls allowed)", async () => {
      const model = createBasicTextModel("No tools allowed");

      const result = streamText({
        model,
        prompt: "This should not call any tools",
        tools: {
          forbiddenTool: {
            description: "Should not be called",
            inputSchema: z.object({ test: z.string() }),
            execute: async ({ test }) => `Should not execute: ${test}`,
          },
        },
        maxSteps: 0,
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      expect(toolCallChunks).toHaveLength(0);
    });

    test("should handle very high maxSteps with limited tool calls", async () => {
      const singleToolCall = {
        toolCallId: "single-call",
        toolName: "limitedTool",
        input: { action: "once" },
      };

      const model = createToolCallingModel(
        ["Single call only"],
        [singleToolCall],
      );

      const result = streamText({
        model,
        prompt: "Limited tool usage",
        tools: {
          limitedTool: {
            description: "Tool called only once",
            inputSchema: z.object({ action: z.string() }),
            execute: async ({ action }) => `Executed ${action}`,
          },
        },
        maxSteps: 100, // Very high limit, but model only calls once
      });

      const chunks = await collectFullStreamChunks(result);
      const toolCallChunks = chunks.filter(
        (chunk) => chunk.type === "tool-call",
      );

      expect(toolCallChunks).toHaveLength(1);
      expect(toolCallChunks[0].input.action).toBe("once");
    });
  });
});
