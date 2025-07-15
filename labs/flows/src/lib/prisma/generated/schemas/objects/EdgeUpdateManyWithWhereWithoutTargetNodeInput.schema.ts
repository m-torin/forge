import { z } from 'zod';
import { EdgeScalarWhereInputObjectSchema } from './EdgeScalarWhereInput.schema';
import { EdgeUpdateManyMutationInputObjectSchema } from './EdgeUpdateManyMutationInput.schema';
import { EdgeUncheckedUpdateManyWithoutTargetNodeInputObjectSchema } from './EdgeUncheckedUpdateManyWithoutTargetNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => EdgeScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => EdgeUpdateManyMutationInputObjectSchema),
      z.lazy(() => EdgeUncheckedUpdateManyWithoutTargetNodeInputObjectSchema),
    ]),
  })
  .strict();

export const EdgeUpdateManyWithWhereWithoutTargetNodeInputObjectSchema = Schema;
