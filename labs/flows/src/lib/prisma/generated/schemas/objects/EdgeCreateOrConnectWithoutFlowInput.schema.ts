import { z } from 'zod';
import { EdgeWhereUniqueInputObjectSchema } from './EdgeWhereUniqueInput.schema';
import { EdgeCreateWithoutFlowInputObjectSchema } from './EdgeCreateWithoutFlowInput.schema';
import { EdgeUncheckedCreateWithoutFlowInputObjectSchema } from './EdgeUncheckedCreateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => EdgeWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => EdgeCreateWithoutFlowInputObjectSchema),
      z.lazy(() => EdgeUncheckedCreateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const EdgeCreateOrConnectWithoutFlowInputObjectSchema = Schema;
