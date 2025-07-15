import { z } from 'zod';
import { AccountFindManySchema } from '../findManyAccount.schema';
import { InstanceFindManySchema } from '../findManyInstance.schema';
import { SessionFindManySchema } from '../findManySession.schema';
import { AuditLogFindManySchema } from '../findManyAuditLog.schema';
import { UserCountOutputTypeArgsObjectSchema } from './UserCountOutputTypeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.boolean().optional(),
    accounts: z
      .union([z.boolean(), z.lazy(() => AccountFindManySchema)])
      .optional(),
    createdAt: z.boolean().optional(),
    email: z.boolean().optional(),
    emailVerified: z.boolean().optional(),
    instances: z
      .union([z.boolean(), z.lazy(() => InstanceFindManySchema)])
      .optional(),
    sessions: z
      .union([z.boolean(), z.lazy(() => SessionFindManySchema)])
      .optional(),
    auditLogs: z
      .union([z.boolean(), z.lazy(() => AuditLogFindManySchema)])
      .optional(),
    image: z.boolean().optional(),
    name: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    _count: z
      .union([z.boolean(), z.lazy(() => UserCountOutputTypeArgsObjectSchema)])
      .optional(),
  })
  .strict();

export const UserSelectObjectSchema = Schema;
