/**
 * Tests for model factory and configuration defaults
 * Testing createModelWithDefaults, ModelConfigFactory, and related functions
 */

import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  applyDefaultSettings,
  createModelWithDefaults,
  createStandardModelConfig,
  createStreamingModelConfig,
  ModelConfigFactory,
} from "#/server/providers/model-factory";

// Mock telemetry and observability
vi.mock("#/server/core/telemetry", () => ({
  createTelemetryConfig: vi.fn(() => ({
    isEnabled: true,
    recordInputs: false,
    recordOutputs: false,
    recordUsage: true,
    functionId: "test-function",
    metadata: { source: "test" },
  })),
  withTelemetry: vi.fn((config) => ({ telemetry: config })),
}));

// Mock transform middleware
vi.mock("#/server/core/transforms", () => ({
  createDefaultTransform: vi.fn(() => ({
    transformId: "default-transform",
    input: vi.fn((x) => x),
    output: vi.fn((x) => x),
  })),
  createStreamingTransform: vi.fn(() => ({
    transformId: "streaming-transform",
    stream: vi.fn((x) => x),
  })),
}));

// Mock provider registry
vi.mock("#/server/providers/registry", () => ({
  getProvider: vi.fn((providerId: string) => ({
    providerId,
    languageModel: vi.fn((modelId: string) => ({
      modelId,
      providerId,
      doGenerate: vi.fn(),
      doStream: vi.fn(),
    })),
  })),
  listProviders: vi.fn(() => ["openai", "anthropic", "google"]),
}));

describe("model Factory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createModelWithDefaults", () => {
    test("should create model configuration with telemetry enabled", () => {
      const provider = {
        languageModel: vi.fn((id: string) => ({
          modelId: id,
          doGenerate: vi.fn(),
        })),
      };

      const config = createModelWithDefaults(provider, "test-model");

      expect(config.model).toBeDefined();
      expect(config.experimental_telemetry).toBeDefined();
      expect(config.experimental_telemetry?.isEnabled).toBeTruthy();
      expect(provider.languageModel).toHaveBeenCalledWith("test-model");
    });

    test("should include default transform middleware", () => {
      const provider = {
        languageModel: vi.fn((id: string) => ({ modelId: id })),
      };

      const config = createModelWithDefaults(provider, "test-model");

      expect(config.experimental_transform).toBeDefined();
      expect(config.experimental_transform?.transformId).toBe(
        "default-transform",
      );
    });

    test("should apply default generation settings", () => {
      const provider = {
        languageModel: vi.fn((id: string) => ({ modelId: id })),
      };

      const config = createModelWithDefaults(provider, "test-model", {
        temperature: 0.7,
        maxTokens: 1000,
      });

      expect(config.temperature).toBe(0.7);
      expect(config.maxTokens).toBe(1000);
    });

    test("should handle provider creation errors", () => {
      const errorProvider = {
        languageModel: vi.fn(() => {
          throw new Error("Model creation failed");
        }),
      };

      expect(() => {
        createModelWithDefaults(errorProvider, "error-model");
      }).toThrow("Model creation failed");
    });
  });

  describe("modelConfigFactory", () => {
    const factory = new ModelConfigFactory();

    test("should create basic model configuration", () => {
      const provider = {
        languageModel: vi.fn((id: string) => ({ modelId: id })),
      };

      const config = factory.create(provider, "basic-model");

      expect(config).toMatchObject({
        model: expect.objectContaining({ modelId: "basic-model" }),
        experimental_telemetry: expect.objectContaining({ isEnabled: true }),
        experimental_transform: expect.any(Object),
      });
    });

    test("should support configuration caching", () => {
      const provider = {
        languageModel: vi.fn((id: string) => ({ modelId: id })),
      };

      const config1 = factory.create(provider, "cached-model");
      const config2 = factory.create(provider, "cached-model");

      // Should reuse configuration for same model
      expect(provider.languageModel).toHaveBeenCalledTimes(2); // Called for each create
      expect(config1.model.modelId).toBe(config2.model.modelId);
    });

    test("should create configurations with custom settings", () => {
      const provider = {
        languageModel: vi.fn((id: string) => ({ modelId: id })),
      };

      const customSettings = {
        temperature: 0.9,
        topP: 0.95,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
        maxTokens: 2000,
      };

      const config = factory.create(provider, "custom-model", customSettings);

      expect(config).toMatchObject({
        model: expect.objectContaining({ modelId: "custom-model" }),
        ...customSettings,
      });
    });

    test("should handle different provider types", () => {
      const providers = [
        {
          name: "openai",
          languageModel: vi.fn((id) => ({ modelId: id, provider: "openai" })),
        },
        {
          name: "anthropic",
          languageModel: vi.fn((id) => ({
            modelId: id,
            provider: "anthropic",
          })),
        },
        {
          name: "google",
          languageModel: vi.fn((id) => ({ modelId: id, provider: "google" })),
        },
      ];

      providers.forEach((provider) => {
        const config = factory.create(provider, `${provider.name}-model`);
        expect(config.model.provider).toBe(provider.name);
      });
    });
  });

  describe("createStandardModelConfig", () => {
    test("should create standard configuration with defaults", () => {
      const provider = {
        languageModel: vi.fn((id: string) => ({ modelId: id })),
      };

      const config = createStandardModelConfig(provider, "standard-model");

      expect(config).toMatchObject({
        model: expect.objectContaining({ modelId: "standard-model" }),
        experimental_telemetry: expect.objectContaining({
          isEnabled: true,
          recordUsage: true,
        }),
        experimental_transform: expect.any(Object),
        temperature: 0.7, // Default temperature
        maxTokens: 4096, // Default max tokens
      });
    });

    test("should override defaults with provided settings", () => {
      const provider = {
        languageModel: vi.fn((id: string) => ({ modelId: id })),
      };

      const config = createStandardModelConfig(provider, "custom-model", {
        temperature: 0.5,
        maxTokens: 1000,
        topP: 0.9,
      });

      expect(config.temperature).toBe(0.5);
      expect(config.maxTokens).toBe(1000);
      expect(config.topP).toBe(0.9);
    });
  });

  describe("createStreamingModelConfig", () => {
    test("should create streaming-optimized configuration", () => {
      const provider = {
        languageModel: vi.fn((id: string) => ({
          modelId: id,
          doStream: vi.fn(),
        })),
      };

      const config = createStreamingModelConfig(provider, "streaming-model");

      expect(config).toMatchObject({
        model: expect.objectContaining({
          modelId: "streaming-model",
          doStream: expect.any(Function),
        }),
        experimental_transform: expect.objectContaining({
          transformId: "streaming-transform",
        }),
      });
    });

    test("should configure streaming-specific settings", () => {
      const provider = {
        languageModel: vi.fn((id: string) => ({ modelId: id })),
      };

      const config = createStreamingModelConfig(provider, "stream-model", {
        streamingBufferSize: 1024,
        streamingTimeout: 5000,
      });

      expect(config.streamingBufferSize).toBe(1024);
      expect(config.streamingTimeout).toBe(5000);
    });
  });

  describe("applyDefaultSettings", () => {
    test("should apply sensible defaults", () => {
      const baseConfig = {
        model: { modelId: "test" },
      };

      const config = applyDefaultSettings(baseConfig);

      expect(config).toMatchObject({
        model: { modelId: "test" },
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
      });
    });

    test("should preserve existing settings", () => {
      const baseConfig = {
        model: { modelId: "test" },
        temperature: 0.9,
        maxTokens: 1000,
      };

      const config = applyDefaultSettings(baseConfig);

      expect(config.temperature).toBe(0.9); // Preserved
      expect(config.maxTokens).toBe(1000); // Preserved
      expect(config.topP).toBe(1); // Default applied
    });

    test("should handle undefined/null inputs", () => {
      expect(() => applyDefaultSettings(undefined as any)).not.toThrow();
      expect(() => applyDefaultSettings(null as any)).not.toThrow();
    });
  });

  describe("integration Tests", () => {
    test("should create complete model configuration with all features", () => {
      const provider = {
        languageModel: vi.fn((id: string) => ({
          modelId: id,
          doGenerate: vi.fn(),
          doStream: vi.fn(),
          metadata: {
            contextWindow: 8192,
            maxOutputTokens: 4096,
          },
        })),
      };

      const config = createModelWithDefaults(provider, "complete-model", {
        temperature: 0.8,
        maxTokens: 2000,
      });

      // Verify all components are present
      expect(config.model).toBeDefined();
      expect(config.experimental_telemetry).toBeDefined();
      expect(config.experimental_transform).toBeDefined();
      expect(config.temperature).toBe(0.8);
      expect(config.maxTokens).toBe(2000);

      // Verify telemetry configuration
      expect(config.experimental_telemetry?.isEnabled).toBeTruthy();
      expect(config.experimental_telemetry?.recordUsage).toBeTruthy();

      // Verify transform is configured
      expect(config.experimental_transform?.transformId).toBeDefined();
    });

    test("should handle complex provider scenarios", () => {
      const complexProvider = {
        languageModel: vi.fn((id: string) => ({
          modelId: id,
          doGenerate: vi.fn(),
          doStream: vi.fn(),
          metadata: {
            reasoningSupported: true,
            toolCalling: true,
            multimodal: false,
          },
        })),
      };

      const config = createModelWithDefaults(complexProvider, "complex-model", {
        enableReasoning: true,
        enableToolCalling: true,
      });

      expect(config.model.metadata.reasoningSupported).toBeTruthy();
      expect(config.model.metadata.toolCalling).toBeTruthy();
    });
  });

  describe("error Handling", () => {
    test("should handle telemetry configuration errors", () => {
      vi.mocked(
        vi.importMock("#/server/core/telemetry"),
      ).createTelemetryConfig.mockImplementation(() => {
        throw new Error("Telemetry setup failed");
      });

      const provider = {
        languageModel: vi.fn((id: string) => ({ modelId: id })),
      };

      // Should create config without telemetry rather than fail completely
      expect(() => {
        createModelWithDefaults(provider, "no-telemetry-model");
      }).toThrow("Telemetry setup failed");
    });

    test("should handle transform middleware errors", () => {
      vi.mocked(
        vi.importMock("#/server/core/transforms"),
      ).createDefaultTransform.mockImplementation(() => {
        throw new Error("Transform setup failed");
      });

      const provider = {
        languageModel: vi.fn((id: string) => ({ modelId: id })),
      };

      expect(() => {
        createModelWithDefaults(provider, "no-transform-model");
      }).toThrow("Transform setup failed");
    });
  });
});
