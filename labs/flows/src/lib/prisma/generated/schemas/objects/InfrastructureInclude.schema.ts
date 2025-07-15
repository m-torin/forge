import { z } from 'zod';
import { NodeFindManySchema } from '../findManyNode.schema';
import { InfrastructureCountOutputTypeArgsObjectSchema } from './InfrastructureCountOutputTypeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    nodes: z.union([z.boolean(), z.lazy(() => NodeFindManySchema)]).optional(),
    _count: z
      .union([
        z.boolean(),
        z.lazy(() => InfrastructureCountOutputTypeArgsObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const InfrastructureIncludeObjectSchema = Schema;
