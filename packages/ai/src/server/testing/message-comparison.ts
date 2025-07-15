import type { CoreMessage, LanguageModelV1StreamPart } from 'ai';

/**
 * Compares two CoreMessage objects for equality
 * Performs deep comparison of role and content arrays
 */
export function compareMessages(firstMessage: CoreMessage, secondMessage: CoreMessage): boolean {
  if (firstMessage.role !== secondMessage.role) return false;

  if (!Array.isArray(firstMessage.content) || !Array.isArray(secondMessage.content)) {
    return false;
  }

  if (firstMessage.content.length !== secondMessage.content.length) {
    return false;
  }

  for (let i = 0; i < firstMessage.content.length; i++) {
    const item1 = firstMessage.content[i];
    const item2 = secondMessage.content[i];

    if (item1.type !== item2.type) return false;

    if (item1.type === 'image' && item2.type === 'image') {
      // Image comparison can be customized based on needs
      // Currently skipped for compatibility
    } else if (item1.type === 'text' && item2.type === 'text') {
      if (item1.text !== item2.text) return false;
    } else if (item1.type === 'tool-result' && item2.type === 'tool-result') {
      if (item1.toolCallId !== item2.toolCallId) return false;
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Converts text into text delta stream parts for testing
 */
export function textToDeltas(text: string): LanguageModelV1StreamPart[] {
  return text.split(' ').map(word => ({ type: 'text-delta' as const, textDelta: `${word} ` }));
}

/**
 * Converts reasoning text into reasoning delta stream parts for testing
 */
export function reasoningToDeltas(text: string): LanguageModelV1StreamPart[] {
  return text.split(' ').map(word => ({ type: 'reasoning' as const, textDelta: `${word} ` }));
}

/**
 * Creates a finish stream part with specified reason and usage
 */
export function createFinishPart(
  finishReason: 'stop' | 'tool-calls' = 'stop',
  usage = { completionTokens: 10, promptTokens: 3 },
): LanguageModelV1StreamPart {
  return {
    type: 'finish',
    finishReason,
    logprobs: undefined,
    usage,
  };
}

/**
 * Creates a tool call stream part for testing
 */
export function createToolCallPart(
  toolName: string,
  args: Record<string, any>,
  toolCallId = 'call_123',
): LanguageModelV1StreamPart {
  return {
    type: 'tool-call',
    toolCallId,
    toolName,
    toolCallType: 'function',
    args: JSON.stringify(args),
  };
}

/**
 * Creates a simple text delta part for testing
 */
export function createTextDelta(text: string): LanguageModelV1StreamPart {
  return {
    type: 'text-delta',
    textDelta: text,
  };
}

/**
 * Creates a complete response stream with text content
 */
export function createTextResponse(
  text: string,
  finishReason: 'stop' | 'tool-calls' = 'stop',
): LanguageModelV1StreamPart[] {
  return [...textToDeltas(text), createFinishPart(finishReason)];
}

/**
 * Creates a complete response stream with reasoning and text content
 */
export function createReasoningResponse(
  reasoningText: string,
  responseText: string,
  finishReason: 'stop' | 'tool-calls' = 'stop',
): LanguageModelV1StreamPart[] {
  return [
    ...reasoningToDeltas(reasoningText),
    ...textToDeltas(responseText),
    createFinishPart(finishReason),
  ];
}

/**
 * Creates a tool call response stream
 */
export function createToolCallResponse(
  toolName: string,
  args: Record<string, any>,
  toolCallId = 'call_123',
): LanguageModelV1StreamPart[] {
  return [createToolCallPart(toolName, args, toolCallId), createFinishPart()];
}
