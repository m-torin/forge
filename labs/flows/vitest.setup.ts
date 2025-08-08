// Use centralized browser mocks from @repo/qa
import '@testing-library/jest-dom';
import { setupBrowserMocks } from '@repo/qa/vitest/mocks/internal/browser';

// Set up centralized browser mocks (includes ResizeObserver)
setupBrowserMocks();

// React Flow specific DOM API mocks
class MockDOMMatrixReadOnly {
  m22: number;
  
  constructor(transform?: string) {
    const scale = transform?.match(/scale\(([1-9.])\)/)?.[1];
    this.m22 = scale !== undefined ? +scale : 1;
  }
}

// React Flow specific mocks
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