import type React from 'react';

// Create mock navigation components
export function AppRouterProvider({ children }: { children: React.ReactNode }) {
  // This is a simple wrapper to simulate the App Router context
  return children;
}

export function usePathname() {
  return '/';
}

// Mock Next.js navigation APIs
export function useRouter() {
  return {
    asPath: '/',
    back: () => {},
    events: {
      emit: () => {},
      off: () => {},
      on: () => {},
    },
    forward: () => {},
    pathname: '/',
    prefetch: async () => {},
    push: async () => {},
    query: {},
    refresh: () => {},
    replace: async () => {},
  };
}

export function useSearchParams() {
  return new URLSearchParams();
}
