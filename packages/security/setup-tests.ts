import '@repo/testing/src/vitest/core/setup';
import { vi } from 'vitest';

// Mock environment variables
process.env.ARCJET_KEY = 'ajkey_test_arcjet_key';
process.env.NODE_ENV = 'test';

// Mock @arcjet/next
vi.mock('@arcjet/next', () => {
  const mockArcjet = vi.fn().mockImplementation((options) => {
    return {
      withRule: vi.fn().mockImplementation((rule) => {
        return {
          protect: vi.fn().mockResolvedValue({
            isDenied: vi.fn().mockReturnValue(false),
            reason: {
              isBot: vi.fn().mockReturnValue(false),
              isRateLimit: vi.fn().mockReturnValue(false),
            },
          }),
        };
      }),
    };
  });

  mockArcjet.detectBot = vi.fn().mockImplementation((options) => options);
  mockArcjet.shield = vi.fn().mockImplementation((options) => options);
  mockArcjet.request = vi
    .fn()
    .mockResolvedValue(new Request('https://example.com'));

  return {
    default: mockArcjet,
    detectBot: mockArcjet.detectBot,
    shield: mockArcjet.shield,
    request: mockArcjet.request,
  };
});

// Mock @nosecone/next
vi.mock('@nosecone/next', () => {
  const mockDefaults = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
      },
    },
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  };

  const mockWithVercelToolbar = vi.fn().mockImplementation((options) => {
    return {
      ...options,
      contentSecurityPolicy: {
        ...options.contentSecurityPolicy,
        directives: {
          ...options.contentSecurityPolicy?.directives,
          connectSrc: ["'self'", 'vercel.com'],
        },
      },
    };
  });

  const mockCreateMiddleware = vi.fn().mockImplementation((options) => {
    return vi.fn().mockImplementation((req) => {
      return {
        headers: new Headers({
          'X-Frame-Options': options.xFrameOptions || 'DENY',
          'X-Content-Type-Options': options.xContentTypeOptions || 'nosniff',
          'Referrer-Policy':
            options.referrerPolicy || 'strict-origin-when-cross-origin',
          'Strict-Transport-Security':
            'max-age=31536000; includeSubDomains; preload',
        }),
      };
    });
  });

  return {
    defaults: mockDefaults,
    withVercelToolbar: mockWithVercelToolbar,
    createMiddleware: mockCreateMiddleware,
  };
});

// Mock @t3-oss/env-nextjs
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn().mockImplementation(({ server, runtimeEnv }) => {
    const env = {};
    Object.keys(server).forEach((key) => {
      env[key] = runtimeEnv[key];
    });
    return () => env;
  }),
}));
