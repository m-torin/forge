import { z } from 'zod';
import { InstanceWhereInputObjectSchema } from './InstanceWhereInput.schema';
import { InstanceUpdateWithoutFlowsInputObjectSchema } from './InstanceUpdateWithoutFlowsInput.schema';
import { InstanceUncheckedUpdateWithoutFlowsInputObjectSchema } from './InstanceUncheckedUpdateWithoutFlowsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => InstanceWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => InstanceUpdateWithoutFlowsInputObjectSchema),
      z.lazy(() => InstanceUncheckedUpdateWithoutFlowsInputObjectSchema),
    ]),
  })
  .strict();

export const InstanceUpdateToOneWithWhereWithoutFlowsInputObjectSchema = Schema;
