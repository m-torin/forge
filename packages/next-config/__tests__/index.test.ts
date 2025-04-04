import { describe, expect, it, vi, beforeEach } from 'vitest';
import { config, withAnalyzer } from '../index';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';
import type { NextConfig } from 'next';

// Import the mocked modules
vi.mock('@next/bundle-analyzer');
vi.mock('@prisma/nextjs-monorepo-workaround-plugin');

describe('Next Config', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock withBundleAnalyzer to return a function that returns the config
    (withBundleAnalyzer as any).mockImplementation(() => (config) => config);

    // Mock PrismaPlugin constructor
    (PrismaPlugin as any).mockImplementation(function () {
      this.apply = vi.fn();
    });
  });

  describe('config', () => {
    it('exports a valid NextConfig object', () => {
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
      expect(config).toHaveProperty('images');
      expect(config).toHaveProperty('rewrites');
      expect(config).toHaveProperty('webpack');
      expect(config).toHaveProperty('skipTrailingSlashRedirect', true);
    });

    it('configures images with the correct formats and remote patterns', () => {
      expect(config.images).toEqual({
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'img.clerk.com',
          },
        ],
      });
    });

    it('configures rewrites for PostHog', async () => {
      const rewrites = await config.rewrites();

      expect(Array.isArray(rewrites)).toBe(true);
      expect(rewrites).toHaveLength(3);

      // Check static assets rewrite
      expect(rewrites[0]).toEqual({
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      });

      // Check main ingest rewrite
      expect(rewrites[1]).toEqual({
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      });

      // Check decide endpoint rewrite
      expect(rewrites[2]).toEqual({
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide',
      });
    });

    describe('webpack configuration', () => {
      it.skip('adds PrismaPlugin when running on the server', () => {
        const mockConfig = {
          plugins: [],
        };
        const options = { isServer: true };

        const result = config.webpack(mockConfig, options);

        expect(result.plugins).toContain(expect.any(PrismaPlugin));
        expect(PrismaPlugin).toHaveBeenCalled();
      });

      it('does not add PrismaPlugin when not running on the server', () => {
        const mockConfig = {
          plugins: [],
        };
        const options = { isServer: false };

        const result = config.webpack(mockConfig, options);

        expect(result.plugins).toEqual([]);
        expect(PrismaPlugin).not.toHaveBeenCalled();
      });

      it('adds ignoreWarnings for OpenTelemetry', () => {
        const mockConfig = {};
        const options = { isServer: false };

        const result = config.webpack(mockConfig, options);

        expect(result.ignoreWarnings).toEqual([{ module: expect.any(RegExp) }]);

        // Test that the regex matches OpenTelemetry
        const otelRegex = result.ignoreWarnings[0].module;
        expect(otelRegex.test('@opentelemetry/instrumentation')).toBe(true);
        expect(otelRegex.test('some-other-module')).toBe(false);
      });

      it('preserves existing plugins when adding PrismaPlugin', () => {
        const existingPlugin = { apply: vi.fn() };
        const mockConfig = {
          plugins: [existingPlugin],
        };
        const options = { isServer: true };

        const result = config.webpack(mockConfig, options);

        expect(result.plugins).toHaveLength(2);
        expect(result.plugins[0]).toBe(existingPlugin);
        expect(result.plugins[1]).toBeInstanceOf(PrismaPlugin);
      });
    });
  });

  describe('withAnalyzer', () => {
    it.skip('calls withBundleAnalyzer with the provided config', () => {
      const sourceConfig: NextConfig = {
        reactStrictMode: true,
      };

      withAnalyzer(sourceConfig);

      expect(withBundleAnalyzer).toHaveBeenCalled();
      expect(withBundleAnalyzer())(sourceConfig);
    });

    it('returns the result of withBundleAnalyzer', () => {
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
