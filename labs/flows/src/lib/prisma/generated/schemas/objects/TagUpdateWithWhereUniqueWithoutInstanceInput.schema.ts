import { z } from 'zod';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';
import { TagUpdateWithoutInstanceInputObjectSchema } from './TagUpdateWithoutInstanceInput.schema';
import { TagUncheckedUpdateWithoutInstanceInputObjectSchema } from './TagUncheckedUpdateWithoutInstanceInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => TagUpdateWithoutInstanceInputObjectSchema),
      z.lazy(() => TagUncheckedUpdateWithoutInstanceInputObjectSchema),
    ]),
  })
  .strict();

export const TagUpdateWithWhereUniqueWithoutInstanceInputObjectSchema = Schema;
