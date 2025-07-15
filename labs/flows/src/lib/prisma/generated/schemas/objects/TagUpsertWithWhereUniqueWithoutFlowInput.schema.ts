import { z } from 'zod';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';
import { TagUpdateWithoutFlowInputObjectSchema } from './TagUpdateWithoutFlowInput.schema';
import { TagUncheckedUpdateWithoutFlowInputObjectSchema } from './TagUncheckedUpdateWithoutFlowInput.schema';
import { TagCreateWithoutFlowInputObjectSchema } from './TagCreateWithoutFlowInput.schema';
import { TagUncheckedCreateWithoutFlowInputObjectSchema } from './TagUncheckedCreateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => TagUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => TagUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => TagCreateWithoutFlowInputObjectSchema),
      z.lazy(() => TagUncheckedCreateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const TagUpsertWithWhereUniqueWithoutFlowInputObjectSchema = Schema;
