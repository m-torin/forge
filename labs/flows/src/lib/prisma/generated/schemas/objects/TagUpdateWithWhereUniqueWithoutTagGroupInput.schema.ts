import { z } from 'zod';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';
import { TagUpdateWithoutTagGroupInputObjectSchema } from './TagUpdateWithoutTagGroupInput.schema';
import { TagUncheckedUpdateWithoutTagGroupInputObjectSchema } from './TagUncheckedUpdateWithoutTagGroupInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => TagUpdateWithoutTagGroupInputObjectSchema),
      z.lazy(() => TagUncheckedUpdateWithoutTagGroupInputObjectSchema),
    ]),
  })
  .strict();

export const TagUpdateWithWhereUniqueWithoutTagGroupInputObjectSchema = Schema;
