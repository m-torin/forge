import { z } from 'zod';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';
import { TagCreateWithoutTagGroupInputObjectSchema } from './TagCreateWithoutTagGroupInput.schema';
import { TagUncheckedCreateWithoutTagGroupInputObjectSchema } from './TagUncheckedCreateWithoutTagGroupInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => TagCreateWithoutTagGroupInputObjectSchema),
      z.lazy(() => TagUncheckedCreateWithoutTagGroupInputObjectSchema),
    ]),
  })
  .strict();

export const TagCreateOrConnectWithoutTagGroupInputObjectSchema = Schema;
