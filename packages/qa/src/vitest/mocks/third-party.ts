// Centralized third-party npm package mocks for all tests in the monorepo
// Import this file at the top of your test setup files (before any other imports)
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

// Mantine and Zod mocks are now in separate file: mantine-zod.ts

// Next.js Enhanced Cache Mock for Next.js 15
vi.mock('next/cache', () => {
  // Create a mock cache context that mimics Next.js 15's incrementalCache
  const _mockCacheContext = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    clear: vi.fn(),
  };

  // Enhanced unstable_cache mock that handles the incrementalCache context
  const mockUnstableCache = vi.fn((fn, _keys, _options) => {
    // Return a function that directly calls the original function
    // This bypasses the Next.js cache logic entirely for testing
    return async (...args: any[]) => {
      return await fn(...args);
    };
  });

  // Enhanced revalidateTag mock that handles static generation store context
  const mockRevalidateTag = vi.fn(_tag => {
    // Mock implementation that doesn't require static generation store
    return Promise.resolve();
  });

  // Enhanced revalidatePath mock that handles static generation store context
  const mockRevalidatePath = vi.fn(_path => {
    // Mock implementation that doesn't require static generation store
    return Promise.resolve();
  });

  return {
    unstable_cache: mockUnstableCache,
    revalidateTag: mockRevalidateTag,
    revalidatePath: mockRevalidatePath,
    // Add any other Next.js cache functions that might be needed
    cache: vi.fn(fn => fn),
  };
});

// Next.js Headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    getAll: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
  })),
}));

// Next.js Navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    forward: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Next.js Image
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    _priority,
    fill,
    _sizes,
    className,
    style,
    'data-testid': testId,
    ...props
  }: any) =>
    React.createElement('img', {
      src: typeof src === 'object' ? src.src || src.default : src,
      alt: alt || '',
      className,
      style: fill ? { ...style, position: 'absolute', inset: 0 } : style,
      'data-testid': testId || 'next-image',
      // Filter out Next.js specific props that shouldn't be passed to DOM
      // priority, fill, sizes are Next.js specific and don't go to DOM
      ...Object.fromEntries(
        Object.entries(props).filter(
          ([key]) =>
            ![
              'priority',
              'fill',
              'sizes',
              'loader',
              'quality',
              'placeholder',
              'blurDataURL',
            ].includes(key),
        ),
      ),
    }),
}));

// Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, 'data-testid': testId, ...props }: any) =>
    React.createElement(
      'a',
      {
        href,
        ...props,
        'data-testid': testId || 'next-link',
      },
      children,
    ),
}));

// Server-only
vi.mock('server-only', () => ({}));

// Analytics mocks moved to analytics-monitoring.ts

// Database
vi.mock('@repo/database/prisma', () => ({
  prisma: {
    brand: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  findManyBrandsOrm: vi.fn(),
  countBrandsOrm: vi.fn(),
  findUniqueBrandOrm: vi.fn(),
  createBrandOrm: vi.fn(),
  updateBrandOrm: vi.fn(),
  deleteBrandOrm: vi.fn(),
  restoreBrandOrm: vi.fn(),
  findFirstBrandOrm: vi.fn(),
  updateManyBrandsOrm: vi.fn(),
  upsertBrandOrm: vi.fn(),
  deleteManyBrandsOrm: vi.fn(),
  aggregateBrandsOrm: vi.fn(),
  groupByBrandsOrm: vi.fn(),
  findUniqueProductOrm: vi.fn(),
  findManyProductsOrm: vi.fn(),
  createProductOrm: vi.fn(),
  updateProductOrm: vi.fn(),
  deleteProductOrm: vi.fn(),
  countProductsOrm: vi.fn(),
  findUniqueCollectionOrm: vi.fn(),
  findManyCollectionsOrm: vi.fn(),
  createCollectionOrm: vi.fn(),
  updateCollectionOrm: vi.fn(),
  deleteCollectionOrm: vi.fn(),
  countCollectionsOrm: vi.fn(),
  executeTransaction: vi.fn(fn => fn({})),
}));

// Auth
vi.mock('@repo/auth/server/next', () => ({
  auth: vi.fn(() => Promise.resolve({ user: null, session: null })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
}));

// Email mocks moved to communication.ts

// Notifications mocks moved to communication.ts

// Cloud Storage mocks moved to cloud-services.ts

// Internal module mocks
vi.mock('@/components/products/ProductFormContext', () => ({
  useProductFormContext: vi.fn(() => ({
    form: {
      values: {
        identifiers: {},
        mediaIds: [],
        childrenIds: [],
        brandId: null,
        modelId: null,
      },
      setFieldValue: vi.fn(),
      getFieldProps: vi.fn(),
    },
    isSubmitting: false,
    errors: {},
  })),
}));

// Mock action functions with multiple possible import paths
vi.mock('@/actions/pim3/brands/actions', () => ({
  getBrands: vi.fn(() => Promise.resolve([])),
  getBrandsAction: vi.fn(() =>
    Promise.resolve({ brands: [], limit: 50, page: 1, total: 0, totalPages: 0 }),
  ),
  getBrand: vi.fn(() => Promise.resolve({ id: 'mock-brand', name: 'Mock Brand' })),
  getBrandBySlug: vi.fn(() => Promise.resolve({ id: 'mock-brand', name: 'Mock Brand' })),
  createBrand: vi.fn(() => Promise.resolve({ id: 'new-brand' })),
  updateBrand: vi.fn(() => Promise.resolve({ id: 'updated-brand' })),
  deleteBrand: vi.fn(() => Promise.resolve()),
  restoreBrand: vi.fn(() => Promise.resolve()),
  getBrandTree: vi.fn(() => Promise.resolve([])),
  getBrandsByIds: vi.fn(() => Promise.resolve([])),
  duplicateBrand: vi.fn(() => Promise.resolve({ id: 'duplicated-brand' })),
}));

vi.mock('../../../actions/pim3/brands/actions', () => ({
  getBrands: vi.fn(() => Promise.resolve([])),
  getBrandsAction: vi.fn(() =>
    Promise.resolve({ brands: [], limit: 50, page: 1, total: 0, totalPages: 0 }),
  ),
  getBrand: vi.fn(() => Promise.resolve({ id: 'mock-brand', name: 'Mock Brand' })),
  getBrandBySlug: vi.fn(() => Promise.resolve({ id: 'mock-brand', name: 'Mock Brand' })),
  createBrand: vi.fn(() => Promise.resolve({ id: 'new-brand' })),
  updateBrand: vi.fn(() => Promise.resolve({ id: 'updated-brand' })),
  deleteBrand: vi.fn(() => Promise.resolve()),
  restoreBrand: vi.fn(() => Promise.resolve()),
  getBrandTree: vi.fn(() => Promise.resolve([])),
  getBrandsByIds: vi.fn(() => Promise.resolve([])),
  duplicateBrand: vi.fn(() => Promise.resolve({ id: 'duplicated-brand' })),
}));

vi.mock('@/actions/pim3/models/actions', () => ({
  getModels: vi.fn(() => Promise.resolve([])),
  getModelsAction: vi.fn(() =>
    Promise.resolve({ models: [], limit: 50, page: 1, total: 0, totalPages: 0 }),
  ),
  getModel: vi.fn(() => Promise.resolve({ id: 'mock-model', name: 'Mock Model' })),
  getModelBySlug: vi.fn(() => Promise.resolve({ id: 'mock-model', name: 'Mock Model' })),
  createModel: vi.fn(() => Promise.resolve({ id: 'new-model' })),
  updateModel: vi.fn(() => Promise.resolve({ id: 'updated-model' })),
  deleteModel: vi.fn(() => Promise.resolve()),
  restoreModel: vi.fn(() => Promise.resolve()),
  getModelTree: vi.fn(() => Promise.resolve([])),
  getModelsByIds: vi.fn(() => Promise.resolve([])),
  duplicateModel: vi.fn(() => Promise.resolve({ id: 'duplicated-model' })),
}));

vi.mock('../../../actions/pim3/models/actions', () => ({
  getModels: vi.fn(() => Promise.resolve([])),
  getModelsAction: vi.fn(() =>
    Promise.resolve({ models: [], limit: 50, page: 1, total: 0, totalPages: 0 }),
  ),
  getModel: vi.fn(() => Promise.resolve({ id: 'mock-model', name: 'Mock Model' })),
  getModelBySlug: vi.fn(() => Promise.resolve({ id: 'mock-model', name: 'Mock Model' })),
  createModel: vi.fn(() => Promise.resolve({ id: 'new-model' })),
  updateModel: vi.fn(() => Promise.resolve({ id: 'updated-model' })),
  deleteModel: vi.fn(() => Promise.resolve()),
  restoreModel: vi.fn(() => Promise.resolve()),
  getModelTree: vi.fn(() => Promise.resolve([])),
  getModelsByIds: vi.fn(() => Promise.resolve([])),
  duplicateModel: vi.fn(() => Promise.resolve({ id: 'duplicated-model' })),
}));

// Utility package mocks moved to utilities.ts

// React Swipeable
vi.mock('react-swipeable', () => ({
  useSwipeable: vi.fn(() => ({
    ref: vi.fn(),
  })),
  Swipeable: createDynamicMock('div', 'swipeable'),
}));

// Embla Carousel
vi.mock('embla-carousel-react', () => ({
  default: vi.fn(() => [
    vi.fn(), // emblaRef
    {
      scrollNext: vi.fn(),
      scrollPrev: vi.fn(),
      scrollTo: vi.fn(),
      canScrollNext: vi.fn(() => true),
      canScrollPrev: vi.fn(() => false),
      selectedScrollSnap: vi.fn(() => 0),
      scrollSnapList: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn(),
      destroy: vi.fn(),
    },
  ]),
}));

vi.mock('embla-carousel-autoplay', () => ({
  default: vi.fn(() => ({})),
}));

// RC Slider
vi.mock('rc-slider', () => ({
  default: ({ value, onChange, 'data-testid': testId, ...props }: any) =>
    React.createElement('input', {
      type: 'range',
      value,
      onChange: (e: any) => onChange?.(e.target.value),
      ...props,
      'data-testid': testId || 'rc-slider',
    }),
  Range: ({ value, onChange, 'data-testid': testId, ...props }: any) =>
    React.createElement('div', {
      'data-value': value,
      onClick: onChange ? () => onChange(value) : undefined,
      ...props,
      'data-testid': testId || 'rc-range',
    }),
}));

// React Hot Toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    custom: vi.fn(),
  },
  Toaster: createDynamicMock('div', 'toaster'),
}));

// React Use
vi.mock('react-use', () => ({
  useLocalStorage: vi.fn(() => [null, vi.fn(), vi.fn()]),
  useSessionStorage: vi.fn(() => [null, vi.fn(), vi.fn()]),
  useMedia: vi.fn(() => false),
  useWindowSize: vi.fn(() => ({ width: 1024, height: 768 })),
  useToggle: vi.fn(() => [false, vi.fn()]),
  useCounter: vi.fn(() => [0, { inc: vi.fn(), dec: vi.fn(), reset: vi.fn() }]),
  useDebounce: vi.fn(),
  useThrottle: vi.fn(),
}));

// Helper function to create dynamic mocks
const createDynamicMock = (tag: string, defaultTestId: string, additionalProps?: any) => {
  return ({ children, 'data-testid': testId, ...props }: any) =>
    React.createElement(
      tag,
      {
        ...additionalProps,
        ...props,
        'data-testid': testId || defaultTestId,
      },
      children,
    );
};

// Headless UI components mock
vi.mock('@headlessui/react', () => ({
  Listbox: ({ children, value, onChange, 'data-testid': testId, ...props }: any) =>
    React.createElement(
      'div',
      {
        ...props,
        'data-testid': testId || 'listbox',
        'data-value': value,
      },
      children,
    ),
  ListboxButton: createDynamicMock('button', 'listbox-button'),
  ListboxOptions: createDynamicMock('div', 'listbox-options'),
  ListboxOption: ({ children, value, 'data-testid': testId, ...props }: any) =>
    React.createElement(
      'div',
      {
        ...props,
        'data-testid': testId || 'listbox-option',
        'data-value': value,
      },
      children,
    ),
  Dialog: ({ children, open, 'data-testid': testId, ...props }: any) =>
    open
      ? React.createElement(
          'div',
          {
            ...props,
            'data-testid': testId || 'dialog',
          },
          children,
        )
      : null,
  DialogBackdrop: createDynamicMock('div', 'dialog-backdrop'),
  DialogPanel: createDynamicMock('div', 'dialog-panel'),
  DialogTitle: createDynamicMock('h2', 'dialog-title'),
  Transition: ({ children, show, 'data-testid': testId, ...props }: any) =>
    show !== false
      ? React.createElement(
          'div',
          {
            ...props,
            'data-testid': testId || 'transition',
          },
          children,
        )
      : null,
  TransitionChild: createDynamicMock('div', 'transition-child'),
  Menu: createDynamicMock('div', 'menu'),
  MenuButton: createDynamicMock('button', 'menu-button'),
  MenuItems: createDynamicMock('div', 'menu-items'),
  MenuItem: createDynamicMock('div', 'menu-item'),
  Switch: ({ checked, onChange, 'data-testid': testId, ...props }: any) =>
    React.createElement('button', {
      role: 'switch',
      'aria-checked': checked,
      onClick: () => onChange?.(!checked),
      ...props,
      'data-testid': testId || 'switch',
    }),
  Tab: createDynamicMock('div', 'tab'),
  TabGroup: createDynamicMock('div', 'tab-group'),
  TabList: createDynamicMock('div', 'tab-list', { role: 'tablist' }),
  TabPanel: createDynamicMock('div', 'tab-panel', { role: 'tabpanel' }),
  TabPanels: createDynamicMock('div', 'tab-panels'),
  Disclosure: createDynamicMock('div', 'disclosure'),
  DisclosureButton: createDynamicMock('button', 'disclosure-button'),
  DisclosurePanel: createDynamicMock('div', 'disclosure-panel'),
  RadioGroup: ({ children, value, onChange, 'data-testid': testId, ...props }: any) =>
    React.createElement(
      'div',
      {
        role: 'radiogroup',
        'data-value': value,
        ...props,
        'data-testid': testId || 'radio-group',
      },
      children,
    ),
  RadioGroupOption: ({ children, value, 'data-testid': testId, ...props }: any) =>
    React.createElement(
      'div',
      {
        'data-value': value,
        role: 'radio',
        ...props,
        'data-testid': testId || 'radio-group-option',
      },
      children,
    ),
  RadioGroupLabel: createDynamicMock('label', 'radio-group-label'),
  RadioGroupDescription: createDynamicMock('div', 'radio-group-description'),
  Combobox: ({ children, value, onChange, 'data-testid': testId, ...props }: any) =>
    React.createElement(
      'div',
      {
        ...props,
        'data-testid': testId || 'combobox',
        'data-value': value,
      },
      children,
    ),
  ComboboxInput: ({ 'data-testid': testId, ...props }: any) =>
    React.createElement('input', {
      ...props,
      'data-testid': testId || 'combobox-input',
    }),
  ComboboxButton: createDynamicMock('button', 'combobox-button'),
  ComboboxOptions: createDynamicMock('div', 'combobox-options'),
  ComboboxOption: ({ children, value, 'data-testid': testId, ...props }: any) =>
    React.createElement(
      'div',
      {
        ...props,
        'data-testid': testId || 'combobox-option',
        'data-value': value,
      },
      children,
    ),
  Popover: createDynamicMock('div', 'popover'),
  PopoverButton: createDynamicMock('button', 'popover-button'),
  PopoverPanel: createDynamicMock('div', 'popover-panel'),
  Select: ({ children, value, onChange, 'data-testid': testId, ...props }: any) =>
    React.createElement(
      'select',
      {
        value,
        onChange,
        ...props,
        'data-testid': testId || 'select',
      },
      children,
    ),
  // Legacy/duplicate exports to cover all bases
  useClose: () => vi.fn(),
  DataInteractive: ({ children }: any) => children,
  Radio: ({ children, value, 'data-testid': testId, ...props }: any) =>
    React.createElement(
      'button',
      {
        'data-value': value,
        role: 'radio',
        ...props,
        'data-testid': testId || 'radio',
      },
      children,
    ),
  Field: createDynamicMock('div', 'field'),
  Label: createDynamicMock('label', 'label'),
  Description: createDynamicMock('div', 'description'),
  SwitchGroup: createDynamicMock('div', 'switch-group'),
  SwitchLabel: createDynamicMock('label', 'switch-label'),
}));

// Browser APIs (only in browser/jsdom environments)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  });

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  });
}

// Export all mocks for use in test setup files
export const thirdPartyMocks = {
  // This object can be used to access specific mocks if needed
  nextCache: {
    unstable_cache: vi.fn((fn: any) => fn),
    revalidateTag: vi.fn(),
    revalidatePath: vi.fn(),
  },
  database: vi.fn(),
  auth: vi.fn(),
  notifications: vi.fn(),
};
