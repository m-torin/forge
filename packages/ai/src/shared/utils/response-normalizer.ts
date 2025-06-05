import type { CompletionResponse } from '../types/core';

export function normalizeResponse(response: any, provider: string): CompletionResponse {
  switch (provider) {
    case 'openai':
      return normalizeOpenAIResponse(response);
    case 'anthropic':
      return normalizeAnthropicResponse(response);
    case 'google':
      return normalizeGoogleResponse(response);
    default:
      return normalizeGenericResponse(response);
  }
}

function normalizeOpenAIResponse(response: any): CompletionResponse {
  return {
    id: response.id,
    finishReason: response.choices?.[0]?.finish_reason,
    model: response.model,
    text: response.choices?.[0]?.message?.content || '',
    usage: response.usage
      ? {
          completionTokens: response.usage.completion_tokens,
          promptTokens: response.usage.prompt_tokens,
          totalTokens: response.usage.total_tokens,
        }
      : undefined,
  };
}

function normalizeAnthropicResponse(response: any): CompletionResponse {
  return {
    id: response.id,
    finishReason: response.stop_reason,
    model: response.model,
    text: response.content?.[0]?.text || '',
    usage: response.usage
      ? {
          completionTokens: response.usage.output_tokens,
          promptTokens: response.usage.input_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        }
      : undefined,
  };
}

function normalizeGoogleResponse(response: any): CompletionResponse {
  return {
    finishReason: response.candidates?.[0]?.finishReason,
    model: response.modelVersion,
    text: response.candidates?.[0]?.content?.parts?.[0]?.text || '',
    usage: response.usageMetadata
      ? {
          completionTokens: response.usageMetadata.candidatesTokenCount,
          promptTokens: response.usageMetadata.promptTokenCount,
          totalTokens: response.usageMetadata.totalTokenCount,
        }
      : undefined,
  };
}

function normalizeGenericResponse(response: any): CompletionResponse {
  return {
    id: response.id,
    finishReason: response.finishReason,
    model: response.model,
    text: response.text || response.content || '',
    usage: response.usage,
  };
}
