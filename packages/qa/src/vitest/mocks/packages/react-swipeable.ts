// React Swipeable library mock
import { vi } from 'vitest';
import { React } from './nextjs/shared';

vi.mock('react-swipeable', () => ({
  useSwipeable: vi.fn(() => ({
    onMouseDown: vi.fn(),
    onTouchStart: vi.fn(),
    ref: vi.fn(),
  })),
  Swipeable: ({ children, ...props }: any) => {
    return React.createElement('div', { ...props, 'data-testid': 'react-swipeable' }, children);
  },
}));
