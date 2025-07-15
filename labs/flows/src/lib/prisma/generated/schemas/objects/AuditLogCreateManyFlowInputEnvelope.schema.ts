import { z } from 'zod';
import { AuditLogCreateManyFlowInputObjectSchema } from './AuditLogCreateManyFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => AuditLogCreateManyFlowInputObjectSchema),
      z.lazy(() => AuditLogCreateManyFlowInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const AuditLogCreateManyFlowInputEnvelopeObjectSchema = Schema;
