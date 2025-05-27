import { createEnv } from '@t3-oss/env-nextjs';

import { keys as analytics } from '@repo/analytics/keys';
import { keys as auth } from '@repo/auth/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/email/keys';
import { keys as featureFlags } from '@repo/feature-flags/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';

export const env = createEnv({
  client: {},
  extends: [
    auth(),
    analytics(),
    core(),
    database(),
    email(),
    featureFlags(),
    observability(),
    payments(),
  ],
  runtimeEnv: {},
  server: {},
});
