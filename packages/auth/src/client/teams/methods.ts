/**
 * Client-side team management methods
 */

import type {
  CreateTeamData,
  CreateTeamResult,
  UpdateTeamData,
  UpdateTeamResult,
  DeleteTeamResult,
  GetTeamResult,
  ListTeamsResult,
  InviteToTeamData,
  InviteToTeamResult,
  ListTeamInvitationsResult,
  RespondToInvitationData,
  RespondToInvitationResult,
  UpdateTeamMemberData,
  UpdateTeamMemberResult,
  RemoveTeamMemberResult,
  GetTeamStatsResult,
} from '../../shared/teams/types';

/**
 * Creates a new team
 */
export async function createTeam(data: CreateTeamData): Promise<CreateTeamResult> {
  try {
    const response = await fetch('/api/auth/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create team',
    };
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
    const response = await fetch(`/api/auth/teams/${teamId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update team',
    };
  }
}

/**
 * Deletes a team
 */
export async function deleteTeam(teamId: string): Promise<DeleteTeamResult> {
  try {
    const response = await fetch(`/api/auth/teams/${teamId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete team',
    };
  }
}

/**
 * Gets a team by ID
 */
export async function getTeam(teamId: string): Promise<GetTeamResult> {
  try {
    const response = await fetch(`/api/auth/teams/${teamId}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get team',
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
      method: 'GET',
      credentials: 'include',
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list teams',
    };
  }
}

/**
 * Invites a user to join a team
 */
export async function inviteToTeam(data: InviteToTeamData): Promise<InviteToTeamResult> {
  try {
    const response = await fetch('/api/auth/teams/invitations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send invitation',
    };
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
    const url = new URL('/api/auth/teams/invitations', window.location.origin);
    if (teamId) {
      url.searchParams.set('teamId', teamId);
    }
    if (includeExpired) {
      url.searchParams.set('includeExpired', 'true');
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list invitations',
    };
  }
}

/**
 * Responds to a team invitation
 */
export async function respondToInvitation(
  data: RespondToInvitationData
): Promise<RespondToInvitationResult> {
  try {
    const response = await fetch(`/api/auth/teams/invitations/${data.invitationId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ response: data.response }),
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to respond to invitation',
    };
  }
}

/**
 * Cancels a team invitation
 */
export async function cancelInvitation(invitationId: string) {
  try {
    const response = await fetch(`/api/auth/teams/invitations/${invitationId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel invitation',
    };
  }
}

/**
 * Updates a team member's role
 */
export async function updateTeamMember(
  data: UpdateTeamMemberData
): Promise<UpdateTeamMemberResult> {
  try {
    const response = await fetch(`/api/auth/teams/${data.teamId}/members/${data.userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ role: data.role }),
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update team member',
    };
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
    const response = await fetch(`/api/auth/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove team member',
    };
  }
}

/**
 * Gets team statistics
 */
export async function getTeamStats(teamId: string): Promise<GetTeamStatsResult> {
  try {
    const response = await fetch(`/api/auth/teams/${teamId}/stats`, {
      method: 'GET',
      credentials: 'include',
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get team statistics',
    };
  }
}

/**
 * Gets pending invitations for the current user
 */
export async function getUserPendingInvitations(): Promise<ListTeamInvitationsResult> {
  try {
    const response = await fetch('/api/auth/teams/invitations/pending', {
      method: 'GET',
      credentials: 'include',
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get pending invitations',
    };
  }
}

/**
 * Leaves a team (removes current user from team)
 */
export async function leaveTeam(teamId: string): Promise<RemoveTeamMemberResult> {
  try {
    const response = await fetch(`/api/auth/teams/${teamId}/leave`, {
      method: 'POST',
      credentials: 'include',
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to leave team',
    };
  }
}