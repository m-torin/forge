/**
 * Next.js specific types for observability
 */

import type { ObservabilityConfig, ObservabilityManager } from '../shared/types/types';

// Client-side types
export interface ErrorInfo {
  componentStack?: string;
  digest?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  isolate?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: (string | number)[];
  resetOnPropsChange?: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo?: ErrorInfo;
  resetError: () => void;
}

export interface ObservabilityProviderProps {
  children: React.ReactNode;
  config: ObservabilityConfig;
}

export interface UseObservabilityReturn {
  addBreadcrumb: (category: string, message: string, data?: any) => void;
  captureError: (error: Error, context?: any) => void;
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error') => void;
  observability: ObservabilityManager | null;
  startTransaction: (name: string) => any;
}

export interface PerformanceEntry {
  duration: number;
  entryType: string;
  name: string;
  startTime: number;
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
  decodedBodySize: number;
  encodedBodySize: number;
  initiatorType: string;
  nextHopProtocol: string;
  transferSize: number;
}

// Server-side types
export interface RequestContext {
  geo?: {
    country?: string;
    region?: string;
    city?: string;
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

export interface ServerTiming {
  description?: string;
  duration: number;
  name: string;
}

export interface EdgeContext {
  ctx?: {
    waitUntil: (promise: Promise<any>) => void;
    passThroughOnException: () => void;
  };
  env?: Record<string, any>;
  request: Request;
}

// Middleware types
export interface ObservabilityMiddlewareOptions {
  afterResponse?: (req: Request, res: Response) => void | Promise<void>;
  beforeRequest?: (req: Request) => void | Promise<void>;
  captureBody?: boolean;
  captureHeaders?: boolean;
  config: ObservabilityConfig;
  skipPaths?: string[];
}

// Wrapper types
export type ServerActionWrapper = <T extends (...args: any[]) => any>(
  action: T,
  actionName?: string,
) => T;

export type APIRouteWrapper = <T extends (req: Request, context?: any) => any>(handler: T) => T;

export type RSCWrapper = <T extends React.ComponentType<any>>(
  Component: T,
  componentName?: string,
) => T;
