import { z } from 'zod';
import { InstanceSelectObjectSchema } from './InstanceSelect.schema';
import { InstanceIncludeObjectSchema } from './InstanceInclude.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => InstanceSelectObjectSchema).optional(),
    include: z.lazy(() => InstanceIncludeObjectSchema).optional(),
  })
  .strict();

export const InstanceArgsObjectSchema = Schema;
