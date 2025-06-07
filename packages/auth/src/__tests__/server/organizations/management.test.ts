import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  acceptInvitation,
  createOrganization,
  declineInvitation,
  deleteOrganization,
  getOrganizationStats,
  inviteMember,
  removeMember,
  revokeInvitation,
  updateMemberRole,
  updateOrganization,
} from '../../../server/organizations/management';

import type { Organization } from '../../../shared/types';

// Mock database
const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockCount = vi.fn();

vi.mock('@repo/database', () => ({
  database: {
    organization: {
      count: mockCount,
      create: mockCreate,
      delete: mockDelete,
      findFirst: mockFindFirst,
      findMany: mockFindMany,
      update: mockUpdate,
    },
    organizationInvitation: {
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    organizationMember: {
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock auth
const mockGetSession = vi.fn();
vi.mock('../../auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

// Mock permissions
vi.mock('../../permissions', () => ({
  canDeleteOrganization: vi.fn().mockResolvedValue(true),
  canInviteMembers: vi.fn().mockResolvedValue(true),
  canManageOrganization: vi.fn().mockResolvedValue(true),
  canRemoveMembers: vi.fn().mockResolvedValue(true),
  canUpdateMemberRoles: vi.fn().mockResolvedValue(true),
}));

describe('Organization Management', () => {
  const mockHeaders = { authorization: 'Bearer test-token' };

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

  const createMockOrganization = (overrides = {}): Organization => ({
    id: 'org-123',
    name: 'Test Organization',
    createdAt: new Date('2023-01-01'),
    metadata: {},
    slug: 'test-org',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrganization', () => {
    it('should create a new organization successfully', async () => {
      const mockSession = createMockSession();
      const mockOrg = createMockOrganization();

      mockGetSession.mockResolvedValue(mockSession);
      mockCreate.mockResolvedValue(mockOrg);

      const result = await createOrganization(mockHeaders, {
        name: 'New Organization',
        metadata: { plan: 'starter' },
        slug: 'new-org',
      });

      expect(result).toEqual(mockOrg);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          name: 'New Organization',
          members: {
            create: {
              role: 'owner',
              userId: 'user-123',
            },
          },
          metadata: { plan: 'starter' },
          slug: 'new-org',
        },
      });
    });

    it('should auto-generate slug if not provided', async () => {
      const mockSession = createMockSession();
      const mockOrg = createMockOrganization({ slug: 'new-organization' });

      mockGetSession.mockResolvedValue(mockSession);
      mockCreate.mockResolvedValue(mockOrg);

      await createOrganization(mockHeaders, {
        name: 'New Organization',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: 'new-organization',
        }),
      });
    });

    it('should handle special characters in organization name', async () => {
      const mockSession = createMockSession();
      mockGetSession.mockResolvedValue(mockSession);
      mockCreate.mockResolvedValue(createMockOrganization());

      await createOrganization(mockHeaders, {
        name: 'Test & Co. Ltd!',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: 'test-co-ltd',
        }),
      });
    });

    it('should throw error when session is missing', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(createOrganization(mockHeaders, { name: 'Test' })).rejects.toThrow(
        'Unauthorized',
      );
    });
  });

  describe('updateOrganization', () => {
    it('should update organization successfully', async () => {
      const mockOrg = createMockOrganization({
        name: 'Updated Organization',
      });

      mockUpdate.mockResolvedValue(mockOrg);

      const result = await updateOrganization(mockHeaders, 'org-123', {
        name: 'Updated Organization',
        metadata: { plan: 'pro' },
      });

      expect(result).toEqual(mockOrg);
      expect(mockUpdate).toHaveBeenCalledWith({
        data: {
          name: 'Updated Organization',
          metadata: { plan: 'pro' },
        },
        where: { id: 'org-123' },
      });
    });

    it('should allow partial updates', async () => {
      const mockOrg = createMockOrganization();
      mockUpdate.mockResolvedValue(mockOrg);

      await updateOrganization(mockHeaders, 'org-123', {
        name: 'New Name Only',
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        data: {
          name: 'New Name Only',
        },
        where: { id: 'org-123' },
      });
    });

    it('should update slug when provided', async () => {
      const mockOrg = createMockOrganization();
      mockUpdate.mockResolvedValue(mockOrg);

      await updateOrganization(mockHeaders, 'org-123', {
        slug: 'new-slug',
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        data: {
          slug: 'new-slug',
        },
        where: { id: 'org-123' },
      });
    });
  });

  describe('deleteOrganization', () => {
    it('should delete organization and all related data', async () => {
      const { database } = await import('@repo/database');

      mockDelete.mockResolvedValue({});

      await deleteOrganization(mockHeaders, 'org-123');

      // Should delete all related data in order
      expect(database.organizationInvitation.deleteMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-123' },
      });

      expect(database.organizationMember.deleteMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-123' },
      });

      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: 'org-123' },
      });
    });

    it('should handle deletion errors', async () => {
      mockDelete.mockRejectedValue(new Error('Deletion failed'));

      await expect(deleteOrganization(mockHeaders, 'org-123')).rejects.toThrow('Deletion failed');
    });
  });

  describe('Member Management', () => {
    describe('inviteMember', () => {
      it('should create invitation successfully', async () => {
        const { database } = await import('@repo/database');
        const mockInvitation = {
          id: 'invite-123',
          email: 'newuser@example.com',
          expiresAt: new Date('2024-01-01'),
          invitedBy: 'user-123',
          organizationId: 'org-123',
          role: 'member',
          status: 'pending',
        };

        database.organizationInvitation.create = vi.fn().mockResolvedValue(mockInvitation);

        const result = await inviteMember(mockHeaders, 'org-123', {
          email: 'newuser@example.com',
          role: 'member',
        });

        expect(result).toEqual(mockInvitation);
        expect(database.organizationInvitation.create).toHaveBeenCalledWith({
          data: {
            email: 'newuser@example.com',
            expiresAt: expect.any(Date),
            invitedBy: 'user-123',
            organizationId: 'org-123',
            role: 'member',
            status: 'pending',
          },
        });
      });

      it('should set default expiration to 7 days', async () => {
        const { database } = await import('@repo/database');

        database.organizationInvitation.create = vi.fn().mockImplementation((args) => {
          const expiresAt = args.data.expiresAt;
          const now = new Date();
          const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

          // Check if expiration is approximately 7 days from now (within 1 minute tolerance)
          const diff = Math.abs(expiresAt.getTime() - sevenDaysFromNow.getTime());
          expect(diff).toBeLessThan(60 * 1000); // 1 minute in milliseconds

          return Promise.resolve({ id: 'invite-123' });
        });

        await inviteMember(mockHeaders, 'org-123', {
          email: 'test@example.com',
          role: 'member',
        });
      });
    });

    describe('removeMember', () => {
      it('should remove member successfully', async () => {
        const { database } = await import('@repo/database');

        database.organizationMember.delete = vi.fn().mockResolvedValue({});

        await removeMember(mockHeaders, 'org-123', 'user-456');

        expect(database.organizationMember.delete).toHaveBeenCalledWith({
          where: {
            userId_organizationId: {
              organizationId: 'org-123',
              userId: 'user-456',
            },
          },
        });
      });

      it('should prevent removing the last owner', async () => {
        const { database } = await import('@repo/database');

        // Mock that this is the only owner
        database.organizationMember.findMany = vi
          .fn()
          .mockResolvedValue([{ role: 'owner', userId: 'user-456' }]);

        database.organizationMember.findFirst = vi.fn().mockResolvedValue({
          role: 'owner',
          userId: 'user-456',
        });

        await expect(removeMember(mockHeaders, 'org-123', 'user-456')).rejects.toThrow(
          'Cannot remove the last owner',
        );
      });
    });

    describe('updateMemberRole', () => {
      it('should update member role successfully', async () => {
        const { database } = await import('@repo/database');
        const mockUpdatedMember = {
          id: 'member-123',
          organizationId: 'org-123',
          role: 'admin',
          userId: 'user-456',
        };

        database.organizationMember.update = vi.fn().mockResolvedValue(mockUpdatedMember);

        const result = await updateMemberRole(mockHeaders, 'org-123', 'user-456', 'admin');

        expect(result).toEqual(mockUpdatedMember);
        expect(database.organizationMember.update).toHaveBeenCalledWith({
          data: { role: 'admin' },
          where: {
            userId_organizationId: {
              organizationId: 'org-123',
              userId: 'user-456',
            },
          },
        });
      });

      it('should prevent changing role of last owner', async () => {
        const { database } = await import('@repo/database');

        // Mock that this is the only owner
        database.organizationMember.findMany = vi
          .fn()
          .mockResolvedValue([{ role: 'owner', userId: 'user-456' }]);

        await expect(
          updateMemberRole(mockHeaders, 'org-123', 'user-456', 'member'),
        ).rejects.toThrow('Cannot change role of the last owner');
      });
    });
  });

  describe('Invitation Management', () => {
    describe('acceptInvitation', () => {
      it('should accept invitation and create membership', async () => {
        const { database } = await import('@repo/database');
        const mockInvitation = {
          id: 'invite-123',
          email: 'user@example.com',
          expiresAt: new Date('2024-01-01'),
          organizationId: 'org-123',
          role: 'member',
          status: 'pending',
        };

        const mockMember = {
          id: 'member-new',
          organizationId: 'org-123',
          role: 'member',
          userId: 'user-123',
        };

        mockGetSession.mockResolvedValue(createMockSession());
        database.organizationInvitation.findFirst = vi.fn().mockResolvedValue(mockInvitation);
        database.organizationInvitation.update = vi.fn().mockResolvedValue({
          ...mockInvitation,
          status: 'accepted',
        });
        database.organizationMember.create = vi.fn().mockResolvedValue(mockMember);

        const result = await acceptInvitation(mockHeaders, 'invite-123');

        expect(result).toEqual(mockMember);

        // Should update invitation status
        expect(database.organizationInvitation.update).toHaveBeenCalledWith({
          data: { status: 'accepted' },
          where: { id: 'invite-123' },
        });

        // Should create membership
        expect(database.organizationMember.create).toHaveBeenCalledWith({
          data: {
            organizationId: 'org-123',
            role: 'member',
            userId: 'user-123',
          },
        });
      });

      it('should reject expired invitations', async () => {
        const { database } = await import('@repo/database');
        const mockInvitation = {
          id: 'invite-123',
          email: 'user@example.com',
          expiresAt: new Date('2020-01-01'), // Expired
          organizationId: 'org-123',
          role: 'member',
          status: 'pending',
        };

        mockGetSession.mockResolvedValue(createMockSession());
        database.organizationInvitation.findFirst = vi.fn().mockResolvedValue(mockInvitation);

        await expect(acceptInvitation(mockHeaders, 'invite-123')).rejects.toThrow(
          'Invitation has expired',
        );
      });

      it('should reject if email does not match', async () => {
        const { database } = await import('@repo/database');
        const mockInvitation = {
          id: 'invite-123',
          email: 'other@example.com',
          expiresAt: new Date('2024-01-01'),
          organizationId: 'org-123',
          role: 'member',
          status: 'pending',
        };

        mockGetSession.mockResolvedValue(
          createMockSession(
            {},
            {
              user: { email: 'user@example.com' },
            },
          ),
        );
        database.organizationInvitation.findFirst = vi.fn().mockResolvedValue(mockInvitation);

        await expect(acceptInvitation(mockHeaders, 'invite-123')).rejects.toThrow(
          'Invitation email does not match',
        );
      });
    });

    describe('declineInvitation', () => {
      it('should decline invitation', async () => {
        const { database } = await import('@repo/database');

        database.organizationInvitation.update = vi.fn().mockResolvedValue({
          id: 'invite-123',
          status: 'declined',
        });

        await declineInvitation(mockHeaders, 'invite-123');

        expect(database.organizationInvitation.update).toHaveBeenCalledWith({
          data: { status: 'declined' },
          where: { id: 'invite-123' },
        });
      });
    });

    describe('revokeInvitation', () => {
      it('should delete invitation', async () => {
        const { database } = await import('@repo/database');

        database.organizationInvitation.delete = vi.fn().mockResolvedValue({});

        await revokeInvitation(mockHeaders, 'org-123', 'invite-123');

        expect(database.organizationInvitation.delete).toHaveBeenCalledWith({
          where: {
            id: 'invite-123',
            organizationId: 'org-123',
          },
        });
      });
    });
  });

  describe('getOrganizationStats', () => {
    it('should return organization statistics', async () => {
      const { database } = await import('@repo/database');

      database.organizationMember.count = vi.fn().mockResolvedValue(10);
      database.organizationInvitation.count = vi.fn().mockResolvedValue(3);

      // Mock for API keys count
      vi.doMock('@repo/database', () => ({
        database: {
          apiKey: {
            count: vi.fn().mockResolvedValue(5),
          },
        },
      }));

      const result = await getOrganizationStats('org-123');

      expect(result).toEqual({
        apiKeyCount: 5,
        memberCount: 10,
        pendingInvitations: 3,
      });

      expect(database.organizationMember.count).toHaveBeenCalledWith({
        where: { organizationId: 'org-123' },
      });

      expect(database.organizationInvitation.count).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-123',
          status: 'pending',
        },
      });
    });
  });
});
