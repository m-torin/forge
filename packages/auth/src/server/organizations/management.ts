/**
 * Organization management functions
 */

import 'server-only';
import { headers } from 'next/headers';

import { auth } from '../auth';

import type { OrganizationRole } from '../../shared/types';

/**
 * Server-side helper to add a member directly to an organization
 */
export async function addMember(data: {
  userId: string;
  organizationId: string;
  role: OrganizationRole | OrganizationRole[];
  teamId?: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await auth.api.addMember({
      body: {
        organizationId: data.organizationId,
        role: data.role,
        teamId: data.teamId,
        userId: data.userId,
      },
    });

    return {
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Add member error:', error);
    return {
      error: 'Failed to add member',
      success: false,
    };
  }
}

/**
 * Removes a member from an organization
 */
export async function removeMember(data: { userId: string; organizationId: string }): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await auth.api.removeMember({
      body: {
        organizationId: data.organizationId,
        userId: data.userId,
      },
    });

    return {
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Remove member error:', error);
    return {
      error: 'Failed to remove member',
      success: false,
    };
  }
}

/**
 * Updates a member's role in an organization
 */
export async function updateMemberRole(data: {
  userId: string;
  organizationId: string;
  role: OrganizationRole;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await auth.api.updateMemberRole({
      body: {
        organizationId: data.organizationId,
        role: data.role,
        userId: data.userId,
      },
    });

    return {
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Update member role error:', error);
    return {
      error: 'Failed to update member role',
      success: false,
    };
  }
}

/**
 * Creates a new organization
 */
export async function createOrganization(data: {
  name: string;
  slug?: string;
  description?: string;
}): Promise<{
  success: boolean;
  organization?: any;
  error?: string;
}> {
  try {
    const result = await auth.api.createOrganization({
      body: {
        name: data.name,
        description: data.description,
        slug: data.slug,
      },
      headers: await headers(),
    });

    return {
      error: result.error?.message,
      organization: result.organization,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Create organization error:', error);
    return {
      error: 'Failed to create organization',
      success: false,
    };
  }
}

/**
 * Updates an organization
 */
export async function updateOrganization(data: {
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
    const result = await auth.api.updateOrganization({
      body: {
        name: data.name,
        description: data.description,
        organizationId: data.organizationId,
        slug: data.slug,
      },
      headers: await headers(),
    });

    return {
      error: result.error?.message,
      organization: result.organization,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Update organization error:', error);
    return {
      error: 'Failed to update organization',
      success: false,
    };
  }
}

/**
 * Deletes an organization
 */
export async function deleteOrganization(organizationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await auth.api.deleteOrganization({
      body: { organizationId },
      headers: await headers(),
    });

    return {
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Delete organization error:', error);
    return {
      error: 'Failed to delete organization',
      success: false,
    };
  }
}

/**
 * Invites a user to an organization
 */
export async function inviteUser(data: {
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
    const result = await auth.api.inviteUser({
      body: {
        email: data.email,
        message: data.message,
        organizationId: data.organizationId,
        role: data.role,
        teamId: data.teamId,
      },
      headers: await headers(),
    });

    return {
      error: result.error?.message,
      invitation: result.invitation,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Invite user error:', error);
    return {
      error: 'Failed to invite user',
      success: false,
    };
  }
}

/**
 * Cancels an organization invitation
 */
export async function cancelInvitation(invitationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await auth.api.cancelInvitation({
      body: { invitationId },
      headers: await headers(),
    });

    return {
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Cancel invitation error:', error);
    return {
      error: 'Failed to cancel invitation',
      success: false,
    };
  }
}

/**
 * Accepts an organization invitation
 */
export async function acceptInvitation(invitationId: string): Promise<{
  success: boolean;
  organizationId?: string;
  error?: string;
}> {
  try {
    const result = await auth.api.acceptInvitation({
      body: { invitationId },
      headers: await headers(),
    });

    return {
      error: result.error?.message,
      organizationId: result.organizationId,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Accept invitation error:', error);
    return {
      error: 'Failed to accept invitation',
      success: false,
    };
  }
}

/**
 * Declines an organization invitation
 */
export async function declineInvitation(invitationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const result = await auth.api.declineInvitation({
      body: { invitationId },
      headers: await headers(),
    });

    return {
      error: result.error?.message,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Decline invitation error:', error);
    return {
      error: 'Failed to decline invitation',
      success: false,
    };
  }
}

/**
 * Lists organization invitations
 */
export async function listInvitations(organizationId?: string): Promise<{
  success: boolean;
  invitations?: any[];
  error?: string;
}> {
  try {
    const result = await auth.api.listInvitations({
      headers: await headers(),
      ...(organizationId && { query: { organizationId } }),
    });

    return {
      error: result.error?.message,
      invitations: result.invitations,
      success: result.success || false,
    };
  } catch (error) {
    console.error('List invitations error:', error);
    return {
      error: 'Failed to list invitations',
      success: false,
    };
  }
}

/**
 * Gets organization members
 */
export async function getOrganizationMembers(organizationId: string): Promise<{
  success: boolean;
  members?: any[];
  error?: string;
}> {
  try {
    const result = await auth.api.getMembers({
      headers: await headers(),
      query: { organizationId },
    });

    return {
      error: result.error?.message,
      members: result.members,
      success: result.success || false,
    };
  } catch (error) {
    console.error('Get organization members error:', error);
    return {
      error: 'Failed to get organization members',
      success: false,
    };
  }
}

/**
 * Bulk invite multiple users to an organization
 */
export async function bulkInviteUsers(data: {
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
        inviteUser({
          email,
          organizationId: data.organizationId,
          role: data.role,
          teamId: data.teamId,
          message: data.message,
        })
      )
    );

    const mappedResults = results.map((result, index) => ({
      email: data.emails[index],
      success: result.status === 'fulfilled' ? result.value.success : false,
      invitation: result.status === 'fulfilled' ? result.value.invitation : undefined,
      error: result.status === 'fulfilled' ? result.value.error : 
             result.status === 'rejected' ? result.reason?.message : 'Unknown error',
    }));

    const successCount = mappedResults.filter(r => r.success).length;

    return {
      success: successCount > 0,
      results: mappedResults,
    };
  } catch (error) {
    console.error('Bulk invite users error:', error);
    return {
      error: 'Failed to bulk invite users',
      success: false,
    };
  }
}

/**
 * Bulk remove members from an organization
 */
export async function bulkRemoveMembers(data: {
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
        removeMember({
          userId,
          organizationId: data.organizationId,
        })
      )
    );

    const mappedResults = results.map((result, index) => ({
      userId: data.userIds[index],
      success: result.status === 'fulfilled' ? result.value.success : false,
      error: result.status === 'fulfilled' ? result.value.error : 
             result.status === 'rejected' ? result.reason?.message : 'Unknown error',
    }));

    const successCount = mappedResults.filter(r => r.success).length;

    return {
      success: successCount > 0,
      results: mappedResults,
    };
  } catch (error) {
    console.error('Bulk remove members error:', error);
    return {
      error: 'Failed to bulk remove members',
      success: false,
    };
  }
}

/**
 * Bulk update member roles in an organization
 */
export async function bulkUpdateMemberRoles(data: {
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
        updateMemberRole({
          userId: update.userId,
          organizationId: data.organizationId,
          role: update.role,
        })
      )
    );

    const mappedResults = results.map((result, index) => ({
      userId: data.updates[index].userId,
      success: result.status === 'fulfilled' ? result.value.success : false,
      error: result.status === 'fulfilled' ? result.value.error : 
             result.status === 'rejected' ? result.reason?.message : 'Unknown error',
    }));

    const successCount = mappedResults.filter(r => r.success).length;

    return {
      success: successCount > 0,
      results: mappedResults,
    };
  } catch (error) {
    console.error('Bulk update member roles error:', error);
    return {
      error: 'Failed to bulk update member roles',
      success: false,
    };
  }
}

/**
 * Get organization statistics
 */
export async function getOrganizationStatistics(organizationId: string): Promise<{
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
    const membersResult = await getOrganizationMembers(organizationId);
    if (!membersResult.success) {
      return {
        success: false,
        error: membersResult.error,
      };
    }

    // Get invitations
    const invitationsResult = await listInvitations(organizationId);
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
    const activeMembers = members.filter((member: any) => 
      member.user && !member.user.banned
    ).length;
    const pendingInvitations = invitations.filter((inv: any) => 
      inv.status === 'pending'
    ).length;

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
    console.error('Get organization statistics error:', error);
    return {
      error: 'Failed to get organization statistics',
      success: false,
    };
  }
}

// Aliases for backward compatibility
export { inviteUser as inviteMember } from './management';
export { cancelInvitation as revokeInvitation } from './management';
export { getOrganizationStats } from './helpers';
