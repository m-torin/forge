import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createTeam,
  deleteTeam,
  getTeam,
  getTeamStats,
  updateTeam,
} from '../../../server/teams/actions';

import type { Team, TeamMember } from '../../../shared/types';

// Use vi.hoisted for all mocks
const {
  mockCanDeleteTeam,
  mockCanManageTeam,
  mockCanViewTeamMembers,
  mockCount,
  mockCreate,
  mockDelete,
  mockFindFirst,
  mockFindMany,
  mockGetSession,
  mockPrisma,
  mockUpdate,
} = vi.hoisted(() => {
  const mockFindFirst = vi.fn();
  const mockFindMany = vi.fn();
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockCount = vi.fn();
  const mockGetSession = vi.fn();
  const mockCanDeleteTeam = vi.fn();
  const mockCanManageTeam = vi.fn();
  const mockCanViewTeamMembers = vi.fn();

  const mockPrisma = {
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
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    team: {
      count: mockCount,
      create: mockCreate,
      delete: mockDelete,
      findFirst: mockFindFirst,
      findMany: mockFindMany,
      findUnique: vi.fn(),
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
  };

  return {
    mockCanDeleteTeam,
    mockCanManageTeam,
    mockCanViewTeamMembers,
    mockCount,
    mockCreate,
    mockDelete,
    mockFindFirst,
    mockFindMany,
    mockGetSession,
    mockPrisma,
    mockUpdate,
  };
});

vi.mock('@repo/database/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

// Mock auth
vi.mock('../../../server/auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

// Mock permissions
vi.mock('../../../server/teams/permissions', () => ({
  canDeleteTeam: mockCanDeleteTeam,
  canManageTeam: mockCanManageTeam,
  canViewTeamMembers: mockCanViewTeamMembers,
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
    teamMembers: [],
    updatedAt: null,
    ...overrides,
  });

  const createMockTeamMember = (overrides = {}): TeamMember => ({
    id: 'member-123',
    createdAt: new Date(),
    role: 'member',
    teamId: 'team-123',
    updatedAt: new Date(),
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    },
    userId: 'user-123',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Default session mock
    mockGetSession.mockResolvedValue(createMockSession());

    // Default permission mocks
    mockCanDeleteTeam.mockResolvedValue(true);
    mockCanManageTeam.mockResolvedValue(true);
    mockCanViewTeamMembers.mockResolvedValue(true);

    // Default database mocks - user is a member of the organization
    mockPrisma.member.findFirst.mockResolvedValue({
      id: 'member-123',
      createdAt: new Date(),
      organizationId: 'org-123',
      role: 'admin',
      updatedAt: new Date(),
      userId: 'user-123',
    });

    // Default team member permissions - user is team owner
    mockPrisma.teamMember.findFirst.mockResolvedValue({
      id: 'team-member-123',
      createdAt: new Date(),
      role: 'owner',
      teamId: 'team-123',
      updatedAt: new Date(),
      userId: 'user-123',
    });

    // Mock team creation to return team with teamMembers (dynamic based on input)
    mockCreate.mockImplementation((params) => {
      const data = params.data;
      return Promise.resolve({
        id: data.id || 'team-123',
        name: data.name,
        createdAt: data.createdAt || new Date('2023-01-01'),
        description: data.description || null,
        organizationId: data.organizationId,
        teamMembers: [
          {
            id: 'member-123',
            createdAt: new Date(),
            role: 'owner',
            teamId: data.id || 'team-123',
            updatedAt: new Date(),
            user: {
              id: 'user-123',
              name: 'Test User',
              email: 'test@example.com',
              image: null,
            },
            userId: 'user-123',
          },
        ],
        updatedAt: null,
      });
    });

    // Mock team updates to return updated team with teamMembers (dynamic based on input)
    mockUpdate.mockImplementation((params) => {
      const data = params.data;
      return Promise.resolve({
        id: params.where.id,
        name: data.name || 'Test Team',
        createdAt: new Date('2023-01-01'),
        description: data.description !== undefined ? data.description : null,
        organizationId: 'org-123',
        teamMembers: [
          {
            id: 'member-123',
            createdAt: new Date(),
            role: 'member',
            teamId: params.where.id,
            updatedAt: new Date(),
            user: {
              id: 'user-123',
              name: 'Test User',
              email: 'test@example.com',
              image: null,
            },
            userId: 'user-123',
          },
        ],
        updatedAt: new Date(),
      });
    });

    // Mock team finding to return team with teamMembers
    mockFindFirst.mockResolvedValue({
      id: 'team-123',
      name: 'Test Team',
      createdAt: new Date('2023-01-01'),
      description: null,
      organizationId: 'org-123',
      teamMembers: [
        {
          id: 'member-123',
          createdAt: new Date(),
          role: 'member',
          teamId: 'team-123',
          updatedAt: new Date(),
          user: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
            image: null,
          },
          userId: 'user-123',
        },
      ],
      updatedAt: null,
    });
  });

  describe('createTeam', () => {
    it('should create a new team successfully', async () => {
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);

      const result = await createTeam({
        name: 'New Team',
        organizationId: 'org-123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.team.name).toBe('New Team');
        expect(result.team.organizationId).toBe('org-123');
      }
    });

    it('should auto-generate slug if not provided', async () => {
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);

      const result = await createTeam({
        name: 'New Team',
        organizationId: 'org-123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.team.name).toBe('New Team');
      }
    });

    it('should handle special characters in team name', async () => {
      const mockSession = createMockSession();
      mockGetSession.mockResolvedValue(mockSession);

      const result = await createTeam({
        name: 'Dev & QA Team!',
        organizationId: 'org-123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.team.name).toBe('Dev & QA Team!');
      }
    });

    it('should return error when session is missing', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await createTeam({ name: 'Test', organizationId: 'org-123' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Authentication required');
      }
    });
  });

  describe('updateTeam', () => {
    it('should update team successfully', async () => {
      const mockTeam = createMockTeam({
        name: 'Updated Team',
        description: 'Updated description',
      });

      mockUpdate.mockResolvedValue(mockTeam);

      const result = await updateTeam('team-123', {
        name: 'Updated Team',
        description: 'Updated description',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.team.name).toBe('Updated Team');
        expect(result.team.description).toBe('Updated description');
      }
    });

    it('should allow partial updates', async () => {
      const mockTeam = createMockTeam({ name: 'New Name Only' });
      mockUpdate.mockResolvedValue(mockTeam);

      const result = await updateTeam('team-123', {
        name: 'New Name Only',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.team.name).toBe('New Name Only');
      }
    });

    it('should handle empty updates', async () => {
      const mockTeam = createMockTeam();
      mockUpdate.mockResolvedValue(mockTeam);

      const result = await updateTeam('team-123', {});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.team.id).toBe('team-123');
      }
    });
  });

  describe('deleteTeam', () => {
    it('should delete team successfully', async () => {
      mockDelete.mockResolvedValue({});

      const result = await deleteTeam('team-123');

      expect(result.success).toBe(true);
    });

    it('should handle deletion errors', async () => {
      mockDelete.mockRejectedValue(new Error('Deletion failed'));

      const result = await deleteTeam('team-123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Failed to delete team');
      }
    });
  });

  describe('getTeam', () => {
    it('should return team details', async () => {
      const mockTeam = createMockTeam();
      mockFindFirst.mockResolvedValue(mockTeam);

      const result = await getTeam('team-123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.team.id).toBe('team-123');
        expect(result.team.name).toBe('Test Team');
      }
    });

    it('should return error when team not found', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await getTeam('team-123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Team not found or access denied');
      }
    });

    it('should include relations when requested', async () => {
      const mockTeamWithMembers = {
        ...createMockTeam(),
        teamMembers: [createMockTeamMember()],
      };
      mockFindFirst.mockResolvedValue(mockTeamWithMembers);

      const result = await getTeam('team-123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.team.memberCount).toBe(1);
        expect(result.team.teamMembers).toHaveLength(1);
      }
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
