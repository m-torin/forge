import React, { useEffect } from 'react';

import { AuthProvider } from '../src/components/auth-provider';

import { AppRouterProvider } from './next-navigation';
import { setStoryContext } from './story-context';

type Decorator = (Story: StoryFn, context: StoryContext) => React.ReactElement;
type StoryContext = any;
// Type definitions for Storybook (when @storybook/react is not available)
type StoryFn = () => React.ReactElement;

// This decorator provides the mocked AuthProvider and sets story context for the mocks
export const withAuthMock: Decorator = (Story, context: any) => {
  const AuthMockWrapper = () => {
    // Store the current story context for our mocks to access
    useEffect(() => {
      setStoryContext(context as any);
    }, []);

    return (
      <AppRouterProvider>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </AppRouterProvider>
    );
  };

  return <AuthMockWrapper />;
};
