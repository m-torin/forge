/**
 * Server-side team management actions
 */

import 'server-only';

import { logError, logWarn } from '@repo/observability';
import { auth } from '../../shared/auth';
import { isValidRole } from '../../shared/teams';
import { getAuthHeaders } from '../get-headers';

import type {
  CreateTeamData,
  CreateTeamResult,
  DeleteTeamResult,
  GetTeamResult,
  GetTeamStatsResult,
  ListTeamsResult,
  RemoveTeamMemberResult,
  TeamStats,
  TeamWithMembers,
  UpdateTeamData,
  UpdateTeamMemberData,
  UpdateTeamMemberResult,
  UpdateTeamResult,
} from '../../shared/teams';
import type { Session } from '../../types';

/**
 * Creates a new team using better-auth native method
 */
export async function createTeamAction(data: CreateTeamData): Promise<CreateTeamResult> {
  try {
    const { name, description, initialMembers = [], organizationId } = data;

    // Use better-auth native createTeam API
    const result = await auth.api.createTeam({
      headers: await getAuthHeaders(),
      body: {
        name,
        organizationId,
        metadata: description ? { description } : undefined,
      },
    });

    if (!result?.team) {
      return { error: 'Failed to create team', success: false };
    }

    // Add initial members if specified using better-auth team member APIs
    if (initialMembers.length > 0) {
      try {
        for (const member of initialMembers) {
          // Invite user by email to team (current type only supports email invitations)
          await auth.api.inviteMemberToTeam({
            headers: await getAuthHeaders(),
            body: {
              teamId: result.team.id,
              email: member.email,
              role: member.role || 'member',
            },
          });
        }
      } catch (memberError) {
        logWarn('Failed to add some initial members', {
          error: memberError instanceof Error ? memberError.message : String(memberError),
        });
        // Continue - team was created successfully
      }
    }

    // Convert better-auth team result to our TeamWithMembers format
    const teamWithMembers: TeamWithMembers = {
      id: result.team.id,
      name: result.team.name,
      organizationId: result.team.organizationId,
      description: result.team.metadata?.description || description,
      createdAt: result.team.createdAt,
      updatedAt: result.team.updatedAt || result.team.createdAt,
      memberCount: result.team.members?.length || 0,
      teamMembers: (result.team.members || []).map((member: any) => ({
        id: member.id,
        teamId: result.team.id,
        userId: member.userId,
        role: member.role,
        joinedAt: member.createdAt,
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          image: member.user.image || undefined,
        },
      })),
    };

    return { success: true, team: teamWithMembers };
  } catch (error) {
    logError('Create team error:', error instanceof Error ? error : new Error(String(error)));
    return { error: 'Failed to create team', success: false };
  }
}

/**
 * Updates a team using better-auth native method
 */
export async function updateTeamAction(
  teamId: string,
  data: UpdateTeamData,
): Promise<UpdateTeamResult> {
  try {
    // Build update data with metadata for description
    const updateData: any = {
      teamId,
    };

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.description !== undefined) {
      updateData.metadata = { description: data.description };
    }

    // Use better-auth native updateTeam API
    const result = await auth.api.updateTeam({
      headers: await getAuthHeaders(),
      body: updateData,
    });

    if (!result?.team) {
      return { error: 'Failed to update team', success: false };
    }

    // Convert better-auth team result to our TeamWithMembers format
    const teamWithMembers: TeamWithMembers = {
      id: result.team.id,
      name: result.team.name,
      organizationId: result.team.organizationId,
      description: result.team.metadata?.description || data.description,
      createdAt: result.team.createdAt,
      updatedAt: result.team.updatedAt || new Date(),
      memberCount: result.team.members?.length || 0,
      teamMembers: (result.team.members || []).map((member: any) => ({
        id: member.id,
        teamId: result.team.id,
        userId: member.userId,
        role: member.role,
        joinedAt: member.createdAt,
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          image: member.user.image || undefined,
        },
      })),
    };

    return { success: true, team: teamWithMembers };
  } catch (error) {
    logError('Update team error:', error instanceof Error ? error : new Error(String(error)));
    return { error: 'Failed to update team', success: false };
  }
}

/**
 * Deletes a team using better-auth native method
 */
export async function deleteTeamAction(teamId: string): Promise<DeleteTeamResult> {
  try {
    // Use better-auth native removeTeam API
    await auth.api.removeTeam({
      headers: await getAuthHeaders(),
      body: { teamId },
    });

    return { success: true };
  } catch (error) {
    logError('Delete team error:', error instanceof Error ? error : new Error(String(error)));

    // Check if it's a permission error
    if (error instanceof Error && error.message.includes('permission')) {
      return { error: 'Only team owners can delete teams', success: false };
    }

    return { error: 'Failed to delete team', success: false };
  }
}

/**
 * Gets a team by ID using better-auth native method
 */
export async function getTeamAction(teamId: string): Promise<GetTeamResult> {
  try {
    // Use better-auth native getTeam API
    const result = await auth.api.getTeam({
      headers: await getAuthHeaders(),
      query: { teamId },
    });

    if (!result?.team) {
      return { error: 'Team not found or access denied', success: false };
    }

    // Convert better-auth team result to our TeamWithMembers format
    const teamWithMembers: TeamWithMembers = {
      id: result.team.id,
      name: result.team.name,
      organizationId: result.team.organizationId,
      description: result.team.metadata?.description || undefined,
      createdAt: result.team.createdAt,
      updatedAt: result.team.updatedAt || result.team.createdAt,
      memberCount: result.team.members?.length || 0,
      teamMembers: (result.team.members || []).map((member: any) => ({
        id: member.id,
        teamId: result.team.id,
        userId: member.userId,
        role: member.role,
        joinedAt: member.createdAt,
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          image: member.user.image || undefined,
        },
      })),
    };

    return { success: true, team: teamWithMembers };
  } catch (error) {
    logError('Get team error:', error instanceof Error ? error : new Error(String(error)));
    return { error: 'Failed to get team', success: false };
  }
}

/**
 * Lists teams for the current user using better-auth native method
 */
export async function listTeamsAction(organizationId?: string): Promise<ListTeamsResult> {
  try {
    const session = await auth.api.getSession({ headers: await getAuthHeaders() });

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    const sessionWithOrg = session.session as Session;
    const targetOrgId = organizationId || sessionWithOrg.activeOrganizationId;

    // Use better-auth native listTeams API
    const result = await auth.api.listTeams({
      headers: await getAuthHeaders(),
      query: targetOrgId ? { organizationId: targetOrgId } : undefined,
    });

    if (!result) {
      return { error: 'Failed to list teams', success: false };
    }

    // Convert better-auth teams to our TeamWithMembers format
    const teamsWithMembers: TeamWithMembers[] = (result.teams || []).map((team: any) => ({
      id: team.id,
      name: team.name,
      organizationId: team.organizationId,
      description: team.metadata?.description || undefined,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt || team.createdAt,
      memberCount: team.members?.length || 0,
      teamMembers: (team.members || []).map((member: any) => ({
        id: member.id,
        teamId: team.id,
        userId: member.userId,
        role: member.role,
        joinedAt: member.createdAt,
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          image: member.user.image || undefined,
        },
      })),
    }));

    return { success: true, teams: teamsWithMembers, total: teamsWithMembers.length };
  } catch (error) {
    logError('List teams error:', error instanceof Error ? error : new Error(String(error)));
    return { error: 'Failed to list teams', success: false };
  }
}

/**
 * Updates a team member's role using better-auth native method
 */
export async function updateTeamMemberAction(
  data: UpdateTeamMemberData,
): Promise<UpdateTeamMemberResult> {
  try {
    const { role, teamId, userId } = data;

    if (!isValidRole(role)) {
      return { error: 'Invalid role', success: false };
    }

    // Use better-auth native updateTeamMember API
    const result = await auth.api.updateTeamMember({
      headers: await getAuthHeaders(),
      body: {
        teamId,
        userId,
        role,
      },
    });

    if (!result?.member) {
      return { error: 'Failed to update team member', success: false };
    }

    // Convert better-auth member result to our format
    const memberWithUser = {
      id: result.member.id,
      teamId: result.member.teamId,
      userId: result.member.userId,
      role: result.member.role,
      joinedAt: result.member.createdAt,
      user: {
        id: result.member.user.id,
        name: result.member.user.name,
        email: result.member.user.email,
        image: result.member.user.image || undefined,
      },
    };

    return { member: memberWithUser, success: true };
  } catch (error) {
    logError(
      'Update team member error:',
      error instanceof Error ? error : new Error(String(error)),
    );

    // Check if it's a permission error
    if (error instanceof Error && error.message.includes('permission')) {
      return { error: 'Insufficient permissions to update team member', success: false };
    }

    return { error: 'Failed to update team member', success: false };
  }
}

/**
 * Removes a team member using better-auth native method
 */
export async function removeTeamMemberAction(
  teamId: string,
  userId: string,
): Promise<RemoveTeamMemberResult> {
  try {
    // Use better-auth native removeMemberFromTeam API
    await auth.api.removeMemberFromTeam({
      headers: await getAuthHeaders(),
      body: {
        teamId,
        userId,
      },
    });

    return { success: true };
  } catch (error) {
    logError(
      'Remove team member error:',
      error instanceof Error ? error : new Error(String(error)),
    );

    // Check if it's a permission error
    if (error instanceof Error && error.message.includes('permission')) {
      return { error: 'Insufficient permissions to remove team member', success: false };
    }

    // Check if it's a not found error
    if (error instanceof Error && error.message.includes('not found')) {
      return { error: 'User is not a team member', success: false };
    }

    return { error: 'Failed to remove team member', success: false };
  }
}

/**
 * Gets team statistics using better-auth data sources
 */
export async function getTeamStatsAction(teamId: string): Promise<GetTeamStatsResult> {
  try {
    // First get the team to verify access and get basic data
    const teamResult = await auth.api.getTeam({
      headers: await getAuthHeaders(),
      query: { teamId },
    });

    if (!teamResult?.team) {
      return { error: 'Team not found or access denied', success: false };
    }

    const team = teamResult.team;
    const memberCount = team.members?.length || 0;

    // For pending invitations, we'll need to get organization invitations and filter
    // This is a limitation where better-auth doesn't provide team-specific invitation counts
    let pendingInvitations = 0;
    try {
      // Get all pending invitations for the organization and filter by team
      const orgResult = await auth.api.getFullOrganization({
        headers: await getAuthHeaders(),
        query: { organizationId: team.organizationId },
      });

      if (orgResult?.organization?.invitations) {
        pendingInvitations = orgResult.organization.invitations.filter(
          (invitation: any) => invitation.status === 'pending' && invitation.teamId === teamId,
        ).length;
      }
    } catch (invitationError) {
      logWarn('Could not fetch team invitation count', {
        error: invitationError instanceof Error ? invitationError.message : String(invitationError),
      });
      // Continue without invitation count
    }

    const stats: TeamStats = {
      activeMembers: memberCount, // In a real app, you might track last activity
      createdAt: team.createdAt,
      lastActivity: new Date(), // Placeholder - implement based on your activity tracking
      memberCount,
      pendingInvitations,
    };

    return { stats, success: true };
  } catch (error) {
    logError('Get team stats error:', error instanceof Error ? error : new Error(String(error)));
    return { error: 'Failed to get team statistics', success: false };
  }
}

// Aliases for server-actions.ts compatibility
export const addTeamMemberAction = removeTeamMemberAction; // TODO: Implement proper addTeamMember
export const updateTeamMemberRoleAction = updateTeamMemberAction;
export const getTeamMembersAction = getTeamAction; // Returns team with members
export const getUserTeamsAction = listTeamsAction;
export const getTeamByIdAction = getTeamAction;
export const transferTeamOwnershipAction = updateTeamMemberAction; // TODO: Implement proper transfer
export const archiveTeamAction = deleteTeamAction; // TODO: Implement proper archive
export const restoreTeamAction = updateTeamAction; // TODO: Implement proper restore
export const getTeamStatisticsAction = getTeamStatsAction;

// Export aliases for backwards compatibility with tests
export const createTeam = createTeamAction;
export const addTeamMember = addTeamMemberAction;
export const removeTeamMember = removeTeamMemberAction;
