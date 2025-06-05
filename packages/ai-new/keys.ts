import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const aiKeys = createEnv({
  runtimeEnv: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  server: {
    ANTHROPIC_API_KEY: z.string().optional(),
    GOOGLE_AI_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
  },
});
