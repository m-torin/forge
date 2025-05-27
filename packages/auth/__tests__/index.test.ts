import { describe, expect, it, vi } from 'vitest';

// Import the index file after mocks are set up
import * as authExports from '../index';

// Mock server-only module before any imports
vi.mock('server-only', () => ({}));

// Mock all modules that index.ts imports
vi.mock('../server', () => ({
  auth: { api: { getSession: vi.fn() } },
  currentUser: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('../client', () => ({
  acceptInvitation: vi.fn(),
  cancelInvitation: vi.fn(),
  createOrganization: vi.fn(),
  getActiveMember: vi.fn(),
  getOrganization: vi.fn(),
  inviteMember: vi.fn(),
  listInvitations: vi.fn(),
  listOrganizations: vi.fn(),
  OrganizationSwitcher: () => null,
  rejectInvitation: vi.fn(),
  removeOrganizationMember: vi.fn(),
  setActiveOrganization: vi.fn(),
  signIn: { email: vi.fn() },
  signOut: vi.fn(),
  signUp: { email: vi.fn() },
  updateOrganization: vi.fn(),
  useActiveOrganization: vi.fn(),
  useListOrganizations: vi.fn(),
  UserButton: () => null,
  useSession: vi.fn(),
  useUser: vi.fn(),
}));

vi.mock('../keys', () => ({
  keys: vi.fn(() => ({
    BETTER_AUTH_SECRET: 'test-secret',
    DATABASE_URL: 'postgresql://test',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  })),
}));

// UserButton and OrganizationSwitcher are now exported from '../client' mock

// Mock design-system components
vi.mock('@repo/design-system/components/auth/user-button', () => ({
  UserButton: () => null,
}));

vi.mock('@repo/design-system/components/auth/organization-switcher', () => ({
  OrganizationSwitcher: () => null,
}));

vi.mock('../components/sign-in', () => ({
  SignIn: () => null,
}));

vi.mock('../components/sign-up', () => ({
  SignUp: () => null,
}));

// Mock Better Auth type exports
vi.mock('better-auth', () => ({
  // Type exports don't need actual implementations in tests
}));

// Mock helpers
vi.mock('../helpers', () => ({
  getCurrentOrganization: vi.fn(),
}));

describe('Auth Package Index Exports', () => {
  it('exports server functions', () => {
    // These server functions are now in index.server.ts, not in the main index
    // We should test for client-side exports only in this test
    expect(authExports).not.toHaveProperty('auth');
    expect(authExports).not.toHaveProperty('currentUser');
    expect(authExports).not.toHaveProperty('getSession');
  });

  it('exports client functions', () => {
    expect(authExports).toHaveProperty('signIn');
    expect(authExports).toHaveProperty('signOut');
    expect(authExports).toHaveProperty('signUp');
    expect(authExports).toHaveProperty('useSession');
    expect(authExports).toHaveProperty('useUser');
  });

  it('exports organization client functions', () => {
    expect(authExports).toHaveProperty('createOrganization');
    expect(authExports).toHaveProperty('updateOrganization');
    expect(authExports).toHaveProperty('inviteMember');
    expect(authExports).toHaveProperty('removeOrganizationMember');
    expect(authExports).toHaveProperty('getOrganization');
    expect(authExports).toHaveProperty('listOrganizations');
    expect(authExports).toHaveProperty('listInvitations');
    expect(authExports).toHaveProperty('acceptInvitation');
    expect(authExports).toHaveProperty('rejectInvitation');
    expect(authExports).toHaveProperty('cancelInvitation');
    expect(authExports).toHaveProperty('getActiveMember');
    expect(authExports).toHaveProperty('setActiveOrganization');
    expect(authExports).toHaveProperty('useActiveOrganization');
    expect(authExports).toHaveProperty('useListOrganizations');
  });

  it('exports keys function', () => {
    expect(authExports).toHaveProperty('keys');
  });

  it('exports helper functions', () => {
    // getCurrentOrganization is now in index.server.ts, not in the main index
    expect(authExports).not.toHaveProperty('getCurrentOrganization');
  });
});
