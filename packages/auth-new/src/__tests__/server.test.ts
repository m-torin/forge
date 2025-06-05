/**
 * Server authentication tests
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCurrentUser, getSession } from '../server/auth';

// Mock the auth instance
const mockAuth = {
  api: {
    getSession: vi.fn(),
  },
};

vi.mock('../server/auth', async () => {
  const actual = await vi.importActual('../server/auth');
  return {
    ...actual,
    auth: mockAuth,
  };
});

describe('Server Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return user when session exists', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };

      mockAuth.api.getSession.mockResolvedValue({
        session: { id: 'session-1' },
        user: mockUser,
      });

      const user = await getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('should return null when no session', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const user = await getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('getSession', () => {
    it('should return session data when authenticated', async () => {
      const mockSession = {
        session: {
          id: 'session-1',
          activeOrganizationId: 'org-1',
        },
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const session = await getSession();
      expect(session).toEqual({
        activeOrganizationId: 'org-1',
        session: mockSession.session,
        user: mockSession.user,
      });
    });

    it('should return null when not authenticated', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const session = await getSession();
      expect(session).toBeNull();
    });
  });
});
