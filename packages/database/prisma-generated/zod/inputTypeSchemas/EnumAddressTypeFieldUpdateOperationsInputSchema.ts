import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressTypeSchema } from './AddressTypeSchema';

export const EnumAddressTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumAddressTypeFieldUpdateOperationsInput> =
  z
    .object({
      set: z.lazy(() => AddressTypeSchema).optional(),
    })
    .strict();

export default EnumAddressTypeFieldUpdateOperationsInputSchema;
