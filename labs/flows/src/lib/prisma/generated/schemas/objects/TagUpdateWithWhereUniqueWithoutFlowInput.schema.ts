import { z } from 'zod';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';
import { TagUpdateWithoutFlowInputObjectSchema } from './TagUpdateWithoutFlowInput.schema';
import { TagUncheckedUpdateWithoutFlowInputObjectSchema } from './TagUncheckedUpdateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => TagUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => TagUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const TagUpdateWithWhereUniqueWithoutFlowInputObjectSchema = Schema;
