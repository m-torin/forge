import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpUrlTypeSchema } from './PdpUrlTypeSchema';

export const EnumPdpUrlTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumPdpUrlTypeFieldUpdateOperationsInput> =
  z
    .object({
      set: z.lazy(() => PdpUrlTypeSchema).optional(),
    })
    .strict();

export default EnumPdpUrlTypeFieldUpdateOperationsInputSchema;
