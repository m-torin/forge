import { z } from 'zod';
import { EdgeScalarWhereInputObjectSchema } from './EdgeScalarWhereInput.schema';
import { EdgeUpdateManyMutationInputObjectSchema } from './EdgeUpdateManyMutationInput.schema';
import { EdgeUncheckedUpdateManyWithoutFlowInputObjectSchema } from './EdgeUncheckedUpdateManyWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => EdgeScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => EdgeUpdateManyMutationInputObjectSchema),
      z.lazy(() => EdgeUncheckedUpdateManyWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const EdgeUpdateManyWithWhereWithoutFlowInputObjectSchema = Schema;
