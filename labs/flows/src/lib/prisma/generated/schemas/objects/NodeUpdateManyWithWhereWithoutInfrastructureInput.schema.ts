import { z } from 'zod';
import { NodeScalarWhereInputObjectSchema } from './NodeScalarWhereInput.schema';
import { NodeUpdateManyMutationInputObjectSchema } from './NodeUpdateManyMutationInput.schema';
import { NodeUncheckedUpdateManyWithoutInfrastructureInputObjectSchema } from './NodeUncheckedUpdateManyWithoutInfrastructureInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => NodeUpdateManyMutationInputObjectSchema),
      z.lazy(
        () => NodeUncheckedUpdateManyWithoutInfrastructureInputObjectSchema,
      ),
    ]),
  })
  .strict();

export const NodeUpdateManyWithWhereWithoutInfrastructureInputObjectSchema =
  Schema;
