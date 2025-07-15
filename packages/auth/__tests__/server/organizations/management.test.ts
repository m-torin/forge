import { beforeEach, describe, expect, vi } from 'vitest';

// Import test setup
import '../setup';

import { auth } from '../../../src/shared/auth';
import type { Organization } from '../../../src/shared/types';

// Import after mocking
import {
  acceptInvitationAction,
  cancelInvitationAction,
  createOrganizationAction,
  declineInvitationAction,
  deleteOrganizationAction,
  getOrganizationStatisticsAction,
  inviteUserAction,
  removeMemberAction,
  updateMemberRoleAction,
  updateOrganizationAction,
} from '../../../src/server/organizations/management';

// Use vi.hoisted for mocks
const { mockPrisma } = vi.hoisted(() => {
  const mockFindFirst = vi.fn();
  const mockFindMany = vi.fn();
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockCount = vi.fn();

  const mockPrisma = {
    apiKey: {
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    invitation: {
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    member: {
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    organization: {
      count: mockCount,
      create: mockCreate,
      delete: mockDelete,
      findFirst: mockFindFirst,
      findMany: mockFindMany,
      update: mockUpdate,
    },
    team: {
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  };

  return {
    mockCount,
    mockCreate,
    mockDelete,
    mockFindFirst,
    mockFindMany,
    mockPrisma,
    mockUpdate,
  };
});

vi.mock('@repo/database/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock auth module
vi.mock('../../../src/shared/auth', async () => {
  const actual = await vi.importActual('../../../src/shared/auth');
  return {
    ...actual,
    auth: {
      api: {
        acceptInvitation: vi.fn(),
        addMember: vi.fn(),
        cancelInvitation: vi.fn(),
        createOrganization: vi.fn(),
        declineInvitation: vi.fn(),
        deleteOrganization: vi.fn(),
        getSession: vi.fn(),
        inviteUser: vi.fn(),
        rejectInvitation: vi.fn(),
        removeMember: vi.fn(),
        updateMemberRole: vi.fn(),
        updateOrganization: vi.fn(),
        getFullOrganization: vi.fn(),
        listInvitations: vi.fn(),
        listTeams: vi.fn(),
      },
    },
  };
});

// Mock headers function
const { mockHeaders } = vi.hoisted(() => {
  const mockHeaders = vi.fn(() => new Headers());
  return { mockHeaders };
});

vi.mock('next/headers', () => ({
  headers: mockHeaders,
}));

// Mock permissions
vi.mock('../../../src/server/organizations/permissions', () => ({
  canDeleteOrganization: vi.fn().mockResolvedValue(true),
  canInviteMembers: vi.fn().mockResolvedValue(true),
  canManageOrganization: vi.fn().mockResolvedValue(true),
  canRemoveMembers: vi.fn().mockResolvedValue(true),
  canUpdateMemberRoles: vi.fn().mockResolvedValue(true),
}));

describe('organization Management', () => {
  const createMockSession = (overrides = {}) => ({
    session: {
      id: 'session-123',
      activeOrganizationId: 'org-123',
      expiresAt: new Date(Date.now() + 86400000),
      token: 'mock-token',
      userId: 'user-123',
      ...overrides,
    },
    user: {
      id: 'user-123',
      name: 'Test User',
      createdAt: new Date(),
      email: 'test@example.com',
      updatedAt: new Date(),
    },
  });

  const createMockOrganization = (overrides = {}): Organization => ({
    id: 'org-123',
    name: 'Test Organization',
    createdAt: new Date('2023-01-01'),
    description: null,
    logo: null,
    metadata: {},
    slug: 'test-org',
    updatedAt: null,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default session
    vi.mocked(auth.api.getSession).mockResolvedValue(createMockSession());

    // Set up default auth API responses
    vi.mocked(auth.api.updateMemberRole).mockResolvedValue({
      success: true,
    });

    vi.mocked(auth.api.acceptInvitation).mockResolvedValue({
      organizationId: 'org-123',
      success: true,
    });
  });

  describe('createOrganization', () => {
    test('should create organization successfully', async () => {
      const mockOrg = createMockOrganization();
      vi.mocked(auth.api.createOrganization).mockResolvedValue(mockOrg);

      const result = await createOrganizationAction({
        name: 'Test Organization',
        description: 'Test Description',
      });

      expect(result.success).toBeTruthy();
      expect(result.organization).toStrictEqual(mockOrg);
      expect(vi.mocked(auth.api.createOrganization)).toHaveBeenCalledWith({
        body: {
          name: 'Test Organization',
          slug: 'test-organization',
          metadata: { description: 'Test Description' },
        },
        headers: expect.any(Headers),
      });
    });

    test('should handle organization creation errors', async () => {
      vi.mocked(auth.api.createOrganization).mockRejectedValue(new Error('Creation failed'));

      const result = await createOrganizationAction({
        name: 'Test Organization',
      });

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Failed to create organization');
    });

    test('should generate slug from name if not provided', async () => {
      const mockOrg = createMockOrganization();
      vi.mocked(auth.api.createOrganization).mockResolvedValue(mockOrg);

      await createOrganizationAction({
        name: 'My Test Organization',
      });

      expect(vi.mocked(auth.api.createOrganization)).toHaveBeenCalledWith({
        body: {
          name: 'My Test Organization',
          slug: 'my-test-organization',
          metadata: {},
        },
        headers: expect.any(Headers),
      });
    });

    test('should use provided slug if available', async () => {
      const mockOrg = createMockOrganization();
      vi.mocked(auth.api.createOrganization).mockResolvedValue(mockOrg);

      await createOrganizationAction({
        name: 'Test Organization',
        slug: 'custom-slug',
      });

      expect(vi.mocked(auth.api.createOrganization)).toHaveBeenCalledWith({
        body: {
          name: 'Test Organization',
          slug: 'custom-slug',
          metadata: {},
        },
        headers: expect.any(Headers),
      });
    });
  });

  describe('updateOrganization', () => {
    test('should update organization successfully', async () => {
      const mockOrg = createMockOrganization({ name: 'Updated Organization' });
      vi.mocked(auth.api.updateOrganization).mockResolvedValue(mockOrg);

      const result = await updateOrganizationAction({
        organizationId: 'org-123',
        name: 'Updated Organization',
        description: 'Updated Description',
      });

      expect(result.success).toBeTruthy();
      expect(result.organization).toStrictEqual(mockOrg);
      expect(vi.mocked(auth.api.updateOrganization)).toHaveBeenCalledWith({
        body: {
          organizationId: 'org-123',
          data: {
            name: 'Updated Organization',
            metadata: { description: 'Updated Description' },
          },
        },
        headers: expect.any(Headers),
      });
    });

    test('should handle organization update errors', async () => {
      vi.mocked(auth.api.updateOrganization).mockRejectedValue(new Error('Update failed'));

      const result = await updateOrganizationAction({
        organizationId: 'org-123',
        name: 'Updated Organization',
      });

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Failed to update organization');
    });

    test('should update only provided fields', async () => {
      const mockOrg = createMockOrganization();
      vi.mocked(auth.api.updateOrganization).mockResolvedValue(mockOrg);

      await updateOrganizationAction({
        organizationId: 'org-123',
        name: 'Updated Name',
      });

      expect(vi.mocked(auth.api.updateOrganization)).toHaveBeenCalledWith({
        body: {
          organizationId: 'org-123',
          data: {
            name: 'Updated Name',
          },
        },
        headers: expect.any(Headers),
      });
    });
  });

  describe('deleteOrganization', () => {
    test('should delete organization successfully', async () => {
      vi.mocked(auth.api.deleteOrganization).mockResolvedValue({ success: true });

      const result = await deleteOrganizationAction('org-123');

      expect(result.success).toBeTruthy();
      expect(vi.mocked(auth.api.deleteOrganization)).toHaveBeenCalledWith({
        body: { organizationId: 'org-123' },
        headers: expect.any(Headers),
      });
    });

    test('should handle organization deletion errors', async () => {
      vi.mocked(auth.api.deleteOrganization).mockRejectedValue(new Error('Deletion failed'));

      const result = await deleteOrganizationAction('org-123');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Failed to delete organization');
    });
  });

  describe('member Management', () => {
    describe('inviteMember', () => {
      test('should invite member successfully', async () => {
        const mockInvitation = { id: 'inv-123', email: 'test@example.com' };
        vi.mocked(auth.api.inviteUser).mockResolvedValue(mockInvitation);

        const result = await inviteUserAction({
          email: 'test@example.com',
          organizationId: 'org-123',
          role: 'member',
        });

        expect(result.success).toBeTruthy();
        expect(result.invitation).toStrictEqual(mockInvitation);
        expect(vi.mocked(auth.api.inviteUser)).toHaveBeenCalledWith({
          body: {
            email: 'test@example.com',
            organizationId: 'org-123',
            role: 'member',
          },
          headers: expect.any(Headers),
        });
      });
    });

    describe('removeMember', () => {
      test('should remove member successfully', async () => {
        vi.mocked(auth.api.removeMember).mockResolvedValue({
          success: true,
        });

        const result = await removeMemberAction({ organizationId: 'org-123', userId: 'user-456' });

        expect(result.success).toBeTruthy();
        expect(vi.mocked(auth.api.removeMember)).toHaveBeenCalledWith({
          body: {
            organizationId: 'org-123',
            memberIdOrEmail: 'user-456',
          },
          headers: expect.any(Headers),
        });
      });

      test('should handle removal errors', async () => {
        vi.mocked(auth.api.removeMember).mockRejectedValue(
          new Error('Cannot remove the last owner'),
        );

        const result = await removeMemberAction({ organizationId: 'org-123', userId: 'user-456' });

        expect(result.success).toBeFalsy();
        expect(result.error).toBe('Failed to remove member');
      });
    });

    describe('updateMemberRole', () => {
      test('should update member role successfully', async () => {
        const mockUpdatedMember = {
          id: 'member-123',
          organizationId: 'org-123',
          role: 'admin',
          userId: 'user-456',
        };

        vi.mocked(auth.api.updateMemberRole).mockResolvedValue({
          member: mockUpdatedMember,
          success: true,
        });

        const result = await updateMemberRoleAction({
          organizationId: 'org-123',
          role: 'admin',
          userId: 'user-456',
        });

        expect(result.success).toBeTruthy();
        expect(vi.mocked(auth.api.updateMemberRole)).toHaveBeenCalledWith({
          body: {
            memberId: 'user-456',
            role: 'admin',
          },
          headers: expect.any(Headers),
        });
      });

      test('should handle role update errors', async () => {
        vi.mocked(auth.api.updateMemberRole).mockRejectedValue(
          new Error('Cannot change role of the last owner'),
        );

        const result = await updateMemberRoleAction({
          organizationId: 'org-123',
          role: 'member',
          userId: 'user-456',
        });

        expect(result.success).toBeFalsy();
        expect(result.error).toBe('Failed to update member role');
      });
    });
  });

  describe('invitation Management', () => {
    describe('acceptInvitation', () => {
      test('should accept invitation and create membership', async () => {
        vi.mocked(auth.api.acceptInvitation).mockResolvedValue({
          invitation: {
            organizationId: 'org-123',
          },
        });

        const result = await acceptInvitationAction('invite-123');

        expect(result.success).toBeTruthy();
        expect(result.organizationId).toBe('org-123');
        expect(vi.mocked(auth.api.acceptInvitation)).toHaveBeenCalledWith({
          body: {
            invitationId: 'invite-123',
          },
          headers: expect.any(Headers),
        });
      });

      test('should handle invitation errors', async () => {
        vi.mocked(auth.api.acceptInvitation).mockRejectedValue(new Error('Invitation has expired'));

        const result = await acceptInvitationAction('invite-123');

        expect(result.success).toBeFalsy();
        expect(result.error).toBe('Failed to accept invitation');
      });
    });

    describe('declineInvitation', () => {
      test('should decline invitation', async () => {
        vi.mocked(auth.api.rejectInvitation).mockResolvedValue({
          success: true,
        });

        const result = await declineInvitationAction('invite-123');

        expect(result.success).toBeTruthy();
        expect(vi.mocked(auth.api.rejectInvitation)).toHaveBeenCalledWith({
          body: {
            invitationId: 'invite-123',
          },
          headers: expect.any(Headers),
        });
      });
    });

    describe('revokeInvitation', () => {
      test('should revoke invitation', async () => {
        vi.mocked(auth.api.cancelInvitation).mockResolvedValue({
          success: true,
        });

        const result = await cancelInvitationAction('invite-123');

        expect(result.success).toBeTruthy();
        expect(vi.mocked(auth.api.cancelInvitation)).toHaveBeenCalledWith({
          body: { invitationId: 'invite-123' },
          headers: expect.any(Headers),
        });
      });

      test('should handle invitation revocation errors', async () => {
        vi.mocked(auth.api.cancelInvitation).mockRejectedValue(new Error('Revocation failed'));

        const result = await cancelInvitationAction('invite-123');

        expect(result.success).toBeFalsy();
        expect(result.error).toBe('Failed to cancel invitation');
      });
    });
  });

  describe('getOrganizationStats', () => {
    test('should return organization statistics', async () => {
      // Set up auth session mock
      vi.mocked(auth.api.getSession).mockResolvedValue({
        session: {
          id: 'session-123',
          activeOrganizationId: 'org-123',
          userId: 'user-123',
        },
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      });

      // Mock getFullOrganization to return members
      vi.mocked(auth.api.getFullOrganization).mockResolvedValue({
        organization: {
          id: 'org-123',
          name: 'Test Organization',
        },
        members: [
          {
            id: 'member-1',
            role: 'owner',
            userId: 'user-1',
            user: { id: 'user-1', banned: false },
          },
          {
            id: 'member-2',
            role: 'admin',
            userId: 'user-2',
            user: { id: 'user-2', banned: false },
          },
          {
            id: 'member-3',
            role: 'member',
            userId: 'user-3',
            user: { id: 'user-3', banned: false },
          },
          {
            id: 'member-4',
            role: 'member',
            userId: 'user-4',
            user: { id: 'user-4', banned: false },
          },
          {
            id: 'member-5',
            role: 'member',
            userId: 'user-5',
            user: { id: 'user-5', banned: false },
          },
        ],
      });

      // Mock listInvitations for invitations
      vi.mocked(auth.api.listInvitations).mockResolvedValue([
        { id: 'inv-1', status: 'pending' },
        { id: 'inv-2', status: 'pending' },
        { id: 'inv-3', status: 'accepted' },
      ]);

      // Mock listTeams for teams count
      vi.mocked(auth.api.listTeams).mockResolvedValue({
        teams: [{ id: 'team-1' }, { id: 'team-2' }, { id: 'team-3' }],
      });

      const result = await getOrganizationStatisticsAction('org-123');

      expect(result.success).toBeTruthy();
      expect(result.data).toBeDefined();
      expect(result.data?.totalMembers).toBe(5);
      expect(result.data?.activeMembers).toBe(5);
      expect(result.data?.pendingInvitations).toBe(2);
      expect(result.data?.teams).toBe(0);
      expect(result.data?.membersByRole).toStrictEqual({
        owner: 1,
        admin: 1,
        member: 3,
      });
    });

    test('should handle errors in organization statistics', async () => {
      // Mock getOrganizationMembersAction to fail
      vi.mocked(auth.api.getFullOrganization).mockRejectedValue(new Error('Failed to get members'));

      const result = await getOrganizationStatisticsAction('org-123');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Failed to get organization statistics');
    });

    test('should handle missing organization in statistics', async () => {
      // Mock empty organization response
      vi.mocked(auth.api.getFullOrganization).mockResolvedValue({});

      const result = await getOrganizationStatisticsAction('org-123');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Failed to get organization statistics');
    });

    test('should calculate statistics with banned users correctly', async () => {
      // Mock getFullOrganization with mixed user data
      vi.mocked(auth.api.getFullOrganization).mockResolvedValue({
        organization: { id: 'org-123', name: 'Test Organization' },
        members: [
          { role: 'admin', user: { banned: false } },
          { role: 'member', user: { banned: true } },
          { role: 'owner' }, // No user object
        ],
      });

      // Mock listInvitations
      vi.mocked(auth.api.listInvitations).mockResolvedValue([
        { status: 'pending' },
        { status: 'accepted' },
      ]);

      const result = await getOrganizationStatisticsAction('org-123');

      expect(result.success).toBeTruthy();
      expect(result.data?.totalMembers).toBe(3);
      expect(result.data?.activeMembers).toBe(1); // Only non-banned with user object
      expect(result.data?.pendingInvitations).toBe(1);
      expect(result.data?.membersByRole).toStrictEqual({
        admin: 1,
        member: 1,
        owner: 1,
      });
    });
  });

  describe('additional coverage tests', () => {
    test('should handle non-Error exceptions in various functions', async () => {
      // Test createOrganizationAction with string error
      vi.mocked(auth.api.createOrganization).mockRejectedValue('String error');
      const createResult = await createOrganizationAction({ name: 'Test' });
      expect(createResult.success).toBeFalsy();

      // Test updateOrganizationAction with string error
      vi.mocked(auth.api.updateOrganization).mockRejectedValue('String error');
      const updateResult = await updateOrganizationAction({
        organizationId: 'org-123',
        name: 'Test',
      });
      expect(updateResult.success).toBeFalsy();

      // Test deleteOrganizationAction with string error
      vi.mocked(auth.api.deleteOrganization).mockRejectedValue('String error');
      const deleteResult = await deleteOrganizationAction('org-123');
      expect(deleteResult.success).toBeFalsy();
    });

    test('should handle updateOrganization with all fields', async () => {
      const mockOrg = createMockOrganization();
      vi.mocked(auth.api.updateOrganization).mockResolvedValue(mockOrg);

      await updateOrganizationAction({
        organizationId: 'org-123',
        name: 'Updated Name',
        slug: 'updated-slug',
        description: 'Updated description',
      });

      expect(vi.mocked(auth.api.updateOrganization)).toHaveBeenCalledWith({
        body: {
          organizationId: 'org-123',
          data: {
            name: 'Updated Name',
            slug: 'updated-slug',
            metadata: { description: 'Updated description' },
          },
        },
        headers: expect.any(Headers),
      });
    });

    test('should handle undefined description in updateOrganization', async () => {
      const mockOrg = createMockOrganization();
      vi.mocked(auth.api.updateOrganization).mockResolvedValue(mockOrg);

      await updateOrganizationAction({
        organizationId: 'org-123',
        name: 'Updated Name',
        description: undefined,
      });

      expect(vi.mocked(auth.api.updateOrganization)).toHaveBeenCalledWith({
        body: {
          organizationId: 'org-123',
          data: {
            name: 'Updated Name',
            metadata: { description: undefined },
          },
        },
        headers: expect.any(Headers),
      });
    });

    test('should handle inviteUserAction with all optional fields', async () => {
      const mockInvitation = { id: 'inv-123', email: 'test@example.com' };
      vi.mocked(auth.api.inviteUser).mockResolvedValue(mockInvitation);

      const result = await inviteUserAction({
        email: 'test@example.com',
        organizationId: 'org-123',
        role: 'admin',
        teamId: 'team-123',
        message: 'Welcome to our team!',
      });

      expect(result.success).toBeTruthy();
      expect(vi.mocked(auth.api.inviteUser)).toHaveBeenCalledWith({
        body: {
          email: 'test@example.com',
          organizationId: 'org-123',
          role: 'admin',
          teamId: 'team-123',
          message: 'Welcome to our team!',
        },
        headers: expect.any(Headers),
      });
    });

    test('should handle acceptInvitation with missing invitation data', async () => {
      vi.mocked(auth.api.acceptInvitation).mockResolvedValue(null);

      const result = await acceptInvitationAction('inv-123');

      expect(result.success).toBeTruthy();
      expect(result.organizationId).toBeUndefined();
    });
  });

  describe('bulk operations', () => {
    test('should handle bulkInviteUsersAction with mixed results', async () => {
      // Mock the inviteUserAction function by creating a module mock
      const { bulkInviteUsersAction } = await import(
        '../../../src/server/organizations/management'
      );

      // Use Promise.allSettled mock
      const originalPromiseAllSettled = Promise.allSettled;
      vi.spyOn(Promise, 'allSettled').mockResolvedValue([
        { status: 'fulfilled', value: { success: true, invitation: { id: 'inv-1' } } },
        { status: 'fulfilled', value: { success: false, error: 'Email already invited' } },
        { status: 'rejected', reason: { message: 'Network error' } },
      ] as any);

      const result = await bulkInviteUsersAction({
        emails: ['success@example.com', 'failed@example.com', 'error@example.com'],
        organizationId: 'org-123',
        role: 'member',
      });

      expect(result.success).toBeTruthy(); // At least one succeeded
      expect(result.results).toHaveLength(3);

      // Restore original
      Promise.allSettled = originalPromiseAllSettled;
    });

    test('should handle bulkRemoveMembersAction', async () => {
      const { bulkRemoveMembersAction } = await import(
        '../../../src/server/organizations/management'
      );

      vi.spyOn(Promise, 'allSettled').mockResolvedValue([
        { status: 'fulfilled', value: { success: true } },
        { status: 'rejected', reason: { message: 'Remove failed' } },
      ] as any);

      const result = await bulkRemoveMembersAction({
        userIds: ['user-1', 'user-2'],
        organizationId: 'org-123',
      });

      expect(result.success).toBeTruthy();
      expect(result.results).toHaveLength(2);
    });

    test('should handle bulkUpdateMemberRolesAction', async () => {
      const { bulkUpdateMemberRolesAction } = await import(
        '../../../src/server/organizations/management'
      );

      vi.spyOn(Promise, 'allSettled').mockResolvedValue([
        { status: 'fulfilled', value: { success: true } },
        { status: 'rejected', reason: { message: 'Update failed' } },
      ] as any);

      const result = await bulkUpdateMemberRolesAction({
        updates: [
          { userId: 'user-1', role: 'admin' },
          { userId: 'user-2', role: 'member' },
        ],
        organizationId: 'org-123',
      });

      expect(result.success).toBeTruthy();
      expect(result.results).toHaveLength(2);
    });
  });

  describe('remaining organization actions', () => {
    test('should handle setActiveOrganizationAction', async () => {
      const { setActiveOrganizationAction } = await import(
        '../../../src/server/organizations/management'
      );

      vi.mocked(auth.api.setActiveOrganization).mockResolvedValue(undefined);

      const result = await setActiveOrganizationAction('org-123');

      expect(result.success).toBeTruthy();
      expect(vi.mocked(auth.api.setActiveOrganization)).toHaveBeenCalledWith({
        body: { organizationId: 'org-123' },
        headers: expect.any(Headers),
      });
    });

    test('should handle getFullOrganizationAction without organizationId', async () => {
      const { getFullOrganizationAction } = await import(
        '../../../src/server/organizations/management'
      );

      const orgData = { id: 'org-123', name: 'Test Org' };
      vi.mocked(auth.api.getFullOrganization).mockResolvedValue(orgData);

      const result = await getFullOrganizationAction();

      expect(result.success).toBeTruthy();
      expect(result.organization).toStrictEqual(orgData);
      expect(vi.mocked(auth.api.getFullOrganization)).toHaveBeenCalledWith({
        query: {},
        headers: expect.any(Headers),
      });
    });

    test('should handle getFullOrganizationAction with organizationId', async () => {
      const { getFullOrganizationAction } = await import(
        '../../../src/server/organizations/management'
      );

      const orgData = { id: 'org-123', name: 'Test Org' };
      vi.mocked(auth.api.getFullOrganization).mockResolvedValue(orgData);

      const result = await getFullOrganizationAction('org-123');

      expect(result.success).toBeTruthy();
      expect(result.organization).toStrictEqual(orgData);
      expect(vi.mocked(auth.api.getFullOrganization)).toHaveBeenCalledWith({
        query: { organizationId: 'org-123' },
        headers: expect.any(Headers),
      });
    });

    test('should handle addMemberAction with teamId', async () => {
      const { addMemberAction } = await import('../../../src/server/organizations/management');

      vi.mocked(auth.api.addMember).mockResolvedValue(undefined);

      const result = await addMemberAction({
        userId: 'user-123',
        organizationId: 'org-123',
        role: ['admin', 'member'],
        teamId: 'team-123',
      });

      expect(result.success).toBeTruthy();
      expect(vi.mocked(auth.api.addMember)).toHaveBeenCalledWith({
        body: {
          userId: 'user-123',
          organizationId: 'org-123',
          role: ['admin', 'member'],
          teamId: 'team-123',
        },
        headers: expect.any(Headers),
      });
    });

    test('should handle listInvitationsAction with organizationId', async () => {
      const { listInvitationsAction } = await import(
        '../../../src/server/organizations/management'
      );

      const invitations = [{ id: 'inv-1' }];
      vi.mocked(auth.api.listInvitations).mockResolvedValue(invitations);

      const result = await listInvitationsAction('org-123');

      expect(result.success).toBeTruthy();
      expect(result.invitations).toStrictEqual(invitations);
      expect(vi.mocked(auth.api.listInvitations)).toHaveBeenCalledWith({
        query: { organizationId: 'org-123' },
        headers: expect.any(Headers),
      });
    });

    test('should handle listInvitationsAction with single invitation', async () => {
      const { listInvitationsAction } = await import(
        '../../../src/server/organizations/management'
      );

      const invitation = { id: 'inv-1' };
      vi.mocked(auth.api.listInvitations).mockResolvedValue(invitation);

      const result = await listInvitationsAction();

      expect(result.success).toBeTruthy();
      expect(result.invitations).toStrictEqual([invitation]);
    });

    test('should handle getOrganizationMembersAction with missing members', async () => {
      const { getOrganizationMembersAction } = await import(
        '../../../src/server/organizations/management'
      );

      const orgData = { organization: { id: 'org-123' } };
      vi.mocked(auth.api.getFullOrganization).mockResolvedValue(orgData);

      const result = await getOrganizationMembersAction('org-123');

      expect(result.success).toBeTruthy();
      expect(result.members).toStrictEqual([]);
    });
  });

  describe('backward compatibility', () => {
    test('should export alias functions', async () => {
      const managementModule = await import('../../../src/server/organizations/management');

      expect(managementModule.inviteMember).toBe(managementModule.inviteUserAction);
      expect(managementModule.revokeInvitation).toBe(managementModule.cancelInvitationAction);
    });
  });
});
