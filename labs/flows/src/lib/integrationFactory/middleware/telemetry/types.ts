// telemetry/types.ts
export interface SpanAttributes {
  [key: string]: string | number | boolean | Array<string | number | boolean>;
}

export interface TelemetryOptions {
  enabled?: boolean;
  serviceName?: string;
  serviceVersion?: string;
  environment?: string;
  defaultAttributes?: SpanAttributes;
  shouldSample?: (operation: string) => boolean;
  errorHandler?: (error: Error) => void;
}

export interface Span {
  addAttribute(key: string, value: string | number | boolean): void;
  addEvent(name: string, attributes?: SpanAttributes): void;
  setStatus(status: 'success' | 'error', description?: string): void;
  end(): void;
}

export interface TelemetryProvider {
  createSpan(operation: string, attributes?: SpanAttributes): Span;
  shutdown(): Promise<void>;
}
