declare module 'better-auth/client' {
  // Export the AuthClient interface directly
  interface AuthClient {
    admin?: {
      createUser: (params: any) => Promise<any>;
      listUsers: (params?: any) => Promise<any>;
      setRole: (params: any) => Promise<any>;
      banUser: (params: any) => Promise<any>;
      unbanUser: (params: any) => Promise<any>;
      listUserSessions: (params: any) => Promise<any>;
      revokeUserSession: (params: any) => Promise<any>;
      revokeUserSessions: (params: any) => Promise<any>;
      impersonateUser: (params: any) => Promise<any>;
      stopImpersonating: (params?: any) => Promise<any>;
      removeUser: (params: any) => Promise<any>;
      hasPermission: (params: any) => boolean;
      checkRolePermission: (params: any) => boolean;
    };
    apiKey?: {
      create: (params: any) => Promise<any>;
      update: (params: any) => Promise<any>;
      delete: (params: any) => Promise<any>;
      list: (params?: any) => Promise<any>;
    };
    organization?: {
      create: (params: any) => Promise<any>;
      update: (params: any) => Promise<any>;
      delete: (params: any) => Promise<any>;
      checkSlug: (params: any) => Promise<any>;
      inviteMember: (params: any) => Promise<any>;
      removeMember: (params: any) => Promise<any>;
      updateMemberRole: (params: any) => Promise<any>;
      leave: (params: any) => Promise<any>;
      getFullOrganization: (params: any) => Promise<any>;
      list: (params?: any) => Promise<any>;
      listInvitations: (params?: any) => Promise<any>;
      getInvitation: (params: any) => Promise<any>;
      acceptInvitation: (params: any) => Promise<any>;
      rejectInvitation: (params: any) => Promise<any>;
      cancelInvitation: (params: any) => Promise<any>;
      getActiveMember: (params?: any) => Promise<any>;
      setActive: (params: any) => Promise<any>;
      createTeam: (params: any) => Promise<any>;
      updateTeam: (params: any) => Promise<any>;
      removeTeam: (params: any) => Promise<any>;
      listTeams: (params?: any) => Promise<any>;
      hasPermission: (params: any) => boolean;
      checkRolePermission: (params: any) => boolean;
    };
    signIn: (params: any) => Promise<any>;
    signOut: (params?: any) => Promise<any>;
    signUp: (params: any) => Promise<any>;
    useSession: () => any;
  }

  export function createAuthClient(config: any): AuthClient;
}

declare module 'better-auth/client/plugins' {
  export function organizationClient(config: any): any;
  export function apiKeyClient(config?: any): any;
  export function adminClient(config: any): any;
}
