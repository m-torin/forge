import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionTypeSchema } from './CollectionTypeSchema';

export const EnumCollectionTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumCollectionTypeFieldUpdateOperationsInput> =
  z
    .object({
      set: z.lazy(() => CollectionTypeSchema).optional(),
    })
    .strict();

export default EnumCollectionTypeFieldUpdateOperationsInputSchema;
