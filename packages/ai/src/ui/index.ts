/**
 * @repo/ai UI utilities
 * Provides both client-side React hooks and server-side RSC utilities
 * Includes lazy loading for better tree shaking
 */

// Lazy-loaded modules for code splitting
export const lazyReact = () => import('./react');
export const lazyServer = () => import('./server');

// Direct exports for immediate use (tree-shakeable)
export * as react from './react';
export * as server from './server';
