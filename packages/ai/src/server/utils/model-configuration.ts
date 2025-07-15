import { type LanguageModel } from 'ai';

/**
 * Model configuration interface
 */
export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  provider?: string;
  capabilities?: ModelCapabilities;
  pricing?: ModelPricing;
}

/**
 * Model capabilities
 */
export interface ModelCapabilities {
  reasoning?: boolean;
  vision?: boolean;
  codeGeneration?: boolean;
  maxTokens?: number;
  supportedFormats?: string[];
}

/**
 * Model pricing information
 */
export interface ModelPricing {
  inputTokensPerDollar?: number;
  outputTokensPerDollar?: number;
  costPer1kInputTokens?: number;
  costPer1kOutputTokens?: number;
}

/**
 * Model registry for organizing and managing AI models
 */
export class ModelRegistry {
  private models = new Map<string, ModelConfig>();
  private languageModels = new Map<string, LanguageModel>();

  /**
   * Register a model configuration
   */
  register(config: ModelConfig): void {
    this.models.set(config.id, config);
  }

  /**
   * Register multiple models
   */
  registerMany(configs: ModelConfig[]): void {
    configs.forEach(config => this.register(config));
  }

  /**
   * Get a model configuration
   */
  getConfig(id: string): ModelConfig | undefined {
    return this.models.get(id);
  }

  /**
   * Get all model configurations
   */
  getAllConfigs(): ModelConfig[] {
    return Array.from(this.models.values());
  }

  /**
   * Get models by capability
   */
  getModelsByCapability(capability: keyof ModelCapabilities): ModelConfig[] {
    return this.getAllConfigs().filter(model => model.capabilities?.[capability] === true);
  }

  /**
   * Register a language model instance
   */
  registerLanguageModel(id: string, model: LanguageModel): void {
    this.languageModels.set(id, model);
  }

  /**
   * Get a language model instance
   */
  getLanguageModel(id: string): LanguageModel | undefined {
    return this.languageModels.get(id);
  }

  /**
   * Get all available model IDs
   */
  getAvailableModelIds(): string[] {
    return Array.from(this.models.keys());
  }

  /**
   * Check if a model is available
   */
  isModelAvailable(id: string): boolean {
    return this.models.has(id);
  }

  /**
   * Get default model for a specific use case
   */
  getDefaultModel(
    useCase: 'chat' | 'reasoning' | 'title' | 'artifact' | 'image',
  ): ModelConfig | undefined {
    const models = this.getAllConfigs();

    switch (useCase) {
      case 'reasoning':
        return models.find(m => m.capabilities?.reasoning) || models[0];
      case 'image':
        return models.find(m => m.capabilities?.vision) || models[0];
      case 'artifact':
        return models.find(m => m.capabilities?.codeGeneration) || models[0];
      default:
        return models[0];
    }
  }
}

/**
 * User entitlements for model access
 */
export interface UserEntitlements {
  maxMessagesPerDay: number;
  allowedModels: string[];
  priorityAccess: boolean;
  customModels?: string[];
}

/**
 * Entitlements by user type
 */
export interface EntitlementsByUserType {
  [userType: string]: UserEntitlements;
}

/**
 * Default entitlements configuration
 */
export const DEFAULT_ENTITLEMENTS: EntitlementsByUserType = {
  free: {
    maxMessagesPerDay: 10,
    allowedModels: ['chat-model'],
    priorityAccess: false,
  },
  pro: {
    maxMessagesPerDay: 100,
    allowedModels: ['chat-model', 'chat-model-reasoning'],
    priorityAccess: true,
  },
  enterprise: {
    maxMessagesPerDay: 1000,
    allowedModels: ['chat-model', 'chat-model-reasoning', 'title-model', 'artifact-model'],
    priorityAccess: true,
  },
};

/**
 * Model selection utilities
 */
export class ModelSelector {
  constructor(
    private registry: ModelRegistry,
    private entitlements: EntitlementsByUserType = DEFAULT_ENTITLEMENTS,
  ) {}

  /**
   * Get available models for a user type
   */
  getAvailableModels(userType: string): ModelConfig[] {
    const userEntitlements = this.entitlements[userType];
    if (!userEntitlements) {
      return [];
    }

    return userEntitlements.allowedModels
      .map(id => this.registry.getConfig(id))
      .filter((config): config is ModelConfig => config !== undefined);
  }

  /**
   * Check if a user can access a specific model
   */
  canAccessModel(userType: string, modelId: string): boolean {
    const userEntitlements = this.entitlements[userType];
    if (!userEntitlements) {
      return false;
    }

    return (
      userEntitlements.allowedModels.includes(modelId) ||
      (userEntitlements.customModels?.includes(modelId) ?? false)
    );
  }

  /**
   * Get the best model for a user and use case
   */
  getBestModel(
    userType: string,
    useCase: 'chat' | 'reasoning' | 'title' | 'artifact' | 'image',
  ): ModelConfig | undefined {
    const availableModels = this.getAvailableModels(userType);

    switch (useCase) {
      case 'reasoning':
        return availableModels.find(m => m.capabilities?.reasoning) || availableModels[0];
      case 'image':
        return availableModels.find(m => m.capabilities?.vision) || availableModels[0];
      case 'artifact':
        return availableModels.find(m => m.capabilities?.codeGeneration) || availableModels[0];
      default:
        return availableModels[0];
    }
  }

  /**
   * Get usage limits for a user type
   */
  getUsageLimits(userType: string): UserEntitlements | undefined {
    return this.entitlements[userType];
  }
}

/**
 * Create a global model registry instance
 */
export function createModelRegistry(): ModelRegistry {
  return new ModelRegistry();
}

/**
 * Create a model selector with default entitlements
 */
export function createModelSelector(
  registry: ModelRegistry,
  customEntitlements?: EntitlementsByUserType,
): ModelSelector {
  return new ModelSelector(registry, customEntitlements);
}

/**
 * Standard model configurations
 */
export const STANDARD_MODELS: ModelConfig[] = [
  {
    id: 'chat-model',
    name: 'Chat Model',
    description: 'Primary model for all-purpose chat',
    capabilities: {
      reasoning: false,
      vision: false,
      codeGeneration: true,
      maxTokens: 8192,
    },
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning Model',
    description: 'Uses advanced reasoning capabilities',
    capabilities: {
      reasoning: true,
      vision: false,
      codeGeneration: true,
      maxTokens: 8192,
    },
  },
  {
    id: 'title-model',
    name: 'Title Generation Model',
    description: 'Optimized for generating concise titles',
    capabilities: {
      reasoning: false,
      vision: false,
      codeGeneration: false,
      maxTokens: 256,
    },
  },
  {
    id: 'artifact-model',
    name: 'Artifact Model',
    description: 'Specialized for creating documents and artifacts',
    capabilities: {
      reasoning: false,
      vision: false,
      codeGeneration: true,
      maxTokens: 8192,
    },
  },
];
