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

// Aliases for backward compatibility
export { inviteUser as inviteMember } from './management';
export { cancelInvitation as revokeInvitation } from './management';
export { getOrganizationStats } from './helpers';
