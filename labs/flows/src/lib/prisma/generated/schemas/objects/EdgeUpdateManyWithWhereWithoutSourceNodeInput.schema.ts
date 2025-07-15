import { z } from 'zod';
import { EdgeScalarWhereInputObjectSchema } from './EdgeScalarWhereInput.schema';
import { EdgeUpdateManyMutationInputObjectSchema } from './EdgeUpdateManyMutationInput.schema';
import { EdgeUncheckedUpdateManyWithoutSourceNodeInputObjectSchema } from './EdgeUncheckedUpdateManyWithoutSourceNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => EdgeScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => EdgeUpdateManyMutationInputObjectSchema),
      z.lazy(() => EdgeUncheckedUpdateManyWithoutSourceNodeInputObjectSchema),
    ]),
  })
  .strict();

export const EdgeUpdateManyWithWhereWithoutSourceNodeInputObjectSchema = Schema;
