/**
 * Logger-specific types (Pino, Winston)
 */

export interface LogEntry {
  [key: string]: any;
  level: string;
  message: string;
  timestamp?: number | string;
}

export interface LoggerConfig {
  base?: Record<string, any>;
  // Context fields
  defaultMeta?: Record<string, any>;
  destination?: string;
  format?: 'json' | 'pretty' | 'text';

  level: 'debug' | 'error' | 'fatal' | 'info' | 'trace' | 'warn';

  // Redaction
  redact?:
    | string[]
    | {
        censor?: ((value: any) => any) | string;
        paths: string[];
      };
  // Serializers
  serializers?: Record<string, (value: any) => any>;

  timestamp?: (() => string) | boolean;

  // Transport configuration
  transports?: LoggerTransport[];
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
        ignore?: string;
        messageKey?: string;
        translateTime?: boolean | string;
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
