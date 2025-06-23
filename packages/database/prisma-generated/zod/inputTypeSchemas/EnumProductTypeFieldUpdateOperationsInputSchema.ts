import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductTypeSchema } from './ProductTypeSchema';

export const EnumProductTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumProductTypeFieldUpdateOperationsInput> =
  z
    .object({
      set: z.lazy(() => ProductTypeSchema).optional(),
    })
    .strict();

export default EnumProductTypeFieldUpdateOperationsInputSchema;
