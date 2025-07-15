import { z } from 'zod';
import { UserArgsObjectSchema } from './UserArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.boolean().optional(),
    expires: z.boolean().optional(),
    id: z.boolean().optional(),
    sessionToken: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsObjectSchema)]).optional(),
    userId: z.boolean().optional(),
  })
  .strict();

export const SessionSelectObjectSchema = Schema;
