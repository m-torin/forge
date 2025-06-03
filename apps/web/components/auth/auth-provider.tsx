"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { useSession as useBetterAuthSession } from "@repo/auth/client";

import type { ReactNode } from "react";

interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  session: any | null;
  user: any | null;
}

const AuthContext = createContext<AuthContextType>({
  isLoaded: false,
  isSignedIn: false,
  session: null,
  user: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: session, isPending } = useBetterAuthSession();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setIsLoaded(true);
    }
  }, [isPending]);

  const value: AuthContextType = {
    isLoaded,
    isSignedIn: !!session?.user,
    session: session || null,
    user: session?.user || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
