import { z } from 'zod';
import { AccountFindManySchema } from '../findManyAccount.schema';
import { InstanceFindManySchema } from '../findManyInstance.schema';
import { SessionFindManySchema } from '../findManySession.schema';
import { AuditLogFindManySchema } from '../findManyAuditLog.schema';
import { UserCountOutputTypeArgsObjectSchema } from './UserCountOutputTypeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    accounts: z
      .union([z.boolean(), z.lazy(() => AccountFindManySchema)])
      .optional(),
    instances: z
      .union([z.boolean(), z.lazy(() => InstanceFindManySchema)])
      .optional(),
    sessions: z
      .union([z.boolean(), z.lazy(() => SessionFindManySchema)])
      .optional(),
    auditLogs: z
      .union([z.boolean(), z.lazy(() => AuditLogFindManySchema)])
      .optional(),
    _count: z
      .union([z.boolean(), z.lazy(() => UserCountOutputTypeArgsObjectSchema)])
      .optional(),
  })
  .strict();

export const UserIncludeObjectSchema = Schema;
