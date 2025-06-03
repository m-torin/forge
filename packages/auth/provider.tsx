'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import type { ReactNode } from 'react';

// Create a simple session context for Better Auth
interface SessionContextType {
  isLoaded: boolean;
}

const SessionContext = createContext<SessionContextType>({
  isLoaded: false,
});

export const useSessionContext = () => {
  return useContext(SessionContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Mark as loaded after initial render
    setIsLoaded(true);
  }, []);

  return <SessionContext.Provider value={{ isLoaded }}>{children}</SessionContext.Provider>;
};
