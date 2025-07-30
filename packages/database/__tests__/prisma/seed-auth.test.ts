import { seedAuth } from '#/prisma/src/seed/seed-auth';
import { resetPrismaTestMocks, setupPrismaTestMocks } from '#/tests/setup';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('seedAuth', () => {
  let mockPrismaClient: any;
  let mockPrismaOrm: any;

  beforeEach(() => {
    const mocks = setupPrismaTestMocks();
    mockPrismaClient = mocks.mockPrismaClient;
    mockPrismaOrm = mocks.mockPrismaOrm;
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Default: all findUnique/findFirst return null, findMany returns []
    Object.keys(mockPrismaClient).forEach(model => {
      if (mockPrismaClient[model]?.findUnique) {
        mockPrismaClient[model].findUnique.mockResolvedValue(null);
        mockPrismaClient[model].findFirst.mockResolvedValue(null);
        mockPrismaClient[model].findMany.mockResolvedValue([]);
        mockPrismaClient[model].create.mockResolvedValue({ id: `${model}-id` });
        mockPrismaClient[model].update.mockResolvedValue({ id: `${model}-id` });
        mockPrismaClient[model].createMany?.mockResolvedValue({});
      }
    });
  });

  afterEach(() => {
    resetPrismaTestMocks(mockPrismaClient, mockPrismaOrm);
    vi.restoreAllMocks();
  });

  it('creates users, organizations, and API keys if missing', async () => {
    await seedAuth();
    expect(mockPrismaClient.user.create).toHaveBeenCalled();
    expect(mockPrismaClient.organization.create).toHaveBeenCalled();
    expect(mockPrismaClient.apiKey.create).toHaveBeenCalled();
    expect(mockPrismaClient.member.create).toHaveBeenCalled();
    expect(mockPrismaClient.account.create).toHaveBeenCalled();
  });

  it('skips existing users and organizations', async () => {
    mockPrismaClient.user.findUnique.mockResolvedValue({ id: 'existing-user' });
    mockPrismaClient.organization.findFirst.mockResolvedValue({ id: 'existing-org' });
    await seedAuth();
    expect(mockPrismaClient.user.create).not.toHaveBeenCalled();
    expect(mockPrismaClient.organization.create).not.toHaveBeenCalled();
  });

  it('handles errors gracefully', async () => {
    mockPrismaClient.user.create.mockRejectedValue(new Error('User create error'));
    await expect(seedAuth()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  // Enhanced test coverage
  it('creates user with correct data structure', async () => {
    await seedAuth();

    const userCreateCall = mockPrismaClient.user.create.mock.calls[0][0];
    expect(userCreateCall).toHaveProperty('data');
    expect(userCreateCall.data).toHaveProperty('name');
    expect(userCreateCall.data).toHaveProperty('email');
    expect(userCreateCall.data).toHaveProperty('emailVerified');
    expect(userCreateCall.data).toHaveProperty('image');
  });

  it('creates organization with correct data structure', async () => {
    await seedAuth();

    const orgCreateCall = mockPrismaClient.organization.create.mock.calls[0][0];
    expect(orgCreateCall).toHaveProperty('data');
    expect(orgCreateCall.data).toHaveProperty('name');
    expect(orgCreateCall.data).toHaveProperty('slug');
    expect(orgCreateCall.data).toHaveProperty('image');
  });

  it('creates member relationship between user and organization', async () => {
    await seedAuth();

    const memberCreateCall = mockPrismaClient.member.create.mock.calls[0][0];
    expect(memberCreateCall).toHaveProperty('data');
    expect(memberCreateCall.data).toHaveProperty('role');
    expect(memberCreateCall.data).toHaveProperty('userId');
    expect(memberCreateCall.data).toHaveProperty('organizationId');
  });

  it('creates API key with correct permissions', async () => {
    await seedAuth();

    const apiKeyCreateCall = mockPrismaClient.apiKey.create.mock.calls[0][0];
    expect(apiKeyCreateCall).toHaveProperty('data');
    expect(apiKeyCreateCall.data).toHaveProperty('name');
    expect(apiKeyCreateCall.data).toHaveProperty('key');
    expect(apiKeyCreateCall.data).toHaveProperty('permissions');
  });

  it('creates account with correct provider data', async () => {
    await seedAuth();

    const accountCreateCall = mockPrismaClient.account.create.mock.calls[0][0];
    expect(accountCreateCall).toHaveProperty('data');
    expect(accountCreateCall.data).toHaveProperty('type');
    expect(accountCreateCall.data).toHaveProperty('provider');
    expect(accountCreateCall.data).toHaveProperty('providerAccountId');
    expect(accountCreateCall.data).toHaveProperty('userId');
  });

  it('handles partial existing data correctly', async () => {
    // User exists but organization doesn't
    mockPrismaClient.user.findUnique.mockResolvedValue({ id: 'existing-user' });
    mockPrismaClient.organization.findFirst.mockResolvedValue(null);

    await seedAuth();

    expect(mockPrismaClient.user.create).not.toHaveBeenCalled();
    expect(mockPrismaClient.organization.create).toHaveBeenCalled();
    expect(mockPrismaClient.member.create).toHaveBeenCalled();
  });

  it("handles organization exists but user doesn't", async () => {
    // Organization exists but user doesn't
    mockPrismaClient.user.findUnique.mockResolvedValue(null);
    mockPrismaClient.organization.findFirst.mockResolvedValue({ id: 'existing-org' });

    await seedAuth();

    expect(mockPrismaClient.user.create).toHaveBeenCalled();
    expect(mockPrismaClient.organization.create).not.toHaveBeenCalled();
    expect(mockPrismaClient.member.create).toHaveBeenCalled();
  });

  it('handles database connection errors', async () => {
    mockPrismaClient.user.findUnique.mockRejectedValue(new Error('Connection failed'));

    await expect(seedAuth()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('handles individual entity creation errors', async () => {
    // Test each entity creation error
    const entities = ['user', 'organization', 'apiKey', 'member', 'account'];

    for (const entity of entities) {
      mockPrismaClient[entity].create.mockRejectedValue(new Error(`${entity} create failed`));

      await expect(seedAuth()).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalled();

      // Reset for next iteration
      mockPrismaClient[entity].create.mockResolvedValue({ id: `${entity}-id` });
      vi.clearAllMocks();
    }
  });

  it('validates user email format', async () => {
    await seedAuth();

    const userCreateCall = mockPrismaClient.user.create.mock.calls[0][0];
    const email = userCreateCall.data.email;

    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('ensures unique user and organization IDs', async () => {
    await seedAuth();

    const userCreateCall = mockPrismaClient.user.create.mock.calls[0][0];
    const orgCreateCall = mockPrismaClient.organization.create.mock.calls[0][0];

    expect(userCreateCall.data.id).toBeDefined();
    expect(orgCreateCall.data.id).toBeDefined();
    expect(userCreateCall.data.id).not.toBe(orgCreateCall.data.id);
  });

  it('creates proper relationships between entities', async () => {
    await seedAuth();

    const userCreateCall = mockPrismaClient.user.create.mock.calls[0][0];
    const orgCreateCall = mockPrismaClient.organization.create.mock.calls[0][0];
    const memberCreateCall = mockPrismaClient.member.create.mock.calls[0][0];
    const accountCreateCall = mockPrismaClient.account.create.mock.calls[0][0];

    // Member should reference both user and organization
    expect(memberCreateCall.data.userId).toBe(userCreateCall.data.id);
    expect(memberCreateCall.data.organizationId).toBe(orgCreateCall.data.id);

    // Account should reference user
    expect(accountCreateCall.data.userId).toBe(userCreateCall.data.id);
  });

  it('handles concurrent execution safely', async () => {
    // Simulate concurrent calls
    const promises = Array.from({ length: 3 }, () => seedAuth());
    await Promise.all(promises);

    // Each should complete successfully
    expect(mockPrismaClient.user.create).toHaveBeenCalledTimes(3);
    expect(mockPrismaClient.organization.create).toHaveBeenCalledTimes(3);
  });

  it('logs progress during seeding', async () => {
    await seedAuth();
    expect(console.log).toHaveBeenCalled();
  });

  it('handles missing required fields gracefully', async () => {
    // Mock findUnique to return incomplete data
    mockPrismaClient.user.findUnique.mockResolvedValue({ id: 'incomplete-user' });
    mockPrismaClient.organization.findFirst.mockResolvedValue({ id: 'incomplete-org' });

    await seedAuth();

    // Should still create missing entities
    expect(mockPrismaClient.user.create).toHaveBeenCalled();
    expect(mockPrismaClient.organization.create).toHaveBeenCalled();
  });

  it('validates API key format', async () => {
    await seedAuth();

    const apiKeyCreateCall = mockPrismaClient.apiKey.create.mock.calls[0][0];
    const key = apiKeyCreateCall.data.key;

    // API key should be a valid format (typically base64 or hex)
    expect(key).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(key.length).toBeGreaterThan(20);
  });

  it('handles different member roles', async () => {
    await seedAuth();

    const memberCreateCall = mockPrismaClient.member.create.mock.calls[0][0];
    const role = memberCreateCall.data.role;

    // Should be a valid role
    expect(['OWNER', 'ADMIN', 'MEMBER']).toContain(role);
  });

  it('creates proper account provider data', async () => {
    await seedAuth();

    const accountCreateCall = mockPrismaClient.account.create.mock.calls[0][0];
    const account = accountCreateCall.data;

    expect(account.type).toBe('oauth');
    expect(account.provider).toBe('google');
    expect(account.providerAccountId).toBeDefined();
  });

  it('handles timeout scenarios', async () => {
    mockPrismaClient.user.findUnique.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(null), 100)),
    );

    await seedAuth();
    expect(mockPrismaClient.user.create).toHaveBeenCalled();
  });

  it('ensures data consistency across entities', async () => {
    await seedAuth();

    // All created entities should have consistent timestamps
    const userCreateCall = mockPrismaClient.user.create.mock.calls[0][0];
    const orgCreateCall = mockPrismaClient.organization.create.mock.calls[0][0];

    if (userCreateCall.data.createdAt && orgCreateCall.data.createdAt) {
      const userTime = new Date(userCreateCall.data.createdAt).getTime();
      const orgTime = new Date(orgCreateCall.data.createdAt).getTime();
      const timeDiff = Math.abs(userTime - orgTime);

      // Should be created within 1 second of each other
      expect(timeDiff).toBeLessThan(1000);
    }
  });

  it('handles partial seeding failures gracefully', async () => {
    // Mock some entities to fail creation
    mockPrismaClient.user.create.mockRejectedValue(new Error('User failed'));
    mockPrismaClient.organization.create.mockRejectedValue(new Error('Org failed'));

    await expect(seedAuth()).resolves.toBeUndefined();

    // Should still attempt to create other entities
    expect(mockPrismaClient.apiKey.create).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});
