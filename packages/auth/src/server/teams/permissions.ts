/**
 * Team permission checking server utilities
 */

import 'server-only';

import { logError } from '@repo/observability/server/next';
import { auth } from '../../shared/auth';
import { roleHasPermission } from '../../shared/teams';
import { getAuthHeaders } from '../get-headers';

import type { TeamPermissionCheck, TeamPermissionResult } from '../../shared/teams';

/**
 * Checks if a user has permission to perform an action on a team
 */
export async function checkTeamPermission(
  check: TeamPermissionCheck,
): Promise<TeamPermissionResult> {
  try {
    const session = await auth.api.getSession({ headers: await getAuthHeaders() });

    if (!session) {
      return { error: 'Authentication required', hasPermission: false };
    }

    const { permission, teamId, userId } = check;
    const targetUserId = userId || session.user.id;

    // Get team data with members using better-auth native method
    const teamResult = await auth.api.getTeam({
      headers: await getAuthHeaders(),
      query: { teamId },
    });

    if (!teamResult?.team) {
      return { error: 'Team not found or access denied', hasPermission: false };
    }

    // Find user's membership in the team
    const membership = (teamResult.team.members || []).find(
      (member: any) => member.userId === targetUserId,
    );

    if (!membership) {
      return { error: 'User is not a team member', hasPermission: false };
    }

    const hasPermission = roleHasPermission(membership.role, permission);

    return {
      hasPermission,
      role: membership.role,
    };
  } catch (error) {
    logError(
      'Check team permission error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return { error: 'Failed to check permission', hasPermission: false };
  }
}

/**
 * Checks if the current user can manage a specific team member
 */
export async function canManageTeamMember(teamId: string, targetUserId: string): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await getAuthHeaders() });

    if (!session) {
      return false;
    }

    // Users can always manage themselves (leave team)
    if (session.user.id === targetUserId) {
      return true;
    }

    // Get team data with members using better-auth native method
    const teamResult = await auth.api.getTeam({
      headers: await getAuthHeaders(),
      query: { teamId },
    });

    if (!teamResult?.team?.members) {
      return false;
    }

    // Find both memberships in the team
    const currentUserMembership = teamResult.team.members.find(
      (member: any) => member.userId === session.user.id,
    );
    const targetUserMembership = teamResult.team.members.find(
      (member: any) => member.userId === targetUserId,
    );

    if (!currentUserMembership || !targetUserMembership) {
      return false;
    }

    // Check if current user has permission to manage members
    if (!roleHasPermission(currentUserMembership.role, 'members:write')) {
      return false;
    }

    // Can't manage users with equal or higher role levels
    const currentUserRole = currentUserMembership.role;
    const targetUserRole = targetUserMembership.role;

    // Import role data to check levels
    const { DEFAULT_TEAM_ROLES } = await import('../../shared/teams');

    const currentLevel = DEFAULT_TEAM_ROLES[currentUserRole]?.level || 0;
    const targetLevel = DEFAULT_TEAM_ROLES[targetUserRole]?.level || 0;

    return currentLevel > targetLevel;
  } catch (error) {
    logError(
      'Can manage team member error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return false;
  }
}

/**
 * Gets all team permissions for a user
 */
export async function getUserTeamPermissions(
  teamId: string,
  userId?: string,
): Promise<{
  permissions: string[];
  role: string;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await getAuthHeaders() });

    if (!session) {
      return { error: 'Authentication required', permissions: [], role: '' };
    }

    const targetUserId = userId || session.user.id;

    // Get team data with members using better-auth native method
    const teamResult = await auth.api.getTeam({
      headers: await getAuthHeaders(),
      query: { teamId },
    });

    if (!teamResult?.team) {
      return { error: 'Team not found or access denied', permissions: [], role: '' };
    }

    // Find user's membership in the team
    const membership = (teamResult.team.members || []).find(
      (member: any) => member.userId === targetUserId,
    );

    if (!membership) {
      return { error: 'User is not a team member', permissions: [], role: '' };
    }

    // Import role data to get permissions
    const { DEFAULT_TEAM_ROLES } = await import('../../shared/teams');
    const roleData = DEFAULT_TEAM_ROLES[membership.role];

    return {
      permissions: roleData?.permissions || [],
      role: membership.role,
    };
  } catch (error) {
    logError(
      'Get user team permissions error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return { error: 'Failed to get permissions', permissions: [], role: '' };
  }
}

/**
 * Checks if a user is a team owner
 */
export async function isTeamOwner(teamId: string, userId?: string): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await getAuthHeaders() });

    if (!session) {
      return false;
    }

    const targetUserId = userId || session.user.id;

    // Get team data with members using better-auth native method
    const teamResult = await auth.api.getTeam({
      headers: await getAuthHeaders(),
      query: { teamId },
    });

    if (!teamResult?.team) {
      return false;
    }

    // Find user's membership in the team
    const membership = (teamResult.team.members || []).find(
      (member: any) => member.userId === targetUserId,
    );

    return membership?.role === 'owner';
  } catch (error) {
    logError('Is team owner error:', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

/**
 * Checks if a user is a team admin or owner
 */
export async function isTeamAdmin(teamId: string, userId?: string): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await getAuthHeaders() });

    if (!session) {
      return false;
    }

    const targetUserId = userId || session.user.id;

    // Get team data with members using better-auth native method
    const teamResult = await auth.api.getTeam({
      headers: await getAuthHeaders(),
      query: { teamId },
    });

    if (!teamResult?.team) {
      return false;
    }

    // Find user's membership in the team
    const membership = (teamResult.team.members || []).find(
      (member: any) => member.userId === targetUserId,
    );

    return membership?.role === 'owner' || membership?.role === 'admin';
  } catch (error) {
    logError('Is team admin error:', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

/**
 * Gets team role hierarchy for permission checks
 */
export async function getTeamRoleHierarchy(): Promise<
  {
    role: string;
    level: number;
    permissions: string[];
  }[]
> {
  // Import role data
  const { DEFAULT_TEAM_ROLES } = await import('../../shared/teams');

  return Object.values(DEFAULT_TEAM_ROLES).map(role => ({
    level: role.level,
    permissions: role.permissions,
    role: role.id,
  }));
}

// Helper functions for specific permissions
export async function canViewTeamMembers(teamId: string, userId?: string): Promise<boolean> {
  const result = await checkTeamPermission({ permission: 'members:read', teamId, userId });
  return result.hasPermission;
}

export async function canInviteTeamMembers(teamId: string, userId?: string): Promise<boolean> {
  const result = await checkTeamPermission({ permission: 'members:write', teamId, userId });
  return result.hasPermission;
}

export async function canRemoveTeamMembers(teamId: string, userId?: string): Promise<boolean> {
  const result = await checkTeamPermission({ permission: 'members:write', teamId, userId });
  return result.hasPermission;
}

export async function canUpdateTeamMemberRoles(teamId: string, userId?: string): Promise<boolean> {
  const result = await checkTeamPermission({ permission: 'members:manage', teamId, userId });
  return result.hasPermission;
}

export async function canManageTeam(teamId: string, userId?: string): Promise<boolean> {
  const result = await checkTeamPermission({ permission: 'team:write', teamId, userId });
  return result.hasPermission;
}

export async function canDeleteTeam(teamId: string, userId?: string): Promise<boolean> {
  const result = await checkTeamPermission({ permission: 'team:delete', teamId, userId });
  return result.hasPermission;
}

export async function canManageTeamSettings(teamId: string, userId?: string): Promise<boolean> {
  const result = await checkTeamPermission({ permission: 'settings:write', teamId, userId });
  return result.hasPermission;
}

export async function canManageTeamBilling(teamId: string, userId?: string): Promise<boolean> {
  const result = await checkTeamPermission({ permission: 'billing:write', teamId, userId });
  return result.hasPermission;
}

export async function hasTeamAccess(teamId: string, userId?: string): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await getAuthHeaders() });
    if (!session) return false;

    const targetUserId = userId || session.user.id;

    // Get team data with members using better-auth native method
    const teamResult = await auth.api.getTeam({
      headers: await getAuthHeaders(),
      query: { teamId },
    });

    if (!teamResult?.team) {
      return false;
    }

    // Find user's membership in the team
    const membership = (teamResult.team.members || []).find(
      (member: any) => member.userId === targetUserId,
    );

    return !!membership;
  } catch (error) {
    logError('Has team access error:', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

export async function hasTeamRole(teamId: string, role: string, userId?: string): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await getAuthHeaders() });
    if (!session) return false;

    const targetUserId = userId || session.user.id;

    // Get team data with members using better-auth native method
    const teamResult = await auth.api.getTeam({
      headers: await getAuthHeaders(),
      query: { teamId },
    });

    if (!teamResult?.team) {
      return false;
    }

    // Find user's membership in the team
    const membership = (teamResult.team.members || []).find(
      (member: any) => member.userId === targetUserId,
    );

    return membership?.role === role;
  } catch (error) {
    logError('Has team role error:', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}
