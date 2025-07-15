// Centralized enhanced form mocking utilities for all tests in the monorepo
import '@testing-library/jest-dom';
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
  };
}

/**
 * Enhanced form mock interface
 */
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
 * Default form data for testing
 */
export const mockFormDefaults = {
  brand: {
    name: '',
    slug: '',
    status: 'DRAFT',
    type: 'LABEL',
    copy: {
      description: '',
      metaTitle: '',
      metaDescription: '',
    },
  },
  product: {
    name: '',
    slug: '',
    category: '',
    status: 'DRAFT',
    type: 'PHYSICAL',
    brand: '',
    price: 0,
    currency: 'USD',
  },
  user: {
    name: '',
    email: '',
    role: 'USER',
    status: 'ACTIVE',
  },
  collection: {
    name: '',
    slug: '',
    type: 'MANUAL',
    status: 'DRAFT',
  },
};

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
 * Mock router functions for form navigation
 */
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

/**
 * Common mock data factories
 */
export const mockDataFactories = {
  brand: (overrides: any = {}) => ({
    id: '1',
    name: 'Test Brand',
    slug: 'test-brand',
    type: 'LABEL',
    status: 'PUBLISHED',
    baseUrl: 'https://testbrand.com',
    displayOrder: 1,
    copy: {
      description: 'Test description',
      metaTitle: 'Test Meta Title',
      metaDescription: 'Test Meta Description',
      metaKeywords: 'test, brand',
    },
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      products: 5,
      collections: 3,
    },
    ...overrides,
  }),

  product: (overrides: any = {}) => ({
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    category: 'Test Category',
    status: 'ACTIVE',
    type: 'PHYSICAL',
    brand: 'Test Brand',
    price: 99.99,
    currency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      variants: 3,
      media: 5,
    },
    ...overrides,
  }),

  user: (overrides: any = {}) => ({
    id: 'user_123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  collection: (overrides: any = {}) => ({
    id: '1',
    name: 'Test Collection',
    slug: 'test-collection',
    type: 'MANUAL',
    status: 'PUBLISHED',
    description: 'Test collection description',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      products: 10,
    },
    ...overrides,
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
  Object.values(mockRouter).forEach(fn => fn.mockClear());
}

/**
 * Setup enhanced form mocks for common use cases
 */
export function setupEnhancedFormMocks(formType: keyof typeof mockFormDefaults = 'brand') {
  const mockForm = createMockEnhancedForm({
    values: mockFormDefaults[formType],
  });

  return {
    mockForm,
    mockRouter,
    clearMocks: clearFormMocks,
    states: formStates,
    scenarios: enhancedFormTestScenarios,
    factories: mockDataFactories,
  };
}

// Export everything for easy access
export {
  clearFormMocks as clearMocks,
  createMockEnhancedForm as createMockForm,
  mockDataFactories as dataFactories,
  enhancedFormTestScenarios as formTestScenarios,
};
