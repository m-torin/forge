import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  acceptTeamInvitation,
  declineTeamInvitation,
  getTeamInvitations,
  getUserTeamInvitations,
  inviteTeamMember,
  resendTeamInvitation,
  revokeTeamInvitation,
} from '../../../server/teams/invitations';

import type { TeamInvitation } from '../../../shared/types';

// Mock database
vi.mock('@repo/database', () => ({
  database: {
    team: {
      findFirst: vi.fn(),
    },
    teamInvitation: {
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    teamMember: {
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
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
vi.mock('../permissions', () => ({
  canInviteTeamMembers: vi.fn().mockResolvedValue(true),
  canManageTeam: vi.fn().mockResolvedValue(true),
}));

// Mock email service
vi.mock('@repo/email', () => ({
  sendTeamInvitationEmail: vi.fn().mockResolvedValue(true),
}));

describe('Team Invitations', () => {
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
      name: 'Test User',
      email: 'test@example.com',
    },
  });

  const createMockInvitation = (overrides = {}): TeamInvitation => ({
    id: 'invite-123',
    createdAt: new Date('2023-12-01'),
    email: 'invited@example.com',
    expiresAt: new Date('2024-01-01'),
    invitedBy: 'user-123',
    role: 'member',
    status: 'pending',
    teamId: 'team-123',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('inviteTeamMember', () => {
    it('should create invitation successfully', async () => {
      const { database } = await import('@repo/database');
      const { sendTeamInvitationEmail } = await import('@repo/email');
      const mockSession = createMockSession();
      const mockInvitation = createMockInvitation();
      const mockTeam = {
        id: 'team-123',
        name: 'Test Team',
        organizationId: 'org-123',
      };

      mockGetSession.mockResolvedValue(mockSession);
      database.team.findFirst = vi.fn().mockResolvedValue(mockTeam);
      database.teamMember.findFirst = vi.fn().mockResolvedValue(null); // Not already a member
      database.teamInvitation.findFirst = vi.fn().mockResolvedValue(null); // No existing invitation
      database.teamInvitation.create = vi.fn().mockResolvedValue(mockInvitation);

      const result = await inviteTeamMember(mockHeaders, 'team-123', {
        email: 'invited@example.com',
        role: 'member',
      });

      expect(result).toEqual(mockInvitation);
      expect(database.teamInvitation.create).toHaveBeenCalledWith({
        data: {
          email: 'invited@example.com',
          expiresAt: expect.any(Date),
          invitedBy: 'user-123',
          role: 'member',
          status: 'pending',
          teamId: 'team-123',
        },
      });

      // Should send invitation email
      expect(sendTeamInvitationEmail).toHaveBeenCalledWith({
        invitationId: 'invite-123',
        inviterName: 'Test User',
        teamName: 'Test Team',
        to: 'invited@example.com',
      });
    });

    it('should set default expiration to 7 days', async () => {
      const { database } = await import('@repo/database');
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      database.team.findFirst = vi.fn().mockResolvedValue({ id: 'team-123' });
      database.teamMember.findFirst = vi.fn().mockResolvedValue(null);
      database.teamInvitation.findFirst = vi.fn().mockResolvedValue(null);

      database.teamInvitation.create = vi.fn().mockImplementation((args) => {
        const expiresAt = args.data.expiresAt;
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Check if expiration is approximately 7 days from now
        const diff = Math.abs(expiresAt.getTime() - sevenDaysFromNow.getTime());
        expect(diff).toBeLessThan(60 * 1000); // 1 minute tolerance

        return Promise.resolve(createMockInvitation());
      });

      await inviteTeamMember(mockHeaders, 'team-123', {
        email: 'test@example.com',
        role: 'member',
      });
    });

    it('should throw error if user is already a member', async () => {
      const { database } = await import('@repo/database');
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      database.team.findFirst = vi.fn().mockResolvedValue({ id: 'team-123' });
      database.teamMember.findFirst = vi.fn().mockResolvedValue({
        teamId: 'team-123',
        userId: 'existing-user',
      });

      await expect(
        inviteTeamMember(mockHeaders, 'team-123', {
          email: 'existing@example.com',
          role: 'member',
        }),
      ).rejects.toThrow('User is already a team member');
    });

    it('should throw error if invitation already exists', async () => {
      const { database } = await import('@repo/database');
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      database.team.findFirst = vi.fn().mockResolvedValue({ id: 'team-123' });
      database.teamMember.findFirst = vi.fn().mockResolvedValue(null);
      database.teamInvitation.findFirst = vi.fn().mockResolvedValue({
        email: 'invited@example.com',
        status: 'pending',
      });

      await expect(
        inviteTeamMember(mockHeaders, 'team-123', {
          email: 'invited@example.com',
          role: 'member',
        }),
      ).rejects.toThrow('Invitation already exists for this email');
    });
  });

  describe('acceptTeamInvitation', () => {
    it('should accept invitation and create membership', async () => {
      const { database } = await import('@repo/database');
      const mockSession = createMockSession();
      const mockInvitation = createMockInvitation();
      const mockMember = {
        id: 'member-new',
        role: 'member',
        teamId: 'team-123',
        userId: 'user-123',
      };

      mockGetSession.mockResolvedValue(mockSession);
      database.teamInvitation.findFirst = vi.fn().mockResolvedValue(mockInvitation);
      database.teamInvitation.update = vi.fn().mockResolvedValue({
        ...mockInvitation,
        status: 'accepted',
      });
      database.teamMember.create = vi.fn().mockResolvedValue(mockMember);

      const result = await acceptTeamInvitation(mockHeaders, 'invite-123');

      expect(result).toEqual(mockMember);

      // Should update invitation status
      expect(database.teamInvitation.update).toHaveBeenCalledWith({
        data: { status: 'accepted' },
        where: { id: 'invite-123' },
      });

      // Should create membership
      expect(database.teamMember.create).toHaveBeenCalledWith({
        data: {
          role: 'member',
          teamId: 'team-123',
          userId: 'user-123',
        },
      });
    });

    it('should reject expired invitations', async () => {
      const { database } = await import('@repo/database');
      const mockSession = createMockSession();
      const mockInvitation = createMockInvitation({
        expiresAt: new Date('2020-01-01'), // Expired
      });

      mockGetSession.mockResolvedValue(mockSession);
      database.teamInvitation.findFirst = vi.fn().mockResolvedValue(mockInvitation);

      await expect(acceptTeamInvitation(mockHeaders, 'invite-123')).rejects.toThrow(
        'Invitation has expired',
      );
    });

    it('should reject if email does not match', async () => {
      const { database } = await import('@repo/database');
      const mockSession = createMockSession();
      const mockInvitation = createMockInvitation({
        email: 'other@example.com',
      });

      mockGetSession.mockResolvedValue(mockSession);
      database.teamInvitation.findFirst = vi.fn().mockResolvedValue(mockInvitation);

      await expect(acceptTeamInvitation(mockHeaders, 'invite-123')).rejects.toThrow(
        'Invitation email does not match your account',
      );
    });

    it('should reject already accepted invitations', async () => {
      const { database } = await import('@repo/database');
      const mockSession = createMockSession();
      const mockInvitation = createMockInvitation({
        status: 'accepted',
      });

      mockGetSession.mockResolvedValue(mockSession);
      database.teamInvitation.findFirst = vi.fn().mockResolvedValue(mockInvitation);

      await expect(acceptTeamInvitation(mockHeaders, 'invite-123')).rejects.toThrow(
        'Invitation has already been accepted',
      );
    });
  });

  describe('declineTeamInvitation', () => {
    it('should decline invitation', async () => {
      const { database } = await import('@repo/database');
      const mockSession = createMockSession();
      const mockInvitation = createMockInvitation();

      mockGetSession.mockResolvedValue(mockSession);
      database.teamInvitation.findFirst = vi.fn().mockResolvedValue(mockInvitation);
      database.teamInvitation.update = vi.fn().mockResolvedValue({
        ...mockInvitation,
        status: 'declined',
      });

      await declineTeamInvitation(mockHeaders, 'invite-123');

      expect(database.teamInvitation.update).toHaveBeenCalledWith({
        data: { status: 'declined' },
        where: { id: 'invite-123' },
      });
    });

    it('should reject if invitation not found', async () => {
      const { database } = await import('@repo/database');
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      database.teamInvitation.findFirst = vi.fn().mockResolvedValue(null);

      await expect(declineTeamInvitation(mockHeaders, 'invite-123')).rejects.toThrow(
        'Invitation not found',
      );
    });
  });

  describe('revokeTeamInvitation', () => {
    it('should delete invitation', async () => {
      const { database } = await import('@repo/database');

      database.teamInvitation.delete = vi.fn().mockResolvedValue({});

      await revokeTeamInvitation(mockHeaders, 'team-123', 'invite-123');

      expect(database.teamInvitation.delete).toHaveBeenCalledWith({
        where: {
          id: 'invite-123',
          teamId: 'team-123',
        },
      });
    });
  });

  describe('getTeamInvitations', () => {
    it('should return team invitations', async () => {
      const { database } = await import('@repo/database');
      const mockInvitations = [
        createMockInvitation({ id: 'invite-1' }),
        createMockInvitation({ id: 'invite-2', status: 'accepted' }),
      ];

      database.teamInvitation.findMany = vi.fn().mockResolvedValue(mockInvitations);

      const result = await getTeamInvitations(mockHeaders, 'team-123');

      expect(result).toEqual(mockInvitations);
      expect(database.teamInvitation.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        where: { teamId: 'team-123' },
      });
    });

    it('should filter by status when provided', async () => {
      const { database } = await import('@repo/database');

      database.teamInvitation.findMany = vi.fn().mockResolvedValue([]);

      await getTeamInvitations(mockHeaders, 'team-123', { status: 'pending' });

      expect(database.teamInvitation.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        where: {
          status: 'pending',
          teamId: 'team-123',
        },
      });
    });
  });

  describe('getUserTeamInvitations', () => {
    it('should return user invitations', async () => {
      const { database } = await import('@repo/database');
      const mockSession = createMockSession();
      const mockInvitations = [createMockInvitation({ email: 'test@example.com' })];

      mockGetSession.mockResolvedValue(mockSession);
      database.teamInvitation.findMany = vi.fn().mockResolvedValue(mockInvitations);

      const result = await getUserTeamInvitations(mockHeaders);

      expect(result).toEqual(mockInvitations);
      expect(database.teamInvitation.findMany).toHaveBeenCalledWith({
        include: {
          team: true,
        },
        orderBy: { createdAt: 'desc' },
        where: {
          email: 'test@example.com',
          expiresAt: { gt: expect.any(Date) },
          status: 'pending',
        },
      });
    });

    it('should throw error when session is missing', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(getUserTeamInvitations(mockHeaders)).rejects.toThrow('Unauthorized');
    });
  });

  describe('resendTeamInvitation', () => {
    it('should resend invitation email', async () => {
      const { database } = await import('@repo/database');
      const { sendTeamInvitationEmail } = await import('@repo/email');
      const mockSession = createMockSession();
      const mockInvitation = createMockInvitation();
      const mockTeam = {
        id: 'team-123',
        name: 'Test Team',
      };

      database.teamInvitation.findFirst = vi.fn().mockResolvedValue({
        ...mockInvitation,
        team: mockTeam,
      });

      await resendTeamInvitation(mockHeaders, 'team-123', 'invite-123');

      expect(sendTeamInvitationEmail).toHaveBeenCalledWith({
        invitationId: 'invite-123',
        inviterName: expect.any(String),
        teamName: 'Test Team',
        to: 'invited@example.com',
      });
    });

    it('should throw error if invitation not found', async () => {
      const { database } = await import('@repo/database');

      database.teamInvitation.findFirst = vi.fn().mockResolvedValue(null);

      await expect(resendTeamInvitation(mockHeaders, 'team-123', 'invite-123')).rejects.toThrow(
        'Invitation not found',
      );
    });

    it('should throw error for non-pending invitations', async () => {
      const { database } = await import('@repo/database');
      const mockInvitation = createMockInvitation({
        status: 'accepted',
      });

      database.teamInvitation.findFirst = vi.fn().mockResolvedValue(mockInvitation);

      await expect(resendTeamInvitation(mockHeaders, 'team-123', 'invite-123')).rejects.toThrow(
        'Can only resend pending invitations',
      );
    });
  });
});
