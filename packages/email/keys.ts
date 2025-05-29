import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      RESEND_FROM: process.env.RESEND_FROM || undefined,
      RESEND_TOKEN: process.env.RESEND_TOKEN || undefined,
    },
    server: {
      RESEND_FROM: isProduction ? z.string().email() : z.string().email().optional(),
      RESEND_TOKEN: isProduction
        ? z.string().startsWith('re_')
        : z.string().startsWith('re_').optional(),
    },
  });
