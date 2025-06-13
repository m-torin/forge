'use client';

import {
  useColorScheme,
  useDisclosure,
  useLocalStorage,
  useSetState,
  useViewportSize,
} from '@mantine/hooks';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useDeferredValue,
  useTransition,
} from 'react';

export interface AppLayoutContextType extends AppLayoutState {
  // Visibility controls (collapsed/hidden but space reserved)
  closeAll: () => void;
  closeAside: () => void;
  closeMobileNavbar: () => void;
  closeNavbar: () => void;
  // Theme state
  colorScheme: 'auto' | 'dark' | 'light';
  isDesktop: boolean;
  // Responsive state
  isMobile: boolean;
  isTablet: boolean;
  // Fixed responsive layout - no dynamic measurement needed
  openAll: () => void;
  openAside: () => void;
  openMobileNavbar: () => void;
  openNavbar: () => void;
  resetLayoutPreferences: () => void;

  setAside: (opened: boolean) => void;
  setAsideEnabled: (enabled: boolean) => void;
  setAsideWidth: (width: AppShellResponsiveSize) => void;
  setFooterEnabled: (enabled: boolean) => void;
  setFooterHeight: (height: AppShellResponsiveSize) => void;
  // Enable/disable controls (completely remove from layout)
  setHeaderEnabled: (enabled: boolean) => void;
  // Dimension controls
  setHeaderHeight: (height: AppShellResponsiveSize) => void;
  setMobileNavbar: (opened: boolean) => void;

  setNavbar: (opened: boolean) => void;
  setNavbarEnabled: (enabled: boolean) => void;
  setNavbarWidth: (width: AppShellResponsiveSize) => void;
  setRememberLayoutState: (remember: boolean) => void;

  toggleAside: () => void;
  toggleAsideEnabled: () => void;
  toggleFooterEnabled: () => void;

  toggleHeaderEnabled: () => void;
  toggleMobileNavbar: () => void;
  toggleNavbar: () => void;

  toggleNavbarEnabled: () => void;
  // User preferences controls
  userPreferences: {
    preferredAsideState: boolean;
    preferredNavbarState: boolean;
    rememberLayoutState: boolean;
  };
  viewportHeight: number;
  // Viewport state
  viewportWidth: number;
}
export interface AppLayoutState {
  asideEnabled: boolean;
  // Section visibility states (collapsed/hidden but space reserved)
  asideOpened: boolean;
  asideWidth: AppShellResponsiveSize;

  footerEnabled: boolean;
  footerHeight: AppShellResponsiveSize;
  // Section enabled states (completely disabled, no space reserved)
  headerEnabled: boolean;
  // Section dimensions
  headerHeight: AppShellResponsiveSize;

  mobileNavbarOpened: boolean;
  navbarEnabled: boolean;
  navbarOpened: boolean;
  navbarWidth: AppShellResponsiveSize;
}

export type AppShellResponsiveSize =
  | AppShellSize
  | {
      base?: AppShellSize;
      lg?: AppShellSize;
      md?: AppShellSize;
      sm?: AppShellSize;
      xl?: AppShellSize;
    };

export type AppShellSize = number | string;

const AppLayoutContext = createContext<AppLayoutContextType | null>(null);

export interface AppLayoutProviderProps {
  children: ReactNode;

  defaultAsideEnabled?: boolean;
  // Default visibility states (collapsed/hidden but space reserved)
  defaultAsideOpened?: boolean;
  defaultAsideWidth?: AppShellResponsiveSize;

  defaultFooterEnabled?: boolean;
  defaultFooterHeight?: AppShellResponsiveSize;
  // Default enabled states (completely disabled, no space reserved)
  defaultHeaderEnabled?: boolean;
  // Default dimensions
  defaultHeaderHeight?: AppShellResponsiveSize;

  defaultMobileNavbarOpened?: boolean;
  defaultNavbarEnabled?: boolean;
  defaultNavbarOpened?: boolean;
  defaultNavbarWidth?: AppShellResponsiveSize;

  // Initial state to prevent flash
  initialState?: {
    headerEnabled?: boolean;
    navbarEnabled?: boolean;
    asideEnabled?: boolean;
    footerEnabled?: boolean;
  };
}

export function AppLayoutProvider({
  children,

  defaultAsideEnabled = true,
  // Default visibility states
  defaultAsideOpened = false,
  defaultAsideWidth = 300,

  defaultFooterEnabled = false,
  defaultFooterHeight = 60,
  // Default enabled states
  defaultHeaderEnabled = true,
  // Default dimensions
  defaultHeaderHeight = { base: 140, lg: 180, md: 160, sm: 140, xl: 180 },

  defaultMobileNavbarOpened = false,
  defaultNavbarEnabled = true,
  defaultNavbarOpened = false,
  defaultNavbarWidth = 300,

  // Initial state overrides
  initialState,
}: AppLayoutProviderProps) {
  // Enhanced responsive detection with useViewportSize and useResizeObserver
  const { height: viewportHeight, width: viewportWidth } = useViewportSize();
  const colorScheme = useColorScheme();

  // Fixed responsive header heights - no dynamic measurement needed
  // headerRef and navbarRef removed since we use fixed heights

  // Calculate responsive breakpoints from viewport
  const isMobile = viewportWidth <= 768;
  const isTablet = viewportWidth > 768 && viewportWidth <= 1024;
  const isDesktop = viewportWidth > 1024;

  // Defer non-critical responsive updates for performance
  const deferredIsMobile = useDeferredValue(isMobile);
  const deferredIsTablet = useDeferredValue(isTablet);
  const deferredIsDesktop = useDeferredValue(isDesktop);

  // Use transitions for non-urgent layout updates
  const [_isPending, _startTransition] = useTransition();

  // User preferences persisted in localStorage using useLocalStorage
  const [userPreferences, setUserPreferences] = useLocalStorage({
    defaultValue: {
      preferredAsideState: defaultAsideOpened,
      preferredNavbarState: defaultNavbarOpened,
      rememberLayoutState: true,
    },
    key: 'app-layout-preferences',
  });

  // Visibility states using useDisclosure for better toggle API
  // Use saved preferences when available and rememberLayoutState is enabled
  const initialNavbarState = isMobile
    ? false
    : userPreferences.rememberLayoutState
      ? userPreferences.preferredNavbarState
      : defaultNavbarOpened;
  const initialAsideState = userPreferences.rememberLayoutState
    ? userPreferences.preferredAsideState
    : defaultAsideOpened;

  const [navbarOpened, { close: closeNavbar, open: openNavbar, toggle: toggleNavbar }] =
    useDisclosure(initialNavbarState);
  const [asideOpened, { close: closeAside, open: openAside, toggle: toggleAside }] =
    useDisclosure(initialAsideState);
  const [
    mobileNavbarOpened,
    { close: closeMobileNavbar, open: openMobileNavbar, toggle: toggleMobileNavbar },
  ] = useDisclosure(defaultMobileNavbarOpened);

  // Enabled states using useSetState with initial state overrides
  const [enabledStates, setEnabledStates] = useSetState({
    asideEnabled: initialState?.asideEnabled ?? defaultAsideEnabled,
    footerEnabled: initialState?.footerEnabled ?? defaultFooterEnabled,
    headerEnabled: initialState?.headerEnabled ?? defaultHeaderEnabled,
    navbarEnabled: initialState?.navbarEnabled ?? defaultNavbarEnabled,
  });

  // Dimension states using useSetState for better state management
  const [dimensions, setDimensions] = useSetState({
    asideWidth: defaultAsideWidth,
    footerHeight: defaultFooterHeight,
    headerHeight: defaultHeaderHeight,
    navbarWidth: defaultNavbarWidth,
  });

  // Extract enabled states for easier access
  const { asideEnabled, footerEnabled, headerEnabled, navbarEnabled } = enabledStates;

  // Extract dimension values for easier access
  const { asideWidth, footerHeight, headerHeight, navbarWidth } = dimensions;

  // Manual setters for compatibility (wrapping useDisclosure functions)
  const setNavbar = useCallback(
    (opened: boolean) => {
      if (opened) openNavbar();
      else closeNavbar();

      // Save navbar preference to localStorage if rememberLayoutState is enabled
      if (userPreferences.rememberLayoutState && !isMobile) {
        setUserPreferences((prev) => ({
          ...prev,
          preferredNavbarState: opened,
        }));
      }
    },
    [openNavbar, closeNavbar, userPreferences.rememberLayoutState, isMobile, setUserPreferences],
  );

  const setAside = useCallback(
    (opened: boolean) => {
      if (opened) openAside();
      else closeAside();

      // Save aside preference to localStorage if rememberLayoutState is enabled
      if (userPreferences.rememberLayoutState) {
        setUserPreferences((prev) => ({
          ...prev,
          preferredAsideState: opened,
        }));
      }
    },
    [openAside, closeAside, userPreferences.rememberLayoutState, setUserPreferences],
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

  // Dimension controls using useSetState for better performance
  const setHeaderHeight = useCallback(
    (height: AppShellResponsiveSize) => {
      setDimensions({ headerHeight: height });
    },
    [setDimensions],
  );

  const setNavbarWidth = useCallback(
    (width: AppShellResponsiveSize) => {
      setDimensions({ navbarWidth: width });
    },
    [setDimensions],
  );

  const setAsideWidth = useCallback(
    (width: AppShellResponsiveSize) => {
      setDimensions({ asideWidth: width });
    },
    [setDimensions],
  );

  const setFooterHeight = useCallback(
    (height: AppShellResponsiveSize) => {
      setDimensions({ footerHeight: height });
    },
    [setDimensions],
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

  // User preferences control functions
  const setRememberLayoutState = useCallback(
    (remember: boolean) => {
      setUserPreferences((prev) => ({
        ...prev,
        rememberLayoutState: remember,
      }));
    },
    [setUserPreferences],
  );

  const resetLayoutPreferences = useCallback(() => {
    setUserPreferences({
      preferredAsideState: defaultAsideOpened,
      preferredNavbarState: defaultNavbarOpened,
      rememberLayoutState: true,
    });
  }, [setUserPreferences, defaultNavbarOpened, defaultAsideOpened]);

  const value: AppLayoutContextType = {
    asideEnabled,
    // Visibility states
    asideOpened,
    asideWidth,

    // Visibility controls - useDisclosure functions
    closeAll,
    closeAside,
    closeMobileNavbar,
    closeNavbar,

    // Theme state
    colorScheme,

    footerEnabled,
    footerHeight,
    // Enabled states
    headerEnabled,
    // Dimensions
    headerHeight,

    // Fixed responsive heights - no dynamic measurement
    isDesktop: deferredIsDesktop ?? true,

    // Responsive states
    isMobile: deferredIsMobile ?? false,
    isTablet: deferredIsTablet ?? false,

    mobileNavbarOpened,
    navbarEnabled,
    navbarOpened,
    // Fixed responsive widths - no dynamic measurement
    navbarWidth,
    openAll,
    openAside,
    openMobileNavbar,
    openNavbar,
    resetLayoutPreferences,
    setAside,
    setAsideEnabled,
    setAsideWidth,

    setFooterEnabled,
    setFooterHeight,
    // Enable/disable controls - useSetState functions
    setHeaderEnabled,
    // Dimension controls - useSessionStorage functions
    setHeaderHeight,
    setMobileNavbar,
    setNavbar,
    setNavbarEnabled,
    setNavbarWidth,

    setRememberLayoutState,
    toggleAside,
    toggleAsideEnabled,
    toggleFooterEnabled,

    toggleHeaderEnabled,
    toggleMobileNavbar,
    toggleNavbar,

    toggleNavbarEnabled,
    // User preferences
    userPreferences,
    viewportHeight,
    // Viewport state
    viewportWidth,
  };

  return <AppLayoutContext.Provider value={value}>{children}</AppLayoutContext.Provider>;
}

export function useAppLayout() {
  const context = useContext(AppLayoutContext);
  if (!context) {
    throw new Error('useAppLayout must be used within AppLayoutProvider');
  }
  return context;
}
