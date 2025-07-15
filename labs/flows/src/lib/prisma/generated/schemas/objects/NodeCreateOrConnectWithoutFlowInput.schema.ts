import { z } from 'zod';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeCreateWithoutFlowInputObjectSchema } from './NodeCreateWithoutFlowInput.schema';
import { NodeUncheckedCreateWithoutFlowInputObjectSchema } from './NodeUncheckedCreateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => NodeCreateWithoutFlowInputObjectSchema),
      z.lazy(() => NodeUncheckedCreateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const NodeCreateOrConnectWithoutFlowInputObjectSchema = Schema;
