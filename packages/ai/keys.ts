import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
    },
    server: {
      OPENAI_API_KEY: isProduction
        ? z.string().min(1).startsWith('sk-')
        : z.string().min(1).startsWith('sk-').optional(),
    },
  });
