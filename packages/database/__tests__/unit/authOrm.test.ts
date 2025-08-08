import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Prisma client
const mockPrisma = {
  session: {
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
  account: {
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
  verification: {
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
  organization: {
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
  member: {
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
  team: {
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
  teamMember: {
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
  invitation: {
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
  apiKey: {
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
  twoFactor: {
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
  backupCode: {
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
  passkey: {
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
  auditLog: {
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

describe('Auth ORM - New Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Session tests
  describe('Session createMany and OrThrow functions', () => {
    it('should forward createManySessionsOrm to prisma.session.createMany', async () => {
      const { createManySessionsOrm } = await import('#/src/prisma/src/orm/auth/authOrm');

      const args = { data: [{ userId: 'user-1', token: 'token-1' }] };
      const expectedResult = { count: 1 };
      mockPrisma.session.createMany.mockResolvedValue(expectedResult);

      const result = await createManySessionsOrm(args);

      expect(mockPrisma.session.createMany).toHaveBeenCalledWith(args);
      expect(result).toStrictEqual(expectedResult);
    });

    it('should forward findUniqueSessionOrmOrThrow to prisma.session.findUniqueOrThrow', async () => {
      const { findUniqueSessionOrmOrThrow } = await import('#/src/prisma/src/orm/auth/authOrm');

      const args = { where: { id: 'session-1' } };
      const expectedSession = { id: 'session-1', userId: 'user-1' };
      mockPrisma.session.findUniqueOrThrow.mockResolvedValue(expectedSession);

      const result = await findUniqueSessionOrmOrThrow(args);

      expect(mockPrisma.session.findUniqueOrThrow).toHaveBeenCalledWith(args);
      expect(result).toStrictEqual(expectedSession);
    });

    it('should forward findFirstSessionOrmOrThrow to prisma.session.findFirstOrThrow', async () => {
      const { findFirstSessionOrmOrThrow } = await import('#/src/prisma/src/orm/auth/authOrm');

      const args = { where: { userId: 'user-1' } };
      const expectedSession = { id: 'session-1', userId: 'user-1' };
      mockPrisma.session.findFirstOrThrow.mockResolvedValue(expectedSession);

      const result = await findFirstSessionOrmOrThrow(args);

      expect(mockPrisma.session.findFirstOrThrow).toHaveBeenCalledWith(args);
      expect(result).toStrictEqual(expectedSession);
    });
  });

  // Account tests
  describe('Account createMany and OrThrow functions', () => {
    it('should forward createManyAccountsOrm to prisma.account.createMany', async () => {
      const { createManyAccountsOrm } = await import('#/src/prisma/src/orm/auth/authOrm');

      const args = { data: [{ userId: 'user-1', provider: 'google' }] };
      const expectedResult = { count: 1 };
      mockPrisma.account.createMany.mockResolvedValue(expectedResult);

      const result = await createManyAccountsOrm(args);

      expect(mockPrisma.account.createMany).toHaveBeenCalledWith(args);
      expect(result).toStrictEqual(expectedResult);
    });

    it('should forward findUniqueAccountOrmOrThrow to prisma.account.findUniqueOrThrow', async () => {
      const { findUniqueAccountOrmOrThrow } = await import('#/src/prisma/src/orm/auth/authOrm');

      const args = { where: { id: 'account-1' } };
      const expectedAccount = { id: 'account-1', userId: 'user-1' };
      mockPrisma.account.findUniqueOrThrow.mockResolvedValue(expectedAccount);

      const result = await findUniqueAccountOrmOrThrow(args);

      expect(mockPrisma.account.findUniqueOrThrow).toHaveBeenCalledWith(args);
      expect(result).toStrictEqual(expectedAccount);
    });

    it('should forward findFirstAccountOrmOrThrow to prisma.account.findFirstOrThrow', async () => {
      const { findFirstAccountOrmOrThrow } = await import('#/src/prisma/src/orm/auth/authOrm');

      const args = { where: { userId: 'user-1' } };
      const expectedAccount = { id: 'account-1', userId: 'user-1' };
      mockPrisma.account.findFirstOrThrow.mockResolvedValue(expectedAccount);

      const result = await findFirstAccountOrmOrThrow(args);

      expect(mockPrisma.account.findFirstOrThrow).toHaveBeenCalledWith(args);
      expect(result).toStrictEqual(expectedAccount);
    });
  });

  // Organization tests
  describe('Organization createMany and OrThrow functions', () => {
    it('should forward createManyOrganizationsOrm to prisma.organization.createMany', async () => {
      const { createManyOrganizationsOrm } = await import('#/src/prisma/src/orm/auth/authOrm');

      const args = { data: [{ name: 'Test Org', slug: 'test-org' }] };
      const expectedResult = { count: 1 };
      mockPrisma.organization.createMany.mockResolvedValue(expectedResult);

      const result = await createManyOrganizationsOrm(args);

      expect(mockPrisma.organization.createMany).toHaveBeenCalledWith(args);
      expect(result).toStrictEqual(expectedResult);
    });

    it('should forward findUniqueOrganizationOrmOrThrow to prisma.organization.findUniqueOrThrow', async () => {
      const { findUniqueOrganizationOrmOrThrow } = await import(
        '#/src/prisma/src/orm/auth/authOrm'
      );

      const args = { where: { id: 'org-1' } };
      const expectedOrg = { id: 'org-1', name: 'Test Org' };
      mockPrisma.organization.findUniqueOrThrow.mockResolvedValue(expectedOrg);

      const result = await findUniqueOrganizationOrmOrThrow(args);

      expect(mockPrisma.organization.findUniqueOrThrow).toHaveBeenCalledWith(args);
      expect(result).toStrictEqual(expectedOrg);
    });

    it('should forward findFirstOrganizationOrmOrThrow to prisma.organization.findFirstOrThrow', async () => {
      const { findFirstOrganizationOrmOrThrow } = await import('#/src/prisma/src/orm/auth/authOrm');

      const args = { where: { name: 'Test Org' } };
      const expectedOrg = { id: 'org-1', name: 'Test Org' };
      mockPrisma.organization.findFirstOrThrow.mockResolvedValue(expectedOrg);

      const result = await findFirstOrganizationOrmOrThrow(args);

      expect(mockPrisma.organization.findFirstOrThrow).toHaveBeenCalledWith(args);
      expect(result).toStrictEqual(expectedOrg);
    });
  });

  // Sample tests for other models - focusing on createMany and OrThrow patterns
  describe('Other models - sample tests', () => {
    it('should handle ApiKey createMany operation', async () => {
      const { createManyApiKeysOrm } = await import('#/src/prisma/src/orm/auth/authOrm');

      const args = { data: [{ name: 'Test API Key', userId: 'user-1' }] };
      const expectedResult = { count: 1 };
      mockPrisma.apiKey.createMany.mockResolvedValue(expectedResult);

      const result = await createManyApiKeysOrm(args);

      expect(mockPrisma.apiKey.createMany).toHaveBeenCalledWith(args);
      expect(result).toStrictEqual(expectedResult);
    });

    it('should handle TwoFactor findUniqueOrThrow operation', async () => {
      const { findUniqueTwoFactorOrmOrThrow } = await import('#/src/prisma/src/orm/auth/authOrm');

      const args = { where: { id: 'twofactor-1' } };
      const expectedTwoFactor = { id: 'twofactor-1', userId: 'user-1' };
      mockPrisma.twoFactor.findUniqueOrThrow.mockResolvedValue(expectedTwoFactor);

      const result = await findUniqueTwoFactorOrmOrThrow(args);

      expect(mockPrisma.twoFactor.findUniqueOrThrow).toHaveBeenCalledWith(args);
      expect(result).toStrictEqual(expectedTwoFactor);
    });

    it('should handle AuditLog findFirstOrThrow operation', async () => {
      const { findFirstAuditLogOrmOrThrow } = await import('#/src/prisma/src/orm/auth/authOrm');

      const args = { where: { userId: 'user-1' } };
      const expectedAuditLog = { id: 'audit-1', userId: 'user-1', action: 'LOGIN' };
      mockPrisma.auditLog.findFirstOrThrow.mockResolvedValue(expectedAuditLog);

      const result = await findFirstAuditLogOrmOrThrow(args);

      expect(mockPrisma.auditLog.findFirstOrThrow).toHaveBeenCalledWith(args);
      expect(result).toStrictEqual(expectedAuditLog);
    });
  });
});
