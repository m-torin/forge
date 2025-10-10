// Centralized setup is automatically loaded by createNextAppConfig
// Only app-specific mocks should be defined here
import type { PropsWithChildren } from 'react';
import React from 'react';
import { vi } from 'vitest';

// Webapp-specific mocks (only what's unique to webapp)
vi.mock('next/font/google', () => ({
  Poppins: () => ({
    style: { fontFamily: 'Poppins' },
    className: 'poppins-font',
  }),
  Inter: () => ({
    style: { fontFamily: 'Inter' },
    className: 'inter-font',
  }),
}));

// Webapp-specific component mocks
vi.mock('@/components/aside', () => ({
  default: ({ children }: PropsWithChildren) =>
    React.createElement('aside', { 'data-testid': 'aside' }, children),
  useAside: () => ({ open: vi.fn(), close: vi.fn(), isOpen: false }),
  Provider: ({ children }: PropsWithChildren) =>
    React.createElement('div', { 'data-testid': 'aside-provider' }, children),
}));

vi.mock('@/hooks/useThemeMode', () => ({
  useThemeMode: () => ({
    isDarkMode: false,
    toDark: vi.fn(),
    toLight: vi.fn(),
    _toogleDarkMode: vi.fn(),
  }),
}));

vi.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: 'http://localhost:3200',
    NEXT_PUBLIC_NODE_ENV: 'test',
    NEXT_PUBLIC_APP_NAME: 'webapp',
  },
  envError: null,
  safeEnv: () => ({
    NEXT_PUBLIC_BASE_URL: 'http://localhost:3200',
    NEXT_PUBLIC_NODE_ENV: 'test',
    NEXT_PUBLIC_APP_NAME: 'webapp',
    APP_TYPE: 'ecommerce',
  }),
}));

// Mock webapp data files
vi.mock('@/data/data', () => ({
  getCart: vi.fn(() =>
    Promise.resolve({
      lines: [
        {
          id: '1',
          name: 'Test Product 1',
          handle: 'test-product-1',
          price: 99.99,
          image: { src: '/test-product-1.jpg', alt: 'Test Product 1' },
          quantity: 2,
          size: 'M',
          color: 'Red',
        },
      ],
      cost: { subtotal: 199.98, tax: 20.0, shipping: 10.0, total: 229.98 },
    }),
  ),
  collections: [
    {
      id: '1',
      title: 'Summer Collection',
      handle: 'summer-collection',
      image: { src: '/mock-image.jpg', alt: 'Summer Collection' },
      color: 'bg-blue-500',
    },
  ],
  products: [
    {
      id: '1',
      title: 'Test Product 1',
      price: 99.99,
      handle: 'test-product-1',
      image: { src: '/mock-image.jpg', alt: 'Test Product 1' },
      variants: [{ id: '1', size: 'S', color: 'Red', available: true }],
    },
  ],
  TCardProduct: {},
}));

vi.mock('@/data/navigation', () => ({
  navigation: [
    { id: '1', name: 'Home', href: '/', type: undefined },
    { id: '2', name: 'Shop', href: '/shop', type: 'dropdown' },
    { id: '3', name: 'About', href: '/about', type: undefined },
  ],
}));
