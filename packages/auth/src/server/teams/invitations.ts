/**
 * Team invitation management
 */

import 'server-only';

import { prisma as database } from '@repo/database/prisma';

import { isValidRole, roleHasPermission } from '../../shared/teams/permissions';
import { auth } from '../auth';

import type {
  CancelInvitationResult,
  InviteToTeamData,
  InviteToTeamResult,
  ListTeamInvitationsResult,
  RespondToInvitationData,
  RespondToInvitationResult,
  TeamInvitation,
} from '../../shared/teams/types';

/**
 * Invites a user to join a team
 */
export async function inviteToTeam(data: InviteToTeamData): Promise<InviteToTeamResult> {
  try {
    const session = await auth.api.getSession();

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    const { email, message, role, teamId } = data;

    if (!isValidRole(role)) {
      return { error: 'Invalid role', success: false };
    }

    // Check if user can invite to this team
    const membership = await database.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
      },
    });

    if (!membership || !roleHasPermission(membership.role, 'invitations:create')) {
      return { error: 'Insufficient permissions to invite users', success: false };
    }

    // Get team info for the invitation
    const team = await database.team.findUnique({
      select: {
        id: true,
        name: true,
        organizationId: true,
      },
      where: { id: teamId },
    });

    if (!team) {
      return { error: 'Team not found', success: false };
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
      return { error: 'User is already a team member', success: false };
    }

    // Check if there's already a pending invitation
    const existingInvitation = await database.invitation.findFirst({
      where: {
        email,
        status: 'pending',
        teamId,
      },
    });

    if (existingInvitation) {
      return { error: 'Invitation already pending for this email', success: false };
    }

    // Create the invitation
    const invitation = await database.invitation.create({
      data: {
        id: `invitation_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        email,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        invitedById: session.user.id,
        inviterId: session.user.id,
        organizationId: team.organizationId,
        role,
        status: 'pending',
        teamId,
        ...(message && { message }),
      },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
      },
    });

    const teamInvitation: TeamInvitation = {
      id: invitation.id,
      createdAt: invitation.createdAt,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      invitedBy: invitation.invitedById || '',
      inviter: (invitation as any).invitedBy || null,
      role: invitation.role,
      status: invitation.status as 'pending',
      team: invitation.team || { id: '', name: '', organizationId: '' },
      teamId: invitation.teamId || '',
    };

    // TODO: Send invitation email here
    // await sendTeamInvitationEmail(invitation);

    return { invitation: teamInvitation, success: true };
  } catch (error) {
    console.error('Invite to team error:', error);
    return { error: 'Failed to send invitation', success: false };
  }
}

/**
 * Lists team invitations
 */
export async function listTeamInvitations(
  teamId?: string,
  includeExpired = false,
): Promise<ListTeamInvitationsResult> {
  try {
    const session = await auth.api.getSession();

    if (!session) {
      return { error: 'Authentication required', success: false };
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
        return { error: 'Insufficient permissions', success: false };
      }

      whereConditions.teamId = teamId;
    } else {
      // List invitations for all teams the user manages
      const managedTeams = await database.teamMember.findMany({
        select: {
          role: true,
          teamId: true,
        },
        where: {
          userId: session.user.id,
        },
      });

      const teamIds = managedTeams
        .filter((membership: any) => roleHasPermission(membership.role, 'invitations:create'))
        .map((membership: any) => membership.teamId);

      if (teamIds.length === 0) {
        return { invitations: [], success: true };
      }

      whereConditions.teamId = { in: teamIds };
    }

    if (!includeExpired) {
      whereConditions.status = { not: 'expired' };
    }

    const invitations = await database.invitation.findMany({
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      where: whereConditions,
    });

    const teamInvitations: TeamInvitation[] = invitations
      .filter((inv: any) => inv.teamId && inv.role)
      .map((invitation: any) => ({
        id: invitation.id,
        createdAt: invitation.createdAt,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
        invitedBy: invitation.invitedById,
        inviter: invitation.invitedBy,
        role: invitation.role!,
        status: invitation.status as TeamInvitation['status'],
        team: invitation.team!,
        teamId: invitation.teamId!,
      }));

    return { invitations: teamInvitations, success: true };
  } catch (error) {
    console.error('List team invitations error:', error);
    return { error: 'Failed to list invitations', success: false };
  }
}

/**
 * Responds to a team invitation
 */
export async function respondToInvitation(
  data: RespondToInvitationData,
): Promise<RespondToInvitationResult> {
  try {
    const session = await auth.api.getSession();

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    const { invitationId, response } = data;

    // Get the invitation
    const invitation = await database.invitation.findUnique({
      include: {
        team: true,
      },
      where: { id: invitationId },
    });

    if (!invitation || !invitation.teamId) {
      return { error: 'Invitation not found', success: false };
    }

    // Check if invitation is for the current user
    if (invitation.email !== session.user.email) {
      return { error: 'This invitation is not for you', success: false };
    }

    // Check if invitation is still valid
    if (invitation.status !== 'pending') {
      return { error: 'Invitation is no longer valid', success: false };
    }

    if (invitation.expiresAt < new Date()) {
      await database.invitation.update({
        data: { status: 'expired' },
        where: { id: invitationId },
      });
      return { error: 'Invitation has expired', success: false };
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
          data: { status: 'accepted' },
          where: { id: invitationId },
        });
        return { success: true, teamId: invitation.teamId };
      }

      // Create team membership
      await database.teamMember.create({
        data: {
          role: invitation.role!,
          teamId: invitation.teamId,
          userId: session.user.id,
        },
      });

      // Update invitation status
      await database.invitation.update({
        data: { status: 'accepted' },
        where: { id: invitationId },
      });

      return { success: true, teamId: invitation.teamId };
    } else {
      // Decline invitation
      await database.invitation.update({
        data: { status: 'declined' },
        where: { id: invitationId },
      });

      return { success: true };
    }
  } catch (error) {
    console.error('Respond to invitation error:', error);
    return { error: 'Failed to respond to invitation', success: false };
  }
}

/**
 * Cancels a team invitation
 */
export async function cancelInvitation(invitationId: string): Promise<CancelInvitationResult> {
  try {
    const session = await auth.api.getSession();

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    // Get the invitation
    const invitation = await database.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || !invitation.teamId) {
      return { error: 'Invitation not found', success: false };
    }

    // Check if user can cancel invitations for this team
    const membership = await database.teamMember.findFirst({
      where: {
        teamId: invitation.teamId,
        userId: session.user.id,
      },
    });

    if (!membership || !roleHasPermission(membership.role, 'invitations:cancel')) {
      return { error: 'Insufficient permissions', success: false };
    }

    // Cancel the invitation
    await database.invitation.delete({
      where: { id: invitationId },
    });

    return { success: true };
  } catch (error) {
    console.error('Cancel invitation error:', error);
    return { error: 'Failed to cancel invitation', success: false };
  }
}

/**
 * Gets pending invitations for the current user
 */
export async function getUserPendingInvitations(): Promise<ListTeamInvitationsResult> {
  try {
    const session = await auth.api.getSession();

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    const invitations = await database.invitation.findMany({
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        email: session.user.email,
        expiresAt: { gt: new Date() },
        status: 'pending',
        teamId: { not: null },
      },
    });

    const teamInvitations: TeamInvitation[] = invitations
      .filter((inv: any) => inv.teamId && inv.role)
      .map((invitation: any) => ({
        id: invitation.id,
        createdAt: invitation.createdAt,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
        invitedBy: invitation.invitedById,
        inviter: invitation.invitedBy,
        role: invitation.role!,
        status: invitation.status as 'pending',
        team: invitation.team!,
        teamId: invitation.teamId!,
      }));

    return { invitations: teamInvitations, success: true };
  } catch (error) {
    console.error('Get user pending invitations error:', error);
    return { error: 'Failed to get pending invitations', success: false };
  }
}
