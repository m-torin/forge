/**
 * Edge Runtime setup for Vitest
 * This file provides edge runtime environment simulation and polyfills
 */

import { afterEach, beforeEach, vi } from 'vitest';
import { CONSOLE_PRESETS, setupConsoleSuppression } from '../utils/console';

// Edge runtime environment setup
beforeEach(() => {
  // Set edge runtime environment variables
  process.env.NODE_ENV = 'test';
  process.env.NEXT_RUNTIME = 'edge';
  process.env.VERCEL_ENV = 'development';
  process.env.VITEST_EDGE_RUNTIME = 'true';

  // Setup edge runtime polyfills
  setupEdgeRuntimePolyfills();

  // Setup edge runtime mocks
  setupEdgeRuntimeMocks();

  // Mock console to reduce noise
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  // Restore all mocks
  vi.restoreAllMocks();
  vi.unstubAllGlobals();

  // Clean up edge runtime globals
  cleanupEdgeRuntimeGlobals();
});

// Apply edge runtime console suppression
setupConsoleSuppression(CONSOLE_PRESETS.edge);

/**
 * Setup edge runtime polyfills
 */
function setupEdgeRuntimePolyfills() {
  // Buffer polyfill for edge runtime - create a proper constructor function
  if (typeof globalThis.Buffer === 'undefined') {
    // Create a proper Buffer constructor that extends Uint8Array
    function BufferPolyfill(this: any, ...args: any[]) {
      if (args.length === 0) {
        return new Uint8Array(0);
      }
      if (typeof args[0] === 'string') {
        return new TextEncoder().encode(args[0]);
      }
      if (typeof args[0] === 'number') {
        return new Uint8Array(args[0]);
      }
      return new Uint8Array(args[0]);
    }

    // Add static methods
    BufferPolyfill.from = (str: any) => {
      if (typeof str === 'string') {
        return new TextEncoder().encode(str);
      }
      return new Uint8Array(str);
    };

    BufferPolyfill.isBuffer = (obj: any) => {
      return obj instanceof Uint8Array;
    };

    BufferPolyfill.alloc = (size: number) => {
      return new Uint8Array(size);
    };

    BufferPolyfill.concat = (buffers: Uint8Array[]) => {
      const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const buf of buffers) {
        result.set(buf, offset);
        offset += buf.length;
      }
      return result;
    };

    // Set as global
    globalThis.Buffer = BufferPolyfill as any;
  }

  // Process polyfill for edge runtime - ensure it's always available
  const edgeProcess = {
    env: {
      NODE_ENV: 'test',
      NEXT_RUNTIME: 'edge',
      VERCEL_ENV: 'development',
      VITEST_EDGE_RUNTIME: 'true',
    },
    nextTick: (fn: VoidFunction) => queueMicrotask(fn),
    platform: 'linux' as any,
    version: 'v22.0.0',
    versions: {
      node: '22.0.0',
      v8: '12.0.0',
      uv: '1.0.0',
      zlib: '1.0.0',
      brotli: '1.0.0',
      ares: '1.0.0',
      modules: '120',
      nghttp2: '1.0.0',
      napi: '9',
      llhttp: '9.0.0',
      openssl: '3.0.0',
      cldr: '43.0.0',
      icu: '73.1',
      tz: '2023c',
      unicode: '15.0',
    },
    cwd: () => '/',
    hrtime: Object.assign(() => [0, 0] as [number, number], { bigint: () => BigInt(0) }) as any,
    memoryUsage: () => ({
      rss: 0,
      heapTotal: 0,
      heapUsed: 0,
      external: 0,
      arrayBuffers: 0,
    }),
    uptime: () => 0,
    exit: (code?: number) => {
      // Mock exit to prevent actual process termination
      console.warn('process.exit() called in edge runtime with code:', code);
    },
    kill: () => true,
    pid: 1,
    ppid: 0,
    arch: 'x64',
    // Add event emitter capabilities for compatibility
    on: () => edgeProcess,
    once: () => edgeProcess,
    off: () => edgeProcess,
    emit: () => false,
    listeners: () => [],
    removeAllListeners: () => edgeProcess,
  } as any;

  // Always set the process polyfill, even if it exists
  globalThis.process = edgeProcess;

  // Global polyfill for edge runtime
  if (typeof globalThis.global === 'undefined') {
    globalThis.global = globalThis;
  }

  // __dirname and __filename polyfills
  if (typeof globalThis.__dirname === 'undefined') {
    globalThis.__dirname = '/';
  }
  if (typeof globalThis.__filename === 'undefined') {
    globalThis.__filename = '/index.js';
  }

  // Web Streams polyfills (if needed)
  if (typeof globalThis.ReadableStream === 'undefined') {
    globalThis.ReadableStream = class ReadableStream {
      locked = false;
      constructor(source?: any) {
        // Minimal polyfill for testing
      }

      getReader() {
        return {
          read: () => Promise.resolve({ done: true, value: undefined }),
          cancel: () => Promise.resolve(),
          closed: Promise.resolve(),
        };
      }

      cancel() {
        return Promise.resolve();
      }

      pipeThrough(transform: any) {
        return transform.readable;
      }

      pipeTo(dest: any) {
        return Promise.resolve();
      }

      tee() {
        return [this, this];
      }
    } as any;
  }

  if (typeof globalThis.WritableStream === 'undefined') {
    globalThis.WritableStream = class WritableStream {
      locked = false;
      constructor(sink?: any) {
        // Minimal polyfill for testing
      }

      getWriter() {
        return {
          write: (chunk: any) => Promise.resolve(),
          close: () => Promise.resolve(),
          abort: () => Promise.resolve(),
          closed: Promise.resolve(),
        };
      }

      abort() {
        return Promise.resolve();
      }

      close() {
        return Promise.resolve();
      }
    } as any;
  }

  if (typeof globalThis.TransformStream === 'undefined') {
    globalThis.TransformStream = class TransformStream {
      constructor(transformer?: any) {
        // Minimal polyfill for testing
      }

      readable: ReadableStream = new ReadableStream();
      writable: WritableStream = new WritableStream();
    };
  }

  // Web Crypto polyfill (if needed)
  if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = {
      randomUUID: () => {
        // Generate a proper UUID format
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c == 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      },
      getRandomValues: (array: any) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      },
      subtle: {
        encrypt: vi.fn(),
        decrypt: vi.fn(),
        sign: vi.fn(),
        verify: vi.fn(),
        digest: vi.fn(),
        generateKey: vi.fn(),
        importKey: vi.fn(),
        exportKey: vi.fn(),
        deriveKey: vi.fn(),
        deriveBits: vi.fn(),
        wrapKey: vi.fn(),
        unwrapKey: vi.fn(),
      },
    } as any;
  }
}

/**
 * Setup edge runtime mocks
 */
function setupEdgeRuntimeMocks() {
  // Mock Node.js modules that don't exist in edge runtime
  const nodeModuleMocks = {
    fs: {},
    path: {
      join: (...args: string[]) => args.join('/'),
      resolve: (...args: string[]) => args.join('/'),
      dirname: (path: string) => path.split('/').slice(0, -1).join('/'),
      basename: (path: string) => path.split('/').pop() || '',
      extname: (path: string) => {
        const parts = path.split('.');
        return parts.length > 1 ? '.' + parts.pop() : '';
      },
      normalize: (path: string) => path,
      isAbsolute: (path: string) => path.startsWith('/'),
      relative: (from: string, to: string) => to,
      sep: '/',
      delimiter: ':',
      posix: {},
      win32: {},
    },
    os: {
      platform: () => 'edge',
      arch: () => 'x64',
      release: () => '1.0.0',
      type: () => 'Edge',
      hostname: () => 'edge-runtime',
      tmpdir: () => '/tmp',
      homedir: () => '/home',
      cpus: () => [
        { model: 'Edge CPU', speed: 2400, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } },
      ],
      totalmem: () => 1024 * 1024 * 1024,
      freemem: () => 512 * 1024 * 1024,
      loadavg: () => [0.1, 0.2, 0.3],
      uptime: () => 3600,
      networkInterfaces: () => ({}),
    },
    crypto: globalThis.crypto,
    util: {
      format: (f: string, ...args: any[]) => f.replace(/%[sdj%]/g, () => String(args.shift())),
      inspect: (obj: any) => JSON.stringify(obj, null, 2),
      isDeepStrictEqual: (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b),
      promisify:
        (fn: Function) =>
        (...args: any[]) =>
          Promise.resolve(fn(...args)),
      callbackify:
        (fn: Function) =>
        (...args: any[]) => {
          const callback = args.pop();
          fn(...args)
            .then((result: any) => callback(null, result))
            .catch(callback);
        },
    },
    events: {
      EventEmitter: class EventEmitter {
        private events: Map<string, Function[]> = new Map();

        on(event: string, listener: Function) {
          if (!this.events.has(event)) {
            this.events.set(event, []);
          }
          this.events.get(event)!.push(listener);
          return this;
        }

        off(event: string, listener: Function) {
          const listeners = this.events.get(event);
          if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
              listeners.splice(index, 1);
            }
          }
          return this;
        }

        emit(event: string, ...args: any[]) {
          const listeners = this.events.get(event);
          if (listeners) {
            listeners.forEach(listener => listener(...args));
            return true;
          }
          return false;
        }

        once(event: string, listener: Function) {
          const onceWrapper = (...args: any[]) => {
            this.off(event, onceWrapper);
            listener(...args);
          };
          this.on(event, onceWrapper);
          return this;
        }
      },
    },
    stream: {
      Readable: class Readable {
        readable: boolean = true;
        destroyed: boolean = false;

        read() {}
        pipe() {
          return this;
        }
        unpipe() {
          return this;
        }
        on() {
          return this;
        }
        once() {
          return this;
        }
        off() {
          return this;
        }
        emit() {
          return false;
        }
        pause() {
          return this;
        }
        resume() {
          return this;
        }
        destroy() {
          this.destroyed = true;
        }
      },
      Writable: class Writable {
        writable: boolean = true;
        destroyed: boolean = false;

        write() {
          return true;
        }
        end() {}
        on() {
          return this;
        }
        once() {
          return this;
        }
        off() {
          return this;
        }
        emit() {
          return false;
        }
        destroy() {
          this.destroyed = true;
        }
      },
      Transform: class Transform {
        readable: boolean = true;
        writable: boolean = true;
        destroyed: boolean = false;

        _transform() {}
        write() {
          return true;
        }
        read() {}
        pipe() {
          return this;
        }
        on() {
          return this;
        }
        once() {
          return this;
        }
        off() {
          return this;
        }
        emit() {
          return false;
        }
        destroy() {
          this.destroyed = true;
        }
      },
    },
    buffer: {
      Buffer: globalThis.Buffer,
    },
    querystring: {
      parse: (str: string) => {
        const params = new URLSearchParams(str);
        const result: Record<string, string> = {};
        for (const [key, value] of params.entries()) {
          result[key] = value;
        }
        return result;
      },
      stringify: (obj: Record<string, string>) => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(obj)) {
          params.append(key, value);
        }
        return params.toString();
      },
    },
    url: {
      URL: globalThis.URL,
      URLSearchParams: globalThis.URLSearchParams,
      parse: (str: string) => new URL(str),
      format: (url: URL) => url.toString(),
      resolve: (from: string, to: string) => new URL(to, from).toString(),
    },
  };

  // Mock Node.js modules
  Object.entries(nodeModuleMocks).forEach(([moduleName, mockImplementation]) => {
    vi.doMock(moduleName, () => mockImplementation);
  });

  // Mock other Node.js-specific modules that should not be available
  const unavailableModules = [
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'net',
    'tls',
    'http',
    'https',
    'http2',
    'zlib',
    'punycode',
    'readline',
    'repl',
    'string_decoder',
    'tty',
    'v8',
    'vm',
    'worker_threads',
    'perf_hooks',
    'async_hooks',
    'inspector',
    'module',
  ];

  unavailableModules.forEach(moduleName => {
    vi.doMock(moduleName, () => {
      throw new Error(`Module "${moduleName}" is not available in edge runtime`);
    });
  });

  // Mock global fetch if not available
  if (typeof globalThis.fetch === 'undefined') {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () =>
        new Response('{"success": true}', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
  }

  // Mock Request and Response if not available
  if (typeof globalThis.Request === 'undefined') {
    globalThis.Request = class Request {
      public url: string;
      public options: any;
      headers: Headers;
      method: string;
      body: any;
      bodyUsed: boolean;
      cache: string;
      credentials: string;
      destination: string;
      integrity: string;
      keepalive: boolean;
      mode: string;
      redirect: string;
      referrer: string;
      referrerPolicy: string;
      signal: AbortSignal;

      constructor(url: string, options: any = {}) {
        this.url = url;
        this.options = options;
        this.headers = new Headers();
        this.method = options.method || 'GET';
        this.body = options.body || null;
        this.bodyUsed = false;
        this.cache = 'default';
        this.credentials = 'same-origin';
        this.destination = '';
        this.integrity = '';
        this.keepalive = false;
        this.mode = 'cors';
        this.redirect = 'follow';
        this.referrer = '';
        this.referrerPolicy = '';
        this.signal = new AbortSignal();
      }

      json = vi.fn().mockResolvedValue({});
      text = vi.fn().mockResolvedValue('');
      blob = vi.fn().mockResolvedValue(new Blob());
      formData = vi.fn().mockResolvedValue(new FormData());
      arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(0));
      bytes = vi.fn().mockResolvedValue(new Uint8Array(0));
      clone = vi.fn().mockReturnValue(this);
    } as any;
  }

  if (typeof globalThis.Response === 'undefined') {
    globalThis.Response = class Response {
      public body?: any;
      public options: any;
      headers: Headers;
      ok: boolean;
      status: number;
      statusText: string;
      type: string;
      url: string;
      bodyUsed: boolean;
      redirected: boolean;

      constructor(body?: any, options: any = {}) {
        this.body = body;
        this.options = options;
        this.headers = new Headers(options.headers);
        this.ok = options.status >= 200 && options.status < 300;
        this.status = options.status || 200;
        this.statusText = options.statusText || 'OK';
        this.type = 'default';
        this.url = '';
        this.bodyUsed = false;
        this.redirected = false;
      }

      json = vi.fn().mockResolvedValue({});
      text = vi.fn().mockResolvedValue('');
      blob = vi.fn().mockResolvedValue(new Blob());
      formData = vi.fn().mockResolvedValue(new FormData());
      arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(0));
      bytes = vi.fn().mockResolvedValue(new Uint8Array(0));
      clone = vi.fn().mockReturnValue(this);

      static json(data: any, options?: any) {
        return new Response(JSON.stringify(data), {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
        });
      }

      static redirect(url: string, status = 302) {
        return new Response(null, {
          status,
          headers: { Location: url },
        });
      }

      static error() {
        return new Response(null, { status: 500 });
      }
    } as any;
  }

  if (typeof globalThis.Headers === 'undefined') {
    globalThis.Headers = class Headers {
      private headers: Map<string, string> = new Map();

      constructor(init?: any) {
        if (init) {
          if (init instanceof Headers) {
            init.forEach((value, key) => this.set(key, value));
          } else if (Array.isArray(init)) {
            init.forEach(([key, value]) => this.set(key, value));
          } else {
            Object.entries(init).forEach(([key, value]) => this.set(key, String(value)));
          }
        }
      }

      append(key: string, value: string) {
        const existing = this.get(key);
        this.set(key, existing ? `${existing}, ${value}` : value);
      }

      delete(key: string) {
        this.headers.delete(key.toLowerCase());
      }

      get(key: string) {
        return this.headers.get(key.toLowerCase()) || null;
      }

      has(key: string) {
        return this.headers.has(key.toLowerCase());
      }

      set(key: string, value: string) {
        this.headers.set(key.toLowerCase(), value);
      }

      forEach(callback: (value: string, key: string, parent: Headers) => void) {
        this.headers.forEach((value, key) => callback(value, key, this));
      }

      keys() {
        return this.headers.keys();
      }

      values() {
        return this.headers.values();
      }

      entries() {
        return this.headers.entries();
      }

      getSetCookie() {
        const setCookieValues = [];
        for (const [key, value] of this.headers) {
          if (key.toLowerCase() === 'set-cookie') {
            setCookieValues.push(value);
          }
        }
        return setCookieValues;
      }

      [Symbol.iterator]() {
        return this.entries();
      }
    };
  }
}

/**
 * Cleanup edge runtime globals
 */
function cleanupEdgeRuntimeGlobals() {
  // Clean up polyfills - but preserve process for other tests
  delete (globalThis as any).Buffer;
  // Don't delete process as it causes issues with subsequent tests
  // delete (globalThis as any).process;
  delete (globalThis as any).global;
  delete (globalThis as any).__dirname;
  delete (globalThis as any).__filename;

  // Clean up test-specific globals
  delete (globalThis as any).fetch;
  delete (globalThis as any).Request;
  delete (globalThis as any).Response;
  delete (globalThis as any).Headers;
}

// Global edge runtime utilities
declare global {
  var edgeRuntimeUtils: {
    isEdgeRuntime: boolean;
    mockWebApi: (api: string, implementation: any) => void;
    mockNodeModule: (module: string, implementation: any) => void;
    simulateNetworkDelay: (ms: number) => Promise<void>;
    createMockRequest: (url: string, options?: any) => Request;
    createMockResponse: (body?: any, options?: any) => Response;
    createMockHeaders: (init?: any) => Headers;
  };
}

// Edge runtime test utilities
globalThis.edgeRuntimeUtils = {
  isEdgeRuntime: true,

  mockWebApi(api: string, implementation: any) {
    (globalThis as any)[api] = implementation;
  },

  mockNodeModule(module: string, implementation: any) {
    vi.doMock(module, () => implementation);
  },

  async simulateNetworkDelay(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
  },

  createMockRequest(url: string, options: any = {}) {
    return new Request(url, options);
  },

  createMockResponse(body: any = null, options: any = {}) {
    return new Response(body, options);
  },

  createMockHeaders(init: any = {}) {
    return new Headers(init);
  },
};

// Export edge runtime utilities for tests
export const { simulateNetworkDelay, createMockRequest, createMockResponse, createMockHeaders } =
  globalThis.edgeRuntimeUtils;

// Export edge runtime test helpers
export const edgeRuntimeHelpers = {
  /**
   * Test if code runs in edge runtime
   */
  testEdgeRuntime() {
    return process.env.NEXT_RUNTIME === 'edge';
  },

  /**
   * Test if Web API is available
   */
  testWebApi(api: string) {
    return typeof (globalThis as any)[api] !== 'undefined';
  },

  /**
   * Test if Node.js module is available (should be false)
   */
  testNodeModule(module: string) {
    try {
      // eslint-disable-next-line security/detect-non-literal-require
      require(module);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Create a mock middleware function
   */
  createMockMiddleware(handler: (req: Request) => Response | Promise<Response>) {
    return handler;
  },

  /**
   * Create a mock API route function
   */
  createMockApiRoute(handler: (req: Request) => Response | Promise<Response>) {
    return handler;
  },

  /**
   * Create a mock edge function
   */
  createMockEdgeFunction(handler: (req: Request) => Response | Promise<Response>) {
    return handler;
  },
};
