// Centralized Mantine and Zod mocks for all tests in the monorepo
// Import this file at the top of your test setup files (before any other imports)
//
// USAGE EXAMPLES:
//
// 1. Use default mocks (recommended):
//   <Button>Click me</Button> // Renders with data-testid="mantine-button"
//   <HugeIcon01 size={32} />  // Renders with data-testid="huge-icon-hugeicon01"
//   import image from '@/images/photo.jpg' // Auto-mocked as { src: '/mock-photo.jpg', data-testid: 'mock-image-photo' }
//
// 2. Override data-testid for specific tests:
//   <Button data-testid="submit-button">Submit</Button> // Uses "submit-button"
//   <TextInput data-testid="email-input" />             // Uses "email-input"
//   <ShoppingCart02Icon data-testid="cart-icon" />      // Uses "cart-icon"
//
// 3. Dynamic icon properties:
//   <SearchIcon size={48} color="red" strokeWidth={2} data-icon="search" />
//   // Renders with: data-size="48", data-color="red", data-icon="search"
//
// 4. Use utility functions for custom behavior:
//   import { mockUtils } from '@repo/qa/vitest/mocks/mantine-zod';
//   const customImage = mockUtils.mockImage('/path/to/image.jpg', { 'data-testid': 'hero-image' });
//   const CustomIcon = mockUtils.mockIcon('search', {
//     'data-testid': 'search-icon',
//     path: 'M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z'
//   });
//
// 5. Create dynamic icon libraries for test scenarios:
//   const testIcons = mockUtils.createIconLibrary({
//     Search: mockUtils.mockIcon('search', { color: 'blue' }),
//     Cart: mockUtils.mockIcon('cart', { size: 32 })
//   });
//
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
  useMap: vi.fn(() => [
    new Map(),
    { set: vi.fn(), setAll: vi.fn(), get: vi.fn(), has: vi.fn(), remove: vi.fn(), clear: vi.fn() },
  ]),
  useSet: vi.fn(() => [
    new Set(),
    { add: vi.fn(), addAll: vi.fn(), remove: vi.fn(), has: vi.fn(), clear: vi.fn() },
  ]),
  useQueue: vi.fn(() => [
    { queue: [], add: vi.fn(), clean: vi.fn() },
    { add: vi.fn(), clean: vi.fn() },
  ]),
  useTimeout: vi.fn(() => ({ start: vi.fn(), clear: vi.fn() })),
  useInterval: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
  useTextSelection: vi.fn(() => ({ text: '', refs: [] })),
  useEyeDropper: vi.fn(() => ({ open: vi.fn(), supported: false })),
  useMutationObserver: vi.fn(() => ({ stop: vi.fn() })),
  useResizeObserver: vi.fn(() => ({ ref: vi.fn() })),
  useElementSize: vi.fn(() => ({ width: 0, height: 0, ref: vi.fn() })),
  useWindowScroll: vi.fn(() => ({ x: 0, y: 0, scrollTo: vi.fn() })),
  useElementScroll: vi.fn(() => ({ x: 0, y: 0, scrollTo: vi.fn() })),
  useMouse: vi.fn(() => ({ x: 0, y: 0, ref: vi.fn() })),
  useMove: vi.fn(() => ({ x: 0, y: 0, ref: vi.fn() })),
  useFloating: vi.fn(() => ({
    x: 0,
    y: 0,
    strategy: 'absolute',
    refs: { setFloating: vi.fn(), setReference: vi.fn() },
    update: vi.fn(),
  })),
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
      // Legacy compatibility fields
      touched: {},
      isSubmitting: false,
      isValidating: false,
      setFieldTouched: vi.fn(),
      setErrors: vi.fn(),
      setTouched: vi.fn(),
      setSubmitting: vi.fn(),
      setValidating: vi.fn(),
      resetForm: vi.fn(),
      submitForm: vi.fn(),
      validateForm: vi.fn(),
      getFieldProps: vi.fn(fieldName => ({
        name: fieldName,
        value: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
      })),
      getFieldMeta: vi.fn(),
      getFieldHelpers: vi.fn(),
      registerField: vi.fn(),
      unregisterField: vi.fn(),
      setFormikState: vi.fn(),
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
  MonthPickerInput: ({ ...props }: any) =>
    React.createElement('input', { ...props, 'data-testid': 'mantine-month-picker-input' }),
  YearPicker: ({ ...props }: any) =>
    React.createElement('div', { ...props, 'data-testid': 'mantine-year-picker' }),
  YearPickerInput: ({ ...props }: any) =>
    React.createElement('input', { ...props, 'data-testid': 'mantine-year-picker-input' }),
  TimeInput: ({ ...props }: any) =>
    React.createElement('input', { ...props, 'data-testid': 'mantine-time-input' }),
  DateTimePicker: ({ ...props }: any) =>
    React.createElement('div', { ...props, 'data-testid': 'mantine-datetime-picker' }),
  Calendar: ({ ...props }: any) =>
    React.createElement('div', { ...props, 'data-testid': 'mantine-calendar' }),
  DatesProvider: ({ children, ...props }: any) =>
    React.createElement('div', { ...props, 'data-testid': 'mantine-dates-provider' }, children),
}));

// Mantine Modals
vi.mock('@mantine/modals', () => ({
  ModalsProvider: ({ children, ...props }: any) =>
    React.createElement('div', { ...props, 'data-testid': 'mantine-modals-provider' }, children),
  modals: {
    open: vi.fn(),
    close: vi.fn(),
    closeAll: vi.fn(),
    openConfirmModal: vi.fn(),
    openContextModal: vi.fn(),
  },
  useModals: vi.fn(() => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    closeAllModals: vi.fn(),
    openConfirmModal: vi.fn(),
    openContextModal: vi.fn(),
  })),
  ContextModalProps: {},
}));

// Mantine Core Components
vi.mock('@mantine/core', () => {
  // Create proper React components with flexible data-testid
  const createMockComponent = (tag: string, defaultTestId: string) => {
    return ({ children, 'data-testid': testId, ...props }: any) =>
      React.createElement(
        tag,
        {
          ...props,
          'data-testid': testId || defaultTestId,
        },
        children,
      );
  };

  return {
    Button: Object.assign(
      ({ children, 'data-testid': testId, ...props }: any) =>
        React.createElement(
          'button',
          { ...props, 'data-testid': testId || 'mantine-button', tabIndex: 0 },
          children,
        ),
      {
        Group: createMockComponent('div', 'mantine-button-group'),
      },
    ),
    TextInput: createMockComponent('input', 'mantine-text-input'),
    Select: createMockComponent('select', 'mantine-select'),
    Textarea: createMockComponent('textarea', 'mantine-textarea'),
    Checkbox: createMockComponent('input', 'mantine-checkbox'),
    Radio: createMockComponent('input', 'mantine-radio'),
    Switch: createMockComponent('input', 'mantine-switch'),
    Modal: createMockComponent('div', 'mantine-modal'),
    Drawer: createMockComponent('div', 'mantine-drawer'),
    Popover: createMockComponent('div', 'mantine-popover'),
    Tooltip: createMockComponent('div', 'mantine-tooltip'),
    Alert: createMockComponent('div', 'mantine-alert'),
    Notification: createMockComponent('div', 'mantine-notification'),
    LoadingOverlay: createMockComponent('div', 'mantine-loading-overlay'),
    Skeleton: createMockComponent('div', 'mantine-skeleton'),
    Badge: createMockComponent('span', 'mantine-badge'),
    Chip: createMockComponent('div', 'mantine-chip'),
    Progress: createMockComponent('div', 'mantine-progress'),
    RingProgress: createMockComponent('div', 'mantine-ring-progress'),
    SegmentedControl: createMockComponent('div', 'mantine-segmented-control'),
    Slider: createMockComponent('input', 'mantine-slider'),
    RangeSlider: createMockComponent('div', 'mantine-range-slider'),
    ColorInput: createMockComponent('input', 'mantine-color-input'),
    ColorPicker: createMockComponent('div', 'mantine-color-picker'),
    FileInput: createMockComponent('input', 'mantine-file-input'),
    MultiSelect: createMockComponent('select', 'mantine-multi-select'),
    NativeSelect: createMockComponent('select', 'mantine-native-select'),
    PasswordInput: createMockComponent('input', 'mantine-password-input'),
    PinInput: createMockComponent('div', 'mantine-pin-input'),
    Rating: createMockComponent('div', 'mantine-rating'),
    JsonInput: createMockComponent('textarea', 'mantine-json-input'),
    NumberInput: createMockComponent('input', 'mantine-number-input'),
    DateInput: createMockComponent('input', 'mantine-date-input'),
    DatePicker: createMockComponent('div', 'mantine-date-picker'),
    DatePickerInput: createMockComponent('input', 'mantine-date-picker-input'),
    MonthPicker: createMockComponent('div', 'mantine-month-picker'),
    MonthPickerInput: createMockComponent('input', 'mantine-month-picker-input'),
    YearPicker: createMockComponent('div', 'mantine-year-picker'),
    YearPickerInput: createMockComponent('input', 'mantine-year-picker-input'),
    TimeInput: createMockComponent('input', 'mantine-time-input'),
    DateTimePicker: createMockComponent('div', 'mantine-datetime-picker'),
    TransferList: createMockComponent('div', 'mantine-transfer-list'),
    Autocomplete: createMockComponent('input', 'mantine-autocomplete'),
    Combobox: createMockComponent('div', 'mantine-combobox'),
    TagsInput: createMockComponent('div', 'mantine-tags-input'),
    Image: createMockComponent('img', 'mantine-image'),
    Stack: createMockComponent('div', 'mantine-stack'),
    Group: createMockComponent('div', 'mantine-group'),
    Grid: Object.assign(createMockComponent('div', 'mantine-grid'), {
      Col: createMockComponent('div', 'mantine-grid-col'),
    }),
    Col: createMockComponent('div', 'mantine-col'),
    Container: createMockComponent('div', 'mantine-container'),
    Paper: createMockComponent('div', 'mantine-paper'),
    Card: ({ children, withBorder: _withBorder, ...props }: any) => {
      const { withBorder: _, ...cleanProps } = props;
      return React.createElement('div', { ...cleanProps, 'data-testid': 'mantine-card' }, children);
    },
    BackgroundImage: createMockComponent('div', 'mantine-background-image'),
    Box: createMockComponent('div', 'mantine-box'),
    Center: createMockComponent('div', 'mantine-center'),
    Divider: createMockComponent('hr', 'mantine-divider'),
    Flex: createMockComponent('div', 'mantine-flex'),
    Ring: createMockComponent('div', 'mantine-ring'),
    SimpleGrid: createMockComponent('div', 'mantine-simple-grid'),
    Space: createMockComponent('div', 'mantine-space'),
    Text: createMockComponent('p', 'mantine-text'),
    Title: createMockComponent('h1', 'mantine-title'),
    Anchor: createMockComponent('a', 'mantine-anchor'),
    NavLink: ({ children, label, ...props }: any) =>
      React.createElement('a', { ...props, 'data-testid': 'mantine-nav-link' }, children || label),
    Blockquote: createMockComponent('blockquote', 'mantine-blockquote'),
    Code: createMockComponent('code', 'mantine-code'),
    Highlight: createMockComponent('mark', 'mantine-highlight'),
    List: createMockComponent('ul', 'mantine-list'),
    Mark: createMockComponent('mark', 'mantine-mark'),
    Spoiler: createMockComponent('div', 'mantine-spoiler'),
    TypographyStylesProvider: createMockComponent('div', 'mantine-typography-styles-provider'),
    Table: Object.assign(createMockComponent('table', 'mantine-table'), {
      Tr: createMockComponent('tr', 'mantine-table-tr'),
      Td: createMockComponent('td', 'mantine-table-td'),
      Th: createMockComponent('th', 'mantine-table-th'),
      Thead: createMockComponent('thead', 'mantine-table-thead'),
      Tbody: createMockComponent('tbody', 'mantine-table-tbody'),
      ScrollContainer: createMockComponent('div', 'mantine-table-scroll-container'),
    }),
    ScrollArea: createMockComponent('div', 'mantine-scroll-area'),
    ScrollAreaAutosize: createMockComponent('div', 'mantine-scroll-area-autosize'),
    Affix: createMockComponent('div', 'mantine-affix'),
    AppShell: createMockComponent('div', 'mantine-app-shell'),
    // Mantine v8 AppShell components
    AppShellHeader: createMockComponent('header', 'mantine-app-shell-header'),
    AppShellMain: createMockComponent('main', 'mantine-app-shell-main'),
    AppShellNavbar: createMockComponent('nav', 'mantine-app-shell-navbar'),
    AppShellAside: createMockComponent('aside', 'mantine-app-shell-aside'),
    AppShellFooter: createMockComponent('footer', 'mantine-app-shell-footer'),
    AppShellSection: createMockComponent('section', 'mantine-app-shell-section'),
    // Legacy components (v7 and older)
    Aside: createMockComponent('aside', 'mantine-aside'),
    Footer: createMockComponent('footer', 'mantine-footer'),
    Header: createMockComponent('header', 'mantine-header'),
    Main: createMockComponent('main', 'mantine-main'),
    Navbar: createMockComponent('nav', 'mantine-navbar'),
    Section: createMockComponent('section', 'mantine-section'),
    Burger: createMockComponent('button', 'mantine-burger'),
    Collapse: createMockComponent('div', 'mantine-collapse'),
    Collapsible: createMockComponent('div', 'mantine-collapsible'),
    MediaQuery: createMockComponent('div', 'mantine-media-query'),
    Overlay: createMockComponent('div', 'mantine-overlay'),
    Portal: createMockComponent('div', 'mantine-portal'),
    Transition: createMockComponent('div', 'mantine-transition'),
    VirtualList: createMockComponent('div', 'mantine-virtual-list'),
    MantineProvider: createMockComponent('div', 'mantine-provider'),
    // Add missing components
    ThemeIcon: createMockComponent('div', 'mantine-theme-icon'),
    Tabs: createMockComponent('div', 'mantine-tabs'),
    ActionIcon: createMockComponent('button', 'mantine-action-icon'),
    Menu: createMockComponent('div', 'mantine-menu'),
    createStyles: vi.fn(() => ({ classes: {}, cx: vi.fn(), theme: {} })),
    keyframes: vi.fn(() => 'mock-keyframes'),
    Global: createMockComponent('style', 'mantine-global'),
    rem: vi.fn(value => `${value}rem`),
    em: vi.fn(value => `${value}em`),
    px: vi.fn(value => `${value}px`),
    getDefaultZIndex: vi.fn(() => 1000),
    getPrimaryShade: vi.fn(() => 6),
    getThemeColor: vi.fn(() => '#000'),
    useMantineTheme: vi.fn(() => ({
      colors: {},
      primaryColor: 'blue',
      primaryShade: 6,
      colorScheme: 'light',
      white: '#fff',
      black: '#000',
      spacing: {},
      breakpoints: {},
      fontSizes: {},
      lineHeights: {},
      radius: {},
      shadows: {},
      other: {},
      datesLocale: 'en',
      loader: 'oval',
      autoContrast: false,
      respectReducedMotion: false,
      cursorType: 'default',
      defaultRadius: 'sm',
      activeClassName: 'mantine-active',
      focusRing: 'auto',
      defaultGradient: { from: 'blue', to: 'cyan', deg: 45 },
      fontFamily: 'sans-serif',
      fontFamilyMonospace: 'monospace',
      headings: { fontFamily: 'sans-serif', fontWeight: 700 },
      dir: 'ltr',
      defaultProps: {},
      components: {},
      globalStyles: undefined,
    })),
    useMantineColorScheme: vi.fn(() => ({
      colorScheme: 'light',
      toggleColorScheme: vi.fn(),
      setColorScheme: vi.fn(),
    })),
    useComputedColorScheme: vi.fn(() => 'light'),
    useMantineCssVariables: vi.fn(() => ({ cssVariables: {} })),
    useMantineProviderStyles: vi.fn(() => ({ classes: {}, cx: vi.fn() })),
    useProps: vi.fn(() => ({})),
    useResolvedStylesApi: vi.fn(() => ({})),
    useStyles: vi.fn(() => ({ classes: {}, cx: vi.fn() })),
    useUncontrolled: vi.fn(() => [undefined, vi.fn()]),
    useUuid: vi.fn(() => 'mock-uuid'),
  };
});

// Zod
vi.mock('zod', () => ({
  z: {
    string: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    number: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    boolean: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    object: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    array: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    union: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    literal: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    enum: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    nativeEnum: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    null: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    undefined: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    void: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    never: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    any: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    unknown: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    date: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    bigint: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    symbol: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    function: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    lazy: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    promise: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    effect: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    preprocess: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    pipe: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    transform: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    refine: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    superRefine: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    optional: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    nullable: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    nullish: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    tuple: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    set: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    map: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    record: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    intersection: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    discriminatedUnion: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    ZodError: class MockZodError extends Error {
      issues: any[];
      constructor(issues: any[]) {
        super('Mock Zod Error');
        this.name = 'ZodError';
        this.issues = issues;
      }
    },
  },
}));

// Next.js Font
vi.mock('next/font/google', () => ({
  Inter: () => ({ style: { fontFamily: 'Inter' }, className: 'inter-font' }),
  Poppins: () => ({ style: { fontFamily: 'Poppins' }, className: 'poppins-font' }),
  Roboto: () => ({ style: { fontFamily: 'Roboto' }, className: 'roboto-font' }),
  Montserrat: () => ({ style: { fontFamily: 'Montserrat' }, className: 'montserrat-font' }),
}));

// HugeIcons - Dynamic mock that preserves icon names with enhanced flexibility
vi.mock('@hugeicons/react', () => {
  const MockIcon = ({
    size = 24,
    color = 'currentColor',
    strokeWidth = 1.5,
    className = '',
    'data-testid': testId,
    'data-icon': iconDataAttr,
    ...props
  }: any) => {
    // Support multiple ways to identify the icon
    const iconName = testId || iconDataAttr || className || 'huge-icon';
    const normalizedName = String(iconName)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');

    return React.createElement('svg', {
      ...props,
      className,
      width: size,
      height: size,
      fill: 'none',
      stroke: color,
      strokeWidth,
      viewBox: '0 0 24 24',
      'data-testid': testId || `huge-icon-${normalizedName}`,
      'data-icon': iconDataAttr || iconName,
      'data-size': size,
      'data-color': color,
      // Add children for more realistic SVG structure
      children: React.createElement('path', {
        d: 'M12 2L2 7L12 12L22 7L12 2Z', // Generic icon path
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
    });
  };

  return new Proxy(
    {},
    {
      get: (target, iconName) => {
        // Return a component that knows its own name and supports dynamic props
        const NamedMockIcon = (props: any) => {
          const normalizedIconName = String(iconName)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-');
          return MockIcon({
            ...props,
            'data-testid': props['data-testid'] || `huge-icon-${normalizedIconName}`,
            'data-icon': props['data-icon'] || String(iconName),
          });
        };

        // Add display name for better debugging
        NamedMockIcon.displayName = `MockIcon(${String(iconName)})`;

        return NamedMockIcon;
      },
    },
  );
});

vi.mock('@hugeicons/core-free-icons', () => {
  return new Proxy(
    {},
    {
      get: () => ({ svg: '<svg data-testid="huge-icon-svg"></svg>' }),
    },
  );
});

// Embla Carousel
vi.mock('embla-carousel-react', () => ({
  default: vi.fn(() => [
    { current: null }, // emblaRef
    {
      scrollNext: vi.fn(),
      scrollPrev: vi.fn(),
      canScrollNext: vi.fn(() => true),
      canScrollPrev: vi.fn(() => false),
    },
  ]),
}));

// Note: Image asset mocking should be handled via Vitest config moduleNameMapper
// This inline approach with RegExp is not supported in current Vitest versions
// Instead, configure this in vitest.config.ts:
//
// export default defineConfig({
//   test: {
//     alias: {
//       '\\.(jpg|jpeg|png|gif|svg|webp)$': '/path/to/image-mock.js'
//     }
//   }
// })

// Utility functions for tests to customize mock behavior
export const mockUtils = {
  // Override image mock for specific tests
  mockImage: (path: string, customProps: any = {}) => {
    const filename = path.split('/').pop() || 'unknown';
    const name = filename.split('.')[0];
    return {
      default: {
        src: customProps.src || `/mock-${filename}`,
        alt: customProps.alt || `Mock ${name}`,
        width: customProps.width || 800,
        height: customProps.height || 600,
        'data-testid': customProps['data-testid'] || `mock-image-${name}`,
        ...customProps,
      },
    };
  },

  // Create component mock with custom testid
  createComponentMock: (tag: string, defaultTestId: string) => {
    return ({ children, 'data-testid': testId, ...props }: any) =>
      React.createElement(
        tag,
        {
          ...props,
          'data-testid': testId || defaultTestId,
        },
        children,
      );
  },

  // Override icon mock for specific icons with dynamic capabilities
  mockIcon: (iconName: string, customProps: any = {}) => {
    return ({
      size = 24,
      color = 'currentColor',
      strokeWidth = 1.5,
      className = '',
      'data-testid': testId,
      'data-icon': iconDataAttr,
      ...props
    }: any) => {
      const normalizedName = iconName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      return React.createElement('svg', {
        ...props,
        ...customProps,
        className: [className, customProps.className].filter(Boolean).join(' '),
        width: size,
        height: size,
        fill: 'none',
        stroke: color,
        strokeWidth,
        viewBox: '0 0 24 24',
        'data-testid': testId || customProps['data-testid'] || `huge-icon-${normalizedName}`,
        'data-icon': iconDataAttr || iconName,
        'data-size': size,
        'data-color': color,
        // Support custom SVG content
        children:
          customProps.children ||
          React.createElement('path', {
            d: customProps.path || 'M12 2L2 7L12 12L22 7L12 2Z',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }),
      });
    };
  },

  // Create dynamic icon library for tests
  createIconLibrary: (icons: Record<string, any> = {}) => {
    return new Proxy(icons, {
      get: (target, iconName) => {
        const customIcon = target[iconName as string];
        if (customIcon) return customIcon;

        // Return dynamic mock for unknown icons
        return mockUtils.mockIcon(String(iconName));
      },
    });
  },

  // Enhanced component mock with more dynamic features
  createDynamicComponent: (tag: string, defaultTestId: string, enhancers: any = {}) => {
    return ({ children, 'data-testid': testId, ...props }: any) => {
      const finalProps = {
        ...props,
        'data-testid': testId || defaultTestId,
        // Apply any prop enhancers
        ...Object.keys(enhancers).reduce((acc, key) => {
          if (typeof enhancers[key] === 'function') {
            acc[key] = enhancers[key](props[key]);
          } else {
            acc[key] = enhancers[key];
          }
          return acc;
        }, {} as any),
      };

      return React.createElement(tag, finalProps, children);
    };
  },
};

// Export all mocks for use in test setup files
export const mantineZodMocks = {
  // This object can be used to access specific mocks if needed
  mantine: {
    hooks: vi.fn(),
    core: vi.fn(),
  },
  zod: vi.fn(),
  utils: mockUtils,
};
