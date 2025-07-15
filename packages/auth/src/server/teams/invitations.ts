/**
 * Team invitation management
 */

import 'server-only';

import { logError, logWarn } from '@repo/observability/server/next';
import { auth } from '../../shared/auth';
import { isValidRole, roleHasPermission } from '../../shared/teams';
import { getAuthHeaders } from '../get-headers';

import type {
  CancelInvitationResult,
  InviteToTeamData,
  InviteToTeamResult,
  ListTeamInvitationsResult,
  RespondToInvitationData,
  RespondToInvitationResult,
  TeamInvitation,
} from '../../shared/teams';

/**
 * Invites a user to join a team using better-auth native method
 */
export async function inviteToTeamAction(data: InviteToTeamData): Promise<InviteToTeamResult> {
  try {
    const session = await auth.api.getSession({ headers: await getAuthHeaders() });

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    const { email, message, role, teamId } = data;

    if (!isValidRole(role)) {
      return { error: 'Invalid role', success: false };
    }

    // Get team info using better-auth to check permissions and get organization ID
    const teamResult = await auth.api.getTeam({
      headers: await getAuthHeaders(),
      query: { teamId },
    });

    if (!teamResult?.team) {
      return { error: 'Team not found or access denied', success: false };
    }

    // Check if current user has permission to invite to this team
    const membership = (teamResult.team.members || []).find(
      (member: any) => member.userId === session.user.id,
    );

    if (!membership || !roleHasPermission(membership.role, 'invitations:create')) {
      return { error: 'Insufficient permissions to invite users', success: false };
    }

    // Check if user is already a team member
    const existingMember = (teamResult.team.members || []).find(
      (member: any) => member.user?.email === email,
    );

    if (existingMember) {
      return { error: 'User is already a team member', success: false };
    }

    // Use better-auth native inviteUser API with teamId for team invitation
    const result = await auth.api.inviteUser({
      body: {
        email,
        organizationId: teamResult.team.organizationId,
        role: role as any, // Convert team role to organization role
        teamId,
        ...(message && { message }),
      },
      headers: await getAuthHeaders(),
    });

    if (!result?.invitation) {
      return { error: 'Failed to send invitation', success: false };
    }

    // Convert better-auth invitation to our TeamInvitation format
    const teamInvitation: TeamInvitation = {
      id: result.invitation.id,
      createdAt: result.invitation.createdAt,
      email: result.invitation.email,
      expiresAt: result.invitation.expiresAt,
      invitedBy: result.invitation.invitedById || session.user.id,
      inviter: {
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
      },
      role: result.invitation.role,
      status: result.invitation.status as 'pending',
      team: {
        id: teamResult.team.id,
        name: teamResult.team.name,
        organizationId: teamResult.team.organizationId,
      },
      teamId,
    };

    return { invitation: teamInvitation, success: true };
  } catch (error) {
    logError('Invite to team error:', error instanceof Error ? error : new Error(String(error)));

    // Handle specific better-auth errors
    if (error instanceof Error) {
      if (error.message.includes('already invited')) {
        return { error: 'Invitation already pending for this email', success: false };
      }
      if (error.message.includes('already member')) {
        return { error: 'User is already a team member', success: false };
      }
    }

    return { error: 'Failed to send invitation', success: false };
  }
}

/**
 * Lists team invitations using better-auth native method
 */
export async function listTeamInvitationsAction(
  teamId?: string,
  includeExpired = false,
): Promise<ListTeamInvitationsResult> {
  try {
    const session = await auth.api.getSession({ headers: await getAuthHeaders() });

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    if (teamId) {
      // Check if user can view invitations for this specific team
      const teamResult = await auth.api.getTeam({
        headers: await getAuthHeaders(),
        query: { teamId },
      });

      if (!teamResult?.team) {
        return { error: 'Team not found or access denied', success: false };
      }

      const membership = (teamResult.team.members || []).find(
        (member: any) => member.userId === session.user.id,
      );

      if (!membership || !roleHasPermission(membership.role, 'invitations:create')) {
        return { error: 'Insufficient permissions', success: false };
      }

      // Get organization invitations and filter for this team
      const invitationsResult = await auth.api.listInvitations({
        query: { organizationId: teamResult.team.organizationId },
        headers: await getAuthHeaders(),
      });

      const invitations = Array.isArray(invitationsResult)
        ? invitationsResult
        : [invitationsResult];
      const teamInvitations = invitations.filter(
        (inv: any) =>
          inv?.teamId === teamId &&
          (includeExpired ||
            (inv?.status !== 'expired' && inv?.expiresAt && new Date(inv.expiresAt) > new Date())),
      );

      const formattedInvitations: TeamInvitation[] = teamInvitations.map((invitation: any) => ({
        id: invitation.id,
        createdAt: invitation.createdAt,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
        invitedBy: invitation.invitedById || '',
        inviter: invitation.inviter || null,
        role: invitation.role,
        status: invitation.status as TeamInvitation['status'],
        team: {
          id: teamResult.team.id,
          name: teamResult.team.name,
          organizationId: teamResult.team.organizationId,
        },
        teamId: invitation.teamId,
      }));

      return { invitations: formattedInvitations, success: true };
    } else {
      // List invitations for all teams the user manages
      // First get all teams user is a member of
      const teamsResult = await auth.api.listTeams({
        headers: await getAuthHeaders(),
      });

      const managedTeams = (teamsResult?.teams || []).filter((team: any) => {
        const membership = (team.members || []).find(
          (member: any) => member.userId === session.user.id,
        );
        return membership && roleHasPermission(membership.role, 'invitations:create');
      });

      if (managedTeams.length === 0) {
        return { invitations: [], success: true };
      }

      // Get all team invitations for each managed team's organization
      const allInvitations: TeamInvitation[] = [];

      for (const team of managedTeams) {
        try {
          const invitationsResult = await auth.api.listInvitations({
            query: { organizationId: team.organizationId },
            headers: await getAuthHeaders(),
          });

          const invitations = Array.isArray(invitationsResult)
            ? invitationsResult
            : [invitationsResult];
          const teamInvitations = invitations.filter(
            (inv: any) =>
              inv?.teamId &&
              managedTeams.some((t: any) => t.id === inv.teamId) &&
              (includeExpired ||
                (inv?.status !== 'expired' &&
                  inv?.expiresAt &&
                  new Date(inv.expiresAt) > new Date())),
          );

          teamInvitations.forEach((invitation: any) => {
            const teamData = managedTeams.find((t: any) => t.id === invitation.teamId);
            allInvitations.push({
              id: invitation.id,
              createdAt: invitation.createdAt,
              email: invitation.email,
              expiresAt: invitation.expiresAt,
              invitedBy: invitation.invitedById || '',
              inviter: invitation.inviter || null,
              role: invitation.role,
              status: invitation.status as TeamInvitation['status'],
              team: teamData
                ? {
                    id: teamData.id,
                    name: teamData.name,
                    organizationId: teamData.organizationId,
                  }
                : { id: '', name: '', organizationId: '' },
              teamId: invitation.teamId,
            });
          });
        } catch (teamError) {
          logWarn(`Failed to get invitations for team ${team.id}`, {
            teamId: team.id,
            error: teamError instanceof Error ? teamError.message : String(teamError),
          });
        }
      }

      // Sort by creation date (newest first)
      allInvitations.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return { invitations: allInvitations, success: true };
    }
  } catch (error) {
    logError(
      'List team invitations error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return { error: 'Failed to list invitations', success: false };
  }
}

/**
 * Responds to a team invitation using better-auth native method
 */
export async function respondToInvitationAction(
  data: RespondToInvitationData,
): Promise<RespondToInvitationResult> {
  try {
    const session = await auth.api.getSession({ headers: await getAuthHeaders() });

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    const { invitationId, response } = data;

    if (response === 'accept') {
      // Use better-auth native acceptInvitation API
      const result = await auth.api.acceptInvitation({
        body: { invitationId },
        headers: await getAuthHeaders(),
      });

      if (!result?.invitation) {
        return { error: 'Failed to accept invitation', success: false };
      }

      // If it's a team invitation, return the teamId
      const teamId = result.invitation.teamId;
      return { success: true, teamId };
    } else {
      // Use better-auth native rejectInvitation API
      await auth.api.rejectInvitation({
        body: { invitationId },
        headers: await getAuthHeaders(),
      });

      return { success: true };
    }
  } catch (error) {
    logError(
      'Respond to invitation error:',
      error instanceof Error ? error : new Error(String(error)),
    );

    // Handle specific better-auth errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return { error: 'Invitation not found', success: false };
      }
      if (error.message.includes('expired')) {
        return { error: 'Invitation has expired', success: false };
      }
      if (error.message.includes('not for you')) {
        return { error: 'This invitation is not for you', success: false };
      }
      if (error.message.includes('no longer valid')) {
        return { error: 'Invitation is no longer valid', success: false };
      }
    }

    return { error: 'Failed to respond to invitation', success: false };
  }
}

/**
 * Cancels a team invitation using better-auth native method
 */
export async function cancelInvitationAction(
  invitationId: string,
): Promise<CancelInvitationResult> {
  try {
    const session = await auth.api.getSession({ headers: await getAuthHeaders() });

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    // Use better-auth native cancelInvitation API
    // Note: better-auth handles permission checking internally
    await auth.api.cancelInvitation({
      body: { invitationId },
      headers: await getAuthHeaders(),
    });

    return { success: true };
  } catch (error) {
    logError('Cancel invitation error:', error instanceof Error ? error : new Error(String(error)));

    // Handle specific better-auth errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return { error: 'Invitation not found', success: false };
      }
      if (error.message.includes('permission')) {
        return { error: 'Insufficient permissions', success: false };
      }
    }

    return { error: 'Failed to cancel invitation', success: false };
  }
}

/**
 * Gets pending invitations for the current user using better-auth native method
 */
export async function getUserPendingInvitationsAction(): Promise<ListTeamInvitationsResult> {
  try {
    const session = await auth.api.getSession({ headers: await getAuthHeaders() });

    if (!session) {
      return { error: 'Authentication required', success: false };
    }

    // Use better-auth native listInvitations for the current user
    // This will get all pending invitations for the user's email
    const invitationsResult = await auth.api.listInvitations({
      headers: await getAuthHeaders(),
    });

    const allInvitations = Array.isArray(invitationsResult)
      ? invitationsResult
      : [invitationsResult];

    // Filter for team invitations that are pending and for the current user
    const teamInvitations = allInvitations.filter(
      (inv: any) =>
        inv?.email === session.user.email &&
        inv?.teamId &&
        inv?.status === 'pending' &&
        inv?.expiresAt &&
        new Date(inv.expiresAt) > new Date(),
    );

    // For each team invitation, we need to get team details
    const formattedInvitations: TeamInvitation[] = [];

    for (const invitation of teamInvitations) {
      try {
        // Get team details for each invitation
        const teamResult = await auth.api.getTeam({
          headers: await getAuthHeaders(),
          query: { teamId: invitation.teamId },
        });

        if (teamResult?.team) {
          formattedInvitations.push({
            id: invitation.id,
            createdAt: invitation.createdAt,
            email: invitation.email,
            expiresAt: invitation.expiresAt,
            invitedBy: invitation.invitedById || '',
            inviter: invitation.inviter || null,
            role: invitation.role,
            status: 'pending',
            team: {
              id: teamResult.team.id,
              name: teamResult.team.name,
              organizationId: teamResult.team.organizationId,
            },
            teamId: invitation.teamId,
          });
        }
      } catch (teamError) {
        logWarn(`Failed to get team details for invitation ${invitation.id}`, {
          invitationId: invitation.id,
          error: teamError instanceof Error ? teamError.message : String(teamError),
        });
        // Continue with other invitations even if one team lookup fails
      }
    }

    // Sort by creation date (newest first)
    formattedInvitations.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return { invitations: formattedInvitations, success: true };
  } catch (error) {
    logError(
      'Get user pending invitations error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return { error: 'Failed to get pending invitations', success: false };
  }
}
