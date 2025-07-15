'use client';

import { Center, Stack, Text } from '@mantine/core';
import { AuthLoading } from './AuthLoading';

export interface AuthUser {
  id: string;
  role?: string | null;
  [key: string]: any;
}

export interface AuthSession {
  activeOrganizationId?: string | null;
  [key: string]: any;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  user: AuthUser | null;
  session?: AuthSession | null;
  isLoading: boolean;
  onUnauthorized?: () => void;
  allowedRoles?: string[];
  requireOrganization?: boolean;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
  organizationRequiredComponent?: React.ReactNode;
}

export function AuthGuard({
  children,
  user,
  session,
  isLoading,
  onUnauthorized,
  allowedRoles,
  requireOrganization = false,
  loadingComponent,
  unauthorizedComponent,
  organizationRequiredComponent,
}: AuthGuardProps) {
  // Still loading auth state
  if (isLoading) {
    return loadingComponent || <AuthLoading message="Loading..." height="100vh" />;
  }

  // Not authenticated
  if (!user) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    return null; // Will redirect or handle in parent
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role || 'user';
    if (!allowedRoles.includes(userRole)) {
      return (
        unauthorizedComponent || (
          <Center h="100vh">
            <Stack align="center" gap="md">
              <Text size="xl" fw={500}>
                Unauthorized
              </Text>
              <Text c="dimmed">You don't have permission to access this page.</Text>
            </Stack>
          </Center>
        )
      );
    }
  }

  // Check organization requirement
  if (requireOrganization && (!session || !session.activeOrganizationId)) {
    return (
      organizationRequiredComponent || (
        <Center h="100vh">
          <Stack align="center" gap="md">
            <Text size="xl" fw={500}>
              Organization Required
            </Text>
            <Text c="dimmed">You need to be part of an organization to access this page.</Text>
          </Stack>
        </Center>
      )
    );
  }

  // All checks passed
  return children;
}
