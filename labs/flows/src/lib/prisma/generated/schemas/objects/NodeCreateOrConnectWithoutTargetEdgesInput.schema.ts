import { z } from 'zod';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeCreateWithoutTargetEdgesInputObjectSchema } from './NodeCreateWithoutTargetEdgesInput.schema';
import { NodeUncheckedCreateWithoutTargetEdgesInputObjectSchema } from './NodeUncheckedCreateWithoutTargetEdgesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => NodeCreateWithoutTargetEdgesInputObjectSchema),
      z.lazy(() => NodeUncheckedCreateWithoutTargetEdgesInputObjectSchema),
    ]),
  })
  .strict();

export const NodeCreateOrConnectWithoutTargetEdgesInputObjectSchema = Schema;
