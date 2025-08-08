/**
 * Model selection utilities for AI applications
 * Provides patterns for model capability detection, selection, and fallback strategies
 */

/**
 * Model capability flags
 */
export interface ModelCapabilities {
  /** Basic text generation */
  textGeneration: boolean;

  /** Tool/Function calling */
  toolCalling: boolean;

  /** Streaming tool calls */
  streamingTools: boolean;

  /** Image input support */
  imageInput: boolean;

  /** PDF input support */
  pdfInput: boolean;

  /** Video input support */
  videoInput: boolean;

  /** Audio input support */
  audioInput: boolean;

  /** Structured output (JSON mode) */
  structuredOutput: boolean;

  /** System prompts */
  systemPrompts: boolean;

  /** Reasoning/thinking support */
  reasoningText: boolean;

  /** Computer use tools */
  computerUse: boolean;

  /** Embeddings generation */
  embeddings: boolean;

  /** Maximum context window */
  maxContextTokens: number;

  /** Maximum output tokens */
  maxOutputTokens: number;

  /** Cost per 1K input tokens (USD) */
  costPerInputToken?: number;

  /** Cost per 1K output tokens (USD) */
  costPerOutputToken?: number;
}

/**
 * Model metadata
 */
export interface ModelMetadata {
  /** Model identifier */
  id: string;

  /** Display name */
  name: string;

  /** Model provider */
  provider: string;

  /** Model description */
  description?: string;

  /** Model category */
  category: 'chat' | 'reasoning' | 'vision' | 'code' | 'embedding' | 'specialized';

  /** Release date */
  releaseDate?: string;

  /** Whether model is deprecated */
  deprecated?: boolean;

  /** Deprecation date if applicable */
  deprecationDate?: string;

  /** Replacement model if deprecated */
  replacementModel?: string;

  /** Model capabilities */
  capabilities: ModelCapabilities;

  /** Usage recommendations */
  recommendations?: {
    bestFor: string[];
    notRecommendedFor: string[];
  };

  /** Model-specific configuration */
  defaultConfig?: {
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
}

/**
 * User entitlements for model access
 */
export interface UserEntitlements {
  /** User type/tier */
  userType: 'free' | 'pro' | 'enterprise' | 'custom';

  /** Available models */
  availableModels: string[];

  /** Rate limits by model */
  rateLimits?: Record<
    string,
    {
      requestsPerMinute?: number;
      requestsPerHour?: number;
      requestsPerDay?: number;
      tokensPerDay?: number;
    }
  >;

  /** Custom restrictions */
  restrictions?: {
    maxContextTokens?: number;
    maxOutputTokens?: number;
    blockedFeatures?: string[];
  };
}

/**
 * Model selection criteria
 */
export interface ModelSelectionCriteria {
  /** Required capabilities */
  requiredCapabilities?: (keyof ModelCapabilities)[];

  /** Preferred provider */
  preferredProvider?: string;

  /** Maximum acceptable cost per 1K tokens */
  maxCostPerToken?: number;

  /** Minimum context window needed */
  minContextTokens?: number;

  /** Category preference */
  preferredCategory?: ModelMetadata['category'];

  /** Exclude deprecated models */
  excludeDeprecated?: boolean;

  /** Custom filter function */
  customFilter?: (model: ModelMetadata) => boolean;
}

/**
 * Model selector class
 */
export class ModelSelector {
  constructor(
    private models: ModelMetadata[],
    private userEntitlements?: UserEntitlements,
  ) {}

  /**
   * Select the best model based on criteria
   */
  selectModel(criteria: ModelSelectionCriteria = {}): ModelMetadata | null {
    let availableModels = [...this.models];

    // Filter by user entitlements
    if (this.userEntitlements) {
      availableModels = availableModels.filter(
        model => this.userEntitlements?.availableModels?.includes(model.id) ?? true,
      );
    }

    // Apply filters
    if (criteria.excludeDeprecated !== false) {
      availableModels = availableModels.filter(model => !model.deprecated);
    }

    if (criteria.requiredCapabilities) {
      availableModels = availableModels.filter(model =>
        criteria.requiredCapabilities?.every(cap => {
          const value = model.capabilities[cap];
          return typeof value === 'boolean' ? value : true;
        }),
      );
    }

    if (criteria.preferredProvider) {
      availableModels = availableModels.filter(
        model => model.provider === criteria.preferredProvider,
      );
    }

    if (criteria.minContextTokens) {
      availableModels = availableModels.filter(
        model => model.capabilities.maxContextTokens >= (criteria.minContextTokens || 0),
      );
    }

    if (criteria.preferredCategory) {
      availableModels = availableModels.filter(
        model => model.category === criteria.preferredCategory,
      );
    }

    if (criteria.maxCostPerToken) {
      availableModels = availableModels.filter(model => {
        const inputCost = model.capabilities.costPerInputToken || Infinity;
        const outputCost = model.capabilities.costPerOutputToken || Infinity;
        return Math.max(inputCost, outputCost) <= (criteria.maxCostPerToken || Infinity);
      });
    }

    if (criteria.customFilter) {
      availableModels = availableModels.filter(criteria.customFilter);
    }

    // Sort by preference (newest, most capable, cheapest)
    availableModels.sort((a, b) => {
      // Prefer newer models
      if (a.releaseDate && b.releaseDate) {
        const dateComparison = b.releaseDate.localeCompare(a.releaseDate);
        if (dateComparison !== 0) return dateComparison;
      }

      // Prefer larger context windows
      const contextComparison = b.capabilities.maxContextTokens - a.capabilities.maxContextTokens;
      if (contextComparison !== 0) return contextComparison;

      // Prefer cheaper models
      const aCost = Math.max(
        a.capabilities.costPerInputToken || 0,
        a.capabilities.costPerOutputToken || 0,
      );
      const bCost = Math.max(
        b.capabilities.costPerInputToken || 0,
        b.capabilities.costPerOutputToken || 0,
      );
      return aCost - bCost;
    });

    return availableModels[0] || null;
  }

  /**
   * Get models by capability
   */
  getModelsByCapability(capability: keyof ModelCapabilities): ModelMetadata[] {
    return this.models.filter(model => {
      const value = model.capabilities[capability];
      return typeof value === 'boolean' ? value : true;
    });
  }

  /**
   * Get fallback chain for a model
   */
  getFallbackChain(primaryModelId: string, maxChainLength = 3): ModelMetadata[] {
    const primaryModel = this.models.find(m => m.id === primaryModelId);
    if (!primaryModel) return [];

    const chain: ModelMetadata[] = [primaryModel];
    const usedProviders = new Set([primaryModel.provider]);

    // Find similar models from different providers
    const similarModels = this.models
      .filter(
        model =>
          model.id !== primaryModelId &&
          model.category === primaryModel.category &&
          !model.deprecated &&
          (!this.userEntitlements || this.userEntitlements.availableModels.includes(model.id)),
      )
      .sort((a, b) => {
        // Prefer different providers for redundancy
        const aProviderScore = usedProviders.has(a.provider) ? 0 : 1;
        const bProviderScore = usedProviders.has(b.provider) ? 0 : 1;
        return bProviderScore - aProviderScore;
      });

    for (const model of similarModels) {
      if (chain.length >= maxChainLength) break;
      chain.push(model);
      usedProviders.add(model.provider);
    }

    return chain;
  }

  /**
   * Estimate cost for a request
   */
  estimateCost(
    modelId: string,
    inputTokens: number,
    outputTokens: number,
  ): { inputCost: number; outputCost: number; totalCost: number } | null {
    const model = this.models.find(m => m.id === modelId);
    if (!model) return null;

    const inputCost = (model.capabilities.costPerInputToken || 0) * (inputTokens / 1000);
    const outputCost = (model.capabilities.costPerOutputToken || 0) * (outputTokens / 1000);

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    };
  }
}

/**
 * Model fallback strategy
 */
export class ModelFallbackStrategy {
  private attemptCounts = new Map<string, number>();

  constructor(
    private selector: ModelSelector,
    private options: {
      maxAttempts?: number;
      backoffMultiplier?: number;
      resetAfterMs?: number;
    } = {},
  ) {}

  /**
   * Execute with fallback
   */
  async executeWithFallback<T>(
    task: (modelId: string) => Promise<T>,
    criteria: ModelSelectionCriteria = {},
  ): Promise<{ result: T; modelUsed: string }> {
    const primaryModel = this.selector.selectModel(criteria);
    if (!primaryModel) {
      throw new Error('No suitable model found');
    }

    const fallbackChain = this.selector.getFallbackChain(primaryModel.id);
    const errors: Array<{ model: string; error: Error }> = [];

    for (const model of fallbackChain) {
      try {
        const result = await this.executeWithRetry(task, model.id);
        return { result, modelUsed: model.id };
      } catch (error) {
        errors.push({ model: model.id, error: error as Error });

        // Check if we should continue with fallback
        if (!this.shouldFallback(error as Error)) {
          throw error;
        }
      }
    }

    // All models failed
    throw new AggregateError(
      errors.map(e => e.error),
      `All models in fallback chain failed: ${errors.map(e => `${e.model}: ${e.error.message}`).join(', ')}`,
    );
  }

  private async executeWithRetry<T>(
    task: (modelId: string) => Promise<T>,
    modelId: string,
  ): Promise<T> {
    const maxAttempts = this.options.maxAttempts || 3;
    const backoffMultiplier = this.options.backoffMultiplier || 2;

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await task(modelId);
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxAttempts && this.shouldRetry(error as Error)) {
          const delay = Math.pow(backoffMultiplier, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }

    throw lastError || new Error('All model attempts failed');
  }

  private shouldRetry(error: Error): boolean {
    // Retry on transient errors
    const errorMessage = error.message.toLowerCase();
    return (
      errorMessage.includes('timeout') ||
      errorMessage.includes('network') ||
      errorMessage.includes('temporarily') ||
      (error as any).statusCode >= 500
    );
  }

  private shouldFallback(error: Error): boolean {
    // Don't fallback on user errors
    const errorMessage = error.message.toLowerCase();
    return !(
      errorMessage.includes('invalid') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('forbidden') ||
      (error as any).statusCode === 400 ||
      (error as any).statusCode === 401 ||
      (error as any).statusCode === 403
    );
  }
}

/**
 * Create a model selector with default model registry
 */
export function createModelSelector(
  models: ModelMetadata[],
  userEntitlements?: UserEntitlements,
): ModelSelector {
  return new ModelSelector(models, userEntitlements);
}

/**
 * Model capability detection helpers
 */
export const ModelCapabilityDetection = {
  /**
   * Check if a task requires specific capabilities
   */
  getRequiredCapabilities(task: {
    hasImages?: boolean;
    hasPDFs?: boolean;
    needsTools?: boolean;
    needsStreaming?: boolean;
    needsReasoning?: boolean;
    contextSize?: number;
  }): (keyof ModelCapabilities)[] {
    const required: (keyof ModelCapabilities)[] = ['textGeneration'];

    if (task.hasImages) required.push('imageInput');
    if (task.hasPDFs) required.push('pdfInput');
    if (task.needsTools) required.push('toolCalling');
    if (task.needsStreaming && task.needsTools) required.push('streamingTools');
    if (task.needsReasoning) required.push('reasoningText');

    return required;
  },

  /**
   * Validate model capabilities for a task
   */
  validateCapabilities(
    model: ModelMetadata,
    requiredCapabilities: (keyof ModelCapabilities)[],
  ): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const capability of requiredCapabilities) {
      const value = model.capabilities[capability];
      if (typeof value === 'boolean' && !value) {
        missing.push(capability);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  },
};
