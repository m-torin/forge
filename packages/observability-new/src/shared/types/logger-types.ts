/**
 * Logger-specific types (Pino, Winston)
 */

export interface LoggerConfig {
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  format?: 'json' | 'pretty' | 'text';
  destination?: string;
  timestamp?: boolean | (() => string);
  
  // Transport configuration
  transports?: LoggerTransport[];
  
  // Context fields
  defaultMeta?: Record<string, any>;
  base?: Record<string, any>;
  
  // Serializers
  serializers?: Record<string, (value: any) => any>;
  
  // Redaction
  redact?: string[] | {
    paths: string[];
    censor?: string | ((value: any) => any);
  };
}

export interface LoggerTransport {
  target: string;
  options?: Record<string, any>;
  level?: string;
}

export interface PinoConfig extends LoggerConfig {
  name?: string;
  safe?: boolean;
  prettyPrint?: boolean | {
    colorize?: boolean;
    translateTime?: boolean | string;
    ignore?: string;
    messageKey?: string;
  };
  mixin?: () => Record<string, any>;
  hooks?: {
    logMethod?: (args: any[], method: Function) => void;
  };
}

export interface WinstonConfig extends LoggerConfig {
  exitOnError?: boolean;
  handleExceptions?: boolean;
  handleRejections?: boolean;
  format?: any; // Winston format object
  transports?: any[]; // Winston transport instances
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp?: string | number;
  [key: string]: any;
}