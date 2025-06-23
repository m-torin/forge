import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandTypeSchema } from './BrandTypeSchema';

export const EnumBrandTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumBrandTypeFieldUpdateOperationsInput> =
  z
    .object({
      set: z.lazy(() => BrandTypeSchema).optional(),
    })
    .strict();

export default EnumBrandTypeFieldUpdateOperationsInputSchema;
