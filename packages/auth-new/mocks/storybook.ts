'use client';

import { getMockApiKeys, getMockLoadingState } from './story-context';

// Mock auth client for Storybook that doesn't try to connect to real services
export const mockAuthClient = {
  // Mock admin methods
  admin: {
    banUser: async () => ({ success: true }),
    checkRolePermission: () => true,
    createUser: async () => ({ success: true }),
    hasPermission: () => true,
    impersonateUser: async () => ({ success: true }),
    listUsers: async () => ({ success: true, users: [] }),
    listUserSessions: async () => ({ sessions: [], success: true }),
    removeUser: async () => ({ success: true }),
    revokeUserSession: async () => ({ success: true }),
    revokeUserSessions: async () => ({ success: true }),
    setRole: async () => ({ success: true }),
    stopImpersonating: async () => ({ success: true }),
    unbanUser: async () => ({ success: true }),
  },
  // Mock API key methods
  apiKey: {
    create: async () => ({ key: { id: '123', name: 'Mock Key' }, success: true }),
    delete: async () => ({ success: true }),
    list: async () => ({ keys: [], success: true }),
    update: async () => ({ success: true }),
  },
  // Mock organization methods
  organization: {
    acceptInvitation: async () => ({ success: true }),
    cancelInvitation: async () => ({ success: true }),
    checkRolePermission: () => true,
    checkSlug: async () => ({ available: true, success: true }),
    create: async () => ({ success: true }),
    createTeam: async () => ({ success: true }),
    delete: async () => ({ success: true }),
    getActiveMember: async () => ({ member: null, success: true }),
    getFullOrganization: async () => ({
      organization: { id: '123', name: 'Mock Org' },
      success: true,
    }),
    getInvitation: async () => ({ invitation: null, success: true }),
    hasPermission: () => true,
    inviteMember: async () => ({ success: true }),
    leave: async () => ({ success: true }),
    list: async () => ({ organizations: [], success: true }),
    listInvitations: async () => ({ invitations: [], success: true }),
    listTeams: async () => ({ success: true, teams: [] }),
    rejectInvitation: async () => ({ success: true }),
    removeMember: async () => ({ success: true }),
    removeTeam: async () => ({ success: true }),
    setActive: async () => ({ success: true }),
    update: async () => ({ success: true }),
    updateMemberRole: async () => ({ success: true }),
    updateTeam: async () => ({ success: true }),
  },
  signIn: {
    email: async () => ({ success: true }),
    // Add other methods as needed
  },
  signOut: async () => ({ success: true }),
  signUp: {
    email: async () => ({ success: true }),
  },
};

// Mock direct export functions
export const listApiKeys = async () => {
  // Return story mock data if available
  return getMockApiKeys();
};

export const deleteApiKey = async () => {
  return { success: true };
};

// Mock session hook that returns null session by default
export const mockUseSession = () => ({
  data: null,
  error: null,
  isPending: getMockLoadingState(),
});

// Mock user hook that returns null user by default
export const mockUseUser = () => ({
  isLoaded: !getMockLoadingState(),
  user: null,
});
