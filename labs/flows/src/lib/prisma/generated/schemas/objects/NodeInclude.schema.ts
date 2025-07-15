import { z } from 'zod';
import { FlowArgsObjectSchema } from './FlowArgs.schema';
import { InfrastructureArgsObjectSchema } from './InfrastructureArgs.schema';
import { SecretFindManySchema } from '../findManySecret.schema';
import { EdgeFindManySchema } from '../findManyEdge.schema';
import { TagFindManySchema } from '../findManyTag.schema';
import { NodeCountOutputTypeArgsObjectSchema } from './NodeCountOutputTypeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flow: z.union([z.boolean(), z.lazy(() => FlowArgsObjectSchema)]).optional(),
    infrastructure: z
      .union([z.boolean(), z.lazy(() => InfrastructureArgsObjectSchema)])
      .optional(),
    secrets: z
      .union([z.boolean(), z.lazy(() => SecretFindManySchema)])
      .optional(),
    sourceEdges: z
      .union([z.boolean(), z.lazy(() => EdgeFindManySchema)])
      .optional(),
    targetEdges: z
      .union([z.boolean(), z.lazy(() => EdgeFindManySchema)])
      .optional(),
    Tag: z.union([z.boolean(), z.lazy(() => TagFindManySchema)]).optional(),
    _count: z
      .union([z.boolean(), z.lazy(() => NodeCountOutputTypeArgsObjectSchema)])
      .optional(),
  })
  .strict();

export const NodeIncludeObjectSchema = Schema;
