// React Use library mock
import { vi } from 'vitest';

vi.mock('react-use', () => ({
  useLocalStorage: vi.fn(() => [null, vi.fn()]),
  useSessionStorage: vi.fn(() => [null, vi.fn()]),
  useToggle: vi.fn(() => [false, vi.fn()]),
  useCounter: vi.fn(() => [0, { inc: vi.fn(), dec: vi.fn(), reset: vi.fn() }]),
  useMount: vi.fn(),
  useUnmount: vi.fn(),
  useUpdateEffect: vi.fn(),
  useAsync: vi.fn(() => ({ loading: false, error: null, value: null })),
  useCopyToClipboard: vi.fn(() => [{ value: null, error: null }, vi.fn()]),
  useDebounce: vi.fn(),
  useThrottle: vi.fn(),
  useInterval: vi.fn(),
  useTimeout: vi.fn(),
  useBoolean: vi.fn(() => [false, { toggle: vi.fn(), setTrue: vi.fn(), setFalse: vi.fn() }]),
  useList: vi.fn(() => [[], { push: vi.fn(), filter: vi.fn(), sort: vi.fn() }]),
  useMap: vi.fn(() => [new Map(), { set: vi.fn(), get: vi.fn(), remove: vi.fn() }]),
  useSet: vi.fn(() => [new Set(), { add: vi.fn(), has: vi.fn(), remove: vi.fn() }]),
}));
