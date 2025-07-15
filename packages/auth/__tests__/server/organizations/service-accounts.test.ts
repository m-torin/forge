import { beforeEach, describe, expect, test, vi } from 'vitest';

// Import test setup
import '../setup';

import * as permissions from '../../../src/server/organizations/permissions';
import { auth } from '../../../src/shared/auth';

// Import after mocking
import {
  createServiceAccountAction,
  getServiceAccountAction,
  listServiceAccountsAction,
  regenerateServiceAccountTokenAction,
  revokeServiceAccountAction,
  updateServiceAccountAction,
} from '../../../src/server/organizations/service-accounts';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock environment
vi.mock('../../../env', () => ({
  safeServerEnv: () => ({
    BETTER_AUTH_SECRET: 'test-secret',
    BETTER_AUTH_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: 'Test App',
    DATABASE_URL: 'test-url',
  }),
}));

// Mock auth module
vi.mock('../../../src/shared/auth', async () => {
  const actual = await vi.importActual('../../../src/shared/auth');
  return {
    ...actual,
    auth: {
      api: {
        getSession: vi.fn(),
        createApiKey: vi.fn(),
        listApiKeys: vi.fn(),
        updateApiKey: vi.fn(),
        deleteApiKey: vi.fn(),
        verifyApiKey: vi.fn(),
      },
    },
  };
});

// Mock permissions
vi.mock('../../../src/server/organizations/permissions', () => ({
  checkPermission: vi.fn().mockResolvedValue(true),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
}));

// Mock service auth
vi.mock('../../../src/server/api-keys/service-auth', () => ({
  createServiceAuth: vi.fn().mockResolvedValue({
    success: true,
    apiKey: {
      id: 'key-123',
      key: 'test-api-key',
      name: 'Test Service Account',
      organizationId: 'org-123',
      permissions: ['read:data'],
      metadata: { type: 'service-account' },
    },
  }),
}));

describe('service Accounts', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth.api.getSession).mockResolvedValue(createMockSession());
    vi.mocked(permissions.checkPermission).mockResolvedValue(true);
  });

  describe('createServiceAccount', () => {
    test('should create service account successfully', async () => {
      vi.mocked(auth.api.createApiKey).mockResolvedValue({
        id: 'key-123',
        key: 'sk_test_123',
        expiresAt: null,
      });

      const result = await createServiceAccountAction({
        organizationId: 'org-123',
        name: 'Test Service Account',
        description: 'Test description',
        permissions: ['read:data'],
      });

      expect(result.success).toBeTruthy();
      expect(result.token).toBe('sk_test_123');
      expect(result.serviceAccountId).toBe('key-123');
      expect(vi.mocked(auth.api.createApiKey)).toHaveBeenCalledWith({
        body: {
          name: 'Test Service Account',
          organizationId: 'org-123',
          permissions: ['read:data'],
          expiresIn: undefined,
          metadata: {
            type: 'service-account',
            description: 'Test description',
            serviceId: 'org-123-Test Service Account',
            createdAt: expect.any(String),
          },
        },
        headers: expect.any(Headers),
      });
    });

    test('should require authentication', async () => {
      vi.mocked(permissions.checkPermission).mockResolvedValue(false);

      const result = await createServiceAccountAction({
        organizationId: 'org-123',
        name: 'Test Service Account',
        permissions: ['read:data'],
      });

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Insufficient permissions to create service accounts');
    });

    test('should handle service auth failure', async () => {
      vi.mocked(auth.api.createApiKey).mockRejectedValue(new Error('Creation failed'));

      const result = await createServiceAccountAction({
        organizationId: 'org-123',
        name: 'Test Service Account',
        permissions: ['read:data'],
      });

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Failed to create service account');
    });
  });

  describe('listServiceAccounts', () => {
    test('should list service accounts successfully', async () => {
      const mockApiKeys = [
        {
          id: 'key-1',
          name: 'Service Account 1',
          organizationId: 'org-123',
          createdAt: new Date('2023-01-01'),
          expiresAt: new Date('2024-01-01'),
          metadata: { type: 'service-account' },
        },
        {
          id: 'key-2',
          name: 'Service Account 2',
          organizationId: 'org-123',
          createdAt: new Date('2023-02-01'),
          expiresAt: null,
          metadata: { type: 'service-account' },
        },
        {
          id: 'key-3',
          name: 'Regular API Key',
          organizationId: 'org-123',
          createdAt: new Date('2023-03-01'),
          metadata: {},
        },
      ];

      vi.mocked(auth.api.listApiKeys).mockResolvedValue(mockApiKeys);

      const result = await listServiceAccountsAction('org-123');

      expect(result.success).toBeTruthy();
      expect(result.serviceAccounts).toHaveLength(2);
      expect(result.serviceAccounts?.[0].id).toBe('key-1');
      expect(result.serviceAccounts?.[1].id).toBe('key-2');
    });

    test('should identify expired service accounts', async () => {
      const now = new Date();
      const expiredDate = new Date(now.getTime() - 86400000); // Yesterday

      const mockApiKeys = [
        {
          id: 'key-1',
          name: 'Expired Service Account',
          organizationId: 'org-123',
          createdAt: new Date('2023-01-01'),
          expiresAt: expiredDate,
          metadata: { type: 'service-account' },
        },
      ];

      vi.mocked(auth.api.listApiKeys).mockResolvedValue(mockApiKeys);

      const result = await listServiceAccountsAction('org-123');

      expect(result.success).toBeTruthy();
      expect(result.serviceAccounts).toHaveLength(1);
      expect(result.serviceAccounts?.[0].isActive).toBeFalsy();
    });
  });

  describe('updateServiceAccount', () => {
    test('should update service account successfully', async () => {
      const mockUpdatedKey = {
        id: 'key-123',
        name: 'Updated Service Account',
        metadata: {
          type: 'service-account',
          description: 'Updated description',
        },
      };

      vi.mocked(auth.api.updateApiKey).mockResolvedValue({ apiKey: mockUpdatedKey });

      const result = await updateServiceAccountAction({
        serviceAccountId: 'key-123',
        organizationId: 'org-123',
        name: 'Updated Service Account',
        description: 'Updated description',
      });

      expect(result.success).toBeTruthy();
      expect(vi.mocked(auth.api.updateApiKey)).toHaveBeenCalledWith({
        body: {
          keyId: 'key-123',
          name: 'Updated Service Account',
          metadata: {
            type: 'service-account',
            description: 'Updated description',
            serviceId: 'org-123-Updated Service Account',
          },
        },
        headers: expect.any(Headers),
      });
    });

    test('should allow partial updates', async () => {
      const mockUpdatedKey = {
        id: 'key-123',
        name: 'New Name',
        metadata: { type: 'service-account' },
      };

      vi.mocked(auth.api.updateApiKey).mockResolvedValue({ apiKey: mockUpdatedKey });

      const result = await updateServiceAccountAction({
        serviceAccountId: 'key-123',
        organizationId: 'org-123',
        name: 'New Name',
      });

      expect(result.success).toBeTruthy();
      expect(vi.mocked(auth.api.updateApiKey)).toHaveBeenCalledWith({
        body: {
          keyId: 'key-123',
          name: 'New Name',
        },
        headers: expect.any(Headers),
      });
    });
  });

  describe('revokeServiceAccount', () => {
    test('should revoke service account successfully', async () => {
      vi.mocked(auth.api.deleteApiKey).mockResolvedValue({ success: true });

      const result = await revokeServiceAccountAction({
        serviceAccountId: 'key-123',
        organizationId: 'org-123',
      });

      expect(result.success).toBeTruthy();
      expect(vi.mocked(auth.api.deleteApiKey)).toHaveBeenCalledWith({
        body: { keyId: 'key-123' },
        headers: expect.any(Headers),
      });
    });
  });

  describe('getServiceAccount', () => {
    test('should get service account details successfully', async () => {
      const mockApiKey = {
        id: 'key-123',
        name: 'Test Service Account',
        organizationId: 'org-123',
        permissions: ['read:data'],
        metadata: { type: 'service-account' },
        createdAt: '2023-01-01T00:00:00.000Z',
        expiresAt: null,
        lastUsedAt: null,
      };

      vi.mocked(auth.api.listApiKeys).mockResolvedValue([mockApiKey]);

      const result = await getServiceAccountAction({
        serviceAccountId: 'key-123',
        organizationId: 'org-123',
      });

      expect(result.success).toBeTruthy();
      expect(result.serviceAccount).toStrictEqual({
        id: 'key-123',
        name: 'Test Service Account',
        permissions: ['read:data'],
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        description: undefined,
        expiresAt: undefined,
        isActive: true,
        lastUsedAt: undefined,
      });
    });
  });

  describe('regenerateServiceAccountToken', () => {
    test('should regenerate token successfully', async () => {
      const mockOldKey = {
        id: 'key-123',
        name: 'Test Service Account',
        organizationId: 'org-123',
        permissions: ['read:data'],
        metadata: {
          type: 'service-account',
          description: 'Test description',
        },
      };

      vi.mocked(auth.api.listApiKeys).mockResolvedValue([mockOldKey]);
      vi.mocked(auth.api.deleteApiKey).mockResolvedValue({ success: true });
      vi.mocked(auth.api.createApiKey).mockResolvedValue({
        id: 'key-456',
        key: 'sk_test_new_123',
        expiresAt: null,
      });

      const result = await regenerateServiceAccountTokenAction({
        serviceAccountId: 'key-123',
        organizationId: 'org-123',
      });

      expect(result.success).toBeTruthy();
      expect(result.token).toBe('sk_test_new_123');
      expect(vi.mocked(auth.api.deleteApiKey)).toHaveBeenCalledWith({
        body: { keyId: 'key-123' },
        headers: expect.any(Headers),
      });
      expect(vi.mocked(auth.api.createApiKey)).toHaveBeenCalledWith({
        body: {
          name: 'Test Service Account',
          organizationId: 'org-123',
          permissions: ['read:data'],
          metadata: {
            type: 'service-account',
            description: 'Test description',
            regeneratedAt: expect.any(String),
          },
        },
        headers: expect.any(Headers),
      });
    });
  });
});
