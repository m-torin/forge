import { createEnv } from '@t3-oss/env-nextjs';

import { keys as email } from '@repo/email/keys';
import { keys as flags } from '@repo/feature-flags/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as rateLimit } from '@repo/rate-limit/keys';
import { keys as security } from '@repo/security/keys';

export const env = createEnv({
  client: {},
  extends: [core(), email(), observability(), flags(), security(), rateLimit()] as any[],
  runtimeEnv: {},
  server: {},
});
