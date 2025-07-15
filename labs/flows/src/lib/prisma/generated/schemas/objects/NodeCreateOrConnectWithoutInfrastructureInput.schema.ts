import { z } from 'zod';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeCreateWithoutInfrastructureInputObjectSchema } from './NodeCreateWithoutInfrastructureInput.schema';
import { NodeUncheckedCreateWithoutInfrastructureInputObjectSchema } from './NodeUncheckedCreateWithoutInfrastructureInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => NodeCreateWithoutInfrastructureInputObjectSchema),
      z.lazy(() => NodeUncheckedCreateWithoutInfrastructureInputObjectSchema),
    ]),
  })
  .strict();

export const NodeCreateOrConnectWithoutInfrastructureInputObjectSchema = Schema;
