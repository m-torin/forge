import { z } from 'zod';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeUpdateWithoutInfrastructureInputObjectSchema } from './NodeUpdateWithoutInfrastructureInput.schema';
import { NodeUncheckedUpdateWithoutInfrastructureInputObjectSchema } from './NodeUncheckedUpdateWithoutInfrastructureInput.schema';
import { NodeCreateWithoutInfrastructureInputObjectSchema } from './NodeCreateWithoutInfrastructureInput.schema';
import { NodeUncheckedCreateWithoutInfrastructureInputObjectSchema } from './NodeUncheckedCreateWithoutInfrastructureInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => NodeUpdateWithoutInfrastructureInputObjectSchema),
      z.lazy(() => NodeUncheckedUpdateWithoutInfrastructureInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => NodeCreateWithoutInfrastructureInputObjectSchema),
      z.lazy(() => NodeUncheckedCreateWithoutInfrastructureInputObjectSchema),
    ]),
  })
  .strict();

export const NodeUpsertWithWhereUniqueWithoutInfrastructureInputObjectSchema =
  Schema;
