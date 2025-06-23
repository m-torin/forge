import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ServiceAuthResult } from '../../../src/shared/api-keys';

// Mock all functions using vi.hoisted
const {
  mockApiKeyCreate,
  mockApiKeyDelete,
  mockApiKeyFindFirst,
  mockApiKeyFindMany,
  mockApiKeyUpdate,
  mockAuthCreateApiKey,
  mockCheckPermission,
  mockCreateServiceAuth,
  mockGetSession,
} = vi.hoisted(() => {
  const mockApiKeyCreate = vi.fn();
  const mockApiKeyFindMany = vi.fn();
  const mockApiKeyFindFirst = vi.fn();
  const mockApiKeyUpdate = vi.fn();
  const mockApiKeyDelete = vi.fn();
  const mockGetSession = vi.fn();
  const mockCheckPermission = vi.fn();
  const mockCreateServiceAuth = vi.fn();
  const mockAuthCreateApiKey = vi.fn();

  return {
    mockApiKeyCreate,
    mockApiKeyDelete,
    mockApiKeyFindFirst,
    mockApiKeyFindMany,
    mockApiKeyUpdate,
    mockAuthCreateApiKey,
    mockCheckPermission,
    mockCreateServiceAuth,
    mockGetSession,
  };
});

vi.mock('@repo/database/prisma', () => ({
  prisma: {
    apiKey: {
      create: mockApiKeyCreate,
      delete: mockApiKeyDelete,
      findFirst: mockApiKeyFindFirst,
      findMany: mockApiKeyFindMany,
      update: mockApiKeyUpdate,
    },
  },
}));

// Mock headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({}),
}));

// Mock auth
vi.mock('../../../src/shared/auth.config', () => ({
  auth: {
    api: {
      createApiKey: mockAuthCreateApiKey,
      getSession: mockGetSession,
    },
  },
}));

// Mock permissions
vi.mock('../../../src/server/organizations/permissions', () => ({
  checkPermission: mockCheckPermission,
}));

// Mock service auth
vi.mock('../../../src/server/api-keys/service-auth', () => ({
  createServiceAuth: mockCreateServiceAuth,
}));

// Import after mocking
import {
  createServiceAccountAction,
  listServiceAccountsAction,
  revokeServiceAccountAction,
  updateServiceAccountAction,
  getServiceAccountAction,
  regenerateServiceAccountTokenAction,
} from '../../../src/server/organizations/service-accounts';

describe('Service Accounts', () => {
  const createMockSession = (overrides = {}) => ({
    session: {
      id: 'session-123',
      activeOrganizationId: 'org-123',
      userId: 'user-123',
      ...overrides,
    },
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  });

  const createMockServiceAuthResult = (overrides = {}): ServiceAuthResult => ({
    expiresAt: new Date('2024-01-01'),
    success: true,
    token: 'service-token-123',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckPermission.mockResolvedValue(true);

    // Default auth mock setup
    mockAuthCreateApiKey.mockResolvedValue({
      apiKey: 'mock-api-key-12345',
      success: true,
    });

    // Default service auth mock setup
    mockCreateServiceAuth.mockResolvedValue({
      expiresAt: new Date('2024-01-01'),
      success: true,
      token: 'service-token-123',
    });
  });

  describe('createServiceAccount', () => {
    it('should create service account successfully', async () => {
      const mockSession = createMockSession();
      const mockAuthResult = createMockServiceAuthResult();
      const mockApiKey = {
        id: 'apikey_123',
        name: 'Test Service Account',
        createdAt: new Date(),
      };

      mockGetSession.mockResolvedValue(mockSession);
      mockCreateServiceAuth.mockResolvedValue(mockAuthResult);
      mockApiKeyCreate.mockResolvedValue(mockApiKey);

      const result = await createServiceAccountAction({
        name: 'Test Service Account',
        description: 'Test description',
        expiresIn: '30d',
        organizationId: 'org-123',
        permissions: ['read:data', 'write:data'],
      });

      expect(result).toEqual({
        ...mockAuthResult,
        serviceAccountId: 'apikey_123',
      });

      expect(mockCheckPermission).toHaveBeenCalledWith('api-keys:create', 'org-123');

      expect(mockCreateServiceAuth).toHaveBeenCalledWith({
        expiresIn: '30d',
        permissions: ['read:data', 'write:data'],
        serviceId: 'org-123-Test Service Account',
      });

      expect(mockApiKeyCreate).toHaveBeenCalledWith({
        data: {
          id: expect.stringMatching(/^apikey_/),
          name: 'Test Service Account',
          createdAt: expect.any(Date),
          expiresAt: new Date('2024-01-01'),
          key: 'service-token-123',
          metadata: {
            type: 'service-account',
            description: 'Test description',
            serviceId: 'org-123-Test Service Account',
          },
          organizationId: 'org-123',
          permissions: JSON.stringify(['read:data', 'write:data']),
          updatedAt: expect.any(Date),
          userId: 'user-123',
        },
      });
    });

    it('should require authentication', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await createServiceAccountAction({
        name: 'Test',
        organizationId: 'org-123',
        permissions: [],
      });

      expect(result).toEqual({
        error: 'Authentication required',
        success: false,
      });
    });

    it('should check permissions', async () => {
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      mockCheckPermission.mockResolvedValue(false);

      const result = await createServiceAccountAction({
        name: 'Test',
        organizationId: 'org-123',
        permissions: [],
      });

      expect(result).toEqual({
        error: 'Insufficient permissions to create service accounts',
        success: false,
      });
    });

    it('should handle service auth failure', async () => {
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      mockCreateServiceAuth.mockResolvedValue({
        error: 'Failed to create token',
        success: false,
      });

      const result = await createServiceAccountAction({
        name: 'Test',
        organizationId: 'org-123',
        permissions: [],
      });

      expect(result).toEqual({
        error: 'Failed to create token',
        success: false,
      });
    });
  });

  describe('listServiceAccounts', () => {
    it('should list service accounts successfully', async () => {
      const mockApiKeys = [
        {
          id: 'apikey_1',
          name: 'Service Account 1',
          createdAt: new Date('2023-01-01'),
          expiresAt: new Date('2024-01-01'),
          metadata: {
            type: 'service-account',
            description: 'Description 1',
          },
          permissions: JSON.stringify(['read:data']),
        },
        {
          id: 'apikey_2',
          name: 'Service Account 2',
          createdAt: new Date('2023-01-02'),
          expiresAt: null,
          metadata: {
            type: 'service-account',
          },
          permissions: JSON.stringify(['write:data']),
        },
      ];

      mockApiKeyFindMany.mockResolvedValue(mockApiKeys);

      const result = await listServiceAccountsAction('org-123');

      expect(result).toEqual({
        serviceAccounts: [
          {
            id: 'apikey_1',
            name: 'Service Account 1',
            createdAt: new Date('2023-01-01'),
            description: 'Description 1',
            expiresAt: new Date('2024-01-01'),
            isActive: false,
            permissions: ['read:data'],
          },
          {
            id: 'apikey_2',
            name: 'Service Account 2',
            createdAt: new Date('2023-01-02'),
            description: undefined,
            expiresAt: null,
            isActive: true,
            permissions: ['write:data'],
          },
        ],
        success: true,
      });

      expect(mockApiKeyFindMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          metadata: {
            equals: 'service-account',
            path: ['type'],
          },
          organizationId: 'org-123',
        },
      });
    });

    it('should check permissions', async () => {
      mockCheckPermission.mockResolvedValue(false);

      const result = await listServiceAccountsAction('org-123');

      expect(result).toEqual({
        error: 'Insufficient permissions to list service accounts',
        success: false,
      });
    });

    it('should identify expired service accounts', async () => {
      const mockApiKeys = [
        {
          id: 'apikey_1',
          name: 'Expired Account',
          createdAt: new Date('2023-01-01'),
          expiresAt: new Date('2020-01-01'), // Expired
          metadata: { type: 'service-account' },
          permissions: null,
        },
      ];

      mockApiKeyFindMany.mockResolvedValue(mockApiKeys);

      const result = await listServiceAccountsAction('org-123');

      expect(result.serviceAccounts?.[0].isActive).toBe(false);
    });
  });

  describe('updateServiceAccount', () => {
    it('should update service account successfully', async () => {
      mockApiKeyUpdate.mockResolvedValue({});

      const result = await updateServiceAccountAction({
        name: 'Updated Name',
        description: 'Updated description',
        organizationId: 'org-123',
        permissions: ['read:all'],
        serviceAccountId: 'apikey_123',
      });

      expect(result).toEqual({ success: true });

      expect(mockApiKeyUpdate).toHaveBeenCalledWith({
        data: {
          name: 'Updated Name',
          metadata: {
            type: 'service-account',
            description: 'Updated description',
          },
          permissions: JSON.stringify(['read:all']),
        },
        where: {
          id: 'apikey_123',
          organizationId: 'org-123',
        },
      });
    });

    it('should allow partial updates', async () => {
      mockApiKeyUpdate.mockResolvedValue({});

      await updateServiceAccountAction({
        name: 'New Name Only',
        organizationId: 'org-123',
        serviceAccountId: 'apikey_123',
      });

      expect(mockApiKeyUpdate).toHaveBeenCalledWith({
        data: {
          name: 'New Name Only',
        },
        where: {
          id: 'apikey_123',
          organizationId: 'org-123',
        },
      });
    });

    it('should check permissions', async () => {
      mockCheckPermission.mockResolvedValue(false);

      const result = await updateServiceAccountAction({
        organizationId: 'org-123',
        serviceAccountId: 'apikey_123',
      });

      expect(result).toEqual({
        error: 'Insufficient permissions to update service accounts',
        success: false,
      });
    });
  });

  describe('revokeServiceAccount', () => {
    it('should revoke service account successfully', async () => {
      mockApiKeyDelete.mockResolvedValue({});

      const result = await revokeServiceAccountAction({
        organizationId: 'org-123',
        serviceAccountId: 'apikey_123',
      });

      expect(result).toEqual({ success: true });

      expect(mockApiKeyDelete).toHaveBeenCalledWith({
        where: {
          id: 'apikey_123',
          organizationId: 'org-123',
        },
      });
    });

    it('should check permissions', async () => {
      mockCheckPermission.mockResolvedValue(false);

      const result = await revokeServiceAccountAction({
        organizationId: 'org-123',
        serviceAccountId: 'apikey_123',
      });

      expect(result).toEqual({
        error: 'Insufficient permissions to revoke service accounts',
        success: false,
      });
    });
  });

  describe('getServiceAccount', () => {
    it('should get service account details successfully', async () => {
      const mockApiKey = {
        id: 'apikey_123',
        name: 'Test Service Account',
        createdAt: new Date('2023-01-01'),
        expiresAt: new Date('2024-01-01'),
        lastUsedAt: new Date('2023-06-01'),
        metadata: {
          type: 'service-account',
          description: 'Test description',
        },
        permissions: JSON.stringify(['read:data']),
      };

      mockApiKeyFindFirst.mockResolvedValue(mockApiKey);

      const result = await getServiceAccountAction({
        organizationId: 'org-123',
        serviceAccountId: 'apikey_123',
      });

      expect(result).toEqual({
        serviceAccount: {
          id: 'apikey_123',
          name: 'Test Service Account',
          createdAt: new Date('2023-01-01'),
          description: 'Test description',
          expiresAt: new Date('2024-01-01'),
          isActive: false,
          lastUsedAt: new Date('2023-06-01'),
          permissions: ['read:data'],
        },
        success: true,
      });
    });

    it('should return error when not found', async () => {
      mockApiKeyFindFirst.mockResolvedValue(null);

      const result = await getServiceAccountAction({
        organizationId: 'org-123',
        serviceAccountId: 'apikey_123',
      });

      expect(result).toEqual({
        error: 'Service account not found',
        success: false,
      });
    });
  });

  describe('regenerateServiceAccountToken', () => {
    it('should regenerate token successfully', async () => {
      const mockApiKey = {
        id: 'apikey_123',
        name: 'Test Service Account',
        metadata: {
          type: 'service-account',
          serviceId: 'org-123-test',
        },
        permissions: JSON.stringify(['read:data']),
      };
      const mockAuthResult = createMockServiceAuthResult();

      mockApiKeyFindFirst.mockResolvedValue(mockApiKey);
      mockCreateServiceAuth.mockResolvedValue(mockAuthResult);
      mockApiKeyUpdate.mockResolvedValue({});

      const result = await regenerateServiceAccountTokenAction({
        expiresIn: '60d',
        organizationId: 'org-123',
        serviceAccountId: 'apikey_123',
      });

      expect(result).toEqual(mockAuthResult);

      expect(mockCreateServiceAuth).toHaveBeenCalledWith({
        expiresIn: '60d',
        permissions: ['read:data'],
        serviceId: 'org-123-test',
      });

      expect(mockApiKeyUpdate).toHaveBeenCalledWith({
        data: {
          expiresAt: new Date('2024-01-01'),
        },
        where: { id: 'apikey_123' },
      });
    });

    it('should return error when not found', async () => {
      mockApiKeyFindFirst.mockResolvedValue(null);

      const result = await regenerateServiceAccountTokenAction({
        organizationId: 'org-123',
        serviceAccountId: 'apikey_123',
      });

      expect(result).toEqual({
        error: 'Service account not found',
        success: false,
      });
    });
  });
});
