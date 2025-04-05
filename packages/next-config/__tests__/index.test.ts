import withBundleAnalyzer from "@next/bundle-analyzer";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { config, withAnalyzer } from "../index";

import type { NextConfig } from "next";

// Import the mocked modules
vi.mock("@next/bundle-analyzer");
vi.mock("@prisma/nextjs-monorepo-workaround-plugin");

describe("Next Config", function () {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock withBundleAnalyzer to return a function that returns the config
    (withBundleAnalyzer as any).mockImplementation(
      () => (config: any) => config,
    );

    // Mock PrismaPlugin constructor
    (PrismaPlugin as any).mockImplementation(function (this: any) {
      this.apply = vi.fn();
    });
  });

  describe("config", () => {
    it("exports a valid NextConfig object", () => {
      expect(config).toBeDefined();
      expect(typeof config).toBe("object");
      expect(config).toHaveProperty("images");
      expect(config).toHaveProperty("rewrites");
      expect(config).toHaveProperty("webpack");
      expect(config).toHaveProperty("skipTrailingSlashRedirect", true);
    });

    it("configures images with the correct formats and remote patterns", () => {
      expect(config.images).toEqual({
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
          {
            hostname: "img.clerk.com",
            protocol: "https",
          },
        ],
      });
    });

    it("configures rewrites for PostHog", async () => {
      if (config.rewrites) {
        const rewrites = await config.rewrites();

        if (Array.isArray(rewrites)) {
          expect(rewrites).toHaveLength(3);

          // Check static assets rewrite
          expect(rewrites[0]).toEqual({
            destination: "https://us-assets.i.posthog.com/static/:path*",
            source: "/ingest/static/:path*",
          });

          // Check main ingest rewrite
          expect(rewrites[1]).toEqual({
            destination: "https://us.i.posthog.com/:path*",
            source: "/ingest/:path*",
          });

          // Check decide endpoint rewrite
          expect(rewrites[2]).toEqual({
            destination: "https://us.i.posthog.com/decide",
            source: "/ingest/decide",
          });
        }
      }
    });

    describe("webpack configuration", () => {
      it("adds PrismaPlugin when running on the server", () => {
        if (config.webpack) {
          const mockConfig = {
            plugins: [],
          };
          const options = {
            buildId: "",
            config: {
              allowedDevOrigins: [],
              eslint: {},
              exportPathMap: {},
              i18n: null,
            },
            defaultLoaders: {},
            dev: false,
            dir: "",
            isServer: true,
            totalPages: 0,
            webpack: {},
          };

          // Use type assertion to avoid type errors
          const result = config.webpack(mockConfig, options as any);

          // Check if any plugin in the array is an instance of PrismaPlugin
          expect(
            result.plugins.some((plugin) => plugin instanceof PrismaPlugin),
          ).toBe(true);
          expect(PrismaPlugin).toHaveBeenCalled();
        }
      });

      it("does not add PrismaPlugin when not running on the server", () => {
        if (config.webpack) {
          const mockConfig = {
            plugins: [],
          };
          const options = {
            buildId: "",
            config: {
              allowedDevOrigins: [],
              eslint: {},
              exportPathMap: {},
              i18n: null,
            },
            defaultLoaders: {},
            dev: false,
            dir: "",
            isServer: false,
            totalPages: 0,
            webpack: {},
          };

          // Use type assertion to avoid type errors
          const result = config.webpack(mockConfig, options as any);

          expect(result.plugins).toEqual([]);
          expect(PrismaPlugin).not.toHaveBeenCalled();
        }
      });

      it("adds ignoreWarnings for OpenTelemetry", () => {
        if (config.webpack) {
          const mockConfig = {};
          const options = {
            buildId: "",
            config: {
              allowedDevOrigins: [],
              eslint: {},
              exportPathMap: {},
              i18n: null,
            },
            defaultLoaders: {},
            dev: false,
            dir: "",
            isServer: false,
            totalPages: 0,
            webpack: {},
          };

          // Use type assertion to avoid type errors
          const result = config.webpack(mockConfig, options as any);

          expect(result.ignoreWarnings).toEqual([
            { module: expect.any(RegExp) },
          ]);

          // Test that the regex matches OpenTelemetry
          const otelRegex = result.ignoreWarnings[0].module;
          expect(otelRegex.test("@opentelemetry/instrumentation")).toBe(true);
          expect(otelRegex.test("some-other-module")).toBe(false);
        }
      });

      it("preserves existing plugins when adding PrismaPlugin", () => {
        if (config.webpack) {
          const existingPlugin = { apply: vi.fn() };
          const mockConfig = {
            plugins: [existingPlugin],
          };
          const options = {
            buildId: "",
            config: {
              allowedDevOrigins: [],
              eslint: {},
              exportPathMap: {},
              i18n: null,
            },
            defaultLoaders: {},
            dev: false,
            dir: "",
            isServer: true,
            totalPages: 0,
            webpack: {},
          };

          // Use type assertion to avoid type errors
          const result = config.webpack(mockConfig, options as any);

          expect(result.plugins).toHaveLength(2);
          expect(result.plugins[0]).toBe(existingPlugin);
          expect(result.plugins[1]).toBeInstanceOf(PrismaPlugin);
        }
      });
    });
  });

  describe("withAnalyzer", () => {
    it("calls withBundleAnalyzer with the provided config", () => {
      const sourceConfig: NextConfig = {
        reactStrictMode: true,
      };

      withAnalyzer(sourceConfig);

      expect(withBundleAnalyzer).toHaveBeenCalled();
    });

    it("returns the result of withBundleAnalyzer", () => {
      const sourceConfig: NextConfig = {
        reactStrictMode: true,
      };
      const expectedResult = {
        ...sourceConfig,
        // Additional properties that would be added by withBundleAnalyzer
      };

      (withBundleAnalyzer as any).mockImplementation(
        () => () => expectedResult,
      );

      const result = withAnalyzer(sourceConfig);

      expect(result).toBe(expectedResult);
    });
  });
});
