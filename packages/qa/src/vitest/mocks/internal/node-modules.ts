import { vi } from 'vitest';

export function setupNodeModuleMocks(): void {
  // Mock global Buffer if not available
  if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = {
      from: vi.fn(),
      alloc: vi.fn(),
      allocUnsafe: vi.fn(),
      isBuffer: vi.fn(),
    } as any;
  }

  // Mock process.nextTick if not available
  if (typeof process?.nextTick === 'undefined' && typeof process !== 'undefined') {
    process.nextTick = (callback: Function) => setTimeout(callback, 0);
  }
}

export default setupNodeModuleMocks;
