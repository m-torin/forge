import { CompletionResponse } from '../types/core';

export function normalizeResponse(response: any, provider: string): CompletionResponse {
  switch (provider) {
    case 'anthropic':
      return normalizeAnthropicResponse(response);
    case 'google':
      return normalizeGoogleResponse(response);
    case 'openai':
      return normalizeOpenAIResponse(response);
    default:
      return normalizeGenericResponse(response);
  }
}

function normalizeAnthropicResponse(response: any): CompletionResponse {
  return {
    finishReason: response.stop_reason,
    id: response.id,
    model: response.model,
    text: response.content?.[0]?.text ?? '',
    ...(response.usage && {
      usage: {
        completionTokens: response.usage.output_tokens,
        promptTokens: response.usage.input_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    }),
  };
}

function normalizeGenericResponse(response: any): CompletionResponse {
  return {
    finishReason: response.finishReason,
    id: response.id,
    model: response.model,
    text: response.text ?? response.content ?? '',
    usage: response.usage,
  };
}

function normalizeGoogleResponse(response: any): CompletionResponse {
  return {
    finishReason: response.candidates?.[0]?.finishReason,
    model: response.modelVersion,
    text: response.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
    ...(response.usageMetadata && {
      usage: {
        completionTokens: response.usageMetadata.candidatesTokenCount,
        promptTokens: response.usageMetadata.promptTokenCount,
        totalTokens: response.usageMetadata.totalTokenCount,
      },
    }),
  };
}

function normalizeOpenAIResponse(response: any): CompletionResponse {
  return {
    finishReason: response.choices?.[0]?.finish_reason,
    id: response.id,
    model: response.model,
    text: response.choices?.[0]?.message?.content ?? '',
    ...(response.usage && {
      usage: {
        completionTokens: response.usage.completion_tokens,
        promptTokens: response.usage.prompt_tokens,
        totalTokens: response.usage.total_tokens,
      },
    }),
  };
}
