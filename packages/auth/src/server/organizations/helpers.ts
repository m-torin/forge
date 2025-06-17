/**
 * Server-side organization helper functions
 */

import 'server-only';
import { headers } from 'next/headers';

import { auth } from '../auth';

import type { OrganizationRole, Session } from '../../shared/types';
import type { Member, Organization } from '@repo/database/prisma';

/**
 * Gets the current organization for the authenticated user using better-auth native method
 */
export async function getCurrentOrganization(): Promise<Organization | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const sessionWithOrg = session?.session as Session;
    if (!sessionWithOrg?.activeOrganizationId) {
      return null;
    }

    // Use better-auth native getFullOrganization for the active organization
    const result = await auth.api.getFullOrganization({
      headers: await headers(),
      query: { organizationId: sessionWithOrg.activeOrganizationId },
    });
    return result?.organization || null;
  } catch (error) {
    console.error('Get current organization error:', error);
    return null;
  }
}

/**
 * Gets organization by ID using better-auth native method
 */
export async function getOrganizationById(organizationId: string): Promise<Organization | null> {
  try {
    // Use better-auth native getFullOrganization method
    const result = await auth.api.getFullOrganization({
      headers: await headers(),
      query: { organizationId },
    });
    return result?.organization || null;
  } catch (error) {
    console.error('Get organization by ID error:', error);
    return null;
  }
}

/**
 * Gets organization by slug using better-auth native method
 */
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  try {
    // Use better-auth native getFullOrganization with slug
    const result = await auth.api.getFullOrganization({
      headers: await headers(),
      query: { organizationSlug: slug },
    });
    return result?.organization || null;
  } catch (error) {
    console.error('Get organization by slug error:', error);
    return null;
  }
}

/**
 * Gets user's organizations using better-auth native method
 */
export async function getUserOrganizations(
  userId?: string,
  options?: { limit?: number; offset?: number },
): Promise<Organization[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return [];
    }

    const targetUserId = userId || session.user.id;

    // Use better-auth native listOrganizations method
    const result = await auth.api.listOrganizations({
      body: {
        userId: targetUserId,
        limit: options?.limit || 100,
        offset: options?.offset || 0,
      },
      headers: await headers(),
    });
    return result?.organizations || [];
  } catch (error) {
    console.error('Get user organizations error:', error);
    return [];
  }
}

/**
 * Gets organization with full member details using better-auth native method
 */
export async function getOrganizationWithMembers(organizationId: string): Promise<{
  organization: Organization;
  members: (Member & { user: { id: string; name: string; email: string } })[];
} | null> {
  try {
    // Use better-auth native getFullOrganization which includes members
    const result = await auth.api.getFullOrganization({
      headers: await headers(),
      query: { organizationId },
    });

    if (!result?.organization) {
      return null;
    }

    // Better-auth getFullOrganization includes members with user data
    return {
      organization: result.organization,
      members: result.members || [],
    };
  } catch (error) {
    console.error('Get organization with members error:', error);
    return null;
  }
}

/**
 * Gets user's role in an organization using better-auth native method
 */
export async function getUserRoleInOrganization(
  userId: string,
  organizationId: string,
): Promise<OrganizationRole | null> {
  try {
    // Use better-auth native getActiveMember to get role information
    const activeMember = await auth.api.getActiveMember({
      headers: await headers(),
      query: { organizationId, userId },
    });
    return (activeMember?.role as OrganizationRole) || null;
  } catch (error) {
    console.error('Get user role in organization error:', error);
    return null;
  }
}

/**
 * Gets current user's role in their active organization
 */
export async function getCurrentUserRole(): Promise<OrganizationRole | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const sessionWithOrg = session?.session as Session;
    if (!sessionWithOrg?.activeOrganizationId) {
      return null;
    }

    return getUserRoleInOrganization(session!.user.id, sessionWithOrg.activeOrganizationId);
  } catch (error) {
    console.error('Get current user role error:', error);
    return null;
  }
}

/**
 * Checks if user is an organization owner
 */
export async function isOrganizationOwner(
  userId?: string,
  organizationId?: string,
): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return false;
    }

    const sessionWithOrg = session.session as Session;
    const targetUserId = userId || session.user.id;
    const targetOrgId = organizationId || sessionWithOrg.activeOrganizationId;

    if (!targetOrgId) {
      return false;
    }

    const role = await getUserRoleInOrganization(targetUserId, targetOrgId);
    return role === 'owner';
  } catch (error) {
    console.error('Is organization owner error:', error);
    return false;
  }
}

/**
 * Checks if user is an organization admin or owner
 */
export async function isOrganizationAdmin(
  userId?: string,
  organizationId?: string,
): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return false;
    }

    const sessionWithOrg = session.session as Session;
    const targetUserId = userId || session.user.id;
    const targetOrgId = organizationId || sessionWithOrg.activeOrganizationId;

    if (!targetOrgId) {
      return false;
    }

    const role = await getUserRoleInOrganization(targetUserId, targetOrgId);
    return role === 'owner' || role === 'admin';
  } catch (error) {
    console.error('Is organization admin error:', error);
    return false;
  }
}

/**
 * Gets organization statistics using better-auth data sources
 */
export async function getOrganizationStats(organizationId: string): Promise<{
  memberCount: number;
  teamCount: number;
  apiKeyCount: number;
  invitationCount: number;
} | null> {
  try {
    // Use better-auth native getFullOrganization to get members and basic data
    const orgResult = await auth.api.getFullOrganization({
      headers: await headers(),
      query: { organizationId },
    });

    if (!orgResult?.organization) {
      return null;
    }

    // Get member count from better-auth organization data
    const memberCount = orgResult.members?.length || 0;

    // Get teams using better-auth listTeams
    const teamsResult = await auth.api.listTeams({
      headers: await headers(),
      query: { organizationId },
    });
    const teamCount = teamsResult?.teams?.length || 0;

    // Get API keys using better-auth listApiKeys and filter by organization
    const apiKeysResult = await auth.api.listApiKeys({
      headers: await headers(),
    });
    const apiKeyCount = (apiKeysResult || []).filter(
      (key: any) => key.organizationId === organizationId,
    ).length;

    // Get invitations using better-auth listInvitations
    const invitationsResult = await auth.api.listInvitations({
      headers: await headers(),
      query: { organizationId },
    });
    const invitations = Array.isArray(invitationsResult) ? invitationsResult : [invitationsResult];
    const invitationCount = invitations.filter((inv: any) => inv?.status === 'pending').length;

    return {
      apiKeyCount,
      invitationCount,
      memberCount,
      teamCount,
    };
  } catch (error) {
    console.error('Get organization stats error:', error);
    return null;
  }
}

/**
 * Switches user's active organization using better-auth native method
 */
export async function switchOrganization(organizationId: string): Promise<boolean> {
  try {
    // Use better-auth native setActiveOrganization method
    await auth.api.setActiveOrganization({
      body: { organizationId },
      headers: await headers(),
    });
    return true;
  } catch (error) {
    console.error('Switch organization error:', error);
    return false;
  }
}

/**
 * Creates a default organization for a user using better-auth native method
 */
export async function createDefaultOrganization(
  userId: string,
  name?: string,
): Promise<Organization | null> {
  try {
    const orgName = name || `${userId}'s Organization`;
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Use better-auth native createOrganization method
    const result = await auth.api.createOrganization({
      body: {
        name: orgName,
        slug,
        metadata: {
          createdBy: userId,
          isDefault: true,
        },
      },
      headers: await headers(),
    });
    return result?.organization || null;
  } catch (error) {
    console.error('Create default organization error:', error);
    return null;
  }
}

/**
 * Ensures the user has an active organization
 */
export async function ensureActiveOrganization(options?: { headers?: any }): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: options?.headers || (await headers()),
    });

    const sessionWithOrg = session?.session as Session;
    if (!sessionWithOrg?.activeOrganizationId) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Ensure active organization error:', error);
    return false;
  }
}

/**
 * Gets organization details with additional information
 * This is an alias for getOrganizationWithMembers for backward compatibility
 */
export async function getOrganizationDetails(organizationId: string) {
  return getOrganizationWithMembers(organizationId);
}
