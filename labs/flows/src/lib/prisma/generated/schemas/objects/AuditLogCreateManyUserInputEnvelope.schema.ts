import { z } from 'zod';
import { AuditLogCreateManyUserInputObjectSchema } from './AuditLogCreateManyUserInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => AuditLogCreateManyUserInputObjectSchema),
      z.lazy(() => AuditLogCreateManyUserInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const AuditLogCreateManyUserInputEnvelopeObjectSchema = Schema;
