/**
 * Console provider types for development
 */

export interface ConsoleConfig {
  colors?: boolean;
  enabled?: boolean;
  prefix?: string;
  timestamp?: boolean;

  // Log levels to display
  levels?: ('trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal')[];

  depth?: number;
  // Formatting options
  pretty?: boolean;

  exclude?: string[];
  // Filtering
  include?: string[];
}

export interface ConsoleOptions {
  // Style configuration
  styles?: {
    trace?: string;
    debug?: string;
    info?: string;
    warn?: string;
    error?: string;
    fatal?: string;
    timestamp?: string;
    prefix?: string;
  };

  stderr?: NodeJS.WritableStream;
  // Output streams
  stdout?: NodeJS.WritableStream;

  // Grouping
  groupCollapsed?: boolean;

  showHidden?: boolean;
  // Stack trace
  stackDepth?: number;
}
