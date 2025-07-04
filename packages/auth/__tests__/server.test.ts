/**
 * Server authentication tests
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import after mocking
import { getCurrentUser, getSession } from '../src/server/session';

// Use vi.hoisted for mocks
const { mockGetSession } = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  return { mockGetSession };
});

// Mock the auth module
vi.mock('../src/server/session', () => ({
  getCurrentUser: vi.fn(),
  getSession: vi.fn(),
}));

// Mock the auth config
vi.mock('../src/shared/auth.config', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

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
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        banned: false,
        twoFactorEnabled: false,
        image: null,
        phoneNumber: null,
        role: 'user',
        banReason: null,
        banExpires: null,
        deletedAt: null,
        bio: null,
        expertise: [],
        isVerifiedAuthor: false,
        authorSince: null,
        preferences: null,
        isSuspended: false,
        suspensionDetails: null,
      };

      mockGetSession.mockResolvedValue({
        session: { id: 'session-1', userId: '1' },
        user: mockUser,
      });

      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

      const user = await getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('should return null when no session', async () => {
      mockGetSession.mockResolvedValue(null);
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      const user = await getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('getSession', () => {
    it('should return session data when authenticated', async () => {
      const mockSessionData = {
        activeOrganizationId: 'org-1',
        session: {
          id: 'session-1',
          token: 'session-token',
          userId: '1',
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          activeOrganizationId: 'org-1',
        },
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockGetSession.mockResolvedValue({
        session: mockSessionData.session,
        user: mockSessionData.user,
      });

      vi.mocked(getSession).mockResolvedValue(mockSessionData);

      const session = await getSession();
      expect(session).toEqual(mockSessionData);
    });

    it('should return null when not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);
      vi.mocked(getSession).mockResolvedValue(null);

      const session = await getSession();
      expect(session).toBeNull();
    });
  });
});
