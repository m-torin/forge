import { z } from 'zod';
import { NodeCreateWithoutTagInputObjectSchema } from './NodeCreateWithoutTagInput.schema';
import { NodeUncheckedCreateWithoutTagInputObjectSchema } from './NodeUncheckedCreateWithoutTagInput.schema';
import { NodeCreateOrConnectWithoutTagInputObjectSchema } from './NodeCreateOrConnectWithoutTagInput.schema';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => NodeCreateWithoutTagInputObjectSchema),
        z.lazy(() => NodeUncheckedCreateWithoutTagInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => NodeCreateOrConnectWithoutTagInputObjectSchema)
      .optional(),
    connect: z.lazy(() => NodeWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const NodeCreateNestedOneWithoutTagInputObjectSchema = Schema;
