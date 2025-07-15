import { z } from 'zod';
import { AuditLogWhereUniqueInputObjectSchema } from './AuditLogWhereUniqueInput.schema';
import { AuditLogUpdateWithoutUserInputObjectSchema } from './AuditLogUpdateWithoutUserInput.schema';
import { AuditLogUncheckedUpdateWithoutUserInputObjectSchema } from './AuditLogUncheckedUpdateWithoutUserInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => AuditLogWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => AuditLogUpdateWithoutUserInputObjectSchema),
      z.lazy(() => AuditLogUncheckedUpdateWithoutUserInputObjectSchema),
    ]),
  })
  .strict();

export const AuditLogUpdateWithWhereUniqueWithoutUserInputObjectSchema = Schema;
