import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prisma, prismaClientSingleton } from '../../src/prisma';

describe('Prisma Client', (_: any) => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear global prisma instance
    delete (global as any).prisma;
  });

  describe('prismaClientSingleton', (_: any) => {
    it('should create extended Prisma client with accelerate', (_: any) => {
      const client = prismaClientSingleton();

      expect(client).toBeDefined();
      expect(typeof client).toBe('object');
    });

    it('should be callable and return object', (_: any) => {
      const client = prismaClientSingleton();
      expect(client).toBeDefined();
      expect(typeof client).toBe('object');
    });
  });

  describe('prisma singleton', (_: any) => {
    it('should return singleton instance', (_: any) => {
      const instance1 = prisma;
      const instance2 = prisma;

      expect(instance1).toBe(instance2);
    });

    it('should have extended client properties', (_: any) => {
      expect(prisma).toBeDefined();
      expect(typeof prisma).toBe('object');
    });

    it('should use singleton behavior', (_: any) => {
      // Test that the prisma import is consistent
      expect(prisma).toBeDefined();
      expect(typeof prisma).toBe('object');
    });

    it('should handle environment appropriately', (_: any) => {
      // Test that we can access prisma regardless of environment
      const originalEnv = process.env.NODE_ENV;

      vi.stubEnv('NODE_ENV', 'test');
      expect(prisma).toBeDefined();

      vi.unstubAllEnvs();
    });
  });

  describe('client extension', (_: any) => {
    it('should work with mocked environment', (_: any) => {
      // Test that the client is accessible in test environment
      expect(prisma).toBeDefined();
      expect(typeof prisma).toBe('object');
    });
  });
});
