import { z } from 'zod';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';
import { NodeUpdateWithoutSourceEdgesInputObjectSchema } from './NodeUpdateWithoutSourceEdgesInput.schema';
import { NodeUncheckedUpdateWithoutSourceEdgesInputObjectSchema } from './NodeUncheckedUpdateWithoutSourceEdgesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => NodeUpdateWithoutSourceEdgesInputObjectSchema),
      z.lazy(() => NodeUncheckedUpdateWithoutSourceEdgesInputObjectSchema),
    ]),
  })
  .strict();

export const NodeUpdateToOneWithWhereWithoutSourceEdgesInputObjectSchema =
  Schema;
