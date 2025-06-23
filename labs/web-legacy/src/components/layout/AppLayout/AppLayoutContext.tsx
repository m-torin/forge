'use client';

import { useDisclosure, useLocalStorage, useMediaQuery } from '@mantine/hooks';
import { createContext, type ReactNode, useContext, useState, useEffect } from 'react';

export type AppShellSize = string | number;

export type AppShellResponsiveSize =
  | AppShellSize
  | {
      base?: AppShellSize;
      sm?: AppShellSize;
      md?: AppShellSize;
      lg?: AppShellSize;
      xl?: AppShellSize;
    };

export interface AppLayoutState {
  asideEnabled: boolean;
  asideOpened: boolean;
  asideWidth: number;
  footerEnabled: boolean;
  footerHeight: number;
  headerEnabled: boolean;
  headerHeight: number;
  navbarEnabled: boolean;
  navbarOpened: boolean;
  navbarWidth: number;
}

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

  // Additional controls
  closeAll: () => void;
  openAll: () => void;
  setAside: (opened: boolean) => void;
  setAsideEnabled: (enabled: boolean) => void;
  setAsideWidth: (width: number) => void;
  setFooterEnabled: (enabled: boolean) => void;
  setFooterHeight: (height: number) => void;
  setHeaderEnabled: (enabled: boolean) => void;
  setHeaderHeight: (height: number) => void;
  setMobileNavbar: (opened: boolean) => void;
  setNavbar: (opened: boolean) => void;
  setNavbarEnabled: (enabled: boolean) => void;
  setNavbarWidth: (width: number) => void;
  toggleAsideEnabled: (enabled: boolean) => void;
  toggleFooterEnabled: (enabled: boolean) => void;
  toggleHeaderEnabled: (enabled: boolean) => void;
  toggleNavbarEnabled: (enabled: boolean) => void;
}

export interface AppLayoutProviderProps {
  children: ReactNode;
  initialState?: Partial<AppLayoutState>;
}

const AppLayoutContext = createContext<AppLayoutContextType | undefined>(undefined);

export function AppLayoutProvider({
  children,
  initialState: _initialState = {
    headerEnabled: true,
    navbarEnabled: false,
    asideEnabled: false,
    footerEnabled: true,
  },
}: AppLayoutProviderProps) {
  // Drawer states
  const [cartOpened, { close: closeCart, open: openCart }] = useDisclosure(false);
  const [navOpened, { close: closeNav, open: openNav }] = useDisclosure(false);

  // Layout states
  const [asideEnabled, setAsideEnabled] = useState(true);
  const [asideOpened, setAside] = useState(true);
  const [asideWidth, setAsideWidth] = useState(300);
  const [footerEnabled, setFooterEnabled] = useState(true);
  const [footerHeight, setFooterHeight] = useState(60);
  const [headerEnabled, setHeaderEnabled] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(60);
  const [mobileNavbarOpened, setMobileNavbar] = useState(false);
  const [navbarEnabled, setNavbarEnabled] = useState(true);
  const [navbarOpened, setNavbar] = useState(true);
  const [navbarWidth, setNavbarWidth] = useState(300);

  // Responsive detection
  const _isMobile = useMediaQuery('(max-width: 48em)');
  const _isTablet = useMediaQuery('(max-width: 64em)');

  // User preferences
  const [_userPreferences, setUserPreferences] = useLocalStorage<AppLayoutState>({
    key: 'app-layout-preferences',
    defaultValue: {
      asideEnabled,
      asideOpened,
      asideWidth,
      footerEnabled,
      footerHeight,
      headerEnabled,
      headerHeight,
      navbarEnabled,
      navbarOpened,
      navbarWidth,
    },
  });

  // Toggle functions
  const toggleAside = () => setAside((prev) => !prev);
  const toggleMobileNavbar = () => setMobileNavbar((prev) => !prev);
  const toggleNavbar = () => setNavbar((prev) => !prev);

  // Toggle enabled functions
  const toggleAsideEnabled = (enabled: boolean) => setAsideEnabled(enabled);
  const toggleFooterEnabled = (enabled: boolean) => setFooterEnabled(enabled);
  const toggleHeaderEnabled = (enabled: boolean) => setHeaderEnabled(enabled);
  const toggleNavbarEnabled = (enabled: boolean) => setNavbarEnabled(enabled);

  // Open/close all functions
  const openAll = () => {
    setAside(true);
    setNavbar(true);
    setMobileNavbar(true);
  };

  const closeAll = () => {
    setAside(false);
    setNavbar(false);
    setMobileNavbar(false);
  };

  // Update user preferences when layout changes
  useEffect(() => {
    setUserPreferences({
      asideEnabled,
      asideOpened,
      asideWidth,
      footerEnabled,
      footerHeight,
      headerEnabled,
      headerHeight,
      navbarEnabled,
      navbarOpened,
      navbarWidth,
    });
  }, [
    asideEnabled,
    asideOpened,
    asideWidth,
    footerEnabled,
    footerHeight,
    headerEnabled,
    headerHeight,
    navbarEnabled,
    navbarOpened,
    navbarWidth,
    setUserPreferences,
  ]);

  return (
    <AppLayoutContext.Provider
      value={{
        // Cart and navigation drawers
        cartOpened,
        closeCart,
        closeNav,
        navOpened,
        openCart,
        openNav,

        // AppShell layout controls
        asideEnabled,
        asideOpened,
        asideWidth,
        footerEnabled,
        footerHeight,
        headerEnabled,
        headerHeight,
        mobileNavbarOpened,
        navbarEnabled,
        navbarOpened,
        navbarWidth,
        toggleAside,
        toggleMobileNavbar,
        toggleNavbar,

        // Additional controls
        closeAll,
        openAll,
        setAside,
        setAsideEnabled,
        setAsideWidth,
        setFooterEnabled,
        setFooterHeight,
        setHeaderEnabled,
        setHeaderHeight,
        setMobileNavbar,
        setNavbar,
        setNavbarEnabled,
        setNavbarWidth,
        toggleAsideEnabled,
        toggleFooterEnabled,
        toggleHeaderEnabled,
        toggleNavbarEnabled,
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
