import { z } from 'zod';
import { NodeUpdateWithoutTagInputObjectSchema } from './NodeUpdateWithoutTagInput.schema';
import { NodeUncheckedUpdateWithoutTagInputObjectSchema } from './NodeUncheckedUpdateWithoutTagInput.schema';
import { NodeCreateWithoutTagInputObjectSchema } from './NodeCreateWithoutTagInput.schema';
import { NodeUncheckedCreateWithoutTagInputObjectSchema } from './NodeUncheckedCreateWithoutTagInput.schema';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => NodeUpdateWithoutTagInputObjectSchema),
      z.lazy(() => NodeUncheckedUpdateWithoutTagInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => NodeCreateWithoutTagInputObjectSchema),
      z.lazy(() => NodeUncheckedCreateWithoutTagInputObjectSchema),
    ]),
    where: z.lazy(() => NodeWhereInputObjectSchema).optional(),
  })
  .strict();

export const NodeUpsertWithoutTagInputObjectSchema = Schema;
