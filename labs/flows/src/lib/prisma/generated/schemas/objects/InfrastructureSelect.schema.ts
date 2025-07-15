import { z } from 'zod';
import { NodeFindManySchema } from '../findManyNode.schema';
import { InfrastructureCountOutputTypeArgsObjectSchema } from './InfrastructureCountOutputTypeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    arn: z.boolean().optional(),
    canControl: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    data: z.boolean().optional(),
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    nodes: z.union([z.boolean(), z.lazy(() => NodeFindManySchema)]).optional(),
    type: z.boolean().optional(),
    metadata: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deleted: z.boolean().optional(),
    _count: z
      .union([
        z.boolean(),
        z.lazy(() => InfrastructureCountOutputTypeArgsObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const InfrastructureSelectObjectSchema = Schema;
