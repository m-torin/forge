/**
 * Server-side organization helper functions
 */

import 'server-only';
import { headers } from 'next/headers';
import { prisma as database } from '@repo/database/prisma';

import { auth } from '../auth';

import type { Organization, Member } from '@repo/database/prisma';
import type { OrganizationRole } from '../../shared/types';

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
 * Gets current user's organizations
 */
export async function getUserOrganizations(): Promise<Organization[]> {
  try {
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
export async function getOrganizationWithMembers(
  organizationId: string
): Promise<{
  organization: Organization;
  members: Array<Member & { user: { id: string; name: string; email: string } }>;
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
        userId: session.user.id,
        organizationId,
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
        where: { organizationId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    if (!organization) {
      return null;
    }

    return { organization, members };
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
  organizationId: string
): Promise<OrganizationRole | null> {
  try {
    const membership = await database.member.findFirst({
      where: {
        userId,
        organizationId,
      },
    });

    return membership?.role as OrganizationRole || null;
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

    return getUserRoleInOrganization(
      session.user.id,
      session.session.activeOrganizationId
    );
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
  organizationId?: string
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
  organizationId?: string
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
export async function getOrganizationStats(organizationId?: string): Promise<{
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

    const targetOrgId = organizationId || session.session.activeOrganizationId;

    if (!targetOrgId) {
      return null;
    }

    // Check if user has access to this organization
    const membership = await database.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: targetOrgId,
      },
    });

    if (!membership) {
      return null;
    }

    const [memberCount, teamCount, apiKeyCount, invitationCount] = await Promise.all([
      database.member.count({
        where: { organizationId: targetOrgId },
      }),
      database.team.count({
        where: { organizationId: targetOrgId },
      }),
      database.apiKey.count({
        where: { organizationId: targetOrgId },
      }),
      database.invitation.count({
        where: {
          organizationId: targetOrgId,
          status: 'pending',
        },
      }),
    ]);

    return {
      memberCount,
      teamCount,
      apiKeyCount,
      invitationCount,
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
        userId: session.user.id,
        organizationId,
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