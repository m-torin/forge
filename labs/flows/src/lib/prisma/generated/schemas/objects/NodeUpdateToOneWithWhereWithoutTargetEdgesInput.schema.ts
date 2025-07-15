import { z } from 'zod';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';
import { NodeUpdateWithoutTargetEdgesInputObjectSchema } from './NodeUpdateWithoutTargetEdgesInput.schema';
import { NodeUncheckedUpdateWithoutTargetEdgesInputObjectSchema } from './NodeUncheckedUpdateWithoutTargetEdgesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => NodeUpdateWithoutTargetEdgesInputObjectSchema),
      z.lazy(() => NodeUncheckedUpdateWithoutTargetEdgesInputObjectSchema),
    ]),
  })
  .strict();

export const NodeUpdateToOneWithWhereWithoutTargetEdgesInputObjectSchema =
  Schema;
