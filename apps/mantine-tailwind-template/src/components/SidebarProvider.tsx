'use client';

import { useDisclosure, useLocalStorage, useMediaQuery } from '@mantine/hooks';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useViewTransition } from '../hooks/useViewTransition';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
  isLoading: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: React.ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [mounted, setMounted] = useState(false);
  const { startTransition } = useViewTransition();

  // Use Mantine's useDisclosure for consistent state management
  const [isOpen, { toggle: disclosureToggle, close: disclosureClose, open: disclosureOpen }] =
    useDisclosure(false);

  // Use localStorage to persist sidebar state
  const [storedIsOpen, setStoredIsOpen] = useLocalStorage({
    key: 'sidebar-open',
    defaultValue: false,
    getInitialValueInEffect: true,
  });

  // Sync disclosure state with localStorage
  useEffect(() => {
    if (storedIsOpen !== isOpen) {
      if (storedIsOpen) {
        disclosureOpen();
      } else {
        disclosureClose();
      }
    }
  }, [storedIsOpen, isOpen, disclosureOpen, disclosureClose]);

  // Handle responsive default behavior
  useEffect(() => {
    setMounted(true);
    // Only auto-open on desktop if no user preference exists
    if (isDesktop && typeof window !== 'undefined' && !localStorage.getItem('sidebar-open')) {
      setStoredIsOpen(true);
    }
  }, [isDesktop, setStoredIsOpen]);

  // Auto-close on mobile when switching from desktop
  useEffect(() => {
    if (mounted && !isDesktop && isOpen) {
      setStoredIsOpen(false);
    }
  }, [isDesktop, isOpen, setStoredIsOpen, mounted]);

  // Wrap disclosure methods with view transitions and localStorage updates
  const toggle = useCallback(() => {
    startTransition(() => {
      disclosureToggle();
      setStoredIsOpen(!isOpen);
    });
  }, [isOpen, disclosureToggle, setStoredIsOpen, startTransition]);

  const close = useCallback(() => {
    startTransition(() => {
      disclosureClose();
      setStoredIsOpen(false);
    });
  }, [disclosureClose, setStoredIsOpen, startTransition]);

  const open = useCallback(() => {
    startTransition(() => {
      disclosureOpen();
      setStoredIsOpen(true);
    });
  }, [disclosureOpen, setStoredIsOpen, startTransition]);

  const contextValue = useMemo(
    () => ({ isOpen, toggle, close, open, isLoading: !mounted }),
    [isOpen, toggle, close, open, mounted],
  );

  return <SidebarContext.Provider value={contextValue}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
