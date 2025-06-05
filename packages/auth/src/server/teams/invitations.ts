/**
 * Team invitation management
 */

import 'server-only';
import { prisma as database } from '@repo/database/prisma';
import { auth } from '../auth';
import { roleHasPermission, isValidRole } from '../../shared/teams/permissions';

import type {
  InviteToTeamData,
  InviteToTeamResult,
  ListTeamInvitationsResult,
  RespondToInvitationData,
  RespondToInvitationResult,
  CancelInvitationResult,
  TeamInvitation,
} from '../../shared/teams/types';

/**
 * Invites a user to join a team
 */
export async function inviteToTeam(data: InviteToTeamData): Promise<InviteToTeamResult> {
  try {
    const session = await auth.api.getSession();
    
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    const { teamId, email, role, message } = data;

    if (!isValidRole(role)) {
      return { success: false, error: 'Invalid role' };
    }

    // Check if user can invite to this team
    const membership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
      },
    });

    if (!membership || !roleHasPermission(membership.role, 'invitations:create')) {
      return { success: false, error: 'Insufficient permissions to invite users' };
    }

    // Get team info for the invitation
    const team = await database.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        organizationId: true,
      },
    });

    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    // Check if user is already a team member
    const existingMember = await database.teamMember.findFirst({
      where: {
        teamId,
        user: {
          email,
        },
      },
    });

    if (existingMember) {
      return { success: false, error: 'User is already a team member' };
    }

    // Check if there's already a pending invitation
    const existingInvitation = await database.invitation.findFirst({
      where: {
        teamId,
        email,
        status: 'pending',
      },
    });

    if (existingInvitation) {
      return { success: false, error: 'Invitation already pending for this email' };
    }

    // Create the invitation
    const invitation = await database.invitation.create({
      data: {
        email,
        role,
        teamId,
        organizationId: team.organizationId,
        invitedById: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending',
        ...(message && { message }),
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const teamInvitation: TeamInvitation = {
      id: invitation.id,
      teamId: invitation.teamId!,
      email: invitation.email,
      role: invitation.role!,
      invitedBy: invitation.invitedById,
      expiresAt: invitation.expiresAt,
      status: invitation.status as 'pending',
      createdAt: invitation.createdAt,
      team: invitation.team!,
      inviter: invitation.invitedBy,
    };

    // TODO: Send invitation email here
    // await sendTeamInvitationEmail(invitation);

    return { success: true, invitation: teamInvitation };
  } catch (error) {
    console.error('Invite to team error:', error);
    return { success: false, error: 'Failed to send invitation' };
  }
}

/**
 * Lists team invitations
 */
export async function listTeamInvitations(
  teamId?: string,
  includeExpired = false
): Promise<ListTeamInvitationsResult> {
  try {
    const session = await auth.api.getSession();
    
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    const whereConditions: any = {};

    if (teamId) {
      // Check if user can view invitations for this team
      const membership = await database.teamMember.findFirst({
        where: {
          teamId,
          userId: session.user.id,
        },
      });

      if (!membership || !roleHasPermission(membership.role, 'invitations:create')) {
        return { success: false, error: 'Insufficient permissions' };
      }

      whereConditions.teamId = teamId;
    } else {
      // List invitations for all teams the user manages
      const managedTeams = await database.teamMember.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          teamId: true,
          role: true,
        },
      });

      const teamIds = managedTeams
        .filter((membership: any) => roleHasPermission(membership.role, 'invitations:create'))
        .map((membership: any) => membership.teamId);

      if (teamIds.length === 0) {
        return { success: true, invitations: [] };
      }

      whereConditions.teamId = { in: teamIds };
    }

    if (!includeExpired) {
      whereConditions.status = { not: 'expired' };
    }

    const invitations = await database.invitation.findMany({
      where: whereConditions,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const teamInvitations: TeamInvitation[] = invitations
      .filter((inv: any) => inv.teamId && inv.role)
      .map((invitation: any) => ({
        id: invitation.id,
        teamId: invitation.teamId!,
        email: invitation.email,
        role: invitation.role!,
        invitedBy: invitation.invitedById,
        expiresAt: invitation.expiresAt,
        status: invitation.status as TeamInvitation['status'],
        createdAt: invitation.createdAt,
        team: invitation.team!,
        inviter: invitation.invitedBy,
      }));

    return { success: true, invitations: teamInvitations };
  } catch (error) {
    console.error('List team invitations error:', error);
    return { success: false, error: 'Failed to list invitations' };
  }
}

/**
 * Responds to a team invitation
 */
export async function respondToInvitation(data: RespondToInvitationData): Promise<RespondToInvitationResult> {
  try {
    const session = await auth.api.getSession();
    
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    const { invitationId, response } = data;

    // Get the invitation
    const invitation = await database.invitation.findUnique({
      where: { id: invitationId },
      include: {
        team: true,
      },
    });

    if (!invitation || !invitation.teamId) {
      return { success: false, error: 'Invitation not found' };
    }

    // Check if invitation is for the current user
    if (invitation.email !== session.user.email) {
      return { success: false, error: 'This invitation is not for you' };
    }

    // Check if invitation is still valid
    if (invitation.status !== 'pending') {
      return { success: false, error: 'Invitation is no longer valid' };
    }

    if (invitation.expiresAt < new Date()) {
      await database.invitation.update({
        where: { id: invitationId },
        data: { status: 'expired' },
      });
      return { success: false, error: 'Invitation has expired' };
    }

    if (response === 'accept') {
      // Check if user is already a team member
      const existingMember = await database.teamMember.findFirst({
        where: {
          teamId: invitation.teamId,
          userId: session.user.id,
        },
      });

      if (existingMember) {
        // Update invitation status but don't create duplicate membership
        await database.invitation.update({
          where: { id: invitationId },
          data: { status: 'accepted' },
        });
        return { success: true, teamId: invitation.teamId };
      }

      // Create team membership
      await database.teamMember.create({
        data: {
          teamId: invitation.teamId,
          userId: session.user.id,
          role: invitation.role!,
        },
      });

      // Update invitation status
      await database.invitation.update({
        where: { id: invitationId },
        data: { status: 'accepted' },
      });

      return { success: true, teamId: invitation.teamId };
    } else {
      // Decline invitation
      await database.invitation.update({
        where: { id: invitationId },
        data: { status: 'declined' },
      });

      return { success: true };
    }
  } catch (error) {
    console.error('Respond to invitation error:', error);
    return { success: false, error: 'Failed to respond to invitation' };
  }
}

/**
 * Cancels a team invitation
 */
export async function cancelInvitation(invitationId: string): Promise<CancelInvitationResult> {
  try {
    const session = await auth.api.getSession();
    
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    // Get the invitation
    const invitation = await database.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || !invitation.teamId) {
      return { success: false, error: 'Invitation not found' };
    }

    // Check if user can cancel invitations for this team
    const membership = await database.teamMember.findFirst({
      where: {
        teamId: invitation.teamId,
        userId: session.user.id,
      },
    });

    if (!membership || !roleHasPermission(membership.role, 'invitations:cancel')) {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Cancel the invitation
    await database.invitation.delete({
      where: { id: invitationId },
    });

    return { success: true };
  } catch (error) {
    console.error('Cancel invitation error:', error);
    return { success: false, error: 'Failed to cancel invitation' };
  }
}

/**
 * Gets pending invitations for the current user
 */
export async function getUserPendingInvitations(): Promise<ListTeamInvitationsResult> {
  try {
    const session = await auth.api.getSession();
    
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    const invitations = await database.invitation.findMany({
      where: {
        email: session.user.email,
        status: 'pending',
        teamId: { not: null },
        expiresAt: { gt: new Date() },
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const teamInvitations: TeamInvitation[] = invitations
      .filter((inv: any) => inv.teamId && inv.role)
      .map((invitation: any) => ({
        id: invitation.id,
        teamId: invitation.teamId!,
        email: invitation.email,
        role: invitation.role!,
        invitedBy: invitation.invitedById,
        expiresAt: invitation.expiresAt,
        status: invitation.status as 'pending',
        createdAt: invitation.createdAt,
        team: invitation.team!,
        inviter: invitation.invitedBy,
      }));

    return { success: true, invitations: teamInvitations };
  } catch (error) {
    console.error('Get user pending invitations error:', error);
    return { success: false, error: 'Failed to get pending invitations' };
  }
}