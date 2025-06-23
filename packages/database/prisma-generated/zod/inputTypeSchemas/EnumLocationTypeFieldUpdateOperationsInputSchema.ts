import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationTypeSchema } from './LocationTypeSchema';

export const EnumLocationTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumLocationTypeFieldUpdateOperationsInput> =
  z
    .object({
      set: z.lazy(() => LocationTypeSchema).optional(),
    })
    .strict();

export default EnumLocationTypeFieldUpdateOperationsInputSchema;
