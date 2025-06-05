import React, { useEffect } from 'react';

import { AuthProvider } from '../provider';

import { AppRouterProvider } from './next-navigation';
import { setStoryContext } from './story-context';

// Type definitions for Storybook (when @storybook/react is not available)
type StoryFn = () => React.ReactElement;
type StoryContext = any;
type Decorator = (Story: StoryFn, context: StoryContext) => React.ReactElement;

// This decorator provides the mocked AuthProvider and sets story context for the mocks
export const withAuthMock: Decorator = (Story, context) => {
  // Store the current story context for our mocks to access
  useEffect(() => {
    setStoryContext(context as any);
  }, [context]);

  return (
    <AppRouterProvider>
      <AuthProvider>
        <Story />
      </AuthProvider>
    </AppRouterProvider>
  );
};
