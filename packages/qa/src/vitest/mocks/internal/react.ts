import { vi } from 'vitest';

// Mock React hooks for testing
const mockUseEffect = vi.fn((fn, deps) => {
  if (!deps || deps.some((dep: any, index: number) => dep !== deps[index])) {
    fn();
  }
});

const mockUseState = vi.fn(initialState => {
  let state = initialState;
  const setState = vi.fn(newState => {
    state = typeof newState === 'function' ? newState(state) : newState;
  });
  return [state, setState];
});

const mockUseRef = vi.fn(initialValue => ({
  current: initialValue,
}));

const mockUseContext = vi.fn();
const mockUseReducer = vi.fn();
const mockUseCallback = vi.fn(fn => fn);
const mockUseMemo = vi.fn(fn => fn());
const mockUseLayoutEffect = vi.fn();
const mockUseImperativeHandle = vi.fn();

// Helper to reset all React mocks
const resetReactMocks = () => {
  mockUseEffect.mockClear();
  mockUseState.mockClear();
  mockUseRef.mockClear();
  mockUseContext.mockClear();
  mockUseReducer.mockClear();
  mockUseCallback.mockClear();
  mockUseMemo.mockClear();
  mockUseLayoutEffect.mockClear();
  mockUseImperativeHandle.mockClear();
};

// Create React testing scenarios
const createReactScenarios = () => {
  return {
    // Standard React hooks for testing
    standard: {
      useEffect: mockUseEffect,
      useState: mockUseState,
      useRef: mockUseRef,
      useContext: mockUseContext,
      useReducer: mockUseReducer,
      useCallback: mockUseCallback,
      useMemo: mockUseMemo,
      useLayoutEffect: mockUseLayoutEffect,
      useImperativeHandle: mockUseImperativeHandle,
    },

    // Mock that preserves actual React behavior except for specific hooks
    preserveActual: async (overrides: Record<string, any> = {}) => {
      const actual = await vi.importActual('react');
      return {
        ...actual,
        useEffect: mockUseEffect,
        ...overrides,
      };
    },
  };
};

// Setup function for automatic mocking
const setupReactMocks = () => {
  const scenarios = createReactScenarios();

  // Mock react with preserved actual behavior except for testing hooks
  vi.doMock('react', async () => {
    const actual = await vi.importActual('react');
    return {
      ...actual,
      useEffect: mockUseEffect,
      useState: mockUseState,
      useRef: mockUseRef,
      useContext: mockUseContext,
      useReducer: mockUseReducer,
      useCallback: mockUseCallback,
      useMemo: mockUseMemo,
      useLayoutEffect: mockUseLayoutEffect,
      useImperativeHandle: mockUseImperativeHandle,
    };
  });

  return scenarios;
};

// Mock the react module for automatic Vitest usage
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useEffect: mockUseEffect,
    useState: mockUseState,
    useRef: mockUseRef,
    useContext: mockUseContext,
    useReducer: mockUseReducer,
    useCallback: mockUseCallback,
    useMemo: mockUseMemo,
    useLayoutEffect: mockUseLayoutEffect,
    useImperativeHandle: mockUseImperativeHandle,
  };
});
