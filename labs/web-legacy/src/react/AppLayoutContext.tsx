'use client';

import { useDisclosure } from '@mantine/hooks';
import { createContext, type ReactNode, useContext } from 'react';

export interface AppLayoutContextType {
  // Cart and navigation drawers
  cartOpened: boolean;
  closeCart: () => void;
  closeNav: () => void;
  navOpened: boolean;
  openCart: () => void;
  openNav: () => void;

  // AppShell layout controls
  asideEnabled: boolean;
  asideOpened: boolean;
  asideWidth: number;
  footerEnabled: boolean;
  footerHeight: number;
  headerEnabled: boolean;
  headerHeight: number;
  mobileNavbarOpened: boolean;
  navbarEnabled: boolean;
  navbarOpened: boolean;
  navbarWidth: number;
  toggleAside: () => void;
  toggleMobileNavbar: () => void;
  toggleNavbar: () => void;
}

// Additional types for compatibility
export interface AppLayoutState {
  headerEnabled: boolean;
  navbarEnabled: boolean;
  asideEnabled: boolean;
  footerEnabled: boolean;
}

export type AppShellSize = number | string;
export type AppShellResponsiveSize =
  | AppShellSize
  | {
      base?: AppShellSize;
      sm?: AppShellSize;
      md?: AppShellSize;
      lg?: AppShellSize;
      xl?: AppShellSize;
    };

export interface AppLayoutProviderProps {
  children: ReactNode;
  initialState?: Partial<AppLayoutState>;
}

const AppLayoutContext = createContext<AppLayoutContextType | undefined>(undefined);

export function AppLayoutProvider({
  children,
  initialState = {
    headerEnabled: true,
    navbarEnabled: false,
    asideEnabled: false,
    footerEnabled: true,
  },
}: AppLayoutProviderProps) {
  // Drawer states
  const [cartOpened, { close: closeCart, open: openCart }] = useDisclosure(false);
  const [navOpened, { close: closeNav, open: openNav }] = useDisclosure(false);

  // AppShell layout states
  const [asideOpened, { toggle: toggleAside }] = useDisclosure(false);
  const [navbarOpened, { toggle: toggleNavbar }] = useDisclosure(false);
  const [mobileNavbarOpened, { toggle: toggleMobileNavbar }] = useDisclosure(false);

  return (
    <AppLayoutContext.Provider
      value={{
        // Drawer controls
        cartOpened,
        closeCart,
        closeNav,
        navOpened,
        openCart,
        openNav,

        // AppShell layout controls
        asideEnabled: initialState.asideEnabled ?? false,
        asideOpened,
        asideWidth: 300,
        footerEnabled: initialState.footerEnabled ?? true,
        footerHeight: 60,
        headerEnabled: initialState.headerEnabled ?? true,
        headerHeight: 150,
        mobileNavbarOpened,
        navbarEnabled: initialState.navbarEnabled ?? false,
        navbarOpened,
        navbarWidth: 250,
        toggleAside,
        toggleMobileNavbar,
        toggleNavbar,
      }}
    >
      {children}
    </AppLayoutContext.Provider>
  );
}

export function useAppLayout() {
  const context = useContext(AppLayoutContext);
  if (!context) {
    throw new Error('useAppLayout must be used within AppLayoutProvider');
  }
  return context;
}
