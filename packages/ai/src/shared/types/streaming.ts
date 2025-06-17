export interface StreamController {
  abort(): void;
  pause(): void;
  resume(): void;
}

export interface StreamEvent {
  data?: any;
  error?: Error;
  timestamp: number;
  type: 'chunk' | 'end' | 'error' | 'start';
}

export interface StreamingConfig {
  bufferSize?: number;
  enableCompression?: boolean;
  flushInterval?: number;
}
