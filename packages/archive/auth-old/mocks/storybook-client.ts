'use client';

import { getMockApiKeys, getMockLoadingState } from './story-context';

// Create mock implementations for all auth exports
// This file is designed to be used as a drop-in replacement for @repo/auth/client

// Create basic mock functions for each auth operation
export const signIn = {
  email: async () => ({ success: true }),
};

export const signOut = async () => ({ success: true });

export const signUp = {
  email: async () => ({ success: true }),
};

// Organization methods
export const createOrganization = async () => ({ success: true });
export const updateOrganization = async () => ({ success: true });
export const deleteOrganization = async () => ({ success: true });
export const checkSlug = async () => ({ available: true, success: true });
export const inviteMember = async () => ({ success: true });
export const removeOrganizationMember = async () => ({ success: true });
export const updateMemberRole = async () => ({ success: true });
export const leaveOrganization = async () => ({ success: true });
export const getOrganization = async () => ({
  organization: { id: '123', name: 'Mock Org' },
  success: true,
});
export const listOrganizations = async () => ({ organizations: [], success: true });
export const listInvitations = async () => ({ invitations: [], success: true });
export const getInvitation = async () => ({ invitation: null, success: true });
export const acceptInvitation = async () => ({ success: true });
export const rejectInvitation = async () => ({ success: true });
export const cancelInvitation = async () => ({ success: true });
export const getActiveMember = async () => ({ member: null, success: true });
export const setActiveOrganization = async () => ({ success: true });

// Team methods
export const createTeam = async () => ({ success: true });
export const updateTeam = async () => ({ success: true });
export const removeTeam = async () => ({ success: true });
export const listTeams = async () => ({ success: true, teams: [] });

// Permission methods
export const hasPermission = () => true;
export const checkOrgRolePermission = () => true;

// API Key methods - these utilize the story context
export const createApiKey = async () => ({ key: { id: '123', name: 'Mock Key' }, success: true });
export const updateApiKey = async () => ({ success: true });
export const deleteApiKey = async () => ({ success: true });
export const listApiKeys = async () => {
  return getMockApiKeys();
};

// Admin methods
export const createUser = async () => ({ success: true });
export const listUsers = async () => ({ success: true, users: [] });
export const setUserRole = async () => ({ success: true });
export const banUser = async () => ({ success: true });
export const unbanUser = async () => ({ success: true });
export const listUserSessions = async () => ({ sessions: [], success: true });
export const revokeUserSession = async () => ({ success: true });
export const revokeUserSessions = async () => ({ success: true });
export const impersonateUser = async () => ({ success: true });
export const stopImpersonating = async () => ({ success: true });
export const removeUser = async () => ({ success: true });
export const hasAdminPermission = () => true;
export const checkRolePermission = () => true;

// Hooks
export const useSession = () => ({
  data: null,
  error: null,
  isPending: getMockLoadingState(),
});

export const useUser = () => ({
  isLoaded: !getMockLoadingState(),
  user: null,
});

// Other exports (placeholders)
export const authClient = {
  organization: {
    create: createOrganization,
    delete: deleteOrganization,
    update: updateOrganization,
  },
  signIn,
  signOut,
  signUp,
};
