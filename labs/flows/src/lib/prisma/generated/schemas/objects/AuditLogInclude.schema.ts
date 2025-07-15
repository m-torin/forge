import { z } from 'zod';
import { UserArgsObjectSchema } from './UserArgs.schema';
import { FlowArgsObjectSchema } from './FlowArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    user: z.union([z.boolean(), z.lazy(() => UserArgsObjectSchema)]).optional(),
    flow: z.union([z.boolean(), z.lazy(() => FlowArgsObjectSchema)]).optional(),
  })
  .strict();

export const AuditLogIncludeObjectSchema = Schema;
