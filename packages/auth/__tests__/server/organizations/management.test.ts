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

vi.mock('../../../server/auth', () => ({
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
vi.mock('../permissions', () => ({
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
    it('should create a new organization successfully', async () => {
      const mockOrg = createMockOrganization();

      mockCreateOrganization.mockResolvedValue({
        organization: mockOrg,
        success: true,
      });

      const result = await createOrganization({
        name: 'New Organization',
        slug: 'new-org',
      });

      expect(result.success).toBe(true);
      expect(result.organization).toEqual(mockOrg);
      expect(mockCreateOrganization).toHaveBeenCalledWith({
        body: {
          name: 'New Organization',
          description: undefined,
          slug: 'new-org',
        },
        headers: expect.any(Object),
      });
    });

    it('should auto-generate slug if not provided', async () => {
      const mockOrg = createMockOrganization({ slug: 'new-organization' });

      mockCreateOrganization.mockResolvedValue({
        organization: mockOrg,
        success: true,
      });

      const result = await createOrganization({
        name: 'New Organization',
      });

      expect(result.success).toBe(true);
      expect(mockCreateOrganization).toHaveBeenCalledWith({
        body: {
          name: 'New Organization',
          description: undefined,
          slug: undefined,
        },
        headers: expect.any(Object),
      });
    });

    it('should handle special characters in organization name', async () => {
      mockCreateOrganization.mockResolvedValue({
        organization: createMockOrganization(),
        success: true,
      });

      const result = await createOrganization({
        name: 'Test & Co. Ltd!',
      });

      expect(result.success).toBe(true);
      expect(mockCreateOrganization).toHaveBeenCalledWith({
        body: {
          name: 'Test & Co. Ltd!',
          description: undefined,
          slug: undefined,
        },
        headers: expect.any(Object),
      });
    });

    it('should handle creation errors', async () => {
      mockCreateOrganization.mockResolvedValue({
        error: { message: 'Organization already exists' },
        success: false,
      });

      const result = await createOrganization({ name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Organization already exists');
    });
  });

  describe('updateOrganization', () => {
    it('should update organization successfully', async () => {
      const mockOrg = createMockOrganization({
        name: 'Updated Organization',
      });

      mockUpdateOrganization.mockResolvedValue({
        organization: mockOrg,
        success: true,
      });

      const result = await updateOrganization({
        name: 'Updated Organization',
        organizationId: 'org-123',
      });

      expect(result.success).toBe(true);
      expect(result.organization).toEqual(mockOrg);
      expect(mockUpdateOrganization).toHaveBeenCalledWith({
        body: {
          name: 'Updated Organization',
          organizationId: 'org-123',
        },
        headers: expect.any(Object),
      });
    });

    it('should allow partial updates', async () => {
      const mockOrg = createMockOrganization();
      mockUpdateOrganization.mockResolvedValue({
        organization: mockOrg,
        success: true,
      });

      const result = await updateOrganization({
        name: 'New Name Only',
        organizationId: 'org-123',
      });

      expect(result.success).toBe(true);
      expect(mockUpdateOrganization).toHaveBeenCalledWith({
        body: {
          name: 'New Name Only',
          organizationId: 'org-123',
        },
        headers: expect.any(Object),
      });
    });

    it('should update slug when provided', async () => {
      const mockOrg = createMockOrganization();
      mockUpdateOrganization.mockResolvedValue({
        organization: mockOrg,
        success: true,
      });

      const result = await updateOrganization({
        organizationId: 'org-123',
        slug: 'new-slug',
      });

      expect(result.success).toBe(true);
      expect(mockUpdateOrganization).toHaveBeenCalledWith({
        body: {
          organizationId: 'org-123',
          slug: 'new-slug',
        },
        headers: expect.any(Object),
      });
    });
  });

  describe('deleteOrganization', () => {
    it('should delete organization successfully', async () => {
      mockDeleteOrganization.mockResolvedValue({
        success: true,
      });

      const result = await deleteOrganization('org-123');

      expect(result.success).toBe(true);
      expect(mockDeleteOrganization).toHaveBeenCalledWith({
        body: {
          organizationId: 'org-123',
        },
        headers: expect.any(Object),
      });
    });

    it('should handle deletion errors', async () => {
      mockDeleteOrganization.mockResolvedValue({
        error: { message: 'Deletion failed' },
        success: false,
      });

      const result = await deleteOrganization('org-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Deletion failed');
    });
  });

  describe('Member Management', () => {
    describe('inviteMember', () => {
      it('should create invitation successfully', async () => {
        const mockInvitation = {
          id: 'invite-123',
          email: 'newuser@example.com',
          expiresAt: new Date('2024-01-01'),
          invitedBy: 'user-123',
          organizationId: 'org-123',
          role: 'member',
          status: 'pending',
        };

        mockInviteUser.mockResolvedValue({
          invitation: mockInvitation,
          success: true,
        });

        const result = await inviteMember({
          email: 'newuser@example.com',
          organizationId: 'org-123',
          role: 'member',
        });

        expect(result.success).toBe(true);
        expect(result.invitation).toEqual(mockInvitation);
        expect(mockInviteUser).toHaveBeenCalledWith({
          body: {
            email: 'newuser@example.com',
            organizationId: 'org-123',
            role: 'member',
          },
          headers: expect.any(Object),
        });
      });

      it('should handle invitation errors', async () => {
        mockInviteUser.mockResolvedValue({
          error: { message: 'User already invited' },
          success: false,
        });

        const result = await inviteMember({
          email: 'test@example.com',
          organizationId: 'org-123',
          role: 'member',
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('User already invited');
      });
    });

    describe('removeMember', () => {
      it('should remove member successfully', async () => {
        mockRemoveMember.mockResolvedValue({
          success: true,
        });

        const result = await removeMember({ organizationId: 'org-123', userId: 'user-456' });

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

        const result = await removeMember({ organizationId: 'org-123', userId: 'user-456' });

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

        const result = await updateMemberRole({
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

        const result = await updateMemberRole({
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

        const result = await acceptInvitation('invite-123');

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

        const result = await acceptInvitation('invite-123');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invitation has expired');
      });
    });

    describe('declineInvitation', () => {
      it('should decline invitation', async () => {
        mockDeclineInvitation.mockResolvedValue({
          success: true,
        });

        const result = await declineInvitation('invite-123');

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

        const result = await revokeInvitation('invite-123');

        expect(result.success).toBe(true);
        expect(mockCancelInvitation).toHaveBeenCalledWith({
          body: {
            invitationId: 'invite-123',
          },
          headers: expect.any(Object),
        });
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

      const result = await getOrganizationStats('org-123');

      expect(result).not.toBeNull();
      expect(result!.memberCount).toBe(10);
      expect(result!.teamCount).toBe(5);
      expect(result!.apiKeyCount).toBe(2);
      expect(result!.invitationCount).toBe(3);

      expect(mockPrisma.member.count).toHaveBeenCalledWith({
        where: { organizationId: 'org-123' },
      });

      expect(mockPrisma.team.count).toHaveBeenCalledWith({
        where: { organizationId: 'org-123' },
      });

      expect(mockPrisma.apiKey.count).toHaveBeenCalledWith({
        where: { organizationId: 'org-123' },
      });

      expect(mockPrisma.invitation.count).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-123',
          status: 'pending',
        },
      });
    });
  });
});
