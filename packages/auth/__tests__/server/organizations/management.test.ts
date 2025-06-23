import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Organization } from '../../../src/shared/types';

// Use vi.hoisted for mocks
const { mockCount, mockCreate, mockDelete, mockFindFirst, mockFindMany, mockPrisma, mockUpdate } =
  vi.hoisted(() => {
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

// Mock auth
const {
  mockAcceptInvitation,
  mockAddMember,
  mockCancelInvitation,
  mockCreateOrganization,
  mockDeclineInvitation,
  mockDeleteOrganization,
  mockGetSession,
  mockInviteUser,
  mockRemoveMember,
  mockUpdateMemberRole,
  mockUpdateOrganization,
} = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockCreateOrganization = vi.fn();
  const mockUpdateOrganization = vi.fn();
  const mockDeleteOrganization = vi.fn();
  const mockAddMember = vi.fn();
  const mockRemoveMember = vi.fn();
  const mockUpdateMemberRole = vi.fn();
  const mockInviteUser = vi.fn();
  const mockAcceptInvitation = vi.fn();
  const mockDeclineInvitation = vi.fn();
  const mockCancelInvitation = vi.fn();

  return {
    mockAcceptInvitation,
    mockAddMember,
    mockCancelInvitation,
    mockCreateOrganization,
    mockDeclineInvitation,
    mockDeleteOrganization,
    mockGetSession,
    mockInviteUser,
    mockRemoveMember,
    mockUpdateMemberRole,
    mockUpdateOrganization,
  };
});

vi.mock('../../../src/shared/auth.config', () => ({
  auth: {
    api: {
      acceptInvitation: mockAcceptInvitation,
      addMember: mockAddMember,
      cancelInvitation: mockCancelInvitation,
      createOrganization: mockCreateOrganization,
      declineInvitation: mockDeclineInvitation,
      deleteOrganization: mockDeleteOrganization,
      getSession: mockGetSession,
      inviteUser: mockInviteUser,
      removeMember: mockRemoveMember,
      updateMemberRole: mockUpdateMemberRole,
      updateOrganization: mockUpdateOrganization,
    },
  },
}));

// Mock headers function
const { mockHeaders } = vi.hoisted(() => {
  const mockHeaders = vi.fn().mockResolvedValue(new Headers());
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

// Import after mocking
import {
  createOrganizationAction,
  updateOrganizationAction,
  deleteOrganizationAction,
  inviteUserAction,
  acceptInvitationAction,
  declineInvitationAction,
  cancelInvitationAction,
  addMemberAction,
  removeMemberAction,
  updateMemberRoleAction,
  getOrganizationStatisticsAction,
} from '../../../src/server/organizations/management';

describe('Organization Management', () => {
  const mockHeaders = { authorization: 'Bearer test-token' };

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
    mockGetSession.mockResolvedValue(createMockSession());

    // Set up default auth API responses
    mockUpdateMemberRole.mockResolvedValue({
      success: true,
    });

    mockAcceptInvitation.mockResolvedValue({
      organizationId: 'org-123',
      success: true,
    });
  });

  describe('createOrganization', () => {
    it('should create organization successfully', async () => {
      const mockOrg = createMockOrganization();
      mockCreateOrganization.mockResolvedValue(mockOrg);

      const result = await createOrganizationAction({
        name: 'Test Organization',
        description: 'Test Description',
      });

      expect(result.success).toBe(true);
      expect(result.organization).toEqual(mockOrg);
      expect(mockCreateOrganization).toHaveBeenCalledWith({
        body: {
          name: 'Test Organization',
          slug: 'test-organization',
          metadata: { description: 'Test Description' },
        },
        headers: expect.any(Object),
      });
    });

    it('should handle organization creation errors', async () => {
      mockCreateOrganization.mockRejectedValue(new Error('Creation failed'));

      const result = await createOrganizationAction({
        name: 'Test Organization',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create organization');
    });

    it('should generate slug from name if not provided', async () => {
      const mockOrg = createMockOrganization();
      mockCreateOrganization.mockResolvedValue(mockOrg);

      await createOrganizationAction({
        name: 'My Test Organization',
      });

      expect(mockCreateOrganization).toHaveBeenCalledWith({
        body: {
          name: 'My Test Organization',
          slug: 'my-test-organization',
          metadata: {},
        },
        headers: expect.any(Object),
      });
    });

    it('should use provided slug if available', async () => {
      const mockOrg = createMockOrganization();
      mockCreateOrganization.mockResolvedValue(mockOrg);

      await createOrganizationAction({
        name: 'Test Organization',
        slug: 'custom-slug',
      });

      expect(mockCreateOrganization).toHaveBeenCalledWith({
        body: {
          name: 'Test Organization',
          slug: 'custom-slug',
          metadata: {},
        },
        headers: expect.any(Object),
      });
    });
  });

  describe('updateOrganization', () => {
    it('should update organization successfully', async () => {
      const mockOrg = createMockOrganization({ name: 'Updated Organization' });
      mockUpdateOrganization.mockResolvedValue(mockOrg);

      const result = await updateOrganizationAction({
        organizationId: 'org-123',
        name: 'Updated Organization',
        description: 'Updated Description',
      });

      expect(result.success).toBe(true);
      expect(result.organization).toEqual(mockOrg);
      expect(mockUpdateOrganization).toHaveBeenCalledWith({
        body: {
          name: 'Updated Organization',
          metadata: { description: 'Updated Description' },
        },
        headers: expect.any(Object),
      });
    });

    it('should handle organization update errors', async () => {
      mockUpdateOrganization.mockRejectedValue(new Error('Update failed'));

      const result = await updateOrganizationAction({
        organizationId: 'org-123',
        name: 'Updated Organization',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update organization');
    });

    it('should update only provided fields', async () => {
      const mockOrg = createMockOrganization();
      mockUpdateOrganization.mockResolvedValue(mockOrg);

      await updateOrganizationAction({
        organizationId: 'org-123',
        name: 'Updated Name',
      });

      expect(mockUpdateOrganization).toHaveBeenCalledWith({
        body: {
          name: 'Updated Name',
        },
        headers: expect.any(Object),
      });
    });
  });

  describe('deleteOrganization', () => {
    it('should delete organization successfully', async () => {
      mockDeleteOrganization.mockResolvedValue({ success: true });

      const result = await deleteOrganizationAction('org-123');

      expect(result.success).toBe(true);
      expect(mockDeleteOrganization).toHaveBeenCalledWith({
        body: { organizationId: 'org-123' },
        headers: expect.any(Object),
      });
    });

    it('should handle organization deletion errors', async () => {
      mockDeleteOrganization.mockRejectedValue(new Error('Deletion failed'));

      const result = await deleteOrganizationAction('org-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete organization');
    });
  });

  describe('Member Management', () => {
    describe('inviteMember', () => {
      it('should invite member successfully', async () => {
        const mockInvitation = { id: 'inv-123', email: 'test@example.com' };
        mockInviteUser.mockResolvedValue(mockInvitation);

        const result = await inviteUserAction({
          email: 'test@example.com',
          organizationId: 'org-123',
          role: 'member',
        });

        expect(result.success).toBe(true);
        expect(result.invitation).toEqual(mockInvitation);
        expect(mockInviteUser).toHaveBeenCalledWith({
          body: {
            email: 'test@example.com',
            organizationId: 'org-123',
            role: 'member',
          },
          headers: expect.any(Object),
        });
      });
    });

    describe('removeMember', () => {
      it('should remove member successfully', async () => {
        mockRemoveMember.mockResolvedValue({
          success: true,
        });

        const result = await removeMemberAction({ organizationId: 'org-123', userId: 'user-456' });

        expect(result.success).toBe(true);
        expect(mockRemoveMember).toHaveBeenCalledWith({
          body: {
            organizationId: 'org-123',
            userId: 'user-456',
          },
        });
      });

      it('should handle removal errors', async () => {
        mockRemoveMember.mockResolvedValue({
          error: { message: 'Cannot remove the last owner' },
          success: false,
        });

        const result = await removeMemberAction({ organizationId: 'org-123', userId: 'user-456' });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Cannot remove the last owner');
      });
    });

    describe('updateMemberRole', () => {
      it('should update member role successfully', async () => {
        const mockUpdatedMember = {
          id: 'member-123',
          organizationId: 'org-123',
          role: 'admin',
          userId: 'user-456',
        };

        mockUpdateMemberRole.mockResolvedValue({
          member: mockUpdatedMember,
          success: true,
        });

        const result = await updateMemberRoleAction({
          organizationId: 'org-123',
          role: 'admin',
          userId: 'user-456',
        });

        expect(result.success).toBe(true);
        expect(mockUpdateMemberRole).toHaveBeenCalledWith({
          body: {
            organizationId: 'org-123',
            role: 'admin',
            userId: 'user-456',
          },
        });
      });

      it('should handle role update errors', async () => {
        mockUpdateMemberRole.mockResolvedValue({
          error: { message: 'Cannot change role of the last owner' },
          success: false,
        });

        const result = await updateMemberRoleAction({
          organizationId: 'org-123',
          role: 'member',
          userId: 'user-456',
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Cannot change role of the last owner');
      });
    });
  });

  describe('Invitation Management', () => {
    describe('acceptInvitation', () => {
      it('should accept invitation and create membership', async () => {
        const mockMember = {
          id: 'member-new',
          organizationId: 'org-123',
          role: 'member',
          userId: 'user-123',
        };

        mockAcceptInvitation.mockResolvedValue({
          organizationId: 'org-123',
          success: true,
        });

        const result = await acceptInvitationAction('invite-123');

        expect(result.success).toBe(true);
        expect(result.organizationId).toBe('org-123');
        expect(mockAcceptInvitation).toHaveBeenCalledWith({
          body: {
            invitationId: 'invite-123',
          },
          headers: expect.any(Object),
        });
      });

      it('should handle invitation errors', async () => {
        mockAcceptInvitation.mockResolvedValue({
          error: { message: 'Invitation has expired' },
          success: false,
        });

        const result = await acceptInvitationAction('invite-123');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invitation has expired');
      });
    });

    describe('declineInvitation', () => {
      it('should decline invitation', async () => {
        mockDeclineInvitation.mockResolvedValue({
          success: true,
        });

        const result = await declineInvitationAction('invite-123');

        expect(result.success).toBe(true);
        expect(mockDeclineInvitation).toHaveBeenCalledWith({
          body: {
            invitationId: 'invite-123',
          },
          headers: expect.any(Object),
        });
      });
    });

    describe('revokeInvitation', () => {
      it('should revoke invitation', async () => {
        mockCancelInvitation.mockResolvedValue({
          success: true,
        });

        const result = await cancelInvitationAction('invite-123');

        expect(result.success).toBe(true);
        expect(mockCancelInvitation).toHaveBeenCalledWith({
          body: { invitationId: 'invite-123' },
          headers: expect.any(Object),
        });
      });

      it('should handle invitation revocation errors', async () => {
        mockCancelInvitation.mockRejectedValue(new Error('Revocation failed'));

        const result = await cancelInvitationAction('invite-123');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to cancel invitation');
      });
    });
  });

  describe('getOrganizationStats', () => {
    it('should return organization statistics', async () => {
      // Set up auth session mock
      mockGetSession.mockResolvedValue({
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

      // Mock membership check (user has access to organization)
      mockPrisma.member.findFirst.mockResolvedValue({
        id: 'member-123',
        createdAt: new Date(),
        organizationId: 'org-123',
        role: 'admin',
        updatedAt: new Date(),
        userId: 'user-123',
      });

      // Mock database counts
      mockPrisma.member.count.mockResolvedValue(10);
      mockPrisma.invitation.count.mockResolvedValue(3);
      mockPrisma.team.count.mockResolvedValue(5);
      mockPrisma.apiKey.count.mockResolvedValue(2);

      const result = await getOrganizationStatisticsAction('org-123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.totalMembers).toBe(10);
      expect(result.data?.teams).toBe(3);
      expect(result.data?.pendingInvitations).toBe(2);
    });
  });
});
