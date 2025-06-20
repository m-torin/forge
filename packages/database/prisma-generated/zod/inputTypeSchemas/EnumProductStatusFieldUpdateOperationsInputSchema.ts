import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductStatusSchema } from './ProductStatusSchema';

export const EnumProductStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumProductStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => ProductStatusSchema).optional()
}).strict();

export default EnumProductStatusFieldUpdateOperationsInputSchema;
