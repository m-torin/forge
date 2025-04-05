import "@repo/testing/src/vitest/core/setup";
import { vi } from "vitest";

// Define types for mocks
type Procedure = Record<string, any>;

// Mock environment variables
process.env.ARCJET_KEY = "ajkey_test_arcjet_key";
process.env.NODE_ENV = "test";

// Mock @arcjet/next
vi.mock("@arcjet/next", () => {
  const mockArcjet = vi.fn().mockImplementation((options: any) => {
    return {
      withRule: vi.fn().mockImplementation((rule: any) => {
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
  }) as Procedure;

  mockArcjet.detectBot = vi.fn().mockImplementation((options: any) => options);
  mockArcjet.shield = vi.fn().mockImplementation((options: any) => options);
  mockArcjet.request = vi
    .fn()
    .mockResolvedValue(new Request("https://example.com"));

  return {
    default: mockArcjet,
    detectBot: mockArcjet.detectBot,
    request: mockArcjet.request,
    shield: mockArcjet.shield,
  };
});

// Mock @nosecone/next
vi.mock("@nosecone/next", () => {
  const mockDefaults = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
      },
    },
    permissionsPolicy: {
      camera: [],
      geolocation: [],
      microphone: [],
    },
    referrerPolicy: "strict-origin-when-cross-origin",
    strictTransportSecurity: {
      includeSubDomains: true,
      maxAge: 31536000,
      preload: true,
    },
    xContentTypeOptions: "nosniff",
    xFrameOptions: "DENY",
  };

  const mockWithVercelToolbar = vi.fn().mockImplementation((options: any) => {
    return {
      ...options,
      contentSecurityPolicy: {
        ...options.contentSecurityPolicy,
        directives: {
          ...options.contentSecurityPolicy?.directives,
          connectSrc: ["'self'", "vercel.com"],
        },
      },
    };
  });

  const mockCreateMiddleware = vi.fn().mockImplementation((options: any) => {
    return vi.fn().mockImplementation((req: any) => {
      return {
        headers: new Headers({
          "Referrer-Policy":
            options.referrerPolicy || "strict-origin-when-cross-origin",
          "Strict-Transport-Security":
            "max-age=31536000; includeSubDomains; preload",
          "X-Content-Type-Options": options.xContentTypeOptions || "nosniff",
          "X-Frame-Options": options.xFrameOptions || "DENY",
        }),
      };
    });
  });

  return {
    createMiddleware: mockCreateMiddleware,
    defaults: mockDefaults,
    withVercelToolbar: mockWithVercelToolbar,
  };
});

// Mock @t3-oss/env-nextjs
vi.mock("@t3-oss/env-nextjs", () => ({
  createEnv: vi
    .fn()
    .mockImplementation(
      ({
        runtimeEnv,
        server,
      }: {
        server: Record<string, any>;
        runtimeEnv: Record<string, any>;
      }) => {
        const env: Record<string, any> = {};
        Object.keys(server).forEach((key) => {
          env[key] = runtimeEnv[key];
        });
        return () => env;
      },
    ),
}));
