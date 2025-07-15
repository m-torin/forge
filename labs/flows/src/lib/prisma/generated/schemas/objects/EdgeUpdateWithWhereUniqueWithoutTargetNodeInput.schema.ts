import { z } from 'zod';
import { EdgeWhereUniqueInputObjectSchema } from './EdgeWhereUniqueInput.schema';
import { EdgeUpdateWithoutTargetNodeInputObjectSchema } from './EdgeUpdateWithoutTargetNodeInput.schema';
import { EdgeUncheckedUpdateWithoutTargetNodeInputObjectSchema } from './EdgeUncheckedUpdateWithoutTargetNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => EdgeWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => EdgeUpdateWithoutTargetNodeInputObjectSchema),
      z.lazy(() => EdgeUncheckedUpdateWithoutTargetNodeInputObjectSchema),
    ]),
  })
  .strict();

export const EdgeUpdateWithWhereUniqueWithoutTargetNodeInputObjectSchema =
  Schema;
