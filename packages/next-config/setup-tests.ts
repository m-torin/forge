// import '@repo/testing/src/vitest/core/setup';
import { vi } from "vitest";

// Mock environment variables
process.env.ANALYZE = "false";
process.env.NEXT_RUNTIME = "nodejs";
process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
process.env.NEXT_PUBLIC_WEB_URL = "https://example.com";
process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
process.env.NEXT_PUBLIC_DOCS_URL = "https://docs.example.com";

// Mock @next/bundle-analyzer
vi.mock("@next/bundle-analyzer", () => ({
  default: vi.fn().mockImplementation(() => (config: any) => config),
}));

// Mock @prisma/nextjs-monorepo-workaround-plugin
vi.mock("@prisma/nextjs-monorepo-workaround-plugin", () => ({
  PrismaPlugin: vi.fn().mockImplementation(function (this: any) {
    this.apply = vi.fn();
  }),
}));

// Mock @t3-oss/env-core
vi.mock("@t3-oss/env-core/presets-zod", () => ({
  vercel: vi.fn().mockReturnValue({
    VERCEL_ENV: vi.fn(),
    VERCEL_REGION: vi.fn(),
    VERCEL_URL: vi.fn(),
  }),
}));

// Mock @t3-oss/env-nextjs
vi.mock("@t3-oss/env-nextjs", () => ({
  createEnv: vi
    .fn()
    .mockImplementation(
      ({
        client,
        runtimeEnv,
        server,
      }: {
        server: Record<string, any>;
        client: Record<string, any>;
        runtimeEnv: Record<string, any>;
      }) => {
        const env: Record<string, any> = {};
        Object.keys(server).forEach((key) => {
          env[key] = runtimeEnv[key];
        });
        Object.keys(client).forEach((key) => {
          env[key] = runtimeEnv[key];
        });
        return () => env;
      },
    ),
}));

// Mock next
vi.mock("next", () => ({
  NextResponse: {
    redirect: vi.fn().mockImplementation((url: string) => ({
      url,
      status: 307,
      statusText: "Temporary Redirect",
    })),
  },
}));
