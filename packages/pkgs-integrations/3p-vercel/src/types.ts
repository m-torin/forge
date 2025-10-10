/**
 * Vercel Analytics specific types
 */

import type { BaseProviderConfig } from '@repo/3p-core/types';

export interface VercelConfig extends BaseProviderConfig {
  provider: 'vercel';
  // Optional configuration
  debug?: boolean;
  mode?: 'auto' | 'production' | 'development';
  beforeSend?: (event: BeforeSendEvent) => BeforeSendEvent | null;
  endpoint?: string;
  scriptSrc?: string;
}

// Official Vercel Analytics types based on documentation
export interface BeforeSendEvent {
  url: string;
  name?: string;
  data?: Record<string, any>;
}

export interface VercelEvent {
  name: string;
  href?: string;
  value?: number;
  speed?: string;
  data?: Record<string, any>;
}

export interface VercelWebVitalsMetric {
  name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  entries?: PerformanceEntry[];
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
}

// Component props for React/Next.js
export interface AnalyticsProps {
  debug?: boolean;
  mode?: 'auto' | 'production' | 'development';
  beforeSend?: (event: BeforeSendEvent) => BeforeSendEvent | null;
  endpoint?: string;
  scriptSrc?: string;
}

// Legacy naming for backwards compatibility
export interface VercelAnalyticsConfig extends VercelConfig {}
export interface VercelAnalyticsEvent extends VercelEvent {}
export interface VercelPageViewEvent {
  url: string;
  referrer?: string;
  timestamp?: number;
}
