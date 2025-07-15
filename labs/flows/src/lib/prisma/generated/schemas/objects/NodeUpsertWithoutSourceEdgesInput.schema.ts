import { z } from 'zod';
import { NodeUpdateWithoutSourceEdgesInputObjectSchema } from './NodeUpdateWithoutSourceEdgesInput.schema';
import { NodeUncheckedUpdateWithoutSourceEdgesInputObjectSchema } from './NodeUncheckedUpdateWithoutSourceEdgesInput.schema';
import { NodeCreateWithoutSourceEdgesInputObjectSchema } from './NodeCreateWithoutSourceEdgesInput.schema';
import { NodeUncheckedCreateWithoutSourceEdgesInputObjectSchema } from './NodeUncheckedCreateWithoutSourceEdgesInput.schema';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => NodeUpdateWithoutSourceEdgesInputObjectSchema),
      z.lazy(() => NodeUncheckedUpdateWithoutSourceEdgesInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => NodeCreateWithoutSourceEdgesInputObjectSchema),
      z.lazy(() => NodeUncheckedCreateWithoutSourceEdgesInputObjectSchema),
    ]),
    where: z.lazy(() => NodeWhereInputObjectSchema).optional(),
  })
  .strict();

export const NodeUpsertWithoutSourceEdgesInputObjectSchema = Schema;
