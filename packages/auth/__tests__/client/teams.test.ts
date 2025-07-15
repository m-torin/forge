/**
 * Tests for client teams functionality
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the auth client
const mockAuthClient = {
  organization: {
    createTeam: vi.fn(),
    updateTeam: vi.fn(),
    removeTeam: vi.fn(),
    listTeams: vi.fn(),
    addTeamMember: vi.fn(),
    removeTeamMember: vi.fn(),
    updateTeamMemberRole: vi.fn(),
    getTeam: vi.fn(),
    listTeamMembers: vi.fn(),
    getTeamInvitations: vi.fn(),
    inviteToTeam: vi.fn(),
    acceptTeamInvitation: vi.fn(),
    rejectTeamInvitation: vi.fn(),
    cancelTeamInvitation: vi.fn(),
    transferTeamOwnership: vi.fn(),
    leaveTeam: vi.fn(),
    archiveTeam: vi.fn(),
    unarchiveTeam: vi.fn(),
    duplicateTeam: vi.fn(),
    getTeamStats: vi.fn(),
    bulkUpdateTeamMembers: vi.fn(),
    exportTeamData: vi.fn(),
    importTeamData: vi.fn(),
  },
};

vi.mock('@/client/client', () => ({
  authClient: mockAuthClient,
}));

// Mock logger
const mockLogger = {
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

vi.mock('@/client/utils/logger', () => ({
  logger: mockLogger,
}));

describe('client teams functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTeam', () => {
    it('should create team successfully', async () => {
      const { createTeam } = await import('@/client/teams');

      const teamData = { id: 'team-123', name: 'Test Team' };
      mockAuthClient.organization.createTeam.mockResolvedValue(teamData);

      const result = await createTeam({
        name: 'Test Team',
        description: 'A test team',
        organizationId: 'org-123',
      });

      expect(result).toEqual(teamData);
      expect(mockAuthClient.organization.createTeam).toHaveBeenCalledWith({
        name: 'Test Team',
        description: 'A test team',
        organizationId: 'org-123',
      });
    });

    it('should handle team creation errors', async () => {
      const { createTeam } = await import('@/client/teams');

      const error = new Error('Team creation failed');
      mockAuthClient.organization.createTeam.mockRejectedValue(error);

      await expect(createTeam({ name: 'Test Team' })).rejects.toThrow('Team creation failed');
      expect(mockLogger.error).toHaveBeenCalledWith('Create team failed:', error);
    });
  });

  describe('updateTeam', () => {
    it('should update team successfully', async () => {
      const { updateTeam } = await import('@/client/teams');

      const teamData = { id: 'team-123', name: 'Updated Team' };
      mockAuthClient.organization.updateTeam.mockResolvedValue(teamData);

      const result = await updateTeam({
        teamId: 'team-123',
        name: 'Updated Team',
        description: 'Updated description',
      });

      expect(result).toEqual(teamData);
      expect(mockAuthClient.organization.updateTeam).toHaveBeenCalledWith({
        teamId: 'team-123',
        name: 'Updated Team',
        description: 'Updated description',
      });
    });

    it('should handle team update errors', async () => {
      const { updateTeam } = await import('@/client/teams');

      const error = new Error('Team update failed');
      mockAuthClient.organization.updateTeam.mockRejectedValue(error);

      await expect(updateTeam({ teamId: 'team-123', name: 'Updated' })).rejects.toThrow(
        'Team update failed',
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Update team failed:', error);
    });
  });

  describe('removeTeam', () => {
    it('should remove team successfully', async () => {
      const { removeTeam } = await import('@/client/teams');

      mockAuthClient.organization.removeTeam.mockResolvedValue(undefined);

      const result = await removeTeam('team-123');

      expect(result).toBeUndefined();
      expect(mockAuthClient.organization.removeTeam).toHaveBeenCalledWith({ teamId: 'team-123' });
    });

    it('should handle team removal errors', async () => {
      const { removeTeam } = await import('@/client/teams');

      const error = new Error('Team removal failed');
      mockAuthClient.organization.removeTeam.mockRejectedValue(error);

      await expect(removeTeam('team-123')).rejects.toThrow('Team removal failed');
      expect(mockLogger.error).toHaveBeenCalledWith('Remove team failed:', error);
    });
  });

  describe('listTeams', () => {
    it('should list teams successfully', async () => {
      const { listTeams } = await import('@/client/teams');

      const teams = [{ id: 'team-1' }, { id: 'team-2' }];
      mockAuthClient.organization.listTeams.mockResolvedValue(teams);

      const result = await listTeams('org-123');

      expect(result).toEqual(teams);
      expect(mockAuthClient.organization.listTeams).toHaveBeenCalledWith({
        organizationId: 'org-123',
      });
    });

    it('should handle team listing errors', async () => {
      const { listTeams } = await import('@/client/teams');

      const error = new Error('List teams failed');
      mockAuthClient.organization.listTeams.mockRejectedValue(error);

      await expect(listTeams('org-123')).rejects.toThrow('List teams failed');
      expect(mockLogger.error).toHaveBeenCalledWith('List teams failed:', error);
    });
  });

  describe('addTeamMember', () => {
    it('should add team member successfully', async () => {
      const { addTeamMember } = await import('@/client/teams');

      const memberData = { id: 'member-123', userId: 'user-123' };
      mockAuthClient.organization.addTeamMember.mockResolvedValue(memberData);

      const result = await addTeamMember({
        teamId: 'team-123',
        userId: 'user-123',
        role: 'member',
      });

      expect(result).toEqual(memberData);
      expect(mockAuthClient.organization.addTeamMember).toHaveBeenCalledWith({
        teamId: 'team-123',
        userId: 'user-123',
        role: 'member',
      });
    });

    it('should handle add member errors', async () => {
      const { addTeamMember } = await import('@/client/teams');

      const error = new Error('Add member failed');
      mockAuthClient.organization.addTeamMember.mockRejectedValue(error);

      await expect(addTeamMember({ teamId: 'team-123', userId: 'user-123' })).rejects.toThrow(
        'Add member failed',
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Add team member failed:', error);
    });
  });

  describe('removeTeamMember', () => {
    it('should remove team member successfully', async () => {
      const { removeTeamMember } = await import('@/client/teams');

      mockAuthClient.organization.removeTeamMember.mockResolvedValue(undefined);

      const result = await removeTeamMember({
        teamId: 'team-123',
        userId: 'user-123',
      });

      expect(result).toBeUndefined();
      expect(mockAuthClient.organization.removeTeamMember).toHaveBeenCalledWith({
        teamId: 'team-123',
        userId: 'user-123',
      });
    });

    it('should handle remove member errors', async () => {
      const { removeTeamMember } = await import('@/client/teams');

      const error = new Error('Remove member failed');
      mockAuthClient.organization.removeTeamMember.mockRejectedValue(error);

      await expect(removeTeamMember({ teamId: 'team-123', userId: 'user-123' })).rejects.toThrow(
        'Remove member failed',
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Remove team member failed:', error);
    });
  });

  describe('updateTeamMemberRole', () => {
    it('should update team member role successfully', async () => {
      const { updateTeamMemberRole } = await import('@/client/teams');

      const memberData = { id: 'member-123', role: 'admin' };
      mockAuthClient.organization.updateTeamMemberRole.mockResolvedValue(memberData);

      const result = await updateTeamMemberRole({
        teamId: 'team-123',
        userId: 'user-123',
        role: 'admin',
      });

      expect(result).toEqual(memberData);
      expect(mockAuthClient.organization.updateTeamMemberRole).toHaveBeenCalledWith({
        teamId: 'team-123',
        userId: 'user-123',
        role: 'admin',
      });
    });

    it('should handle update role errors', async () => {
      const { updateTeamMemberRole } = await import('@/client/teams');

      const error = new Error('Update role failed');
      mockAuthClient.organization.updateTeamMemberRole.mockRejectedValue(error);

      await expect(
        updateTeamMemberRole({ teamId: 'team-123', userId: 'user-123', role: 'admin' }),
      ).rejects.toThrow('Update role failed');
      expect(mockLogger.error).toHaveBeenCalledWith('Update team member role failed:', error);
    });
  });

  describe('getTeam', () => {
    it('should get team successfully', async () => {
      const { getTeam } = await import('@/client/teams');

      const teamData = { id: 'team-123', name: 'Test Team' };
      mockAuthClient.organization.getTeam.mockResolvedValue(teamData);

      const result = await getTeam('team-123');

      expect(result).toEqual(teamData);
      expect(mockAuthClient.organization.getTeam).toHaveBeenCalledWith({ teamId: 'team-123' });
    });

    it('should handle get team errors', async () => {
      const { getTeam } = await import('@/client/teams');

      const error = new Error('Get team failed');
      mockAuthClient.organization.getTeam.mockRejectedValue(error);

      await expect(getTeam('team-123')).rejects.toThrow('Get team failed');
      expect(mockLogger.error).toHaveBeenCalledWith('Get team failed:', error);
    });
  });

  describe('listTeamMembers', () => {
    it('should list team members successfully', async () => {
      const { listTeamMembers } = await import('@/client/teams');

      const members = [{ id: 'member-1' }, { id: 'member-2' }];
      mockAuthClient.organization.listTeamMembers.mockResolvedValue(members);

      const result = await listTeamMembers('team-123');

      expect(result).toEqual(members);
      expect(mockAuthClient.organization.listTeamMembers).toHaveBeenCalledWith({
        teamId: 'team-123',
      });
    });

    it('should handle list members errors', async () => {
      const { listTeamMembers } = await import('@/client/teams');

      const error = new Error('List members failed');
      mockAuthClient.organization.listTeamMembers.mockRejectedValue(error);

      await expect(listTeamMembers('team-123')).rejects.toThrow('List members failed');
      expect(mockLogger.error).toHaveBeenCalledWith('List team members failed:', error);
    });
  });

  describe('team invitations', () => {
    it('should get team invitations successfully', async () => {
      const { getTeamInvitations } = await import('@/client/teams');

      const invitations = [{ id: 'inv-1' }, { id: 'inv-2' }];
      mockAuthClient.organization.getTeamInvitations.mockResolvedValue(invitations);

      const result = await getTeamInvitations('team-123');

      expect(result).toEqual(invitations);
      expect(mockAuthClient.organization.getTeamInvitations).toHaveBeenCalledWith({
        teamId: 'team-123',
      });
    });

    it('should invite to team successfully', async () => {
      const { inviteToTeam } = await import('@/client/teams');

      const invitation = { id: 'inv-123', email: 'test@example.com' };
      mockAuthClient.organization.inviteToTeam.mockResolvedValue(invitation);

      const result = await inviteToTeam({
        teamId: 'team-123',
        email: 'test@example.com',
        role: 'member',
      });

      expect(result).toEqual(invitation);
      expect(mockAuthClient.organization.inviteToTeam).toHaveBeenCalledWith({
        teamId: 'team-123',
        email: 'test@example.com',
        role: 'member',
      });
    });

    it('should accept team invitation successfully', async () => {
      const { acceptTeamInvitation } = await import('@/client/teams');

      const result_data = { teamId: 'team-123', accepted: true };
      mockAuthClient.organization.acceptTeamInvitation.mockResolvedValue(result_data);

      const result = await acceptTeamInvitation('inv-123');

      expect(result).toEqual(result_data);
      expect(mockAuthClient.organization.acceptTeamInvitation).toHaveBeenCalledWith({
        invitationId: 'inv-123',
      });
    });

    it('should reject team invitation successfully', async () => {
      const { rejectTeamInvitation } = await import('@/client/teams');

      mockAuthClient.organization.rejectTeamInvitation.mockResolvedValue(undefined);

      const result = await rejectTeamInvitation('inv-123');

      expect(result).toBeUndefined();
      expect(mockAuthClient.organization.rejectTeamInvitation).toHaveBeenCalledWith({
        invitationId: 'inv-123',
      });
    });

    it('should cancel team invitation successfully', async () => {
      const { cancelTeamInvitation } = await import('@/client/teams');

      mockAuthClient.organization.cancelTeamInvitation.mockResolvedValue(undefined);

      const result = await cancelTeamInvitation('inv-123');

      expect(result).toBeUndefined();
      expect(mockAuthClient.organization.cancelTeamInvitation).toHaveBeenCalledWith({
        invitationId: 'inv-123',
      });
    });

    it('should handle invitation errors', async () => {
      const { inviteToTeam, acceptTeamInvitation, rejectTeamInvitation, cancelTeamInvitation } =
        await import('@/client/teams');

      const error = new Error('Invitation failed');

      // Test invite error
      mockAuthClient.organization.inviteToTeam.mockRejectedValue(error);
      await expect(inviteToTeam({ teamId: 'team-123', email: 'test@example.com' })).rejects.toThrow(
        'Invitation failed',
      );

      // Test accept error
      mockAuthClient.organization.acceptTeamInvitation.mockRejectedValue(error);
      await expect(acceptTeamInvitation('inv-123')).rejects.toThrow('Invitation failed');

      // Test reject error
      mockAuthClient.organization.rejectTeamInvitation.mockRejectedValue(error);
      await expect(rejectTeamInvitation('inv-123')).rejects.toThrow('Invitation failed');

      // Test cancel error
      mockAuthClient.organization.cancelTeamInvitation.mockRejectedValue(error);
      await expect(cancelTeamInvitation('inv-123')).rejects.toThrow('Invitation failed');
    });
  });

  describe('advanced team operations', () => {
    it('should transfer team ownership successfully', async () => {
      const { transferTeamOwnership } = await import('@/client/teams');

      const result_data = { success: true, newOwnerId: 'user-456' };
      mockAuthClient.organization.transferTeamOwnership.mockResolvedValue(result_data);

      const result = await transferTeamOwnership({
        teamId: 'team-123',
        newOwnerId: 'user-456',
      });

      expect(result).toEqual(result_data);
      expect(mockAuthClient.organization.transferTeamOwnership).toHaveBeenCalledWith({
        teamId: 'team-123',
        newOwnerId: 'user-456',
      });
    });

    it('should leave team successfully', async () => {
      const { leaveTeam } = await import('@/client/teams');

      mockAuthClient.organization.leaveTeam.mockResolvedValue(undefined);

      const result = await leaveTeam('team-123');

      expect(result).toBeUndefined();
      expect(mockAuthClient.organization.leaveTeam).toHaveBeenCalledWith({ teamId: 'team-123' });
    });

    it('should archive team successfully', async () => {
      const { archiveTeam } = await import('@/client/teams');

      const teamData = { id: 'team-123', archived: true };
      mockAuthClient.organization.archiveTeam.mockResolvedValue(teamData);

      const result = await archiveTeam('team-123');

      expect(result).toEqual(teamData);
      expect(mockAuthClient.organization.archiveTeam).toHaveBeenCalledWith({ teamId: 'team-123' });
    });

    it('should unarchive team successfully', async () => {
      const { unarchiveTeam } = await import('@/client/teams');

      const teamData = { id: 'team-123', archived: false };
      mockAuthClient.organization.unarchiveTeam.mockResolvedValue(teamData);

      const result = await unarchiveTeam('team-123');

      expect(result).toEqual(teamData);
      expect(mockAuthClient.organization.unarchiveTeam).toHaveBeenCalledWith({
        teamId: 'team-123',
      });
    });

    it('should duplicate team successfully', async () => {
      const { duplicateTeam } = await import('@/client/teams');

      const newTeam = { id: 'team-456', name: 'Test Team Copy' };
      mockAuthClient.organization.duplicateTeam.mockResolvedValue(newTeam);

      const result = await duplicateTeam({
        teamId: 'team-123',
        newName: 'Test Team Copy',
      });

      expect(result).toEqual(newTeam);
      expect(mockAuthClient.organization.duplicateTeam).toHaveBeenCalledWith({
        teamId: 'team-123',
        newName: 'Test Team Copy',
      });
    });

    it('should get team stats successfully', async () => {
      const { getTeamStats } = await import('@/client/teams');

      const stats = {
        totalMembers: 10,
        activeMembers: 8,
        projectsCount: 5,
        tasksCompleted: 42,
      };
      mockAuthClient.organization.getTeamStats.mockResolvedValue(stats);

      const result = await getTeamStats('team-123');

      expect(result).toEqual(stats);
      expect(mockAuthClient.organization.getTeamStats).toHaveBeenCalledWith({ teamId: 'team-123' });
    });

    it('should handle advanced operation errors', async () => {
      const { transferTeamOwnership, leaveTeam, archiveTeam, duplicateTeam, getTeamStats } =
        await import('@/client/teams');

      const error = new Error('Operation failed');

      // Test transfer ownership error
      mockAuthClient.organization.transferTeamOwnership.mockRejectedValue(error);
      await expect(
        transferTeamOwnership({ teamId: 'team-123', newOwnerId: 'user-456' }),
      ).rejects.toThrow('Operation failed');

      // Test leave team error
      mockAuthClient.organization.leaveTeam.mockRejectedValue(error);
      await expect(leaveTeam('team-123')).rejects.toThrow('Operation failed');

      // Test archive team error
      mockAuthClient.organization.archiveTeam.mockRejectedValue(error);
      await expect(archiveTeam('team-123')).rejects.toThrow('Operation failed');

      // Test duplicate team error
      mockAuthClient.organization.duplicateTeam.mockRejectedValue(error);
      await expect(duplicateTeam({ teamId: 'team-123', newName: 'Copy' })).rejects.toThrow(
        'Operation failed',
      );

      // Test get stats error
      mockAuthClient.organization.getTeamStats.mockRejectedValue(error);
      await expect(getTeamStats('team-123')).rejects.toThrow('Operation failed');
    });
  });

  describe('bulk operations', () => {
    it('should bulk update team members successfully', async () => {
      const { bulkUpdateTeamMembers } = await import('@/client/teams');

      const results = [
        { userId: 'user-1', success: true },
        { userId: 'user-2', success: true },
      ];
      mockAuthClient.organization.bulkUpdateTeamMembers.mockResolvedValue(results);

      const result = await bulkUpdateTeamMembers({
        teamId: 'team-123',
        updates: [
          { userId: 'user-1', role: 'admin' },
          { userId: 'user-2', role: 'member' },
        ],
      });

      expect(result).toEqual(results);
      expect(mockAuthClient.organization.bulkUpdateTeamMembers).toHaveBeenCalledWith({
        teamId: 'team-123',
        updates: [
          { userId: 'user-1', role: 'admin' },
          { userId: 'user-2', role: 'member' },
        ],
      });
    });

    it('should export team data successfully', async () => {
      const { exportTeamData } = await import('@/client/teams');

      const exportData = {
        team: { id: 'team-123', name: 'Test Team' },
        members: [{ id: 'member-1' }],
        projects: [{ id: 'project-1' }],
      };
      mockAuthClient.organization.exportTeamData.mockResolvedValue(exportData);

      const result = await exportTeamData({
        teamId: 'team-123',
        format: 'json',
        includeProjects: true,
      });

      expect(result).toEqual(exportData);
      expect(mockAuthClient.organization.exportTeamData).toHaveBeenCalledWith({
        teamId: 'team-123',
        format: 'json',
        includeProjects: true,
      });
    });

    it('should import team data successfully', async () => {
      const { importTeamData } = await import('@/client/teams');

      const importResult = {
        success: true,
        imported: {
          members: 5,
          projects: 3,
        },
      };
      mockAuthClient.organization.importTeamData.mockResolvedValue(importResult);

      const result = await importTeamData({
        teamId: 'team-123',
        data: { members: [], projects: [] },
        merge: true,
      });

      expect(result).toEqual(importResult);
      expect(mockAuthClient.organization.importTeamData).toHaveBeenCalledWith({
        teamId: 'team-123',
        data: { members: [], projects: [] },
        merge: true,
      });
    });

    it('should handle bulk operation errors', async () => {
      const { bulkUpdateTeamMembers, exportTeamData, importTeamData } = await import(
        '@/client/teams'
      );

      const error = new Error('Bulk operation failed');

      // Test bulk update error
      mockAuthClient.organization.bulkUpdateTeamMembers.mockRejectedValue(error);
      await expect(bulkUpdateTeamMembers({ teamId: 'team-123', updates: [] })).rejects.toThrow(
        'Bulk operation failed',
      );

      // Test export error
      mockAuthClient.organization.exportTeamData.mockRejectedValue(error);
      await expect(exportTeamData({ teamId: 'team-123' })).rejects.toThrow('Bulk operation failed');

      // Test import error
      mockAuthClient.organization.importTeamData.mockRejectedValue(error);
      await expect(importTeamData({ teamId: 'team-123', data: {} })).rejects.toThrow(
        'Bulk operation failed',
      );
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing team management functions gracefully', async () => {
      const { createTeam } = await import('@/client/teams');

      // Mock organization object not existing
      (mockAuthClient as any).organization = undefined;

      await expect(createTeam({ name: 'Test' })).rejects.toThrow();
    });

    it('should handle non-Error exceptions', async () => {
      const { updateTeam } = await import('@/client/teams');

      // Reset organization mock
      (mockAuthClient as any).organization = {
        updateTeam: vi.fn().mockRejectedValue('String error'),
      };

      await expect(updateTeam({ teamId: 'team-123', name: 'Test' })).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('Update team failed:', expect.any(Error));
    });

    it('should handle undefined responses', async () => {
      const { getTeam } = await import('@/client/teams');

      mockAuthClient.organization.getTeam.mockResolvedValue(undefined);

      const result = await getTeam('team-123');

      expect(result).toBeUndefined();
    });

    it('should handle empty array responses', async () => {
      const { listTeams } = await import('@/client/teams');

      mockAuthClient.organization.listTeams.mockResolvedValue([]);

      const result = await listTeams('org-123');

      expect(result).toEqual([]);
    });
  });
});
