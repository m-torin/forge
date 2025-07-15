import { z } from 'zod';
import { AuditLogSelectObjectSchema } from './AuditLogSelect.schema';
import { AuditLogIncludeObjectSchema } from './AuditLogInclude.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => AuditLogSelectObjectSchema).optional(),
    include: z.lazy(() => AuditLogIncludeObjectSchema).optional(),
  })
  .strict();

export const AuditLogArgsObjectSchema = Schema;
