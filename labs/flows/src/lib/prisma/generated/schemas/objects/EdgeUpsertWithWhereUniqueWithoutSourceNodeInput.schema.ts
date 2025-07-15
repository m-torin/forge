import { z } from 'zod';
import { EdgeWhereUniqueInputObjectSchema } from './EdgeWhereUniqueInput.schema';
import { EdgeUpdateWithoutSourceNodeInputObjectSchema } from './EdgeUpdateWithoutSourceNodeInput.schema';
import { EdgeUncheckedUpdateWithoutSourceNodeInputObjectSchema } from './EdgeUncheckedUpdateWithoutSourceNodeInput.schema';
import { EdgeCreateWithoutSourceNodeInputObjectSchema } from './EdgeCreateWithoutSourceNodeInput.schema';
import { EdgeUncheckedCreateWithoutSourceNodeInputObjectSchema } from './EdgeUncheckedCreateWithoutSourceNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => EdgeWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => EdgeUpdateWithoutSourceNodeInputObjectSchema),
      z.lazy(() => EdgeUncheckedUpdateWithoutSourceNodeInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => EdgeCreateWithoutSourceNodeInputObjectSchema),
      z.lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputObjectSchema),
    ]),
  })
  .strict();

export const EdgeUpsertWithWhereUniqueWithoutSourceNodeInputObjectSchema =
  Schema;
