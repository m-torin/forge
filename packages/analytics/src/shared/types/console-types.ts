/**
 * Console provider types
 */

export interface ConsoleConfig {
  options?: {
    prefix?: string;
    enableColors?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    pretty?: boolean;
  };
}

export type ConsoleOptions = Record<string, any>;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
