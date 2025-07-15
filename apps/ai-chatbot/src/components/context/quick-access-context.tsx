/**
 * Quick Access Context - Tracks when enhanced features should be visible
 */

'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface QuickAccessContextType {
  isQuickAccessOpen: boolean;
  setIsQuickAccessOpen: (open: boolean) => void;
  marketplaceNavigation: {
    view: 'menu' | 'marketplace';
    filter: string;
  };
  navigateToMarketplace: (filter?: string) => void;
  navigateToMenu: () => void;
}

const QuickAccessContext = createContext<QuickAccessContextType | undefined>(undefined);

export function QuickAccessProvider({ children }: { children: ReactNode }) {
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(false);
  const [marketplaceNavigation, setMarketplaceNavigation] = useState<{
    view: 'menu' | 'marketplace';
    filter: string;
  }>({
    view: 'menu',
    filter: '',
  });

  const navigateToMarketplace = (filter: string = '') => {
    setMarketplaceNavigation({
      view: 'marketplace',
      filter,
    });
    setIsQuickAccessOpen(true);
  };

  const navigateToMenu = () => {
    setMarketplaceNavigation({
      view: 'menu',
      filter: '',
    });
  };

  return (
    <QuickAccessContext.Provider
      value={{
        isQuickAccessOpen,
        setIsQuickAccessOpen,
        marketplaceNavigation,
        navigateToMarketplace,
        navigateToMenu,
      }}
    >
      {children}
    </QuickAccessContext.Provider>
  );
}

export function useQuickAccess() {
  const context = useContext(QuickAccessContext);
  if (context === undefined) {
    throw new Error('useQuickAccess must be used within a QuickAccessProvider');
  }
  return context;
}
