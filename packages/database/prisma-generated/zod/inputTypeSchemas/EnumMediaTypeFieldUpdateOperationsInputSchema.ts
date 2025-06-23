import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaTypeSchema } from './MediaTypeSchema';

export const EnumMediaTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumMediaTypeFieldUpdateOperationsInput> =
  z
    .object({
      set: z.lazy(() => MediaTypeSchema).optional(),
    })
    .strict();

export default EnumMediaTypeFieldUpdateOperationsInputSchema;
