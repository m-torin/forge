import { z } from 'zod';
import { UserArgsObjectSchema } from './UserArgs.schema';
import { FlowArgsObjectSchema } from './FlowArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.boolean().optional(),
    entityType: z.boolean().optional(),
    entityId: z.boolean().optional(),
    flowId: z.boolean().optional(),
    changeType: z.boolean().optional(),
    before: z.boolean().optional(),
    after: z.boolean().optional(),
    userId: z.boolean().optional(),
    timestamp: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsObjectSchema)]).optional(),
    flow: z.union([z.boolean(), z.lazy(() => FlowArgsObjectSchema)]).optional(),
  })
  .strict();

export const AuditLogSelectObjectSchema = Schema;
