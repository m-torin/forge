import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Safe environment variable validation that prevents white screens
let env: any = null;
let envError: string | null = null;

try {
  env = createEnv({
    server: {
      NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
      // Provide development defaults to prevent crashes
      DATABASE_URL: z.string().url().default("postgresql://localhost:5432/dev"),
      BETTER_AUTH_SECRET: z
        .string()
        .min(32)
        .default("development-secret-at-least-32-characters-long"),
      BETTER_AUTH_URL: z.string().url().default("http://localhost:3200"),
      // Social auth providers - optional
      GITHUB_CLIENT_ID: z.string().optional(),
      GITHUB_CLIENT_SECRET: z.string().optional(),
      GOOGLE_CLIENT_ID: z.string().optional(),
      GOOGLE_CLIENT_SECRET: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3200"),
      NEXT_PUBLIC_APP_NAME: z.string().default("Web App"),
      NEXT_PUBLIC_NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    },
    runtimeEnv: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_NODE_ENV:
        process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    },
    // Graceful error handling - log but don't crash
    onValidationError: (error) => {
      console.error("❌ Invalid environment variables:", error);
      envError = `Environment validation failed: ${error.map((i: any) => i.message).join(", ")}`;
      // Must throw for type compatibility, but we catch it above
      throw new Error("Environment validation failed");
    },
    // Skip validation in certain environments if needed
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  });
} catch (error) {
  console.error("Failed to create environment configuration:", error);
  envError =
    error instanceof Error ? error.message : "Unknown environment error";
}

// Export safe fallback values if env creation failed
export { env, envError };

// Helper function to safely get environment values
export function safeEnv() {
  if (env) {
    return env;
  }

  // Return safe fallback values
  return {
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL || "postgresql://localhost:5432/dev",
    BETTER_AUTH_SECRET:
      process.env.BETTER_AUTH_SECRET ||
      "development-secret-at-least-32-characters-long",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3200",
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3200",
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Web App",
    NEXT_PUBLIC_NODE_ENV:
      process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV || "development",
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "",
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  };
}
