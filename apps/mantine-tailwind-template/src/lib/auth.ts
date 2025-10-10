/**
 * Mock Authentication System
 *
 * Database-free authentication using cookies and in-memory storage
 * Integrates with existing analytics and feature flag systems
 */

import { env } from "#/root/env";
import { logInfo, logWarn } from "@repo/observability";
import { cookies } from "next/headers";

// Mock user types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  createdAt: Date;
  emailVerified: boolean;
  updatedAt: Date;
}

interface AuthSession {
  user: User;
  sessionId: string;
  expiresAt: Date;
}

// Mock user database (in-memory)
const mockUsers = new Map<string, User & { password: string }>([
  [
    "demo@example.com",
    {
      id: "1",
      name: "Demo User",
      email: "demo@example.com",
      role: "user",
      password: "demo123",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
      createdAt: new Date("2024-01-01"),
      emailVerified: true,
      updatedAt: new Date("2024-01-01"),
    },
  ],
  [
    "admin@example.com",
    {
      id: "2",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      password: "admin123",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      createdAt: new Date("2024-01-01"),
      emailVerified: true,
      updatedAt: new Date("2024-01-01"),
    },
  ],
  [
    "jane@example.com",
    {
      id: "3",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "user",
      password: "jane123",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      createdAt: new Date("2024-01-15"),
      emailVerified: true,
      updatedAt: new Date("2024-01-15"),
    },
  ],
]);

// In-memory session storage (in production, use Redis or database)
const activeSessions = new Map<string, AuthSession>();

// Cookie configuration
const AUTH_COOKIE_NAME = "auth-session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

// Sign up function
export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    logInfo("[Auth] Sign up attempt", { email, name });

    // Check if user already exists
    if (mockUsers.has(email.toLowerCase())) {
      logWarn("[Auth] User already exists", { email });
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    // Create new user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      name,
      email: email.toLowerCase(),
      role: "user" as const,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date(),
    };

    // Add to mock database
    mockUsers.set(email.toLowerCase(), newUser);

    // Create user object without password
    const user: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
    };

    // Create session automatically
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE * 1000);

    const session: AuthSession = {
      user,
      sessionId,
      expiresAt,
    };

    // Store session
    activeSessions.set(sessionId, session);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    logInfo("[Auth] Sign up successful", {
      userId: user.id,
      userRole: user.role,
      sessionId,
    });

    return {
      success: true,
      user,
    };
  } catch (error) {
    logWarn("[Auth] Sign up error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: "Registration failed",
    };
  }
}

// Sign in function
async function _signIn(
  email: string,
  password: string,
): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    logInfo("[Auth] Sign in attempt", { email });

    const userData = mockUsers.get(email.toLowerCase());

    if (!userData || userData.password !== password) {
      logWarn("[Auth] Invalid credentials", { email });
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Create user object without password
    const user: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatar: userData.avatar,
      createdAt: userData.createdAt,
      emailVerified: userData.emailVerified,
      updatedAt: userData.updatedAt,
    };

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE * 1000);

    const session: AuthSession = {
      user,
      sessionId,
      expiresAt,
    };

    // Store session
    activeSessions.set(sessionId, session);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    logInfo("[Auth] Sign in successful", {
      userId: user.id,
      userRole: user.role,
      sessionId,
    });

    return {
      success: true,
      user,
    };
  } catch (error) {
    logWarn("[Auth] Sign in error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: "Authentication failed",
    };
  }
}

// Sign out function
async function _signOut(): Promise<{ success: boolean }> {
  try {
    const session = await getCurrentSession();

    if (session) {
      // Remove from active sessions
      activeSessions.delete(session.sessionId);

      logInfo("[Auth] Sign out successful", {
        userId: session.user.id,
        sessionId: session.sessionId,
      });
    }

    // Clear cookie
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);

    return { success: true };
  } catch (error) {
    logWarn("[Auth] Sign out error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false };
  }
}

// Get current session
async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!sessionId) {
      return null;
    }

    const session = activeSessions.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      activeSessions.delete(sessionId);
      const cookieStore = await cookies();
      cookieStore.delete(AUTH_COOKIE_NAME);
      return null;
    }

    return session;
  } catch (error) {
    logWarn("[Auth] Get session error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// Get current user
async function getCurrentUser(): Promise<User | null> {
  const session = await getCurrentSession();
  return session?.user || null;
}

// Check if user is authenticated
async function _isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session;
}

// Check if user has specific role
async function hasRole(role: "user" | "admin"): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

// Check if user is admin
async function _isAdmin(): Promise<boolean> {
  return await hasRole("admin");
}

// Middleware helper to check authentication
async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

// Middleware helper to check admin role
async function _requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("Admin role required");
  }
  return user;
}

// Get all mock users (for development/testing)
function _getMockUsers(): Array<Omit<User & { password: string }, "password">> {
  return Array.from(mockUsers.values()).map(
    ({ password: _password, ...user }) => user,
  );
}

// Cleanup expired sessions (call periodically in production)
function _cleanupExpiredSessions(): number {
  const now = new Date();
  let cleaned = 0;

  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(sessionId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logInfo("[Auth] Cleaned up expired sessions", { count: cleaned });
  }

  return cleaned;
}

// Auth context for server components
export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Get auth context for server components
export async function getAuthContext(): Promise<AuthContext> {
  const user = await getCurrentUser();

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };
}
