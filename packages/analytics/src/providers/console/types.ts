/**
 * Console provider types
 */

export interface ConsoleConfig {
  // Console provider doesn't need configuration
  // All options are optional
  prefix?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  colorize?: boolean;
}

export interface ConsoleOptions {
  // Additional options for console provider
  timestamp?: boolean;
  detailed?: boolean;
}
