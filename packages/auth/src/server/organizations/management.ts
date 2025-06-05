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
      success: result.success || false,
      error: result.error?.message,
    };
  } catch (error) {
    console.error('Add member error:', error);
    return {
      success: false,
      error: 'Failed to add member',
    };
  }
}

/**
 * Removes a member from an organization
 */
export async function removeMember(data: {
  userId: string;
  organizationId: string;
}): Promise<{
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
      success: result.success || false,
      error: result.error?.message,
    };
  } catch (error) {
    console.error('Remove member error:', error);
    return {
      success: false,
      error: 'Failed to remove member',
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
        userId: data.userId,
        role: data.role,
      },
    });

    return {
      success: result.success || false,
      error: result.error?.message,
    };
  } catch (error) {
    console.error('Update member role error:', error);
    return {
      success: false,
      error: 'Failed to update member role',
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
        slug: data.slug,
        description: data.description,
      },
      headers: await headers(),
    });

    return {
      success: result.success || false,
      organization: result.organization,
      error: result.error?.message,
    };
  } catch (error) {
    console.error('Create organization error:', error);
    return {
      success: false,
      error: 'Failed to create organization',
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
        organizationId: data.organizationId,
        name: data.name,
        slug: data.slug,
        description: data.description,
      },
      headers: await headers(),
    });

    return {
      success: result.success || false,
      organization: result.organization,
      error: result.error?.message,
    };
  } catch (error) {
    console.error('Update organization error:', error);
    return {
      success: false,
      error: 'Failed to update organization',
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
      success: result.success || false,
      error: result.error?.message,
    };
  } catch (error) {
    console.error('Delete organization error:', error);
    return {
      success: false,
      error: 'Failed to delete organization',
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
        organizationId: data.organizationId,
        role: data.role,
        teamId: data.teamId,
        message: data.message,
      },
      headers: await headers(),
    });

    return {
      success: result.success || false,
      invitation: result.invitation,
      error: result.error?.message,
    };
  } catch (error) {
    console.error('Invite user error:', error);
    return {
      success: false,
      error: 'Failed to invite user',
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
      success: result.success || false,
      error: result.error?.message,
    };
  } catch (error) {
    console.error('Cancel invitation error:', error);
    return {
      success: false,
      error: 'Failed to cancel invitation',
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
      success: result.success || false,
      organizationId: result.organizationId,
      error: result.error?.message,
    };
  } catch (error) {
    console.error('Accept invitation error:', error);
    return {
      success: false,
      error: 'Failed to accept invitation',
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
      success: result.success || false,
      error: result.error?.message,
    };
  } catch (error) {
    console.error('Decline invitation error:', error);
    return {
      success: false,
      error: 'Failed to decline invitation',
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
      success: result.success || false,
      invitations: result.invitations,
      error: result.error?.message,
    };
  } catch (error) {
    console.error('List invitations error:', error);
    return {
      success: false,
      error: 'Failed to list invitations',
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
      success: result.success || false,
      members: result.members,
      error: result.error?.message,
    };
  } catch (error) {
    console.error('Get organization members error:', error);
    return {
      success: false,
      error: 'Failed to get organization members',
    };
  }
}