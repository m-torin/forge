import { z } from 'zod';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';
import { TagUpdateWithoutInstanceInputObjectSchema } from './TagUpdateWithoutInstanceInput.schema';
import { TagUncheckedUpdateWithoutInstanceInputObjectSchema } from './TagUncheckedUpdateWithoutInstanceInput.schema';
import { TagCreateWithoutInstanceInputObjectSchema } from './TagCreateWithoutInstanceInput.schema';
import { TagUncheckedCreateWithoutInstanceInputObjectSchema } from './TagUncheckedCreateWithoutInstanceInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => TagUpdateWithoutInstanceInputObjectSchema),
      z.lazy(() => TagUncheckedUpdateWithoutInstanceInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => TagCreateWithoutInstanceInputObjectSchema),
      z.lazy(() => TagUncheckedCreateWithoutInstanceInputObjectSchema),
    ]),
  })
  .strict();

export const TagUpsertWithWhereUniqueWithoutInstanceInputObjectSchema = Schema;
