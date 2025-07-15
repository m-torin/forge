import { z } from 'zod';
import { AccountCreateNestedManyWithoutUserInputObjectSchema } from './AccountCreateNestedManyWithoutUserInput.schema';
import { InstanceCreateNestedManyWithoutUserInputObjectSchema } from './InstanceCreateNestedManyWithoutUserInput.schema';
import { AuditLogCreateNestedManyWithoutUserInputObjectSchema } from './AuditLogCreateNestedManyWithoutUserInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.string().optional(),
    createdAt: z.coerce.date().optional(),
    email: z.string().optional().nullable(),
    emailVerified: z.coerce.date().optional().nullable(),
    image: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
    accounts: z
      .lazy(() => AccountCreateNestedManyWithoutUserInputObjectSchema)
      .optional(),
    instances: z
      .lazy(() => InstanceCreateNestedManyWithoutUserInputObjectSchema)
      .optional(),
    auditLogs: z
      .lazy(() => AuditLogCreateNestedManyWithoutUserInputObjectSchema)
      .optional(),
  })
  .strict();

export const UserCreateWithoutSessionsInputObjectSchema = Schema;
