import type { Prisma } from '../../client';

import { z } from 'zod';
import { LodgingTypeSchema } from './LodgingTypeSchema';

export const NullableEnumLodgingTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableEnumLodgingTypeFieldUpdateOperationsInput> =
  z
    .object({
      set: z
        .lazy(() => LodgingTypeSchema)
        .optional()
        .nullable(),
    })
    .strict();

export default NullableEnumLodgingTypeFieldUpdateOperationsInputSchema;
