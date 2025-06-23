import { ReactNode } from "react";

interface AuthedLayoutProps {
  children: ReactNode;
}

/**
 * Layout for authenticated routes
 *
 * This layout wraps all pages that need auth context but don't require authentication.
 * Pages can individually use useRequireAuth hook if they need to enforce authentication.
 */
export default function AuthedLayout({ children }: AuthedLayoutProps) {
  // Auth context is provided by the root Providers component
  // Individual pages can access auth state via useAuth hook

  return <>{children}</>;
}
