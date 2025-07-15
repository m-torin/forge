import { z } from 'zod';
import { EdgeWhereUniqueInputObjectSchema } from './EdgeWhereUniqueInput.schema';
import { EdgeCreateWithoutSourceNodeInputObjectSchema } from './EdgeCreateWithoutSourceNodeInput.schema';
import { EdgeUncheckedCreateWithoutSourceNodeInputObjectSchema } from './EdgeUncheckedCreateWithoutSourceNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => EdgeWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => EdgeCreateWithoutSourceNodeInputObjectSchema),
      z.lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputObjectSchema),
    ]),
  })
  .strict();

export const EdgeCreateOrConnectWithoutSourceNodeInputObjectSchema = Schema;
