import { vi } from 'vitest';

export interface MockWebSocketOptions {
  autoConnect?: boolean;
  latency?: number;
  shouldFailConnection?: boolean;
}

export class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url: string;
  readyState: number;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  private options: MockWebSocketOptions;
  private messageQueue: any[] = [];

  constructor(url: string, protocols?: string | string[], options: MockWebSocketOptions = {}) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
    this.options = {
      autoConnect: true,
      latency: 0,
      shouldFailConnection: false,
      ...options,
    };

    if (this.options.autoConnect) {
      this.simulateConnection();
    }
  }

  send = vi.fn((data: string | ArrayBuffer | Blob | ArrayBufferView) => {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }

    // Simulate message being sent with latency
    setTimeout(() => {
      this.messageQueue.push(data);
    }, this.options.latency || 0);
  });

  close = vi.fn((code?: number, reason?: string) => {
    if (this.readyState === MockWebSocket.CLOSED || this.readyState === MockWebSocket.CLOSING) {
      return;
    }

    this.readyState = MockWebSocket.CLOSING;

    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      if (this.onclose) {
        this.onclose(new CloseEvent('close', { code, reason }));
      }
    }, this.options.latency || 0);
  });

  // Test utilities
  simulateConnection() {
    setTimeout(() => {
      if (this.options.shouldFailConnection) {
        this.simulateError();
        return;
      }

      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, this.options.latency || 0);
  }

  simulateMessage(data: any) {
    if (this.readyState !== MockWebSocket.OPEN) {
      return;
    }

    setTimeout(() => {
      if (this.onmessage) {
        const event = new MessageEvent('message', {
          data: typeof data === 'string' ? data : JSON.stringify(data),
        });
        this.onmessage(event);
      }
    }, this.options.latency || 0);
  }

  simulateClose(code = 1000, reason = 'Normal closure') {
    if (this.readyState === MockWebSocket.CLOSED) {
      return;
    }

    this.readyState = MockWebSocket.CLOSING;

    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      if (this.onclose) {
        this.onclose(new CloseEvent('close', { code, reason }));
      }
    }, this.options.latency || 0);
  }

  simulateError(_error?: string) {
    setTimeout(() => {
      if (this.onerror) {
        this.onerror(new Event('error'));
      }

      // If connection failed, also trigger close
      if (this.readyState === MockWebSocket.CONNECTING) {
        this.readyState = MockWebSocket.CLOSED;
        if (this.onclose) {
          this.onclose(new CloseEvent('close', { code: 1006, reason: 'Connection failed' }));
        }
      }
    }, this.options.latency || 0);
  }

  // Getters for test inspection
  get sentMessages() {
    return this.send.mock.calls.map(call => call[0]);
  }

  get messageCount() {
    return this.send.mock.calls.length;
  }

  // Reset mock for testing
  resetMock() {
    this.send.mockReset();
    this.close.mockReset();
    this.messageQueue = [];
    this.readyState = MockWebSocket.CONNECTING;
  }
}

// Factory for creating mock WebSocket instances
export function createMockWebSocket(options: MockWebSocketOptions = {}) {
  return (url: string, protocols?: string | string[]) => new MockWebSocket(url, protocols, options);
}

// Global mock setup
export function setupWebSocketMock(options: MockWebSocketOptions = {}) {
  const OriginalWebSocket = global.WebSocket;

  return {
    setup: () => {
      global.WebSocket = createMockWebSocket(options) as any;
    },
    teardown: () => {
      global.WebSocket = OriginalWebSocket;
    },
  };
}
