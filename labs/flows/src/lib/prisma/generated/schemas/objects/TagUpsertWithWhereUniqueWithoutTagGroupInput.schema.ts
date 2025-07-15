import { z } from 'zod';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';
import { TagUpdateWithoutTagGroupInputObjectSchema } from './TagUpdateWithoutTagGroupInput.schema';
import { TagUncheckedUpdateWithoutTagGroupInputObjectSchema } from './TagUncheckedUpdateWithoutTagGroupInput.schema';
import { TagCreateWithoutTagGroupInputObjectSchema } from './TagCreateWithoutTagGroupInput.schema';
import { TagUncheckedCreateWithoutTagGroupInputObjectSchema } from './TagUncheckedCreateWithoutTagGroupInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => TagUpdateWithoutTagGroupInputObjectSchema),
      z.lazy(() => TagUncheckedUpdateWithoutTagGroupInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => TagCreateWithoutTagGroupInputObjectSchema),
      z.lazy(() => TagUncheckedCreateWithoutTagGroupInputObjectSchema),
    ]),
  })
  .strict();

export const TagUpsertWithWhereUniqueWithoutTagGroupInputObjectSchema = Schema;
