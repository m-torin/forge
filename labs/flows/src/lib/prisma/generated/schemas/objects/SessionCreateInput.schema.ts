import { z } from 'zod';
import { UserCreateNestedOneWithoutSessionsInputObjectSchema } from './UserCreateNestedOneWithoutSessionsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.coerce.date().optional(),
    expires: z.coerce.date(),
    id: z.string().optional(),
    sessionToken: z.string(),
    user: z.lazy(() => UserCreateNestedOneWithoutSessionsInputObjectSchema),
  })
  .strict();

export const SessionCreateInputObjectSchema = Schema;
