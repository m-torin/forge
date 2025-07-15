import { z } from 'zod';
import { EdgeWhereUniqueInputObjectSchema } from './EdgeWhereUniqueInput.schema';
import { EdgeCreateWithoutTargetNodeInputObjectSchema } from './EdgeCreateWithoutTargetNodeInput.schema';
import { EdgeUncheckedCreateWithoutTargetNodeInputObjectSchema } from './EdgeUncheckedCreateWithoutTargetNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => EdgeWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => EdgeCreateWithoutTargetNodeInputObjectSchema),
      z.lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputObjectSchema),
    ]),
  })
  .strict();

export const EdgeCreateOrConnectWithoutTargetNodeInputObjectSchema = Schema;
