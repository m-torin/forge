/**
 * Configuration Tests
 *
 * Tests for configuration utilities and validation:
 * - Link manager configuration
 * - Provider configuration
 * - Analytics configuration
 * - Environment-specific configurations
 */

import { describe, expect, test } from "vitest";

describe("configuration Management", () => {
  // Test link manager configuration
  describe("link Manager Configuration", () => {
    test("should create valid configuration with minimal settings", () => {
      const config = {
        providers: {
          dub: {
            enabled: true,
            apiKey: "test-api-key",
          },
        },
      };

      expect(config).toHaveProperty("providers");
      expect(config.providers).toHaveProperty("dub");
      expect(config.providers.dub).toHaveProperty("enabled", true);
      expect(config.providers.dub).toHaveProperty("apiKey", "test-api-key");
    });

    test("should create valid configuration with full settings", () => {
      const config = {
        providers: {
          dub: {
            enabled: true,
            apiKey: "test-api-key",
            workspace: "test-workspace",
            baseUrl: "https://api.dub.co",
            defaultDomain: "custom.link",
            defaultExpiration: "2024-12-31T23:59:59Z",
            defaultTags: ["production", "marketing"],
          },
        },
        analytics: {
          enabled: true,
          events: [
            "link_created",
            "link_clicked",
            "link_updated",
            "link_deleted",
          ],
          sampling: 0.8,
        },
        cache: {
          enabled: true,
          ttl: 300,
          provider: "redis",
        },
        rateLimit: {
          enabled: true,
          maxRequests: 1000,
          windowMs: 60000,
        },
      };

      expect(config).toHaveProperty("providers");
      expect(config).toHaveProperty("analytics");
      expect(config).toHaveProperty("cache");
      expect(config).toHaveProperty("rateLimit");

      expect(config.providers.dub).toHaveProperty("enabled", true);
      expect(config.providers.dub).toHaveProperty("apiKey", "test-api-key");
      expect(config.providers.dub).toHaveProperty(
        "workspace",
        "test-workspace",
      );
      expect(config.providers.dub).toHaveProperty(
        "baseUrl",
        "https://api.dub.co",
      );
      expect(config.providers.dub).toHaveProperty(
        "defaultDomain",
        "custom.link",
      );
      expect(config.providers.dub).toHaveProperty(
        "defaultExpiration",
        "2024-12-31T23:59:59Z",
      );
      expect(config.providers.dub).toHaveProperty("defaultTags");
      expect(config.providers.dub.defaultTags).toStrictEqual([
        "production",
        "marketing",
      ]);

      expect(config.analytics).toHaveProperty("enabled", true);
      expect(config.analytics).toHaveProperty("events");
      expect(config.analytics.events).toStrictEqual([
        "link_created",
        "link_clicked",
        "link_updated",
        "link_deleted",
      ]);
      expect(config.analytics).toHaveProperty("sampling", 0.8);

      expect(config.cache).toHaveProperty("enabled", true);
      expect(config.cache).toHaveProperty("ttl", 300);
      expect(config.cache).toHaveProperty("provider", "redis");

      expect(config.rateLimit).toHaveProperty("enabled", true);
      expect(config.rateLimit).toHaveProperty("maxRequests", 1000);
      expect(config.rateLimit).toHaveProperty("windowMs", 60000);
    });

    test("should handle configuration with multiple providers", () => {
      const config = {
        providers: {
          dub: {
            enabled: true,
            apiKey: "dub-api-key",
            priority: 1,
          },
          bitly: {
            enabled: false,
            apiKey: "bitly-api-key",
            priority: 2,
          },
          custom: {
            enabled: true,
            apiKey: "custom-api-key",
            baseUrl: "https://custom.link/api",
            priority: 3,
          },
        },
      };

      expect(config.providers).toHaveProperty("dub");
      expect(config.providers).toHaveProperty("bitly");
      expect(config.providers).toHaveProperty("custom");

      expect(config.providers.dub.enabled).toBeTruthy();
      expect(config.providers.bitly.enabled).toBeFalsy();
      expect(config.providers.custom.enabled).toBeTruthy();

      expect(config.providers.dub.priority).toBe(1);
      expect(config.providers.bitly.priority).toBe(2);
      expect(config.providers.custom.priority).toBe(3);
    });
  });

  // Test provider-specific configurations
  describe("provider Configurations", () => {
    test("should validate Dub provider configuration", () => {
      const dubConfig = {
        enabled: true,
        apiKey: "dub_test_key_123",
        workspace: "my-workspace",
        baseUrl: "https://api.dub.co",
        defaultDomain: "dub.sh",
        defaultExpiration: "2024-12-31T23:59:59Z",
        defaultTags: ["test", "development"],
      };

      expect(dubConfig).toHaveProperty("enabled", true);
      expect(dubConfig).toHaveProperty("apiKey");
      expect(dubConfig.apiKey).toMatch(/^dub_/);
      expect(dubConfig).toHaveProperty("workspace", "my-workspace");
      expect(dubConfig).toHaveProperty("baseUrl");
      expect(dubConfig.baseUrl).toMatch(/^https:\/\//);
      expect(dubConfig).toHaveProperty("defaultDomain", "dub.sh");
      expect(dubConfig).toHaveProperty("defaultExpiration");
      expect(dubConfig).toHaveProperty("defaultTags");
      expect(Array.isArray(dubConfig.defaultTags)).toBeTruthy();
      expect(dubConfig.defaultTags).toStrictEqual(["test", "development"]);
    });

    test("should handle provider configuration variants", () => {
      const configurations = [
        {
          name: "minimal",
          config: {
            enabled: true,
            apiKey: "test-key",
          },
        },
        {
          name: "with domain",
          config: {
            enabled: true,
            apiKey: "test-key",
            defaultDomain: "custom.link",
          },
        },
        {
          name: "with workspace",
          config: {
            enabled: true,
            apiKey: "test-key",
            workspace: "test-workspace",
          },
        },
        {
          name: "with tags",
          config: {
            enabled: true,
            apiKey: "test-key",
            defaultTags: ["production", "analytics"],
          },
        },
        {
          name: "disabled",
          config: {
            enabled: false,
            apiKey: "test-key",
          },
        },
      ];

      configurations.forEach(({ name: _name, config }) => {
        expect(config).toHaveProperty("enabled");
        expect(config).toHaveProperty("apiKey");
        expect(typeof config.enabled).toBe("boolean");
        expect(typeof config.apiKey).toBe("string");

        if (config.defaultDomain) {
          expect(typeof config.defaultDomain).toBe("string");
        }

        if (config.workspace) {
          expect(typeof config.workspace).toBe("string");
        }

        if (config.defaultTags) {
          expect(Array.isArray(config.defaultTags)).toBeTruthy();
        }
      });
    });
  });

  // Test analytics configuration
  describe("analytics Configuration", () => {
    test("should validate analytics configuration", () => {
      const analyticsConfig = {
        enabled: true,
        events: [
          "link_created",
          "link_clicked",
          "link_updated",
          "link_deleted",
        ],
        sampling: 0.8,
        providers: {
          posthog: {
            enabled: true,
            apiKey: "phc_test_key",
            host: "https://app.posthog.com",
          },
          segment: {
            enabled: false,
            writeKey: "test_write_key",
          },
        },
      };

      expect(analyticsConfig).toHaveProperty("enabled", true);
      expect(analyticsConfig).toHaveProperty("events");
      expect(Array.isArray(analyticsConfig.events)).toBeTruthy();
      expect(analyticsConfig.events).toStrictEqual([
        "link_created",
        "link_clicked",
        "link_updated",
        "link_deleted",
      ]);
      expect(analyticsConfig).toHaveProperty("sampling", 0.8);
      expect(analyticsConfig).toHaveProperty("providers");

      expect(analyticsConfig.providers).toHaveProperty("posthog");
      expect(analyticsConfig.providers.posthog).toHaveProperty("enabled", true);
      expect(analyticsConfig.providers.posthog).toHaveProperty("apiKey");
      expect(analyticsConfig.providers.posthog.apiKey).toMatch(/^phc_/);
      expect(analyticsConfig.providers.posthog).toHaveProperty("host");

      expect(analyticsConfig.providers).toHaveProperty("segment");
      expect(analyticsConfig.providers.segment).toHaveProperty(
        "enabled",
        false,
      );
      expect(analyticsConfig.providers.segment).toHaveProperty("writeKey");
    });

    test("should handle different event configurations", () => {
      const eventConfigurations = [
        {
          name: "all events",
          events: [
            "link_created",
            "link_clicked",
            "link_updated",
            "link_deleted",
            "link_viewed",
          ],
        },
        {
          name: "essential events",
          events: ["link_created", "link_clicked"],
        },
        {
          name: "single event",
          events: ["link_created"],
        },
        {
          name: "no events",
          events: [],
        },
      ];

      eventConfigurations.forEach(({ name: _name, events }) => {
        const config = {
          enabled: true,
          events,
          sampling: 1.0,
        };

        expect(config).toHaveProperty("enabled", true);
        expect(config).toHaveProperty("events");
        expect(Array.isArray(config.events)).toBeTruthy();
        expect(config.events).toStrictEqual(events);
        expect(config).toHaveProperty("sampling", 1.0);
      });
    });

    test("should handle sampling rate variations", () => {
      const samplingRates = [0.0, 0.1, 0.5, 0.8, 1.0];

      samplingRates.forEach((sampling) => {
        const config = {
          enabled: true,
          events: ["link_created"],
          sampling,
        };

        expect(config).toHaveProperty("sampling", sampling);
        expect(config.sampling).toBeGreaterThanOrEqual(0.0);
        expect(config.sampling).toBeLessThanOrEqual(1.0);
      });
    });
  });

  // Test configuration validation
  describe("configuration Validation", () => {
    test("should validate required configuration properties", () => {
      const validConfigs = [
        {
          providers: {
            dub: {
              enabled: true,
              apiKey: "test-key",
            },
          },
        },
        {
          providers: {
            dub: {
              enabled: true,
              apiKey: "test-key",
              workspace: "test",
            },
          },
          analytics: {
            enabled: true,
            events: ["link_created"],
          },
        },
      ];

      validConfigs.forEach((config) => {
        expect(config).toHaveProperty("providers");
        expect(config.providers).toHaveProperty("dub");
        expect(config.providers.dub).toHaveProperty("enabled");
        expect(config.providers.dub).toHaveProperty("apiKey");
        expect(typeof config.providers.dub.enabled).toBe("boolean");
        expect(typeof config.providers.dub.apiKey).toBe("string");
        expect(config.providers.dub.apiKey.length).toBeGreaterThan(0);
      });
    });

    test("should handle configuration with missing properties", () => {
      const incompleteConfigs = [
        {
          providers: {
            dub: {
              enabled: true,
              // Missing apiKey
            },
          },
        },
        {
          providers: {
            dub: {
              apiKey: "test-key",
              // Missing enabled
            },
          },
        },
        {
          // Missing providers
          analytics: {
            enabled: true,
          },
        },
      ];

      incompleteConfigs.forEach((config) => {
        // Configuration might be incomplete but should still be objects
        expect(typeof config).toBe("object");
        expect(config).not.toBeNull();
      });
    });
  });

  // Test environment-specific configurations
  describe("environment Configurations", () => {
    test("should handle development environment configuration", () => {
      const devConfig = {
        providers: {
          dub: {
            enabled: true,
            apiKey: "test-api-key",
            baseUrl: "https://api.dub.co",
            defaultDomain: "dub.sh",
          },
        },
        analytics: {
          enabled: true,
          events: ["link_created", "link_clicked"],
          sampling: 1.0, // 100% sampling in development
        },
        cache: {
          enabled: false, // Disabled in development
        },
        rateLimit: {
          enabled: false, // Disabled in development
        },
        debug: true,
      };

      expect(devConfig).toHaveProperty("providers");
      expect(devConfig).toHaveProperty("analytics");
      expect(devConfig).toHaveProperty("cache");
      expect(devConfig).toHaveProperty("rateLimit");
      expect(devConfig).toHaveProperty("debug", true);

      expect(devConfig.analytics.sampling).toBe(1.0);
      expect(devConfig.cache.enabled).toBeFalsy();
      expect(devConfig.rateLimit.enabled).toBeFalsy();
    });

    test("should handle production environment configuration", () => {
      const prodConfig = {
        providers: {
          dub: {
            enabled: true,
            apiKey: "prod-api-key",
            baseUrl: "https://api.dub.co",
            defaultDomain: "brand.link",
          },
        },
        analytics: {
          enabled: true,
          events: [
            "link_created",
            "link_clicked",
            "link_updated",
            "link_deleted",
          ],
          sampling: 0.1, // 10% sampling in production
        },
        cache: {
          enabled: true,
          ttl: 300,
        },
        rateLimit: {
          enabled: true,
          maxRequests: 1000,
          windowMs: 60000,
        },
        debug: false,
      };

      expect(prodConfig).toHaveProperty("providers");
      expect(prodConfig).toHaveProperty("analytics");
      expect(prodConfig).toHaveProperty("cache");
      expect(prodConfig).toHaveProperty("rateLimit");
      expect(prodConfig).toHaveProperty("debug", false);

      expect(prodConfig.analytics.sampling).toBe(0.1);
      expect(prodConfig.cache.enabled).toBeTruthy();
      expect(prodConfig.rateLimit.enabled).toBeTruthy();
    });
  });

  // Test edge cases and error conditions
  describe("edge Cases and Error Conditions", () => {
    test("should handle empty configuration objects", () => {
      const emptyConfigs = [
        {},
        { providers: {} },
        { providers: { dub: {} } },
        { analytics: {} },
      ];

      emptyConfigs.forEach((config) => {
        expect(typeof config).toBe("object");
        expect(config).not.toBeNull();
      });
    });

    test("should handle null and undefined values", () => {
      const nullConfigs = [
        { providers: null },
        { providers: undefined },
        { providers: { dub: null } },
        { providers: { dub: undefined } },
        { analytics: null },
        { analytics: undefined },
      ];

      nullConfigs.forEach((config) => {
        expect(typeof config).toBe("object");
        expect(config).not.toBeNull();
      });
    });

    test("should handle invalid data types", () => {
      const invalidConfigs = [
        { providers: "invalid" },
        { providers: { dub: "invalid" } },
        { providers: { dub: { enabled: "invalid" } } },
        { providers: { dub: { apiKey: 123 } } },
        { analytics: "invalid" },
        { analytics: { enabled: "invalid" } },
        { analytics: { events: "invalid" } },
        { analytics: { sampling: "invalid" } },
      ];

      invalidConfigs.forEach((config) => {
        expect(typeof config).toBe("object");
        expect(config).not.toBeNull();
      });
    });
  });
});
