import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },
  onValidationError: (error) => {
    console.warn("Package env validation failed:", error);
    return undefined as never;
  },
  onInvalidAccess: (variable) => {
    throw new Error(
      `❌ Attempted to access a server-side environment variable on the client: ${variable}`
    );
  },
});

export function safeEnv() {
  return env || {
    NODE_ENV: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
  };
}