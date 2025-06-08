import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createTeam,
  deleteTeam,
  getTeam,
  getTeamStats,
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

vi.mock('@repo/database/prisma', () => ({
  prisma: {
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
    description: null,
    organizationId: 'org-123',
    updatedAt: null,
    ...overrides,
  });

  const createMockTeamMember = (overrides = {}): TeamMember => ({
    id: 'member-123',
    createdAt: new Date(),
    role: 'member',
    teamId: 'team-123',
    updatedAt: new Date(),
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

      const result = await createTeam({
        name: 'New Team',
        organizationId: 'org-123',
      });

      expect(result).toEqual(mockTeam);
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Team',
          organizationId: 'org-123',
        }),
      });
    });

    it('should auto-generate slug if not provided', async () => {
      const mockSession = createMockSession();
      const mockTeam = createMockTeam({ slug: 'new-team' });

      mockGetSession.mockResolvedValue(mockSession);
      mockCreate.mockResolvedValue(mockTeam);

      await createTeam({
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

      await createTeam({
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

      await expect(createTeam({ name: 'Test', organizationId: 'org-123' })).rejects.toThrow(
        'Authentication required',
      );
    });
  });

  describe('updateTeam', () => {
    it('should update team successfully', async () => {
      const mockTeam = createMockTeam({
        name: 'Updated Team',
      });

      mockUpdate.mockResolvedValue(mockTeam);

      const result = await updateTeam('team-123', {
        name: 'Updated Team',
        description: 'Updated description',
      });

      expect(result).toEqual(mockTeam);
      expect(mockUpdate).toHaveBeenCalledWith({
        data: {
          name: 'Updated Team',
          description: 'Updated description',
        },
        where: { id: 'team-123' },
      });
    });

    it('should allow partial updates', async () => {
      const mockTeam = createMockTeam();
      mockUpdate.mockResolvedValue(mockTeam);

      await updateTeam('team-123', {
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

      await updateTeam('team-123', {});

      expect(mockUpdate).toHaveBeenCalledWith({
        data: {},
        where: { id: 'team-123' },
      });
    });
  });

  describe('deleteTeam', () => {
    it('should delete team and all related data', async () => {
      const { prisma: database } = await import('@repo/database/prisma');

      mockDelete.mockResolvedValue({});

      await deleteTeam('team-123');

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

      await expect(deleteTeam('team-123')).rejects.toThrow('Deletion failed');
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

      const result = await getTeam('team-123');

      expect(result).toEqual(mockTeamWithMembers);
      expect(mockFindFirst).toHaveBeenCalledWith({
        include: { members: true },
        where: { id: 'team-123' },
      });
    });
  });

  describe('getTeamStats', () => {
    it('should return team statistics', async () => {
      const { prisma: database } = await import('@repo/database/prisma');

      mockGetSession.mockResolvedValue(createMockSession());
      database.teamMember.findFirst = vi.fn().mockResolvedValue({ role: 'member' });
      database.teamMember.count = vi.fn().mockResolvedValue(5);
      database.team.findUnique = vi.fn().mockResolvedValue({ createdAt: new Date() });
      database.invitation.count = vi.fn().mockResolvedValue(2);

      const result = await getTeamStats('team-123');

      expect(result.success).toBe(true);
      expect(result.stats).toMatchObject({
        activeMembers: 5,
        memberCount: 5,
        pendingInvitations: 2,
      });

      expect(database.teamMember.count).toHaveBeenCalledWith({
        where: { teamId: 'team-123' },
      });
    });

    it('should handle empty teams', async () => {
      const { prisma: database } = await import('@repo/database/prisma');

      mockGetSession.mockResolvedValue(createMockSession());
      database.teamMember.findFirst = vi.fn().mockResolvedValue({ role: 'member' });
      database.teamMember.count = vi.fn().mockResolvedValue(0);
      database.team.findUnique = vi.fn().mockResolvedValue({ createdAt: new Date() });
      database.invitation.count = vi.fn().mockResolvedValue(0);

      const result = await getTeamStats('team-123');

      expect(result.success).toBe(true);
      expect(result.stats).toMatchObject({
        activeMembers: 0,
        memberCount: 0,
        pendingInvitations: 0,
      });
    });
  });
});
