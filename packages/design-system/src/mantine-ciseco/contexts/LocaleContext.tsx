'use client';

import React, { createContext, useContext } from 'react';

interface LocaleContextType {
  locale: string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  return <LocaleContext.Provider value={{ locale }}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext() {
  const context = useContext(LocaleContext);
  if (!context) {
    // Fallback to 'en' if no context is provided
    return { locale: 'en' };
  }
  return context;
}
