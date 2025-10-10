import { openai } from '@ai-sdk/openai';
import { logDebug, logInfo } from '@repo/observability';
import type { StopCondition } from 'ai';
import { generateText, stepCountIs, streamText } from 'ai';
import { chatFragments } from './fragments';

/**
 * Simple multi-step execution helper - DRY helper only
 * Following package philosophy: "DRY helper functions that reduce boilerplate without adding complexity"
 *
 * Basic helper for when multi-step logic is needed across the monorepo
 */

/**
 * Multi-step configuration aligned with official AI SDK v5 patterns
 * No backward compatibility - pure AI SDK v5 alignment
 */
interface SimpleMultiStepConfig {
  maxSteps?: number;
  stopWhen?: StopCondition<any> | StopCondition<any>[];
  /**
   * Official AI SDK v5 onStepFinish callback signature
   * Matches the exact callback signature from generateText/streamText
   */
  onStepFinish?: (step: {
    text: string;
    toolCalls: any[];
    toolResults: any[];
    finishReason: string;
    usage: any;
  }) => void | Promise<void>;
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Execute multi-step AI operations using official AI SDK v5 patterns
 * Uses official stopWhen: stepCountIs() for automatic multi-step tool calling
 */
export async function executeMultiStep(initialPrompt: string, config: SimpleMultiStepConfig = {}) {
  const { maxSteps = 5, onStepFinish, temperature = 0.7, maxOutputTokens = 2048 } = config;
  const stopWhen = config.stopWhen ?? stepCountIs(maxSteps);

  logDebug('[MultiStep] Starting execution with official AI SDK v5 pattern', {
    maxSteps,
    initialPrompt: initialPrompt.substring(0, 100),
  });

  // Use official AI SDK v5 multi-step pattern
  const result = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: initialPrompt,
    ...chatFragments.withTools,
    temperature,
    maxOutputTokens,
    stopWhen,
    // Multi-step disabled for canary version compatibility
    // maxToolRoundtrips: maxSteps,
    // Official onStepFinish callback signature
    onStepFinish: onStepFinish
      ? async ({ text, toolCalls, toolResults, finishReason, usage }) => {
          logDebug(`[MultiStep] Step completed`, {
            stepNumber: result.steps?.length || 0,
            finishReason,
            toolCallsCount: toolCalls?.length || 0,
          });

          await onStepFinish({
            text,
            toolCalls: toolCalls || [],
            toolResults: toolResults || [],
            finishReason,
            usage,
          });
        }
      : undefined,
  });

  logInfo('[MultiStep] Execution completed', {
    totalSteps: result.steps?.length || 1,
    finishReason: result.finishReason,
  });

  // Return format aligned with official SDK result structure
  return {
    steps: result.steps || [],
    finalResult: result,
    totalSteps: result.steps?.length || 1,
    text: result.text,
    toolCalls: result.toolCalls || [],
    usage: result.usage,
  };
}

/**
 * Streaming multi-step execution using official AI SDK v5 patterns
 * Uses official streamText with stopWhen: stepCountIs() for real streaming
 */
export function streamMultiStep(initialPrompt: string, config: SimpleMultiStepConfig = {}) {
  const { maxSteps = 5, onStepFinish, temperature = 0.7, maxOutputTokens = 2048 } = config;
  const stopWhen = config.stopWhen ?? stepCountIs(maxSteps);

  logDebug('[MultiStep] Starting streaming with official AI SDK v5 pattern', {
    maxSteps,
    initialPrompt: initialPrompt.substring(0, 100),
  });

  // Official AI SDK v5 streaming multi-step pattern
  return streamText({
    model: openai('gpt-4o-mini'),
    prompt: initialPrompt,
    ...chatFragments.withTools,
    temperature,
    maxOutputTokens,
    stopWhen,
    // Multi-step disabled for canary version compatibility
    // maxToolRoundtrips: maxSteps,
    // Official onStepFinish callback for streaming
    onStepFinish: onStepFinish
      ? async ({ text, toolCalls, toolResults, finishReason, usage }) => {
          logDebug(`[MultiStep] Streaming step completed`, {
            finishReason,
            toolCallsCount: toolCalls?.length || 0,
          });

          await onStepFinish({
            text,
            toolCalls: toolCalls || [],
            toolResults: toolResults || [],
            finishReason,
            usage,
          });
        }
      : undefined,
  });

  // Returns official StreamTextResult - no custom wrapping needed
}
