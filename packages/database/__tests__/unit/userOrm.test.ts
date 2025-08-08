import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Prisma client
const mockPrisma = {
  user: {
    create: vi.fn(),
    createMany: vi.fn(),
    findFirst: vi.fn(),
    findFirstOrThrow: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    aggregate: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
};

vi.mock('#/prisma/clients/standard', () => ({
  prisma: mockPrisma,
}));

describe('User ORM - New Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createManyUsersOrm', () => {
    it('should forward arguments to prisma.user.createMany and return result', async () => {
      const { createManyUsersOrm } = await import('#/src/prisma/src/orm/auth/userOrm');

      const args = {
        data: [
          { email: 'user1@example.com', name: 'User 1' },
          { email: 'user2@example.com', name: 'User 2' },
        ],
      };

      const expectedResult = { count: 2 };
      mockPrisma.user.createMany.mockResolvedValue(expectedResult);

      const result = await createManyUsersOrm(args);

      expect(mockPrisma.user.createMany).toHaveBeenCalledWith(args);
      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe('findFirstUserOrmOrThrow', () => {
    it('should forward arguments to prisma.user.findFirstOrThrow and return result', async () => {
      const { findFirstUserOrmOrThrow } = await import('#/src/prisma/src/orm/auth/userOrm');

      const args = {
        where: { email: 'test@example.com' },
        include: { accounts: true },
      };

      const expectedUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        accounts: [],
      };
      mockPrisma.user.findFirstOrThrow.mockResolvedValue(expectedUser);

      const result = await findFirstUserOrmOrThrow(args);

      expect(mockPrisma.user.findFirstOrThrow).toHaveBeenCalledWith(args);
      expect(result).toStrictEqual(expectedUser);
    });
  });
});
