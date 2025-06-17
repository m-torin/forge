/**
 * React hooks for authentication
 */

'use client';

import { useEffect, useState } from 'react';

import { authClient } from './auth-client';

import type { AuthContextType } from '../shared/types';

/**
 * Hook to get current authentication session
 */
export function useSession() {
  const [session, setSession] = useState<{
    data: any | null;
    error: Error | null;
    isPending: boolean;
  }>({
    data: null,
    error: null,
    isPending: true,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Use Better Auth client to get session
        const sessionData = await authClient.getSession();
        setSession({
          data: sessionData,
          error: null,
          isPending: false,
        });
      } catch (error) {
        setSession({
          data: null,
          error: error as Error,
          isPending: false,
        });
      }
    };

    getInitialSession();

    // Note: Better Auth doesn't have onSessionChange in the current version
    // We'll simulate this with periodic checks or use React context
    const interval = setInterval(async () => {
      try {
        const sessionData = await authClient.getSession();
        setSession({
          data: sessionData,
          error: null,
          isPending: false,
        });
      } catch {
        // Ignore errors during polling
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return session;
}

/**
 * Hook to get current user with loading state
 */
export function useUser() {
  const { data: session, isPending } = useSession();

  if (!session?.user) {
    return { isLoaded: !isPending, user: null };
  }

  // Map Better Auth user to expected interface for compatibility
  const user = {
    id: session.user.id,
    name: session.user.name || '',
    createdAt: session.user.createdAt,
    email: session.user.email,
    emailAddresses: [
      {
        emailAddress: session.user.email,
        isPrimary: true,
      },
    ],
    firstName: session.user.name?.split(' ')[0] || '',
    fullName: session.user.name || '',
    image: session.user.image || null,
    imageUrl: session.user.image || null,
    lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
    phoneNumbers: [],
  };

  return { isLoaded: !isPending, user };
}

/**
 * Hook to get authentication context
 */
export function useAuth(): AuthContextType {
  const { data: session, isPending } = useSession();

  return {
    isAuthenticated: Boolean(session?.user),
    isLoading: isPending,
    session: session?.session || null,
    user: session?.user || null,
  };
}

/**
 * Hook for organization management using proper better-auth patterns
 */
export function useOrganization() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load organizations and active organization
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load organizations list
        const orgsList = await authClient.organization.list();

        // Handle organizations list
        const orgs = Array.isArray(orgsList) ? orgsList : [];
        setOrganizations(orgs);

        // For now, set the first organization as active if available
        // TODO: Implement proper active organization detection when better-auth provides client-side session access
        if (orgs.length > 0) {
          setActiveOrganization(orgs[0]);
        } else {
          setActiveOrganization(null);
        }
      } catch (error) {
        console.error('Failed to load organization data:', error);
        setError(error as Error);
        setOrganizations([]);
        setActiveOrganization(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const setActiveOrg = async (orgId: string) => {
    try {
      await authClient.organization.setActive({ organizationId: orgId });
      // Find and set the active organization from the current list
      const activeOrg = organizations.find((org) => org.id === orgId);
      setActiveOrganization(activeOrg || null);
    } catch (error) {
      console.error('Failed to set active organization:', error);
      throw error;
    }
  };

  const createOrganization = async (data: { name: string; slug?: string; logo?: string }) => {
    try {
      const result = await authClient.organization.create({
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        logo: data.logo,
      });

      // Refresh organizations list
      const updatedOrgs = await authClient.organization.list();
      const orgs = Array.isArray(updatedOrgs) ? updatedOrgs : [];
      setOrganizations(orgs);

      return result;
    } catch (error) {
      console.error('Failed to create organization:', error);
      throw error;
    }
  };

  const updateOrganization = async (data: {
    organizationId?: string;
    name?: string;
    slug?: string;
    logo?: string;
    metadata?: any;
  }) => {
    try {
      const result = await authClient.organization.update({
        organizationId: data.organizationId || activeOrganization?.id,
        data: {
          name: data.name,
          slug: data.slug,
          logo: data.logo,
          metadata: data.metadata,
        },
      });

      // Refresh organizations list
      const updatedOrgs = await authClient.organization.list();
      const orgs = Array.isArray(updatedOrgs) ? updatedOrgs : [];
      setOrganizations(orgs);

      // Update active organization if it was the updated one
      if (activeOrganization && 'id' in result && result.id === activeOrganization.id) {
        // Refresh to get the updated organization
        const updatedActiveOrg = orgs.find((org) => org.id === activeOrganization.id);
        setActiveOrganization(updatedActiveOrg || null);
      }

      return result;
    } catch (error) {
      console.error('Failed to update organization:', error);
      throw error;
    }
  };

  const leaveOrganization = async (organizationId?: string) => {
    try {
      const orgId = organizationId || activeOrganization?.id;
      if (!orgId) {
        throw new Error('No organization ID provided');
      }

      await authClient.organization.leave({
        organizationId: orgId,
      });

      // Refresh data after leaving
      const updatedOrgs = await authClient.organization.list();
      const orgs = Array.isArray(updatedOrgs) ? updatedOrgs : [];
      setOrganizations(orgs);

      // If the left organization was active, clear it
      if (activeOrganization && activeOrganization.id === orgId) {
        // Set first available organization as active, or null if none
        setActiveOrganization(orgs.length > 0 ? orgs[0] : null);
      }
    } catch (error) {
      console.error('Failed to leave organization:', error);
      throw error;
    }
  };

  const deleteOrganization = async (organizationId?: string) => {
    try {
      const orgId = organizationId || activeOrganization?.id;
      if (!orgId) {
        throw new Error('No organization ID provided');
      }

      await authClient.organization.delete({
        organizationId: orgId,
      });

      // Refresh data after deletion
      const updatedOrgs = await authClient.organization.list();
      const orgs = Array.isArray(updatedOrgs) ? updatedOrgs : [];
      setOrganizations(orgs);

      // If the deleted organization was active, clear it
      if (activeOrganization && activeOrganization.id === orgId) {
        // Set first available organization as active, or null if none
        setActiveOrganization(orgs.length > 0 ? orgs[0] : null);
      }
    } catch (error) {
      console.error('Failed to delete organization:', error);
      throw error;
    }
  };

  const inviteMember = async (data: {
    email: string;
    role: 'member' | 'admin' | 'owner';
    organizationId?: string;
  }) => {
    try {
      const result = await authClient.organization.inviteMember({
        email: data.email,
        role: data.role,
        organizationId: data.organizationId || activeOrganization?.id,
      });
      return result;
    } catch (error) {
      console.error('Failed to invite member:', error);
      throw error;
    }
  };

  const removeMember = async (data: { memberIdOrEmail: string; organizationId?: string }) => {
    try {
      await authClient.organization.removeMember({
        memberIdOrEmail: data.memberIdOrEmail,
        organizationId: data.organizationId || activeOrganization?.id,
      });
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  };

  const updateMemberRole = async (data: {
    memberId: string;
    role: 'member' | 'admin' | 'owner';
    organizationId?: string;
  }) => {
    try {
      await authClient.organization.updateMemberRole({
        memberId: data.memberId,
        role: data.role,
        organizationId: data.organizationId || activeOrganization?.id,
      });
    } catch (error) {
      console.error('Failed to update member role:', error);
      throw error;
    }
  };

  return {
    // State
    organizations: organizations || [],
    activeOrganization: activeOrganization || null,
    isLoading,
    error,

    // Organization methods
    setActiveOrganization: setActiveOrg,
    createOrganization,
    updateOrganization,
    leaveOrganization,
    deleteOrganization,

    // Member management methods
    inviteMember,
    removeMember,
    updateMemberRole,

    // Utility methods
    refresh: async () => {
      try {
        const updatedOrgs = await authClient.organization.list();
        const orgs = Array.isArray(updatedOrgs) ? updatedOrgs : [];
        setOrganizations(orgs);

        // Set first available organization as active, or null if none
        if (orgs.length > 0) {
          setActiveOrganization(orgs[0]);
        } else {
          setActiveOrganization(null);
        }
      } catch (error) {
        console.error('Failed to refresh organization data:', error);
        setError(error as Error);
      }
    },
  };
}
