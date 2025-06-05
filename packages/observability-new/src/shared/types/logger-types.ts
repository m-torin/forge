/**
 * Logger-specific types (Pino, Winston)
 */

export interface LoggerConfig {
  destination?: string;
  format?: 'json' | 'pretty' | 'text';
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  timestamp?: boolean | (() => string);

  // Transport configuration
  transports?: LoggerTransport[];

  base?: Record<string, any>;
  // Context fields
  defaultMeta?: Record<string, any>;

  // Serializers
  serializers?: Record<string, (value: any) => any>;

  // Redaction
  redact?:
    | string[]
    | {
        paths: string[];
        censor?: string | ((value: any) => any);
      };
}

export interface LoggerTransport {
  level?: string;
  options?: Record<string, any>;
  target: string;
}

export interface PinoConfig extends LoggerConfig {
  hooks?: {
    logMethod?: (args: any[], method: (...args: any[]) => any) => void;
  };
  mixin?: () => Record<string, any>;
  name?: string;
  prettyPrint?:
    | boolean
    | {
        colorize?: boolean;
        translateTime?: boolean | string;
        ignore?: string;
        messageKey?: string;
      };
  safe?: boolean;
}

export interface WinstonConfig extends LoggerConfig {
  exitOnError?: boolean;
  format?: any; // Winston format object
  handleExceptions?: boolean;
  handleRejections?: boolean;
  transports?: any[]; // Winston transport instances
}

export interface LogEntry {
  [key: string]: any;
  level: string;
  message: string;
  timestamp?: string | number;
}
