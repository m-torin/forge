/**
 * Shared team types and interfaces
 */

// Re-export Team type from database
export type { Team } from '@repo/database/prisma';

export interface TeamRole {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  joinedAt: Date;
  invitedBy?: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface TeamWithMembers {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  members: TeamMember[];
  memberCount: number;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: string;
  invitedBy: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  team: {
    id: string;
    name: string;
    organizationId: string;
  };
  inviter: {
    id: string;
    name: string;
    email: string;
  };
}

// Team creation data
export interface CreateTeamData {
  name: string;
  description?: string;
  organizationId?: string;
  initialMembers?: Array<{
    email: string;
    role: string;
  }>;
}

export interface CreateTeamResult {
  success: boolean;
  team?: TeamWithMembers;
  error?: string;
}

// Team invitation data
export interface InviteToTeamData {
  teamId: string;
  email: string;
  role: string;
  message?: string;
}

export interface InviteToTeamResult {
  success: boolean;
  invitation?: TeamInvitation;
  error?: string;
}

// Team member management
export interface UpdateTeamMemberData {
  teamId: string;
  userId: string;
  role: string;
}

export interface UpdateTeamMemberResult {
  success: boolean;
  member?: TeamMember;
  error?: string;
}

export interface RemoveTeamMemberResult {
  success: boolean;
  error?: string;
}

// Team listing and queries
export interface ListTeamsResult {
  success: boolean;
  teams?: TeamWithMembers[];
  total?: number;
  error?: string;
}

export interface GetTeamResult {
  success: boolean;
  team?: TeamWithMembers;
  error?: string;
}

// Team updates
export interface UpdateTeamData {
  name?: string;
  description?: string;
}

export interface UpdateTeamResult {
  success: boolean;
  team?: TeamWithMembers;
  error?: string;
}

export interface DeleteTeamResult {
  success: boolean;
  error?: string;
}

// Team invitations management
export interface ListTeamInvitationsResult {
  success: boolean;
  invitations?: TeamInvitation[];
  error?: string;
}

export interface RespondToInvitationData {
  invitationId: string;
  response: 'accept' | 'decline';
}

export interface RespondToInvitationResult {
  success: boolean;
  teamId?: string;
  error?: string;
}

export interface CancelInvitationResult {
  success: boolean;
  error?: string;
}

// Team permissions and roles
export interface TeamPermissionCheck {
  teamId: string;
  permission: string;
  userId?: string;
}

export interface TeamPermissionResult {
  hasPermission: boolean;
  role?: string;
  error?: string;
}

// Team statistics and analytics
export interface TeamStats {
  memberCount: number;
  activeMembers: number;
  pendingInvitations: number;
  createdAt: Date;
  lastActivity?: Date;
}

export interface GetTeamStatsResult {
  success: boolean;
  stats?: TeamStats;
  error?: string;
}