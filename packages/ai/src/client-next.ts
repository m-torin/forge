/**
 * Client-side AI exports for Next.js
 *
 * This file provides client-side AI functionality specifically for Next.js applications.
 */

'use client';

// Next.js client exports (extends client)
export * from './client';
export * from './components';
export * from './hooks';

// Re-export shared types explicitly to avoid conflicts
export type { ChatMessage } from './shared/types';
