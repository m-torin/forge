/**
 * Server-side team management actions
 */

import 'server-only';

import { prisma as database } from '@repo/database/prisma';

import { canActOnUser, isValidRole, roleHasPermission } from '../../shared/teams/permissions';
import { auth } from '../auth';

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
} from '../../shared/teams/types';

/**
 * Creates a new team
 */
export async function createTeam(data: CreateTeamData): Promise<CreateTeamResult> {
  try {
    const session = await auth.api.getSession();

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    const { name, description, initialMembers = [], organizationId } = data;

    // Use the active organization if none specified
    const teamOrganizationId = organizationId || session.session.activeOrganizationId;

    if (!teamOrganizationId) {
      return { error: 'Organization ID required', success: false };
    }

    // Validate that user is a member of the organization
    const membership = await database.member.findFirst({
      where: {
        organizationId: teamOrganizationId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return { error: 'Not a member of this organization', success: false };
    }

    // Create the team
    const team = await database.team.create({
      data: {
        id: `team_${Math.random().toString(36).substr(2, 9)}`,
        name,
        createdAt: new Date(),
        description,
        teamMembers: {
          create: {
            role: 'owner',
            userId: session.user.id,
          },
        },
        organizationId: teamOrganizationId,
      },
      include: {
        teamMembers: {
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
            id: `invitation_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            email: member.email,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            invitedById: session.user.id,
            organizationId: teamOrganizationId,
            role: member.role,
            status: 'pending',
            teamId: team.id,
          },
        });
      }
    }

    const teamWithMembers: TeamWithMembers = {
      ...team,
      description: team.description || undefined,
      memberCount: team.teamMembers.length,
      teamMembers: team.teamMembers.map((member: any) => ({
        id: member.id,
        joinedAt: member.createdAt,
        role: member.role,
        teamId: member.teamId,
        user: {
          ...member.user,
          image: member.user.image || undefined,
        },
        userId: member.userId,
      })),
      updatedAt: team.updatedAt || team.createdAt,
    };

    return { success: true, team: teamWithMembers };
  } catch (error) {
    console.error('Create team error:', error);
    return { error: 'Failed to create team', success: false };
  }
}

/**
 * Updates a team
 */
export async function updateTeam(teamId: string, data: UpdateTeamData): Promise<UpdateTeamResult> {
  try {
    const session = await auth.api.getSession();

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    // Check if user is a member with write permissions
    const membership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
      },
    });

    if (!membership || !roleHasPermission(membership.role, 'team:write')) {
      return { error: 'Insufficient permissions', success: false };
    }

    const team = await database.team.update({
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        teamMembers: {
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
      where: { id: teamId },
    });

    const teamWithMembers: TeamWithMembers = {
      ...team,
      description: team.description || undefined,
      memberCount: team.teamMembers.length,
      teamMembers: team.teamMembers.map((member: any) => ({
        id: member.id,
        joinedAt: member.createdAt,
        role: member.role,
        teamId: member.teamId,
        user: {
          ...member.user,
          image: member.user.image || undefined,
        },
        userId: member.userId,
      })),
      updatedAt: team.updatedAt || team.createdAt,
    };

    return { success: true, team: teamWithMembers };
  } catch (error) {
    console.error('Update team error:', error);
    return { error: 'Failed to update team', success: false };
  }
}

/**
 * Deletes a team
 */
export async function deleteTeam(teamId: string): Promise<DeleteTeamResult> {
  try {
    const session = await auth.api.getSession();

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    // Check if user is team owner
    const membership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
      },
    });

    if (!membership || membership.role !== 'owner') {
      return { error: 'Only team owners can delete teams', success: false };
    }

    // Delete the team (cascade will handle members and invitations)
    await database.team.delete({
      where: { id: teamId },
    });

    return { success: true };
  } catch (error) {
    console.error('Delete team error:', error);
    return { error: 'Failed to delete team', success: false };
  }
}

/**
 * Gets a team by ID
 */
export async function getTeam(teamId: string): Promise<GetTeamResult> {
  try {
    const session = await auth.api.getSession();

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    const team = await database.team.findFirst({
      include: {
        teamMembers: {
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
      where: {
        id: teamId,
        teamMembers: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!team) {
      return { error: 'Team not found or access denied', success: false };
    }

    const teamWithMembers: TeamWithMembers = {
      ...team,
      description: team.description || undefined,
      memberCount: team.teamMembers.length,
      teamMembers: team.teamMembers.map((member: any) => ({
        id: member.id,
        joinedAt: member.createdAt,
        role: member.role,
        teamId: member.teamId,
        user: {
          ...member.user,
          image: member.user.image || undefined,
        },
        userId: member.userId,
      })),
      updatedAt: team.updatedAt || team.createdAt,
    };

    return { success: true, team: teamWithMembers };
  } catch (error) {
    console.error('Get team error:', error);
    return { error: 'Failed to get team', success: false };
  }
}

/**
 * Lists teams for the current user
 */
export async function listTeams(organizationId?: string): Promise<ListTeamsResult> {
  try {
    const session = await auth.api.getSession();

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    const targetOrgId = organizationId || session.session.activeOrganizationId;

    const teams = await database.team.findMany({
      include: {
        teamMembers: {
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
      where: {
        ...(targetOrgId && { organizationId: targetOrgId }),
        teamMembers: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    const teamsWithMembers: TeamWithMembers[] = teams.map((team: any) => ({
      ...team,
      description: team.description || undefined,
      memberCount: team.teamMembers.length,
      teamMembers: team.teamMembers.map((member: any) => ({
        id: member.id,
        joinedAt: member.createdAt,
        role: member.role,
        teamId: member.teamId,
        user: {
          ...member.user,
          image: member.user.image || undefined,
        },
        userId: member.userId,
      })),
      updatedAt: team.updatedAt || team.createdAt,
    }));

    return { success: true, teams: teamsWithMembers, total: teams.length };
  } catch (error) {
    console.error('List teams error:', error);
    return { error: 'Failed to list teams', success: false };
  }
}

/**
 * Updates a team member's role
 */
export async function updateTeamMember(
  data: UpdateTeamMemberData,
): Promise<UpdateTeamMemberResult> {
  try {
    const session = await auth.api.getSession();

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    const { role, teamId, userId } = data;

    if (!isValidRole(role)) {
      return { error: 'Invalid role', success: false };
    }

    // Check if current user can update members
    const currentUserMembership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
      },
    });

    if (!currentUserMembership || !roleHasPermission(currentUserMembership.role, 'teamMembers:write')) {
      return { error: 'Insufficient permissions', success: false };
    }

    // Get target user's current role
    const targetMembership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (!targetMembership) {
      return { error: 'User is not a team member', success: false };
    }

    // Check if current user can act on target user
    if (!canActOnUser(currentUserMembership.role, targetMembership.role, 'teamMembers:write')) {
      return { error: 'Cannot modify user with equal or higher role', success: false };
    }

    // Update the member's role
    const updatedMember = await database.teamMember.update({
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
      where: {
        id: targetMembership.id,
      },
    });

    const memberWithUser = {
      id: updatedMember.id,
      joinedAt: updatedMember.createdAt,
      role: updatedMember.role,
      teamId: updatedMember.teamId,
      user: {
        ...updatedMember.user,
        image: updatedMember.user.image || undefined,
      },
      userId: updatedMember.userId,
    };

    return { member: memberWithUser, success: true };
  } catch (error) {
    console.error('Update team member error:', error);
    return { error: 'Failed to update team member', success: false };
  }
}

/**
 * Removes a team member
 */
export async function removeTeamMember(
  teamId: string,
  userId: string,
): Promise<RemoveTeamMemberResult> {
  try {
    const session = await auth.api.getSession();

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    // Check if current user can remove members
    const currentUserMembership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
      },
    });

    if (
      !currentUserMembership ||
      !roleHasPermission(currentUserMembership.role, 'teamMembers:remove')
    ) {
      return { error: 'Insufficient permissions', success: false };
    }

    // Get target user's membership
    const targetMembership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (!targetMembership) {
      return { error: 'User is not a team member', success: false };
    }

    // Users can always remove themselves
    if (userId === session.user.id) {
      await database.teamMember.delete({
        where: { id: targetMembership.id },
      });
      return { success: true };
    }

    // Check if current user can act on target user
    if (!canActOnUser(currentUserMembership.role, targetMembership.role, 'teamMembers:remove')) {
      return { error: 'Cannot remove user with equal or higher role', success: false };
    }

    // Remove the member
    await database.teamMember.delete({
      where: { id: targetMembership.id },
    });

    return { success: true };
  } catch (error) {
    console.error('Remove team member error:', error);
    return { error: 'Failed to remove team member', success: false };
  }
}

/**
 * Gets team statistics
 */
export async function getTeamStats(teamId: string): Promise<GetTeamStatsResult> {
  try {
    const session = await auth.api.getSession();

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    // Check if user is a team member
    const membership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return { error: 'Access denied', success: false };
    }

    const [team, memberCount, pendingInvitations] = await Promise.all([
      database.team.findUnique({
        select: { createdAt: true },
        where: { id: teamId },
      }),
      database.teamMember.count({
        where: { teamId },
      }),
      database.invitation.count({
        where: {
          status: 'pending',
          teamId,
        },
      }),
    ]);

    if (!team) {
      return { error: 'Team not found', success: false };
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
    console.error('Get team stats error:', error);
    return { error: 'Failed to get team statistics', success: false };
  }
}
