import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    runtimeEnv: {
      ARCJET_KEY: process.env.ARCJET_KEY,
    },
    server: {
      ARCJET_KEY: z.string().min(1).startsWith("ajkey_").optional(),
    },
  });
