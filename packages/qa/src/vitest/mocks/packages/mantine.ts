// Mantine UI framework mocks
import { expect, vi } from 'vitest';

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

// Mantine Hooks
vi.mock('@mantine/hooks', () => ({
  useDisclosure: vi.fn(() => [false, { open: vi.fn(), close: vi.fn(), toggle: vi.fn() }]),
  useToggle: vi.fn((values = [false, true]) => [values[0], vi.fn()]),
  useMediaQuery: vi.fn(() => false),
  useDebouncedValue: vi.fn(v => [v, vi.fn()]),
  useClipboard: vi.fn(() => ({ copy: vi.fn(), copied: false, reset: vi.fn() })),
  useIntersection: vi.fn(() => ({ ref: vi.fn(), entry: {} })),
  useId: vi.fn(() => 'mock-id'),
  useFocusTrap: vi.fn(() => [false, { activate: vi.fn(), deactivate: vi.fn() }]),
  useHover: vi.fn(() => [false, { ref: vi.fn() }]),
  useScrollIntoView: vi.fn(() => ({
    scrollIntoView: vi.fn(),
    targetRef: vi.fn(),
    scrollableRef: vi.fn(),
  })),
  useViewportSize: vi.fn(() => ({ width: 1920, height: 1080 })),
  useWindowEvent: vi.fn(),
  useDocumentTitle: vi.fn(),
  useClickOutside: vi.fn(),
  useHotkeys: vi.fn(),
  useFullscreen: vi.fn(() => ({ toggle: vi.fn(), fullscreen: false })),
  useNetwork: vi.fn(() => ({ online: true, since: new Date() })),
  useOs: vi.fn(() => 'macos'),
  useReducedMotion: vi.fn(() => false),
  useColorScheme: vi.fn(() => ({ colorScheme: 'light', toggleColorScheme: vi.fn() })),
  useLocalStorage: vi.fn(() => [null, vi.fn()]),
  useSessionStorage: vi.fn(() => [null, vi.fn()]),
  useHash: vi.fn(() => ['', vi.fn()]),
  usePrevious: vi.fn(_value => undefined),
  useCounter: vi.fn(() => [
    0,
    { increment: vi.fn(), decrement: vi.fn(), reset: vi.fn(), set: vi.fn() },
  ]),
  useListState: vi.fn((initialItems = []) => [
    initialItems,
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
      update: vi.fn(),
      updateItem: vi.fn(),
      updateItemWhere: vi.fn(),
      shuffle: vi.fn(),
      swap: vi.fn(),
    },
  ]),
  useForm: vi.fn(config => {
    const mockForm = {
      values: config?.initialValues || { name: '', status: 'DRAFT' },
      isDirty: vi.fn(() => false),
      isTouched: vi.fn(() => false),
      isValid: vi.fn(() => true),
      setValues: vi.fn(),
      resetDirty: vi.fn(),
      submitting: false,
      setFieldError: vi.fn(),
      onSubmit: vi.fn(),
      getInputProps: vi.fn((_path: string) => ({
        value: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        error: undefined,
      })),
      setFieldValue: vi.fn(),
      errors: {},
      config: config,
      initialized: true,
      initialize: vi.fn(),
      reset: vi.fn(),
      getValues: vi.fn(() => config?.initialValues || { name: '', status: 'DRAFT' }),
      getInputNode: vi.fn(() => ({ focus: vi.fn() })),
      validateField: vi.fn(() => ({ hasError: false })),
      // Enhanced form properties
      onSubmitWithServerErrors: vi.fn(handler => (e?: any) => {
        e?.preventDefault?.();
        return handler(mockForm.values);
      }),
      getTransformedValues: vi.fn(() => mockForm.values),
      handleServerError: vi.fn(),
      clearPersistedData: vi.fn(),
      validateFieldAsync: vi.fn(),
      autoSaveStatus: 'idle' as const,
      lastSavedAt: null,
      isAutoSaving: false,
    };
    return mockForm;
  }),
}));

// Mantine Form
vi.mock('@mantine/form', () => ({
  useForm: vi.fn(config => {
    const mockForm = {
      values: config?.initialValues || { name: '', status: 'DRAFT' },
      isDirty: vi.fn(() => false),
      isTouched: vi.fn(() => false),
      isValid: vi.fn(() => true),
      setValues: vi.fn(),
      resetDirty: vi.fn(),
      submitting: false,
      setFieldError: vi.fn(),
      onSubmit: vi.fn(),
      getInputProps: vi.fn((_path: string) => ({
        value: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        error: undefined,
      })),
      setFieldValue: vi.fn(),
      errors: {},
      config: config,
      initialized: true,
      initialize: vi.fn(),
      reset: vi.fn(),
      getValues: vi.fn(() => config?.initialValues || { name: '', status: 'DRAFT' }),
      getInputNode: vi.fn(() => ({ focus: vi.fn() })),
      validateField: vi.fn(() => ({ hasError: false })),
      // Enhanced form properties
      onSubmitWithServerErrors: vi.fn(handler => (e?: any) => {
        e?.preventDefault?.();
        return handler(mockForm.values);
      }),
      getTransformedValues: vi.fn(() => mockForm.values),
      handleServerError: vi.fn(),
      clearPersistedData: vi.fn(),
      validateFieldAsync: vi.fn(),
      autoSaveStatus: 'idle' as const,
      lastSavedAt: null,
      isAutoSaving: false,
    };
    return mockForm;
  }),
  createFormContext: vi.fn(() => [
    ({ children, ...props }: any) =>
      React.createElement('div', { ...props, 'data-testid': 'form-provider' }, children),
    () => ({ mockContext: true }),
    () => ({ mockForm: true }),
  ]),
}));

// Mantine Notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
    hide: vi.fn(),
    update: vi.fn(),
    clean: vi.fn(),
    cleanQueue: vi.fn(),
  },
}));

// Mantine Dates
vi.mock('@mantine/dates', () => ({
  DateInput: ({ ...props }: any) =>
    React.createElement('input', { ...props, 'data-testid': 'mantine-date-input' }),
  DatePicker: ({ ...props }: any) =>
    React.createElement('div', { ...props, 'data-testid': 'mantine-date-picker' }),
  DatePickerInput: ({ ...props }: any) =>
    React.createElement('input', { ...props, 'data-testid': 'mantine-date-picker-input' }),
  MonthPicker: ({ ...props }: any) =>
    React.createElement('div', { ...props, 'data-testid': 'mantine-month-picker' }),
}));

// Mantine Modals
vi.mock('@mantine/modals', () => ({
  modals: {
    open: vi.fn(),
    close: vi.fn(),
    closeAll: vi.fn(),
  },
  openModal: vi.fn(),
  closeModal: vi.fn(),
  closeAllModals: vi.fn(),
}));

// Mantine Core Components
vi.mock('@mantine/core', () => {
  // Create a generic mock component factory
  const createMockComponent = (displayName: string, defaultTestId?: string) => {
    const MockComponent = ({ children, 'data-testid': testId, ...props }: any) =>
      React.createElement(
        'div',
        {
          ...props,
          'data-testid': testId || defaultTestId || `mantine-${displayName.toLowerCase()}`,
        },
        children,
      );
    MockComponent.displayName = displayName;
    return MockComponent;
  };

  return {
    // Layout components
    AppShell: createMockComponent('AppShell'),
    AppShellHeader: createMockComponent('AppShellHeader'),
    AppShellMain: createMockComponent('AppShellMain'),
    AppShellNavbar: createMockComponent('AppShellNavbar'),
    AppShellAside: createMockComponent('AppShellAside'),
    AppShellFooter: createMockComponent('AppShellFooter'),
    AppShellSection: createMockComponent('AppShellSection'),
    Container: createMockComponent('Container'),
    Group: createMockComponent('Group'),
    Stack: createMockComponent('Stack'),
    Flex: createMockComponent('Flex'),
    Grid: createMockComponent('Grid'),
    GridCol: createMockComponent('GridCol'),
    SimpleGrid: createMockComponent('SimpleGrid'),
    Center: createMockComponent('Center'),
    Box: createMockComponent('Box'),

    // Form components
    Button: createMockComponent('Button', 'mantine-button'),
    ActionIcon: createMockComponent('ActionIcon', 'mantine-action-icon'),
    TextInput: createMockComponent('TextInput', 'mantine-text-input'),
    PasswordInput: createMockComponent('PasswordInput', 'mantine-password-input'),
    Textarea: createMockComponent('Textarea', 'mantine-textarea'),
    Select: createMockComponent('Select', 'mantine-select'),
    MultiSelect: createMockComponent('MultiSelect', 'mantine-multi-select'),
    Checkbox: createMockComponent('Checkbox', 'mantine-checkbox'),
    Radio: createMockComponent('Radio', 'mantine-radio'),
    Switch: createMockComponent('Switch', 'mantine-switch'),
    Slider: createMockComponent('Slider', 'mantine-slider'),
    NumberInput: createMockComponent('NumberInput', 'mantine-number-input'),

    // Display components
    Text: createMockComponent('Text', 'mantine-text'),
    Title: createMockComponent('Title', 'mantine-title'),
    Code: createMockComponent('Code', 'mantine-code'),
    Badge: createMockComponent('Badge', 'mantine-badge'),
    Card: createMockComponent('Card', 'mantine-card'),
    Paper: createMockComponent('Paper', 'mantine-paper'),
    Table: createMockComponent('Table', 'mantine-table'),
    Avatar: createMockComponent('Avatar', 'mantine-avatar'),
    Image: createMockComponent('Image', 'mantine-image'),

    // Navigation components
    Anchor: createMockComponent('Anchor', 'mantine-anchor'),
    Breadcrumbs: createMockComponent('Breadcrumbs', 'mantine-breadcrumbs'),
    Tabs: createMockComponent('Tabs', 'mantine-tabs'),
    NavLink: createMockComponent('NavLink', 'mantine-nav-link'),

    // Feedback components
    Alert: createMockComponent('Alert', 'mantine-alert'),
    Notification: createMockComponent('Notification', 'mantine-notification'),
    Progress: createMockComponent('Progress', 'mantine-progress'),
    Loader: createMockComponent('Loader', 'mantine-loader'),
    LoadingOverlay: createMockComponent('LoadingOverlay', 'mantine-loading-overlay'),
    Skeleton: createMockComponent('Skeleton', 'mantine-skeleton'),

    // Overlay components
    Modal: createMockComponent('Modal', 'mantine-modal'),
    Drawer: createMockComponent('Drawer', 'mantine-drawer'),
    Overlay: createMockComponent('Overlay', 'mantine-overlay'),
    Tooltip: createMockComponent('Tooltip', 'mantine-tooltip'),
    Popover: createMockComponent('Popover', 'mantine-popover'),
    Menu: Object.assign(createMockComponent('Menu', 'mantine-menu'), {
      Target: createMockComponent('MenuTarget', 'mantine-menu-target'),
      Dropdown: createMockComponent('MenuDropdown', 'mantine-menu-dropdown'),
      Item: createMockComponent('MenuItem', 'mantine-menu-item'),
      Label: createMockComponent('MenuLabel', 'mantine-menu-label'),
      Divider: createMockComponent('MenuDivider', 'mantine-menu-divider'),
    }),

    // Utility components
    Divider: createMockComponent('Divider', 'mantine-divider'),
    Space: createMockComponent('Space', 'mantine-space'),
    Spotlight: createMockComponent('Spotlight', 'mantine-spotlight'),

    // Theme and providers
    MantineProvider: ({ children, ...props }: any) =>
      React.createElement('div', { ...props, 'data-testid': 'mantine-provider' }, children),
    createTheme: vi.fn((theme = {}) => ({ ...theme, colors: {}, spacing: {} })),
    useMantineTheme: vi.fn(() => ({ colors: {}, spacing: {} })),
    useMantineColorScheme: vi.fn(() => ({ colorScheme: 'light', toggleColorScheme: vi.fn() })),

    // Hooks
    useComputedColorScheme: vi.fn(() => 'light'),
    useDirection: vi.fn(() => ({ dir: 'ltr', setDirection: vi.fn() })),
    useCombobox: vi.fn(() => ({
      getTargetProps: vi.fn(() => ({ onClick: vi.fn() })),
      getDropdownProps: vi.fn(() => ({ 'data-testid': 'combobox-dropdown' })),
      getInputProps: vi.fn(() => ({ onChange: vi.fn(), value: '' })),
      getOptionProps: vi.fn(() => ({ onClick: vi.fn() })),
      selectOption: vi.fn(),
      openDropdown: vi.fn(),
      closeDropdown: vi.fn(),
      updateSelectedOptionIndex: vi.fn(),
      selectActiveOption: vi.fn(),
      clickTargetRef: { current: null },
      searchRef: { current: null },
      listRef: { current: null },
      selectedOptionIndex: -1,
      dropdownOpened: false,
      options: [],
    })),
  };
});

// Enhanced form mock interface
export interface MockEnhancedForm {
  values: Record<string, any>;
  errors: Record<string, string>;
  setFieldValue: ReturnType<typeof vi.fn>;
  setValues: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
  validate: ReturnType<typeof vi.fn>;
  onSubmit: ReturnType<typeof vi.fn>;
  onSubmitWithServerErrors: ReturnType<typeof vi.fn>;
  getInputProps: ReturnType<typeof vi.fn>;
  getTransformedValues: ReturnType<typeof vi.fn>;
  initialize: ReturnType<typeof vi.fn>;
  handleServerError: ReturnType<typeof vi.fn>;
  clearPersistedData: ReturnType<typeof vi.fn>;
  validateFieldAsync: ReturnType<typeof vi.fn>;
  isDirty: ReturnType<typeof vi.fn>;
  isTouched: ReturnType<typeof vi.fn>;
  isValid: ReturnType<typeof vi.fn>;
  submitting: boolean;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: number | null;
  isAutoSaving: boolean;
}

/**
 * Creates a mock implementation of useEnhancedForm for testing
 */
export function createMockEnhancedForm(
  overrides: Partial<MockEnhancedForm> = {},
): MockEnhancedForm {
  const mockForm: MockEnhancedForm = {
    values: {},
    errors: {},
    setFieldValue: vi.fn(),
    setValues: vi.fn(),
    reset: vi.fn(),
    validate: vi.fn(() => Promise.resolve({ hasErrors: false })),
    onSubmit: vi.fn(),
    onSubmitWithServerErrors: vi.fn(handler => (e?: any) => {
      e?.preventDefault?.();
      return handler(mockForm.values);
    }),
    getInputProps: vi.fn((field: string) => ({
      value: mockForm.values[field] || '',
      onChange: vi.fn(e => {
        if (e?.target?.value !== undefined) {
          mockForm.values[field] = e.target.value;
        }
      }),
      onBlur: vi.fn(),
      error: mockForm.errors[field] || null,
    })),
    getTransformedValues: vi.fn(() => mockForm.values),
    initialize: vi.fn(values => {
      mockForm.values = { ...mockForm.values, ...values };
    }),
    handleServerError: vi.fn(),
    clearPersistedData: vi.fn(),
    validateFieldAsync: vi.fn(),
    isDirty: vi.fn(() => false),
    isTouched: vi.fn(() => false),
    isValid: vi.fn(() => true),
    submitting: false,
    autoSaveStatus: 'idle' as const,
    lastSavedAt: null,
    isAutoSaving: false,
    ...overrides,
  };

  // Update getInputProps to reference the current form values
  vi.spyOn(mockForm, 'getInputProps').mockImplementation((field: string) => ({
    value: mockForm.values[field] || '',
    onChange: vi.fn(e => {
      if (e?.target?.value !== undefined) {
        mockForm.values[field] = e.target.value;
      }
    }),
    onBlur: vi.fn(),
    error: mockForm.errors[field] || null,
  }));

  return mockForm;
}

/**
 * Creates form with specific state scenarios
 */
export const formStates = {
  loading: (baseForm: MockEnhancedForm) => ({
    ...baseForm,
    submitting: true,
  }),

  withErrors: (baseForm: MockEnhancedForm, errors: Record<string, string>) => ({
    ...baseForm,
    errors,
    isValid: vi.fn(() => false),
  }),

  dirty: (baseForm: MockEnhancedForm) => ({
    ...baseForm,
    isDirty: vi.fn(() => true),
  }),

  touched: (baseForm: MockEnhancedForm) => ({
    ...baseForm,
    isTouched: vi.fn(() => true),
  }),

  autoSaving: (baseForm: MockEnhancedForm) => ({
    ...baseForm,
    autoSaveStatus: 'saving' as const,
    isAutoSaving: true,
  }),

  autoSaved: (baseForm: MockEnhancedForm, timestamp = Date.now()) => ({
    ...baseForm,
    autoSaveStatus: 'saved' as const,
    lastSavedAt: timestamp,
  }),

  autoSaveError: (baseForm: MockEnhancedForm) => ({
    ...baseForm,
    autoSaveStatus: 'error' as const,
  }),
};

/**
 * Common test scenarios for enhanced forms
 */
export const enhancedFormTestScenarios = {
  /**
   * Test that form renders without crashing
   */
  renderTest: (Component: any, props: any) => {
    return () => {
      const { render } = require('@testing-library/react');
      render(React.createElement(Component, props));
    };
  },

  /**
   * Test loading state
   */
  loadingTest: (Component: any, props: any, mockForm: MockEnhancedForm) => {
    return () => {
      const { render, screen } = require('@testing-library/react');
      const loadingForm = formStates.loading(mockForm);

      render(React.createElement(Component, { ...props, form: loadingForm }));

      const loadingIndicators = [
        () => screen.queryByTestId('loading-indicator'),
        () => screen.queryByTestId('form-loading'),
        () => screen.queryByText(/loading/i),
        () => screen.queryByText(/submitting/i),
      ];

      const hasLoadingIndicator = loadingIndicators.some(fn => {
        try {
          return fn();
        } catch {
          return false;
        }
      });

      expect(hasLoadingIndicator).toBeTruthy();
    };
  },

  /**
   * Test validation errors
   */
  validationTest: (Component: any, props: any, mockForm: MockEnhancedForm) => {
    return async () => {
      const { render, screen, waitFor } = require('@testing-library/react');
      const errorForm = formStates.withErrors(mockForm, {
        name: 'Name is required',
        email: 'Invalid email format',
      });

      render(React.createElement(Component, { ...props, form: errorForm }));

      await waitFor(() => {
        try {
          expect(screen.getByText('Name is required')).toBeInTheDocument();
        } catch {
          // Try alternative ways to find error messages
          const errorElements = screen.queryAllByText(/required|invalid/i);
          expect(errorElements.length).toBeGreaterThan(0);
        }
      });
    };
  },

  /**
   * Test autosave functionality
   */
  autosaveTest: (Component: any, props: any, mockForm: MockEnhancedForm) => {
    return () => {
      const { render, screen } = require('@testing-library/react');
      const savingForm = formStates.autoSaving(mockForm);

      render(React.createElement(Component, { ...props, form: savingForm }));

      const savingIndicators = [
        () => screen.queryByText(/saving/i),
        () => screen.queryByTestId('autosave-indicator'),
        () => screen.queryByTestId('auto-save-status'),
      ];

      const hasSavingIndicator = savingIndicators.some(fn => {
        try {
          return fn();
        } catch {
          return false;
        }
      });

      expect(hasSavingIndicator).toBeTruthy();
    };
  },

  /**
   * Test form submission
   */
  submitTest: (Component: any, props: any, mockForm: MockEnhancedForm) => {
    return async () => {
      const { render, screen, fireEvent, waitFor } = require('@testing-library/react');

      render(React.createElement(Component, { ...props, form: mockForm }));

      const submitButton = screen.getByRole('button', { name: /submit|save|create|update/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockForm.onSubmit).toHaveBeenCalledWith();
      });
    };
  },
};

/**
 * Helper to clear all form-related mocks
 */
export function clearFormMocks() {
  vi.clearAllMocks();
}
