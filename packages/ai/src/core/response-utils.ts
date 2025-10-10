/**
 * AI SDK v5 Response Access Utilities
 * Standardized patterns for accessing response data
 */

import { logDebug } from '@repo/observability';
import type { AIOperationResult } from './types';

/**
 * Response Access Utilities
 * Provides standardized ways to access AI SDK v5 response properties
 */
export class ResponseUtils {
  /**
   * Extract response headers safely
   */
  static getHeaders(result: AIOperationResult): Record<string, string> {
    return result.response?.headers || {};
  }

  /**
   * Extract response body safely
   */
  static getResponseBody(result: AIOperationResult): any {
    return result.response?.body;
  }

  /**
   * Extract response messages safely
   */
  static getResponseMessages(result: AIOperationResult): any[] {
    return result.response?.messages || [];
  }

  /**
   * Extract steps information
   */
  static getSteps(result: AIOperationResult): any[] {
    return result.steps || [];
  }

  /**
   * Extract reasoning information
   */
  static getReasoning(result: AIOperationResult): {
    reasoningText?: string;
  } {
    return {
      reasoningText: result.reasoningText,
    };
  }

  /**
   * Extract sources information (for providers that support it)
   */
  static getSources(result: AIOperationResult): any[] {
    return result.sources || [];
  }

  /**
   * Extract files information
   */
  static getFiles(result: AIOperationResult): any[] {
    return result.files || [];
  }

  /**
   * Extract tool calls and results
   */
  static getToolData(result: AIOperationResult): {
    toolCalls: any[];
    toolResults: any[];
  } {
    return {
      toolCalls: result.toolCalls || [],
      toolResults: result.toolResults || [],
    };
  }

  /**
   * Extract provider metadata
   */
  static getProviderMetadata(result: AIOperationResult): any {
    return result.providerOptions;
  }

  /**
   * Extract warnings
   */
  static getWarnings(result: AIOperationResult): any[] {
    return result.warnings || [];
  }

  /**
   * Extract usage information with fallbacks
   */
  static getUsage(result: AIOperationResult): {
    usage: any;
    totalUsage: any;
    costEstimate?: number;
  } {
    return {
      usage: result.usage,
      totalUsage: result.totalUsage,
      costEstimate: result.cost,
    };
  }

  /**
   * Check if response has streaming capabilities
   */
  static hasStreamingSupport(result: AIOperationResult): boolean {
    return !!(result.textStream || result.fullStream || result.toUIMessageStreamResponse);
  }

  /**
   * Get streaming utilities from result
   */
  static getStreamingUtils(result: AIOperationResult): {
    textStream?: ReadableStream;
    fullStream?: ReadableStream;
    toUIMessageStreamResponse?: () => Response;
    pipeTextStreamToResponse?: (response: any) => void;
    pipeUIMessageStreamToResponse?: (response: any) => void;
    toTextStreamResponse?: () => Response;
  } {
    return {
      textStream: result.textStream,
      fullStream: result.fullStream,
      toUIMessageStreamResponse: result.toUIMessageStreamResponse,
      pipeTextStreamToResponse: result.pipeTextStreamToResponse,
      pipeUIMessageStreamToResponse: result.pipeUIMessageStreamToResponse,
      toTextStreamResponse: result.toTextStreamResponse,
    };
  }

  /**
   * Create a summary of the response for debugging
   */
  static createResponseSummary(result: AIOperationResult): {
    success: boolean;
    hasText: boolean;
    hasReasoning: boolean;
    hasTools: boolean;
    hasSources: boolean;
    hasFiles: boolean;
    hasWarnings: boolean;
    isStreaming: boolean;
    tokenUsage?: any;
    finishReason?: string;
    modelId?: string;
  } {
    const summary = {
      success: result.success,
      hasText: !!(result.text || result.content),
      hasReasoning: !!(result.reasoningText || result.reasoningText),
      hasTools: !!(result.toolCalls?.length || result.toolResults?.length),
      hasSources: !!result.sources?.length,
      hasFiles: !!result.files?.length,
      hasWarnings: !!result.warnings?.length,
      isStreaming: this.hasStreamingSupport(result),
      tokenUsage: result.usage,
      finishReason: result.finishReason,
      modelId: result.response?.messages?.[0]?.modelId,
    };

    logDebug('[ResponseUtils] Response summary:', summary);
    return summary;
  }

  /**
   * Validate response completeness
   */
  static validateResponse(result: AIOperationResult): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    if (!result.success && !result.error) {
      issues.push('Response marked as failed but no error provided');
    }

    if (result.success && !result.text && !result.content && !result.toolCalls?.length) {
      warnings.push('Successful response but no text or tool results');
    }

    if (result.usage && typeof result.usage.totalTokens !== 'number') {
      warnings.push('Usage information incomplete');
    }

    if (result.warnings?.length) {
      warnings.push(`Model provider warnings: ${result.warnings.length}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
    };
  }
}

/**
 * Convenience functions for common response access patterns
 */
export const responseUtils = {
  /**
   * Get text content from any result type
   */
  getText: (result: AIOperationResult): string => {
    return result.text || result.content || '';
  },

  /**
   * Get structured output if available
   */
  getObject: <T = any>(result: AIOperationResult): T | null => {
    return (result as any).object || null;
  },

  /**
   * Check if operation was successful
   */
  isSuccess: (result: AIOperationResult): boolean => {
    return result.success;
  },

  /**
   * Get error information
   */
  getError: (result: AIOperationResult): { message: string; error: any } | null => {
    return result.error || null;
  },

  /**
   * Get finish reason with fallback
   */
  getFinishReason: (result: AIOperationResult): string => {
    return result.finishReason || 'unknown';
  },

  /**
   * Extract all text-related content
   */
  getAllText: (
    result: AIOperationResult,
  ): {
    mainText: string;
    reasoningText: string;
    toolOutputs: string[];
  } => {
    const toolOutputs = (result.toolResults || []).map(tool =>
      typeof tool === 'string' ? tool : JSON.stringify(tool),
    );

    return {
      mainText: result.text || result.content || '',
      reasoningText: result.reasoningText || '',
      toolOutputs,
    };
  },

  /**
   * Create a minimal response object for client consumption
   */
  toMinimalResponse: (
    result: AIOperationResult,
  ): {
    success: boolean;
    text?: string;
    error?: string;
    usage?: any;
    finishReason?: string;
  } => {
    return {
      success: result.success,
      text: result.text || result.content,
      error: result.error?.message,
      usage: result.usage,
      finishReason: result.finishReason,
    };
  },
};
