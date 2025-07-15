import { vi } from 'vitest';

// Mock Better-Auth and its ecosystem
export const createMockBetterAuth = () => {
  const mockApi = {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    listUsers: vi.fn(),
    verifyApiKey: vi.fn(),
    createApiKey: vi.fn(),
    deleteApiKey: vi.fn(),
    listApiKeys: vi.fn(),
    createOrganization: vi.fn(),
    updateOrganization: vi.fn(),
    deleteOrganization: vi.fn(),
    listOrganizations: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn(),
    updateMember: vi.fn(),
    listMembers: vi.fn(),
    createTeam: vi.fn(),
    updateTeam: vi.fn(),
    deleteTeam: vi.fn(),
    listTeams: vi.fn(),
    inviteUser: vi.fn(),
    acceptInvitation: vi.fn(),
    rejectInvitation: vi.fn(),
    listInvitations: vi.fn(),
    resetPassword: vi.fn(),
    changePassword: vi.fn(),
    forgetPassword: vi.fn(),
    verifyEmail: vi.fn(),
    sendEmailVerification: vi.fn(),
    enableTwoFactor: vi.fn(),
    disableTwoFactor: vi.fn(),
    verifyTwoFactor: vi.fn(),
    generateBackupCodes: vi.fn(),
  };

  const mockAuth = {
    api: mockApi,
    options: {
      baseURL: 'http://localhost:3000',
      basePath: '/api/auth',
      database: undefined,
      secret: 'test-secret',
      advanced: {
        cookiePrefix: 'better-auth.',
        crossSubDomainCookies: {
          enabled: false,
        },
        useSecureCookies: false,
      },
    },
    $Infer: {} as any,
    middleware: vi.fn(),
    handler: vi.fn(),
  };

  return {
    mockAuth,
    mockApi,
  };
};

// Mock authentication client
export const createMockAuthClient = () => {
  const mockClient = {
    forgetPassword: vi.fn(),
    getSession: vi.fn(() => Promise.resolve(null)),
    resetPassword: vi.fn(),
    signIn: {
      email: vi.fn(),
      social: vi.fn(),
    },
    signOut: vi.fn(),
    signUp: {
      email: vi.fn(),
    },
    updateUser: vi.fn(),
    changePassword: vi.fn(),
    verifyEmail: vi.fn(),
    sendEmailVerification: vi.fn(),
    organization: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      setActive: vi.fn(),
      getActive: vi.fn(),
      inviteMember: vi.fn(),
      acceptInvitation: vi.fn(),
      rejectInvitation: vi.fn(),
      updateMember: vi.fn(),
      removeMember: vi.fn(),
      listMembers: vi.fn(),
      listInvitations: vi.fn(),
    },
    team: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      addMember: vi.fn(),
      removeMember: vi.fn(),
      listMembers: vi.fn(),
    },
    twoFactor: {
      enable: vi.fn(),
      disable: vi.fn(),
      verify: vi.fn(),
      generateBackupCodes: vi.fn(),
    },
    apiKey: {
      create: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    },
    useAuth: vi.fn(() => ({
      data: null,
      isPending: false,
      error: null,
    })),
    useSession: vi.fn(() => ({
      data: null,
      isPending: false,
      error: null,
    })),
  };

  return mockClient;
};

// Mock Better-Auth plugins
export const createMockBetterAuthPlugins = () => {
  return {
    // Core plugins
    bearer: vi.fn(),
    customSession: vi.fn(),
    magicLink: vi.fn(),
    multiSession: vi.fn(),
    oneTap: vi.fn(),
    openAPI: vi.fn(),
    organization: vi.fn(),
    twoFactor: vi.fn(),
    passkey: vi.fn(),

    // Adapters
    prismaAdapter: vi.fn(),
    nextCookies: vi.fn(),

    // Client plugins
    organizationClient: vi.fn(),
    twoFactorClient: vi.fn(),
    passkeyClient: vi.fn(),
  };
};

// Setup function for automatic mocking
export const setupBetterAuthMocks = () => {
  const auth = createMockBetterAuth();
  const client = createMockAuthClient();
  const plugins = createMockBetterAuthPlugins();

  // Mock the main better-auth package
  vi.doMock('better-auth', () => ({
    betterAuth: vi.fn(() => auth.mockAuth),
  }));

  // Mock better-auth client
  vi.doMock('better-auth/client', () => ({
    createAuthClient: vi.fn(() => client),
  }));

  // Mock better-auth React hooks
  vi.doMock('better-auth/react', () => ({
    useAuth: client.useAuth,
    useSession: client.useSession,
  }));

  // Mock better-auth plugins
  vi.doMock('better-auth/plugins', () => plugins);
  vi.doMock('better-auth/client/plugins', () => ({
    organizationClient: plugins.organizationClient,
    twoFactorClient: plugins.twoFactorClient,
    passkeyClient: plugins.passkeyClient,
  }));

  // Mock better-auth adapters
  vi.doMock('better-auth/adapters/prisma', () => ({
    prismaAdapter: plugins.prismaAdapter,
  }));

  // Mock better-auth Next.js utilities
  vi.doMock('better-auth/next-js', () => ({
    nextCookies: plugins.nextCookies,
  }));

  return { auth, client, plugins };
};

// Reset function
export const resetBetterAuthMocks = (mocks: ReturnType<typeof setupBetterAuthMocks>) => {
  vi.clearAllMocks();

  // Reset to default behavior
  Object.values(mocks.auth.mockApi).forEach(mock => {
    if (vi.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(mocks.client).forEach(mock => {
    if (vi.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(mocks.plugins).forEach(mock => {
    if (vi.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
};

// Mock the better-auth module for automatic Vitest usage
const { auth, client, plugins } = setupBetterAuthMocks();
export { client as mockAuthClient, auth as mockBetterAuth, plugins as mockBetterAuthPlugins };
