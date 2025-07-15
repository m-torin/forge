import { z } from 'zod';
import { TagGroupScalarWhereInputObjectSchema } from './TagGroupScalarWhereInput.schema';
import { TagGroupUpdateManyMutationInputObjectSchema } from './TagGroupUpdateManyMutationInput.schema';
import { TagGroupUncheckedUpdateManyWithoutInstanceInputObjectSchema } from './TagGroupUncheckedUpdateManyWithoutInstanceInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagGroupScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => TagGroupUpdateManyMutationInputObjectSchema),
      z.lazy(() => TagGroupUncheckedUpdateManyWithoutInstanceInputObjectSchema),
    ]),
  })
  .strict();

export const TagGroupUpdateManyWithWhereWithoutInstanceInputObjectSchema =
  Schema;
