import React from 'react';

// Mock Next.js navigation APIs
export function useRouter() {
  return {
    pathname: '/',
    asPath: '/',
    back: () => {},
    events: {
      emit: () => {},
      off: () => {},
      on: () => {},
    },
    forward: () => {},
    prefetch: async () => {},
    push: async () => {},
    query: {},
    refresh: () => {},
    replace: async () => {},
  };
}

export function usePathname() {
  return '/';
}

export function useSearchParams() {
  return new URLSearchParams();
}

// Create mock navigation components
export function AppRouterProvider({ children }: { children: React.ReactNode }) {
  // This is a simple wrapper to simulate the App Router context
  return <>{children}</>;
}
