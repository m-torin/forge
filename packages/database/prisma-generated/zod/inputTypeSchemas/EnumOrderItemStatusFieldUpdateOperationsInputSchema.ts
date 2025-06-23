import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemStatusSchema } from './OrderItemStatusSchema';

export const EnumOrderItemStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumOrderItemStatusFieldUpdateOperationsInput> =
  z
    .object({
      set: z.lazy(() => OrderItemStatusSchema).optional(),
    })
    .strict();

export default EnumOrderItemStatusFieldUpdateOperationsInputSchema;
