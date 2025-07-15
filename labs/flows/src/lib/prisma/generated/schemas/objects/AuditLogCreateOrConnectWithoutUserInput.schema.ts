import { z } from 'zod';
import { AuditLogWhereUniqueInputObjectSchema } from './AuditLogWhereUniqueInput.schema';
import { AuditLogCreateWithoutUserInputObjectSchema } from './AuditLogCreateWithoutUserInput.schema';
import { AuditLogUncheckedCreateWithoutUserInputObjectSchema } from './AuditLogUncheckedCreateWithoutUserInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => AuditLogWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => AuditLogCreateWithoutUserInputObjectSchema),
      z.lazy(() => AuditLogUncheckedCreateWithoutUserInputObjectSchema),
    ]),
  })
  .strict();

export const AuditLogCreateOrConnectWithoutUserInputObjectSchema = Schema;
