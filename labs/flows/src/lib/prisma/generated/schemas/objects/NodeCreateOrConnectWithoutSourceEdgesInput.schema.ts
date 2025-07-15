import { z } from 'zod';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeCreateWithoutSourceEdgesInputObjectSchema } from './NodeCreateWithoutSourceEdgesInput.schema';
import { NodeUncheckedCreateWithoutSourceEdgesInputObjectSchema } from './NodeUncheckedCreateWithoutSourceEdgesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => NodeCreateWithoutSourceEdgesInputObjectSchema),
      z.lazy(() => NodeUncheckedCreateWithoutSourceEdgesInputObjectSchema),
    ]),
  })
  .strict();

export const NodeCreateOrConnectWithoutSourceEdgesInputObjectSchema = Schema;
