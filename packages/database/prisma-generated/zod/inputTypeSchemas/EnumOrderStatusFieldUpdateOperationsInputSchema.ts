import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderStatusSchema } from './OrderStatusSchema';

export const EnumOrderStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumOrderStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => OrderStatusSchema).optional()
}).strict();

export default EnumOrderStatusFieldUpdateOperationsInputSchema;
