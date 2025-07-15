import { z } from 'zod';
import { NodeCreateWithoutSourceEdgesInputObjectSchema } from './NodeCreateWithoutSourceEdgesInput.schema';
import { NodeUncheckedCreateWithoutSourceEdgesInputObjectSchema } from './NodeUncheckedCreateWithoutSourceEdgesInput.schema';
import { NodeCreateOrConnectWithoutSourceEdgesInputObjectSchema } from './NodeCreateOrConnectWithoutSourceEdgesInput.schema';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => NodeCreateWithoutSourceEdgesInputObjectSchema),
        z.lazy(() => NodeUncheckedCreateWithoutSourceEdgesInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => NodeCreateOrConnectWithoutSourceEdgesInputObjectSchema)
      .optional(),
    connect: z.lazy(() => NodeWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const NodeCreateNestedOneWithoutSourceEdgesInputObjectSchema = Schema;
