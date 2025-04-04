// Import testing-library extensions and jest-dom
import '@testing-library/jest-dom/vitest';
import { afterAll, vi } from 'vitest';
import * as React from 'react';
import * as testingLibrary from '@testing-library/react';

// Export a createRender function that can be used in tests
export const createRender = () => {
  return (ui: React.ReactElement) => testingLibrary.render(ui);
};

// Export screen for convenience
export const screen = testingLibrary.screen;

// Add TextEncoder/TextDecoder polyfill for jsdom environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Add package-specific setup here

// Mock react-markdown to properly render markdown in tests
vi.mock('react-markdown', () => {
  return {
    default: ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
      [key: string]: any;
    }) => {
      if (typeof children !== 'string') {
        return React.createElement('div', { className, ...props }, children);
      }

      // Handle bold text
      if (children.includes('**')) {
        const parts = children.split(/(\*\*.*?\*\*)/g);
        const elements = parts.map((part, index) => {
          const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
          if (boldMatch) {
            return React.createElement(
              'strong',
              { key: `bold-${index}` },
              boldMatch[1],
            );
          }
          return part || null;
        });

        return React.createElement('div', { className, ...props }, ...elements);
      }

      // Handle italic text
      if (children.includes('*')) {
        const parts = children.split(/(\*.*?\*)/g);
        const elements = parts.map((part, index) => {
          const italicMatch = part.match(/^\*(.*?)\*$/);
          if (italicMatch) {
            return React.createElement(
              'em',
              { key: `italic-${index}` },
              italicMatch[1],
            );
          }
          return part || null;
        });

        return React.createElement('div', { className, ...props }, ...elements);
      }

      // Handle headings
      if (children.startsWith('# ')) {
        const headingMatch = children.match(/^# (.*?)$/);
        if (headingMatch) {
          return React.createElement(
            'div',
            { className, ...props },
            React.createElement('h1', null, headingMatch[1]),
          );
        }
      }

      // Default case: just return the content as is
      return React.createElement('div', { className, ...props }, children);
    },
  };
});

// Standard mock for the keys module
vi.mock('../keys', () => ({
  keys: vi.fn().mockImplementation(() => ({
    OPENAI_API_KEY: 'sk_test_openai_key123456',
  })),
}));

// Mock OpenAI
vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn().mockImplementation(() => {
    // Return a function that can be called with a model name
    return (modelName: string) => {
      // Return an object with the model property set to the provided model name
      return { model: modelName };
    };
  }),
}));
