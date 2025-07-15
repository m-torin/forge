import { z } from 'zod';
import { NodeUpdateWithoutTargetEdgesInputObjectSchema } from './NodeUpdateWithoutTargetEdgesInput.schema';
import { NodeUncheckedUpdateWithoutTargetEdgesInputObjectSchema } from './NodeUncheckedUpdateWithoutTargetEdgesInput.schema';
import { NodeCreateWithoutTargetEdgesInputObjectSchema } from './NodeCreateWithoutTargetEdgesInput.schema';
import { NodeUncheckedCreateWithoutTargetEdgesInputObjectSchema } from './NodeUncheckedCreateWithoutTargetEdgesInput.schema';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => NodeUpdateWithoutTargetEdgesInputObjectSchema),
      z.lazy(() => NodeUncheckedUpdateWithoutTargetEdgesInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => NodeCreateWithoutTargetEdgesInputObjectSchema),
      z.lazy(() => NodeUncheckedCreateWithoutTargetEdgesInputObjectSchema),
    ]),
    where: z.lazy(() => NodeWhereInputObjectSchema).optional(),
  })
  .strict();

export const NodeUpsertWithoutTargetEdgesInputObjectSchema = Schema;
