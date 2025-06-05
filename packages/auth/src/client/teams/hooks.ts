/**
 * React hooks for team management
 */

import { useState, useEffect, useCallback } from 'react';

import type {
  TeamWithMembers,
  CreateTeamData,
  CreateTeamResult,
  UpdateTeamData,
  UpdateTeamResult,
  DeleteTeamResult,
  ListTeamsResult,
  InviteToTeamData,
  InviteToTeamResult,
  ListTeamInvitationsResult,
  RespondToInvitationData,
  RespondToInvitationResult,
  UpdateTeamMemberData,
  UpdateTeamMemberResult,
  RemoveTeamMemberResult,
  TeamStats,
  GetTeamStatsResult,
} from '../../shared/teams/types';

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
      const url = new URL('/api/auth/teams', window.location.origin);
      if (organizationId) {
        url.searchParams.set('organizationId', organizationId);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });
      
      const result: ListTeamsResult = await response.json();
      
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

  const createTeam = useCallback(async (data: CreateTeamData): Promise<CreateTeamResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      const result: CreateTeamResult = await response.json();
      
      if (result.success) {
        await fetchTeams(); // Refresh teams list
      } else {
        setError(result.error || 'Failed to create team');
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create team';
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  const updateTeam = useCallback(async (
    teamId: string,
    data: UpdateTeamData
  ): Promise<UpdateTeamResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/auth/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      const result: UpdateTeamResult = await response.json();
      
      if (result.success) {
        await fetchTeams(); // Refresh teams list
      } else {
        setError(result.error || 'Failed to update team');
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update team';
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [fetchTeams]);

  const deleteTeam = useCallback(async (teamId: string): Promise<DeleteTeamResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/auth/teams/${teamId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const result: DeleteTeamResult = await response.json();
      
      if (result.success) {
        setTeams(prev => prev.filter(team => team.id !== teamId));
      } else {
        setError(result.error || 'Failed to delete team');
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete team';
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch teams on mount
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    loading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
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
      const response = await fetch(`/api/auth/teams/${teamId}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      
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

  const updateMember = useCallback(async (
    data: UpdateTeamMemberData
  ): Promise<UpdateTeamMemberResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/auth/teams/${teamId}/members/${data.userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role: data.role }),
      });
      
      const result: UpdateTeamMemberResult = await response.json();
      
      if (result.success) {
        await fetchTeam(); // Refresh team data
      } else {
        setError(result.error || 'Failed to update member');
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update member';
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [teamId, fetchTeam]);

  const removeMember = useCallback(async (userId: string): Promise<RemoveTeamMemberResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/auth/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const result: RemoveTeamMemberResult = await response.json();
      
      if (result.success) {
        await fetchTeam(); // Refresh team data
      } else {
        setError(result.error || 'Failed to remove member');
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to remove member';
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [teamId, fetchTeam]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return {
    team,
    loading,
    error,
    fetchTeam,
    updateMember,
    removeMember,
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
      const url = new URL('/api/auth/teams/invitations', window.location.origin);
      if (teamId) {
        url.searchParams.set('teamId', teamId);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });
      
      const result: ListTeamInvitationsResult = await response.json();
      
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

  const inviteUser = useCallback(async (data: InviteToTeamData): Promise<InviteToTeamResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/teams/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      const result: InviteToTeamResult = await response.json();
      
      if (result.success) {
        await fetchInvitations(); // Refresh invitations
      } else {
        setError(result.error || 'Failed to send invitation');
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to send invitation';
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [fetchInvitations]);

  const respondToInvitation = useCallback(async (
    data: RespondToInvitationData
  ): Promise<RespondToInvitationResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/auth/teams/invitations/${data.invitationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ response: data.response }),
      });
      
      const result: RespondToInvitationResult = await response.json();
      
      if (result.success) {
        await fetchInvitations(); // Refresh invitations
      } else {
        setError(result.error || 'Failed to respond to invitation');
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to respond to invitation';
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [fetchInvitations]);

  const cancelInvitation = useCallback(async (invitationId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/auth/teams/invitations/${invitationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      } else {
        setError(result.error || 'Failed to cancel invitation');
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to cancel invitation';
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  return {
    invitations,
    loading,
    error,
    fetchInvitations,
    inviteUser,
    respondToInvitation,
    cancelInvitation,
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
      const response = await fetch(`/api/auth/teams/${teamId}/stats`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result: GetTeamStatsResult = await response.json();
      
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
    stats,
    loading,
    error,
    fetchStats,
  };
}