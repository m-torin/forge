import { z } from 'zod';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';
import { TagCreateWithoutNodeInputObjectSchema } from './TagCreateWithoutNodeInput.schema';
import { TagUncheckedCreateWithoutNodeInputObjectSchema } from './TagUncheckedCreateWithoutNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => TagCreateWithoutNodeInputObjectSchema),
      z.lazy(() => TagUncheckedCreateWithoutNodeInputObjectSchema),
    ]),
  })
  .strict();

export const TagCreateOrConnectWithoutNodeInputObjectSchema = Schema;
