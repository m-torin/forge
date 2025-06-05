export interface StreamingConfig {
  bufferSize?: number;
  enableCompression?: boolean;
  flushInterval?: number;
}

export interface StreamEvent {
  data?: any;
  error?: Error;
  timestamp: number;
  type: 'start' | 'chunk' | 'end' | 'error';
}

export interface StreamController {
  abort(): void;
  pause(): void;
  resume(): void;
}
