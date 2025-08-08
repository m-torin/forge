import { createMockAuthOrganization, createMockAuthSession } from '@repo/qa';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { applySmartAuthBehavior, mockBetterAuthApi, setupAllMocks } from '../../test-helpers/mocks';
import { createServerActionTestSuite } from '../../test-helpers/server-action-builder';

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
} from '../../src/server/organizations/management';

// Set up all mocks
setupAllMocks();

// Mock permissions
vi.mock('../../../src/server/organizations/permissions', () => ({
  canDeleteOrganization: vi.fn().mockResolvedValue(true),
  canInviteMembers: vi.fn().mockResolvedValue(true),
  canManageOrganization: vi.fn().mockResolvedValue(true),
  canRemoveMembers: vi.fn().mockResolvedValue(true),
  canUpdateMemberRoles: vi.fn().mockResolvedValue(true),
}));

describe('organization Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default session
    vi.mocked(mockBetterAuthApi.getSession).mockResolvedValue(createMockAuthSession());

    // Set up default auth API responses
    vi.mocked(mockBetterAuthApi.updateMemberRole).mockResolvedValue({
      success: true,
    });

    vi.mocked(mockBetterAuthApi.acceptInvitation).mockResolvedValue({
      organizationId: 'org-123',
      success: true,
    });

    // Re-apply smart auth behavior after clearing mocks
    applySmartAuthBehavior();
  });

  describe('createOrganization', () => {
    test('should create organization successfully', async () => {
      const mockOrg = createMockAuthOrganization();
      vi.mocked(mockBetterAuthApi.createOrganization).mockResolvedValue(mockOrg);

      const result = await createOrganizationAction({
        name: 'Test Organization',
        description: 'Test Description',
      });

      expect(result.success).toBeTruthy();
      expect(result.organization).toStrictEqual(mockOrg);
      expect(vi.mocked(mockBetterAuthApi.createOrganization)).toHaveBeenCalledWith({
        body: {
          name: 'Test Organization',
          slug: 'test-organization',
          metadata: { description: 'Test Description' },
        },
        headers: expect.any(Headers),
      });
    });

    test('should handle organization creation errors', async () => {
      vi.mocked(mockBetterAuthApi.createOrganization).mockRejectedValue(
        new Error('Creation failed'),
      );

      const result = await createOrganizationAction({
        name: 'Test Organization',
      });

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Failed to create organization');
    });

    test('should generate slug from name if not provided', async () => {
      const mockOrg = createMockAuthOrganization();
      vi.mocked(mockBetterAuthApi.createOrganization).mockResolvedValue(mockOrg);

      await createOrganizationAction({
        name: 'My Test Organization',
      });

      expect(vi.mocked(mockBetterAuthApi.createOrganization)).toHaveBeenCalledWith({
        body: {
          name: 'My Test Organization',
          slug: 'my-test-organization',
          metadata: {},
        },
        headers: expect.any(Headers),
      });
    });

    test('should use provided slug if available', async () => {
      const mockOrg = createMockAuthOrganization();
      vi.mocked(mockBetterAuthApi.createOrganization).mockResolvedValue(mockOrg);

      await createOrganizationAction({
        name: 'Test Organization',
        slug: 'custom-slug',
      });

      expect(vi.mocked(mockBetterAuthApi.createOrganization)).toHaveBeenCalledWith({
        body: {
          name: 'Test Organization',
          slug: 'custom-slug',
          metadata: {},
        },
        headers: expect.any(Headers),
      });
    });
  });

  // Use DRY server action test suite for updateOrganization
  createServerActionTestSuite({
    actionName: 'Update Organization',
    actionFn: updateOrganizationAction,
    successArgs: [
      {
        organizationId: 'org-123',
        name: 'Updated Organization',
        description: 'Updated Description',
      },
    ],
    expectedResult: { success: true, organization: expect.any(Object) },
    setup: () => {
      vi.mocked(mockBetterAuthApi.updateOrganization).mockResolvedValue(
        createMockAuthOrganization(),
      );
    },
    customTests: [
      {
        name: 'should update only provided fields',
        test: async () => {
          const mockOrg = createMockAuthOrganization();
          vi.mocked(mockBetterAuthApi.updateOrganization).mockResolvedValue(mockOrg);

          await updateOrganizationAction({
            organizationId: 'org-123',
            name: 'Updated Name',
          });

          expect(vi.mocked(mockBetterAuthApi.updateOrganization)).toHaveBeenCalledWith({
            body: {
              organizationId: 'org-123',
              data: {
                name: 'Updated Name',
              },
            },
            headers: expect.any(Headers),
          });
        },
      },
    ],
  });

  // Use DRY server action test suite for deleteOrganization
  createServerActionTestSuite({
    actionName: 'Delete Organization',
    actionFn: deleteOrganizationAction,
    successArgs: ['org-123'],
    expectedResult: { success: true },
    setup: () => {
      vi.mocked(mockBetterAuthApi.deleteOrganization).mockResolvedValue({ success: true });
    },
  });

  // Use DRY server action test suite for inviteUser
  createServerActionTestSuite({
    actionName: 'Invite User',
    actionFn: inviteUserAction,
    successArgs: [
      {
        email: 'test@example.com',
        organizationId: 'org-123',
        role: 'member',
      },
    ],
    expectedResult: { success: true, invitation: expect.any(Object) },
    setup: () => {
      vi.mocked(mockBetterAuthApi.inviteUser).mockResolvedValue({
        id: 'inv-123',
        email: 'test@example.com',
      });
    },
  });

  // Use DRY server action test suite for removeMember
  createServerActionTestSuite({
    actionName: 'Remove Member',
    actionFn: removeMemberAction,
    successArgs: [{ organizationId: 'org-123', userId: 'user-456' }],
    expectedResult: { success: true },
    setup: () => {
      vi.mocked(mockBetterAuthApi.removeMember).mockResolvedValue({ success: true });
    },
  });

  // Use DRY server action test suite for updateMemberRole
  createServerActionTestSuite({
    actionName: 'Update Member Role',
    actionFn: updateMemberRoleAction,
    successArgs: [
      {
        organizationId: 'org-123',
        role: 'admin',
        userId: 'user-456',
      },
    ],
    expectedResult: { success: true },
    setup: () => {
      vi.mocked(mockBetterAuthApi.updateMemberRole).mockResolvedValue({
        member: {
          id: 'member-123',
          organizationId: 'org-123',
          role: 'admin',
          userId: 'user-456',
        },
        success: true,
      });
    },
  });

  // Use DRY server action test suite for acceptInvitation
  createServerActionTestSuite({
    actionName: 'Accept Invitation',
    actionFn: acceptInvitationAction,
    successArgs: ['invite-123'],
    expectedResult: { success: true },
    setup: () => {
      vi.mocked(mockBetterAuthApi.acceptInvitation).mockResolvedValue({
        invitation: {
          organizationId: 'org-123',
        },
      });
    },
  });

  // Use DRY server action test suite for cancelInvitation
  createServerActionTestSuite({
    actionName: 'Cancel Invitation',
    actionFn: cancelInvitationAction,
    successArgs: ['invite-123'],
    expectedResult: { success: true },
    setup: () => {
      vi.mocked(mockBetterAuthApi.cancelInvitation).mockResolvedValue({ success: true });
    },
  });

  // Use DRY server action test suite for declineInvitation
  createServerActionTestSuite({
    actionName: 'Decline Invitation',
    actionFn: declineInvitationAction,
    successArgs: ['invite-123'],
    expectedResult: { success: true },
    setup: () => {
      vi.mocked(mockBetterAuthApi.rejectInvitation).mockResolvedValue({ success: true });
    },
  });

  // Organization statistics tests
  describe('organization Statistics', () => {
    test('should return organization statistics', async () => {
      // Set up auth session mock
      vi.mocked(mockBetterAuthApi.getSession).mockResolvedValue({
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
      vi.mocked(mockBetterAuthApi.getFullOrganization).mockResolvedValue({
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
        ],
      });

      // Mock listInvitations for invitations
      vi.mocked(mockBetterAuthApi.listInvitations).mockResolvedValue([
        { id: 'inv-1', status: 'pending' },
        { id: 'inv-2', status: 'pending' },
        { id: 'inv-3', status: 'accepted' },
      ]);

      // Mock listTeams for teams count
      vi.mocked(mockBetterAuthApi.listTeams).mockResolvedValue({
        teams: [{ id: 'team-1' }, { id: 'team-2' }, { id: 'team-3' }],
      });

      const result = await getOrganizationStatisticsAction('org-123');

      expect(result.success).toBeTruthy();
      expect(result.data).toBeDefined();
      expect(result.data?.totalMembers).toBe(3);
      expect(result.data?.activeMembers).toBe(3);
      expect(result.data?.pendingInvitations).toBe(2);
      expect(result.data?.membersByRole).toStrictEqual({
        owner: 1,
        admin: 1,
        member: 1,
      });
    });

    test('should handle errors in organization statistics', async () => {
      // Mock getFullOrganization to fail
      vi.mocked(mockBetterAuthApi.getFullOrganization).mockRejectedValue(
        new Error('Failed to get members'),
      );

      const result = await getOrganizationStatisticsAction('org-123');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Failed to get organization members');
    });
  });
});
