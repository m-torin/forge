import { z } from 'zod';
import { TagScalarWhereInputObjectSchema } from './TagScalarWhereInput.schema';
import { TagUpdateManyMutationInputObjectSchema } from './TagUpdateManyMutationInput.schema';
import { TagUncheckedUpdateManyWithoutNodeInputObjectSchema } from './TagUncheckedUpdateManyWithoutNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TagScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => TagUpdateManyMutationInputObjectSchema),
      z.lazy(() => TagUncheckedUpdateManyWithoutNodeInputObjectSchema),
    ]),
  })
  .strict();

export const TagUpdateManyWithWhereWithoutNodeInputObjectSchema = Schema;
