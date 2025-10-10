import type { StopCondition } from 'ai';
import { generateText, stepCountIs, tool } from 'ai';
import { z } from 'zod/v3';

export interface AgentOptions {
  model: any;
  tools: Record<string, any>;
  maxSteps?: number;
  stopWhen?: StopCondition<any> | StopCondition<any>[];
  systemPrompt?: string;
  prompt: string;
}

export interface AgentResult {
  text: string;
  steps: number;
  toolCalls?: any[];
  sources?: any[];
}

/**
 * Create an AI agent that can use tools and perform multi-step reasoning
 */
export async function createAgent(options: AgentOptions): Promise<AgentResult> {
  const stopWhen =
    options.stopWhen ??
    (typeof options.maxSteps === 'number' ? stepCountIs(options.maxSteps) : stepCountIs(2));

  const result = await generateText({
    model: options.model,
    prompt: options.prompt,
    tools: options.tools,
    stopWhen,
    ...(options.systemPrompt && { system: options.systemPrompt }),
    experimental_telemetry: { isEnabled: true },
  } as any);

  return {
    text: result.text,
    steps: result.steps?.length ?? 1,
    toolCalls: result.toolCalls,
    ...(result.sources && { sources: result.sources }),
  };
}

/**
 * Run a simple agent workflow with a single prompt
 */
export async function runAgent(
  prompt: string,
  options: Omit<AgentOptions, 'prompt'>,
): Promise<AgentResult> {
  const stopWhen =
    options.stopWhen ??
    (typeof options.maxSteps === 'number' ? stepCountIs(options.maxSteps) : stepCountIs(2));

  const result = await generateText({
    model: options.model,
    tools: options.tools,
    stopWhen,
    prompt,
    ...(options.systemPrompt && { system: options.systemPrompt }),
    experimental_telemetry: { isEnabled: true },
  } as any);

  return {
    text: result.text,
    steps: result.steps?.length ?? 1,
    toolCalls: result.toolCalls,
    ...(result.sources && { sources: result.sources }),
  };
}

/**
 * Create a simple calculator tool as an example
 */
export const calculatorTool = tool({
  description: 'A simple calculator for basic arithmetic operations',
  inputSchema: z.object({
    operation: z
      .enum(['add', 'subtract', 'multiply', 'divide'])
      .describe('The operation to perform'),
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
  execute: async ({
    operation,
    a,
    b,
  }: {
    operation: 'add' | 'subtract' | 'multiply' | 'divide';
    a: number;
    b: number;
  }) => {
    switch (operation) {
      case 'add':
        return a + b;
      case 'subtract':
        return a - b;
      case 'multiply':
        return a * b;
      case 'divide':
        if (b === 0) throw new Error('Cannot divide by zero');
        return a / b;
      default:
        throw new Error('Unknown operation');
    }
  },
});

/**
 * Create a text processing tool
 */
export const textProcessorTool = tool({
  description: 'Process text with various operations',
  inputSchema: z.object({
    operation: z
      .enum(['uppercase', 'lowercase', 'reverse', 'wordcount'])
      .describe('The text operation'),
    text: z.string().describe('The text to process'),
  }),
  execute: async ({
    operation,
    text,
  }: {
    operation: 'uppercase' | 'lowercase' | 'reverse' | 'wordcount';
    text: string;
  }) => {
    switch (operation) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      case 'reverse':
        return text.split('').reverse().join('');
      case 'wordcount':
        return text.trim().split(/\s+/).length;
      default:
        throw new Error('Unknown operation');
    }
  },
});
