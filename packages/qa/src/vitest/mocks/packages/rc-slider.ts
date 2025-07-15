// RC Slider library mock
import { vi } from 'vitest';
import { React } from './nextjs/shared';

vi.mock('rc-slider', () => ({
  default: ({ ...props }: any) => {
    return React.createElement('div', { ...props, 'data-testid': 'rc-slider' });
  },
  Range: ({ ...props }: any) => {
    return React.createElement('div', { ...props, 'data-testid': 'rc-slider-range' });
  },
}));
