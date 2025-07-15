import { z } from 'zod';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeUpdateWithoutFlowInputObjectSchema } from './NodeUpdateWithoutFlowInput.schema';
import { NodeUncheckedUpdateWithoutFlowInputObjectSchema } from './NodeUncheckedUpdateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => NodeUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => NodeUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const NodeUpdateWithWhereUniqueWithoutFlowInputObjectSchema = Schema;
