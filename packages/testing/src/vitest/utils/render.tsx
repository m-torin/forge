// @ts-ignore - Testing library import error in test environment
import { render as rtlRender } from '@testing-library/react';
// @ts-ignore - User event import error in test environment
import userEvent from '@testing-library/user-event';
// @ts-ignore - React import error in test environment
import * as React from 'react';

// Define types locally to avoid import errors
interface RenderOptions {
  [key: string]: any;
  baseElement?: HTMLElement;
  container?: HTMLElement;
  hydrate?: boolean;
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  providers?: React.ComponentType<{ children: React.ReactNode }>;
  route?: string;
  userEventOptions?: any;
}

interface CustomRenderResult {
  [key: string]: any;
  baseElement: HTMLElement;
  container: HTMLElement;
  debug: (baseElement?: HTMLElement | HTMLElement[]) => void;
  rerender: (ui: React.ReactElement) => void;
  unmount: () => void;
  user: any;
}

export function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
): CustomRenderResult {
  const {
    providers: Providers = ({ children }: { children: React.ReactNode }) => children,
    route = '/',
    userEventOptions,
    ...renderOptions
  } = options;

  // Set up the URL before rendering
  if (route) {
    window.history.pushState({}, 'Test page', route);
  }

  // Create a user event instance
  const user = (userEvent as any).setup?.(userEventOptions) || userEvent;

  // Create a wrapper with all providers
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Providers>{children}</Providers>
  );

  // Render with the wrapper
  const result = rtlRender(ui, { wrapper: Wrapper, ...renderOptions }) as any;

  return {
    ...result,
    rerender: (ui: React.ReactElement) => result.rerender(<Providers>{ui}</Providers>),
    user,
  };
}

// Export with a different name to avoid conflicts
export { customRender as render };
