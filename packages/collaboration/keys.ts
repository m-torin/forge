import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const keys = () =>
  createEnv({
    // Set to empty object in test environment to avoid client-side errors
    skipValidation: process.env.NODE_ENV === "test",
    runtimeEnv: {
      LIVEBLOCKS_SECRET: process.env.LIVEBLOCKS_SECRET,
    },
    server: {
      LIVEBLOCKS_SECRET: z.string().min(1).startsWith("sk_").optional(),
    },
  });
