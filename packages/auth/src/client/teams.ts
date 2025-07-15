/**
 * Client-side team functionality
 */

import { useCallback, useEffect, useState } from 'react';

import {
  cancelTeamInvitationAction,
  createTeamAction,
  deleteTeamAction,
  getTeamByIdAction,
  getTeamStatisticsAction,
  getUserPendingInvitationsAction,
  getUserTeamsAction,
  inviteToTeamAction,
  listTeamInvitationsAction,
  removeTeamMemberAction,
  respondToInvitationAction,
  updateTeamAction,
  updateTeamMemberRoleAction,
} from '../server/actions';

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
  TeamStats,
  TeamWithMembers,
  UpdateTeamData,
  UpdateTeamMemberData,
  UpdateTeamMemberResult,
  UpdateTeamResult,
} from '../shared/teams';

// ===== TEAM METHODS =====

/**
 * Creates a new team
 */
export async function createTeam(data: CreateTeamData): Promise<CreateTeamResult> {
  try {
    return await createTeamAction(data);
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
    return await updateTeamAction(teamId, data);
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
    return await deleteTeamAction(teamId);
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
    return await getTeamByIdAction(teamId);
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
    return await getUserTeamsAction(organizationId);
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
    return await inviteToTeamAction(data);
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
    return await listTeamInvitationsAction(teamId, includeExpired);
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
    return await respondToInvitationAction(data);
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
    return await cancelTeamInvitationAction(invitationId);
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
    return await updateTeamMemberRoleAction(data);
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
    return await removeTeamMemberAction(teamId, userId);
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
    return await getTeamStatisticsAction(teamId);
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
    return await getUserPendingInvitationsAction();
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
    // For leaving a team, we need to get current user and remove them
    // This would need to be implemented as a specific server action
    // For now, we'll use the generic remove member action
    return await removeTeamMemberAction(teamId, 'current'); // Note: This needs proper user ID
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to leave team',
      success: false,
    };
  }
}

// ===== REACT HOOKS =====

/**
 * Hook for managing teams list
 */
export function useTeams(organizationId?: string) {
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getUserTeamsAction(organizationId);

      if (result.success && result.teams) {
        setTeams(result.teams);
      } else {
        setError(result.error || 'Failed to fetch teams');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const createTeamHook = useCallback(
    async (data: CreateTeamData): Promise<CreateTeamResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await createTeamAction(data);

        if (result.success) {
          await fetchTeams(); // Refresh teams list
        } else {
          setError(result.error || 'Failed to create team');
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to create team';
        setError(error);
        return { error, success: false };
      } finally {
        setLoading(false);
      }
    },
    [fetchTeams],
  );

  const updateTeamHook = useCallback(
    async (teamId: string, data: UpdateTeamData): Promise<UpdateTeamResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await updateTeamAction(teamId, data);

        if (result.success) {
          await fetchTeams(); // Refresh teams list
        } else {
          setError(result.error || 'Failed to update team');
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to update team';
        setError(error);
        return { error, success: false };
      } finally {
        setLoading(false);
      }
    },
    [fetchTeams],
  );

  const deleteTeamHook = useCallback(async (teamId: string): Promise<DeleteTeamResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteTeamAction(teamId);

      if (result.success) {
        setTeams(prev => prev.filter(team => team.id !== teamId));
      } else {
        setError(result.error || 'Failed to delete team');
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete team';
      setError(error);
      return { error, success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch teams on mount
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    createTeam: createTeamHook,
    deleteTeam: deleteTeamHook,
    error,
    fetchTeams,
    loading,
    teams,
    updateTeam: updateTeamHook,
  };
}

/**
 * Hook for managing a single team
 */
export function useTeam(teamId: string) {
  const [team, setTeam] = useState<TeamWithMembers | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getTeamByIdAction(teamId);

      if (result.success && result.team) {
        setTeam(result.team);
      } else {
        setError(result.error || 'Failed to fetch team');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  const updateMember = useCallback(
    async (data: UpdateTeamMemberData): Promise<UpdateTeamMemberResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await updateTeamMemberRoleAction(data);

        if (result.success) {
          await fetchTeam(); // Refresh team data
        } else {
          setError(result.error || 'Failed to update member');
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to update member';
        setError(error);
        return { error, success: false };
      } finally {
        setLoading(false);
      }
    },
    [teamId, fetchTeam],
  );

  const removeMember = useCallback(
    async (userId: string): Promise<RemoveTeamMemberResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await removeTeamMemberAction(teamId, userId);

        if (result.success) {
          await fetchTeam(); // Refresh team data
        } else {
          setError(result.error || 'Failed to remove member');
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to remove member';
        setError(error);
        return { error, success: false };
      } finally {
        setLoading(false);
      }
    },
    [teamId, fetchTeam],
  );

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return {
    error,
    fetchTeam,
    loading,
    removeMember,
    team,
    updateMember,
  };
}

/**
 * Hook for team invitations
 */
export function useTeamInvitations(teamId?: string) {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listTeamInvitationsAction(teamId);

      if (result.success && result.invitations) {
        setInvitations(result.invitations);
      } else {
        setError(result.error || 'Failed to fetch invitations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  const inviteUser = useCallback(
    async (data: InviteToTeamData): Promise<InviteToTeamResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await inviteToTeamAction(data);

        if (result.success) {
          await fetchInvitations(); // Refresh invitations
        } else {
          setError(result.error || 'Failed to send invitation');
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to send invitation';
        setError(error);
        return { error, success: false };
      } finally {
        setLoading(false);
      }
    },
    [fetchInvitations],
  );

  const respondToInvitationHook = useCallback(
    async (data: RespondToInvitationData): Promise<RespondToInvitationResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await respondToInvitationAction(data);

        if (result.success) {
          await fetchInvitations(); // Refresh invitations
        } else {
          setError(result.error || 'Failed to respond to invitation');
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to respond to invitation';
        setError(error);
        return { error, success: false };
      } finally {
        setLoading(false);
      }
    },
    [fetchInvitations],
  );

  const cancelInvitationHook = useCallback(async (invitationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await cancelTeamInvitationAction(invitationId);

      if (result.success) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      } else {
        setError(result.error || 'Failed to cancel invitation');
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to cancel invitation';
      setError(error);
      return { error, success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  return {
    cancelInvitation: cancelInvitationHook,
    error,
    fetchInvitations,
    invitations,
    inviteUser,
    loading,
    respondToInvitation: respondToInvitationHook,
  };
}

/**
 * Hook for team statistics
 */
export function useTeamStats(teamId: string) {
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getTeamStatisticsAction(teamId);

      if (result.success && result.stats) {
        setStats(result.stats);
      } else {
        setError(result.error || 'Failed to fetch team statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team statistics');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    error,
    fetchStats,
    loading,
    stats,
  };
}
