import { z } from 'zod';
import { TagGroupWhereUniqueInputObjectSchema } from './TagGroupWhereUniqueInput.schema';
import { TagGroupUpdateWithoutInstanceInputObjectSchema } from './TagGroupUpdateWithoutInstanceInput.schema';
import { TagGroupUncheckedUpdateWithoutInstanceInputObjectSchema } from './TagGroupUncheckedUpdateWithoutInstanceInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagGroupWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => TagGroupUpdateWithoutInstanceInputObjectSchema),
      z.lazy(() => TagGroupUncheckedUpdateWithoutInstanceInputObjectSchema),
    ]),
  })
  .strict();

export const TagGroupUpdateWithWhereUniqueWithoutInstanceInputObjectSchema =
  Schema;
