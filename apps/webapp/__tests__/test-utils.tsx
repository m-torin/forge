import { render, RenderOptions } from '@testing-library/react';
import React from 'react';

// Mock AsideProvider since it's required by Link component
const MockAsideProvider = ({ children }: { children: React.ReactNode }) => {
  const contextValue = {
    open: false,
    toggle: () => {},
  };

  return <AsideContext.Provider value={contextValue}>{children}</AsideContext.Provider>;
};

// Create a mock context that matches what the Link expects
const AsideContext = React.createContext<{ open: boolean; toggle: () => void } | null>(null);

// Custom render function that includes all providers
const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <MockAsideProvider>{children}</MockAsideProvider>;
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
