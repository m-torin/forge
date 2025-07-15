import { z } from 'zod';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';
import { NodeUpdateWithoutTagInputObjectSchema } from './NodeUpdateWithoutTagInput.schema';
import { NodeUncheckedUpdateWithoutTagInputObjectSchema } from './NodeUncheckedUpdateWithoutTagInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => NodeUpdateWithoutTagInputObjectSchema),
      z.lazy(() => NodeUncheckedUpdateWithoutTagInputObjectSchema),
    ]),
  })
  .strict();

export const NodeUpdateToOneWithWhereWithoutTagInputObjectSchema = Schema;
