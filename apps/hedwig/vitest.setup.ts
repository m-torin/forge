/// <reference types="vitest" />
// Basic setup without external imports that might fail

// Basic DOM mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock React Native components for testing
vi.mock('react-native', async () => {
  const RN = await vi.importActual('react-native-web');
  return {
    ...RN,
    // Mock platform-specific components
    Platform: {
      OS: 'web',
      select: (options: any) => options.web || options.default,
    },
  };
});

// Mock Expo modules
vi.mock('expo-barcode-scanner', () => ({
  BarCodeScanner: {
    Constants: {
      BarCodeType: {
        qr: 'qr',
        pdf417: 'pdf417',
        aztec: 'aztec',
        ean13: 'ean13',
        ean8: 'ean8',
        upc_a: 'upc_a',
        upc_e: 'upc_e',
        code39: 'code39',
        code93: 'code93',
        code128: 'code128',
        codabar: 'codabar',
        itf: 'itf',
        rss14: 'rss14',
        rssexpanded: 'rssexpanded',
      },
    },
    requestPermissionsAsync: vi.fn(() => Promise.resolve({ status: 'granted' })),
  },
}));

vi.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: vi.fn(() => Promise.resolve({ status: 'granted' })),
  },
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(() => Promise.resolve(null)),
    setItem: vi.fn(() => Promise.resolve()),
    removeItem: vi.fn(() => Promise.resolve()),
    clear: vi.fn(() => Promise.resolve()),
  },
}));

// Mock analytics
vi.mock('./src/lib/analytics-client', () => ({
  analytics: {
    track: vi.fn(),
    identify: vi.fn(),
  },
}));

// Mock fetch for API calls
global.fetch = vi.fn();

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
     args[0].includes('Warning: ComponentsProvider'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};