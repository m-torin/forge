/**
 * Shared Model Metadata for UI Display
 * Contains display information, capabilities, and metadata for all AI models
 */

import type { TaskType } from "../features/classification/task-classifier";

export interface ModelMetadata {
  id: string;
  name: string;
  description: string;
  provider?: string;
  capabilities?: string[];
  taskTypes?: TaskType[];
  costPer1kTokens?: number;
  strengthScore?: number;
  contextWindow?: number;
  maxOutputTokens?: number;
  supportedFeatures?: string[];
}

/**
 * Complete model metadata registry for all supported models
 */
export const MODEL_METADATA: Record<string, ModelMetadata> = {
  // Anthropic Models
  claude: {
    id: "claude",
    name: "Claude 4 Sonnet",
    description: "Balanced model with vision and tool capabilities",
    provider: "Anthropic",
    capabilities: ["vision", "tools", "multimodal"],
    taskTypes: ["general", "creative-writing", "reasoning", "multimodal"],
    costPer1kTokens: 0.009,
    strengthScore: 8,
    contextWindow: 200000,
    maxOutputTokens: 4096,
    supportedFeatures: ["function-calling", "vision", "artifacts"],
  },
  "claude-reasoning": {
    id: "claude-reasoning",
    name: "Claude 4 Opus",
    description: "Most powerful model with built-in reasoning",
    provider: "Anthropic",
    capabilities: ["reasoning", "vision", "tools", "computer-use"],
    taskTypes: ["reasoning", "research", "code-generation"],
    costPer1kTokens: 0.045,
    strengthScore: 10,
    contextWindow: 200000,
    maxOutputTokens: 4096,
    supportedFeatures: [
      "function-calling",
      "vision",
      "artifacts",
      "computer-use",
    ],
  },
  // Local Models
  "lmstudio-code": {
    id: "lmstudio-code",
    name: "LM Studio Code",
    description: "Local code-optimized model for development",
    provider: "LM Studio",
    capabilities: ["code", "tools", "local"],
    taskTypes: ["code-generation", "general"],
    costPer1kTokens: 0, // Free local model
    strengthScore: 9,
    contextWindow: 32000,
    maxOutputTokens: 2048,
    supportedFeatures: ["function-calling", "local-inference"],
  },
  // Google Models
  "gemini-pro": {
    id: "gemini-pro",
    name: "Gemini 1.5 Pro",
    description: "Google's most capable model with 2M context window",
    provider: "Google",
    capabilities: ["vision", "tools", "code", "pdf-support"],
    taskTypes: ["multimodal", "reasoning", "research", "code-generation"],
    costPer1kTokens: 0.003,
    strengthScore: 8,
    contextWindow: 2000000,
    maxOutputTokens: 8192,
    supportedFeatures: ["function-calling", "vision", "large-context"],
  },
  "gemini-flash": {
    id: "gemini-flash",
    name: "Gemini 1.5 Flash",
    description: "Fast and efficient model with 1M context window",
    provider: "Google",
    capabilities: ["vision", "tools", "code"],
    taskTypes: ["quick-qa", "general", "code-generation"],
    costPer1kTokens: 0.0002,
    strengthScore: 7,
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    supportedFeatures: ["function-calling", "vision", "fast-inference"],
  },
  // Perplexity Models
  "perplexity-search": {
    id: "perplexity-search",
    name: "Perplexity Sonar Pro",
    description: "Search-enabled model with real-time web access",
    provider: "Perplexity",
    capabilities: ["search", "tools", "sources"],
    taskTypes: ["research", "quick-qa"],
    costPer1kTokens: 0.002,
    strengthScore: 9,
    contextWindow: 127000,
    maxOutputTokens: 4096,
    supportedFeatures: ["web-search", "real-time-data", "citations"],
  },
  "perplexity-research": {
    id: "perplexity-research",
    name: "Perplexity Deep Research",
    description: "Expert-level research with comprehensive analysis",
    provider: "Perplexity",
    capabilities: ["search", "reasoning", "research"],
    taskTypes: ["research", "reasoning"],
    costPer1kTokens: 0.005,
    strengthScore: 10,
    contextWindow: 127000,
    maxOutputTokens: 4096,
    supportedFeatures: [
      "web-search",
      "real-time-data",
      "citations",
      "deep-analysis",
    ],
  },
};

/**
 * Get model metadata by ID
 */
export function getModelMetadata(modelId: string): ModelMetadata | undefined {
  return MODEL_METADATA[modelId];
}

/**
 * Get all models filtered by capability
 */
export function getModelsByCapability(capability: string): ModelMetadata[] {
  return Object.values(MODEL_METADATA).filter((model) =>
    model.capabilities?.includes(capability),
  );
}

/**
 * Get all models filtered by task type
 */
export function getModelsByTaskType(taskType: TaskType): ModelMetadata[] {
  return Object.values(MODEL_METADATA).filter((model) =>
    model.taskTypes?.includes(taskType),
  );
}

/**
 * Get all models by provider
 */
export function getModelsByProvider(provider: string): ModelMetadata[] {
  return Object.values(MODEL_METADATA).filter(
    (model) => model.provider?.toLowerCase() === provider.toLowerCase(),
  );
}

/**
 * Get models sorted by cost (ascending)
 */
export function getModelsByCost(): ModelMetadata[] {
  return Object.values(MODEL_METADATA).sort(
    (a, b) => (a.costPer1kTokens || 0) - (b.costPer1kTokens || 0),
  );
}

/**
 * Get models sorted by strength score (descending)
 */
export function getModelsByStrength(): ModelMetadata[] {
  return Object.values(MODEL_METADATA).sort(
    (a, b) => (b.strengthScore || 0) - (a.strengthScore || 0),
  );
}

/**
 * Get all available model IDs
 */
export function getAvailableModelIds(): string[] {
  return Object.keys(MODEL_METADATA);
}

/**
 * Check if a model supports a specific feature
 */
export function modelSupportsFeature(
  modelId: string,
  feature: string,
): boolean {
  const metadata = getModelMetadata(modelId);
  return metadata?.supportedFeatures?.includes(feature) || false;
}

/**
 * Default model configuration
 */
export const DEFAULT_CHAT_MODEL = "claude";
