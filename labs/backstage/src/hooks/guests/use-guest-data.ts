/**
 * Custom hooks for guest management data fetching
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getUsersAction,
  getOrganizationsAction,
  getApiKeysAction,
  getApiKeyStatisticsAction,
} from '@/actions/guests';
import { handleApiError } from '@/utils/guests/error-handler';
import type { User, Organization, ApiKey, DashboardStats } from '@/types/guests';

/**
 * Hook to fetch and manage users data
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUsersAction();
      if (result.success && result.data) {
        setUsers(
          result.data.map((user: any) => ({
            ...user,
            role: user.role || 'user',
            banned: user.banned || false,
          })),
        );
      } else {
        setError(result.error || 'Failed to load users');
        handleApiError(result.error, {
          title: 'Failed to load users',
          fallbackMessage: 'Unable to fetch user data',
        });
      }
    } catch (err) {
      setError('Failed to load users');
      handleApiError(err, {
        title: 'Failed to load users',
        fallbackMessage: 'Unable to fetch user data',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return { users, loading, error, refetch: loadUsers };
}

/**
 * Hook to fetch and manage organizations data
 */
export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOrganizationsAction();
      if (result.success && result.data) {
        setOrganizations(result.data || []);
      } else {
        setError((result as any).error || 'Failed to load organizations');
        handleApiError((result as any).error, {
          title: 'Failed to load organizations',
          fallbackMessage: 'Unable to fetch organization data',
        });
      }
    } catch (err) {
      setError('Failed to load organizations');
      handleApiError(err, {
        title: 'Failed to load organizations',
        fallbackMessage: 'Unable to fetch organization data',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  return { organizations, loading, error, refetch: loadOrganizations };
}

/**
 * Hook to fetch and manage API keys data
 */
export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApiKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getApiKeysAction();
      if (result.success && result.data) {
        setApiKeys(result.data);
      } else {
        setError(result.error || 'Failed to load API keys');
        handleApiError(result.error, {
          title: 'Failed to load API keys',
          fallbackMessage: 'Unable to fetch API key data',
        });
      }
    } catch (err) {
      setError('Failed to load API keys');
      handleApiError(err, {
        title: 'Failed to load API keys',
        fallbackMessage: 'Unable to fetch API key data',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  return { apiKeys, loading, error, refetch: loadApiKeys };
}

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    users: { total: 0, active: 0, banned: 0, admins: 0 },
    companies: { total: 0, totalMembers: 0, pendingInvitations: 0, averageMembers: 0 },
    apiKeys: { total: 0, active: 0, expired: 0, totalRequests: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, companiesRes, apiKeysRes, _apiStatsRes] = await Promise.all([
        getUsersAction(),
        getOrganizationsAction(),
        getApiKeysAction(),
        getApiKeyStatisticsAction(),
      ]);

      const users = usersRes.success ? usersRes.data || [] : [];
      const companies = companiesRes.success ? companiesRes.data || [] : [];
      const apiKeys = apiKeysRes.success ? apiKeysRes.data || [] : [];

      setStats({
        users: {
          total: users.length,
          active: users.filter((u: any) => !u.banned).length,
          banned: users.filter((u: any) => u.banned).length,
          admins: users.filter((u: any) => ['admin', 'super-admin'].includes(u.role)).length,
        },
        companies: {
          total: companies.length,
          totalMembers: companies.reduce(
            (acc: number, org: any) => acc + (org._count?.members || org.members?.length || 0),
            0,
          ),
          pendingInvitations: companies.reduce(
            (acc: number, org: any) =>
              acc + (org._count?.invitations || org.invitations?.length || 0),
            0,
          ),
          averageMembers:
            companies.length > 0
              ? Math.round(
                  companies.reduce(
                    (acc: number, org: any) =>
                      acc + (org._count?.members || org.members?.length || 0),
                    0,
                  ) / companies.length,
                )
              : 0,
        },
        apiKeys: {
          total: apiKeys.length,
          active: apiKeys.filter(
            (k: any) => k.enabled && (!k.expiresAt || new Date(k.expiresAt) > new Date()),
          ).length,
          expired: apiKeys.filter((k: any) => k.expiresAt && new Date(k.expiresAt) < new Date())
            .length,
          totalRequests: apiKeys.reduce(
            (acc: number, key: any) => acc + (key.requestCount || 0),
            0,
          ),
        },
      });
    } catch (err) {
      setError('Failed to load dashboard statistics');
      handleApiError(err, {
        title: 'Failed to load statistics',
        fallbackMessage: 'Unable to fetch dashboard data',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refetch: loadStats };
}
