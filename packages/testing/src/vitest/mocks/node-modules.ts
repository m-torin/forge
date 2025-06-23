import { vi } from 'vitest';

export function setupNodeModuleMocks(): void {
  // Mock Node.js built-in modules that are not available in browser
  const nodeModules = {
    'node:http': {},
    'node:https': {},
    'node:zlib': {},
    'node:fs': {},
    'node:path': {},
    'node:url': {},
    'node:crypto': {},
    'node:stream': {},
    'node:buffer': {},
    'node:util': {},
    'node:events': {},
    'node:querystring': {},
    'node:os': {},
    'node:child_process': {},
    'node:cluster': {},
    'node:dgram': {},
    'node:dns': {},
    'node:domain': {},
    'node:http2': {},
    'node:net': {},
    'node:perf_hooks': {},
    'node:process': {},
    'node:readline': {},
    'node:repl': {},
    'node:string_decoder': {},
    'node:tls': {},
    'node:tty': {},
    'node:vm': {},
    'node:worker_threads': {},
  };

  // Mock each Node.js module
  Object.entries(nodeModules).forEach(([moduleName, mockModule]) => {
    vi.mock(moduleName, () => mockModule);
  });

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
  if (typeof process.nextTick === 'undefined') {
    process.nextTick = (callback: Function) => setTimeout(callback, 0);
  }
}

export default setupNodeModuleMocks;
