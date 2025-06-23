import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartStatusSchema } from './CartStatusSchema';

export const EnumCartStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumCartStatusFieldUpdateOperationsInput> =
  z
    .object({
      set: z.lazy(() => CartStatusSchema).optional(),
    })
    .strict();

export default EnumCartStatusFieldUpdateOperationsInputSchema;
