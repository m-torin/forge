import { z } from 'zod';
import { FlowFindManySchema } from '../findManyFlow.schema';
import { TagFindManySchema } from '../findManyTag.schema';
import { TagGroupFindManySchema } from '../findManyTagGroup.schema';
import { UserArgsObjectSchema } from './UserArgs.schema';
import { InstanceCountOutputTypeArgsObjectSchema } from './InstanceCountOutputTypeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flows: z.union([z.boolean(), z.lazy(() => FlowFindManySchema)]).optional(),
    tags: z.union([z.boolean(), z.lazy(() => TagFindManySchema)]).optional(),
    tagGroups: z
      .union([z.boolean(), z.lazy(() => TagGroupFindManySchema)])
      .optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsObjectSchema)]).optional(),
    _count: z
      .union([
        z.boolean(),
        z.lazy(() => InstanceCountOutputTypeArgsObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const InstanceIncludeObjectSchema = Schema;
