// React testing setup
import { setupBrowserMocks } from "@repo/qa/vitest/setup/browser";
import "@testing-library/jest-dom";

// Setup centralized browser mocks (includes matchMedia, ResizeObserver, etc.)
setupBrowserMocks();

// Mock WebSocket for testing (package-specific)
global.WebSocket = class MockWebSocket {
  readyState = 1; // OPEN
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    setTimeout(() => {
      if (this.onopen) {
        this.onopen(new Event("open"));
      }
    }, 0);
  }

  send(data: string) {
    // Mock send functionality
  }

  close() {
    setTimeout(() => {
      if (this.onclose) {
        this.onclose(new CloseEvent("close"));
      }
    }, 0);
  }
} as any;
