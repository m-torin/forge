import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      LIVEBLOCKS_SECRET: process.env.LIVEBLOCKS_SECRET,
    },
    server: {
      LIVEBLOCKS_SECRET: z.string().min(1).startsWith('sk_').optional(),
    },
  });
