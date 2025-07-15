import { z } from 'zod';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';
import { TagUpdateWithoutNodeInputObjectSchema } from './TagUpdateWithoutNodeInput.schema';
import { TagUncheckedUpdateWithoutNodeInputObjectSchema } from './TagUncheckedUpdateWithoutNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => TagUpdateWithoutNodeInputObjectSchema),
      z.lazy(() => TagUncheckedUpdateWithoutNodeInputObjectSchema),
    ]),
  })
  .strict();

export const TagUpdateWithWhereUniqueWithoutNodeInputObjectSchema = Schema;
