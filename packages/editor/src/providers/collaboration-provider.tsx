'use client';

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { createContext, ReactNode, useContext } from 'react';
import { useCollaboration } from '../hooks/use-collaboration';
import { CollaborationHookResult, CollaborationOptions } from '../types/index';

interface CollaborationContextValue extends CollaborationHookResult {
  options: CollaborationOptions;
}

const CollaborationContext = createContext<CollaborationContextValue | null>(null);

interface CollaborationProviderProps {
  children: ReactNode;
  options: CollaborationOptions;
  mantineTheme?: any;
}

export function CollaborationProvider({
  children,
  options,
  mantineTheme,
}: CollaborationProviderProps) {
  const collaboration = useCollaboration(options);

  const value: CollaborationContextValue = {
    ...collaboration,
    options,
  };

  return (
    <MantineProvider theme={mantineTheme}>
      <ModalsProvider>
        <CollaborationContext.Provider value={value}>
          {children}
          <Notifications position="top-right" />
        </CollaborationContext.Provider>
      </ModalsProvider>
    </MantineProvider>
  );
}

export function useCollaborationContext(): CollaborationContextValue {
  const context = useContext(CollaborationContext);

  if (!context) {
    throw new Error('useCollaborationContext must be used within a CollaborationProvider');
  }

  return context;
}
