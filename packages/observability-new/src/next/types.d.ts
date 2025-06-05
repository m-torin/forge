/**
 * Next.js specific types for observability
 */

import type { ObservabilityManager, ObservabilityConfig } from '../shared/types/types';

// Client-side types
export interface ErrorInfo {
  componentStack?: string;
  digest?: string;
}

export interface ErrorBoundaryProps {
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  children: React.ReactNode;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorInfo?: ErrorInfo;
}

export interface ObservabilityProviderProps {
  config: ObservabilityConfig;
  children: React.ReactNode;
}

export interface UseObservabilityReturn {
  observability: ObservabilityManager | null;
  captureError: (error: Error, context?: any) => void;
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error') => void;
  addBreadcrumb: (category: string, message: string, data?: any) => void;
  startTransaction: (name: string) => any;
}

export interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
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

export interface ResourceTiming extends PerformanceEntry {
  initiatorType: string;
  nextHopProtocol: string;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
}

// Server-side types
export interface RequestContext {
  requestId: string;
  userId?: string;
  organizationId?: string;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
  pathname?: string;
  searchParams?: Record<string, string>;
  headers?: Record<string, string>;
  method?: string;
  ip?: string;
  geo?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface ServerTiming {
  name: string;
  duration: number;
  description?: string;
}

export interface EdgeContext {
  request: Request;
  env?: Record<string, any>;
  ctx?: {
    waitUntil: (promise: Promise<any>) => void;
    passThroughOnException: () => void;
  };
}

// Middleware types
export interface ObservabilityMiddlewareOptions {
  config: ObservabilityConfig;
  skipPaths?: string[];
  captureHeaders?: boolean;
  captureBody?: boolean;
  beforeRequest?: (req: Request) => void | Promise<void>;
  afterResponse?: (req: Request, res: Response) => void | Promise<void>;
}

// Wrapper types
export type ServerActionWrapper = <T extends (...args: any[]) => any>(
  action: T,
  actionName?: string
) => T;

export type APIRouteWrapper = <T extends (req: Request, context?: any) => any>(
  handler: T
) => T;

export type RSCWrapper = <T extends React.ComponentType<any>>(
  Component: T,
  componentName?: string
) => T;