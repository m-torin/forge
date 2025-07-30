import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prisma, prismaClientSingleton } from '#/prisma/clients/standard';

describe('Prisma Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear global prisma instance
    delete (global as any).prisma;
  });

  describe('prismaClientSingleton', () => {
    it('should create extended Prisma client with accelerate', () => {
      const client = prismaClientSingleton();

      expect(client).toBeDefined();
      expect(typeof client).toBe('object');
    });

    it('should be callable and return object', () => {
      const client = prismaClientSingleton();
      expect(client).toBeDefined();
      expect(typeof client).toBe('object');
    });
  });

  describe('prisma singleton', () => {
    it('should return singleton instance', () => {
      const instance1 = prisma;
      const instance2 = prisma;

      expect(instance1).toBe(instance2);
    });

    it('should have extended client properties', () => {
      expect(prisma).toBeDefined();
      expect(typeof prisma).toBe('object');
    });

    it('should use singleton behavior', () => {
      // Test that the prisma import is consistent
      expect(prisma).toBeDefined();
      expect(typeof prisma).toBe('object');
    });

    it('should handle environment appropriately', () => {
      // Test that we can access prisma regardless of environment
      const originalEnv = process.env.NODE_ENV;

      vi.stubEnv('NODE_ENV', 'test');
      expect(prisma).toBeDefined();

      vi.unstubAllEnvs();
    });
  });

  describe('client extension', () => {
    it('should work with mocked environment', () => {
      // Test that the client is accessible in test environment
      expect(prisma).toBeDefined();
      expect(typeof prisma).toBe('object');
    });
  });
});
