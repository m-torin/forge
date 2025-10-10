/**
 * Organization management functions
 */

import 'server-only';

import { logError } from '@repo/observability';
import { auth } from '../../shared/auth';
import { getAuthHeaders } from '../get-headers';

import type { OrganizationRole } from '../../shared/types';

/**
 * Sets the active organization for the current user session
 */
export async function setActiveOrganizationAction(organizationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Require authentication
    const session = await auth.api.getSession();
    if (!session) {
      return { success: false, error: 'Failed to set active organization' };
    }
    await auth.api.setActiveOrganization({
      body: { organizationId },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logError(
      'Set active organization error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to set active organization',
      success: false,
    };
  }
}

/**
 * Gets the full organization data including members for current session
 */
export async function getFullOrganizationAction(organizationId?: string): Promise<{
  success: boolean;
  organization?: any;
  error?: string;
}> {
  try {
    const result = await auth.api.getFullOrganization({
      query: organizationId ? { organizationId } : {},
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
      organization: result,
    };
  } catch (error) {
    logError(
      'Get full organization error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to get organization',
      success: false,
    };
  }
}

/**
 * Server-side helper to add a member directly to an organization using better-auth native method
 */
export async function addMemberAction(data: {
  userId: string;
  organizationId: string;
  role: OrganizationRole | OrganizationRole[];
  teamId?: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Use better-auth native addMember API
    await auth.api.addMember({
      body: {
        userId: data.userId,
        organizationId: data.organizationId,
        role: data.role,
        ...(data.teamId && { teamId: data.teamId }),
      },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logError('Add member error:', error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Failed to add member',
      success: false,
    };
  }
}

/**
 * Removes a member from an organization using better-auth native method
 */
export async function removeMemberAction(data: {
  userId: string;
  organizationId: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Require authentication
    const session = await auth.api.getSession();
    if (!session) {
      return { success: false, error: 'Failed to remove member' };
    }
    // Use better-auth native removeMember API
    await auth.api.removeMember({
      body: {
        memberIdOrEmail: data.userId,
        organizationId: data.organizationId,
      },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logError('Remove member error:', error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Failed to remove member',
      success: false,
    };
  }
}

/**
 * Updates a member's role in an organization using better-auth native method
 */
export async function updateMemberRoleAction(data: {
  userId: string;
  organizationId: string;
  role: OrganizationRole;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Require authentication
    const session = await auth.api.getSession();
    if (!session) {
      return { success: false, error: 'Failed to update member role' };
    }
    // Use better-auth native updateMemberRole API
    await auth.api.updateMemberRole({
      body: {
        memberId: data.userId,
        role: data.role,
      },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logError(
      'Update member role error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to update member role',
      success: false,
    };
  }
}

/**
 * Creates a new organization using better-auth native method
 */
export async function createOrganizationAction(data: {
  name: string;
  slug?: string;
  description?: string;
}): Promise<{
  success: boolean;
  organization?: any;
  error?: string;
}> {
  try {
    // Require authentication
    const session = await auth.api.getSession();
    if (!session) {
      return { success: false, error: 'Failed to create organization' };
    }
    // Use better-auth native createOrganization API
    const result = await auth.api.createOrganization({
      body: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        metadata: data.description ? { description: data.description } : {},
      },
      headers: await getAuthHeaders(),
    });

    return {
      organization: result,
      success: true,
    };
  } catch (error) {
    logError(
      'Create organization error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to create organization',
      success: false,
    };
  }
}

/**
 * Updates an organization using better-auth native method
 */
export async function updateOrganizationAction(data: {
  organizationId: string;
  name?: string;
  slug?: string;
  description?: string;
}): Promise<{
  success: boolean;
  organization?: any;
  error?: string;
}> {
  try {
    // Require authentication
    const session = await auth.api.getSession();
    if (!session) {
      return { success: false, error: 'Failed to update organization' };
    }
    // Use better-auth native updateOrganization API
    const result = await auth.api.updateOrganization({
      body: {
        organizationId: data.organizationId,
        data: {
          ...(data.name && { name: data.name }),
          ...(data.slug && { slug: data.slug }),
          ...(data.description !== undefined && { metadata: { description: data.description } }),
        },
      },
      headers: await getAuthHeaders(),
    });

    return {
      organization: result,
      success: true,
    };
  } catch (error) {
    logError(
      'Update organization error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to update organization',
      success: false,
    };
  }
}

/**
 * Deletes an organization using better-auth native method
 */
export async function deleteOrganizationAction(organizationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Require authentication
    const session = await auth.api.getSession();
    if (!session) {
      return { success: false, error: 'Failed to delete organization' };
    }
    // Use better-auth native deleteOrganization API
    await auth.api.deleteOrganization({
      body: { organizationId },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logError(
      'Delete organization error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to delete organization',
      success: false,
    };
  }
}

/**
 * Invites a user to an organization using better-auth native method
 */
export async function inviteUserAction(data: {
  email: string;
  organizationId: string;
  role: OrganizationRole;
  teamId?: string;
  message?: string;
}): Promise<{
  success: boolean;
  invitation?: any;
  error?: string;
}> {
  try {
    // Require authentication
    const session = await auth.api.getSession();
    if (!session) {
      return { success: false, error: 'Failed to invite user' };
    }
    // Use better-auth native inviteUser API
    const result = await auth.api.inviteUser({
      body: {
        email: data.email,
        organizationId: data.organizationId,
        role: data.role,
        ...(data.teamId && { teamId: data.teamId }),
        ...(data.message && { message: data.message }),
      },
      headers: await getAuthHeaders(),
    });

    return {
      invitation: result,
      success: true,
    };
  } catch (error) {
    logError('Invite user error:', error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Failed to invite user',
      success: false,
    };
  }
}

/**
 * Cancels an organization invitation using better-auth native method
 */
export async function cancelInvitationAction(invitationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Require authentication
    const session = await auth.api.getSession();
    if (!session) {
      return { success: false, error: 'Failed to cancel invitation' };
    }
    // Use better-auth native cancelInvitation API
    await auth.api.cancelInvitation({
      body: { invitationId },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logError('Cancel invitation error:', error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Failed to cancel invitation',
      success: false,
    };
  }
}

/**
 * Accepts an organization invitation using better-auth native method
 */
export async function acceptInvitationAction(invitationId: string): Promise<{
  success: boolean;
  organizationId?: string;
  error?: string;
}> {
  try {
    // Require authentication
    const session = await auth.api.getSession();
    if (!session) {
      return { success: false, error: 'Failed to accept invitation' };
    }
    // Use better-auth native acceptInvitation API
    const result = await auth.api.acceptInvitation({
      body: { invitationId },
      headers: await getAuthHeaders(),
    });

    return {
      organizationId: result?.invitation?.organizationId,
      success: true,
    };
  } catch (error) {
    logError('Accept invitation error:', error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Failed to accept invitation',
      success: false,
    };
  }
}

/**
 * Declines an organization invitation using better-auth native method
 */
export async function declineInvitationAction(invitationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Require authentication
    const session = await auth.api.getSession();
    if (!session) {
      return { success: false, error: 'Failed to decline invitation' };
    }
    // Use better-auth native rejectInvitation API
    await auth.api.rejectInvitation({
      body: { invitationId },
      headers: await getAuthHeaders(),
    });

    return {
      success: true,
    };
  } catch (error) {
    logError(
      'Decline invitation error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to decline invitation',
      success: false,
    };
  }
}

/**
 * Lists organization invitations using better-auth native method
 */
export async function listInvitationsAction(organizationId?: string): Promise<{
  success: boolean;
  invitations?: any[];
  error?: string;
}> {
  try {
    // Use better-auth native listInvitations API
    const result = await auth.api.listInvitations({
      query: organizationId ? { organizationId } : {},
      headers: await getAuthHeaders(),
    });

    return {
      invitations: Array.isArray(result) ? result : [result],
      success: true,
    };
  } catch (error) {
    logError('List invitations error:', error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Failed to list invitations',
      success: false,
    };
  }
}

/**
 * Gets organization members using better-auth native method
 */
export async function getOrganizationMembersAction(organizationId: string): Promise<{
  success: boolean;
  members?: any[];
  error?: string;
}> {
  try {
    // Use better-auth native getFullOrganization which includes members
    const result = await auth.api.getFullOrganization({
      headers: await getAuthHeaders(),
      query: { organizationId },
    });

    if (!result?.organization) {
      return {
        error: 'Organization not found or access denied',
        success: false,
      };
    }

    return {
      members: result.members || [],
      success: true,
    };
  } catch (error) {
    logError(
      'Get organization members error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to get organization members',
      success: false,
    };
  }
}

/**
 * Bulk invite multiple users to an organization
 */
export async function bulkInviteUsersAction(data: {
  emails: string[];
  organizationId: string;
  role: OrganizationRole;
  teamId?: string;
  message?: string;
}): Promise<{
  success: boolean;
  results?: Array<{
    email: string;
    success: boolean;
    invitation?: any;
    error?: string;
  }>;
  error?: string;
}> {
  try {
    const results = await Promise.allSettled(
      data.emails.map(email =>
        inviteUserAction({
          email,
          organizationId: data.organizationId,
          role: data.role,
          teamId: data.teamId,
          message: data.message,
        }),
      ),
    );

    const mappedResults = results.map((result, index) => ({
      email: data.emails[index],
      success: result.status === 'fulfilled' ? result.value.success : false,
      invitation: result.status === 'fulfilled' ? result.value.invitation : undefined,
      error:
        result.status === 'fulfilled'
          ? result.value.error
          : result.status === 'rejected'
            ? result.reason?.message
            : 'Unknown error',
    }));

    const successCount = mappedResults.filter(r => r.success).length;

    return {
      success: successCount > 0,
      results: mappedResults,
    };
  } catch (error) {
    logError('Bulk invite users error:', error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Failed to bulk invite users',
      success: false,
    };
  }
}

/**
 * Bulk remove members from an organization
 */
export async function bulkRemoveMembersAction(data: {
  userIds: string[];
  organizationId: string;
}): Promise<{
  success: boolean;
  results?: Array<{
    userId: string;
    success: boolean;
    error?: string;
  }>;
  error?: string;
}> {
  try {
    const results = await Promise.allSettled(
      data.userIds.map(userId =>
        removeMemberAction({
          userId,
          organizationId: data.organizationId,
        }),
      ),
    );

    const mappedResults = results.map((result, index) => ({
      userId: data.userIds[index],
      success: result.status === 'fulfilled' ? result.value.success : false,
      error:
        result.status === 'fulfilled'
          ? result.value.error
          : result.status === 'rejected'
            ? result.reason?.message
            : 'Unknown error',
    }));

    const successCount = mappedResults.filter(r => r.success).length;

    return {
      success: successCount > 0,
      results: mappedResults,
    };
  } catch (error) {
    logError(
      'Bulk remove members error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to bulk remove members',
      success: false,
    };
  }
}

/**
 * Bulk update member roles in an organization
 */
export async function bulkUpdateMemberRolesAction(data: {
  updates: Array<{
    userId: string;
    role: OrganizationRole;
  }>;
  organizationId: string;
}): Promise<{
  success: boolean;
  results?: Array<{
    userId: string;
    success: boolean;
    error?: string;
  }>;
  error?: string;
}> {
  try {
    const results = await Promise.allSettled(
      data.updates.map(update =>
        updateMemberRoleAction({
          userId: update.userId,
          organizationId: data.organizationId,
          role: update.role,
        }),
      ),
    );

    const mappedResults = results.map((result, index) => ({
      userId: data.updates[index].userId,
      success: result.status === 'fulfilled' ? result.value.success : false,
      error:
        result.status === 'fulfilled'
          ? result.value.error
          : result.status === 'rejected'
            ? result.reason?.message
            : 'Unknown error',
    }));

    const successCount = mappedResults.filter(r => r.success).length;

    return {
      success: successCount > 0,
      results: mappedResults,
    };
  } catch (error) {
    logError(
      'Bulk update member roles error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to bulk update member roles',
      success: false,
    };
  }
}

/**
 * Get organization statistics
 */
export async function getOrganizationStatisticsAction(organizationId: string): Promise<{
  success: boolean;
  data?: {
    totalMembers: number;
    activeMembers: number;
    pendingInvitations: number;
    teams: number;
    membersByRole: Record<string, number>;
  };
  error?: string;
}> {
  try {
    // Get members
    const membersResult = await getOrganizationMembersAction(organizationId);
    if (!membersResult.success) {
      return {
        success: false,
        error: membersResult.error,
      };
    }

    // Get invitations
    const invitationsResult = await listInvitationsAction(organizationId);
    if (!invitationsResult.success) {
      return {
        success: false,
        error: invitationsResult.error,
      };
    }

    const members = membersResult.members || [];
    const invitations = invitationsResult.invitations || [];

    // Calculate statistics
    const totalMembers = members.length;
    const activeMembers = members.filter(
      (member: any) => member.user && !member.user.banned,
    ).length;
    const pendingInvitations = invitations.filter((inv: any) => inv.status === 'pending').length;

    // Count members by role
    const membersByRole = members.reduce((acc: Record<string, number>, member: any) => {
      const role = member.role || 'member';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        totalMembers,
        activeMembers,
        pendingInvitations,
        teams: 0, // TODO: Implement team counting when teams are fully supported
        membersByRole,
      },
    };
  } catch (error) {
    logError(
      'Get organization statistics error:',
      error instanceof Error ? error : new Error(String(error)),
    );
    return {
      error: 'Failed to get organization statistics',
      success: false,
    };
  }
}

// Backward compatibility aliases
export const inviteMember = inviteUserAction;
export const revokeInvitation = cancelInvitationAction;

// Export aliases for backwards compatibility with tests
export const createOrganization = createOrganizationAction;
export const getOrganization = getFullOrganizationAction;
export const updateOrganization = updateOrganizationAction;
