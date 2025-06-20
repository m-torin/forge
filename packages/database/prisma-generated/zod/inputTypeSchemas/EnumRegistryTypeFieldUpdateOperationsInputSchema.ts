import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryTypeSchema } from './RegistryTypeSchema';

export const EnumRegistryTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRegistryTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => RegistryTypeSchema).optional()
}).strict();

export default EnumRegistryTypeFieldUpdateOperationsInputSchema;
