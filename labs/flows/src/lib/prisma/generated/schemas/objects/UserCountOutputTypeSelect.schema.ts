import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    accounts: z.boolean().optional(),
    instances: z.boolean().optional(),
    sessions: z.boolean().optional(),
    auditLogs: z.boolean().optional(),
  })
  .strict();

export const UserCountOutputTypeSelectObjectSchema = Schema;
