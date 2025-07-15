import { z } from 'zod';
import { FlowFindManySchema } from '../findManyFlow.schema';
import { TagFindManySchema } from '../findManyTag.schema';
import { TagGroupFindManySchema } from '../findManyTagGroup.schema';
import { UserArgsObjectSchema } from './UserArgs.schema';
import { InstanceCountOutputTypeArgsObjectSchema } from './InstanceCountOutputTypeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.boolean().optional(),
    description: z.boolean().optional(),
    flows: z.union([z.boolean(), z.lazy(() => FlowFindManySchema)]).optional(),
    id: z.boolean().optional(),
    image: z.boolean().optional(),
    logo: z.boolean().optional(),
    name: z.boolean().optional(),
    metadata: z.boolean().optional(),
    tags: z.union([z.boolean(), z.lazy(() => TagFindManySchema)]).optional(),
    tagGroups: z
      .union([z.boolean(), z.lazy(() => TagGroupFindManySchema)])
      .optional(),
    updatedAt: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsObjectSchema)]).optional(),
    userId: z.boolean().optional(),
    _count: z
      .union([
        z.boolean(),
        z.lazy(() => InstanceCountOutputTypeArgsObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const InstanceSelectObjectSchema = Schema;
