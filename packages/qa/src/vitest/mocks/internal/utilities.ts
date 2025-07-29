// Centralized utility package mocks for all tests in the monorepo
import { vi } from 'vitest';

// Mock UUID
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-v4'),
  v1: vi.fn(() => 'mock-uuid-v1'),
  v3: vi.fn(() => 'mock-uuid-v3'),
  v5: vi.fn(() => 'mock-uuid-v5'),
  validate: vi.fn((uuid: string) => /^mock-uuid/.test(uuid)),
  version: vi.fn(() => 4),
  NIL: '00000000-0000-0000-0000-000000000000',
}));

// Mock NanoID
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'mock-nanoid'),
  customAlphabet: vi.fn(() => vi.fn(() => 'mock-custom-id')),
  customRandom: vi.fn(() => vi.fn(() => 'mock-random-id')),
  urlAlphabet: 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW',
  random: vi.fn(),
}));

// Mock Date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((_date, _formatStr) => 'formatted-date'),
  parse: vi.fn(() => new Date('2024-01-01')),
  formatDistance: vi.fn(() => '5 minutes'),
  formatDistanceToNow: vi.fn(() => '5 minutes ago'),
  addDays: vi.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  subDays: vi.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  addMonths: vi.fn((date, months) => new Date(date.getTime() + months * 30 * 24 * 60 * 60 * 1000)),
  subMonths: vi.fn((date, months) => new Date(date.getTime() - months * 30 * 24 * 60 * 60 * 1000)),
  isAfter: vi.fn((date1, date2) => date1 > date2),
  isBefore: vi.fn((date1, date2) => date1 < date2),
  isEqual: vi.fn((date1, date2) => date1.getTime() === date2.getTime()),
  startOfDay: vi.fn(date => new Date(date.setHours(0, 0, 0, 0))),
  endOfDay: vi.fn(date => new Date(date.setHours(23, 59, 59, 999))),
  startOfMonth: vi.fn(date => new Date(date.getFullYear(), date.getMonth(), 1)),
  endOfMonth: vi.fn(date => new Date(date.getFullYear(), date.getMonth() + 1, 0)),
}));

// Mock Embla Carousel
vi.mock('embla-carousel-react', () => ({
  default: vi.fn(() => [
    // emblaRef
    { current: null },
    // emblaApi
    {
      scrollNext: vi.fn(),
      scrollPrev: vi.fn(),
      scrollTo: vi.fn(),
      canScrollNext: vi.fn(() => true),
      canScrollPrev: vi.fn(() => true),
      selectedScrollSnap: vi.fn(() => 0),
      scrollSnapList: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn(),
      destroy: vi.fn(),
      reInit: vi.fn(),
    },
  ]),
  useEmblaCarousel: vi.fn(() => [
    { current: null },
    {
      scrollNext: vi.fn(),
      scrollPrev: vi.fn(),
      scrollTo: vi.fn(),
      canScrollNext: vi.fn(() => true),
      canScrollPrev: vi.fn(() => true),
      selectedScrollSnap: vi.fn(() => 0),
      scrollSnapList: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn(),
      destroy: vi.fn(),
      reInit: vi.fn(),
    },
  ]),
}));

vi.mock('embla-carousel-autoplay', () => ({
  default: vi.fn(() => ({
    name: 'autoplay',
    options: {},
    init: vi.fn(),
    destroy: vi.fn(),
    play: vi.fn(),
    stop: vi.fn(),
    reset: vi.fn(),
  })),
}));

// Mock Playwright (for testing)
vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        goto: vi.fn(),
        screenshot: vi.fn().mockResolvedValue(Buffer.from('mock-screenshot')),
        pdf: vi.fn().mockResolvedValue(Buffer.from('mock-pdf')),
        close: vi.fn(),
        evaluate: vi.fn(),
        waitForSelector: vi.fn(),
        click: vi.fn(),
        type: vi.fn(),
        press: vi.fn(),
      }),
      close: vi.fn(),
    }),
  },
  firefox: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        goto: vi.fn(),
        close: vi.fn(),
      }),
      close: vi.fn(),
    }),
  },
  webkit: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        goto: vi.fn(),
        close: vi.fn(),
      }),
      close: vi.fn(),
    }),
  },
}));

// Mock detect-port
vi.mock('detect-port', () => ({
  default: vi.fn().mockResolvedValue(3000),
}));

// Mock node-fetch
vi.mock('node-fetch', () => ({
  default: vi.fn().mockImplementation((_url, _options) =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map(),
      json: vi.fn().mockResolvedValue({}),
      text: vi.fn().mockResolvedValue(''),
      blob: vi.fn().mockResolvedValue(new Blob()),
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    }),
  ),
}));

// Mock readline/promises
vi.mock('readline/promises', () => ({
  createInterface: vi.fn(() => ({
    question: vi.fn().mockResolvedValue('mock-answer'),
    close: vi.fn(),
    [Symbol.asyncIterator]: async function* () {
      yield 'mock-line-1';
      yield 'mock-line-2';
    },
  })),
}));

// Mock negotiator (for i18n)
vi.mock('negotiator', () => ({
  default: vi.fn().mockImplementation(() => ({
    languages: vi.fn(() => ['en', 'fr', 'es']),
    language: vi.fn(() => 'en'),
    encoding: vi.fn(() => 'gzip'),
    encodings: vi.fn(() => ['gzip', 'deflate']),
    charset: vi.fn(() => 'utf-8'),
    charsets: vi.fn(() => ['utf-8']),
    mediaType: vi.fn(() => 'text/html'),
    mediaTypes: vi.fn(() => ['text/html', 'application/json']),
  })),
}));

// Mock @formatjs/intl-localematcher
vi.mock('@formatjs/intl-localematcher', () => ({
  match: vi.fn((requested, available, defaultLocale) => defaultLocale),
}));

// Mock next-international
vi.mock('next-international/middleware', () => ({
  createI18nMiddleware: vi.fn(() => vi.fn()),
}));

// Mock react-hooks-global-state
vi.mock('react-hooks-global-state', () => ({
  createGlobalState: vi.fn(initialState => {
    const state = { ...initialState };
    return Object.keys(initialState).reduce((acc, key) => {
      vi.spyOn(acc, `use${key.charAt(0).toUpperCase() + key.slice(1)}`).mockImplementation(() => [
        state[key],
        vi.fn(newValue => {
          state[key] = newValue;
        }),
      ]);
      return acc;
    }, {} as any);
  }),
  createStore: vi.fn(() => ({
    useGlobalState: vi.fn(),
    getGlobalState: vi.fn(),
    setGlobalState: vi.fn(),
  })),
}));

// Mock t3-env
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn(config => {
    // Return a mock environment object based on the config
    const mockEnv: any = {};

    // Process server variables
    if (config.server) {
      Object.keys(config.server).forEach(key => {
        mockEnv[key] = process.env[key] || `mock-${key}`;
      });
    }

    // Process client variables
    if (config.client) {
      Object.keys(config.client).forEach(key => {
        mockEnv[key] = process.env[key] || `mock-${key}`;
      });
    }

    return mockEnv;
  }),
}));

// Export helper functions
export const mockUUID = () => 'mock-uuid-v4';
export const mockNanoID = () => 'mock-nanoid';
export const mockDate = new Date('2024-01-01T00:00:00.000Z');

export const resetUtilityMocks = () => {
  vi.clearAllMocks();
};
