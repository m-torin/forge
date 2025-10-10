// Centralized enhanced form mocking utilities for all tests in the monorepo
import '@testing-library/jest-dom';
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
  };
}

// Enhanced form interface and utilities have been moved to @repo/qa/vitest/mocks/packages/mantine
// Import from there: import { MockEnhancedForm, createMockEnhancedForm, formStates } from '@repo/qa/vitest/mocks/packages/mantine'

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

// Enhanced form mock creation has been moved to @repo/qa/vitest/mocks/packages/mantine
// Import from there: import { createMockEnhancedForm } from '@repo/qa/vitest/mocks/packages/mantine'

// Form state helpers have been moved to @repo/qa/vitest/mocks/packages/mantine
// Import from there: import { formStates } from '@repo/qa/vitest/mocks/packages/mantine'

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

// Enhanced form test scenarios have been moved to @repo/qa/vitest/mocks/packages/mantine
// Import from there: import { enhancedFormTestScenarios } from '@repo/qa/vitest/mocks/packages/mantine'

// Form mock clearing has been moved to @repo/qa/vitest/mocks/packages/mantine
// Import from there: import { clearFormMocks } from '@repo/qa/vitest/mocks/packages/mantine'

/**
 * Setup enhanced form mocks for common use cases
 * Note: Enhanced form utilities have been moved to @repo/qa/vitest/mocks/packages/mantine
 */
export function setupEnhancedFormMocks(formType: keyof typeof mockFormDefaults = 'brand') {
  // Import the enhanced form utilities from mantine package
  const {
    createMockEnhancedForm,
    formStates,
    enhancedFormTestScenarios,
    clearFormMocks,
  } = require('@repo/qa/vitest/mocks/packages/mantine');

  const mockForm = createMockEnhancedForm({
    values: mockFormDefaults[formType],
  });

  return {
    mockForm,
    mockRouter,
    clearMocks: () => {
      clearFormMocks();
      Object.values(mockRouter).forEach(fn => fn.mockClear());
    },
    states: formStates,
    scenarios: enhancedFormTestScenarios,
    factories: mockDataFactories,
  };
}

// Export everything for easy access
// Note: Enhanced form utilities have been moved to @repo/qa/vitest/mocks/packages/mantine
export { mockDataFactories as dataFactories };

// Re-export from mantine package for backward compatibility
export {
  clearFormMocks,
  createMockEnhancedForm,
  enhancedFormTestScenarios,
  formStates,
} from '../packages/mantine';
export type { MockEnhancedForm } from '../packages/mantine';

// Keep legacy aliases for backward compatibility
export {
  clearFormMocks as clearMocks,
  createMockEnhancedForm as createMockForm,
  enhancedFormTestScenarios as formTestScenarios,
} from '../packages/mantine';
