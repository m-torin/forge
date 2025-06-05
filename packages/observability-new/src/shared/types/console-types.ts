/**
 * Console provider types for development
 */

export interface ConsoleConfig {
  enabled?: boolean;
  prefix?: string;
  timestamp?: boolean;
  colors?: boolean;
  
  // Log levels to display
  levels?: ('trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal')[];
  
  // Formatting options
  pretty?: boolean;
  depth?: number;
  
  // Filtering
  include?: string[];
  exclude?: string[];
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
  
  // Output streams
  stdout?: NodeJS.WritableStream;
  stderr?: NodeJS.WritableStream;
  
  // Grouping
  groupCollapsed?: boolean;
  
  // Stack trace
  stackDepth?: number;
  showHidden?: boolean;
}