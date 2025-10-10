/**
 * Sentry tracing type definitions
 */

/**
 * Transaction context for starting a new transaction
 */
export interface TransactionContext {
  name: string;
  op?: string;
  tags?: Record<string, string>;
  data?: Record<string, any>;
  startTimestamp?: number;
  parentSpanId?: string;
  parentSampled?: boolean;
  trimEnd?: boolean;
  metadata?: {
    source?: "custom" | "route" | "url";
    [key: string]: any;
  };
}

/**
 * Span context for creating child spans
 */
export interface SpanContext {
  name: string;
  op?: string;
  description?: string;
  tags?: Record<string, string>;
  data?: Record<string, any>;
  startTimestamp?: number;
  status?: SpanStatus;
  origin?: string;
  attributes?: Record<string, any>;
}

/**
 * Span status values
 */
export type SpanStatus =
  | "ok"
  | "cancelled"
  | "internal_error"
  | "invalid_argument"
  | "deadline_exceeded"
  | "not_found"
  | "already_exists"
  | "permission_denied"
  | "resource_exhausted"
  | "failed_precondition"
  | "aborted"
  | "out_of_range"
  | "unimplemented"
  | "unavailable"
  | "data_loss"
  | "unauthenticated";

/**
 * Transaction interface
 */
export interface Transaction {
  name: string;
  spanId: string;
  traceId: string;
  startTimestamp: number;
  tags: Record<string, string>;
  data: Record<string, any>;

  // Methods
  setName(name: string): void;
  setTag(key: string, value: string | number | boolean | null): void;
  setData(key: string, value: any): void;
  setStatus(status: SpanStatus): void;
  setHttpStatus(httpStatus: number): void;
  setMeasurement(name: string, value: number, unit?: string): void;
  finish(endTimestamp?: number): void;
  startChild(spanContext?: SpanContext): Span;
  toTraceparent(): string;
  toContext(): TransactionContext;
}

/**
 * Span interface
 */
export interface Span {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  op?: string;
  description?: string;
  startTimestamp: number;
  tags: Record<string, string>;
  data: Record<string, any>;

  // Methods
  setTag(key: string, value: string | number | boolean | null): void;
  setData(key: string, value: any): void;
  setStatus(status: SpanStatus): void;
  setHttpStatus(httpStatus: number): void;
  finish(endTimestamp?: number): void;
  startChild(spanContext?: SpanContext): Span;
  isRecording(): boolean;
}

/**
 * Scope interface for managing context
 */
export interface Scope {
  setTag(key: string, value: string | number | boolean | null): void;
  setTags(tags: Record<string, string | number | boolean | null>): void;
  setContext(key: string, context: Record<string, any> | null): void;
  setUser(user: Record<string, any> | null): void;
  setLevel(level: SeverityLevel): void;
  setFingerprint(fingerprint: string[]): void;
  setRequestSession(requestSession?: RequestSession): void;
  setPropagationContext(context: PropagationContext): void;
  clear(): void;
  addBreadcrumb(breadcrumb: Breadcrumb, maxBreadcrumbs?: number): void;
  clearBreadcrumbs(): void;
  setSpan(span: Span | undefined): void;
  getSpan(): Span | undefined;
  setTransaction(transaction: Transaction | undefined): void;
  getTransaction(): Transaction | undefined;
}

/**
 * Hub interface for managing scopes and clients
 */
export interface Hub {
  getClient(): any;
  getScope(): Scope;
  configureScope(callback: (scope: Scope) => void): void;
  pushScope(): Scope;
  popScope(): boolean;
  withScope(callback: (scope: Scope) => void): void;
  startTransaction(
    context: TransactionContext,
    customSamplingContext?: any,
  ): Transaction;
  startSpan(context: SpanContext): Span;
}

/**
 * Propagation context for distributed tracing
 */
export interface PropagationContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  sampled?: boolean;
  dsc?: DynamicSamplingContext;
}

/**
 * Dynamic sampling context
 */
export interface DynamicSamplingContext {
  trace_id: string;
  public_key: string;
  sample_rate?: string;
  release?: string;
  environment?: string;
  transaction?: string;
  user_segment?: string;
  [key: string]: string | undefined;
}

/**
 * Traceparent data extracted from headers
 */
export interface TraceparentData {
  traceId?: string;
  parentSpanId?: string;
  parentSampled?: boolean;
  baggage?: Record<string, string>;
}

/**
 * Breadcrumb interface
 */
export interface Breadcrumb {
  type?: string;
  level?: SeverityLevel;
  category?: string;
  message?: string;
  data?: Record<string, any>;
  timestamp?: number;
}

/**
 * Severity levels
 */
export type SeverityLevel =
  | "fatal"
  | "error"
  | "warning"
  | "log"
  | "info"
  | "debug";

/**
 * Request session status
 */
export interface RequestSession {
  status?: "ok" | "errored" | "crashed";
}

/**
 * Sampling context for trace sampling decisions
 */
export interface SamplingContext {
  transactionContext: TransactionContext;
  parentSampled?: boolean;
  request?: any;
  location?: Location;
}

/**
 * Custom sampling function type
 */
export type TraceSampler = (
  samplingContext: SamplingContext,
) => number | boolean;

/**
 * Measurement units
 */
export type MeasurementUnit =
  | "nanosecond"
  | "microsecond"
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "bit"
  | "byte"
  | "kilobyte"
  | "kibibyte"
  | "megabyte"
  | "mebibyte"
  | "gigabyte"
  | "gibibyte"
  | "terabyte"
  | "tebibyte"
  | "petabyte"
  | "pebibyte"
  | "exabyte"
  | "exbibyte"
  | "ratio"
  | "percent"
  | "none";
