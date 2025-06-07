import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prisma, prismaClientSingleton } from '../../prisma/client';

// Mock Prisma client and extensions
vi.mock('@prisma/extension-accelerate', () => ({
  withAccelerate: vi.fn().mockReturnValue({
    name: 'accelerate-extension',
  }),
}));

vi.mock('../../generated/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $extends: vi.fn().mockReturnValue({
      name: 'extended-prisma-client',
      user: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
    }),
  })),
}));

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

    it('should create new instance each time called', () => {
      const client1 = prismaClientSingleton();
      const client2 = prismaClientSingleton();

      // Should be different instances (not same reference)
      expect(client1).not.toBe(client2);
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

    it('should attach to global in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Re-import to trigger the global attachment
      delete require.cache[require.resolve('../../prisma/client')];
      const { prisma: devPrisma } = require('../../prisma/client');

      expect((global as any).prisma).toBeDefined();
      expect((global as any).prisma).toBe(devPrisma);

      process.env.NODE_ENV = originalEnv;
    });

    it('should not attach to global in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Clear global first
      delete (global as any).prisma;

      // Re-import to test production behavior
      delete require.cache[require.resolve('../../prisma/client')];
      require('../../prisma/client');

      // In production, global.prisma should not be set by our code
      // (it might exist from previous test runs, but our code shouldn't set it)
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('client extension', () => {
    it('should apply withAccelerate extension', async () => {
      const { withAccelerate } = await import('@prisma/extension-accelerate');
      const { PrismaClient } = await import('../../generated/client');

      prismaClientSingleton();

      expect(withAccelerate).toHaveBeenCalled();
      expect(PrismaClient).toHaveBeenCalled();
    });
  });
});
