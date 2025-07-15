// React Hot Toast library mock
import { vi } from 'vitest';
import { React } from './nextjs/shared';

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    custom: vi.fn(),
    dismiss: vi.fn(),
    remove: vi.fn(),
    promise: vi.fn(),
  },
  Toaster: ({ ...props }: any) => {
    return React.createElement('div', { ...props, 'data-testid': 'react-hot-toast-toaster' });
  },
  resolveValue: vi.fn(),
}));
