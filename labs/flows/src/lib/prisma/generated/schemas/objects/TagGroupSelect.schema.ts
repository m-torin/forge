import { z } from 'zod';
import { TagFindManySchema } from '../findManyTag.schema';
import { InstanceArgsObjectSchema } from './InstanceArgs.schema';
import { TagGroupCountOutputTypeArgsObjectSchema } from './TagGroupCountOutputTypeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    color: z.boolean().optional(),
    deleted: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    tags: z.union([z.boolean(), z.lazy(() => TagFindManySchema)]).optional(),
    metadata: z.boolean().optional(),
    instance: z
      .union([z.boolean(), z.lazy(() => InstanceArgsObjectSchema)])
      .optional(),
    instanceId: z.boolean().optional(),
    _count: z
      .union([
        z.boolean(),
        z.lazy(() => TagGroupCountOutputTypeArgsObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const TagGroupSelectObjectSchema = Schema;
