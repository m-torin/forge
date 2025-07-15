import { z } from 'zod';
import { TagGroupWhereUniqueInputObjectSchema } from './TagGroupWhereUniqueInput.schema';
import { TagGroupUpdateWithoutInstanceInputObjectSchema } from './TagGroupUpdateWithoutInstanceInput.schema';
import { TagGroupUncheckedUpdateWithoutInstanceInputObjectSchema } from './TagGroupUncheckedUpdateWithoutInstanceInput.schema';
import { TagGroupCreateWithoutInstanceInputObjectSchema } from './TagGroupCreateWithoutInstanceInput.schema';
import { TagGroupUncheckedCreateWithoutInstanceInputObjectSchema } from './TagGroupUncheckedCreateWithoutInstanceInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagGroupWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => TagGroupUpdateWithoutInstanceInputObjectSchema),
      z.lazy(() => TagGroupUncheckedUpdateWithoutInstanceInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => TagGroupCreateWithoutInstanceInputObjectSchema),
      z.lazy(() => TagGroupUncheckedCreateWithoutInstanceInputObjectSchema),
    ]),
  })
  .strict();

export const TagGroupUpsertWithWhereUniqueWithoutInstanceInputObjectSchema =
  Schema;
