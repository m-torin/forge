import { z } from 'zod';
import { AuditLogWhereUniqueInputObjectSchema } from './AuditLogWhereUniqueInput.schema';
import { AuditLogUpdateWithoutUserInputObjectSchema } from './AuditLogUpdateWithoutUserInput.schema';
import { AuditLogUncheckedUpdateWithoutUserInputObjectSchema } from './AuditLogUncheckedUpdateWithoutUserInput.schema';
import { AuditLogCreateWithoutUserInputObjectSchema } from './AuditLogCreateWithoutUserInput.schema';
import { AuditLogUncheckedCreateWithoutUserInputObjectSchema } from './AuditLogUncheckedCreateWithoutUserInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => AuditLogWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => AuditLogUpdateWithoutUserInputObjectSchema),
      z.lazy(() => AuditLogUncheckedUpdateWithoutUserInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => AuditLogCreateWithoutUserInputObjectSchema),
      z.lazy(() => AuditLogUncheckedCreateWithoutUserInputObjectSchema),
    ]),
  })
  .strict();

export const AuditLogUpsertWithWhereUniqueWithoutUserInputObjectSchema = Schema;
