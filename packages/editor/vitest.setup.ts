// React testing setup
import '@testing-library/jest-dom';

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock WebSocket for testing
global.WebSocket = class MockWebSocket {
  readyState = 1; // OPEN
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    setTimeout(() => {
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }

  send(data: string) {
    // Mock send functionality
  }

  close() {
    setTimeout(() => {
      if (this.onclose) {
        this.onclose(new CloseEvent('close'));
      }
    }, 0);
  }
} as any;
