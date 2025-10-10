import type { ModelMessage, UIMessage } from 'ai';
import { stepCountIs } from 'ai';
// stepCountIs will be handled in operations layer
import { chatFragments } from '../core/fragments';
import { executeAIOperation } from '../core/operations';
import type { ChatConfig, ChatResult } from '../core/types';
import { getDefaultModel } from '../providers/registry';

/**
 * High-level chat operations following database ORM pattern
 */
export const Chat = {
  /**
   * Create a chat completion with defaults
   */
  async create(
    messages: UIMessage[] | ModelMessage[],
    config: Partial<ChatConfig> = {},
  ): Promise<ChatResult> {
    const result = await executeAIOperation('generateText', {
      ...chatFragments.basicChat,
      model: config.model || getDefaultModel(),
      messages,
      ...config,
    });

    if (!result.success) {
      throw result.error;
    }

    return {
      success: true,
      message: result.data?.text || result.text,
      text: result.data?.text || result.text,
      usage: result.usage,
      steps: result.data?.steps || result.steps,
      finishReason: result.finishReason,
      toUIMessageStreamResponse: result.toUIMessageStreamResponse,
      pipeTextStreamToResponse: result.pipeTextStreamToResponse,
      response: result.response,
    };
  },

  /**
   * Stream a chat completion
   */
  async stream(
    messages: UIMessage[] | ModelMessage[],
    config: Partial<ChatConfig> = {},
  ): Promise<ChatResult> {
    const result = await executeAIOperation('streamText', {
      ...chatFragments.basicChat,
      model: config.model || getDefaultModel(),
      messages,
      ...config,
    });

    if (!result.success) {
      throw result.error;
    }

    return {
      success: true,
      message: result.text,
      text: result.text,
      usage: result.usage,
      steps: result.data?.steps || result.steps,
      finishReason: result.finishReason,
      toUIMessageStreamResponse:
        result.toUIMessageStreamResponse ||
        result.data?.toUIMessageStreamResponse?.bind(result.data),
      pipeTextStreamToResponse: result.pipeTextStreamToResponse,
      response: result.response,
    };
  },

  /**
   * Chat with tools
   */
  async withTools(
    messages: UIMessage[] | ModelMessage[],
    tools: Record<string, any>,
    config: Partial<ChatConfig> = {},
  ): Promise<ChatResult> {
    return this.stream(messages, {
      ...chatFragments.withTools,
      ...config,
      tools,
    });
  },

  /**
   * Multi-step chat
   */
  async multiStep(
    messages: UIMessage[] | ModelMessage[],
    config: Partial<ChatConfig> & { maxSteps?: number } = {},
  ): Promise<ChatResult> {
    const { maxSteps = 5, stopWhen, ...restConfig } = config;
    const resolvedStopWhen = stopWhen ?? stepCountIs(maxSteps);

    return this.stream(messages, {
      ...restConfig,
      stopWhen: resolvedStopWhen,
    });
  },
};
