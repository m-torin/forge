"use client";

import {
  useDisclosure,
  useMediaQuery,
  useSessionStorage,
  useSetState,
} from "@mantine/hooks";
import { createContext, type ReactNode, useCallback, useContext } from "react";

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
  // Section visibility states (collapsed/hidden but space reserved)
  asideOpened: boolean;
  mobileNavbarOpened: boolean;
  navbarOpened: boolean;

  asideEnabled: boolean;
  footerEnabled: boolean;
  // Section enabled states (completely disabled, no space reserved)
  headerEnabled: boolean;
  navbarEnabled: boolean;

  asideWidth: AppShellResponsiveSize;
  footerHeight: AppShellResponsiveSize;
  // Section dimensions
  headerHeight: AppShellResponsiveSize;
  navbarWidth: AppShellResponsiveSize;
}

export interface AppLayoutContextType extends AppLayoutState {
  // Visibility controls (collapsed/hidden but space reserved)
  closeAll: () => void;
  closeAside: () => void;
  closeMobileNavbar: () => void;
  closeNavbar: () => void;
  openAll: () => void;
  openAside: () => void;
  openMobileNavbar: () => void;
  openNavbar: () => void;
  setAside: (opened: boolean) => void;
  setMobileNavbar: (opened: boolean) => void;
  setNavbar: (opened: boolean) => void;
  toggleAside: () => void;
  toggleMobileNavbar: () => void;
  toggleNavbar: () => void;

  setAsideEnabled: (enabled: boolean) => void;
  setFooterEnabled: (enabled: boolean) => void;
  // Enable/disable controls (completely remove from layout)
  setHeaderEnabled: (enabled: boolean) => void;
  setNavbarEnabled: (enabled: boolean) => void;
  toggleAsideEnabled: () => void;
  toggleFooterEnabled: () => void;
  toggleHeaderEnabled: () => void;
  toggleNavbarEnabled: () => void;

  setAsideWidth: (width: AppShellResponsiveSize) => void;
  setFooterHeight: (height: AppShellResponsiveSize) => void;
  // Dimension controls
  setHeaderHeight: (height: AppShellResponsiveSize) => void;
  setNavbarWidth: (width: AppShellResponsiveSize) => void;

  isDesktop: boolean;
  // Responsive state
  isMobile: boolean;
  isTablet: boolean;
}

const AppLayoutContext = createContext<AppLayoutContextType | null>(null);

export function useAppLayout() {
  const context = useContext(AppLayoutContext);
  if (!context) {
    throw new Error("useAppLayout must be used within AppLayoutProvider");
  }
  return context;
}

export interface AppLayoutProviderProps {
  children: ReactNode;

  // Default visibility states (collapsed/hidden but space reserved)
  defaultAsideOpened?: boolean;
  defaultMobileNavbarOpened?: boolean;
  defaultNavbarOpened?: boolean;

  defaultAsideEnabled?: boolean;
  defaultFooterEnabled?: boolean;
  // Default enabled states (completely disabled, no space reserved)
  defaultHeaderEnabled?: boolean;
  defaultNavbarEnabled?: boolean;

  defaultAsideWidth?: AppShellResponsiveSize;
  defaultFooterHeight?: AppShellResponsiveSize;
  // Default dimensions
  defaultHeaderHeight?: AppShellResponsiveSize;
  defaultNavbarWidth?: AppShellResponsiveSize;
}

export function AppLayoutProvider({
  children,

  // Default visibility states
  defaultAsideOpened = false,
  defaultMobileNavbarOpened = false,
  defaultNavbarOpened = false,

  defaultAsideEnabled = true,
  defaultFooterEnabled = false,
  // Default enabled states
  defaultHeaderEnabled = true,
  defaultNavbarEnabled = true,

  defaultAsideWidth = 300,
  defaultNavbarWidth = 300,
  defaultFooterHeight = 60,
  // Default dimensions
  defaultHeaderHeight = 90,
}: AppLayoutProviderProps) {
  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const isDesktop = useMediaQuery("(min-width: 1025px)");

  // Visibility states using useDisclosure for better toggle API
  const [
    navbarOpened,
    { close: closeNavbar, open: openNavbar, toggle: toggleNavbar },
  ] = useDisclosure(isMobile ? false : defaultNavbarOpened);
  const [
    asideOpened,
    { close: closeAside, open: openAside, toggle: toggleAside },
  ] = useDisclosure(defaultAsideOpened);
  const [
    mobileNavbarOpened,
    {
      close: closeMobileNavbar,
      open: openMobileNavbar,
      toggle: toggleMobileNavbar,
    },
  ] = useDisclosure(defaultMobileNavbarOpened);

  // Enabled states using useLocalStorage for persistence
  const [enabledStates, setEnabledStates] = useSetState({
    asideEnabled: defaultAsideEnabled,
    footerEnabled: defaultFooterEnabled,
    headerEnabled: defaultHeaderEnabled,
    navbarEnabled: defaultNavbarEnabled,
  });

  // Dimension states using useSessionStorage for session persistence
  const [headerHeight, setHeaderHeightState] = useSessionStorage({
    defaultValue: defaultHeaderHeight,
    key: "app-layout-header-height-v2",
  });
  const [navbarWidth, setNavbarWidthState] = useSessionStorage({
    defaultValue: defaultNavbarWidth,
    key: "app-layout-navbar-width-v2",
  });
  const [asideWidth, setAsideWidthState] = useSessionStorage({
    defaultValue: defaultAsideWidth,
    key: "app-layout-aside-width-v2",
  });
  const [footerHeight, setFooterHeightState] = useSessionStorage({
    defaultValue: defaultFooterHeight,
    key: "app-layout-footer-height-v2",
  });

  // Extract enabled states for easier access
  const { asideEnabled, footerEnabled, headerEnabled, navbarEnabled } =
    enabledStates;

  // Manual setters for compatibility (wrapping useDisclosure functions)
  const setNavbar = useCallback(
    (opened: boolean) => {
      if (opened) openNavbar();
      else closeNavbar();
    },
    [openNavbar, closeNavbar],
  );

  const setAside = useCallback(
    (opened: boolean) => {
      if (opened) openAside();
      else closeAside();
    },
    [openAside, closeAside],
  );

  const setMobileNavbar = useCallback(
    (opened: boolean) => {
      if (opened) openMobileNavbar();
      else closeMobileNavbar();
    },
    [openMobileNavbar, closeMobileNavbar],
  );

  // Enable/disable controls using useSetState
  const setHeaderEnabled = useCallback(
    (enabled: boolean) => {
      setEnabledStates({ headerEnabled: enabled });
    },
    [setEnabledStates],
  );

  const setNavbarEnabled = useCallback(
    (enabled: boolean) => {
      setEnabledStates({ navbarEnabled: enabled });
      // Auto-close navbar if being disabled
      if (!enabled && navbarOpened) closeNavbar();
    },
    [setEnabledStates, navbarOpened, closeNavbar],
  );

  const setAsideEnabled = useCallback(
    (enabled: boolean) => {
      setEnabledStates({ asideEnabled: enabled });
      // Auto-close aside if being disabled
      if (!enabled && asideOpened) closeAside();
    },
    [setEnabledStates, asideOpened, closeAside],
  );

  const setFooterEnabled = useCallback(
    (enabled: boolean) => {
      setEnabledStates({ footerEnabled: enabled });
    },
    [setEnabledStates],
  );

  const toggleHeaderEnabled = useCallback(() => {
    setEnabledStates({ headerEnabled: !headerEnabled });
  }, [setEnabledStates, headerEnabled]);

  const toggleNavbarEnabled = useCallback(() => {
    const newEnabled = !navbarEnabled;
    setEnabledStates({ navbarEnabled: newEnabled });
    // Auto-close navbar if being disabled
    if (!newEnabled && navbarOpened) closeNavbar();
  }, [setEnabledStates, navbarEnabled, navbarOpened, closeNavbar]);

  const toggleAsideEnabled = useCallback(() => {
    const newEnabled = !asideEnabled;
    setEnabledStates({ asideEnabled: newEnabled });
    // Auto-close aside if being disabled
    if (!newEnabled && asideOpened) closeAside();
  }, [setEnabledStates, asideEnabled, asideOpened, closeAside]);

  const toggleFooterEnabled = useCallback(() => {
    setEnabledStates({ footerEnabled: !footerEnabled });
  }, [setEnabledStates, footerEnabled]);

  // Dimension controls (already using session storage hooks)
  const setHeaderHeight = useCallback(
    (height: AppShellResponsiveSize) => {
      setHeaderHeightState(height);
    },
    [setHeaderHeightState],
  );

  const setNavbarWidth = useCallback(
    (width: AppShellResponsiveSize) => {
      setNavbarWidthState(width);
    },
    [setNavbarWidthState],
  );

  const setAsideWidth = useCallback(
    (width: AppShellResponsiveSize) => {
      setAsideWidthState(width);
    },
    [setAsideWidthState],
  );

  const setFooterHeight = useCallback(
    (height: AppShellResponsiveSize) => {
      setFooterHeightState(height);
    },
    [setFooterHeightState],
  );

  // Bulk operations
  const closeAll = useCallback(() => {
    closeNavbar();
    closeAside();
    closeMobileNavbar();
  }, [closeNavbar, closeAside, closeMobileNavbar]);

  const openAll = useCallback(() => {
    if (navbarEnabled) openNavbar();
    if (asideEnabled) openAside();
    // Don't auto-open mobile navbar
  }, [openNavbar, openAside, navbarEnabled, asideEnabled]);

  const value: AppLayoutContextType = {
    // Visibility states
    asideOpened,
    mobileNavbarOpened,
    navbarOpened,

    asideEnabled,
    footerEnabled,
    // Enabled states
    headerEnabled,
    navbarEnabled,

    asideWidth,
    navbarWidth,
    footerHeight,
    // Dimensions
    headerHeight,

    isDesktop: isDesktop ?? true,
    // Responsive states
    isMobile: isMobile ?? false,
    isTablet: isTablet ?? false,

    closeAside,
    openAside,
    setAside,
    toggleAside,
    // Visibility controls - useDisclosure functions
    closeAll,
    closeMobileNavbar,
    closeNavbar,
    openAll,
    openMobileNavbar,
    openNavbar,
    setMobileNavbar,
    setNavbar,
    toggleMobileNavbar,
    toggleNavbar,

    setAsideEnabled,
    toggleAsideEnabled,
    setFooterEnabled,
    // Enable/disable controls - useSetState functions
    setHeaderEnabled,
    setNavbarEnabled,
    toggleFooterEnabled,
    toggleHeaderEnabled,
    toggleNavbarEnabled,

    setAsideWidth,
    setNavbarWidth,
    setFooterHeight,
    // Dimension controls - useSessionStorage functions
    setHeaderHeight,
  };

  return (
    <AppLayoutContext.Provider value={value}>
      {children}
    </AppLayoutContext.Provider>
  );
}
