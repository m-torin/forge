/**
 * Client-side team management methods
 */

import type {
  CreateTeamData,
  CreateTeamResult,
  DeleteTeamResult,
  GetTeamResult,
  GetTeamStatsResult,
  InviteToTeamData,
  InviteToTeamResult,
  ListTeamInvitationsResult,
  ListTeamsResult,
  RemoveTeamMemberResult,
  RespondToInvitationData,
  RespondToInvitationResult,
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
    const response = await fetch('/api/auth/teams', {
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create team',
      success: false,
    };
  }
}

/**
 * Updates a team
 */
export async function updateTeam(teamId: string, data: UpdateTeamData): Promise<UpdateTeamResult> {
  try {
    const response = await fetch(`/api/auth/teams/${teamId}`, {
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    });

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update team',
      success: false,
    };
  }
}

/**
 * Deletes a team
 */
export async function deleteTeam(teamId: string): Promise<DeleteTeamResult> {
  try {
    const response = await fetch(`/api/auth/teams/${teamId}`, {
      credentials: 'include',
      method: 'DELETE',
    });

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete team',
      success: false,
    };
  }
}

/**
 * Gets a team by ID
 */
export async function getTeam(teamId: string): Promise<GetTeamResult> {
  try {
    const response = await fetch(`/api/auth/teams/${teamId}`, {
      credentials: 'include',
      method: 'GET',
    });

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get team',
      success: false,
    };
  }
}

/**
 * Lists teams for the current user
 */
export async function listTeams(organizationId?: string): Promise<ListTeamsResult> {
  try {
    const url = new URL('/api/auth/teams', window.location.origin);
    if (organizationId) {
      url.searchParams.set('organizationId', organizationId);
    }

    const response = await fetch(url.toString(), {
      credentials: 'include',
      method: 'GET',
    });

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to list teams',
      success: false,
    };
  }
}

/**
 * Invites a user to join a team
 */
export async function inviteToTeam(data: InviteToTeamData): Promise<InviteToTeamResult> {
  try {
    const response = await fetch('/api/auth/teams/invitations', {
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to send invitation',
      success: false,
    };
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
    const url = new URL('/api/auth/teams/invitations', window.location.origin);
    if (teamId) {
      url.searchParams.set('teamId', teamId);
    }
    if (includeExpired) {
      url.searchParams.set('includeExpired', 'true');
    }

    const response = await fetch(url.toString(), {
      credentials: 'include',
      method: 'GET',
    });

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to list invitations',
      success: false,
    };
  }
}

/**
 * Responds to a team invitation
 */
export async function respondToInvitation(
  data: RespondToInvitationData,
): Promise<RespondToInvitationResult> {
  try {
    const response = await fetch(`/api/auth/teams/invitations/${data.invitationId}/respond`, {
      body: JSON.stringify({ response: data.response }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to respond to invitation',
      success: false,
    };
  }
}

/**
 * Cancels a team invitation
 */
export async function cancelInvitation(invitationId: string) {
  try {
    const response = await fetch(`/api/auth/teams/invitations/${invitationId}`, {
      credentials: 'include',
      method: 'DELETE',
    });

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to cancel invitation',
      success: false,
    };
  }
}

/**
 * Updates a team member's role
 */
export async function updateTeamMember(
  data: UpdateTeamMemberData,
): Promise<UpdateTeamMemberResult> {
  try {
    const response = await fetch(`/api/auth/teams/${data.teamId}/members/${data.userId}`, {
      body: JSON.stringify({ role: data.role }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    });

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update team member',
      success: false,
    };
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
    const response = await fetch(`/api/auth/teams/${teamId}/members/${userId}`, {
      credentials: 'include',
      method: 'DELETE',
    });

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to remove team member',
      success: false,
    };
  }
}

/**
 * Gets team statistics
 */
export async function getTeamStats(teamId: string): Promise<GetTeamStatsResult> {
  try {
    const response = await fetch(`/api/auth/teams/${teamId}/stats`, {
      credentials: 'include',
      method: 'GET',
    });

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get team statistics',
      success: false,
    };
  }
}

/**
 * Gets pending invitations for the current user
 */
export async function getUserPendingInvitations(): Promise<ListTeamInvitationsResult> {
  try {
    const response = await fetch('/api/auth/teams/invitations/pending', {
      credentials: 'include',
      method: 'GET',
    });

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get pending invitations',
      success: false,
    };
  }
}

/**
 * Leaves a team (removes current user from team)
 */
export async function leaveTeam(teamId: string): Promise<RemoveTeamMemberResult> {
  try {
    const response = await fetch(`/api/auth/teams/${teamId}/leave`, {
      credentials: 'include',
      method: 'POST',
    });

    return await response.json();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to leave team',
      success: false,
    };
  }
}
