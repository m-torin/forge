// logging/types.ts
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  operation: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  error?: Error;
}

export interface LoggerOptions {
  enabled?: boolean;
  level?: LogLevel;
  formatter?: (entry: LogEntry) => string | Record<string, unknown>;
  redactKeys?: string[];
}

export interface Logger {
  log(entry: LogEntry): void | Promise<void>;
  isEnabled(level: LogLevel): boolean;
}
