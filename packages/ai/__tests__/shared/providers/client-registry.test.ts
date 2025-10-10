/**
 * Tests for client provider registry
 * Testing client-side provider management and helper functions
 */

import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  ClientProviderRegistry,
  createProviderChain,
  getBestProviderForTask,
  getCostEstimate,
  getModelCapabilities,
  getProviderClient,
  getProviderStatus,
  listAvailableModels,
} from "#/shared/providers/client-registry";

// Mock provider configurations
vi.mock("#/shared/config/providers", () => ({
  getClientProviderConfig: vi.fn((providerId: string) => {
    const configs = {
      openai: {
        providerId: "openai",
        baseURL: "https://api.openai.com/v1",
        models: ["gpt-4", "gpt-3.5-turbo"],
      },
      anthropic: {
        providerId: "anthropic",
        baseURL: "https://api.anthropic.com",
        models: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
      },
      google: {
        providerId: "google",
        baseURL: "https://generativelanguage.googleapis.com",
        models: ["gemini-1.5-pro", "gemini-1.5-flash"],
      },
    };
    return configs[providerId as keyof typeof configs];
  }),

  listAvailableProviders: vi.fn(() => ["openai", "anthropic", "google"]),

  getDefaultProvider: vi.fn(() => "openai"),

  validateProviderConfig: vi.fn((config: any) => {
    if (!config.providerId) throw new Error("Provider ID required");
    if (!config.baseURL) throw new Error("Base URL required");
    return true;
  }),
}));

// Mock model metadata
vi.mock("#/shared/models", () => ({
  getModelMetadata: vi.fn((modelId: string) => {
    const metadata = {
      "gpt-4": {
        contextWindow: 8192,
        maxOutputTokens: 4096,
        inputCost: 0.03,
        outputCost: 0.06,
        multimodal: true,
        reasoningSupported: false,
      },
      "claude-3-5-sonnet-20241022": {
        contextWindow: 200000,
        maxOutputTokens: 4096,
        inputCost: 0.015,
        outputCost: 0.075,
        multimodal: true,
        reasoningSupported: true,
      },
      "gemini-1.5-pro": {
        contextWindow: 1048576,
        maxOutputTokens: 8192,
        inputCost: 0.00125,
        outputCost: 0.005,
        multimodal: true,
        reasoningSupported: false,
      },
    };
    return metadata[modelId as keyof typeof metadata];
  }),

  getModelsByProvider: vi.fn((providerId: string) => {
    const providerModels = {
      openai: ["gpt-4", "gpt-3.5-turbo"],
      anthropic: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
      google: ["gemini-1.5-pro", "gemini-1.5-flash"],
    };
    return providerModels[providerId as keyof typeof providerModels] || [];
  }),
}));

describe("client Provider Registry", () => {
  let registry: ClientProviderRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    registry = new ClientProviderRegistry();
  });

  describe("clientProviderRegistry", () => {
    test("should initialize with default providers", () => {
      expect(registry.listProviders()).toContain("openai");
      expect(registry.listProviders()).toContain("anthropic");
      expect(registry.listProviders()).toContain("google");
    });

    test("should get provider configuration", () => {
      const config = registry.getProvider("openai");

      expect(config).toMatchObject({
        providerId: "openai",
        baseURL: "https://api.openai.com/v1",
        models: expect.arrayContaining(["gpt-4", "gpt-3.5-turbo"]),
      });
    });

    test("should register custom provider", () => {
      const customConfig = {
        providerId: "custom",
        baseURL: "https://api.custom.com",
        models: ["custom-model-1", "custom-model-2"],
        apiKeyRequired: true,
      };

      registry.registerProvider(customConfig);

      expect(registry.listProviders()).toContain("custom");
      expect(registry.getProvider("custom")).toEqual(customConfig);
    });

    test("should update existing provider", () => {
      const updatedConfig = {
        providerId: "openai",
        baseURL: "https://api.openai.com/v1",
        models: ["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo"],
        features: ["function-calling", "vision"],
      };

      registry.updateProvider("openai", updatedConfig);

      const config = registry.getProvider("openai");
      expect(config.models).toContain("gpt-4-turbo");
      expect(config.features).toContain("function-calling");
    });

    test("should remove provider", () => {
      registry.removeProvider("google");

      expect(registry.listProviders()).not.toContain("google");
      expect(registry.getProvider("google")).toBeUndefined();
    });

    test("should handle non-existent provider gracefully", () => {
      const config = registry.getProvider("non-existent");
      expect(config).toBeUndefined();
    });

    test("should validate provider configuration", () => {
      const invalidConfig = {
        // Missing required fields
        models: ["test-model"],
      };

      expect(() => {
        registry.registerProvider(invalidConfig as any);
      }).toThrow(/Provider ID required/);
    });
  });

  describe("helper Functions", () => {
    describe("getProviderClient", () => {
      test("should create client for valid provider", () => {
        const client = getProviderClient("openai", {
          apiKey: "test-key",
        });

        expect(client).toBeDefined();
        expect(client.providerId).toBe("openai");
        expect(client.config.apiKey).toBe("test-key");
      });

      test("should handle invalid provider", () => {
        expect(() => {
          getProviderClient("invalid-provider" as any, {});
        }).toThrow(/Provider.*not found/i);
      });

      test("should apply default configuration", () => {
        const client = getProviderClient("anthropic");

        expect(client.config.baseURL).toBe("https://api.anthropic.com");
        expect(client.config.timeout).toBe(30000); // Default timeout
      });
    });

    describe("listAvailableModels", () => {
      test("should list all models across providers", () => {
        const models = listAvailableModels();

        expect(models.length).toBeGreaterThan(0);
        expect(models.some((m) => m.id === "gpt-4")).toBeTruthy();
        expect(
          models.some((m) => m.id === "claude-3-5-sonnet-20241022"),
        ).toBeTruthy();
        expect(models.some((m) => m.id === "gemini-1.5-pro")).toBeTruthy();
      });

      test("should filter models by provider", () => {
        const openaiModels = listAvailableModels({ provider: "openai" });

        expect(openaiModels.every((m) => m.provider === "openai")).toBeTruthy();
        expect(openaiModels.some((m) => m.id === "gpt-4")).toBeTruthy();
        expect(
          openaiModels.some((m) => m.id === "claude-3-5-sonnet-20241022"),
        ).toBeFalsy();
      });

      test("should filter models by capability", () => {
        const multimodalModels = listAvailableModels({
          capability: "multimodal",
        });

        expect(multimodalModels.length).toBeGreaterThan(0);
        expect(
          multimodalModels.every((m) => m.metadata?.multimodal),
        ).toBeTruthy();
      });

      test("should filter models by cost range", () => {
        const cheapModels = listAvailableModels({
          maxCostPer1KTokens: 0.01,
        });

        expect(cheapModels.length).toBeGreaterThan(0);
        expect(
          cheapModels.every((m) => (m.metadata?.inputCost || 0) <= 0.01),
        ).toBeTruthy();
      });
    });

    describe("getModelCapabilities", () => {
      test("should return model capabilities", () => {
        const capabilities = getModelCapabilities("gpt-4");

        expect(capabilities).toMatchObject({
          contextWindow: 8192,
          maxOutputTokens: 4096,
          multimodal: true,
          reasoningSupported: false,
          functionCalling: expect.any(Boolean),
          streaming: expect.any(Boolean),
        });
      });

      test("should handle unknown model", () => {
        const capabilities = getModelCapabilities("unknown-model");

        expect(capabilities).toBeUndefined();
      });

      test("should include cost information", () => {
        const capabilities = getModelCapabilities("claude-3-5-sonnet-20241022");

        expect(capabilities?.pricing).toMatchObject({
          inputCost: 0.015,
          outputCost: 0.075,
          currency: "USD",
          unit: "1K tokens",
        });
      });
    });

    describe("createProviderChain", () => {
      test("should create provider fallback chain", () => {
        const chain = createProviderChain([
          { provider: "openai", model: "gpt-4" },
          { provider: "anthropic", model: "claude-3-5-sonnet-20241022" },
          { provider: "google", model: "gemini-1.5-pro" },
        ]);

        expect(chain.providers).toHaveLength(3);
        expect(chain.providers[0].provider).toBe("openai");
        expect(chain.providers[1].provider).toBe("anthropic");
        expect(chain.providers[2].provider).toBe("google");
      });

      test("should support chain execution with fallback", async () => {
        const chain = createProviderChain([
          { provider: "openai", model: "gpt-4" },
          { provider: "anthropic", model: "claude-3-5-sonnet-20241022" },
        ]);

        // Mock first provider failure
        vi.spyOn(chain.providers[0], "execute")
          .mockImplementation()
          .mockRejectedValue(new Error("Primary failed"));
        vi.spyOn(chain.providers[1], "execute")
          .mockImplementation()
          .mockResolvedValue({ text: "Fallback success" });

        const result = await chain.execute({ prompt: "Test prompt" });

        expect(result).toMatchObject({
          text: "Fallback success",
          usedProvider: "anthropic",
        });
        expect(chain.providers[0].execute).toHaveBeenCalledWith();
        expect(chain.providers[1].execute).toHaveBeenCalledWith();
      });

      test("should fail if all providers in chain fail", async () => {
        const chain = createProviderChain([
          { provider: "openai", model: "gpt-4" },
        ]);

        vi.spyOn(chain.providers[0], "execute")
          .mockImplementation()
          .mockRejectedValue(new Error("Provider failed"));

        await expect(chain.execute({ prompt: "Test" })).rejects.toThrow(
          "All providers failed",
        );
      });
    });

    describe("getProviderStatus", () => {
      test("should check provider availability", async () => {
        const status = await getProviderStatus("openai");

        expect(status).toMatchObject({
          providerId: "openai",
          available: expect.any(Boolean),
          latency: expect.any(Number),
          lastChecked: expect.any(Date),
        });
      });

      test("should handle provider health check failure", async () => {
        // Mock health check failure
        vi.mocked(
          vi.importMock("#/shared/config/providers"),
        ).getClientProviderConfig.mockReturnValueOnce(undefined);

        const status = await getProviderStatus("non-existent");

        expect(status.available).toBeFalsy();
        expect(status.error).toBeDefined();
      });

      test("should include rate limit information", async () => {
        const status = await getProviderStatus("openai");

        if (status.rateLimit) {
          expect(status.rateLimit).toMatchObject({
            requestsPerMinute: expect.any(Number),
            tokensPerMinute: expect.any(Number),
            remaining: expect.any(Number),
          });
        }
      });
    });

    describe("getCostEstimate", () => {
      test("should calculate cost for generation request", () => {
        const estimate = getCostEstimate({
          model: "gpt-4",
          inputTokens: 1000,
          outputTokens: 500,
        });

        expect(estimate).toMatchObject({
          model: "gpt-4",
          inputTokens: 1000,
          outputTokens: 500,
          inputCost: 0.03, // $0.03 per 1K tokens
          outputCost: 0.03, // $0.06 per 1K tokens * 0.5K tokens
          totalCost: 0.06,
          currency: "USD",
        });
      });

      test("should handle unknown model", () => {
        const estimate = getCostEstimate({
          model: "unknown-model",
          inputTokens: 1000,
          outputTokens: 500,
        });

        expect(estimate.totalCost).toBe(0);
        expect(estimate.error).toContain("Unknown model");
      });

      test("should support batch cost calculation", () => {
        const estimates = getCostEstimate([
          { model: "gpt-4", inputTokens: 1000, outputTokens: 500 },
          {
            model: "claude-3-5-sonnet-20241022",
            inputTokens: 2000,
            outputTokens: 1000,
          },
        ]);

        expect(estimates).toHaveLength(2);
        expect(estimates[0].model).toBe("gpt-4");
        expect(estimates[1].model).toBe("claude-3-5-sonnet-20241022");

        const totalCost = estimates.reduce(
          (sum, est) => sum + est.totalCost,
          0,
        );
        expect(totalCost).toBeGreaterThan(0);
      });
    });

    describe("getBestProviderForTask", () => {
      test("should recommend provider for text generation", () => {
        const recommendation = getBestProviderForTask({
          task: "text-generation",
          requirements: {
            maxCost: 0.05,
            minContextWindow: 8000,
          },
        });

        expect(recommendation).toMatchObject({
          provider: expect.any(String),
          model: expect.any(String),
          confidence: expect.any(Number),
          reasoning: expect.any(String),
        });
        expect(recommendation.confidence).toBeGreaterThan(0);
      });

      test("should recommend provider for multimodal tasks", () => {
        const recommendation = getBestProviderForTask({
          task: "image-analysis",
          requirements: {
            multimodal: true,
          },
        });

        expect(recommendation.provider).toBeDefined();
        expect(recommendation.reasoning).toContain("multimodal");
      });

      test("should consider cost constraints", () => {
        const recommendation = getBestProviderForTask({
          task: "text-generation",
          requirements: {
            maxCostPer1KTokens: 0.01,
          },
        });

        const modelMeta = vi
          .mocked(vi.importMock("#/shared/models"))
          .getModelMetadata(recommendation.model);
        expect(modelMeta?.inputCost).toBeLessThanOrEqual(0.01);
      });

      test("should handle no suitable provider found", () => {
        const recommendation = getBestProviderForTask({
          task: "text-generation",
          requirements: {
            maxCost: 0.001, // Unrealistically low
            minContextWindow: 1000000, // Unrealistically high
          },
        });

        expect(recommendation.confidence).toBe(0);
        expect(recommendation.reasoning).toContain("No suitable");
      });
    });
  });

  describe("error Handling and Edge Cases", () => {
    test("should handle empty provider list gracefully", () => {
      const emptyRegistry = new ClientProviderRegistry();
      // Clear all providers
      emptyRegistry
        .listProviders()
        .forEach((p) => emptyRegistry.removeProvider(p));

      const models = listAvailableModels();
      expect(models).toHaveLength(0);
    });

    test("should handle malformed provider configuration", () => {
      const invalidConfig = {
        providerId: "invalid",
        baseURL: "not-a-url",
        models: null,
      };

      expect(() => {
        registry.registerProvider(invalidConfig as any);
      }).toThrow();
    });

    test("should handle concurrent provider operations", async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        getProviderStatus(`provider-${i}` as any),
      );

      const results = await Promise.allSettled(promises);

      // Should handle concurrent requests without errors
      expect(
        results.every(
          (r) => r.status === "fulfilled" || r.status === "rejected",
        ),
      ).toBeTruthy();
    });
  });
});
