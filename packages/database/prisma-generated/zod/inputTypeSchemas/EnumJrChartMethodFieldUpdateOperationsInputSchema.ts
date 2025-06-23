import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrChartMethodSchema } from './JrChartMethodSchema';

export const EnumJrChartMethodFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumJrChartMethodFieldUpdateOperationsInput> =
  z
    .object({
      set: z.lazy(() => JrChartMethodSchema).optional(),
    })
    .strict();

export default EnumJrChartMethodFieldUpdateOperationsInputSchema;
