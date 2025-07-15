// Mock for @mantine/hooks to prevent matchMedia issues in tests
// Import vi from vitest
import { vi } from 'vitest';

export const useMediaQuery = () => false;
export const useDisclosure = () => [false, { open: vi.fn(), close: vi.fn(), toggle: vi.fn() }];
export const useHover = () => ({ hovered: false, ref: { current: null } });
export const useClickOutside = vi.fn();
export const useDebouncedValue = (value: any) => [value, vi.fn()];
export const useFocusTrap = vi.fn();
export const useHotkeys = vi.fn();
export const useId = () => 'test-id';
export const useIntersection = () => ({ ref: { current: null }, entry: null, inView: false });
export const useListState = (initial: any) => [
  initial,
  {
    setState: vi.fn(),
    append: vi.fn(),
    prepend: vi.fn(),
    insert: vi.fn(),
    remove: vi.fn(),
    reorder: vi.fn(),
    setItem: vi.fn(),
    apply: vi.fn(),
    applyWhere: vi.fn(),
    filter: vi.fn(),
    pop: vi.fn(),
    shift: vi.fn(),
    swap: vi.fn(),
  },
];
export const useLocalStorage = (key: string, defaultValue: any) => [defaultValue, vi.fn()];
export const useSessionStorage = (key: string, defaultValue: any) => [defaultValue, vi.fn()];
export const useMove = () => ({ x: 0, y: 0, ref: { current: null } });
export const useNetwork = () => ({ online: true, since: new Date() });
export const useOs = () => 'macos';
export const usePageLeave = vi.fn();
export const useReducedMotion = () => false;
export const useScrollIntoView = () => ({ scrollIntoView: vi.fn(), targetRef: { current: null } });
export const useShallowEffect = vi.fn();
export const useToggle = (initial: any) => [initial, vi.fn()];
export const useViewportSize = () => ({ width: 1024, height: 768 });
export const useWindowEvent = vi.fn();
export const useWindowScroll = () => ({ x: 0, y: 0 });
export const useWindowSize = () => ({ width: 1024, height: 768 });
export const usePrevious = (_value: any) => undefined;
export const useCounter = (initial: number) => [
  initial,
  { increment: vi.fn(), decrement: vi.fn(), reset: vi.fn(), set: vi.fn() },
];
export const useClipboard = () => ({ copy: vi.fn(), copied: false, reset: vi.fn() });
export const useColorScheme = () => ({ colorScheme: 'light', toggleColorScheme: vi.fn() });
export const useDocumentTitle = vi.fn();
export const useDocumentVisibility = () => 'visible';
export const useElementSize = () => ({ width: 0, height: 0, ref: { current: null } });
export const useEventListener = vi.fn();
export const useEyeDropper = () => ({ open: vi.fn(), supported: false });
export const useFavicon = vi.fn();
export const useFullscreen = () => ({ toggle: vi.fn(), ref: { current: null }, fullscreen: false });
export const useHash = () => ['', vi.fn()];
export const useHeadroom = () => ({ pinned: true, height: 0 });
export const useInterval = vi.fn();
export const useIsomorphicEffect = vi.fn();
export const useKeyPress = vi.fn();
export const useLogger = () => ({ log: vi.fn(), warn: vi.fn(), error: vi.fn() });
export const useMouse = () => ({ x: 0, y: 0, ref: { current: null } });
export const useMergedRef =
  (...refs: any[]) =>
  (node: any) =>
    refs.forEach(ref => (typeof ref === 'function' ? ref(node) : ref && (ref.current = node)));
export const usePagination = (_total: number) => ({ range: [], active: 1, setPage: vi.fn() });
export const useQueue = (initial: any[]) => [
  initial,
  { add: vi.fn(), update: vi.fn(), cleanQueue: vi.fn() },
];
export const useSetState = (initial: any) => [initial, vi.fn()];
export const useTextSelection = () => ({ text: '', refs: { current: [] } });
export const useTimeout = vi.fn();
export const useValidatedState = (rule: any, initial: any) => [
  initial,
  vi.fn(),
  { error: null, hasError: false },
];
export const useWhyDidYouUpdate = vi.fn();
