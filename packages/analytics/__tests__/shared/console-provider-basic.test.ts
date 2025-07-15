/**
 * Basic tests for console provider that don't require complex mocking
 */

import { describe, expect, it } from 'vitest';

describe('Console Provider Imports', () => {
  describe('client provider', () => {
    it('should import console client provider without errors', async () => {
      const { ConsoleProvider } = await import('@/providers/console/client');

      expect(ConsoleProvider).toBeDefined();
      expect(typeof ConsoleProvider).toBe('function');
    });

    it('should create console provider instance', async () => {
      const { ConsoleProvider } = await import('@/providers/console/client');

      const config = {};
      const provider = new ConsoleProvider(config);

      expect(provider).toBeDefined();
      expect(typeof provider.initialize).toBe('function');
      expect(typeof provider.track).toBe('function');
      expect(typeof provider.identify).toBe('function');
      expect(typeof provider.page).toBe('function');
      expect(typeof provider.group).toBe('function');
      expect(typeof provider.alias).toBe('function');
    });
  });

  describe('server provider', () => {
    it('should import console server provider without errors', async () => {
      const { ConsoleProvider } = await import('@/providers/console/server');

      expect(ConsoleProvider).toBeDefined();
      expect(typeof ConsoleProvider).toBe('function');
    });

    it('should create server console provider instance', async () => {
      const { ConsoleProvider } = await import('@/providers/console/server');

      const config = {};
      const provider = new ConsoleProvider(config);

      expect(provider).toBeDefined();
      expect(typeof provider.initialize).toBe('function');
      expect(typeof provider.track).toBe('function');
      expect(typeof provider.identify).toBe('function');
      expect(typeof provider.page).toBe('function');
      expect(typeof provider.group).toBe('function');
      expect(typeof provider.alias).toBe('function');
    });
  });

  describe('provider index', () => {
    it('should export provider from index without errors', async () => {
      expect(async () => {
        await import('@/providers/console');
      }).not.toThrow();
    });
  });

  describe('console types', () => {
    it('should import console types without errors', async () => {
      expect(async () => {
        await import('@/providers/console/types');
      }).not.toThrow();
    });
  });
});
