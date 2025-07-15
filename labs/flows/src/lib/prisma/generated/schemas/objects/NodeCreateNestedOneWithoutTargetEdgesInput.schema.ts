import { z } from 'zod';
import { NodeCreateWithoutTargetEdgesInputObjectSchema } from './NodeCreateWithoutTargetEdgesInput.schema';
import { NodeUncheckedCreateWithoutTargetEdgesInputObjectSchema } from './NodeUncheckedCreateWithoutTargetEdgesInput.schema';
import { NodeCreateOrConnectWithoutTargetEdgesInputObjectSchema } from './NodeCreateOrConnectWithoutTargetEdgesInput.schema';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => NodeCreateWithoutTargetEdgesInputObjectSchema),
        z.lazy(() => NodeUncheckedCreateWithoutTargetEdgesInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => NodeCreateOrConnectWithoutTargetEdgesInputObjectSchema)
      .optional(),
    connect: z.lazy(() => NodeWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const NodeCreateNestedOneWithoutTargetEdgesInputObjectSchema = Schema;
