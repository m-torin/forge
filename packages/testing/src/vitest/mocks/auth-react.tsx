/**
 * React-specific authentication mocks for testing
 * This file provides mock implementations of React auth components and hooks
 */
import React from "react";
import { vi } from "vitest";
import { mockUsers, mockUseAuth } from "./auth-node.ts";

// Mock auth context provider for React components
export interface AuthProviderProps {
  children: React.ReactNode;
  user?: typeof mockUsers.regular;
}

export const MockAuthProvider: React.FC<AuthProviderProps> = ({
  children,
  user = mockUsers.regular,
}) => {
  const authContext = mockUseAuth(user);

  return React.createElement(
    AuthContext.Provider,
    { value: authContext },
    children,
  );
};

// Placeholder for AuthContext - replace with your actual auth context
const AuthContext = React.createContext({} as ReturnType<typeof mockUseAuth>);

// Mock Provider component for tests
const MockProvider: React.FC<{
  children: React.ReactNode;
  value: ReturnType<typeof mockUseAuth>;
}> = ({ children, value }) => {
  return React.createElement(
    "div",
    { "data-testid": "auth-provider" },
    children,
  );
};

// Assign the mock provider to AuthContext.Provider for testing
AuthContext.Provider = MockProvider as unknown as typeof AuthContext.Provider;

// Re-export node auth mocks for convenience
export * from "./auth-node.ts";
