/**
 * Server-side organization helper functions
 */

import 'server-only';
import { headers } from 'next/headers';

import { prisma as database } from '@repo/database/prisma';

import { auth } from '../auth';

import type { OrganizationRole } from '../../shared/types';
import type { Member, Organization } from '@repo/database/prisma';

/**
 * Gets the current organization for the authenticated user
 */
export async function getCurrentOrganization(): Promise<Organization | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session.activeOrganizationId) {
      return null;
    }

    const organization = await database.organization.findUnique({
      where: { id: session.session.activeOrganizationId },
    });

    return organization;
  } catch (error) {
    console.error('Get current organization error:', error);
    return null;
  }
}

/**
 * Gets organization by ID (server-side)
 */
export async function getOrganizationById(organizationId: string): Promise<Organization | null> {
  try {
    return auth.api.getFullOrganization({
      headers: await headers(),
      query: { organizationId },
    });
  } catch (error) {
    console.error('Get organization by ID error:', error);
    return null;
  }
}

/**
 * Gets organization by slug (server-side)
 */
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  try {
    return auth.api.getFullOrganization({
      headers: await headers(),
      query: { organizationSlug: slug },
    });
  } catch (error) {
    console.error('Get organization by slug error:', error);
    return null;
  }
}

/**
 * Gets user's organizations
 */
export async function getUserOrganizations(
  userId?: string,
  options?: { limit?: number; offset?: number },
): Promise<Organization[]> {
  try {
    // If userId is provided, use organization.listOrganizations
    if (userId) {
      const organizations = await (auth as any).organization.listOrganizations({
        query: {
          limit: options?.limit || 100,
          userId,
          ...(options?.offset && { offset: options.offset }),
        },
      });
      return organizations || [];
    }

    // Otherwise get current user's organizations
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return [];
    }

    const organizations = await auth.api.listOrganizations({
      headers: await headers(),
    });

    return organizations || [];
  } catch (error) {
    console.error('Get user organizations error:', error);
    return [];
  }
}

/**
 * Gets organization with full member details
 */
export async function getOrganizationWithMembers(organizationId: string): Promise<{
  organization: Organization;
  members: (Member & { user: { id: string; name: string; email: string } })[];
} | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return null;
    }

    // Check if user is a member of this organization
    const membership = await database.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return null;
    }

    const [organization, members] = await Promise.all([
      database.organization.findUnique({
        where: { id: organizationId },
      }),
      database.member.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        where: { organizationId },
      }),
    ]);

    if (!organization) {
      return null;
    }

    return { members, organization };
  } catch (error) {
    console.error('Get organization with members error:', error);
    return null;
  }
}

/**
 * Gets user's role in an organization
 */
export async function getUserRoleInOrganization(
  userId: string,
  organizationId: string,
): Promise<OrganizationRole | null> {
  try {
    const membership = await database.member.findFirst({
      where: {
        organizationId,
        userId,
      },
    });

    return (membership?.role as OrganizationRole) || null;
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

    if (!session?.session.activeOrganizationId) {
      return null;
    }

    return getUserRoleInOrganization(session.user.id, session.session.activeOrganizationId);
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

    const targetUserId = userId || session.user.id;
    const targetOrgId = organizationId || session.session.activeOrganizationId;

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

    const targetUserId = userId || session.user.id;
    const targetOrgId = organizationId || session.session.activeOrganizationId;

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
 * Gets organization statistics
 */
export async function getOrganizationStats(organizationId: string): Promise<{
  memberCount: number;
  teamCount: number;
  apiKeyCount: number;
  invitationCount: number;
} | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return null;
    }

    // Check if user has access to this organization
    const membership = await database.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return null;
    }

    const [memberCount, teamCount, apiKeyCount, invitationCount] = await Promise.all([
      database.member.count({
        where: { organizationId },
      }),
      database.team.count({
        where: { organizationId },
      }),
      database.apiKey.count({
        where: { organizationId },
      }),
      database.invitation.count({
        where: {
          organizationId,
          status: 'pending',
        },
      }),
    ]);

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
 * Switches user's active organization
 */
export async function switchOrganization(organizationId: string): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return false;
    }

    // Check if user is a member of the target organization
    const membership = await database.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return false;
    }

    // Use Better Auth to switch organization
    const result = await auth.api.setActiveOrganization({
      body: { organizationId },
      headers: await headers(),
    });

    return result.success || false;
  } catch (error) {
    console.error('Switch organization error:', error);
    return false;
  }
}

/**
 * Creates a default organization for a user
 */
export async function createDefaultOrganization(
  userId: string,
  name?: string,
): Promise<Organization | null> {
  try {
    const orgName = name || `${userId}'s Organization`;
    const result = await auth.api.createOrganization({
      body: {
        name: orgName,
        slug: orgName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      },
      headers: await headers(),
    });

    if (!result.organization) {
      return null;
    }

    // Add user as owner
    await database.member.create({
      data: {
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        organizationId: result.organization.id,
        role: 'owner',
        userId,
      },
    });

    return result.organization;
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

    if (!session?.session.activeOrganizationId) {
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
