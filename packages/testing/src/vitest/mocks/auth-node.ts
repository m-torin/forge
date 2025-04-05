/**
 * Mock authentication utilities for testing
 * This file provides mock implementations of auth-related functions and hooks
 */
import { vi } from "vitest";

/**
 * Interface for Liveblocks auth response
 */
export interface LiveblocksAuthResponse {
  status: number;
  body: {
    token: string;
    userId: string;
  };
}

/**
 * Interface for User data
 */
export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Interface for session data
 */
export interface Session {
  user: User;
  expires: string;
}

// Mock user data
export const mockUsers = {
  admin: {
    id: "user_test_admin",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    isSignedIn: true,
  },
  regular: {
    id: "user_test_regular",
    email: "user@example.com",
    firstName: "Regular",
    lastName: "User",
    role: "user",
    isSignedIn: true,
  },
  guest: {
    id: "user_test_guest",
    email: "guest@example.com",
    firstName: "Guest",
    lastName: "User",
    role: "guest",
    isSignedIn: true,
  },
  unauthenticated: {
    id: null,
    email: null,
    firstName: null,
    lastName: null,
    role: null,
    isSignedIn: false,
  },
};

// Mock auth hooks
export const mockUseAuth = (user = mockUsers.regular) => {
  return {
    user,
    isLoaded: true,
    isSignedIn: user.isSignedIn,
    signIn: vi.fn().mockResolvedValue({ status: "complete" }),
    signOut: vi.fn().mockResolvedValue({ status: "complete" }),
    signUp: vi.fn().mockResolvedValue({ status: "complete" }),
    getToken: vi.fn().mockResolvedValue("mock-token"),
  };
};

// Mock Clerk auth
export const mockClerk = (user = mockUsers.regular) => {
  return {
    user: user.isSignedIn
      ? {
          id: user.id,
          primaryEmailAddress: { emailAddress: user.email },
          firstName: user.firstName,
          lastName: user.lastName,
          publicMetadata: { role: user.role },
        }
      : null,
    session: user.isSignedIn
      ? {
          id: "sess_test",
          status: "active",
          lastActiveAt: new Date(),
          expireAt: new Date(Date.now() + 1000 * 60 * 60),
          abandonAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        }
      : null,
    isLoaded: true,
    isSignedIn: user.isSignedIn,
    signIn: vi.fn().mockResolvedValue({ status: "complete" }),
    signOut: vi.fn().mockResolvedValue({ status: "complete" }),
    signUp: vi.fn().mockResolvedValue({ status: "complete" }),
    getToken: vi.fn().mockResolvedValue("mock-token"),
  };
};

// Mock auth middleware
export const mockAuthMiddleware = (user = mockUsers.regular) => {
  return (req: any, res: any, next: () => void) => {
    req.auth = {
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      isAuthenticated: user.isSignedIn,
      token: "mock-token",
    };
    next();
  };
};

/**
 * Mock for Liveblocks authentication
 */
export const mockLiveblocksAuth = {
  // Mock the Liveblocks client
  authorize: vi.fn().mockResolvedValue({
    status: 200,
    body: {
      token: "mock-liveblocks-token",
      userId: "mock-user-id",
    },
  }),
};

/**
 * Mock for authentication service
 */
export const mockAuthService = {
  // Basic auth functions
  signIn: vi.fn().mockResolvedValue({
    success: true,
    userId: "mock-user-id",
  }),
  signOut: vi.fn().mockResolvedValue({
    success: true,
  }),
  getSession: vi.fn().mockResolvedValue({
    user: {
      id: "mock-user-id",
      email: "user@example.com",
      name: "Test User",
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  }),

  // User management
  getUser: vi.fn().mockResolvedValue({
    id: "mock-user-id",
    email: "user@example.com",
    name: "Test User",
  }),
  updateUser: vi.fn().mockResolvedValue({
    success: true,
  }),

  // Session management
  isAuthenticated: vi.fn().mockResolvedValue(true),
  hasPermission: vi.fn().mockResolvedValue(true),
};

/**
 * Setup auth mocks for the specified module
 * This function is not used directly in the database tests
 * but is kept for compatibility with other packages
 */
export function setupAuthMocks(modulePath: string): void {
  // This function is intentionally left empty to avoid syntax errors
  // The actual implementation would use vi.mock, but that's causing issues
  console.log(`Mock setup for ${modulePath} is disabled`);
}
