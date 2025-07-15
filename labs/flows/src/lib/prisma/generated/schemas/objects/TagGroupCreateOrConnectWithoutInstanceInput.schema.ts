import { z } from 'zod';
import { TagGroupWhereUniqueInputObjectSchema } from './TagGroupWhereUniqueInput.schema';
import { TagGroupCreateWithoutInstanceInputObjectSchema } from './TagGroupCreateWithoutInstanceInput.schema';
import { TagGroupUncheckedCreateWithoutInstanceInputObjectSchema } from './TagGroupUncheckedCreateWithoutInstanceInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagGroupWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => TagGroupCreateWithoutInstanceInputObjectSchema),
      z.lazy(() => TagGroupUncheckedCreateWithoutInstanceInputObjectSchema),
    ]),
  })
  .strict();

export const TagGroupCreateOrConnectWithoutInstanceInputObjectSchema = Schema;
