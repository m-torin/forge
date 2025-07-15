import { z } from 'zod';
import { EdgeWhereUniqueInputObjectSchema } from './EdgeWhereUniqueInput.schema';
import { EdgeUpdateWithoutFlowInputObjectSchema } from './EdgeUpdateWithoutFlowInput.schema';
import { EdgeUncheckedUpdateWithoutFlowInputObjectSchema } from './EdgeUncheckedUpdateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => EdgeWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => EdgeUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => EdgeUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const EdgeUpdateWithWhereUniqueWithoutFlowInputObjectSchema = Schema;
