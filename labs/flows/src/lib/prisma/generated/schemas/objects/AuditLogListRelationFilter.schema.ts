import { z } from 'zod';
import { AuditLogWhereInputObjectSchema } from './AuditLogWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    every: z.lazy(() => AuditLogWhereInputObjectSchema).optional(),
    some: z.lazy(() => AuditLogWhereInputObjectSchema).optional(),
    none: z.lazy(() => AuditLogWhereInputObjectSchema).optional(),
  })
  .strict();

export const AuditLogListRelationFilterObjectSchema = Schema;
