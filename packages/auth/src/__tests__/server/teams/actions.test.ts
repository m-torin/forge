import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createTeam,
  deleteTeam,
  getTeam,
  getTeamMembers,
  getTeamStats,
  getUserTeams,
  leaveTeam,
  updateTeam,
} from '../../../server/teams/actions';

import type { Team, TeamMember } from '../../../shared/types';

// Mock database
const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockCount = vi.fn();

vi.mock('@repo/database', () => ({
  database: {
    team: {
      count: mockCount,
      create: mockCreate,
      delete: mockDelete,
      findFirst: mockFindFirst,
      findMany: mockFindMany,
      update: mockUpdate,
    },
    teamMember: {
      count: vi.fn(),
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
vi.mock('../permissions', () => ({
  canDeleteTeam: vi.fn().mockResolvedValue(true),
  canManageTeam: vi.fn().mockResolvedValue(true),
  canViewTeamMembers: vi.fn().mockResolvedValue(true),
}));

describe('Team Actions', () => {
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

  const createMockTeam = (overrides = {}): Team => ({
    id: 'team-123',
    name: 'Test Team',
    createdAt: new Date('2023-01-01'),
    metadata: {},
    organizationId: 'org-123',
    slug: 'test-team',
    ...overrides,
  });

  const createMockTeamMember = (overrides = {}): TeamMember => ({
    id: 'member-123',
    createdAt: new Date(),
    role: 'member',
    teamId: 'team-123',
    userId: 'user-123',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTeam', () => {
    it('should create a new team successfully', async () => {
      const mockSession = createMockSession();
      const mockTeam = createMockTeam();

      mockGetSession.mockResolvedValue(mockSession);
      mockCreate.mockResolvedValue(mockTeam);

      const result = await createTeam(mockHeaders, {
        name: 'New Team',
        metadata: { description: 'A test team' },
        organizationId: 'org-123',
        slug: 'new-team',
      });

      expect(result).toEqual(mockTeam);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          name: 'New Team',
          members: {
            create: {
              role: 'owner',
              userId: 'user-123',
            },
          },
          metadata: { description: 'A test team' },
          organizationId: 'org-123',
          slug: 'new-team',
        },
      });
    });

    it('should auto-generate slug if not provided', async () => {
      const mockSession = createMockSession();
      const mockTeam = createMockTeam({ slug: 'new-team' });

      mockGetSession.mockResolvedValue(mockSession);
      mockCreate.mockResolvedValue(mockTeam);

      await createTeam(mockHeaders, {
        name: 'New Team',
        organizationId: 'org-123',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: 'new-team',
        }),
      });
    });

    it('should handle special characters in team name', async () => {
      const mockSession = createMockSession();
      mockGetSession.mockResolvedValue(mockSession);
      mockCreate.mockResolvedValue(createMockTeam());

      await createTeam(mockHeaders, {
        name: 'Dev & QA Team!',
        organizationId: 'org-123',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: 'dev-qa-team',
        }),
      });
    });

    it('should throw error when session is missing', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        createTeam(mockHeaders, { name: 'Test', organizationId: 'org-123' }),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateTeam', () => {
    it('should update team successfully', async () => {
      const mockTeam = createMockTeam({
        name: 'Updated Team',
      });

      mockUpdate.mockResolvedValue(mockTeam);

      const result = await updateTeam(mockHeaders, 'team-123', {
        name: 'Updated Team',
        metadata: { description: 'Updated description' },
      });

      expect(result).toEqual(mockTeam);
      expect(mockUpdate).toHaveBeenCalledWith({
        data: {
          name: 'Updated Team',
          metadata: { description: 'Updated description' },
        },
        where: { id: 'team-123' },
      });
    });

    it('should allow partial updates', async () => {
      const mockTeam = createMockTeam();
      mockUpdate.mockResolvedValue(mockTeam);

      await updateTeam(mockHeaders, 'team-123', {
        name: 'New Name Only',
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        data: {
          name: 'New Name Only',
        },
        where: { id: 'team-123' },
      });
    });

    it('should update slug when provided', async () => {
      const mockTeam = createMockTeam();
      mockUpdate.mockResolvedValue(mockTeam);

      await updateTeam(mockHeaders, 'team-123', {
        slug: 'new-slug',
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        data: {
          slug: 'new-slug',
        },
        where: { id: 'team-123' },
      });
    });
  });

  describe('deleteTeam', () => {
    it('should delete team and all related data', async () => {
      const { database } = await import('@repo/database');

      mockDelete.mockResolvedValue({});

      await deleteTeam(mockHeaders, 'team-123');

      // Should delete all members first
      expect(database.teamMember.deleteMany).toHaveBeenCalledWith({
        where: { teamId: 'team-123' },
      });

      // Then delete the team
      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: 'team-123' },
      });
    });

    it('should handle deletion errors', async () => {
      mockDelete.mockRejectedValue(new Error('Deletion failed'));

      await expect(deleteTeam(mockHeaders, 'team-123')).rejects.toThrow('Deletion failed');
    });
  });

  describe('getTeam', () => {
    it('should return team details', async () => {
      const mockTeam = createMockTeam();
      mockFindFirst.mockResolvedValue(mockTeam);

      const result = await getTeam('team-123');

      expect(result).toEqual(mockTeam);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { id: 'team-123' },
      });
    });

    it('should return null when team not found', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await getTeam('team-123');

      expect(result).toBeNull();
    });

    it('should include relations when requested', async () => {
      const mockTeamWithMembers = {
        ...createMockTeam(),
        members: [createMockTeamMember()],
      };
      mockFindFirst.mockResolvedValue(mockTeamWithMembers);

      const result = await getTeam('team-123', { includeMembers: true });

      expect(result).toEqual(mockTeamWithMembers);
      expect(mockFindFirst).toHaveBeenCalledWith({
        include: { members: true },
        where: { id: 'team-123' },
      });
    });
  });

  describe('getUserTeams', () => {
    it('should return user teams successfully', async () => {
      const { database } = await import('@repo/database');
      const mockTeams = [
        createMockTeam({ id: 'team-1', name: 'Team 1' }),
        createMockTeam({ id: 'team-2', name: 'Team 2' }),
      ];

      database.teamMember.findMany = vi.fn().mockResolvedValue([
        { team: mockTeams[0], teamId: 'team-1' },
        { team: mockTeams[1], teamId: 'team-2' },
      ]);

      const result = await getUserTeams('user-123');

      expect(result).toEqual(mockTeams);
      expect(database.teamMember.findMany).toHaveBeenCalledWith({
        include: { team: true },
        orderBy: { createdAt: 'desc' },
        where: { userId: 'user-123' },
      });
    });

    it('should filter by organization when provided', async () => {
      const { database } = await import('@repo/database');

      database.teamMember.findMany = vi.fn().mockResolvedValue([]);

      await getUserTeams('user-123', { organizationId: 'org-123' });

      expect(database.teamMember.findMany).toHaveBeenCalledWith({
        include: { team: true },
        orderBy: { createdAt: 'desc' },
        where: {
          team: {
            organizationId: 'org-123',
          },
          userId: 'user-123',
        },
      });
    });

    it('should return empty array when user has no teams', async () => {
      const { database } = await import('@repo/database');

      database.teamMember.findMany = vi.fn().mockResolvedValue([]);

      const result = await getUserTeams('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('getTeamMembers', () => {
    it('should return team members', async () => {
      const { database } = await import('@repo/database');
      const mockMembers = [
        createMockTeamMember({ role: 'owner', userId: 'user-1' }),
        createMockTeamMember({ role: 'member', userId: 'user-2' }),
      ];

      database.teamMember.findMany = vi.fn().mockResolvedValue(mockMembers);

      const result = await getTeamMembers(mockHeaders, 'team-123');

      expect(result).toEqual(mockMembers);
      expect(database.teamMember.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
        where: { teamId: 'team-123' },
      });
    });

    it('should include user details when requested', async () => {
      const { database } = await import('@repo/database');
      const mockMembersWithUsers = [
        {
          ...createMockTeamMember(),
          user: { id: 'user-1', email: 'user1@example.com' },
        },
      ];

      database.teamMember.findMany = vi.fn().mockResolvedValue(mockMembersWithUsers);

      const result = await getTeamMembers(mockHeaders, 'team-123', { includeUser: true });

      expect(result).toEqual(mockMembersWithUsers);
      expect(database.teamMember.findMany).toHaveBeenCalledWith({
        include: { user: true },
        orderBy: { createdAt: 'asc' },
        where: { teamId: 'team-123' },
      });
    });
  });

  describe('getTeamStats', () => {
    it('should return team statistics', async () => {
      const { database } = await import('@repo/database');

      database.teamMember.count = vi.fn().mockResolvedValue(5);

      const result = await getTeamStats('team-123');

      expect(result).toEqual({
        memberCount: 5,
      });

      expect(database.teamMember.count).toHaveBeenCalledWith({
        where: { teamId: 'team-123' },
      });
    });

    it('should handle empty teams', async () => {
      const { database } = await import('@repo/database');

      database.teamMember.count = vi.fn().mockResolvedValue(0);

      const result = await getTeamStats('team-123');

      expect(result).toEqual({
        memberCount: 0,
      });
    });
  });

  describe('leaveTeam', () => {
    it('should allow member to leave team', async () => {
      const { database } = await import('@repo/database');
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      database.teamMember.delete = vi.fn().mockResolvedValue({});

      await leaveTeam(mockHeaders, 'team-123');

      expect(database.teamMember.delete).toHaveBeenCalledWith({
        where: {
          userId_teamId: {
            teamId: 'team-123',
            userId: 'user-123',
          },
        },
      });
    });

    it('should prevent last owner from leaving', async () => {
      const { database } = await import('@repo/database');
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);

      // Mock that user is the only owner
      database.teamMember.findFirst = vi.fn().mockResolvedValue({
        role: 'owner',
        userId: 'user-123',
      });

      database.teamMember.count = vi.fn().mockResolvedValue(0);

      await expect(leaveTeam(mockHeaders, 'team-123')).rejects.toThrow(
        'Cannot leave team as the last owner',
      );
    });

    it('should throw error when session is missing', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(leaveTeam(mockHeaders, 'team-123')).rejects.toThrow('Unauthorized');
    });
  });
});
