import { z } from 'zod';
import { EdgeWhereUniqueInputObjectSchema } from './EdgeWhereUniqueInput.schema';
import { EdgeUpdateWithoutTargetNodeInputObjectSchema } from './EdgeUpdateWithoutTargetNodeInput.schema';
import { EdgeUncheckedUpdateWithoutTargetNodeInputObjectSchema } from './EdgeUncheckedUpdateWithoutTargetNodeInput.schema';
import { EdgeCreateWithoutTargetNodeInputObjectSchema } from './EdgeCreateWithoutTargetNodeInput.schema';
import { EdgeUncheckedCreateWithoutTargetNodeInputObjectSchema } from './EdgeUncheckedCreateWithoutTargetNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => EdgeWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => EdgeUpdateWithoutTargetNodeInputObjectSchema),
      z.lazy(() => EdgeUncheckedUpdateWithoutTargetNodeInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => EdgeCreateWithoutTargetNodeInputObjectSchema),
      z.lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputObjectSchema),
    ]),
  })
  .strict();

export const EdgeUpsertWithWhereUniqueWithoutTargetNodeInputObjectSchema =
  Schema;
