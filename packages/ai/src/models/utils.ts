/**
 * Model Utility Functions
 * Helper functions for model selection, validation, and configuration
 */

import type { ModelCapability } from "./metadata";
import {
  getModelConfig,
  modelSupportsReasoning,
  type ProviderModelConfig,
} from "./registry";

/**
 * Model selection strategy types
 */
export type ModelSelectionStrategy =
  | "speed"
  | "balanced"
  | "reasoning"
  | "creative"
  | "vision"
  | "code"
  | "computer"; // Computer use capabilities;

/**
 * User tier for model access control
 */
export type UserTier = "free" | "pro" | "enterprise";

/**
 * Model selection configuration
 */
export interface ModelSelectionConfig {
  strategy: ModelSelectionStrategy;
  userTier: UserTier;
  fallbackEnabled: boolean;
  requiresCapability?: ModelCapability[];
  excludeDeprecated?: boolean;
  preferProvider?: string;
}

/**
 * Default model selection strategies
 */
export const MODEL_STRATEGIES: Record<
  ModelSelectionStrategy,
  {
    primaryModels: string[];
    fallbackModels: string[];
    requiredCapabilities?: ModelCapability[];
  }
> = {
  speed: {
    primaryModels: ["claude-3-5-haiku-20241022", "gpt-4o-mini"],
    fallbackModels: ["gpt-4o-mini"],
    requiredCapabilities: ["tools"],
  },
  balanced: {
    primaryModels: ["claude-4-sonnet-20250514", "claude-3-5-sonnet-20241022"],
    fallbackModels: ["claude-3-5-sonnet-20240620", "gpt-4o"],
    requiredCapabilities: ["tools", "multimodal"],
  },
  reasoning: {
    primaryModels: ["claude-4-opus-20250514", "claude-4-sonnet-20250514"],
    fallbackModels: ["claude-3-7-sonnet-20250219", "o1-preview"],
    requiredCapabilities: ["reasoning"],
  },
  creative: {
    primaryModels: ["claude-4-sonnet-20250514", "claude-3-5-sonnet-20241022"],
    fallbackModels: ["claude-3-5-sonnet-20240620", "gpt-4o"],
    requiredCapabilities: ["tools", "multimodal"],
  },
  vision: {
    primaryModels: ["claude-4-sonnet-20250514", "claude-3-5-sonnet-20241022"],
    fallbackModels: ["claude-3-5-sonnet-20240620", "gpt-4o"],
    requiredCapabilities: ["vision", "multimodal"],
  },
  code: {
    primaryModels: ["claude-3-5-sonnet-20241022", "claude-4-sonnet-20250514"],
    fallbackModels: ["claude-3-5-sonnet-20240620", "gpt-4o"],
    requiredCapabilities: ["tools", "code"],
  },
  computer: {
    primaryModels: ["claude-3-5-sonnet-20241022"],
    fallbackModels: ["claude-3-5-sonnet-20240620"],
    requiredCapabilities: ["computer-use", "tools"],
  },
};

/**
 * User tier access controls
 */
export const USER_TIER_LIMITS: Record<
  UserTier,
  {
    maxCostTier: "low" | "medium" | "high";
    allowReasoningModels: boolean;
    allowLatestModels: boolean;
    requestsPerHour?: number;
  }
> = {
  free: {
    maxCostTier: "low",
    allowReasoningModels: false,
    allowLatestModels: false,
    requestsPerHour: 20,
  },
  pro: {
    maxCostTier: "medium",
    allowReasoningModels: true,
    allowLatestModels: true,
    requestsPerHour: 200,
  },
  enterprise: {
    maxCostTier: "high",
    allowReasoningModels: true,
    allowLatestModels: true,
  },
};

/**
 * Model cost tiers (for access control)
 */
const MODEL_COST_TIERS: Record<string, "low" | "medium" | "high"> = {
  // Low cost
  "claude-3-5-haiku-20241022": "low",
  "gpt-4o-mini": "low",

  // Medium cost
  "claude-3-5-sonnet-20240620": "medium",
  "claude-3-5-sonnet-20241022": "medium",
  "claude-3-7-sonnet-20250219": "medium",
  "gpt-4o": "medium",

  // High cost
  "claude-4-opus-20250514": "high",
  "claude-4-sonnet-20250514": "high",
  "o1-preview": "high",
};

/**
 * Select the best model based on strategy and user tier
 */
export function selectModel(config: ModelSelectionConfig): string | null {
  const strategy = MODEL_STRATEGIES[config.strategy];
  const _userLimits = USER_TIER_LIMITS[config.userTier];

  // Combine primary and fallback models
  const candidateModels = config.fallbackEnabled
    ? [...strategy.primaryModels, ...strategy.fallbackModels]
    : strategy.primaryModels;

  // Filter models based on constraints
  const availableModels = candidateModels.filter((modelId) => {
    const modelConfig = getModelConfig(modelId);
    if (!modelConfig) return false;

    // Check if model is deprecated (if exclusion is enabled)
    if (config.excludeDeprecated && modelConfig.metadata.deprecated) {
      return false;
    }

    // Check user tier access
    const costTier = MODEL_COST_TIERS[modelId] || "medium";
    if (
      !canUserAccessModel(
        config.userTier,
        costTier,
        modelSupportsReasoning(modelId),
      )
    ) {
      return false;
    }

    // Check required capabilities
    if (config.requiresCapability) {
      const hasAllCapabilities = config.requiresCapability.every((cap) =>
        modelConfig.metadata.capabilities?.includes(cap),
      );
      if (!hasAllCapabilities) return false;
    }

    // Check strategy requirements
    if (strategy.requiredCapabilities) {
      const hasStrategyCapabilities = strategy.requiredCapabilities.every(
        (cap) => modelConfig.metadata.capabilities?.includes(cap),
      );
      if (!hasStrategyCapabilities) return false;
    }

    // Check provider preference
    if (
      config.preferProvider &&
      modelConfig.provider !== config.preferProvider
    ) {
      return false;
    }

    return true;
  });

  // Return the first available model
  return availableModels[0] || null;
}

/**
 * Check if user can access a specific model
 */
export function canUserAccessModel(
  userTier: UserTier,
  modelCostTier: "low" | "medium" | "high",
  isReasoningModel: boolean,
): boolean {
  const limits = USER_TIER_LIMITS[userTier];

  // Check cost tier access
  const costTierOrder = { low: 0, medium: 1, high: 2 };
  if (costTierOrder[modelCostTier] > costTierOrder[limits.maxCostTier]) {
    return false;
  }

  // Check reasoning model access
  if (isReasoningModel && !limits.allowReasoningModels) {
    return false;
  }

  return true;
}

/**
 * Get model recommendations for a specific use case
 */
export function getModelRecommendations(
  useCase: string,
  userTier: UserTier = "pro",
): string[] {
  const useCaseToStrategy: Record<string, ModelSelectionStrategy> = {
    chat: "balanced",
    coding: "code",
    analysis: "reasoning",
    "creative-writing": "creative",
    "image-analysis": "vision",
    automation: "computer",
    "quick-tasks": "speed",
  };

  const strategy = useCaseToStrategy[useCase] || "balanced";

  // Get multiple recommendations
  const recommendations: string[] = [];

  // Primary recommendation
  const primary = selectModel({
    strategy,
    userTier,
    fallbackEnabled: false,
    excludeDeprecated: true,
  });
  if (primary) recommendations.push(primary);

  // Alternative recommendations
  const alternative = selectModel({
    strategy,
    userTier,
    fallbackEnabled: true,
    excludeDeprecated: true,
  });
  if (alternative && alternative !== primary) {
    recommendations.push(alternative);
  }

  // Budget option
  if (userTier !== "free") {
    const budget = selectModel({
      strategy: "speed",
      userTier,
      fallbackEnabled: true,
      excludeDeprecated: true,
    });
    if (budget && !recommendations.includes(budget)) {
      recommendations.push(budget);
    }
  }

  return recommendations;
}

/**
 * Validate model configuration for a specific use case
 */
export function validateModelForUseCase(
  modelId: string,
  useCase: string,
  userTier: UserTier = "pro",
): { valid: boolean; issues: string[]; suggestions: string[] } {
  const config = getModelConfig(modelId);
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!config) {
    issues.push(`Model ${modelId} not found`);
    return { valid: false, issues, suggestions };
  }

  // Check if model is deprecated
  if (config.metadata.deprecated) {
    issues.push("Model is deprecated");
    suggestions.push("Consider using a newer model version");
  }

  // Check user access
  const costTier = MODEL_COST_TIERS[modelId] || "medium";
  if (
    !canUserAccessModel(userTier, costTier, modelSupportsReasoning(modelId))
  ) {
    issues.push(`User tier ${userTier} cannot access this model`);
    suggestions.push("Upgrade your tier or choose a different model");
  }

  // Use case specific validation
  const useCaseRequirements: Record<string, ModelCapability[]> = {
    "image-analysis": ["vision", "multimodal"],
    coding: ["tools", "code"],
    automation: ["computer-use", "tools"],
    reasoningText: ["reasoning"],
  };

  const requiredCapabilities = useCaseRequirements[useCase];
  if (requiredCapabilities) {
    const missingCapabilities = requiredCapabilities.filter(
      (cap) => !config.metadata.capabilities?.includes(cap),
    );

    if (missingCapabilities.length > 0) {
      issues.push(`Missing capabilities: ${missingCapabilities.join(", ")}`);
      suggestions.push("Choose a model with the required capabilities");
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Get model usage statistics (for cost tracking)
 */
export interface ModelUsageStats {
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  lastUsed: Date;
}

/**
 * Simple in-memory usage tracking (replace with proper storage in production)
 */
const modelUsageStats = new Map<string, ModelUsageStats>();

export function trackModelUsage(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
): void {
  const current = modelUsageStats.get(modelId) || {
    requestCount: 0,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCost: 0,
    lastUsed: new Date(),
  };

  current.requestCount += 1;
  current.inputTokens += inputTokens;
  current.outputTokens += outputTokens;
  current.lastUsed = new Date();

  // Simple cost estimation (replace with actual pricing)
  const costTier = MODEL_COST_TIERS[modelId] || "medium";
  const costMultiplier = { low: 1, medium: 3, high: 10 }[costTier];
  current.estimatedCost +=
    (inputTokens + outputTokens) * costMultiplier * 0.00001;

  modelUsageStats.set(modelId, current);
}

export function getModelUsageStats(modelId: string): ModelUsageStats | null {
  return modelUsageStats.get(modelId) || null;
}

export function getAllUsageStats(): Record<string, ModelUsageStats> {
  return Object.fromEntries(modelUsageStats.entries());
}

/**
 * Model comparison utilities
 */
export function compareModels(
  modelIds: string[],
): Record<string, ProviderModelConfig | null> {
  return Object.fromEntries(modelIds.map((id) => [id, getModelConfig(id)]));
}

/**
 * Get model feature matrix for comparison
 */
export function getModelFeatureMatrix(modelIds: string[]) {
  const capabilities: ModelCapability[] = [
    "reasoning",
    "vision",
    "tools",
    "computer-use",
    "multimodal",
  ];

  return modelIds.map((modelId) => {
    const config = getModelConfig(modelId);
    return {
      id: modelId,
      name: config?.metadata.name || modelId,
      provider: config?.provider || "unknown",
      capabilities: capabilities.reduce(
        (acc, cap) => {
          acc[cap] = config?.metadata.capabilities?.includes(cap) || false;
          return acc;
        },
        {} as Record<ModelCapability, boolean>,
      ),
      reasoningText: config?.metadata.reasoningText?.supported || false,
      deprecated: config?.metadata.deprecated || false,
      contextWindow: config?.metadata.contextWindow,
    };
  });
}
