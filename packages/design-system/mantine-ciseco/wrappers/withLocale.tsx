import React from 'react';

import { LocaleProvider } from '../contexts/LocaleContext';

/**
 * Higher-order component that wraps a component with LocaleProvider
 * This allows client components to access locale via context
 */
export function withLocale<P extends {}>(
  Component: React.ComponentType<P>,
  locale: string
) {
  return function WithLocaleComponent(props: P) {
    return (
      <LocaleProvider locale={locale}>
        <Component {...props} />
      </LocaleProvider>
    );
  };
}

/**
 * Component wrapper that provides locale context
 * Use this to wrap client components that need locale access
 */
export function LocaleWrapper({ 
  children, 
  locale 
}: { 
  children: React.ReactNode; 
  locale: string;
}) {
  return (
    <LocaleProvider locale={locale}>
      {children}
    </LocaleProvider>
  );
}