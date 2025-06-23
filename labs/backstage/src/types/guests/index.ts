/**
 * Shared types for the guest management section
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string | Date;
  lastActive?: string | Date;
  organizations?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date | null;
  metadata?: any;
  members?: Array<{
    id: string;
    userId: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  invitations?: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
  }>;
  count?: {
    members: number;
    invitations: number;
    teams?: number;
    apiKeys?: number;
  };
}

export interface ApiKey {
  id: string;
  name: string;
  start?: string;
  prefix?: string;
  enabled: boolean;
  lastUsedAt?: string | Date;
  expiresAt?: string | Date;
  createdAt: string | Date;
  updatedAt?: string | Date;
  requestCount?: number;
  permissions?: string[];
  userId?: string;
  organizationId?: string;
  metadata?: {
    type?: 'user' | 'service';
    description?: string;
    [key: string]: any;
  };
  user?: {
    name: string;
    email: string;
  };
  organization?: {
    name: string;
    slug: string;
  };
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    banned: number;
    admins: number;
  };
  companies: {
    total: number;
    totalMembers: number;
    pendingInvitations: number;
    averageMembers: number;
  };
  apiKeys: {
    total: number;
    active: number;
    expired: number;
    totalRequests: number;
  };
}

export interface BulkOperationResult {
  successful: Array<{ id: string; email?: string }>;
  failed: Array<{ email: string; error: string }>;
  total: number;
}
