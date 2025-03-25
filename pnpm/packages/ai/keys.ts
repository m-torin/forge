import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import { createTestAwareValidator } from '@repo/testing/env';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
    server: {
      OPENAI_API_KEY: createTestAwareValidator(
        // Test environment - more relaxed validation
        z.string().min(1).optional(),
        // Production environment - stricter validation
        z.string().min(1).startsWith('sk-').optional(),
      ),
    },
  });
