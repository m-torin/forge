import { z } from 'zod';
import { InstanceScalarWhereInputObjectSchema } from './InstanceScalarWhereInput.schema';
import { InstanceUpdateManyMutationInputObjectSchema } from './InstanceUpdateManyMutationInput.schema';
import { InstanceUncheckedUpdateManyWithoutUserInputObjectSchema } from './InstanceUncheckedUpdateManyWithoutUserInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => InstanceScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => InstanceUpdateManyMutationInputObjectSchema),
      z.lazy(() => InstanceUncheckedUpdateManyWithoutUserInputObjectSchema),
    ]),
  })
  .strict();

export const InstanceUpdateManyWithWhereWithoutUserInputObjectSchema = Schema;
