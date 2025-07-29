// HugeIcons libraries mock
import { vi } from 'vitest';
import { React } from './nextjs/shared';

// HugeIcons React
vi.mock('@hugeicons/react', () => {
  // Create a proxy that returns mock icons for any icon name
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (typeof prop === 'string') {
          return ({ size = 24, color = 'currentColor', strokeWidth = 1.5, ...props }: any) =>
            React.createElement('svg', {
              width: size,
              height: size,
              fill: 'none',
              stroke: color,
              strokeWidth: strokeWidth,
              'data-testid': `huge-icon-${prop.toLowerCase()}`,
              'data-size': size,
              'data-color': color,
              ...props,
            });
        }
        return target[prop as keyof typeof target];
      },
    },
  );
});

// HugeIcons Core Free Icons
vi.mock('@hugeicons/core-free-icons', () => {
  // Create a proxy that returns mock icon data for any icon name
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (typeof prop === 'string') {
          return {
            name: prop,
            category: 'mock',
            style: 'outline',
            paths: [`<path d="M0 0L24 24M24 0L0 24" data-icon="${prop}" />`],
          };
        }
        return target[prop as keyof typeof target];
      },
    },
  );
});
