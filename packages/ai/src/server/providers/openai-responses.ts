import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

import { BaseProvider } from '../../shared/providers/base-provider';

import { Capability, CompletionOptions, CompletionResponse } from '../../shared/types';

export class OpenAIResponsesProvider extends BaseProvider {
  readonly capabilities = new Set<Capability>(['complete', 'tools']);
  readonly name = 'openai-responses';
  readonly type = 'ai-sdk' as const;

  private modelName: string;

  constructor(modelName: string = 'gpt-4o-mini') {
    super();
    this.modelName = modelName;
  }

  async complete(
    options: CompletionOptions & { useWebSearch?: boolean },
  ): Promise<CompletionResponse> {
    try {
      this.validateOptions(options);

      const generateOptions: any = {
        model: openai.responses(this.modelName),
        ...(options.maxTokens && { maxTokens: options.maxTokens }),
        ...(options.temperature && { temperature: options.temperature }),
      };

      if (options.messages && options.messages.length > 0) {
        generateOptions.messages = options.messages;
      } else if (options.prompt) {
        generateOptions.prompt = options.prompt;
        if (options.systemPrompt) {
          generateOptions.system = options.systemPrompt;
        }
      } else {
        throw new Error('Either prompt or messages must be provided');
      }

      // Add web search tool if requested
      if (options.useWebSearch) {
        generateOptions.tools = {
          web_search_preview: openai.tools.webSearchPreview(),
        };
      }

      const result = await generateText(generateOptions);

      const response: CompletionResponse = {
        text: result.text,
        ...(this.mapFinishReason(result.finishReason) && {
          finishReason: this.mapFinishReason(result.finishReason)!,
        }),
        ...(result.sources && { sources: result.sources }),
        ...(result.usage && {
          usage: {
            completionTokens: result.usage.completionTokens,
            promptTokens: result.usage.promptTokens,
            totalTokens: result.usage.totalTokens,
          },
        }),
      };
      return response;
    } catch (error: any) {
      throw this.formatError(error, 'completion');
    }
  }

  async *stream(): AsyncIterableIterator<any> {
    throw new Error('Streaming not supported by OpenAI Responses API');
  }

  private mapFinishReason(
    reason?: string,
  ): 'content_filter' | 'length' | 'stop' | 'tool_calls' | undefined {
    switch (reason) {
      case 'content-filter':
        return 'content_filter';
      case 'length':
        return 'length';
      case 'stop':
        return 'stop';
      case 'tool-calls':
        return 'tool_calls';
      default:
        return undefined;
    }
  }
}

export function createOpenAIResponsesProvider(modelName?: string): OpenAIResponsesProvider {
  return new OpenAIResponsesProvider(modelName);
}
