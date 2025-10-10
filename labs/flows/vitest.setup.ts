// For now, we'll use a local mock setup
import '@testing-library/jest-dom';

// Mock React Flow DOM APIs for testing
class MockResizeObserver {
  callback: globalThis.ResizeObserverCallback;

  constructor(callback: globalThis.ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.callback([{ target } as globalThis.ResizeObserverEntry], this);
  }

  unobserve() {}
  disconnect() {}
}

class MockDOMMatrixReadOnly {
  m22: number;
  
  constructor(transform?: string) {
    const scale = transform?.match(/scale\(([1-9.])\)/)?.[1];
    this.m22 = scale !== undefined ? +scale : 1;
  }
}

// Initialize DOM mocks for React Flow
global.ResizeObserver = MockResizeObserver;
// @ts-ignore
global.DOMMatrixReadOnly = MockDOMMatrixReadOnly;

Object.defineProperties(global.HTMLElement.prototype, {
  offsetHeight: {
    get() {
      return parseFloat(this.style.height) || 100;
    }
  },
  offsetWidth: {
    get() {
      return parseFloat(this.style.width) || 100;
    }
  }
});

(global.SVGElement as any).prototype.getBBox = () => ({
  x: 0,
  y: 0,
  width: 100,
  height: 50
});