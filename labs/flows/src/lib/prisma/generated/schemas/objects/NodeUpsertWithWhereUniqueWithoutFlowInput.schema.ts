import { z } from 'zod';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeUpdateWithoutFlowInputObjectSchema } from './NodeUpdateWithoutFlowInput.schema';
import { NodeUncheckedUpdateWithoutFlowInputObjectSchema } from './NodeUncheckedUpdateWithoutFlowInput.schema';
import { NodeCreateWithoutFlowInputObjectSchema } from './NodeCreateWithoutFlowInput.schema';
import { NodeUncheckedCreateWithoutFlowInputObjectSchema } from './NodeUncheckedCreateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => NodeUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => NodeUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => NodeCreateWithoutFlowInputObjectSchema),
      z.lazy(() => NodeUncheckedCreateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const NodeUpsertWithWhereUniqueWithoutFlowInputObjectSchema = Schema;
