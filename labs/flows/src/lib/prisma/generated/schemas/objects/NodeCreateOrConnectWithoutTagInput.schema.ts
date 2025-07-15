import { z } from 'zod';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeCreateWithoutTagInputObjectSchema } from './NodeCreateWithoutTagInput.schema';
import { NodeUncheckedCreateWithoutTagInputObjectSchema } from './NodeUncheckedCreateWithoutTagInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => NodeCreateWithoutTagInputObjectSchema),
      z.lazy(() => NodeUncheckedCreateWithoutTagInputObjectSchema),
    ]),
  })
  .strict();

export const NodeCreateOrConnectWithoutTagInputObjectSchema = Schema;
