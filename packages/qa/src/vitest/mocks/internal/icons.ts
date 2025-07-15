// Centralized icon library mocks for all tests in the monorepo
import { vi } from 'vitest';

// Conditionally import React only if available
let React: any;
try {
  React = require('react');
} catch {
  // Create a minimal React substitute for non-React environments
  React = {
    createElement: (type: any, props: any, ...children: any[]) => ({
      type,
      props: { ...props, children: children.length === 1 ? children[0] : children },
    }),
    Fragment: 'fragment',
  };
}

// Helper to create mock icon component with dynamic props
const createMockIcon = (name: string, props: any = {}) => {
  const {
    'data-testid': testId,
    className,
    size = 24,
    width,
    height,
    color = 'currentColor',
    stroke = 'currentColor',
    strokeWidth = 2,
    fill = 'none',
    ...restProps
  } = props;

  return React.createElement('svg', {
    ...restProps,
    className,
    width: width || size,
    height: height || size,
    viewBox: '0 0 24 24',
    fill,
    stroke: color || stroke,
    strokeWidth,
    'data-testid': testId || `icon-${name}`,
    'aria-label': name,
  });
};

// Mock Heroicons
vi.mock('@heroicons/react/24/solid', () => {
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (typeof prop === 'string') {
          return (props: any) => createMockIcon(`heroicon-solid-${prop}`, props);
        }
        return undefined;
      },
    },
  );
});

vi.mock('@heroicons/react/24/outline', () => {
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (typeof prop === 'string') {
          return (props: any) => createMockIcon(`heroicon-outline-${prop}`, props);
        }
        return undefined;
      },
    },
  );
});

vi.mock('@heroicons/react/20/solid', () => {
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (typeof prop === 'string') {
          return (props: any) => createMockIcon(`heroicon-mini-${prop}`, props);
        }
        return undefined;
      },
    },
  );
});

// Mock Tabler Icons
vi.mock('@tabler/icons-react', () => {
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (typeof prop === 'string') {
          return (props: any) => createMockIcon(`tabler-${prop}`, props);
        }
        return undefined;
      },
    },
  );
});

// Mock HugeIcons
vi.mock('@hugeicons/react', () => {
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (typeof prop === 'string') {
          return (props: any) => createMockIcon(`hugeicon-${prop}`, props);
        }
        return undefined;
      },
    },
  );
});

vi.mock('@hugeicons/core-free-icons', () => ({
  // Mock any specific exports if needed
  iconList: [],
  getIcon: vi.fn(() => null),
}));

// Export helper functions
export const getMockIconTestId = (library: string, name: string) => {
  const prefixMap: Record<string, string> = {
    heroicons: 'heroicon',
    'heroicons-solid': 'heroicon-solid',
    'heroicons-outline': 'heroicon-outline',
    'heroicons-mini': 'heroicon-mini',
    tabler: 'tabler',
    hugeicons: 'hugeicon',
  };

  const prefix = prefixMap[library] || library;
  return `icon-${prefix}-${name}`;
};

export const resetIconMocks = () => {
  vi.clearAllMocks();
};
