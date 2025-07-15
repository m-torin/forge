import { generateText, tool } from 'ai';
import { z } from 'zod/v4';

export interface AgentOptions {
  model: any;
  tools: Record<string, any>;
  maxSteps?: number;
  systemPrompt?: string;
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
  const result = await generateText({
    model: options.model,
    tools: options.tools,
    maxSteps: options.maxSteps ?? 2,
    ...(options.systemPrompt && { system: options.systemPrompt }),
    messages: [], // Will be populated by the caller
  });

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
  options: Omit<AgentOptions, 'systemPrompt'> & { systemPrompt?: string },
): Promise<AgentResult> {
  const result = await generateText({
    model: options.model,
    tools: options.tools,
    maxSteps: options.maxSteps ?? 2,
    prompt,
    ...(options.systemPrompt && { system: options.systemPrompt }),
  });

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
  parameters: z.object({
    operation: z
      .enum(['add', 'subtract', 'multiply', 'divide'])
      .describe('The operation to perform'),
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
  execute: async ({ operation, a, b }) => {
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
  parameters: z.object({
    operation: z
      .enum(['uppercase', 'lowercase', 'reverse', 'wordcount'])
      .describe('The text operation'),
    text: z.string().describe('The text to process'),
  }),
  execute: async ({ operation, text }) => {
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
