import { z } from 'zod';
import { InfrastructureCountOutputTypeSelectObjectSchema } from './InfrastructureCountOutputTypeSelect.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z
      .lazy(() => InfrastructureCountOutputTypeSelectObjectSchema)
      .optional(),
  })
  .strict();

export const InfrastructureCountOutputTypeArgsObjectSchema = Schema;
