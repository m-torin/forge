/**
 * Console provider types for development
 */

export interface ConsoleConfig {
  colors?: boolean;
  depth?: number;
  enabled?: boolean;
  exclude?: string[];

  // Filtering
  include?: string[];

  // Log levels to display
  levels?: ('debug' | 'error' | 'fatal' | 'info' | 'trace' | 'warn')[];
  prefix?: string;

  // Formatting options
  pretty?: boolean;
  timestamp?: boolean;
}

export interface ConsoleOptions {
  // Grouping
  groupCollapsed?: boolean;

  showHidden?: boolean;
  // Stack trace
  stackDepth?: number;

  stderr?: NodeJS.WritableStream;

  // Output streams
  stdout?: NodeJS.WritableStream;
  // Style configuration
  styles?: {
    debug?: string;
    error?: string;
    fatal?: string;
    info?: string;
    prefix?: string;
    timestamp?: string;
    trace?: string;
    warn?: string;
  };
}
