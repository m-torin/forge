import { z } from 'zod';
import { EdgeWhereUniqueInputObjectSchema } from './EdgeWhereUniqueInput.schema';
import { EdgeUpdateWithoutSourceNodeInputObjectSchema } from './EdgeUpdateWithoutSourceNodeInput.schema';
import { EdgeUncheckedUpdateWithoutSourceNodeInputObjectSchema } from './EdgeUncheckedUpdateWithoutSourceNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => EdgeWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => EdgeUpdateWithoutSourceNodeInputObjectSchema),
      z.lazy(() => EdgeUncheckedUpdateWithoutSourceNodeInputObjectSchema),
    ]),
  })
  .strict();

export const EdgeUpdateWithWhereUniqueWithoutSourceNodeInputObjectSchema =
  Schema;
