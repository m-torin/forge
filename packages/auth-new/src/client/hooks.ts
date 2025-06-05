/**
 * React hooks for authentication
 */

'use client';

import { useEffect, useState } from 'react';
import { authClient } from './auth-client';
import type { AuthContextType, User, Session } from '../shared/types';

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
      } catch (error) {
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
    user: session?.user || null,
    session: session?.session || null,
    isLoading: isPending,
    isAuthenticated: Boolean(session?.user),
  };
}

/**
 * Hook for organization management
 */
export function useOrganization() {
  const [state, setState] = useState({
    activeOrganization: null as any,
    organizations: [] as any[],
    isLoading: true,
  });

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const [orgs, active] = await Promise.all([
          authClient.organization?.list(),
          authClient.organization?.getActive(),
        ]);
        
        setState({
          organizations: orgs || [],
          activeOrganization: active || null,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to load organizations:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadOrganizations();
  }, []);

  const setActiveOrganization = async (orgId: string) => {
    try {
      await authClient.organization?.setActive({ organizationId: orgId });
      const updated = await authClient.organization?.getActive();
      setState(prev => ({ ...prev, activeOrganization: updated || null }));
    } catch (error) {
      console.error('Failed to set active organization:', error);
    }
  };

  return {
    ...state,
    setActiveOrganization,
  };
}