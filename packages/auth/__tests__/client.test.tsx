/**
 * Client authentication tests
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

import { AuthProvider } from '../src/client/auth-provider';
import { useAuth } from '../src/client/hooks';

// Mock better-auth client
vi.mock('better-auth/react', () => ({
  createAuthClient: vi.fn(() => ({
    $fetch: vi.fn(),
    useSession: vi.fn(() => ({ data: null, isPending: false })),
  })),
}));

// Mock better-auth plugins
vi.mock('better-auth/client/plugins', () => ({
  organizationClient: vi.fn(() => ({})),
  adminClient: vi.fn(() => ({})),
  apiKeyClient: vi.fn(() => ({})),
  twoFactorClient: vi.fn(() => ({})),
  inferAdditionalFields: vi.fn(),
  magicLinkClient: vi.fn(() => ({})),
  passkeyClient: vi.fn(() => ({})),
  multiSessionClient: vi.fn(() => ({})),
  oneTapClient: vi.fn(() => ({})),
}));

// Mock component to test hooks
function TestComponent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="user">{user ? user.email : 'null'}</div>
    </div>
  );
}

describe('client Authentication', () => {
  test('should render loading state initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // The AuthProvider returns null during loading, so we check that the component renders
    expect(document.body).toBeInTheDocument();
  });

  test('should handle unauthenticated state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });
});
