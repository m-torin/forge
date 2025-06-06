/**
 * Shared team types and interfaces
 */

// Re-export Team type from database
export type { Team } from '@repo/database/prisma';

// TeamRole is defined in permissions.ts to avoid circular imports

export interface TeamMember {
  id: string;
  invitedBy?: string;
  joinedAt: Date;
  role: string;
  teamId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  userId: string;
}

export interface TeamWithMembers {
  createdAt: Date;
  description?: string;
  id: string;
  memberCount: number;
  members: TeamMember[];
  name: string;
  organizationId: string;
  updatedAt: Date;
}

export interface TeamInvitation {
  createdAt: Date;
  email: string;
  expiresAt: Date;
  id: string;
  invitedBy: string;
  inviter: {
    id: string;
    name: string;
    email: string;
  };
  role: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  team: {
    id: string;
    name: string;
    organizationId: string;
  };
  teamId: string;
}

// Team creation data
export interface CreateTeamData {
  description?: string;
  initialMembers?: {
    email: string;
    role: string;
  }[];
  name: string;
  organizationId?: string;
}

export interface CreateTeamResult {
  error?: string;
  success: boolean;
  team?: TeamWithMembers;
}

// Team invitation data
export interface InviteToTeamData {
  email: string;
  message?: string;
  role: string;
  teamId: string;
}

export interface InviteToTeamResult {
  error?: string;
  invitation?: TeamInvitation;
  success: boolean;
}

// Team member management
export interface UpdateTeamMemberData {
  role: string;
  teamId: string;
  userId: string;
}

export interface UpdateTeamMemberResult {
  error?: string;
  member?: TeamMember;
  success: boolean;
}

export interface RemoveTeamMemberResult {
  error?: string;
  success: boolean;
}

// Team listing and queries
export interface ListTeamsResult {
  error?: string;
  success: boolean;
  teams?: TeamWithMembers[];
  total?: number;
}

export interface GetTeamResult {
  error?: string;
  success: boolean;
  team?: TeamWithMembers;
}

// Team updates
export interface UpdateTeamData {
  description?: string;
  name?: string;
}

export interface UpdateTeamResult {
  error?: string;
  success: boolean;
  team?: TeamWithMembers;
}

export interface DeleteTeamResult {
  error?: string;
  success: boolean;
}

// Team invitations management
export interface ListTeamInvitationsResult {
  error?: string;
  invitations?: TeamInvitation[];
  success: boolean;
}

export interface RespondToInvitationData {
  invitationId: string;
  response: 'accept' | 'decline';
}

export interface RespondToInvitationResult {
  error?: string;
  success: boolean;
  teamId?: string;
}

export interface CancelInvitationResult {
  error?: string;
  success: boolean;
}

// Team permissions and roles
export interface TeamPermissionCheck {
  permission: string;
  teamId: string;
  userId?: string;
}

export interface TeamPermissionResult {
  error?: string;
  hasPermission: boolean;
  role?: string;
}

// Team statistics and analytics
export interface TeamStats {
  activeMembers: number;
  createdAt: Date;
  lastActivity?: Date;
  memberCount: number;
  pendingInvitations: number;
}

export interface GetTeamStatsResult {
  error?: string;
  stats?: TeamStats;
  success: boolean;
}
