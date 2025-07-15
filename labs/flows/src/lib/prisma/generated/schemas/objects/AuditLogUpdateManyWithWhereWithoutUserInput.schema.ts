import { z } from 'zod';
import { AuditLogScalarWhereInputObjectSchema } from './AuditLogScalarWhereInput.schema';
import { AuditLogUpdateManyMutationInputObjectSchema } from './AuditLogUpdateManyMutationInput.schema';
import { AuditLogUncheckedUpdateManyWithoutUserInputObjectSchema } from './AuditLogUncheckedUpdateManyWithoutUserInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => AuditLogScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => AuditLogUpdateManyMutationInputObjectSchema),
      z.lazy(() => AuditLogUncheckedUpdateManyWithoutUserInputObjectSchema),
    ]),
  })
  .strict();

export const AuditLogUpdateManyWithWhereWithoutUserInputObjectSchema = Schema;
