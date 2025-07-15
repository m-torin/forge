import { z } from 'zod';
import { TagFindManySchema } from '../findManyTag.schema';
import { InstanceArgsObjectSchema } from './InstanceArgs.schema';
import { TagGroupCountOutputTypeArgsObjectSchema } from './TagGroupCountOutputTypeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    tags: z.union([z.boolean(), z.lazy(() => TagFindManySchema)]).optional(),
    instance: z
      .union([z.boolean(), z.lazy(() => InstanceArgsObjectSchema)])
      .optional(),
    _count: z
      .union([
        z.boolean(),
        z.lazy(() => TagGroupCountOutputTypeArgsObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const TagGroupIncludeObjectSchema = Schema;
