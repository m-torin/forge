import type { LanguageModel } from 'ai';
import { defaultStreamTransform, type streamTransformPresets } from '../streaming/stream-defaults';
// AI SDK v5 telemetry configuration
function createTelemetrySettings() {
  return { isEnabled: true };
}

export interface ModelWithDefaultsOptions {
  /** Whether telemetry is enabled (defaults to checking production environment) */
  isProduction?: boolean;
  /** Function ID for telemetry tracking */
  functionId?: string;
  /** Stream transformation to apply */
  transform?: (typeof streamTransformPresets)[keyof typeof streamTransformPresets];
  /** Additional telemetry metadata */
  telemetryMetadata?: Record<string, string | number | boolean | null>;
}

export interface ModelStreamOptions {
  /** Pre-configured model settings */
  model?: LanguageModel;
  experimental_telemetry?: any;
  experimental_transform?: any;
}

/**
 * Creates a model configuration with default settings for AI SDK v5
 * Includes telemetry and stream transformation defaults
 */
export function createModelWithDefaults(
  provider: any,
  modelId: string,
  options: ModelWithDefaultsOptions = {},
): ModelStreamOptions {
  const {
    isProduction: _isProduction = process.env.NODE_ENV === 'production',
    functionId: _functionId = 'stream-text',
    transform = defaultStreamTransform,
    telemetryMetadata: _telemetryMetadata,
  } = options;

  return {
    model: provider.languageModel(modelId),
    experimental_telemetry: createTelemetrySettings(),
    experimental_transform: transform,
  };
}

/**
 * Factory for creating model configurations with provider-specific defaults
 */
export class ModelConfigFactory {
  private defaultOptions: ModelWithDefaultsOptions;

  constructor(defaultOptions: ModelWithDefaultsOptions = {}) {
    this.defaultOptions = defaultOptions;
  }

  /**
   * Creates a model configuration with merged defaults
   */
  create(provider: any, modelId: string, options?: ModelWithDefaultsOptions): ModelStreamOptions {
    return createModelWithDefaults(provider, modelId, {
      ...this.defaultOptions,
      ...options,
    });
  }

  /**
   * Creates a model configuration for reasoning models (no tools)
   */
  createReasoning(
    provider: any,
    modelId: string,
    options?: ModelWithDefaultsOptions,
  ): ModelStreamOptions & { tools: {} } {
    return {
      ...this.create(provider, modelId, options),
      tools: {}, // Reasoning models don't support tools
    };
  }

  /**
   * Creates a model configuration for multi-modal models
   */
  createMultiModal(
    provider: any,
    modelId: string,
    options?: ModelWithDefaultsOptions,
  ): ModelStreamOptions {
    return this.create(provider, modelId, {
      ...options,
      telemetryMetadata: {
        ...options?.telemetryMetadata,
        multiModal: true,
      },
    });
  }
}

/**
 * Default model factory instance
 */
export const modelFactory = new ModelConfigFactory();
