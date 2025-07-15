import { z } from 'zod';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';
import { TagUpdateWithoutNodeInputObjectSchema } from './TagUpdateWithoutNodeInput.schema';
import { TagUncheckedUpdateWithoutNodeInputObjectSchema } from './TagUncheckedUpdateWithoutNodeInput.schema';
import { TagCreateWithoutNodeInputObjectSchema } from './TagCreateWithoutNodeInput.schema';
import { TagUncheckedCreateWithoutNodeInputObjectSchema } from './TagUncheckedCreateWithoutNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => TagUpdateWithoutNodeInputObjectSchema),
      z.lazy(() => TagUncheckedUpdateWithoutNodeInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => TagCreateWithoutNodeInputObjectSchema),
      z.lazy(() => TagUncheckedCreateWithoutNodeInputObjectSchema),
    ]),
  })
  .strict();

export const TagUpsertWithWhereUniqueWithoutNodeInputObjectSchema = Schema;
