"use client";

import { useCompletion as useVercelCompletion } from "@ai-sdk/react";
import { logWarn } from "@repo/observability";
import { useCallback, useEffect } from "react";

import {
  BaseAIHookOptions,
  mergeTransportConfig,
} from "../shared/types/transport";

// AI SDK v5 useCompletion specific options
export interface UseAICompletionOptions extends BaseAIHookOptions {
  id?: string;
  initialInput?: string;
  initialCompletion?: string;

  // Advanced options
  generateId?: () => string;
  streamProtocol?: "text" | "data";

  // Custom callback options that we implement manually
  onFinish?: (prompt: string, completion: string) => void;
  onTokenUsage?: (usage: {
    completion: number;
    prompt: number;
    total: number;
  }) => void;
}

/**
 * AI SDK v5 compatible useCompletion hook with transport support
 * Provides completion-style interfaces with modern patterns
 */
export function useCompletion({
  onError,
  onFinish,
  onRateLimit,
  onTokenUsage,
  api: apiProp,
  transport,
  ...options
}: UseAICompletionOptions = {}) {
  // Configure transport using shared utility
  const { api, ...transportConfig } = mergeTransportConfig(
    { api: apiProp, transport, ...options },
    "/api/ai/completion",
  );

  const completionConfig = {
    api,
    ...transportConfig,
    streamProtocol: options.streamProtocol || ("text" as const),
    generateId: options.generateId,
    initialInput: options.initialInput,
    initialCompletion: options.initialCompletion,
    id: options.id,
  };

  const completion = useVercelCompletion(completionConfig);

  // Handle errors manually since onError callback is removed in v5
  useEffect(() => {
    if (completion.error && onError) {
      const errorMessage =
        completion.error?.message || completion.error?.toString() || "";
      if (errorMessage.includes("429") && onRateLimit) {
        const match = errorMessage.match(/retry after (\d+)/);
        const retryAfter = match ? parseInt(match[1]) : 60;
        onRateLimit(retryAfter);
      }
      onError(completion.error);
    }
  }, [completion.error, onError, onRateLimit]);

  // Note: onFinish and onTokenUsage callbacks are not available in AI SDK v5
  // These would need to be implemented differently if token usage tracking is needed
  useEffect(() => {
    if (onFinish) {
      logWarn(
        "onFinish callback is not supported in AI SDK v5. Consider alternative approaches.",
      );
    }
    if (onTokenUsage) {
      logWarn(
        "onTokenUsage callback is not supported in AI SDK v5. Consider alternative approaches.",
      );
    }
  }, [onFinish, onTokenUsage]);

  // Enhanced complete function with retry logic (v5 pattern)
  const complete = useCallback(
    async (prompt: string, retries = 3): Promise<void> => {
      try {
        await completion.complete(prompt);
      } catch (error) {
        if (retries > 0 && error instanceof Error) {
          // Retry on network errors or rate limits
          if (
            error.message.includes("fetch") ||
            error.message.includes("429")
          ) {
            const delay = error.message.includes("429") ? 2000 : 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            return complete(prompt, retries - 1);
          }
        }
        throw error;
      }
    },
    [completion.complete],
  );

  return {
    ...completion,
    complete,
  };
}
