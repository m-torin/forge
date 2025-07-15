import { z } from 'zod';
import { SecretSelectObjectSchema } from './SecretSelect.schema';
import { SecretIncludeObjectSchema } from './SecretInclude.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => SecretSelectObjectSchema).optional(),
    include: z.lazy(() => SecretIncludeObjectSchema).optional(),
  })
  .strict();

export const SecretArgsObjectSchema = Schema;
