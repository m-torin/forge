import 'server-only';
import { headers } from 'next/headers';

import { auth } from './server';

/**
 * Server-side helper to check if user has permission
 */
export const checkPermission = async (permissions: Record<string, string[]>) => {
  return auth.api.hasPermission({
    body: { permissions },
    headers: await headers(),
  });
};

/**
 * Server-side helper to add a member directly to an organization
 */
export const addMember = async ({
  organizationId,
  role,
  teamId,
  userId,
}: {
  userId: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member' | ('owner' | 'admin' | 'member')[];
  teamId?: string;
}) => {
  return auth.api.addMember({
    body: {
      organizationId,
      role,
      teamId,
      userId,
    },
  });
};

/**
 * Get current user's organizations
 */
export const getUserOrganizations = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return [];
  }

  return auth.api.listOrganizations({
    headers: await headers(),
  });
};

/**
 * Get organization by ID (server-side)
 */
export const getOrganizationById = async (organizationId: string) => {
  return auth.api.getFullOrganization({
    headers: await headers(),
    query: { organizationId },
  });
};

/**
 * Get organization by slug (server-side)
 */
export const getOrganizationBySlug = async (slug: string) => {
  return auth.api.getFullOrganization({
    headers: await headers(),
    query: { organizationSlug: slug },
  });
};
