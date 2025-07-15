import { z } from 'zod';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeUpdateWithoutInfrastructureInputObjectSchema } from './NodeUpdateWithoutInfrastructureInput.schema';
import { NodeUncheckedUpdateWithoutInfrastructureInputObjectSchema } from './NodeUncheckedUpdateWithoutInfrastructureInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => NodeUpdateWithoutInfrastructureInputObjectSchema),
      z.lazy(() => NodeUncheckedUpdateWithoutInfrastructureInputObjectSchema),
    ]),
  })
  .strict();

export const NodeUpdateWithWhereUniqueWithoutInfrastructureInputObjectSchema =
  Schema;
