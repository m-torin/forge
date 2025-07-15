/**
 * Next.js specific types for observability
 */

import { ObservabilityConfig, ObservabilityManager } from '../shared/types/types';

export type APIRouteWrapper = <T extends (req: any, context?: any) => any>(handler: T) => T;

export interface EdgeContext {
  ctx?: {
    passThroughOnException: () => void;
    waitUntil: (promise: Promise<any>) => void;
  };
  env?: Record<string, any>;
  request: any;
}

export interface ErrorBoundaryProps extends Record<string, any> {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  isolate?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: (number | string)[];
  resetOnPropsChange?: boolean;
}

export interface ErrorFallbackProps extends Record<string, any> {
  error: Error;
  errorInfo?: ErrorInfo;
  resetError: () => void;
}

// Client-side types
export interface ErrorInfo {
  componentStack?: string;
  digest?: string;
}

export interface NavigationTiming extends PerformanceEntry {
  domContentLoadedEventEnd: number;
  domContentLoadedEventStart: number;
  domInteractive: number;
  loadEventEnd: number;
  loadEventStart: number;
  requestStart: number;
  responseEnd: number;
  responseStart: number;
}

// Middleware types
export interface ObservabilityMiddlewareOptions {
  afterResponse?: (req: any, res: Response) => Promise<void> | void;
  beforeRequest?: (req: any) => Promise<void> | void;
  captureBody?: boolean;
  captureHeaders?: boolean;
  config: ObservabilityConfig;
  skipPaths?: string[];
}

export interface ObservabilityProviderProps extends Record<string, any> {
  children: React.ReactNode;
  config: ObservabilityConfig;
}

export interface PerformanceEntry {
  duration: number;
  entryType: string;
  name: string;
  startTime: number;
}

// Server-side types
export interface RequestContext {
  geo?: {
    city?: string;
    country?: string;
    region?: string;
  };
  headers?: Record<string, string>;
  ip?: string;
  method?: string;
  organizationId?: string;
  pathname?: string;
  requestId: string;
  searchParams?: Record<string, string>;
  sessionId?: string;
  spanId?: string;
  traceId?: string;
  userId?: string;
}

export interface ResourceTiming extends PerformanceEntry {
  decodedBodySize: number;
  encodedBodySize: number;
  initiatorType: string;
  nextHopProtocol: string;
  transferSize: number;
}

export type RSCWrapper = <T extends React.ComponentType<any>>(
  Component: T,
  componentName?: string,
) => T;

// Wrapper types
export type ServerActionWrapper = <T extends (...args: any[]) => any>(
  action: T,
  actionName?: string,
) => T;

export interface ServerTiming {
  description?: string;
  duration: number;
  name: string;
}

export interface UseObservabilityReturn {
  addBreadcrumb: (category: string, message: string, data?: any) => void;
  captureError: (error: Error, context?: any) => void;
  captureMessage: (message: string, level?: 'error' | 'info' | 'warning') => void;
  observability: null | ObservabilityManager;
  startTransaction: (name: string) => any;
}
