/**
 * Server-side team management actions
 */

import 'server-only';
import { prisma as database } from '@repo/database/prisma';
import { auth } from '../auth';
import { 
  DEFAULT_TEAM_ROLES, 
  roleHasPermission, 
  canActOnUser,
  isValidRole,
} from '../../shared/teams/permissions';

import type {
  CreateTeamData,
  CreateTeamResult,
  UpdateTeamData,
  UpdateTeamResult,
  DeleteTeamResult,
  GetTeamResult,
  ListTeamsResult,
  TeamWithMembers,
  UpdateTeamMemberData,
  UpdateTeamMemberResult,
  RemoveTeamMemberResult,
  TeamStats,
  GetTeamStatsResult,
} from '../../shared/teams/types';

/**
 * Creates a new team
 */
export async function createTeam(data: CreateTeamData): Promise<CreateTeamResult> {
  try {
    const session = await auth.api.getSession();
    
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    const { name, description, organizationId, initialMembers = [] } = data;

    // Use the active organization if none specified
    const teamOrganizationId = organizationId || session.session.activeOrganizationId;
    
    if (!teamOrganizationId) {
      return { success: false, error: 'Organization ID required' };
    }

    // Validate that user is a member of the organization
    const membership = await database.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: teamOrganizationId,
      },
    });

    if (!membership) {
      return { success: false, error: 'Not a member of this organization' };
    }

    // Create the team
    const team = await database.team.create({
      data: {
        name,
        description,
        organizationId: teamOrganizationId,
        members: {
          create: {
            userId: session.user.id,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Process initial member invitations
    for (const member of initialMembers) {
      if (member.email !== session.user.email && isValidRole(member.role)) {
        // Create invitation for each initial member
        await database.invitation.create({
          data: {
            email: member.email,
            role: member.role,
            teamId: team.id,
            organizationId: teamOrganizationId,
            invitedById: session.user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        });
      }
    }

    const teamWithMembers: TeamWithMembers = {
      ...team,
      memberCount: team.members.length,
      members: team.members.map((member: any) => ({
        id: member.id,
        userId: member.userId,
        teamId: member.teamId,
        role: member.role,
        joinedAt: member.createdAt,
        user: member.user,
      })),
    };

    return { success: true, team: teamWithMembers };
  } catch (error) {
    console.error('Create team error:', error);
    return { success: false, error: 'Failed to create team' };
  }
}

/**
 * Updates a team
 */
export async function updateTeam(
  teamId: string,
  data: UpdateTeamData
): Promise<UpdateTeamResult> {
  try {
    const session = await auth.api.getSession();
    
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if user is a member with write permissions
    const membership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
      },
    });

    if (!membership || !roleHasPermission(membership.role, 'team:write')) {
      return { success: false, error: 'Insufficient permissions' };
    }

    const team = await database.team.update({
      where: { id: teamId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    const teamWithMembers: TeamWithMembers = {
      ...team,
      memberCount: team.members.length,
      members: team.members.map((member: any) => ({
        id: member.id,
        userId: member.userId,
        teamId: member.teamId,
        role: member.role,
        joinedAt: member.createdAt,
        user: member.user,
      })),
    };

    return { success: true, team: teamWithMembers };
  } catch (error) {
    console.error('Update team error:', error);
    return { success: false, error: 'Failed to update team' };
  }
}

/**
 * Deletes a team
 */
export async function deleteTeam(teamId: string): Promise<DeleteTeamResult> {
  try {
    const session = await auth.api.getSession();
    
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if user is team owner
    const membership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
      },
    });

    if (!membership || membership.role !== 'owner') {
      return { success: false, error: 'Only team owners can delete teams' };
    }

    // Delete the team (cascade will handle members and invitations)
    await database.team.delete({
      where: { id: teamId },
    });

    return { success: true };
  } catch (error) {
    console.error('Delete team error:', error);
    return { success: false, error: 'Failed to delete team' };
  }
}

/**
 * Gets a team by ID
 */
export async function getTeam(teamId: string): Promise<GetTeamResult> {
  try {
    const session = await auth.api.getSession();
    
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    const team = await database.team.findFirst({
      where: {
        id: teamId,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return { success: false, error: 'Team not found or access denied' };
    }

    const teamWithMembers: TeamWithMembers = {
      ...team,
      memberCount: team.members.length,
      members: team.members.map((member: any) => ({
        id: member.id,
        userId: member.userId,
        teamId: member.teamId,
        role: member.role,
        joinedAt: member.createdAt,
        user: member.user,
      })),
    };

    return { success: true, team: teamWithMembers };
  } catch (error) {
    console.error('Get team error:', error);
    return { success: false, error: 'Failed to get team' };
  }
}

/**
 * Lists teams for the current user
 */
export async function listTeams(organizationId?: string): Promise<ListTeamsResult> {
  try {
    const session = await auth.api.getSession();
    
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    const targetOrgId = organizationId || session.session.activeOrganizationId;

    const teams = await database.team.findMany({
      where: {
        ...(targetOrgId && { organizationId: targetOrgId }),
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const teamsWithMembers: TeamWithMembers[] = teams.map((team: any) => ({
      ...team,
      memberCount: team.members.length,
      members: team.members.map((member: any) => ({
        id: member.id,
        userId: member.userId,
        teamId: member.teamId,
        role: member.role,
        joinedAt: member.createdAt,
        user: member.user,
      })),
    }));

    return { success: true, teams: teamsWithMembers, total: teams.length };
  } catch (error) {
    console.error('List teams error:', error);
    return { success: false, error: 'Failed to list teams' };
  }
}

/**
 * Updates a team member's role
 */
export async function updateTeamMember(data: UpdateTeamMemberData): Promise<UpdateTeamMemberResult> {
  try {
    const session = await auth.api.getSession();
    
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    const { teamId, userId, role } = data;

    if (!isValidRole(role)) {
      return { success: false, error: 'Invalid role' };
    }

    // Check if current user can update members
    const currentUserMembership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
      },
    });

    if (!currentUserMembership || !roleHasPermission(currentUserMembership.role, 'members:write')) {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Get target user's current role
    const targetMembership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (!targetMembership) {
      return { success: false, error: 'User is not a team member' };
    }

    // Check if current user can act on target user
    if (!canActOnUser(currentUserMembership.role, targetMembership.role, 'members:write')) {
      return { success: false, error: 'Cannot modify user with equal or higher role' };
    }

    // Update the member's role
    const updatedMember = await database.teamMember.update({
      where: {
        id: targetMembership.id,
      },
      data: {
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    const memberWithUser = {
      id: updatedMember.id,
      userId: updatedMember.userId,
      teamId: updatedMember.teamId,
      role: updatedMember.role,
      joinedAt: updatedMember.createdAt,
      user: updatedMember.user,
    };

    return { success: true, member: memberWithUser };
  } catch (error) {
    console.error('Update team member error:', error);
    return { success: false, error: 'Failed to update team member' };
  }
}

/**
 * Removes a team member
 */
export async function removeTeamMember(
  teamId: string,
  userId: string
): Promise<RemoveTeamMemberResult> {
  try {
    const session = await auth.api.getSession();
    
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if current user can remove members
    const currentUserMembership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
      },
    });

    if (!currentUserMembership || !roleHasPermission(currentUserMembership.role, 'members:remove')) {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Get target user's membership
    const targetMembership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (!targetMembership) {
      return { success: false, error: 'User is not a team member' };
    }

    // Users can always remove themselves
    if (userId === session.user.id) {
      await database.teamMember.delete({
        where: { id: targetMembership.id },
      });
      return { success: true };
    }

    // Check if current user can act on target user
    if (!canActOnUser(currentUserMembership.role, targetMembership.role, 'members:remove')) {
      return { success: false, error: 'Cannot remove user with equal or higher role' };
    }

    // Remove the member
    await database.teamMember.delete({
      where: { id: targetMembership.id },
    });

    return { success: true };
  } catch (error) {
    console.error('Remove team member error:', error);
    return { success: false, error: 'Failed to remove team member' };
  }
}

/**
 * Gets team statistics
 */
export async function getTeamStats(teamId: string): Promise<GetTeamStatsResult> {
  try {
    const session = await auth.api.getSession();
    
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if user is a team member
    const membership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return { success: false, error: 'Access denied' };
    }

    const [team, memberCount, pendingInvitations] = await Promise.all([
      database.team.findUnique({
        where: { id: teamId },
        select: { createdAt: true },
      }),
      database.teamMember.count({
        where: { teamId },
      }),
      database.invitation.count({
        where: {
          teamId,
          status: 'pending',
        },
      }),
    ]);

    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    const stats: TeamStats = {
      memberCount,
      activeMembers: memberCount, // In a real app, you might track last activity
      pendingInvitations,
      createdAt: team.createdAt,
      lastActivity: new Date(), // Placeholder - implement based on your activity tracking
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Get team stats error:', error);
    return { success: false, error: 'Failed to get team statistics' };
  }
}